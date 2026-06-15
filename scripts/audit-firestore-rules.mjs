import { readFileSync } from 'node:fs';

const rules = readFileSync('firestore.rules', 'utf8');

const checks = [
  [
    'reject broad users read/write',
    !/match \/users\/\{userId\}[\s\S]*?allow read, write:/.test(rules),
  ],
  [
    'free user create requires auth email match',
    rules.includes('request.auth.token.email is string')
      && rules.includes('userData().email == request.auth.token.email')
      && rules.includes('userData().uid == userId'),
  ],
  [
    'user cannot create paid plan',
    rules.includes("userData().plan == 'free'")
      && rules.includes('userData().buddyAiQuotaTotal == 5')
      && rules.includes('userData().menuScanQuotaTotal == 3'),
  ],
  [
    'users client updates denied',
    /match \/users\/\{userId\}[\s\S]*?allow update: if false;/.test(rules),
  ],
  [
    'usageRequests server-write only and own reads only',
    rules.includes('match /usageRequests/{requestId}')
      && rules.includes('resource.data.userId == request.auth.uid')
      && rules.includes('allow create, update, delete: if false;'),
  ],
  [
    'client cannot directly edit sensitive user counters or entitlements',
    !rules.includes('request.resource.data.buddyAiQuotaUsed >= resource.data.buddyAiQuotaUsed')
      && !rules.includes('request.resource.data.menuScanQuotaUsed >= resource.data.menuScanQuotaUsed')
      && !rules.includes('request.resource.data.dailyBuddyAiUsed >= resource.data.dailyBuddyAiUsed'),
  ],
  [
    'orders client writes denied and own reads only',
    rules.includes('match /orders/{orderId}')
      && rules.includes('resource.data.userId == request.auth.uid')
      && rules.includes('allow create, update, delete: if false;'),
  ],
  [
    'entitlements client writes denied and own reads only',
    rules.includes('match /entitlements/{userId}')
      && rules.includes('request.auth.uid == userId')
      && rules.includes('allow create, update, delete: if false;'),
  ],
  [
    'paypalWebhookEvents fully denied',
    rules.includes('match /paypalWebhookEvents/{eventId}')
      && rules.includes('allow read, create, update, delete: if false;'),
  ],
  [
    'newsletterLeads fully denied',
    rules.includes('match /newsletterLeads/{leadId}')
      && rules.includes('allow read, create, update, delete: if false;'),
  ],
  [
    'analytics create-only rule preserved',
    rules.includes('match /analyticsEvents/{eventId}')
      && rules.includes('allow create: if validAnalyticsEvent();')
      && rules.includes('allow read, update, delete: if false;'),
  ],
  [
    'analytics launch funnel events allowed',
    [
      'signup_started',
      'signup_completed',
      'buddy_first_success',
      'menu_scan_first_success',
      'quota_exhausted',
      'checkout_created',
      'payment_completed',
      'newsletter_subscribed',
      'app_error',
    ].every((eventName) => rules.includes(`'${eventName}'`))
      && rules.includes("'errorType'")
      && rules.includes("'quotaType'")
      && rules.includes("'method'")
      && rules.includes("'status'"),
  ],
  [
    'paymentClaims use canonical pass plan IDs',
    rules.includes("paymentClaimData().plan in ['trip_pass', 'group_pass']")
      && !rules.includes("paymentClaimData().plan in ['trip', 'group']"),
  ],
];

let ok = true;
for (const [name, pass] of checks) {
  console.log(`${pass ? 'PASS' : 'FAIL'} - ${name}`);
  ok &&= pass;
}

if (!ok) process.exit(1);
