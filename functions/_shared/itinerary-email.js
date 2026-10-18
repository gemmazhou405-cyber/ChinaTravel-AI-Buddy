// The itinerary email a traveller receives, written as a personal note from Lin.
// The day-by-day plan comes from the AI generator; everything time-sensitive (visa status,
// Forbidden City ticket release, Monday closure, follow-up questions) is computed here in code.
import { forbiddenCityFacts, longDate, shortDate, tripDayDates, visaFacts } from './trip-facts.js';

export const LIN_EMAIL = 'lin@chinaeasebuddy.com';
export const CUSTOMER_FROM_DEFAULT = `Lin from ChinaEase Buddy <${LIN_EMAIL}>`;
const SITE_URL = 'https://chinaeasebuddy.com';
const TRANSIT_GUIDE_URL = `${SITE_URL}/china-240-hour-visa-free-transit-2026/`;
const ALIPAY_GUIDE_URL = `${SITE_URL}/alipay-for-foreigners/`;
const TRIP_PLAN_URL = 'https://chinaeasebuddy.gumroad.com/l/aajhsx?utm_source=itinerary_email';
const TRIP_PLAN_INTRO = 'My review is a quick read with notes. If you\'d rather hand the whole thing over, I\'ll rewrite this into a finalized plan: exact booking times for things that sell out, train choices between cities, and a pre-departure checklist for your passport, with 2 rounds of revisions by email.';
const FAMILY_RE = /family|kid|child|children|baby|toddler/i;
const TIANANMEN_RE = /tian'?anmen square|天安门广场/i;
const VISA_URGENT_DAYS = 21;

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function oneLine(value, max = 60) {
  return typeof value === 'string' ? value.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';
}

