# Protected growth summary

Original schema audit base: `04b2b11f62c589a8c4abc63ef5d399c54d7c1a4e`.
Dedicated report-credential update base: `7d98f2f7092eb55e8b1b915b0dffe0d2a4975883`; aggregation behavior is unchanged.
The audit below describes the current production-code schema and emitters. No live production collections or secrets were accessed for this change.

## Endpoint and operation

`GET /api/admin/growth-summary`

Send `Authorization: Bearer <GROWTH_REPORT_SECRET>`. This separate read-only credential authorizes only GET requests to this aggregate report; it does not authorize `/api/admin/activate`. Keep the existing `ADMIN_SECRET` unchanged for activation, use a different random value for `GROWTH_REPORT_SECRET`, and never reuse the admin credential. There is no `ADMIN_SECRET` fallback for the report. Missing/invalid report credentials (including a missing server report secret) return HTTP 401 before any database access. Authenticated non-GET requests return 405. Every response has `Cache-Control: no-store`; no CORS allowance, public frontend link, dashboard, raw documents, or new tracking is added.

This separates application-level endpoint authorization only. It does not issue Firestore credentials or change the existing Firebase service account's IAM permissions, database access, or report queries.

The response is aggregate-only: `complete`, `generatedAt`, `ratioType`, `windows.last7Days`, `windows.last30Days`, and explicit `limitations`. Each window gives UTC `from`/`to`, analytics counts, lead counts/current outcomes/top-ten breakdowns, recorded pass purchases/statuses, and aggregate event ratios. Intervals are rolling 7/30 × 24 hours, inclusive at `from` and exclusive at the server request timestamp `to`.

Optional local command:

```sh
# Run only after the matching server change is deployed and the report secret is configured.
# Supply GROWTH_REPORT_SECRET securely; never use ADMIN_SECRET for this command.
# GROWTH_REPORT_URL is the full HTTPS URL ending in /api/admin/growth-summary.
npm run report:growth
```

The command reads only `GROWTH_REPORT_URL` and `GROWTH_REPORT_SECRET`, does not follow redirects, accepts HTTP only on loopback for local testing, and prints complete aggregate JSON. It never prints the secret, error response bodies, or failed partial reports. Do not put the secret in a URL or shell command history. The hidden-input example below supplies the report credential only to the report subprocess, without exporting it into the parent shell.

### Configure the separate report credential after approval

These are instructions for a later authorized configuration change and deployment; they are not actions performed by this code change. No production report request is required to prepare the change.

1. In a trusted password manager, generate a new cryptographically random value with at least 256 bits of entropy (for example, 64 random hexadecimal characters). Save it in a password-manager entry labelled `ChinaEase / chinaease-buddy / Production / GROWTH_REPORT_SECRET`. Generate a different value from `ADMIN_SECRET`; do not retrieve or copy the admin secret. Do not place either secret in chat, command arguments/history, the repository, `.env` files, temporary files, or report artifacts.
2. Using the official Wrangler CLI in an interactive terminal and the already authorized Cloudflare account, run the following command. It creates or updates an encrypted Pages secret in **`chinaease-buddy` / Production**. Confirm the account/project and that no existing `GROWTH_REPORT_SECRET` binding would be overwritten; if one already exists, stop for review. Enter the new report value only at the hidden `Enter a secret value:` prompt. Do not pipe or redirect secret input. Do not run any command that changes `ADMIN_SECRET`.

   ```sh
   npx wrangler pages secret put GROWTH_REPORT_SECRET --project-name chinaease-buddy --env production
   ```

   The official [Pages CLI reference](https://developers.cloudflare.com/workers/wrangler/commands/pages/#pages-secret-put) documents `pages secret put`, `--project-name`, and `--env`. The [Wrangler implementation](https://github.com/cloudflare/workers-sdk/blob/b1ced56e11378efe3742c6eb51f96e70d572f0a4/packages/wrangler/src/pages/secret/index.ts#L129-L181) uses a secret-input prompt in an interactive terminal and writes a `secret_text` binding to the selected environment. Outside an interactive terminal it reads stdin instead; do not use that mode for this procedure.
3. Deploy the reviewed server/client change only through the separately approved release process. Adding the secret alone does not switch the authentication logic of already deployed code. Before that deployment, the old production report endpoint still uses its old admin credential; the updated local report command has no fallback and cannot use the new report key against the old endpoint. After the matching deployment, the report accepts only `GROWTH_REPORT_SECRET`, while `/api/admin/activate` continues to use the unchanged `ADMIN_SECRET`. If the new secret is missing or invalid, the report returns 401 rather than falling back to admin access. A code rollback may restore the old report authentication, so reassess this boundary before using the report after a rollback.
4. Once the new deployment and secret configuration are confirmed, run the report from the repository root with the same value stored in the password manager. This example refuses non-TTY input and refuses `getpass` fallback to echoed input. The code itself may be entered in shell history; the secret is entered later, without echo, and is never written to a file or command argument.

   ```sh
   python3 -c '
   import getpass, os, subprocess, sys, warnings

   if not sys.stdin.isatty() or not sys.stderr.isatty():
       raise SystemExit("Use an interactive terminal; secret input was not requested.")
   with warnings.catch_warnings():
       warnings.simplefilter("error", getpass.GetPassWarning)
       secret = getpass.getpass("Production GROWTH_REPORT_SECRET (hidden): ")
   if not secret or any(char.isspace() for char in secret):
       raise SystemExit("The report secret must be nonempty and contain no whitespace.")
   child_env = os.environ.copy()
   child_env.pop("ADMIN_SECRET", None)
   child_env["GROWTH_REPORT_SECRET"] = secret
   child_env["GROWTH_REPORT_URL"] = "https://chinaeasebuddy.com/api/admin/growth-summary"
   raise SystemExit(subprocess.run(["npm", "run", "report:growth"], env=child_env).returncode)
   '
   ```

   The report subprocess receives the secret in its environment only. Do not enable shell tracing, print the child environment, or save the secret to a local configuration file. Keep the password-manager entry as the retained copy.

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

Production needs the separate encrypted `GROWTH_REPORT_SECRET` in addition to the already configured Firebase service-account variables/permissions. Keep the existing `ADMIN_SECRET` unchanged for activation; no database, service, or frontend configuration is added. `GROWTH_REPORT_URL` is local CLI configuration only. No secret value is committed or used during tests. Follow the configuration/deployment boundary above before using the updated report command.

## Local verification

- Network-isolated endpoint tests cover auth, method/read-only/no-store behavior, actual event selectors, windows, preview/test exclusion, duplicate avoidance, normal/blocked leads, outcomes, purchases/statuses, revenue null, private raw values/errors, top-ten breakdowns, timestamp ties/snapshot pagination, exact-cap completion and overflow failure.
- CLI tests cover configuration, URL/redirect/header guards, complete JSON, and secret-safe failures.
- Existing campaign/attribution, lead-source, release, itinerary-email, lead-quota, free-chat-quota and pass regressions run unchanged.
- Typecheck, production frontend build, an explicit Workers-compatible endpoint bundle, targeted ESLint, final diff review, and whitespace checks.

All tests use generated local keys and test doubles. No live admin request or production collection read was performed. No deployment or merge to main is part of this review.
