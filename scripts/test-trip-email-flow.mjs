import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  sendTripEmailDeliveryAlert,
  sendTripLeadConfirmation,
  sendTripLeadNotification,
} from '../functions/_shared/email.js';
import { verifyResendWebhook } from '../functions/_shared/resend-webhook.js';

const env = {
  RESEND_API_KEY: 'test-key',
  TRIP_LEAD_FROM_EMAIL: 'ChinaEase Buddy <leads@notify.chinaeasebuddy.com>',
};
const lead = {
  requestId: '42e3bd32-d076-41af-9eca-f4d70c47f714',
  email: 'traveler@example.com',
  travelDate: '2026-10-27',
  travelers: 4,
  tripLength: 4,
  arrivalCity: 'Beijing\r\nBcc: unsafe@example.com',
  destinationCities: ['Beijing'],
  priorities: ['History', 'Family-friendly'],
  helpWith: 'History, Family-friendly',
  contactMethod: 'email',
  locale: 'en',
  sourcePath: '/',
  createdAt: Date.parse('2026-10-14T02:05:35.484Z'),
};
const plan = {
  title: 'Four family-friendly days in Beijing',
  summary: 'A history-focused route with a manageable pace.',
  daily_itinerary: [{
    day: 'Day 1',
    city: 'Beijing',
    morning: 'Visit the Forbidden City.',
    afternoon: 'Walk through Jingshan Park.',
    evening: 'Have an early dinner near Wangfujing.',
    transport: 'Use the metro outside peak hours.',
    food: 'Try Beijing noodles.',
    notes: 'Reserve timed tickets in advance.',
  }],
  transport: ['Keep the metro app ready.'],
  preparation: ['Book major attractions in advance.'],
  personalised_notes: ['Allow breaks for children.'],
  verify_before_booking: ['Check attraction opening hours.'],
};

