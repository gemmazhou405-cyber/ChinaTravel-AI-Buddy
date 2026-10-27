const DAY_MS = 86_400_000;
export const PAGE_SIZE = 200;
export const MAX_RECORDS_PER_COLLECTION = 5000;
export const GROWTH_COLLECTIONS = [
  { collectionId: 'analyticsEvents', dateField: 'createdAt', fields: ['environment', 'event', 'ctaName', 'tool', 'destination', 'plan'] },
  {
    collectionId: 'tripLeads', dateField: 'createdAt',
    fields: ['status', 'planGenerationStatus', 'customerItineraryEmailStatus', 'confirmationEmailStatus',
      'leadChannel', 'landingPage', 'sourcePath', 'utmSource',
      'lastTouch.channel', 'lastTouch.landingPage', 'lastTouch.utmSource',
      'firstTouch.channel', 'firstTouch.landingPage', 'firstTouch.utmSource'],
  },
  { collectionId: 'gumroadSales', dateField: 'receivedAt', fields: ['tier', 'status'] },
];

// Only fixed, public labels may leave the endpoint. Regex-valid arbitrary UTM
// slugs or URL paths can still contain names, telephone numbers or identifiers.
const CHANNELS = new Set(['utm', 'partner', 'organic_search', 'ai_assistant', 'social', 'referral', 'direct']);
// Curated from the existing public guide registry. New/custom paths remain
// redacted until explicitly reviewed, rather than reflecting arbitrary slugs.
const PUBLIC_PATHS = new Set([
  '/', '/plan/', '/pricing/', '/guides/', '/first-trip-to-china/',
  '/china-visa-free-checker/', '/china-240-hour-transit-calculator/',
  '/partners/hostel-china-travel-help/', '/partners/china-visa-checker/', '/partners/first-trip-to-china/',
  "/guides/", "/china-visa-free-travel-guide/",
  "/china-airport-arrival-guide/", "/china-hotels-for-foreigners/",
  "/china-food-ordering-guide/", "/chinese-travel-phrases/",
  "/china-travel-safety-guide/", "/china-travel-budget/",
  "/terms/", "/privacy/",
  "/contact/", "/china-travel-apps/",
  "/china-train-travel-guide/", "/didi-in-china-for-foreigners/",
  "/china-metro-guide/", "/7-day-china-itinerary/",
  "/10-day-china-itinerary/", "/14-day-china-itinerary/",
  "/beijing-vs-shanghai/", "/3-day-beijing-itinerary/",
  "/3-day-shanghai-itinerary/", "/3-day-xian-itinerary/",
  "/3-day-chongqing-itinerary/", "/3-day-chengdu-itinerary/",
  "/3-day-guilin-yangshuo-itinerary/", "/3-day-zhangjiajie-itinerary/",
  "/3-day-shenzhen-itinerary/", "/3-day-guangzhou-itinerary/",
  "/3-day-hangzhou-itinerary/", "/3-day-suzhou-itinerary/",
  "/3-day-nanjing-itinerary/", "/3-day-dali-itinerary/",
  "/china-golden-week-2026-travel-guide/", "/great-wall-of-china-day-trip-from-beijing/",
  "/chengdu-panda-base-guide/", "/didi-payment-for-foreigners/",
  "/beijing-airport-to-city-guide/", "/amap-vs-google-maps-china/",
  "/best-time-to-visit-china/", "/china-esim-internet-guide/",
  "/china-sim-card-for-foreigners/", "/alipay-for-foreigners/",
  "/wechat-pay-for-foreigners/", "/china-payment-guide/",
  "/china-travel-checklist/", "/china-emergency-numbers/",
  "/china-itinerary-first-time-7-10-14-days/", "/faq/",
  "/china-240-hour-visa-free-transit-2026/", "/nia-12367-online-accommodation-registration-guide/",
  "/amap-english-mode-guide-2026/", "/alipay-metro-qr-transport-code-guide/",
  "/china-travel-ai-itinerary-generator/", "/wechat-verification-without-friend-qr-2026/",
  "/what-to-eat-in-china-first-time-guide/", "/how-to-use-wechat-as-foreigner-2026/",
  "/beijing-shanghai-layover-240-hour-guide/", "/tenpaygo-for-tourists/",
  "/china-visa-free-checker/", "/china-240-hour-transit-calculator/",
  "/china-240-hour-transit-clock-start/", "/china-240-hour-transit-us-citizens/",
  "/china-240-hour-transit-round-trip-ticket/", "/china-240-hour-transit-ports-provinces/",
  "/china-online-arrival-card-2026/", "/partners/china-visa-checker/",
  "/first-trip-to-china/",
]);
const UTM_SOURCES = new Set([
  'google', 'bing', 'baidu', 'duckduckgo', 'yahoo', 'yandex', 'naver', 'ecosia', 'brave',
  'chatgpt', 'openai', 'perplexity', 'claude', 'gemini', 'deepseek', 'grok', 'meta_ai', 'poe', 'kimi',
  'youtube', 'reddit', 'instagram', 'facebook', 'pinterest', 'tiktok', 'xiaohongshu',
  'x', 'twitter', 'linkedin', 'threads', 'trip.com', 'newsletter', 'email', 'direct', 'none', 'partner',
]);

