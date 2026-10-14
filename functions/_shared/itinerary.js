import { shortDate, tripDayDates } from './trip-facts.js';

const ITINERARY_TIMEOUT_MS = 45000;

function timeoutSignal(ms) {
  if (typeof AbortSignal.timeout === 'function') return AbortSignal.timeout(ms);
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

function cleanString(value, max = 1200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function cleanList(value, maxItems = 12) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string').map((item) => cleanString(item, 160)).filter(Boolean).slice(0, maxItems)
    : [];
}

function normalisePlan(value) {
  if (!value || typeof value !== 'object') return null;
  const days = Array.isArray(value.daily_itinerary)
    ? value.daily_itinerary.map((item) => ({
        day: cleanString(item?.day, 30),
        city: cleanString(item?.city, 80),
        morning: cleanString(item?.morning, 300),
        afternoon: cleanString(item?.afternoon, 300),
        evening: cleanString(item?.evening, 300),
        transport: cleanString(item?.transport, 300),
        food: cleanString(item?.food, 240),
        notes: cleanString(item?.notes, 300),
      })).filter((item) => item.day || item.city || item.morning || item.afternoon || item.evening).slice(0, 21)
    : [];
  if (!days.length) return null;
  return {
    title: cleanString(value.title, 160) || 'Your China trip plan',
    summary: cleanString(value.summary, 900),
    daily_itinerary: days,
    transport: cleanList(value.transport, 8),
    preparation: cleanList(value.preparation, 12),
    personalised_notes: cleanList(value.personalised_notes, 12),
    verify_before_booking: cleanList(value.verify_before_booking, 8),
  };
}

function parsePlanContent(content) {
  if (typeof content !== 'string' || !content.trim()) return null;
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  try {
    return normalisePlan(JSON.parse(cleaned));
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try {
      return normalisePlan(JSON.parse(cleaned.slice(start, end + 1)));
    } catch {
      return null;
    }
  }
}

async function callDeepSeekDirect(env, messages) {
  if (!env.DEEPSEEK_API_KEY) return { ok: false, errorCode: 'missing_config' };
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.DEEPSEEK_ITINERARY_MODEL || 'deepseek-chat',
        messages,
        response_format: { type: 'json_object' },
        max_tokens: 5000,
        stream: false,
      }),
      signal: timeoutSignal(ITINERARY_TIMEOUT_MS),
    });
    if (!response.ok) return { ok: false, errorCode: response.status >= 500 ? 'provider_error' : 'provider_rejected' };
    const data = await response.json();
    const plan = parsePlanContent(data?.choices?.[0]?.message?.content);
    return plan ? { ok: true, plan } : { ok: false, errorCode: 'invalid_plan' };
  } catch (error) {
    if (error?.name === 'AbortError' || error?.name === 'TimeoutError') return { ok: false, errorCode: 'provider_timeout' };
    return { ok: false, errorCode: 'unknown_error' };
  }
}

async function callExistingBuddyProxy(env, systemPrompt, userPrompt, requestId) {
  if (!env.COZE_WORKER_URL) return { ok: false, errorCode: 'missing_config' };
  const workerBase = env.COZE_WORKER_URL.replace(/\/+$/, '');
  const endpoint = workerBase.endsWith('/coze')
    ? `${workerBase.slice(0, -'/coze'.length)}/trip-plan`
    : `${workerBase}/trip-plan`;
  const headers = { 'Content-Type': 'application/json' };
  if (env.COZE_INTERNAL_SECRET) headers['X-ChinaEase-Internal-Token'] = env.COZE_INTERNAL_SECRET;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        systemPrompt,
        userPrompt,
        requestId: requestId || crypto.randomUUID(),
      }),
      signal: timeoutSignal(ITINERARY_TIMEOUT_MS),
    });
    if (!response.ok) return { ok: false, errorCode: response.status >= 500 ? 'provider_error' : 'provider_rejected' };
    const data = await response.json();
    const plan = normalisePlan(data?.plan);
    return plan ? { ok: true, plan } : { ok: false, errorCode: data?.code || 'invalid_plan' };
  } catch (error) {
    if (error?.name === 'AbortError' || error?.name === 'TimeoutError') return { ok: false, errorCode: 'provider_timeout' };
    return { ok: false, errorCode: 'unknown_error' };
  }
}

// Rules every generated plan must follow. They are stated in the prompt and then enforced in
// code (enforcePlanRules) because the model does not always comply.
const PLAN_RULES = [
  'Never schedule a day trip whose one-way travel time is more than 1.5 hours (for example the Great Wall from Beijing) on the arrival day (Day 1) or the departure day (the last day).',
  'Do not recommend or mention VPNs. For internet access, suggest buying a roaming eSIM before departure.',
  'Do not mention COVID-19, PCR tests, health codes or any pandemic-era entry requirements.',
  'Do not use absolute wording such as "guaranteed", "guarantee", "100%", "always open" or "never sells out".',
  'The Forbidden City (Palace Museum) is closed on Mondays; never place it on a Monday.',
  'Do not state visa rules, ticket release times or prices; those are added separately.',
];

