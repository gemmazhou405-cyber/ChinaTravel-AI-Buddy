// Regression checks for the payments, facts, privacy and analytics fixes:
// device-bound pass claims, Gumroad-only payment copy, one free AI quota, itinerary CTAs to
// /plan/, visa guides deferring to the checker, the arrival-card route, og:image, the privacy
// policy's processors, and the analytics allowlist.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');

// 1. ClaimModal sends a persistent deviceId with both requests, in the fields the API reads.
const claimModal = read('src/components/ClaimModal.tsx');
assert.match(claimModal, /JSON\.stringify\(\{ saleId: id, deviceId: getDeviceId\(\) \}\)/);
assert.match(claimModal, /JSON\.stringify\(\{ code, deviceId: getDeviceId\(\) \}\)/);
assert.doesNotMatch(claimModal, /recoveryCode: code/);
assert.match(read('functions/api/claim.js'), /body\.saleId[\s\S]*body\.deviceId/);
assert.match(read('functions/api/recover.js'), /normalizeCode\(body\.code\)[\s\S]*body\.deviceId/);
// Error codes the modal maps are the ones the API returns.
assert.match(claimModal, /'invalid_sale'/);
assert.match(claimModal, /'invalid_code'/);
assert.match(claimModal, /'max_devices_reached'/);

const storage = new Map();
globalThis.window = {
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
  },
};
const { getDeviceId } = await import('../src/lib/deviceId.ts');
const first = getDeviceId();
assert.equal(getDeviceId(), first, 'the same browser keeps the same device ID');
assert.match(first, /^[0-9a-f-]{36}$/i);
// The API strips anything outside [a-zA-Z0-9-] and caps at 64 characters; a UUID survives intact.
assert.equal(first.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64), first);
globalThis.window = { localStorage: { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } } };
const blocked = getDeviceId();
assert.equal(getDeviceId(), blocked, 'storage blocked: stable for the page lifetime');

// 3. Payment copy is Gumroad only; the free AI quota matches functions/api/buddy/chat.js.
const chat = read('functions/api/buddy/chat.js');
const freeLimit = Number(chat.match(/const FREE_DAILY_LIMIT = (\d+);/)[1]);
assert.equal(freeLimit, 10);
for (const file of readdirSync('src/i18n/locales')) {
  const text = read(`src/i18n/locales/${file}`);
  assert.doesNotMatch(text, /paypal/i, `${file} has no PayPal copy`);
  const t = JSON.parse(text).translation;
  assert.match(t.pay.plans.free.features[1], /10/, `${file}: free plan feature says 10`);
  assert.match(t.auth.freeNote, /10/, `${file}: free note says 10`);
  assert.doesNotMatch(t.auth.freeNote, /\b5\b/, `${file}: no "5 messages"`);
}
for (const file of ['index.html', 'src/components/PolicyPage.tsx', 'scripts/copy-policy-pages.mjs', 'src/components/PricingPlans.tsx', 'src/components/home/HomePasses.tsx']) {
  const text = read(file);
  assert.doesNotMatch(text, /paypal/i, `${file} has no PayPal copy`);
  assert.doesNotMatch(text, /\b5 Buddy AI messages\b/, `${file} has no "5 Buddy AI messages"`);
}
assert.match(read('index.html'), /Basic travel toolkit with 10 Buddy AI messages per day\./);
assert.doesNotMatch(read('index.html'), /valid for 7 days|owner approval/);

// 5. Itinerary page CTAs go to /plan/ and never open the chat.
const policyPage = read('src/components/PolicyPage.tsx');
for (const slug of ['china-itinerary-first-time-7-10-14-days', 'china-travel-ai-itinerary-generator']) {
  const start = policyPage.indexOf(`  '${slug}': {\n    path:`);
  assert.ok(start > 0, slug);
  const block = policyPage.slice(start, policyPage.indexOf('\n    reviewed:', start));
  assert.match(block, /ctaLabel: 'Get my free itinerary'/, `${slug} label`);
  assert.match(block, /ctaHref: '\/plan\/'/, `${slug} goes to /plan/`);
  assert.doesNotMatch(block, /buddyPrompt/, `${slug} does not open the chat`);
  assert.match(read('scripts/copy-policy-pages.mjs'), new RegExp(`'${slug}': \\['Get my free itinerary', '/plan/'\\]`), `${slug} static CTA`);
}

