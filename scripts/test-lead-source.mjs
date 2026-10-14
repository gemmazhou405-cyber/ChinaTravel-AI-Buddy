// Lead source attribution, itinerary rules and computed email facts.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import {
  FIRST_TOUCH_TTL_MS,
  LEAD_SOURCE_FIRST_TOUCH_KEY,
  LEAD_SOURCE_LAST_TOUCH_KEY,
  buildTouch,
  captureLeadSource,
  classifyChannel,
  getLeadSource,
  resetLeadSourceCaptureForTests,
  sanitizeReferrer,
  sanitizeTouch,
} from '../src/lib/leadSource.ts';
import { sendTripLeadNotification, sourceSummaryLine } from '../functions/_shared/email.js';
import { enforcePlanRules } from '../functions/_shared/itinerary.js';
import { renderItineraryEmail } from '../functions/_shared/itinerary-email.js';
import { forbiddenCityFacts } from '../functions/_shared/trip-facts.js';
import { SAMPLE_NOW, customerScenarios, leadForSource, samplePlan, sourceScenarios } from './trip-email-samples.mjs';

// --- Channel classification -------------------------------------------------------------------
const channelOf = (referrer) => classifyChannel({ referrer: sanitizeReferrer(referrer) });
for (const host of ['https://www.google.com/', 'https://www.google.co.uk/', 'https://www.bing.com/', 'https://duckduckgo.com/', 'https://search.yahoo.com/']) {
  assert.equal(channelOf(host).channel, 'organic_search', host);
}
for (const host of ['https://chatgpt.com/', 'https://chat.openai.com/', 'https://www.perplexity.ai/search', 'https://claude.ai/chat/x', 'https://gemini.google.com/app', 'https://copilot.microsoft.com/']) {
  assert.equal(channelOf(host).channel, 'ai_assistant', host);
}
for (const [url, platform] of [
  ['https://l.facebook.com/', 'facebook'], ['https://l.instagram.com/', 'instagram'], ['https://www.reddit.com/r/x/', 'reddit'],
  ['https://www.quora.com/q', 'quora'], ['https://www.trip.com/moments/', 'trip.com'], ['https://m.youtube.com/', 'youtube'],
  ['https://www.tiktok.com/', 'tiktok'], ['https://www.pinterest.co.uk/', 'pinterest'],
]) {
  assert.deepEqual(channelOf(url), { channel: 'social', channelDetail: platform }, url);
}
assert.deepEqual(channelOf(''), { channel: 'direct', channelDetail: '' });
assert.deepEqual(channelOf('https://travelblog.example/post'), { channel: 'referral', channelDetail: 'travelblog.example' });
assert.deepEqual(
  classifyChannel({ referrer: 'google.com', utmSource: 'newsletter', utmMedium: 'email' }),
  { channel: 'utm', channelDetail: 'newsletter / email' },
  'UTM wins over the referrer',
);

// Referrers keep host + path only; internal navigation does not count.
assert.equal(sanitizeReferrer('https://www.reddit.com/r/china/comments/1/?utm=x&email=a@b.com#top'), 'reddit.com/r/china/comments/1/');
assert.equal(sanitizeReferrer('https://chinaeasebuddy.com/guides/'), '');
assert.equal(sanitizeReferrer('https://www.chinaeasebuddy.com/guides/'), '');
assert.equal(sanitizeReferrer('https://chinaease-buddy.pages.dev/'), '');
assert.equal(sanitizeReferrer('https://mail.example.com/u/person@example.com/inbox'), 'mail.example.com/u/_/inbox');
assert.equal(sanitizeReferrer('javascript:alert(1)'), '');

const utmTouch = buildTouch({ href: 'https://chinaeasebuddy.com/plan/?utm_source=reddit&utm_medium=social&email=x@y.com', referrer: '', now: 1 });
assert.equal(utmTouch.landingPage, '/plan/');
assert.ok(!JSON.stringify(utmTouch).includes('@'), 'no email-like values are stored');

