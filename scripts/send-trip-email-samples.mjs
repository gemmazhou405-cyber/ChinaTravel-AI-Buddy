// Render (and optionally send) sample trip emails without touching the live enquiry flow:
// no AI call, no Firestore write, no free-plan claim. Uses the production rendering code.
//
//   npm run email:samples                 # write HTML/text previews to a temp folder
//   RESEND_API_KEY=... npm run email:samples -- --send
//   RESEND_API_KEY=... npm run email:samples -- --send --from "Lin from ChinaEase Buddy <lin@notify.chinaeasebuddy.com>"
//
// Sends go only to chinaeastbuddy@gmail.com: three customer itinerary emails (US passport,
// UK passport, no departure country) and four admin notifications (Google, ChatGPT, UTM, direct).
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sendTripLeadConfirmation, sendTripLeadNotification, sourceSummaryLine } from '../functions/_shared/email.js';
import { enforcePlanRules } from '../functions/_shared/itinerary.js';
import { CUSTOMER_FROM_DEFAULT, renderItineraryEmail } from '../functions/_shared/itinerary-email.js';
import { SAMPLE_NOW, customerScenarios, leadForSource, samplePlan, sourceScenarios } from './trip-email-samples.mjs';

const TEST_RECIPIENT = 'chinaeastbuddy@gmail.com';
const args = process.argv.slice(2);
const send = args.includes('--send');
const fromIndex = args.indexOf('--from');
const fromOverride = fromIndex >= 0 ? args[fromIndex + 1] : null;
const outIndex = args.indexOf('--out');
const outDir = outIndex >= 0 ? args[outIndex + 1] : join(tmpdir(), 'chinaease-trip-email-samples');

if (send && !process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set. Run without --send to render previews only.');
  process.exit(1);
}

const runId = Date.now().toString(36);
const env = {
  RESEND_API_KEY: process.env.RESEND_API_KEY || 'render-only',
  TRIP_LEAD_FROM_EMAIL: process.env.TRIP_LEAD_FROM_EMAIL,
  TRIP_CUSTOMER_FROM_EMAIL: fromOverride || process.env.TRIP_CUSTOMER_FROM_EMAIL || undefined,
};

// Intercept the Resend call: force the test recipient, tag the subject, make idempotency keys
// unique per run, and in render-only mode capture the payload instead of sending it.
const realFetch = globalThis.fetch;
const captured = [];
globalThis.fetch = async (url, options) => {
  const payload = JSON.parse(options.body);
  payload.to = TEST_RECIPIENT;
  payload.subject = `[TEST] ${payload.subject}`;
  captured.push(payload);
  if (!send) {
    return new Response(JSON.stringify({ id: `render-only-${captured.length}` }), { status: 200 });
  }
  const headers = { ...options.headers };
  if (headers['Idempotency-Key']) headers['Idempotency-Key'] = `${headers['Idempotency-Key']}-sample-${runId}`;
  return realFetch(url, { ...options, headers, body: JSON.stringify(payload) });
};

await mkdir(outDir, { recursive: true });
const results = [];

async function save(name, payload) {
  await writeFile(join(outDir, `${name}.html`), payload.html);
  await writeFile(join(outDir, `${name}.txt`), `Subject: ${payload.subject}\nFrom: ${payload.from}\nReply-To: ${payload.reply_to}\n\n${payload.text}`);
}

for (const scenario of customerScenarios) {
  const { plan, adjustments } = enforcePlanRules(samplePlan, scenario.lead);
  const result = await sendTripLeadConfirmation(env, scenario.lead, plan, { now: SAMPLE_NOW });
  const payload = captured[captured.length - 1];
  await save(`customer-${scenario.id}`, payload);
  results.push({ kind: 'customer', scenario: scenario.label, ok: result.ok, id: result.providerId, error: result.errorCode, providerMessage: result.providerMessage, from: payload.from, subject: payload.subject, adjustments });
}

for (const scenario of sourceScenarios) {
  const lead = leadForSource(scenario);
  const { plan, adjustments } = enforcePlanRules(samplePlan, lead);
  const rendered = renderItineraryEmail(lead, plan, { now: SAMPLE_NOW });
  const result = await sendTripLeadNotification(env, lead, {
    planGenerationStatus: 'succeeded',
    customerItineraryEmailStatus: 'accepted',
    customerItineraryEmailProviderId: 'sample-not-sent-to-a-customer',
    whatsappReminderStatus: 'not_requested',
    planAdjustments: adjustments,
    customerEmail: { from: env.TRIP_CUSTOMER_FROM_EMAIL || CUSTOMER_FROM_DEFAULT, subject: rendered.subject, text: rendered.text, bodyHtml: rendered.bodyHtml },
  });
  const payload = captured[captured.length - 1];
  await save(`admin-${scenario.id}`, payload);
  const summary = sourceSummaryLine(lead);
  results.push({ kind: 'admin', scenario: scenario.label, ok: result.ok, id: result.providerId, error: result.errorCode, providerMessage: result.providerMessage, subject: payload.subject, summary, summaryMatches: summary === scenario.expect });
}

globalThis.fetch = realFetch;
console.log(send ? `Sent to ${TEST_RECIPIENT}:` : `Rendered only (add --send to email ${TEST_RECIPIENT}):`);
for (const row of results) console.log(JSON.stringify(row));
console.log(`Previews: ${outDir}`);
if (results.some((row) => !row.ok || row.summaryMatches === false)) process.exit(1);
