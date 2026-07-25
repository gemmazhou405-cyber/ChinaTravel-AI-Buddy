export const TIERS = {
  trip:  { messageAllowance: 50,  validDays: 14, maxDevices: 2 },
  group: { messageAllowance: 200, validDays: 14, maxDevices: 5 },
};

export function getTier(tierId) {
  return TIERS[tierId] || null;
}

export function expiresAtFrom(startMs, validDays) {
  return startMs + validDays * 24 * 60 * 60 * 1000;
}