// Day trips that take more than ~1.5 hours each way from the usual base city.
const LONG_DAY_TRIP_RE = /great wall|mutianyu|badaling|jinshanling|simatai|jiankou|huangyaguan|gubeikou|gubei water town|chengde|mount hua\b|huashan|hua shan|pingyao|shaolin|longmen grottoes|mount emei|emeishan|leshan|jiuzhaigou|huangshan|yellow mountain|longji|longsheng|dragon'?s backbone|wuzhen|xitang|zhouzhuang|tongli|qiandao lake|putuo|zhangjiajie national forest|tianmen mountain|fenghuang/i;
const BANNED_SENTENCE_RE = /\bvpns?\b|virtual private network|covid|coronavirus|pandemic|\bpcr\b|health code|quarantine|nucleic acid/i;
const ABSOLUTE_RE = /\bguarantee[sd]?\b|\b100\s?%|\bnever sells? out\b|\balways open\b|\bno risk\b|\brisk-free\b/i;
const FORBIDDEN_CITY_RE = /forbidden city|palace museum/i;
const ACTIVITY_FIELDS = ['morning', 'afternoon', 'evening', 'transport', 'food', 'notes'];

function cleanSentences(text) {
  if (!text) return text;
  const sentences = text.split(/(?<=[.!?])\s+/);
  const kept = sentences.filter((sentence) => !BANNED_SENTENCE_RE.test(sentence) && !ABSOLUTE_RE.test(sentence));
  return kept.join(' ').trim();
}

function dayActivityText(day) {
  return ACTIVITY_FIELDS.slice(0, 3).map((field) => day[field]).join(' ');
}

function sameCity(a, b) {
  return (a.city || '').trim().toLowerCase() === (b.city || '').trim().toLowerCase();
}

// Arrival/departure logistics ("land", "check in", "pack", "fly home") stay on their own day when
// activities are swapped between days.
const LOGISTICS_RE = /\b(arriv\w*|land(s|ing)?|check[- ]?(in|out)|fly|flight|depart\w*|airport|pack(ing)?|leave for)\b/i;

function swapActivities(days, i, j) {
  const a = days[i];
  const b = days[j];
  for (const field of ACTIVITY_FIELDS) {
    if (LOGISTICS_RE.test(a[field] || '') || LOGISTICS_RE.test(b[field] || '')) continue;
    [a[field], b[field]] = [b[field], a[field]];
  }
}

function isEdgeDay(days, index) {
  return index === 0 || index === days.length - 1;
}

function dayViolations(days, index, dates) {
  const issues = [];
  if (isEdgeDay(days, index) && LONG_DAY_TRIP_RE.test(dayActivityText(days[index]))) issues.push('long_day_trip_on_travel_day');
  if (dates[index]?.getUTCDay() === 1 && FORBIDDEN_CITY_RE.test(dayActivityText(days[index]))) issues.push('forbidden_city_on_monday');
  return issues;
}

/**
 * Enforce PLAN_RULES on a normalised plan. Returns a new plan plus a list of the adjustments
 * made, which are reported in the internal lead notification.
 */