// Server re-classifies instead of trusting the posted channel.
const tampered = sanitizeTouch({ ...utmTouch, utmSource: '', utmMedium: '', channel: 'ai_assistant', channelDetail: '<script>', referrer: 'google.com/search' });
assert.equal(tampered.channel, 'organic_search');
assert.equal(tampered.channelDetail, 'google.com');
assert.equal(sanitizeTouch('nonsense'), null);

// --- Browser storage: first touch kept 30 days, last touch per visit --------------------------
class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}
const localStorage = new MemoryStorage();
let sessionStorage = new MemoryStorage();
const location = { href: '' };
const documentStub = { referrer: '' };
globalThis.window = { location, get localStorage() { return localStorage; }, get sessionStorage() { return sessionStorage; } };
globalThis.document = documentStub;

function visit(href, referrer, now, { newSession = false } = {}) {
  if (newSession) sessionStorage = new MemoryStorage();
  location.href = href;
  documentStub.referrer = referrer;
  resetLeadSourceCaptureForTests();
  captureLeadSource(now);
  return getLeadSource(now);
}

const day = 24 * 60 * 60 * 1000;
const t0 = Date.parse('2026-10-01T00:00:00Z');
let state = visit('https://chinaeasebuddy.com/china-240-hour-transit-calculator/', 'https://www.google.com/', t0, { newSession: true });
assert.equal(state.firstTouch.channel, 'organic_search');
assert.equal(state.lastTouch.landingPage, '/china-240-hour-transit-calculator/');

state = visit('https://chinaeasebuddy.com/', 'https://chinaeasebuddy.com/china-240-hour-transit-calculator/', t0 + 60_000);
assert.equal(state.lastTouch.channel, 'organic_search', 'internal navigation keeps the last touch');

state = visit('https://chinaeasebuddy.com/', '', t0 + 120_000);
assert.equal(state.lastTouch.channel, 'organic_search', 'a reload in the same session keeps the last touch');

state = visit('https://chinaeasebuddy.com/alipay-for-foreigners/', 'https://chatgpt.com/', t0 + 3 * day, { newSession: true });
assert.equal(state.firstTouch.channel, 'organic_search', 'first touch is not overwritten');
assert.equal(state.lastTouch.channel, 'ai_assistant', 'last touch updates on a new visit');

state = visit('https://chinaeasebuddy.com/', '', t0 + 5 * day, { newSession: true });
assert.equal(state.lastTouch.channel, 'direct', 'a new direct session updates the last touch');
assert.equal(state.firstTouch.channel, 'organic_search');

state = visit('https://chinaeasebuddy.com/plan/?utm_source=partner&utm_medium=referral', '', t0 + FIRST_TOUCH_TTL_MS + day, { newSession: true });
assert.equal(state.firstTouch.channel, 'utm', 'first touch is replaced after 30 days');
const stored = JSON.parse(localStorage.getItem(LEAD_SOURCE_FIRST_TOUCH_KEY));
assert.equal(stored.expiresAt, t0 + FIRST_TOUCH_TTL_MS + day + FIRST_TOUCH_TTL_MS);
assert.ok(localStorage.getItem(LEAD_SOURCE_LAST_TOUCH_KEY));
const storedText = [...localStorage.values.values()].join('');
assert.ok(!/anonymous|session|uid|email/i.test(storedText), 'no identifier is persisted');

delete globalThis.window;
delete globalThis.document;
assert.deepEqual(getLeadSource(), { firstTouch: null, lastTouch: null }, 'safe without a browser');

