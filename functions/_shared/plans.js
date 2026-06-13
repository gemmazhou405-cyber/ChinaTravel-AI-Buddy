export const PAYMENT_MODES = ['manual', 'sandbox', 'live'];

export const MANUAL_PAYPAL_LINKS = {
  trip_pass: 'https://www.paypal.com/ncp/payment/863ZKSY6RJ64J',
  group_pass: 'https://www.paypal.com/ncp/payment/CL8J5WJVK3TAJ',
};

export const PLAN_CATALOG = {
  trip_pass: {
    id: 'trip_pass',
    userPlan: 'trip',
    name: 'Trip Pass',
    price: '9.90',
    amountCents: 990,
    currency: 'USD',
    aiLimit: 50,
    scanLimit: 20,
    dailyBuddyAiLimit: 20,
    durationDays: 7,
    itemName: 'ChinaEase Buddy Trip Pass',
  },
  group_pass: {
    id: 'group_pass',
    userPlan: 'group',
    name: 'Group Pass',
    price: '29.90',
    amountCents: 2990,
    currency: 'USD',
    aiLimit: 200,
    scanLimit: 100,
    dailyBuddyAiLimit: 50,
    durationDays: 14,
    itemName: 'ChinaEase Buddy Group Pass',
  },
};

export function paymentMode(env) {
  const mode = env.PAYMENT_MODE || env.VITE_PAYMENT_MODE || 'manual';
  return PAYMENT_MODES.includes(mode) ? mode : 'manual';
}

export function paypalBaseUrl(env) {
  const paypalEnv = env.PAYPAL_ENV || (paymentMode(env) === 'live' ? 'live' : 'sandbox');
  return paypalEnv === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

export function getPlan(planId) {
  return PLAN_CATALOG[planId] || null;
}

export function expiresAtFrom(startMs, durationDays) {
  return startMs + durationDays * 24 * 60 * 60 * 1000;
}

export function hasActivePaidPass(userDoc, now = Date.now()) {
  if (!userDoc || !['trip', 'group'].includes(userDoc.plan)) return false;
  return !userDoc.planExpiresAt || userDoc.planExpiresAt > now;
}
