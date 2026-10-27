// Real admin handler + Firestore REST adapter, with every network request intercepted.
// No production collection, email, checkout, or secret is accessed.
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { onRequest } from '../functions/api/admin/growth-summary.js';
import { MAX_RECORDS_PER_COLLECTION, PAGE_SIZE, buildGrowthSummary } from '../functions/_shared/growth-summary.js';
import { fromFirestoreDocument, toFirestoreDocument } from '../functions/_shared/firestore.js';

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 9, 27, 12);
const READ_TIME = new Date(NOW).toISOString();
const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});
const env = {
  ADMIN_SECRET: 'local-growth-report-test-secret',
  FIREBASE_PROJECT_ID: 'growth-report-test',
  FIREBASE_CLIENT_EMAIL: 'report@growth-report-test.iam.gserviceaccount.com',
  FIREBASE_PRIVATE_KEY: privateKey,
};
const databaseRoot = `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const collections = { analyticsEvents: [], tripLeads: [], gumroadSales: [] };
const requests = [];
let failure = false;
let counter = 0;
const originalFetch = globalThis.fetch;
const originalNow = Date.now;
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json' },
});
const valueAt = (object, path) => path.split('.').reduce((value, key) => value?.[key], object);
function setAt(object, path, value) {
  const keys = path.split('.');
  let target = object;
  for (const key of keys.slice(0, -1)) target = target[key] ??= {};
  target[keys.at(-1)] = value;
}
function reset() {
  for (const key of Object.keys(collections)) collections[key] = [];
  requests.length = 0;
  failure = false;
  counter = 0;
}
function add(collection, data, id = `private-document-${String(++counter).padStart(5, '0')}`) {
  collections[collection].push({ name: `${databaseRoot}/${collection}/${id}`, data });
}
function event(eventName, extra = {}, at = NOW - DAY) {
  add('analyticsEvents', { event: eventName, environment: 'production', createdAt: at, ...extra });
}
function filterMatches(filter, data) {
  if (filter.compositeFilter) return filter.compositeFilter.filters.every((entry) => filterMatches(entry, data));
  const { field, op, value } = filter.fieldFilter;
  const stored = valueAt(data, field.fieldPath);
  const wanted = fromFirestoreDocument({ fields: { wanted: value } }).wanted;
  if (typeof stored !== typeof wanted) return false;
  if (op === 'GREATER_THAN_OR_EQUAL') return stored >= wanted;
  if (op === 'LESS_THAN') return stored < wanted;
  if (op === 'EQUAL') return stored === wanted;
  throw new Error(`Unimplemented query operation: ${op}`);
}

globalThis.fetch = async (input, init = {}) => {
  const url = new URL(String(input));
  if (url.hostname === 'oauth2.googleapis.com') return json({ access_token: 'local-read-token', expires_in: 3600 });
  assert.equal(url.hostname, 'firestore.googleapis.com', 'no unmocked network destination');
  assert.ok(url.pathname.endsWith('/documents:runQuery'), 'the report uses read-only queries, never Firestore writes');
  assert.equal(init.method, 'POST', 'runQuery uses its documented transport method');
  const body = JSON.parse(init.body);
  requests.push(body);
  if (failure) return json({ error: 'leak@example.test +13125551212 SALE-PRIVATE-DO-NOT-RETURN REQUEST-PRIVATE-DO-NOT-RETURN' }, 503);
  const query = body.structuredQuery;
  const collection = query.from[0].collectionId;
  assert.ok(Object.hasOwn(collections, collection));
  assert.ok(Number.isInteger(query.limit) && query.limit >= 1 && query.limit <= PAGE_SIZE, 'page size is bounded');
  const dateField = collection === 'gumroadSales' ? 'receivedAt' : 'createdAt';
  assert.equal(query.where?.compositeFilter?.op, 'AND');
  const dateFilters = query.where.compositeFilter.filters.map(({ fieldFilter }) => fieldFilter);
  assert.equal(dateFilters.length, 2, 'one numeric date-range index is sufficient');
  assert.deepEqual(dateFilters.map(({ field, op, value }) => ({
    field: field.fieldPath, op, value: fromFirestoreDocument({ fields: { value } }).value,
  })), [
    { field: dateField, op: 'GREATER_THAN_OR_EQUAL', value: NOW - 30 * DAY },
    { field: dateField, op: 'LESS_THAN', value: NOW },
  ], 'the database query reads only the necessary thirty-day cohort');
  assert.deepEqual(query.orderBy.map(({ field }) => field.fieldPath), [dateField, '__name__'], 'ties use deterministic document-name ordering');
  const projection = query.select?.fields.map(({ fieldPath }) => fieldPath);
  assert.ok(projection?.includes(dateField), 'only required projected fields are read, including cursor timestamp');
  for (const field of projection) assert.doesNotMatch(field, /^(email|phone|whatsapp|saleId|requestId|ipHash|emailHash|generatedPlan|passId)$/i, 'PII and identifiers are not selected');
  let documents = collections[collection].filter(({ data }) => filterMatches(query.where, data));
  documents.sort((left, right) => left.data[dateField] - right.data[dateField] || left.name.localeCompare(right.name));
  if (query.startAt) {
    assert.equal(query.startAt.before, false, 'pagination starts after the previous record');
    assert.equal(query.startAt.values.length, 2, 'cursor covers the timestamp tie-breaker');
    assert.equal(body.readTime, READ_TIME, 'later pages use the first page snapshot');
    const [date, reference] = query.startAt.values;
    const cursorDate = fromFirestoreDocument({ fields: { date } }).date;
    assert.equal(typeof reference.referenceValue, 'string');
    documents = documents.filter((row) => row.data[dateField] > cursorDate || (row.data[dateField] === cursorDate && row.name > reference.referenceValue));
  }
  documents = documents.slice(0, query.limit);
  return json(documents.length ? documents.map(({ name, data }) => {
    const projected = {};
    for (const field of projection) {
      const value = valueAt(data, field);
      if (value !== undefined) setAt(projected, field, value);
    }
    return { document: { name, ...toFirestoreDocument(projected) }, readTime: READ_TIME };
  }) : [{ readTime: READ_TIME }]);
};
Date.now = () => NOW;

async function report({ authorization = `Bearer ${env.ADMIN_SECRET}`, environment = env, method = 'GET' } = {}) {
  const headers = authorization === null ? {} : { Authorization: authorization };
  const response = await onRequest({ request: new Request('https://chinaeasebuddy.com/api/admin/growth-summary', { method, headers }), env: environment });
  assert.match(response.headers.get('Cache-Control') || '', /no-store/, 'successes and failures are never cached');
  return { response, body: await response.json() };
}
function assertNoIdentity(body) {
  const serialized = JSON.stringify(body);
  for (const forbidden of ['leak@example.test', '+13125551212', '+1 (312) 555-1212', 'SALE-PRIVATE-DO-NOT-RETURN', 'REQUEST-PRIVATE-DO-NOT-RETURN', 'IP-HASH-PRIVATE', 'Jane-Smith', 'private-document-']) {
    assert.ok(!serialized.includes(forbidden), `response never contains ${forbidden}`);
  }
  const walk = (value) => {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      assert.ok(!['email', 'phone', 'whatsapp', 'saleId', 'requestId', 'ipHash', 'emailHash', 'documents', 'cursor', 'passId'].includes(key), `raw field ${key} is not returned`);
      walk(child);
    }
  };
  walk(body);
}

try {
  for (const options of [
    { authorization: null }, { authorization: 'Bearer wrong' }, { authorization: env.ADMIN_SECRET },
    { environment: { ...env, ADMIN_SECRET: undefined } },
    { environment: { ...env, ADMIN_SECRET: '' } },
  ]) {
    const { response } = await report(options);
    assert.equal(response.status, 401);
    assert.equal(requests.length, 0, 'unauthorized requests never query the database');
  }
  assert.equal((await report({ method: 'POST' })).response.status, 405);
  assert.equal(requests.length, 0, 'non-GET never queries or mutates data');

  const empty = await report();
  assert.equal(empty.response.status, 200);
  assert.equal(empty.body.complete, true);
  assert.equal(empty.body.generatedAt, new Date(NOW).toISOString());
  assert.equal(empty.body.ratioType, 'aggregate_event_ratios');
  assert.equal(empty.body.windows.last7Days.ratios.tripStarterStartToSubmit.value, null);
  assert.equal(empty.body.windows.last30Days.paidPasses.revenue, null);

  reset();
  for (let i = 0; i < 2; i++) event('trip_form_view');
  for (let i = 0; i < 4; i++) event('trip_form_start');
  for (let i = 0; i < 3; i++) event('trip_form_submit');
  event('free_trip_starter_submit'); event('lead_submit_success'); event('lead_submit_success');
  event('lead_submit_failed'); event('lead_submit_failed');
  event('cta_clicked', { ctaName: 'planning_email_click' });
  event('cta_clicked', { ctaName: 'planning_paid_planning_click' });
  event('cta_clicked', { ctaName: 'planning_paid_planning_click' });
  event('cta_clicked', { ctaName: 'app_setup_guide_click' });
  event('gumroad_click', { plan: 'trip' }); event('gumroad_click', { plan: 'trip' }); event('gumroad_click', { plan: 'group' });
  event('cta_clicked', { tool: 'pricing', destination: 'Gumroad Trip Pass' });
  event('cta_clicked', { tool: 'pricing', destination: 'Gumroad Group Pass' });
  event('cta_clicked', { tool: 'pay', destination: 'Gumroad', ctaName: 'Get Trip Pass' });
  event('cta_clicked', { tool: 'pay', destination: 'Gumroad', ctaName: 'Get Group Pass' });
  event('gumroad_click', { plan: 'other' });
  event('email_dispatch_success'); event('email_dispatch_failure');
  for (const environment of ['preview', 'test', undefined, 'Production']) {
    event('trip_form_view', { environment });
    event('cta_clicked', { environment, ctaName: 'planning_paid_planning_click' });
    event('gumroad_click', { environment, plan: 'trip' });
  }
  for (const at of [NOW - 8 * DAY, NOW - 7 * DAY, NOW - 7 * DAY - 1, NOW - 30 * DAY, NOW - 30 * DAY - 1, NOW, NOW + 1]) event('trip_form_view', {}, at);
  event('trip_form_start', {}, NOW - 8 * DAY); event('trip_form_submit', {}, NOW - 8 * DAY);
  const identity = { email: 'leak@example.test', phone: '+1 (312) 555-1212', whatsapp: '+13125551212', saleId: 'SALE-PRIVATE-DO-NOT-RETURN', requestId: 'REQUEST-PRIVATE-DO-NOT-RETURN', ipHash: 'IP-HASH-PRIVATE' };
  const lead = (extra = {}, at = NOW - DAY) => add('tripLeads', { createdAt: at, status: 'new', leadChannel: 'direct', landingPage: '/plan/', utmSource: 'google', ...identity, ...extra });
  lead({ planGenerationStatus: 'succeeded', customerItineraryEmailStatus: 'accepted' });
  lead({ status: 'received', planGenerationStatus: 'sent', confirmationEmailStatus: 'sent', utmSource: 'reddit' });
  lead({ status: 'free_plan_blocked', planGenerationStatus: 'not_attempted', customerItineraryEmailStatus: 'not_attempted' });
  lead({ planGenerationStatus: 'succeeded', customerItineraryEmailStatus: 'bounced' });
  lead({ planGenerationStatus: 'pending', customerItineraryEmailStatus: 'pending' });
  lead();
  lead({ status: 'leak@example.test', planGenerationStatus: '+13125551212', customerItineraryEmailStatus: 'REQUEST-PRIVATE-DO-NOT-RETURN', leadChannel: 'leak@example.test', landingPage: '/private/Jane-Smith/+13125551212', utmSource: 'Jane-Smith' });
  lead({ planGenerationStatus: 'succeeded', customerItineraryEmailStatus: 'delivered' });
  lead({ planGenerationStatus: 'succeeded', customerItineraryEmailStatus: 'delayed' });
  lead({ planGenerationStatus: 'failed', customerItineraryEmailStatus: 'not_attempted' });
  lead({ planGenerationStatus: 'succeeded', customerItineraryEmailStatus: 'complained' });
  lead({ planGenerationStatus: 'failed', customerItineraryEmailStatus: 'failed' }, NOW - 8 * DAY);
  lead({ status: 'free_plan_blocked', planGenerationStatus: 'not_attempted', customerItineraryEmailStatus: 'not_attempted' }, NOW - 30 * DAY);
  lead({}, NOW - 30 * DAY - 1); lead({}, NOW);
  const sale = (tier, status, at = NOW - DAY) => add('gumroadSales', { receivedAt: at, tier, status, ...identity });
  sale('trip', 'received'); sale('trip', 'claimed'); sale('trip', 'error'); sale('group', 'received');
  sale(null, 'unknown_product'); sale('leak@example.test', 'REQUEST-PRIVATE-DO-NOT-RETURN');
  sale('group', 'claimed', NOW - 8 * DAY); sale('trip', 'received', NOW - 30 * DAY - 1);
  add('gumroadSales', { claimedAt: NOW - DAY, status: 'claimed', ...identity }, 'SALE-PRIVATE-DO-NOT-RETURN');

  const result = await report();
  assert.equal(result.response.status, 200);
  const seven = result.body.windows.last7Days;
  const thirty = result.body.windows.last30Days;
  assert.equal(seven.analytics.tripStarterFormViews, 3, '7-day lower boundary is inclusive, end/future/preview/test/missing environments excluded');
  assert.equal(thirty.analytics.tripStarterFormViews, 6, '30-day lower boundary is inclusive');
  assert.equal(seven.analytics.tripStarterFormStarts, 4); assert.equal(thirty.analytics.tripStarterFormStarts, 5);
  assert.equal(seven.analytics.tripStarterFormSubmits, 3); assert.equal(thirty.analytics.tripStarterFormSubmits, 4);
  assert.equal(seven.analytics.freeTripStarterSuccessfulSubmits, 1);
  assert.equal(seven.analytics.successfulLeadSubmits, 2, 'success event families are not summed');
  assert.equal(seven.analytics.failedLeadSubmits, 2);
  assert.equal(seven.analytics.freeRouteHelpEmailCtaClicks, 1);
  assert.equal(seven.analytics.paidPlanningCtaClicks, 2, 'paid email intent is a CTA count only');
  assert.equal(seven.analytics.paidPlanningInquiries, undefined);
  assert.deepEqual(seven.analytics.gumroadClicks, { trip: 3, group: 2 }, 'pricing clicks supplement canonical events without generic pay-CTA duplicates');
  assert.equal(seven.analytics.emailDispatchSuccesses, 1); assert.equal(seven.analytics.emailDispatchFailures, 1);
  assert.equal(seven.leads.totalStored, 11); assert.equal(seven.leads.normalStored, 9);
  assert.equal(seven.leads.freePlanBlocked, 1); assert.equal(seven.leads.otherStatus, 1);
  assert.equal(thirty.leads.totalStored, 13); assert.equal(thirty.leads.freePlanBlocked, 2);
  assert.equal(seven.leads.planGeneration.succeeded, 6); assert.equal(seven.leads.planGeneration.failed, 1);
  assert.equal(seven.leads.customerItineraryEmail.acceptedOrSent, 2);
  assert.equal(seven.leads.customerItineraryEmail.delivered, 1);
  assert.equal(seven.leads.customerItineraryEmail.failed, 2);
  assert.equal(seven.leads.customerItineraryEmail.delayed, 1);
  assert.equal(seven.paidPasses.recordedPurchases.trip, 3); assert.equal(seven.paidPasses.recordedPurchases.group, 1);
  assert.equal(thirty.paidPasses.recordedPurchases.group, 2);
  assert.equal(seven.paidPasses.recordedPurchases.unknownProduct, 2);
  assert.equal(seven.paidPasses.statuses.received, 2); assert.equal(seven.paidPasses.statuses.claimed, 1);
  assert.equal(seven.paidPasses.statuses.error, 1); assert.equal(seven.paidPasses.statuses.unknownProduct, 1); assert.equal(seven.paidPasses.statuses.unknown, 1);
  for (const window of [seven, thirty]) {
    assert.equal(window.paidPasses.revenue, null);
    assert.equal(window.paidPasses.revenueNote, 'Revenue is not currently measurable from the stored Gumroad sale fields.');
  }
  assert.equal(seven.ratios.tripStarterStartToSubmit.value, 3 / 4);
  assert.equal(seven.ratios.tripStarterViewToSubmit.value, 1);
  assert.equal(seven.ratios.gumroadClickToRecordedPurchase.trip.value, 1);
  assert.equal(seven.ratios.gumroadClickToRecordedPurchase.group.value, 1 / 2);
  assertNoIdentity(result.body);
  assert.ok(result.body.limitations.length > 0, 'source coverage/ratio limitations are explicit');

  reset();
  const paths = Object.keys(JSON.parse(readFileSync('src/data/guideRelatedLinks.json', 'utf8'))).slice(0, 20);
  for (let index = 0; index < paths.length; index++) add('tripLeads', { createdAt: NOW - DAY, status: 'new', leadChannel: 'direct', landingPage: `/${paths[index]}/`, utmSource: 'google' });
  const breakdownReport = await report();
  for (const breakdown of Object.values(breakdownReport.body.windows.last7Days.leads.breakdowns)) assert.ok(breakdown.values.length <= 10, 'every breakdown is top-ten bounded');
  const landing = breakdownReport.body.windows.last7Days.leads.breakdowns.landingPage;
  assert.equal(landing.values.length, 10);
  assert.equal(landing.values.reduce((sum, value) => sum + value.count, 0) + landing.omittedCount, 20, 'top-ten truncation still accounts for omitted records');

  reset();
  for (let index = 0; index < PAGE_SIZE + 3; index++) event('trip_form_view');
  const paginated = await report();
  assert.equal(paginated.body.windows.last7Days.analytics.tripStarterFormViews, PAGE_SIZE + 3, 'equal-timestamp records are neither lost nor doubled across pages');
  assert.ok(requests.filter(({ structuredQuery }) => structuredQuery.from[0].collectionId === 'analyticsEvents').some(({ structuredQuery }) => structuredQuery.startAt), 'large collections actually paginate');

  reset();
  for (let index = 0; index < MAX_RECORDS_PER_COLLECTION; index++) event('trip_form_view', { environment: 'preview' });
  const exactCap = await report();
  assert.equal(exactCap.response.status, 200, 'exactly-at-cap report proves completion with a bounded final query');
  assert.equal(exactCap.body.complete, true); assert.equal(exactCap.body.windows.last30Days.analytics.tripStarterFormViews, 0);
  event('trip_form_view', { environment: 'preview' });
  const capped = await report();
  assert.equal(capped.response.status, 503);
  assert.equal(capped.body.complete, false); assert.equal(capped.body.error, 'report_incomplete');
  assert.equal(capped.body.reason, 'safety_cap_reached'); assert.equal(capped.body.collection, 'analyticsEvents');
  assert.equal(capped.body.windows, undefined, 'a safety-limited scan never masquerades as complete funnel metrics');
  assertNoIdentity(capped.body);

  reset(); failure = true;
  const unavailable = await report();
  assert.equal(unavailable.response.status, 503);
  assert.equal(unavailable.body.complete, false);
  assertNoIdentity(unavailable.body);

  const pureEmpty = buildGrowthSummary({ analyticsEvents: [], tripLeads: [], gumroadSales: [] }, NOW);
  assert.equal(pureEmpty.windows.last7Days.ratios.tripStarterViewToSubmit.value, null);
  const overOne = buildGrowthSummary({ analyticsEvents: [
    { event: 'trip_form_start', environment: 'production', createdAt: NOW - 1 },
    ...Array.from({ length: 2 }, () => ({ event: 'trip_form_submit', environment: 'production', createdAt: NOW - 1 })),
  ], tripLeads: [], gumroadSales: [] }, NOW);
  assert.equal(overOne.windows.last7Days.ratios.tripStarterStartToSubmit.value, 2, 'aggregate event ratios are not clamped to unique-user conversion rates');
  const attributionFallback = buildGrowthSummary({ analyticsEvents: [], gumroadSales: [], tripLeads: [
    {
      createdAt: NOW - 1, status: 'new', planGenerationStatus: 'succeeded',
      customerItineraryEmailStatus: 'bounced', confirmationEmailStatus: 'delivered',
      firstTouch: { channel: 'organic_search', landingPage: '/guides/', utmSource: 'google' },
      lastTouch: { channel: 'social', landingPage: '/plan/?email=leak@example.test', utmSource: 'reddit' },
    },
    {
      createdAt: NOW - 1, status: 'new',
      firstTouch: { channel: 'organic_search', landingPage: '/guides/', utmSource: 'google' },
    },
    { createdAt: NOW - 1, status: 'new', utmSource: '+13125551212', landingPage: '/REQUEST-PRIVATE-DO-NOT-RETURN' },
  ] }, NOW);
  const fallbackWindow = attributionFallback.windows.last7Days;
  assert.equal(fallbackWindow.leads.customerItineraryEmail.failed, 1, 'current customer status takes priority over the legacy confirmation field');
  assert.equal(fallbackWindow.leads.customerItineraryEmail.delivered, 0);
  const labelCounts = (name) => Object.fromEntries(fallbackWindow.leads.breakdowns[name].values.map(({ value, count }) => [value, count]));
  assert.equal(labelCounts('leadChannel').social, 1, 'last touch supplies missing top-level channel');
  assert.equal(labelCounts('leadChannel').organic_search, 1, 'first touch remains a legacy fallback');
  assert.equal(labelCounts('landingPage')['/plan/'], 1, 'only a known public path survives, with query identifiers removed');
  assert.equal(labelCounts('utmSource').reddit, 1);
  assert.equal(labelCounts('utmSource').google, 1);
  assert.equal(labelCounts('utmSource')['other/redacted'], 1, 'phone-like sources are never reflected');
  assertNoIdentity(attributionFallback);
  console.log('PASS: protected read-only growth report; production-only analytics, windows, statuses, privacy, revenue null, top-ten breakdowns, snapshot pagination, exact/over safety cap, and sanitized failures.');
} finally {
  globalThis.fetch = originalFetch;
  Date.now = originalNow;
}