function fixedLabel(value, allowed) {
  if (typeof value !== 'string' || !value.trim()) return 'unknown';
  const normalized = value.trim().toLowerCase();
  return allowed.has(normalized) ? normalized : 'other/redacted';
}

function landingLabel(value) {
  if (typeof value !== 'string' || !value.trim()) return 'unknown';
  const path = value.split(/[?#]/)[0];
  const normalized = path === '/' ? '/' : `${path.replace(/\/+$/, '')}/`;
  return PUBLIC_PATHS.has(normalized) ? normalized : 'other/redacted';
}

function breakdown(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  const sorted = [...counts].sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b));
  return {
    values: sorted.slice(0, 10).map(([value, count]) => ({ value, count })),
    omittedCount: sorted.slice(10).reduce((sum, [, count]) => sum + count, 0),
  };
}

function ratio(numerator, denominator) {
  return { numerator, denominator, value: denominator ? numerator / denominator : null };
}

function inWindow(records, field, from, to) {
  return records.filter((record) => Number.isSafeInteger(record[field]) && record[field] >= from && record[field] < to);
}

function summarizeWindow(data, from, to) {
  const events = inWindow(data.analyticsEvents, 'createdAt', from, to).filter((event) => event.environment === 'production');
  const leads = inWindow(data.tripLeads, 'createdAt', from, to);
  const sales = inWindow(data.gumroadSales, 'receivedAt', from, to);
  const countEvent = (name) => events.filter((event) => event.event === name).length;
  const countCta = (name) => events.filter((event) => event.event === 'cta_clicked' && event.ctaName === name).length;
  const passClicks = (tier) => events.filter((event) => (
    event.event === 'gumroad_click' && event.plan === tier
  ) || (
    event.event === 'cta_clicked' && event.tool === 'pricing'
      && event.destination === (tier === 'trip' ? 'Gumroad Trip Pass' : 'Gumroad Group Pass')
  )).length;
  const analytics = {
    tripStarterFormViews: countEvent('trip_form_view'),
    tripStarterFormStarts: countEvent('trip_form_start'),
    tripStarterFormSubmits: countEvent('trip_form_submit'),
    freeTripStarterSuccessfulSubmits: countEvent('free_trip_starter_submit'),
    successfulLeadSubmits: countEvent('lead_submit_success'),
    failedLeadSubmits: countEvent('lead_submit_failed'),
    freeRouteHelpEmailCtaClicks: countCta('planning_email_click'),
    paidPlanningCtaClicks: countCta('planning_paid_planning_click'),
    gumroadClicks: { trip: passClicks('trip'), group: passClicks('group') },
    emailDispatchSuccesses: countEvent('email_dispatch_success'),
    emailDispatchFailures: countEvent('email_dispatch_failure'),
  };
  const planGeneration = { succeeded: 0, failed: 0, pending: 0, notAttempted: 0, unknown: 0 };
  const customerItineraryEmail = { acceptedOrSent: 0, delivered: 0, failed: 0, pending: 0, delayed: 0, notAttempted: 0, unknown: 0 };
  const leadCounts = { totalStored: leads.length, normalStored: 0, freePlanBlocked: 0, otherStatus: 0 };
  for (const lead of leads) {
    if (lead.status === 'free_plan_blocked') leadCounts.freePlanBlocked++;
    else if (lead.status === 'new' || lead.status === 'received') leadCounts.normalStored++;
    else leadCounts.otherStatus++;
    if (lead.planGenerationStatus === 'succeeded' || lead.planGenerationStatus === 'sent') planGeneration.succeeded++;
    else if (lead.planGenerationStatus === 'failed') planGeneration.failed++;
    else if (lead.planGenerationStatus === 'pending') planGeneration.pending++;
    else if (lead.planGenerationStatus === 'not_attempted') planGeneration.notAttempted++;
    else planGeneration.unknown++;
    const status = lead.customerItineraryEmailStatus || lead.confirmationEmailStatus;
    if (status === 'accepted' || status === 'sent') customerItineraryEmail.acceptedOrSent++;
    else if (status === 'delivered') customerItineraryEmail.delivered++;
    else if (['failed', 'bounced', 'suppressed', 'complained'].includes(status)) customerItineraryEmail.failed++;
    else if (status === 'pending') customerItineraryEmail.pending++;
    else if (status === 'delayed') customerItineraryEmail.delayed++;
    else if (status === 'not_attempted') customerItineraryEmail.notAttempted++;
    else customerItineraryEmail.unknown++;
  }
  const recordedPurchases = { trip: 0, group: 0, unknownProduct: 0, total: sales.length };
  const statuses = { received: 0, claimed: 0, error: 0, unknownProduct: 0, unknown: 0 };
  for (const sale of sales) {
    if (sale.tier === 'trip' || sale.tier === 'group') recordedPurchases[sale.tier]++;
    else recordedPurchases.unknownProduct++;
    if (['received', 'claimed', 'error'].includes(sale.status)) statuses[sale.status]++;
    else if (sale.status === 'unknown_product') statuses.unknownProduct++;
    else statuses.unknown++;
  }
  return {
    from: new Date(from).toISOString(), to: new Date(to).toISOString(), analytics,
    leads: {
      ...leadCounts, planGeneration, customerItineraryEmail,
      breakdowns: {
        leadChannel: breakdown(leads.map((lead) => fixedLabel(lead.leadChannel || lead.lastTouch?.channel || lead.firstTouch?.channel, CHANNELS))),
        landingPage: breakdown(leads.map((lead) => landingLabel(lead.landingPage || lead.lastTouch?.landingPage || lead.firstTouch?.landingPage || lead.sourcePath))),
        utmSource: breakdown(leads.map((lead) => fixedLabel(lead.utmSource || lead.lastTouch?.utmSource || lead.firstTouch?.utmSource, UTM_SOURCES))),
      },
    },
    paidPasses: {
      recordedPurchases, statuses, revenue: null,
      revenueNote: 'Revenue is not currently measurable from the stored Gumroad sale fields.',
    },
    ratios: {
      tripStarterStartToSubmit: ratio(analytics.tripStarterFormSubmits, analytics.tripStarterFormStarts),
      tripStarterViewToSubmit: ratio(analytics.tripStarterFormSubmits, analytics.tripStarterFormViews),
      gumroadClickToRecordedPurchase: {
        trip: ratio(recordedPurchases.trip, analytics.gumroadClicks.trip),
        group: ratio(recordedPurchases.group, analytics.gumroadClicks.group),
      },
    },
  };
}

