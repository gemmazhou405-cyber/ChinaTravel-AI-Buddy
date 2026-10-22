export const TRIP_COST_STYLES = Object.freeze({
  budget: Object.freeze({ label: 'Budget', minimum: 350, maximum: 650, openEnded: false }),
  'mid-range': Object.freeze({ label: 'Mid-range', minimum: 800, maximum: 1500, openEnded: false }),
  comfortable: Object.freeze({ label: 'Comfortable', minimum: 1800, maximum: 3000, openEnded: true }),
});

function boundedCount(value, maximum) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(maximum, Math.max(1, Math.trunc(number))) : 1;
}

export function estimateTripCost(days, travelers, style) {
  const validStyle = Object.hasOwn(TRIP_COST_STYLES, style) ? style : 'mid-range';
  const range = TRIP_COST_STYLES[validStyle];
  const validDays = boundedCount(days, 60);
  const validTravelers = boundedCount(travelers, 20);
  return {
    days: validDays,
    travelers: validTravelers,
    style: validStyle,
    label: range.label,
    dailyMinimum: range.minimum,
    dailyMaximum: range.maximum,
    perPersonMinimum: range.minimum * validDays,
    perPersonMaximum: range.maximum * validDays,
    groupMinimum: range.minimum * validDays * validTravelers,
    groupMaximum: range.maximum * validDays * validTravelers,
    openEnded: range.openEnded,
  };
}

export function formatTripCostRange(minimum, maximum, openEnded = false) {
  return `RMB ${minimum.toLocaleString('en-US')}–${maximum.toLocaleString('en-US')}${openEnded ? '+' : ''}`;
}
