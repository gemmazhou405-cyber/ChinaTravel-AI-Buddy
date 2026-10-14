// Facts for the itinerary email that are computed in code, never left to the AI model:
// trip dates, Forbidden City ticket release time / Monday closure, and visa-free status.
// Visa data and rules come from the same source as the on-site visa checker.
import { evaluateVisaFree } from '../../src/lib/visaChecker.ts';
import {
  COUNTRY_NAMES,
  TRANSIT_240_COUNTRY_CODES,
  normalizeNationalityToIso,
} from '../../src/data/chinaVisaPolicies.ts';

const DAY_MS = 24 * 60 * 60 * 1000;
const FORBIDDEN_CITY_RE = /forbidden city|palace museum|故宫/i;
const BEIJING_RE = /beijing|北京/i;
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Parse a YYYY-MM-DD start date. Returns a UTC-midnight Date or null. */
export function parseTripStart(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.getUTCMonth() === Number(match[2]) - 1 ? date : null;
}

export function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

/** "Tue 27 Oct" */
export function shortDate(date) {
  return `${WEEKDAYS[date.getUTCDay()].slice(0, 3)} ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}

/** "Tuesday 20 October 2026" */
export function longDate(date) {
  return `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function tripDayDates(lead, dayCount) {
  const start = parseTripStart(lead.travelDate);
  if (!start) return [];
  return Array.from({ length: dayCount }, (_, index) => new Date(start.getTime() + index * DAY_MS));
}

function tripMentionsBeijing(lead, plan) {
  const fields = [
    lead.arrivalCity,
    ...(lead.destinationCities || []),
    ...(lead.cities || []),
    ...(plan?.daily_itinerary || []).map((day) => day.city),
  ];
  return fields.some((value) => typeof value === 'string' && BEIJING_RE.test(value));
}

function dayText(day) {
  return [day.city, day.morning, day.afternoon, day.evening, day.notes].filter(Boolean).join(' ');
}

/**
 * Forbidden City (Palace Museum): tickets for a given day go on sale 7 days earlier at 20:00
 * Beijing time, and the museum is closed on Mondays.
 */
export function forbiddenCityFacts(lead, plan, now = Date.now()) {
  if (!tripMentionsBeijing(lead, plan)) return null;
  const days = plan?.daily_itinerary || [];
  const dates = tripDayDates(lead, days.length || Number(lead.tripLength) || 0);
  const dayIndex = days.findIndex((day) => FORBIDDEN_CITY_RE.test(dayText(day)));
  const visitDate = dayIndex >= 0 && dates[dayIndex] ? dates[dayIndex] : null;
  if (!visitDate) {
    return { inPlan: dayIndex >= 0, dayIndex, visitDate: null, hasDates: dates.length > 0 };
  }
  const releaseDay = new Date(visitDate.getTime() - 7 * DAY_MS);
  // 20:00 Beijing time (UTC+8, no daylight saving) = 12:00 UTC the same calendar day.
  const releaseAt = new Date(releaseDay.getTime() + 12 * 60 * 60 * 1000);
  return {
    inPlan: true,
    dayIndex,
    hasDates: true,
    visitDate,
    visitDateIso: isoDate(visitDate),
    isMonday: visitDate.getUTCDay() === 1,
    releaseDate: releaseDay,
    releaseDateIso: isoDate(releaseDay),
    releaseAtUtcIso: releaseAt.toISOString(),
    alreadyOnSale: releaseAt.getTime() <= now,
  };
}

function todayIso(now) {
  // China calendar date.
  return new Date(now + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * Visa status from the optional passport country on the form. Without one, the departure
 * country is used as a guess, and the email states that assumption so it can be corrected.
 */
export function visaFacts(lead, now = Date.now()) {
  const fromPassport = typeof lead.passportCountry === 'string' && Boolean(lead.passportCountry.trim());
  const raw = fromPassport ? lead.passportCountry : lead.departureCountry;
  if (typeof raw !== 'string' || !raw.trim()) return { status: 'unknown' };
  const code = normalizeNationalityToIso(raw);
  if (!code || code === 'ZZ') return { status: 'unknown', input: raw.trim().slice(0, 60) };
  const countryName = COUNTRY_NAMES[code] || raw.trim();
  if (['CN', 'HK', 'MO', 'TW'].includes(code)) {
    return { status: 'not_applicable', code, countryName };
  }
  const start = parseTripStart(lead.travelDate);
  const entryDate = start ? isoDate(start) : todayIso(now);
  const stayDays = Math.min(Math.max(Number(lead.tripLength) || 7, 1), 180);
  const result = evaluateVisaFree({
    nationalityCode: code,
    passportType: 'ordinary',
    entryDate,
    purpose: 'tourism',
    stayDays,
    tripType: 'mainland_visit',
    originCountryOrRegion: '',
    onwardCountryOrRegion: '',
  });
  const transitEligible = TRANSIT_240_COUNTRY_CODES.includes(code);
  // Whole days from today (China calendar) to the first trip day.
  const daysUntilTrip = start ? Math.round((start.getTime() - Date.parse(`${todayIso(now)}T00:00:00Z`)) / DAY_MS) : null;
  const base = {
    code,
    countryName,
    stayDays,
    entryDateKnown: Boolean(start),
    policyType: result.policyType,
    maximumStay: result.maximumStay,
    policyValidity: result.policyValidity,
    sourceUrl: result.sources[0]?.url || null,
    transitEligible,
    basis: fromPassport ? 'passport' : 'departure',
    daysUntilTrip,
  };
  if (result.category === 'likely_eligible') {
    return { ...base, status: result.policyType === 'mutual_agreement' ? 'visa_free_mutual' : 'visa_free_30' };
  }
  if (result.category === 'date_unconfirmed') return { ...base, status: 'policy_expires_before_trip' };
  if (['unilateral_30_day', 'mutual_agreement'].includes(result.policyType)) return { ...base, status: 'stay_too_long' };
  return { ...base, status: 'visa_required' };
}