// --- Admin notification: four entry scenarios ---------------------------------------------------
const realFetch = globalThis.fetch;
const sent = [];
globalThis.fetch = async (_url, options) => {
  sent.push(JSON.parse(options.body));
  return new Response(JSON.stringify({ id: `resend-${sent.length}` }), { status: 200 });
};
try {
  for (const scenario of sourceScenarios) {
    const lead = leadForSource(scenario);
    assert.equal(sourceSummaryLine(lead), scenario.expect, scenario.label);
    const { plan } = enforcePlanRules(samplePlan, lead);
    const rendered = renderItineraryEmail(lead, plan, { now: SAMPLE_NOW });
    await sendTripLeadNotification({ RESEND_API_KEY: 'test' }, lead, {
      planGenerationStatus: 'succeeded',
      customerItineraryEmailStatus: 'accepted',
      customerItineraryEmailProviderId: 'resend-x',
      customerEmail: { from: 'Lin from ChinaEase Buddy <lin@chinaeasebuddy.com>', subject: rendered.subject, text: rendered.text, bodyHtml: rendered.bodyHtml },
    });
    const payload = sent[sent.length - 1];
    assert.ok(payload.text.startsWith(scenario.expect), `${scenario.label}: summary is the first line`);
    assert.ok(payload.html.indexOf(scenario.expect.replace(/&/g, '&amp;')) < payload.html.indexOf('First touch'), `${scenario.label}: summary sits above the details`);
    assert.match(payload.text, /FIRST TOUCH[\s\S]*LAST TOUCH/);
    assert.match(payload.text, /Sending status: Accepted by email provider/);
    assert.match(payload.text, /----- customer email start -----[\s\S]*Your day-by-day draft|YOUR DAY-BY-DAY DRAFT/);
    assert.ok(payload.html.includes(rendered.bodyHtml), `${scenario.label}: admin email embeds the exact customer body`);
    assert.ok(!payload.text.includes('share_id') && !payload.text.includes('?model'), 'referrer query strings never appear');
  }
} finally {
  globalThis.fetch = realFetch;
}

// --- Itinerary rules -----------------------------------------------------------------------------
const usLead = customerScenarios[0].lead;
const enforced = enforcePlanRules(samplePlan, usLead);
const planText = JSON.stringify(enforced.plan);
assert.doesNotMatch(planText, /vpn/i, 'VPN advice is removed');
assert.doesNotMatch(planText, /guaranteed|100\s?%/i, 'absolute claims are removed');
const lastDay = enforced.plan.daily_itinerary.at(-1);
assert.doesNotMatch(`${lastDay.morning} ${lastDay.afternoon} ${lastDay.evening}`, /great wall|mutianyu/i, 'no long day trip on the departure day');
assert.match(lastDay.evening, /Fly home/, 'departure logistics stay on the departure day');
assert.doesNotMatch(enforced.plan.daily_itinerary[0].morning, /great wall/i);
assert.ok(enforced.adjustments.some((item) => item.includes('long_day_trip_on_travel_day')));

// Whole-day swap: the Great Wall day moves to Day 3 together with its return trip, transport and lunch.
const [day1, , day3, day4] = enforced.plan.daily_itinerary;
assert.match(day3.morning, /Great Wall at Mutianyu/);
assert.equal(day3.afternoon, 'Return to the city.');
assert.match(day3.transport, /Private car to Mutianyu/);
assert.match(day3.food, /Lunch near the Wall/);
assert.doesNotMatch(`${day3.afternoon} ${day3.evening}`, /Summer Palace|Temple of Heaven|Acrobatics/, 'Day 3 is not overloaded');
// Departure day: logistics stay, one light activity, no "return to the city" without a day trip.
assert.equal(day4.morning, 'Temple of Heaven early, when locals exercise.');
assert.equal(day4.afternoon, 'Pack and get ready to leave.');
assert.equal(day4.evening, 'Fly home.');
assert.equal(day4.optional, '', 'no room for an optional extra before leaving');
assert.match(day4.transport, /DiDi/);
for (const day of enforced.plan.daily_itinerary) {
  if (!/great wall|mutianyu/i.test(`${day.morning} ${day.afternoon} ${day.evening}`)) {
    assert.doesNotMatch(`${day.morning} ${day.afternoon} ${day.evening}`, /return to the city/i, `${day.day}: no return without leaving`);
  }
}
// Arrival day: Tiananmen Square moves to the Forbidden City day; dinner is a meal, not an activity.
assert.equal(day1.afternoon, '');
assert.equal(day1.evening, 'Peking duck dinner near Qianmen.', 'meals stay and are never marked optional');
assert.equal(day1.optional, '');
const day2 = enforced.plan.daily_itinerary[1];
assert.equal(day2.morning, 'Walk around Tiananmen Square and Qianmen Street. Forbidden City (Palace Museum), entering from Meridian Gate.');
assert.ok(enforced.adjustments.includes('moved Tiananmen Square from Day 1 to Day 2'));
assert.ok(enforced.adjustments.some((item) => item.includes('dropped')), 'dropped extras are reported');

