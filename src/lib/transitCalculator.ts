export type TransitCalculatorInput = {
  arrivalLocal: string;
  entryCity: string;
  originRegion: string;
  onwardRegion: string;
};

export type TransitCalculatorResult = {
  clockStartIso: string;
  deadlineExclusiveIso: string;
  planningLatestIso: string;
  clockStartLabel: string;
  deadlineExclusiveLabel: string;
  planningLatestLabel: string;
  hasThirdRegionRoutePattern: boolean;
};

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

  return {
    clockStartIso: clockStart.toISOString(),
    deadlineExclusiveIso: deadlineExclusive.toISOString(),
    planningLatestIso: planningLatest.toISOString(),
    clockStartLabel: formatChinaDateTime(clockStart),
    deadlineExclusiveLabel: formatChinaDateTime(deadlineExclusive),
    planningLatestLabel: formatChinaDateTime(planningLatest),
    hasThirdRegionRoutePattern,
  };
}