const originalFetch = globalThis.fetch;
const calls = [];
globalThis.fetch = async (url, options) => {
  calls.push({ url, options, payload: JSON.parse(options.body) });
  return new Response(JSON.stringify({ id: `resend-${calls.length}` }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

try {
  const missingPlan = await sendTripLeadConfirmation(env, lead, null);
  assert.deepEqual(missingPlan, { ok: false, errorCode: 'missing_plan' });
  assert.equal(calls.length, 0, 'customer email is not attempted without a generated plan');

  const confirmation = await sendTripLeadConfirmation(env, lead, plan);
  assert.equal(confirmation.ok, true);
  assert.equal(confirmation.providerId, 'resend-1');
  const customerPayload = calls[0].payload;
  assert.equal(customerPayload.to, lead.email);
  assert.equal(customerPayload.from, 'Lin from ChinaEase Buddy <lin@chinaeasebuddy.com>');
  assert.equal(customerPayload.reply_to, 'lin@chinaeasebuddy.com');
  assert.equal(customerPayload.subject, 'Your 4-day Beijing plan (first draft)');
  const injected = await sendTripLeadConfirmation(env, { ...lead, requestId: undefined, destinationCities: [] }, plan);
  assert.doesNotMatch(injected.email.subject, /[\r\n]/, 'subject strips header-breaking newlines');
  calls.pop();
  assert.doesNotMatch(customerPayload.subject, /[\r\n]/, 'subject strips header-breaking newlines');
  assert.match(customerPayload.html, /A history-focused route with a manageable pace/);
  assert.match(customerPayload.html, /Visit the Forbidden City/);
  assert.match(customerPayload.text, /^Hi,/);
  assert.match(customerPayload.text, /first draft I put together with our trip-planning tool/);
  assert.match(customerPayload.text, /within 48 hours/);
  assert.match(customerPayload.text, /\nLin\nChinaEase Buddy\nhttps:\/\/chinaeasebuddy\.com\n/);
  assert.doesNotMatch(customerPayload.html, /<table/, 'form-data table is no longer at the top of the customer email');
  assert.equal(confirmation.email.subject, customerPayload.subject, 'rendered email is returned for the admin notification');
  assert.doesNotMatch(customerPayload.html, /could not generate your personalised plan/);
  assert.doesNotMatch(customerPayload.text, /will review the details and follow up/);

  const admin = await sendTripLeadNotification(env, lead, {
    planGenerationStatus: 'succeeded',
    customerItineraryEmailStatus: 'accepted',
    customerItineraryEmailProviderId: confirmation.providerId,
    whatsappReminderStatus: 'not_requested',
  });
  assert.equal(admin.ok, true);
  const adminPayload = calls[1].payload;
  assert.equal(adminPayload.to, 'chinaeastbuddy@gmail.com');
  assert.equal(adminPayload.subject, 'ChinaEase trip lead: itinerary email accepted · unknown');
  assert.match(adminPayload.text, /Plan generation:\s+Succeeded/);
  assert.match(adminPayload.text, /Customer itinerary email: Accepted by email provider/);
  assert.match(adminPayload.text, /Customer email ID:\s+resend-1/);

  await sendTripLeadNotification(env, lead, {
    planGenerationStatus: 'failed',
    planGenerationErrorCode: 'provider_timeout',
    customerItineraryEmailStatus: 'not_attempted',
    whatsappReminderStatus: 'not_attempted',
  });
  assert.equal(calls[2].payload.subject, 'ChinaEase trip lead: action required · unknown');
  assert.match(calls[2].payload.text, /The customer received nothing: no itinerary was generated/);
  assert.match(calls[2].payload.text, /Plan error code:\s+provider_timeout/);
  assert.match(calls[2].payload.text, /Customer itinerary email: Not attempted/);

  const alert = await sendTripEmailDeliveryAlert(env, lead, {
    eventType: 'email.bounced',
    providerId: confirmation.providerId,
    webhookId: 'msg-test',
  });
  assert.equal(alert.ok, true);
  assert.equal(calls[3].payload.subject, 'ChinaEase itinerary delivery problem: email.bounced');
  assert.equal(calls[3].payload.to, 'chinaeastbuddy@gmail.com');
  assert.equal(calls[3].payload.reply_to, 'chinaeastbuddy@gmail.com');
  assert.match(calls[3].payload.text, /Check the Resend email log/);
} finally {
  globalThis.fetch = originalFetch;
}

const svixVector = {
  payload: '{"test": 2432232314}',
  headers: {
    'svix-id': 'msg_p5jXN8AQM9LWM0D4loKWxJek',
    'svix-timestamp': '1614265330',
    'svix-signature': 'v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE=',
  },
  secret: 'whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw',
  nowSeconds: 1614265330,
};
assert.equal(await verifyResendWebhook(svixVector), true, 'official Svix signature vector verifies');
assert.equal(await verifyResendWebhook({
  ...svixVector,
  payload: '{"test": 1}',
}), false, 'modified payload is rejected');
assert.equal(await verifyResendWebhook({
  ...svixVector,
  nowSeconds: 1614266000,
}), false, 'stale webhook is rejected');

const tripSource = await readFile('functions/api/leads/trip.js', 'utf8');
const flowStart = tripSource.indexOf('// A request is complete only');
assert.ok(flowStart >= 0, 'completion invariant is documented in the trip flow');
const flow = tripSource.slice(flowStart);
assert.ok(
  flow.indexOf('await sendTripLeadConfirmation(env, lead, plan)')
    < flow.indexOf('await sendTripLeadNotification(env, lead,'),
  'admin notification is sent after the customer-email outcome is known',
);
assert.match(flow, /if \(planResult\.ok\) \{[\s\S]*?sendTripLeadConfirmation\(env, lead, plan\)/);
assert.match(flow, /if \(confirmResult\.ok\) \{[\s\S]*?sendWhatsAppTripReminder\(env, lead\)/);
assert.match(flow, /const itineraryCompleted = planResult\.ok && confirmResult\.ok;/);
assert.match(flow, /finishFreePlanClaim\(env, freePlanClaim, itineraryCompleted \? 'used' : 'failed'\)/);
assert.match(flow, /finishPaidItinerary\(env, paidPlanClaim, itineraryCompleted\)/);
assert.match(flow, /'plan_generation_failed'/);
assert.match(tripSource, /'request_in_progress'/);
assert.match(tripSource, /planSucceeded && emailAccepted/);
assert.match(flow, /customerItineraryEmailProviderId/);
assert.doesNotMatch(flow, /email_delivered/, 'flow does not claim provider delivery');

const clientSource = await readFile('src/lib/tripLead.ts', 'utf8');
const formSource = await readFile('src/components/home/TripPlanForm.tsx', 'utf8');
assert.match(clientSource, /status: 'plan_generation_failed'/);
assert.match(clientSource, /status: 'request_in_progress'/);
assert.match(formSource, /lead\.progressive\.planGenerationFailed/);
assert.match(formSource, /lead\.progressive\.requestInProgress/);

const webhookSource = await readFile('functions/api/webhooks/resend.js', 'utf8');
assert.match(webhookSource, /verifyResendWebhook/);
assert.match(webhookSource, /customerItineraryEmailDeliveredAt/);
assert.match(webhookSource, /customerItineraryEmailBouncedAt/);
assert.match(webhookSource, /sendTripEmailDeliveryAlert/);
assert.match(webhookSource, /customerItineraryEmailProviderId/);

console.log('Trip itinerary generation and email handoff flow checks passed.');