export function buildGrowthSummary(data, now) {
  return {
    complete: true, generatedAt: new Date(now).toISOString(), ratioType: 'aggregate_event_ratios',
    windows: {
      last7Days: summarizeWindow(data, now - 7 * DAY_MS, now),
      last30Days: summarizeWindow(data, now - 30 * DAY_MS, now),
    },
    limitations: [
      'Counts and ratios are aggregate records/events, not unique-user or session conversion rates. Ratios can exceed 1; a zero denominator returns null.',
      'Paid planning and free route-help mailto clicks measure intent only, not sent emails or completed inquiries.',
      'Generic lead-submit events combine several forms; they are separate from Trip Starter successful responses and must not be added to them. Failed events can undercount exceptions.',
      'Analytics includes only stored environment=production. Older server dispatch events may label production-host tests as production; this cannot be corrected retrospectively.',
      'Trip leads and sales do not store reliable environment provenance. Lead/sale counts cannot be separated into production versus preview/test using current fields; webhook test sales are ignored at ingestion.',
      'Lead outcomes are the current statuses of records created in each window, not generation or email events occurring in that window. Normal stored does not mean a successful plan or delivery.',
      'Email dispatch success and accepted/sent lead statuses mean provider acceptance/sending, not inbox delivery. Delivered lead status requires the existing delivery webhook.',
      'Blocked and later successful requests can be separate lead documents; stored lead counts are not deduplicated people.',
      'Only server-generated numeric createdAt/receivedAt timestamps are queried. Missing timestamps, including claim-only sale records, cannot be assigned to a purchase window and are excluded.',
      'Known Trip/Group tiers are recorded purchases, not settled or refund-adjusted sales. Revenue is not currently measurable from the stored Gumroad sale fields.',
      'Landing pages and UTM sources use finite public allowlists. Unrecognized/custom labels are grouped as other/redacted; unknown means missing. Breakdowns return at most ten labels and an omitted-record count.',
      'Pass click totals combine canonical gumroad_click events with disjoint pricing-page CTA clicks, excluding duplicate generic toolkit/home CTAs. Purchases are not linked to individual clicks.',
      'Queries page through a fixed per-collection read snapshot. Collection snapshots can differ; analytics writes are best-effort and this is a stored-data baseline, not a reconciled ledger.',
    ],
  };
}