export function enforcePlanRules(plan, lead) {
  if (!plan) return { plan, adjustments: [] };
  const next = JSON.parse(JSON.stringify(plan));
  const adjustments = [];
  const days = next.daily_itinerary;

  // 1. Wording rules (VPN, COVID, absolute claims) on every string.
  let removedSentences = 0;
  for (const day of days) {
    for (const field of ACTIVITY_FIELDS) {
      const cleaned = cleanSentences(day[field]);
      if (cleaned !== day[field]) removedSentences += 1;
      day[field] = cleaned;
    }
  }
  for (const key of ['summary']) {
    const cleaned = cleanSentences(next[key]);
    if (cleaned !== next[key]) removedSentences += 1;
    next[key] = cleaned;
  }
  for (const key of ['transport', 'preparation', 'personalised_notes', 'verify_before_booking']) {
    const before = next[key].length;
    next[key] = next[key].map(cleanSentences).filter(Boolean);
    removedSentences += before - next[key].length;
  }
  if (removedSentences) adjustments.push(`removed ${removedSentences} sentence(s) mentioning VPN/COVID or absolute claims`);

  // 2. Scheduling rules: move long day trips off arrival/departure days and the Forbidden City off Mondays.
  const dates = tripDayDates(lead, days.length);
  for (let index = 0; index < days.length; index += 1) {
    if (!dayViolations(days, index, dates).length) continue;
    const before = dayViolations(days, index, dates).join(', ');
    // Prefer the nearest day in the same city so the route changes as little as possible.
    const candidates = days.map((_, j) => j)
      .filter((j) => j !== index && sameCity(days[j], days[index]))
      .sort((a, b) => Math.abs(a - index) - Math.abs(b - index));
    const target = candidates.find((j) => {
      swapActivities(days, index, j);
      const ok = !dayViolations(days, index, dates).length && !dayViolations(days, j, dates).length;
      swapActivities(days, index, j);
      return ok;
    }) ?? -1;
    if (target >= 0) {
      swapActivities(days, index, target);
      adjustments.push(`${before}: swapped ${days[index].day || `day ${index + 1}`} with ${days[target].day || `day ${target + 1}`}`);
      continue;
    }
    // No safe swap: replace the offending activities with a light plan for that day.
    const issues = dayViolations(days, index, dates);
    const isArrival = index === 0;
    for (const field of ['morning', 'afternoon', 'evening']) {
      const text = days[index][field] || '';
      const longTrip = issues.includes('long_day_trip_on_travel_day') && LONG_DAY_TRIP_RE.test(text);
      const mondayPalace = issues.includes('forbidden_city_on_monday') && FORBIDDEN_CITY_RE.test(text);
      if (longTrip || mondayPalace) {
        days[index][field] = mondayPalace && !longTrip
          ? 'The Forbidden City is closed on Mondays. Explore Jingshan Park and the hutongs nearby instead.'
          : isArrival
            ? 'Keep this part of your arrival day light: settle in and explore near your hotel.'
            : 'Keep this part of your departure day light and leave plenty of time to reach the airport or station.';
      }
    }
    adjustments.push(`${before}: no safe swap, replaced with a lighter plan on ${days[index].day || `day ${index + 1}`}`);
  }

  return { plan: next, adjustments };
}

function dayDateHints(lead) {
  const length = Math.min(Math.max(Number(lead.tripLength) || 0, 0), 21);
  const dates = tripDayDates(lead, length);
  return dates.map((date, index) => {
    const role = index === 0 ? ' (arrival day)' : index === dates.length - 1 ? ' (departure day)' : '';
    return `Day ${index + 1}: ${shortDate(date)}${role}`;
  });
}

export async function generateTripPlan(env, lead) {
  const input = {
    travel_date: lead.travelDate || null,
    travelers: lead.travelers || null,
    trip_length_days: lead.tripLength || null,
    departure_country: lead.departureCountry || null,
    passport_country: lead.passportCountry || null,
    first_arrival_city: lead.arrivalCity || null,
    cities_considered: lead.destinationCities || [],
    priorities: lead.priorities || [],
    concerns: lead.concerns || [],
    additional_help: lead.helpWith || null,
    day_dates: dayDateHints(lead),
  };
  const systemPrompt = `You are ChinaEase Buddy's travel planning assistant. Create a practical first-draft China itinerary for a foreign visitor. Use only the information supplied by the user. Do not invent visa eligibility, live prices, opening hours, ticket availability, medical advice, or bookings; put anything that must be checked in verify_before_booking. Return JSON only, matching this exact shape:
{"title":"...","summary":"...","daily_itinerary":[{"day":"Day 1","city":"...","morning":"...","afternoon":"...","evening":"...","transport":"...","food":"...","notes":"..."}],"transport":["..."],"preparation":["..."],"personalised_notes":["..."],"verify_before_booking":["..."]}
Make each day specific and useful. If the user has not chosen enough cities, build a sensible route around the arrival city and clearly label assumptions. When day_dates is provided, plan each day for that date and weekday. Use concise English suitable for an email.
Rules you must follow:
${PLAN_RULES.map((rule) => `- ${rule}`).join('\n')}
Keep every morning, afternoon, evening, transport, food, and notes value under 140 characters so the complete JSON response is not truncated.`;
  const userPrompt = `Create the JSON trip plan for this traveller:\n${JSON.stringify(input)}`;
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  // Prefer a dedicated key when configured. If the website does not have one,
  // reuse the already-configured DeepSeek proxy that powers Ask Buddy.
  const directResult = await callDeepSeekDirect(env, messages);
  const result = directResult.ok
    ? directResult
    : await callExistingBuddyProxy(env, systemPrompt, userPrompt, lead.requestId);
  if (!result.ok) return { ok: false, errorCode: result.errorCode || directResult.errorCode };
  const enforced = enforcePlanRules(result.plan, lead);
  return { ok: true, plan: enforced.plan, adjustments: enforced.adjustments };
}