// 6. Country visa guides carry no visa rules, only a pointer to the checker.
for (const file of readdirSync('src/data/visaGuides')) {
  const guide = JSON.parse(read(`src/data/visaGuides/${file}`));
  assert.deepEqual(Object.keys(guide), ['id', 'country', 'visaCheck', 'customsRules', 'arrivalTips'], file);
  assert.match(guide.visaCheck, /China Visa-Free Checker/, file);
  assert.ok(guide.arrivalTips.every((tip) => !/visa|vpn/i.test(tip)), `${file}: no visa or VPN tips`);
}
const beforeTab = read('src/components/tabs/BeforeTab.tsx');
assert.match(beforeTab, /href="\/china-visa-free-checker\/"/);
assert.doesNotMatch(beforeTab, /applicationSteps|requiredDocuments|visaRequired/);
assert.equal(existsSync('scripts/generateVisaGuides.mjs'), false, 'the AI visa-guide generator is retired');

// 7. The online arrival card page has a React route (it used to fall through to the homepage).
assert.match(policyPage, /if \(cleanPath\.endsWith\('\/china-online-arrival-card-2026'\)\) return 'china-online-arrival-card-2026';/);
assert.match(policyPage, /\| 'china-online-arrival-card-2026'/);
assert.match(policyPage, /'china-online-arrival-card-2026': \{\n    \.\.\.guideFromArticle\(\n      arrivalCardGuide,/);
const arrivalCard = JSON.parse(read('src/data/seoPages/china-online-arrival-card-2026.json'));
assert.match(arrivalCard.heading, /Online Arrival Card/);
assert.match(read('scripts/copy-policy-pages.mjs'), /pageMeta\['china-online-arrival-card-2026'\] = \{\n  \.\.\.arrivalCardGuide,/);

// 9. Social previews use an image that exists.
for (const file of ['index.html', 'public/first-trip-to-china/index.html']) {
  assert.doesNotMatch(read(file), /og-image\.jpg/, file);
  assert.match(read(file), /og:image" content="https:\/\/chinaeasebuddy\.com\/social_media\.jpg"/, file);
}
assert.ok(existsSync('public/social_media.jpg'));

// 10. The privacy policy names the processors and the salted IP hash.
assert.match(policyPage, /DeepSeek \(the AI model that answers Buddy chat messages\)/);
assert.match(policyPage, /are sent to DeepSeek, an AI model provider; your email address and WhatsApp number are not sent to DeepSeek/);
assert.match(policyPage, /We use Resend, an email delivery service, to send your itinerary email/);
assert.match(policyPage, /one automated WhatsApp message[\s\S]{0,200}WhatsApp Business Platform operated by Meta Platforms/);
assert.match(policyPage, /salted, one-way hash of your IP address/);
for (const file of ['functions/api/leads/trip.js', 'functions/api/events.js', 'functions/api/newsletter/subscribe.js', 'functions/api/buddy/chat.js', 'functions/api/recover.js']) {
  assert.match(read(file), /hashIp\(env, /, `${file} uses the salted IP hash`);
}
assert.doesNotMatch(read('functions/api/buddy/chat.js'), /free:ip:\$\{ip\}|free:\$\{ip\./, 'chat no longer keys KV by raw IP');
assert.doesNotMatch(read('functions/api/recover.js'), /recover:ip:\$\{ip\}/, 'recover no longer keys KV by raw IP');
assert.match(read('.env.example'), /^IP_HASH_SALT=$/m);

// 11. The five events are allowed on both sides and sent with keepalive.
const analytics = read('src/lib/analytics.ts');
const events = read('functions/api/events.js');
const newEvents = ['cta_clicked', 'transit_calculator_result_link_click', 'transit_answer_calculator_click', 'quota_exhausted', 'newsletter_subscribed'];
const setBody = (source, name) => source.slice(source.indexOf(`const ${name} = new Set([`), source.indexOf(']);', source.indexOf(`const ${name} = new Set([`)));
for (const event of newEvents) {
  assert.match(setBody(analytics, 'FUNNEL_EVENTS'), new RegExp(`'${event}'`), `client sends ${event}`);
  assert.match(setBody(events, 'ALLOWED_EVENTS'), new RegExp(`'${event}'`), `server accepts ${event}`);
}
assert.match(analytics, /fetch\('\/api\/events', \{[\s\S]{0,160}keepalive: true,/);

const { onRequestPost: postEvent } = await import('../functions/api/events.js');
for (const event of newEvents) {
  const response = await postEvent({
    request: new Request('https://chinaeasebuddy.com/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://chinaeasebuddy.com', 'CF-Connecting-IP': '192.0.2.1' },
      body: JSON.stringify({ event, environment: 'production', deviceCategory: 'desktop', ctaName: 'Get my free itinerary', destination: '/plan/?x=1' }),
    }),
    env: { IP_HASH_SALT: 'test' },
  });
  assert.equal(response.status, 200, `${event} accepted by /api/events`);
}

console.log('Release fix checks passed (claims, payment copy, CTAs, visa guides, arrival card route, og:image, privacy, analytics).');