// Meals don't count towards the one-activity limit; a second real activity becomes optional.
const mealPlan = enforcePlanRules({ ...samplePlan, daily_itinerary: [
  { day: 'Day 1', city: 'Beijing', morning: 'Arrive and check in near Wangfujing.', afternoon: 'Wangfujing food street.', evening: 'Dinner at a local hot pot place.', transport: '', food: '', notes: '' },
  ...samplePlan.daily_itinerary.slice(1, 3),
  { day: 'Day 4', city: 'Beijing', morning: 'Breakfast at the hotel.', afternoon: 'Lama Temple.', evening: 'Fly home.', transport: '', food: '', notes: '' },
] }, usLead).plan.daily_itinerary;
assert.equal(mealPlan[0].afternoon, 'Wangfujing food street.');
assert.equal(mealPlan[0].evening, 'Dinner at a local hot pot place.');
assert.equal(mealPlan[0].optional, '');
assert.equal(mealPlan[3].morning, 'Breakfast at the hotel.');
assert.equal(mealPlan[3].afternoon, 'Lama Temple.');
const twoActivities = enforcePlanRules({ ...samplePlan, daily_itinerary: [
  { day: 'Day 1', city: 'Beijing', morning: 'Arrive and check in.', afternoon: 'Jingshan Park.', evening: 'Hutong walk around Nanluoguxiang.', transport: '', food: '', notes: '' },
  ...samplePlan.daily_itinerary.slice(1),
] }, usLead).plan.daily_itinerary[0];
assert.equal(twoActivities.evening, '');
assert.equal(twoActivities.optional, 'Hutong walk around Nanluoguxiang.');

// Tiananmen with no Forbidden City day: first non-travel day, in an empty slot if there is one.
const noPalace = enforcePlanRules({ ...samplePlan, daily_itinerary: [
  samplePlan.daily_itinerary[0],
  { day: 'Day 2', city: 'Beijing', morning: 'Temple of Heaven.', afternoon: '', evening: 'Acrobatics show.', transport: '', food: '', notes: '' },
  { day: 'Day 3', city: 'Beijing', morning: 'Summer Palace.', afternoon: 'Pack.', evening: 'Fly home.', transport: '', food: '', notes: '' },
] }, { ...usLead, tripLength: 3 }).plan.daily_itinerary;
assert.equal(noPalace[1].afternoon, 'Walk around Tiananmen Square and Qianmen Street.');
assert.doesNotMatch(JSON.stringify(noPalace[0]), /Tiananmen/);

// A summary that names specific days is trimmed after a swap.
const dayRefPlan = enforcePlanRules({ ...samplePlan, summary: 'Relaxed history trip. The Great Wall is on your last day.' }, usLead);
assert.equal(dayRefPlan.plan.summary, 'Relaxed history trip.');

const covidPlan = { ...samplePlan, summary: 'Bring a negative PCR test. Enjoy the trip.', daily_itinerary: samplePlan.daily_itinerary.slice(0, 2) };
assert.equal(enforcePlanRules(covidPlan, usLead).plan.summary, 'Enjoy the trip.');

// Great Wall on a 1-day trip: no safe swap, so it is replaced with a light plan.
const oneDay = enforcePlanRules({ ...samplePlan, daily_itinerary: [{ ...samplePlan.daily_itinerary[3] }] }, { ...usLead, tripLength: 1 });
assert.doesNotMatch(oneDay.plan.daily_itinerary[0].morning, /great wall/i);

