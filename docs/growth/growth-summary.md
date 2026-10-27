# Protected growth summary

Implementation/audit base: `04b2b11f62c589a8c4abc63ef5d399c54d7c1a4e` (latest main pulled before this work).
The audit below describes the current production-code schema and emitters. No live production collections or secrets were accessed for this change.

## Endpoint and operation

`GET /api/admin/growth-summary`

Send `Authorization: Bearer <ADMIN_SECRET>`, using the same existing secret as `/api/admin/activate`. Missing/invalid credentials (including missing server secret) return HTTP 401 before any database access. Authenticated non-GET requests return 405. Every response has `Cache-Control: no-store`; no CORS allowance, public frontend link, dashboard, raw documents, or new tracking is added.

The response is aggregate-only: `complete`, `generatedAt`, `ratioType`, `windows.last7Days`, `windows.last30Days`, and explicit `limitations`. Each window gives UTC `from`/`to`, analytics counts, lead counts/current outcomes/top-ten breakdowns, recorded pass purchases/statuses, and aggregate event ratios. Intervals are rolling 7/30 × 24 hours, inclusive at `from` and exclusive at the server request timestamp `to`.

Optional local command:

```sh
# Configure these securely in the local environment; do not commit secrets.
# GROWTH_REPORT_URL is the full HTTPS URL ending in /api/admin/growth-summary.
npm run report:growth
```

The command reads `GROWTH_REPORT_URL` and `ADMIN_SECRET`, does not follow redirects, accepts HTTP only on loopback for local testing, and prints complete aggregate JSON. It never prints the secret, error response bodies, or failed partial reports. Do not put the secret in a URL or shell command history.

## Audit: existing data models

| Collection | Existing date field | Existing usable fields | Important exclusions/limits |
| --- | --- | --- | --- |
| `analyticsEvents` | Server `createdAt: Date.now()` numeric milliseconds | `environment`, `event`, `ctaName`, `tool`, `destination`, `plan` | Only exact stored `environment = production` contributes. No persisted session/request identifier or trustworthy unique-session denominator. Event writes are best-effort. |
| `tripLeads` | Server `createdAt: Date.now()` numeric milliseconds | `status`, `planGenerationStatus`, customer/legacy email status, `leadChannel`, `landingPage`, `sourcePath`, top-level and first/last-touch UTM/source fields | Email, WhatsApp, request ID, IP/email hashes, provider IDs, generated itinerary, notes, and arbitrary error details are not selected. No reliable stored environment field. |
| `gumroadSales` | Webhook server `receivedAt: Date.now()` numeric milliseconds | `tier`, `status` | Sale ID, buyer email, product ID, permalink and pass ID are not selected. No reliable actual amount/currency/discount/refund fields. No general environment provenance. |

Source evidence: `functions/api/events.js`, `functions/api/leads/trip.js`, `functions/api/webhooks/resend.js`, `functions/api/gumroad/webhook.js`, `functions/api/claim.js`, `src/components/home/TripPlanForm.tsx`, `src/components/PolicyPage.tsx`, and `src/lib/analytics.ts`.

### Exact analytics selectors

| Response metric | Existing stored selector | Meaning |
| --- | --- | --- |
| `tripStarterFormViews` | `trip_form_view` | Visible Trip Starter form; browser deduplication does not make this a unique visitor/session count. |
| `tripStarterFormStarts` | `trip_form_start` | First interaction per mounted form. |
| `tripStarterFormSubmits` | `trip_form_submit` | Submission attempts after form validation, before API outcome. |
| `freeTripStarterSuccessfulSubmits` | `free_trip_starter_submit` | Successful Trip Starter API responses. |
| `successfulLeadSubmits`, `failedLeadSubmits` | `lead_submit_success`, `lead_submit_failed` | Generic outcomes from multiple lead forms; stored fields do not reliably distinguish their triggers. Some exception paths emit no failure event. |
| `freeRouteHelpEmailCtaClicks` | `cta_clicked` + `planning_email_click` | Free mailto intent/clicks only. |
| `paidPlanningCtaClicks` | `cta_clicked` + `planning_paid_planning_click` | Paid-planning mailto intent/clicks only. No sent-email/inquiry event is invented. Deprecated external-platform clicks are not relabeled as current paid-planning clicks. |
| `gumroadClicks.trip/group` | `gumroad_click` + matching `plan`, plus disjoint `cta_clicked` + `tool=pricing` + exact destination `Gumroad Trip Pass` / `Gumroad Group Pass` | Covers both homepage/toolkit and pricing-page click emitters without counting their generic duplicate toolkit/home CTAs. |
| `emailDispatchSuccesses`, `emailDispatchFailures` | `email_dispatch_success`, `email_dispatch_failure` | Server dispatch outcomes after successful plan generation. Success means provider acceptance, not confirmed inbox delivery. |

Do not sum `free_trip_starter_submit` and `lead_submit_success`: a successful Starter request emits both. Do not add generic `cta_clicked` events with `tool=pay` to canonical Gumroad clicks: those duplicate canonical events and can run before the active-pass guard.

`plan_form_start` / `plan_form_submit` are allowlisted but have no current emitters; they are not reported as live metrics. Unpersisted itinerary events and GA4-only events are not included.

### Lead cohort metrics