function joinNames(names) {
  if (names.length <= 1) return names[0] || '';
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

export function tripCities(lead, plan) {
  const fromLead = (Array.isArray(lead.destinationCities) && lead.destinationCities.length
    ? lead.destinationCities
    : (lead.arrivalCity ? [lead.arrivalCity] : []))
    .map((city) => oneLine(city, 30))
    .filter(Boolean);
  if (fromLead.length) return [...new Set(fromLead)].slice(0, 3);
  const fromPlan = (plan?.daily_itinerary || []).map((day) => oneLine(day.city, 30)).filter(Boolean);
  return [...new Set(fromPlan)].slice(0, 3);
}

function tripDays(lead, plan) {
  const fromLead = Number(lead.tripLength);
  if (Number.isInteger(fromLead) && fromLead >= 1 && fromLead <= 60) return fromLead;
  const fromPlan = plan?.daily_itinerary?.length;
  return fromPlan || null;
}

/** e.g. "Your 4-day Beijing plan (first draft)" */
export function buildItinerarySubject(lead, plan) {
  const days = tripDays(lead, plan);
  const cities = joinNames(tripCities(lead, plan)) || 'China';
  const subject = `Your ${days ? `${days}-day ` : ''}${cities} plan (first draft)`;
  return subject.replace(/[\r\n]+/g, ' ').slice(0, 120);
}

function isFamilyTrip(lead) {
  return [...(lead.interests || []), ...(lead.priorities || []), lead.helpWith || '']
    .some((value) => typeof value === 'string' && FAMILY_RE.test(value));
}

function visaItem(visa, lead) {
  if (!visa || ['unknown', 'not_applicable'].includes(visa.status)) return null;
  const country = visa.countryName;
  const assumption = visa.basis === 'passport'
    ? Number(lead.travelers) > 1
      ? `This is based on the ${country} passport you selected. If anyone in your group holds a different passport, let me know and I'll check theirs too.`
      : `This is based on the ${country} passport you selected.`
    : Number(lead.travelers) > 1
    ? `I've assumed everyone is travelling on a ${country} passport because that's where you're flying from. Let me know if anyone isn't.`
    : `I've assumed you're travelling on a ${country} passport because that's where you're flying from. Let me know if that's not right.`;
  const validity = visa.policyValidity && visa.policyValidity.startsWith('Verified through')
    ? ` The current policy is confirmed ${visa.policyValidity.replace(/^Verified /, '')}.`
    : '';
  if (visa.status === 'visa_free_30') {
    return {
      title: 'You can skip the visa for this trip',
      body: `${country} passport holders can visit mainland China visa-free for up to 30 days.${validity} Keep your return ticket and first hotel booking handy in case the border officer asks. ${assumption}`,
    };
  }
  if (visa.status === 'visa_free_mutual') {
    return {
      title: 'You can skip the visa for this trip',
      body: `${country} and China have a mutual visa exemption agreement for ordinary passports (${visa.maximumStay.toLowerCase()}). Keep your return ticket and first hotel booking handy. ${assumption}`,
    };
  }
  if (visa.status === 'policy_expires_before_trip') {
    return {
      title: 'Check the visa-free rule before you book',
      body: `${country} passports are currently visa-free for 30 days, but the policy is only confirmed ${visa.policyValidity.replace(/^Verified /, '')}, which is before your trip starts. Don't rely on it until an extension is announced; if none is, you'll need a visa. ${assumption}`,
    };
  }
  const timing = visaTiming(visa, country);
  if (visa.status === 'stay_too_long') {
    return {
      title: 'Your stay is longer than the visa-free limit',
      body: `${country} passports can visit visa-free for a limited stay (${visa.maximumStay.toLowerCase()}), and your ${visa.stayDays}-day trip is longer than that, so you'll need a tourist (L) visa before you fly. ${timing} ${assumption}`,
    };
  }
  return {
    title: 'Apply for a Chinese visa first',
    body: `${country} passports are not on China's 30-day visa-free list, so for this trip you'll need a tourist (L) visa before you fly. ${timing} ${assumption}`,
  };
}

/** How urgent the visa application is, from the trip start date, plus the 240-hour transit option. */
function visaTiming(visa, country) {
  const days = visa.daysUntilTrip;
  const transitOption = `If you're flying on to a different country afterwards (not back to where you started), the 240-hour visa-free transit may cover a stay of up to 10 days without a visa: ${TRANSIT_GUIDE_URL}`;
  const transit = visa.transitEligible
    ? transitOption
    : `The 240-hour visa-free transit isn't available on ${country} passports, so a visa is the only option.`;
  if (days === null || days === undefined) {
    return `Check the visa centre's current processing times before you book flights.${visa.transitEligible ? ` ${transitOption}` : ''}`;
  }
  const away = days <= 0 ? 'Your trip starts today' : `Your trip is ${days} day${days === 1 ? '' : 's'} away`;
  if (days < VISA_URGENT_DAYS) {
    return `${away}, so check the visa centre's current processing times today. ${transit}`;
  }
  return `${away}; check the visa centre's current processing times and apply soon.${visa.transitEligible ? ` ${transitOption}` : ''}`;
}

function forbiddenCityItem(palace, plan) {
  if (!palace) return null;
  if (!palace.visitDate) {
    return {
      title: 'Know when Forbidden City tickets open',
      body: 'Tickets go on sale 7 days before each visit date at 20:00 Beijing time and popular days sell out fast. The museum is closed on Mondays. Send me your dates and I\'ll tell you exactly when to book. There\'s no ticket office at the gate.',
    };
  }
  const dayLabel = plan.daily_itinerary[palace.dayIndex]?.day || `Day ${palace.dayIndex + 1}`;
  const monday = palace.isMonday
    ? ` Heads-up: ${shortDate(palace.visitDate)} is a Monday, when the museum is closed, so I'll move this day when I review your plan.`
    : '';
  if (palace.alreadyOnSale) {
    return {
      title: 'Book your Forbidden City tickets now',
      body: `Your draft has the Forbidden City on ${dayLabel} (${shortDate(palace.visitDate)}). Tickets for that day are already on sale and popular days sell out, so book as soon as you can, using the passport you'll carry on the day.${monday} There's no ticket office at the gate.`,
    };
  }
  return {
    title: `Book Forbidden City tickets on ${shortDate(palace.releaseDate)} at 20:00 Beijing time`,
    body: `Your draft has the Forbidden City on ${dayLabel} (${shortDate(palace.visitDate)}). Tickets for that day go on sale 7 days earlier: ${longDate(palace.releaseDate)} at 20:00 Beijing time (12:00 UTC). Popular days sell out quickly, so set a reminder, and book with the passport you'll carry on the day.${monday} There's no ticket office at the gate.`,
  };
}

const ESIM_ITEM = {
  title: 'Buy a roaming eSIM before you fly',
  body: 'Set up a roaming eSIM at home so you have mobile data the moment you land. You\'ll need it for maps, ride-hailing, translation and paying.',
};

const PAYMENT_ITEM = {
  title: 'Set up Alipay or WeChat Pay',
  body: `Most shops, taxis and restaurants expect mobile payment. Link your bank card to Alipay before you go: ${ALIPAY_GUIDE_URL}`,
};

/** Two or three "do these first" items, most urgent first. */
export function beforeYouGoItems(lead, plan, facts) {
  return [visaItem(facts.visa, lead), forbiddenCityItem(facts.palace, plan), ESIM_ITEM, PAYMENT_ITEM]
    .filter(Boolean)
    .slice(0, 3);
}

/** Questions about details the form did not give us. At most four. */
export function followUpQuestions(lead, plan, facts) {
  const questions = [];
  if (facts.visa.status === 'unknown') {
    questions.push('Which passport(s) will you be travelling on? Visa rules depend on nationality, so this decides whether you need a visa at all.');
  }
  if (!lead.travelDate) {
    questions.push('What dates are you travelling? Some tickets, like the Forbidden City, can only be booked 7 days ahead, so I\'d like to give you exact booking times.');
  }
  if (!tripCities(lead, null).length) {
    questions.push('Which cities are you most keen on? I\'ve suggested a route, but I\'m happy to change it.');
  }
  const lastDay = tripDays(lead, plan);
  questions.push(`What time do your flights land and leave, and at which airports? I'll fit Day 1${lastDay && lastDay > 1 ? ` and Day ${lastDay}` : ''} around them.`);
  if (isFamilyTrip(lead)) {
    questions.push('Are any children travelling with you? If so, how old are they? It changes which activities, ticket types and travel times make sense.');
  }
  questions.push('Have you booked any hotels yet? If so, which area? I\'ll plan each day around where you\'re staying.');
  return questions.slice(0, 4);
}

function tripSummaryLine(lead, plan) {
  const parts = [];
  const travelers = Number(lead.travelers);
  if (travelers) parts.push(`${travelers} traveller${travelers === 1 ? '' : 's'}`);
  const days = tripDays(lead, plan);
  if (days) parts.push(`${days} days`);
  const start = tripDayDates(lead, 1)[0];
  if (start) parts.push(`from ${shortDate(start)}`);
  const cities = tripCities(lead, null);
  if (cities.length) parts.push(joinNames(cities));
  const interests = (lead.priorities || []).filter(Boolean).slice(0, 6);
  if (interests.length) parts.push(`interests: ${interests.join(', ')}`);
  if (lead.departureCountry) parts.push(`flying from ${oneLine(lead.departureCountry, 60)}`);
  return parts.join(' · ');
}

/**
 * Tiananmen Square booking note, computed in code. The square is free but needs a real-name
 * reservation made 1-7 days ahead; there is no same-day booking or walk-up entry.
 */
export function tiananmenNote(day) {
  const text = [day.morning, day.afternoon, day.evening, day.optional].filter(Boolean).join(' ');
  if (!TIANANMEN_RE.test(text)) return '';
  return 'Free, but you must book a real-name slot 1–7 days in advance in the WeChat mini program "天安门广场预约参观" (Tiananmen Square visit booking). New slots open every day at 12:00 Beijing time. Same-day booking and walk-up entry aren\'t possible. Foreign phone numbers often fail verification, so ask your hotel front desk to book it for you when you check in — booking a day ahead is enough. Bring your original passport on the day.';
}

function dayHeading(day, index, dates) {
  const label = day.day || `Day ${index + 1}`;
  return [label, dates[index] ? shortDate(dates[index]) : '', day.city].filter(Boolean).join(' · ');
}

export function computeTripFacts(lead, plan, now = Date.now()) {
  // A bug in a fact helper must never block the itinerary email; fall back to asking instead.
  let visa = { status: 'unknown' };
  let palace = null;
  try { visa = visaFacts(lead, now); } catch { /* keep unknown */ }
  try { palace = forbiddenCityFacts(lead, plan, now); } catch { /* omit */ }
  return { visa, palace };
}

/** Render the customer itinerary email. Returns subject, html, text and the inner body html. */
export function renderItineraryEmail(lead, plan, { now = Date.now() } = {}) {
  const facts = computeTripFacts(lead, plan, now);
  const subject = buildItinerarySubject(lead, plan);
  const items = beforeYouGoItems(lead, plan, facts);
  const questions = followUpQuestions(lead, plan, facts);
  const days = plan.daily_itinerary;
  const dates = tripDayDates(lead, days.length);
  const dayCount = tripDays(lead, plan);
  const cities = joinNames(tripCities(lead, plan));
  const tripLabel = `${dayCount ? `${dayCount}-day ` : ''}${cities ? `${cities} ` : 'China '}trip`;
  const summaryLine = tripSummaryLine(lead, plan);

  const intro = [
    'Hi,',
    `Thanks for telling me about your ${tripLabel}. Below is a first draft I put together with our trip-planning tool, based on the details you shared. I'll read through it myself within 48 hours and reply with anything I'd change.`,
    'If something doesn\'t suit the way you like to travel, just reply to this email.',
  ];

  const p = 'margin:0 0 14px;';
  const h = 'margin:26px 0 10px;font-size:16px;';
  const muted = 'color:#555;';

  const dayHtml = days.map((day, index) => {
    const lines = [
      day.morning && `<strong>Morning:</strong> ${esc(day.morning)}`,
      day.afternoon && `<strong>Afternoon:</strong> ${esc(day.afternoon)}`,
      day.evening && `<strong>Evening:</strong> ${esc(day.evening)}`,
      day.optional && `<strong>Optional if you have time:</strong> ${esc(day.optional)}`,
      day.transport && `<span style="${muted}">Getting around: ${esc(day.transport)}</span>`,
      day.food && `<span style="${muted}">Food: ${esc(day.food)}</span>`,
      day.notes && `<span style="${muted}">Note: ${esc(day.notes)}</span>`,
      tiananmenNote(day) && `<span style="${muted}">Tiananmen Square: ${esc(tiananmenNote(day))}</span>`,
    ].filter(Boolean);
    return `<p style="${p}"><strong>${esc(dayHeading(day, index, dates))}</strong><br>${lines.join('<br>')}</p>`;
  }).join('\n');

  const bodyHtml = `<p style="${p}">${esc(intro[0])}</p>
<p style="${p}">${esc(intro[1])}</p>
<p style="${p}">${esc(intro[2])}</p>
<h3 style="${h}">Do these first</h3>
<ol style="margin:0 0 14px;padding-left:22px;">
${items.map((item) => `<li style="margin:0 0 10px;"><strong>${esc(item.title)}.</strong> ${esc(item.body)}</li>`).join('\n')}
</ol>
<h3 style="${h}">Your day-by-day draft</h3>
${plan.summary ? `<p style="${p}">${esc(plan.summary)}</p>\n` : ''}${dayHtml}
<h3 style="${h}">A few questions so I can fine-tune this</h3>
<ol style="margin:0 0 14px;padding-left:22px;">
${questions.map((question) => `<li style="margin:0 0 8px;">${esc(question)}</li>`).join('\n')}
</ol>
<p style="${p}">Just reply with whatever you know so far. Rough answers are fine.</p>
<h3 style="${h}">Want me to take it further?</h3>
<p style="${p}">${esc(TRIP_PLAN_INTRO)}</p>
<p style="${p}">That's my Trip Plan service, $39 — <a href="${TRIP_PLAN_URL}" style="color:#155e63;">see what's included</a>.</p>
<p style="margin:22px 0 22px;">Lin<br>ChinaEase Buddy<br><a href="${SITE_URL}" style="color:#155e63;">${SITE_URL}</a></p>
<p style="margin:0 0 6px;font-size:12px;${muted}">What you told us: ${esc(summaryLine || 'no trip details yet')}</p>
<p style="margin:0;font-size:12px;${muted}">Please don't email passport numbers or payment card details. This email doesn't sign you up to any newsletter.</p>`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a;max-width:620px;margin:0 auto;padding:24px;">
${bodyHtml}
</body></html>`;

  const text = [
    ...intro.flatMap((line) => [line, '']),
    'DO THESE FIRST',
    ...items.map((item, index) => `${index + 1}. ${item.title}. ${item.body}`),
    '',
    'YOUR DAY-BY-DAY DRAFT',
    ...(plan.summary ? [plan.summary, ''] : []),
    ...days.flatMap((day, index) => [
      dayHeading(day, index, dates),
      ...(day.morning ? [`Morning: ${day.morning}`] : []),
      ...(day.afternoon ? [`Afternoon: ${day.afternoon}`] : []),
      ...(day.evening ? [`Evening: ${day.evening}`] : []),
      ...(day.optional ? [`Optional if you have time: ${day.optional}`] : []),
      ...(day.transport ? [`Getting around: ${day.transport}`] : []),
      ...(day.food ? [`Food: ${day.food}`] : []),
      ...(day.notes ? [`Note: ${day.notes}`] : []),
      ...(tiananmenNote(day) ? [`Tiananmen Square: ${tiananmenNote(day)}`] : []),
      '',
    ]),
    'A FEW QUESTIONS SO I CAN FINE-TUNE THIS',
    ...questions.map((question, index) => `${index + 1}. ${question}`),
    '',
    'Just reply with whatever you know so far. Rough answers are fine.',
    '',
    'WANT ME TO TAKE IT FURTHER?',
    TRIP_PLAN_INTRO,
    '',
    `That's my Trip Plan service, $39 — see what's included: ${TRIP_PLAN_URL}`,
    '',
    'Lin',
    'ChinaEase Buddy',
    SITE_URL,
    '',
    `What you told us: ${summaryLine || 'no trip details yet'}`,
    'Please don\'t email passport numbers or payment card details. This email doesn\'t sign you up to any newsletter.',
  ].join('\n');

  return { subject, html, text, bodyHtml, facts, items, questions };
}