// Forbidden City on a Monday (trip starting Sunday 25 Oct 2026 → Day 2 is Monday 26 Oct).
const mondayLead = { ...usLead, travelDate: '2026-10-25' };
const mondayFixed = enforcePlanRules(samplePlan, mondayLead);
const palaceAfter = forbiddenCityFacts(mondayLead, mondayFixed.plan, SAMPLE_NOW);
assert.equal(palaceAfter.isMonday, false, 'Forbidden City moved off Monday');
assert.ok(mondayFixed.adjustments.some((item) => item.includes('forbidden_city_on_monday')));
const palaceRaw = forbiddenCityFacts(mondayLead, samplePlan, SAMPLE_NOW);
assert.equal(palaceRaw.visitDateIso, '2026-10-26');
assert.equal(palaceRaw.isMonday, true);
assert.equal(palaceRaw.releaseDateIso, '2026-10-19');
assert.equal(palaceRaw.releaseAtUtcIso, '2026-10-19T12:00:00.000Z', '20:00 Beijing time is 12:00 UTC');

const itinerarySource = await readFile('functions/_shared/itinerary.js', 'utf8');
for (const rule of ['1.5 hours', 'roaming eSIM', 'COVID-19', '"guaranteed"', 'closed on Mondays']) {
  assert.ok(itinerarySource.includes(rule), `prompt states rule: ${rule}`);
}
assert.match(itinerarySource, /enforcePlanRules\(result\.plan, lead\)/, 'generated plans are enforced in code');