- `totalStored`: documents created within the window, not unique people or completed deliveries.
- `normalStored`: `status=new` or legacy `received`; these mean normal stored leads, not successful itinerary delivery.
- `freePlanBlocked`: `status=free_plan_blocked`, separate from normal leads. A blocked request later retried successfully can produce two documents.
- `otherStatus`: other/missing statuses, counted without reflecting their raw values.
- Plan generation: `succeeded` and legacy `sent` → succeeded; `failed`, `pending`, `not_attempted`, and unknown are separate buckets.
- Customer itinerary email: prefer `customerItineraryEmailStatus`, then legacy `confirmationEmailStatus`. `accepted/sent`, `delivered`, `failed/bounced/suppressed/complained`, `pending`, `delayed`, `not_attempted`, and unknown remain distinct buckets.

Email and generation metrics are the **current state of leads created within the window**, not a count of email/generation events that happened within the window. Dispatch events provide the separate event-time measure. Delivered status depends on the existing Resend webhook.

Lead channel, landing page, and UTM-source breakdowns include all stored lead cohorts. Channel uses the existing seven-label enumeration. Landing labels are a finite curated list of known public site paths; UTM sources use a finite common-source list. Paths drop query/fragment before matching. Missing values become `unknown`; unrecognized/custom values become `other/redacted`. Arbitrary regex-valid source/path strings are not echoed because they can contain names, telephone numbers or identifiers. New labels require explicit privacy review. Each breakdown has at most ten `{value,count}` entries and an `omittedCount` for records outside the top ten; suppressed raw labels are never returned.

### Recorded pass purchases and revenue

Within `receivedAt` windows, existing tier `trip/group` documents count as recorded purchases. Other/missing tiers are `unknownProduct`. The report separately counts `received`, `claimed`, `error`, `unknown_product`, and unknown statuses, without returning original unknown values. Statuses describe the current received cohort, not status-change events.

Claiming is not a purchase timestamp. The existing claim PATCH can create a record containing only `status`, `passId`, and `claimedAt`; without `receivedAt` or tier it cannot be assigned to a purchase window. Such records are excluded instead of treating their claim time as purchase time. Missing or differently typed historical dates are outside this numeric-millisecond baseline.

Both windows return `revenue: null` and `"Revenue is not currently measurable from the stored Gumroad sale fields."` No public pass price is multiplied by counts, and no settled/net/refund-adjusted revenue is claimed. Webhook/payment/claim behavior is unchanged.

### Ratios and provenance limits

Ratios return `{numerator, denominator, value}`: Starter submit attempts divided by starts/views, and recorded Trip/Group purchases divided by matching click totals. A zero denominator gives `null`; ratios can exceed 1. `ratioType` is `aggregate_event_ratios`. These are not linked cohorts, unique-user/session conversions, paid-planning inquiry conversions, or attribution claims for individual purchases.

Only analytics has stored environment classification. Preview/test analytics documents are excluded, but existing server dispatch classification uses the request hostname rather than production-host `test_mode`, so retrospectively misclassified tests cannot be discovered. Leads/sales lack equivalent reliable environment fields; their counts cannot be asserted to be production-only. Gumroad webhook submissions explicitly marked `test=true` are already ignored by ingestion. No guessing, backfill, or duplicate tracking is introduced to cover these gaps.

## Bounded Firestore reads and indexes

The report fetches the last 30 days once per collection, projecting only required fields. It computes both windows from those results. Queries filter and sort on a single numeric date field with document-name tie-breaking, use 200-record cursor pages, and preserve the first page's final read snapshot for subsequent pages. There are no offsets or unbounded collection scans. A shared 25-second deadline bounds the read; failures cancel outstanding report reads.

The limit is 5,000 matching records per collection. A one-record sentinel distinguishes exactly 5,000 from an overflow. Preview/test analytics count toward the read safety bound even though they never contribute to metrics, because filtering environment in memory avoids a composite environment/date index.

On an overflow the endpoint returns HTTP 503 with `complete:false`, `error:report_incomplete`, `reason:safety_cap_reached`, the fixed collection label, and the configured cap. No partial metrics are returned. Query/auth/configuration/timeout failures return sanitized errors without raw Firestore details or identifiers.

No new composite index is required. The report relies on the normal ascending single-field indexes for `analyticsEvents.createdAt`, `tripLeads.createdAt`, and `gumroadSales.receivedAt`; their default document-name tie-breaker serves cursor ordering. If an administrator has disabled one of these automatic indexes, it must be re-enabled. Production index exemptions were not queried. Pagination and field projection follow the [Firestore StructuredQuery reference](https://firebase.google.com/docs/firestore/reference/rest/v1/StructuredQuery), [runQuery read-time reference](https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/runQuery), and [single-field index documentation](https://firebase.google.com/docs/firestore/query-data/index-overview).

Production needs no new secret, database, service, or frontend configuration beyond the existing `ADMIN_SECRET` and already configured Firebase service-account variables/permissions. `GROWTH_REPORT_URL` is local CLI configuration only. No secret value is committed or used during tests.

## Local verification

- Network-isolated endpoint tests cover auth, method/read-only/no-store behavior, actual event selectors, windows, preview/test exclusion, duplicate avoidance, normal/blocked leads, outcomes, purchases/statuses, revenue null, private raw values/errors, top-ten breakdowns, timestamp ties/snapshot pagination, exact-cap completion and overflow failure.
- CLI tests cover configuration, URL/redirect/header guards, complete JSON, and secret-safe failures.
- Existing campaign/attribution, lead-source, release, itinerary-email, lead-quota, free-chat-quota and pass regressions run unchanged.
- Typecheck, production frontend build, an explicit Workers-compatible endpoint bundle, targeted ESLint, final diff review, and whitespace checks.

All tests use generated local keys and test doubles. No live admin request or production collection read was performed. No deployment or merge to main is part of this review.
