import { TRANSIT_240_COUNTRY_CODES } from '../data/chinaVisaPolicies.ts';

export type TransitCalculatorInput = {
  arrivalLocal: string;
  entryCity: string;
  passportNationalityCode: string;
  originRegion: string;
  onwardRegion: string;
};

export type TransitEligibilityStatus =
  | 'basic_requirements_match'
  | 'nationality_not_eligible'
  | 'route_pattern_invalid'
  | 'nationality_required';

export type TransitCalculatorResult = {
  clockStartIso: string;
  deadlineExclusiveIso: string;
  planningLatestIso: string;
  clockStartLabel: string;
  deadlineExclusiveLabel: string;
  planningLatestLabel: string;
  hasThirdRegionRoutePattern: boolean;
  isPassportNationalityEligible: boolean | null;
  eligibilityStatus: TransitEligibilityStatus;
};

export type TransitRouteExample = {
  id: string;
  label: string;
  passportNationality: string;
  passportNationalityCode: string;
  originRegion: string;
  onwardRegion: string;
};

export const COMMON_TRANSIT_ROUTE_EXAMPLES: readonly TransitRouteExample[] = [
  { id: 'uk-japan', label: 'UK → Mainland China → Japan', passportNationality: 'United Kingdom', passportNationalityCode: 'GB', originRegion: 'GB', onwardRegion: 'JP' },
  { id: 'us-hong-kong', label: 'US → Mainland China → Hong Kong', passportNationality: 'United States', passportNationalityCode: 'US', originRegion: 'US', onwardRegion: 'HK' },
  { id: 'singapore-south-korea', label: 'Singapore → Mainland China → South Korea', passportNationality: 'Singapore', passportNationalityCode: 'SG', originRegion: 'SG', onwardRegion: 'KR' },
  { id: 'australia-thailand', label: 'Australia → Mainland China → Thailand', passportNationality: 'Australia', passportNationalityCode: 'AU', originRegion: 'AU', onwardRegion: 'TH' },
];

const CHINA_TIME_ZONE = 'Asia/Shanghai';
const HOURS_240_MS = 240 * 60 * 60 * 1000;

function parseChinaLocalDateTime(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error('invalid_arrival');

  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const calendarCheck = new Date(Date.UTC(year, month - 1, day, hour, minute));

  if (
    month < 1 || month > 12 || day < 1 || hour > 23 || minute > 59 ||
    calendarCheck.getUTCFullYear() !== year ||
    calendarCheck.getUTCMonth() !== month - 1 ||
    calendarCheck.getUTCDate() !== day
  ) {
    throw new Error('invalid_arrival');
  }

  return { year, month, day };
}
function formatChinaDateTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: CHINA_TIME_ZONE,
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

export function calculateTransitDeadline(input: TransitCalculatorInput): TransitCalculatorResult {
  const { year, month, day } = parseChinaLocalDateTime(input.arrivalLocal);
  if (!input.entryCity.trim() || !input.originRegion || !input.onwardRegion) {
    throw new Error('missing_fields');
  }

  // The NIA clock begins at 00:00 China Standard Time on the day after entry.
  const clockStart = new Date(Date.UTC(year, month - 1, day + 1, -8));
  const deadlineExclusive = new Date(clockStart.getTime() + HOURS_240_MS);
  const planningLatest = new Date(deadlineExclusive.getTime() - 60 * 1000);
  const hasThirdRegionRoutePattern =
    input.originRegion !== input.onwardRegion &&
    input.originRegion !== 'CN' &&
    input.onwardRegion !== 'CN';
  const isPassportNationalityEligible = input.passportNationalityCode
    ? (TRANSIT_240_COUNTRY_CODES as readonly string[]).includes(input.passportNationalityCode)
    : null;
  const eligibilityStatus: TransitEligibilityStatus = !hasThirdRegionRoutePattern
    ? 'route_pattern_invalid'
    : isPassportNationalityEligible === null
      ? 'nationality_required'
      : isPassportNationalityEligible
        ? 'basic_requirements_match'
        : 'nationality_not_eligible';

  return {
    clockStartIso: clockStart.toISOString(),
    deadlineExclusiveIso: deadlineExclusive.toISOString(),
    planningLatestIso: planningLatest.toISOString(),
    clockStartLabel: formatChinaDateTime(clockStart),
    deadlineExclusiveLabel: formatChinaDateTime(deadlineExclusive),
    planningLatestLabel: formatChinaDateTime(planningLatest),
    hasThirdRegionRoutePattern,
    isPassportNationalityEligible,
    eligibilityStatus,
  };
}
