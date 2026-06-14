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
    'usage updates limited to counters',
    rules.includes('affectedKeys().hasOnly([')
      && rules.includes("'buddyAiQuotaUsed'")
      && rules.includes("'dailyBuddyAiUsed'")
      && rules.includes("'dailyResetAt'")
      && rules.includes("'menuScanQuotaUsed'"),
  ],
  [
    'buddy AI total use cannot decrease',
    rules.includes('request.resource.data.buddyAiQuotaUsed >= resource.data.buddyAiQuotaUsed'),
  ],
  [
    'menu scan use cannot decrease',
    rules.includes('request.resource.data.menuScanQuotaUsed >= resource.data.menuScanQuotaUsed'),
  ],
  [
    'daily AI cannot decrease within same reset window',
    rules.includes('request.resource.data.dailyResetAt == resource.data.dailyResetAt')
      && rules.includes('request.resource.data.dailyBuddyAiUsed >= resource.data.dailyBuddyAiUsed'),
  ],
  [
    'daily reset requires initial unused day or old reset older than 24h',
    rules.includes('resource.data.dailyResetAt <= currentMillis() - 86400000')
      && rules.includes('resource.data.dailyBuddyAiUsed == 0')
      && rules.includes('request.resource.data.dailyResetAt >= currentMillis() - 300000')
      && rules.includes('request.resource.data.dailyBuddyAiUsed == 1'),
  ],
  [
    'plan and quota totals remain unchanged on update',
    rules.includes('request.resource.data.plan == resource.data.plan')
      && rules.includes('request.resource.data.buddyAiQuotaTotal == resource.data.buddyAiQuotaTotal')
      && rules.includes('request.resource.data.menuScanQuotaTotal == resource.data.menuScanQuotaTotal')
      && rules.includes('request.resource.data.planExpiresAt == resource.data.planExpiresAt'),
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