// --- Customer email: computed facts per passport ----------------------------------------------
const render = (lead) => renderItineraryEmail(lead, enforcePlanRules(samplePlan, lead).plan, { now: SAMPLE_NOW });
const us = render(customerScenarios[0].lead);
assert.equal(us.subject, 'Your 4-day Beijing plan (first draft)');
assert.match(us.text, /United States passports are not on China's 30-day visa-free list/);
assert.match(us.text, /tourist \(L\) visa/);
assert.match(us.text, /Book Forbidden City tickets on Wed 21 Oct at 20:00 Beijing time/);
assert.match(us.text, /Wednesday 21 Oct 2026 at 20:00 Beijing time \(12:00 UTC\)/);
assert.doesNotMatch(us.text, /Which passport/);

const uk = render(customerScenarios[1].lead);
assert.match(uk.text, /United Kingdom passport holders can visit mainland China visa-free for up to 30 days/);
assert.doesNotMatch(uk.text, /tourist \(L\) visa/);

const unknown = render(customerScenarios[2].lead);
assert.doesNotMatch(unknown.text, /visa-free list|You can skip the visa/);
assert.match(unknown.text, /Which passport\(s\) will you be travelling on\?/);

assert.match(us.text, /This is based on the United States passport you selected/);

// Visa urgency from the start date (SAMPLE_NOW is 14 Oct, the trip starts 27 Oct).
assert.match(us.text, /Your trip is 13 days away, so check the visa centre's current processing times today\. If you're flying on to a different country afterwards/);
const usLater = render({ ...usLead, travelDate: '2026-12-01' });
assert.match(usLater.text, /Your trip is 48 days away; check the visa centre's current processing times and apply soon\./);
const usNoDate = render({ ...usLead, travelDate: null });
assert.match(usNoDate.text, /Check the visa centre's current processing times before you book flights\./);
const indiaSoon = render({ ...usLead, passportCountry: 'IN' });
assert.match(indiaSoon.text, /Your trip is 13 days away, so check the visa centre's current processing times today\. The 240-hour visa-free transit isn't available on India passports/);

// Tiananmen Square later in the trip: no arrival-day reminder.
const laterSquare = renderItineraryEmail(usLead, { ...samplePlan, daily_itinerary: [samplePlan.daily_itinerary[1], { ...samplePlan.daily_itinerary[0], morning: 'Hotel breakfast.' }] }, { now: SAMPLE_NOW });
assert.match(laterSquare.text, /Tiananmen Square: Free/);
assert.doesNotMatch(renderItineraryEmail(usLead, { ...samplePlan, daily_itinerary: [samplePlan.daily_itinerary[2]] }, { now: SAMPLE_NOW }).text, /Tiananmen Square:/);

// Passport country from the form wins over the departure country; without it, departure is a stated guess.
const passportWins = render({ ...customerScenarios[1].lead, departureCountry: 'United States' });
assert.match(passportWins.text, /United Kingdom passport holders can visit mainland China visa-free/);
const departureGuess = render({ ...customerScenarios[2].lead, departureCountry: 'United Kingdom' });
assert.match(departureGuess.text, /I've assumed everyone is travelling on a United Kingdom passport because that's where you're flying from/);

const tripEndpointSource = readFileSync('functions/api/leads/trip.js', 'utf8');
assert.match(tripEndpointSource, /code !== 'ZZ' && COUNTRY_NAMES\[code\] \? code : null/, 'passport country is validated against the visa data');
const tripFormSource = readFileSync('src/components/home/TripPlanForm.tsx', 'utf8');
assert.match(tripFormSource, /<option value="">\{t\('lead\.progressive\.passportSkip'\)\}<\/option>/, 'passport country can be skipped');
assert.match(tripFormSource, /passportCountry: passportCountry \|\| undefined/);

for (const email of [us, uk, unknown]) {
  assert.ok(email.items.length >= 2 && email.items.length <= 3, '2-3 "do these first" items');
  assert.match(email.text, /Are any children travelling with you\? If so, how old are they\?/);
  assert.doesNotMatch(email.text, /How old are the children/);
  assert.match(email.text, /There's no ticket office at the gate\./);
  assert.match(email.text, /Tiananmen Square: Free, but you must book a real-name slot 1–7 days in advance in the WeChat mini program "天安门广场预约参观"/);
  assert.match(email.text, /New slots open every day at 12:00 Beijing time\. Same-day booking and walk-up entry aren't possible\./);
  assert.match(email.text, /so ask your hotel front desk to book it for you when you check in — booking a day ahead is enough\. Bring your original passport on the day\./);
  assert.doesNotMatch(email.text, /arrival day, so make sure|before you fly\.\n/);
  assert.doesNotMatch(email.text.split('Day 2 ·')[0].split('Day 1 ·')[1], /Tiananmen Square/, 'not on the arrival day');
  assert.doesNotMatch(email.text, /Allow several weeks/);
  assert.match(email.text, /What time do your flights land and leave/);
  assert.doesNotMatch(email.text, /\bvpn\b|covid|guaranteed|100%/i);
  assert.ok(email.text.indexOf('DO THESE FIRST') < email.text.indexOf('YOUR DAY-BY-DAY DRAFT'));
  assert.ok(email.text.indexOf('YOUR DAY-BY-DAY DRAFT') < email.text.indexOf('A FEW QUESTIONS'));
  assert.ok(email.text.indexOf('A FEW QUESTIONS') < email.text.indexOf('\nLin\n'));
  assert.ok(email.text.indexOf('\nLin\n') < email.text.indexOf('What you told us:'), 'form summary sits at the end');
}

// Already on sale: visit date less than 7 days away.
const soon = renderItineraryEmail({ ...usLead, travelDate: '2026-10-15' }, samplePlan, { now: SAMPLE_NOW });
assert.match(soon.text, /already on sale/);
// No dates: generic booking-window advice and a date question.
const noDates = renderItineraryEmail({ ...usLead, travelDate: null }, samplePlan, { now: SAMPLE_NOW });
assert.match(noDates.text, /7 days before each visit date at 20:00 Beijing time/);
assert.match(noDates.text, /What dates are you travelling\?/);

console.log('Lead source attribution, itinerary rules and computed email facts tests passed.');
