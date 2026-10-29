# Pass P0: manual revocation and isolated acceptance

These instructions describe the local implementation. They do not authorize a
production change, deployment or payment. No refund webhook or admin UI is added.

## Current scope and release blockers

The regular mocked regression suite covers new activation and a single existing
Pass per order, including failed writes, device limits and manual revocation.
Historical duplicate-Pass handling remains unresolved. Paid Buddy accounting is
locally fixed, covered by 33 mock tests, and has passed the three targeted real-QA
groups below. Production duplicate auditing, PR review/CI and actual payment
acceptance are separate; no production approval follows from this QA result.

Only missing-document GETs return `null`. Firestore write 404/403/503 responses
reject, and activation also verifies its created document response before issuing
a success result. A timeout after a committed create fails without a Cookie or
recovery code; retry reuses the stored Pass without resetting expiry or usage.

## Historical duplicate Passes — unresolved, no migration

The stable sale-derived ID prevents new concurrent first claims from creating
multiple Passes. Existing duplicates still have independent device lists and
recovery codes. A synthetic order with two valid historical Passes can therefore
exceed the order-wide 2/5-device limit. Production prevalence is unknown.

Run the explicit **offline failing reproducer**:

```sh
npm run test:pass-p0 -- --audit-legacy-duplicates
```

It runs the core regressions plus Trip/Group historical duplicate cases. The two
known cases fail and return a nonzero exit status; this is evidence of unresolved
business behaviour, not a passed acceptance test. The regular CI regression gate
does not run this diagnostic and must not be interpreted as release approval.

There is no automatic canonical-Pass selection, merging, deletion, usage reset or
device revocation. Where an order already has more active devices than its cap,
strict enforcement must invalidate at least one previously working device. Picking
which Pass, expiry, usage or recovery code survives requires a verified policy.
Silently blocking only new recoveries would not invalidate the old Cookies and
would not fix the order-wide cap.

### Proposed production read-only audit — not executed or authorised here

After separate authorisation, page through `passes` with a projection limited to
`gumroadSaleId`, `tier`, `createdAt`, `expiresAt`, `devices`, `messagesUsed`,
`messageAllowance`, `accessRevoked` and `accessRevokedAt`. Do not request email,
recovery-code hashes, Cookies, profiles or itinerary content. Firestore projection
must select the whole `devices` array; extract its IDs only in memory and do not
log the array or its binding timestamps. Group in memory by
order, checking the relevant `gumroadSales` revocation markers only for duplicate
groups. Report paging completeness and only aggregate counts of active duplicate
orders, distinct devices over the cap, and tier/expiry/usage conflicts. If internal
correlation is required, use a per-run randomly salted HMAC instead of raw sale,
Pass or device IDs. Do not write, delete, merge or reset anything. Review the
aggregate evidence and approve a compatibility policy before any remediation.
`queryOne(limit: 1)` cannot prove that an order has no duplicates.

Fix an audit timestamp and group the complete Sale ID exactly (no case folding or
truncation). Classify Passes as revoked first, then expired, currently valid, or
unknown, using the same explicit-false/audit-marker rules as runtime access.
Missing/malformed fields or unreadable order markers remain unknown. Report:

- Orders with multiple Pass documents, and counts of valid/expired/revoked/unknown
  Passes; orders with at least two currently valid Passes are a structural risk.
- Already-over-cap groups: distinct bound device ID union greater than 2/5.
- Direct-growth risk: device union plus independent remaining slots exceeds the
  cap. Remaining slots use each actual array length, as runtime binding does.
- Rearrangement risk: even full duplicate Passes sharing the same devices can
  replace a device on one Pass while another retains it. A union at or below the
  cap is therefore **not** proof of safety when multiple valid Passes remain.
- Mixed-tier and expiry/usage/device-data conflicts, separately from groups whose
  cap can be determined. Do not silently choose a cap for mixed tiers.

Do not request recovery-code hashes or Cookies to prove credential possession;
report structural/potential bypass separately from an observed device-count
violation. Record paging completeness and the limits of concurrent changes during
the scan. All results remain aggregate, with no raw personal identifiers.

The smallest proposed remediation, **not implemented**, is an explicit canonical
Pass pointer on the existing order record after the audit and conflict policy are
approved. Claim, recovery, Buddy accounting and entitlement checks must all
resolve the same order identity, including old Cookies, recovery codes and
request ledgers; retain the historical Pass
documents. Do not default to earliest/latest expiry, add/reset usage, or choose
devices automatically. If a complete authorised audit finds no duplicates, record
that the historical precondition is absent rather than inventing a migration.
If duplicates exist, preserving all existing devices/expiry/usage while enforcing
an already-exceeded cap immediately is impossible. An operator-approved transition
could retain existing access until its original expiry while prohibiting new
growth, but that is an explicit temporary exception, not a completed strict-cap
fix. Do not implement that policy, select devices, or merge usage without approval.

## Paid Buddy accounting — local fix and targeted real QA passed

`pass-chat-quota.js` atomically commits the Pass counter and one request record
using the existing Firestore multi-write commit plus document-version/create
preconditions. This replaces the unsafe read/PATCH increment and absolute-value
rollback. No payment flow, membership tier or free-chat quota rule changes.

The record at `passes/{passId}/buddyRequests/{lowercaseRequestId}` stores only an
owner nonce, message/stream fingerprint, status and counting/timing metadata;
never the message, context or reply text. Context is deliberately excluded from
the fingerprint because the existing UI rebuilds it on a confirmed-failure retry.
`reserved`/`consumed` duplicates cannot invoke AI or charge again. A `released`
request with the same message/transport may reserve a new attempt with a new owner.
Different messages/transports with the same request ID are rejected.

Reservation acknowledgement loss is reconciled by reading the same owner's
record. If the commit cannot be confirmed, no AI call is made. A release changes
only that owner's still-reserved record and decrements the **current** Pass
counter in the same atomic commit. It is idempotent and cannot refund a newer
attempt. Completion persistence failure never triggers a refund of an answer
already generated/delivered. No timeout-driven automatic release or background
cleanup system is introduced.

Known failed responses without output may release the reservation. Network
failures, aborts and Worker `upstream_timeout`/504 responses have uncertain AI
outcomes, so they stay charged/reserved and block replay with the same request ID.
This can temporarily hold one message; it is not an automatic refund guarantee.
A successful reply whose response is lost is not replayed from a stored answer;
duplicates are refused without a second AI call. Streaming starts consumption on
the first delta; an explicit failure/empty completion before content releases
quota and terminates the stream, so later deltas cannot escape after a refund.
Raw stream failures remain uncertain, and no delivered content is refunded.

`npm run test:paid-chat-quota` exercises the handler and CAS/owner protocol with
in-memory providers, including lost acknowledgements and stream outcomes. It is
part of the existing CI gate. It does not replace real Firestore verification.

| Area | Minimum acceptance standard |
| --- | --- |
| Legacy single Pass compatibility | Existing Cookie/code, expiry and used quota remain compatible. |
| Multiple historical Passes | Concurrent old Cookies, codes and order activation share one 2/5-device limit, with no silent deletion, usage reset or device selection. |
| Legacy conflicts and revocation | Approved tier/expiry/usage/device rules are explicit; revocation blocks every old/canonical path; read failure denies paid access. |
| Last Buddy message | Concurrent requests yield at most one reservation and one AI call. |
| Buddy success/failure interleaving | Only the failed request's reservation is released, once; other successful usage remains. |
| Buddy retry and network uncertainty | Duplicate request/release, changed content with the same ID, commit timeout and lost responses cannot produce extra calls or refunds. |
| Streaming | Failure before/after delivered content follows an approved consumption rule. |

The historical compatibility proposal is not implemented. Paid quota code is
implemented locally; neither this change nor the prior device QA constitutes
production or payment approval.

### Completed narrow real-QA follow-up for the new paid ledger

The earlier 11 real Firestore / 9 injected device-activation scenarios and cleanup
remain valid for their original scope, but did not exercise `buddyRequests`.
`scripts/test-paid-chat-firestore.mjs --run` completed only these three groups
against `chinaease-qa-20261029`, without repeating device tests:

1. Three requests competing for the last message, proving one reservation/AI call.
2. Same-ID replay and lost commit acknowledgements, proving no double charge/call.
3. Interleaved success/failure and repeated release, proving only the failed
   request's message is returned.

The AI endpoint was mocked, never a real customer/order or paid AI test. Actual
Firestore CAS conflicts: **5**. Lost acknowledgements: **2**, explicitly injected
only after real successful commits (one reserve, one release); these are not
claims that Google lost a response. The mixed case retained one successful charge
and one unknown-outcome reservation while releasing the definite failure once.

Result: **3/3 groups PASS**, exit 0. **8** owned synthetic parent/request documents
were explicitly deleted; **10** registered paths (including uncreated contenders)
were point-read afterward and all returned missing. Remaining **0**, unknown
**0**, out-of-scope requests **0**. No production access occurred.

Run prefix: `buddy-qa-f2b54424-45a4-4cb6-8452-740ff3d11a84`.
The runner registers each child request path, confirms ownership, waits for
settlement and explicitly deletes request children as well as parents. Deleting
a parent Pass alone does **not** delete its subcollection. This new cleanup result
supersedes neither the scope nor evidence of the earlier device QA.

The runner defaults to no execution, requires `--run`, rejects mismatched fixed
project/account configuration before any network access, and never reads a key
file itself. Credentials were injected only into its temporary process.

## Reproducible offline regression gate

The existing GitHub Actions job now runs P0, entitlements, dashboard/ClaimModal,
Firestore guard self-tests, Buddy paid-quota and free-chat regressions. A failed command
stops the job; the gate has no cloud credentials and never uses Firestore `--run`.
A local gate PASS does not prove a GitHub Actions result; record that result on
the Draft PR. Branch protection has not been changed or verified.

Browser tooling stays outside application dependencies, using the existing
workflow's fixed Playwright version. To reproduce locally without changing the
repository lockfile:

```sh
pass_browser_dir="$(mktemp -d)"
npm install --prefix "$pass_browser_dir" --no-save --package-lock=false playwright@1.62.1
PLAYWRIGHT_BROWSERS_PATH="$pass_browser_dir/browsers" "$pass_browser_dir/node_modules/.bin/playwright" install chromium
NODE_PATH="$pass_browser_dir/node_modules" PLAYWRIGHT_BROWSERS_PATH="$pass_browser_dir/browsers" npm run test:pass-dashboard
```

Linux CI adds `--with-deps` to the Chromium installation. All browser test API
requests are intercepted; these tests do not contact real orders or customers.

## Manual refund / dispute revocation

Use the existing Firestore Console with an authorised operator's IAM access.
Browser clients cannot write `gumroadSales` or `passes` under the repository rules.
Confirm the selected project before editing. Do not use real customers for QA.

1. Verify the exact order in the merchant's Gumroad account. Confirm a **full**
   refund or an effective dispute/chargeback; a notification or customer message
   alone is not sufficient. Record a non-sensitive internal evidence reference.
2. Find `gumroadSales/{saleId}`. If the sales notification was never stored,
   create that exact order document after verification; do not invent a new ID.
3. Set the following fields on that document, preserving all existing fields:

   | Field | Value / type |
   | --- | --- |
   | `accessRevoked` | boolean `true` — the actual access-control switch |
   | `accessRevokedAt` | timestamp of the operator action |
   | `accessRevocationReason` | `full_refund` or `dispute` |
   | `accessRevokedBy` | internal operator identifier |
   | `accessRevocationReference` | internal verification reference; no card/passport data |

4. Check that the related Pass is denied on a fresh entitlement request. The order
   marker covers **all** Passes with that `gumroadSaleId`, including historical
   duplicate Passes. Old cookies, recovery codes and the original order number
   cannot bypass the marker. No expiry/quota/device-list edits are required.

`status: refunded` alone is **not** the revocation switch. Do not delete an order,
Pass, recovery code or revocation field as a substitute for revocation; deletion
can lose the durable order block. Never rotate the shared session secret to revoke
one customer. Normal sale notifications and activation do not clear the marker.
Only an explicit boolean `false` clears a recorded block. Invalid flag values
(`null`, `0`, the string `"false"`) fail closed; deleting the flag while its
`accessRevokedAt` audit field remains also keeps access blocked.

Existing administrator-issued Passes without a Gumroad order can instead be
blocked with `passes/{passId}.accessRevoked: true` and the same audit fields.
Do not create an unrelated administrator Pass to work around a blocked order.

### Decisions that remain manual

| Situation | Rule |
| --- | --- |
| Verified full refund | Set the order block. No automatic restoration. |
| Verified effective dispute / chargeback | Set the order block pending a reviewed resolution. |
| Partial refund only | Do not automatically revoke; leave existing access unchanged pending a verified business decision. |
| Dispute won/closed notification | Do not automatically restore or clear an existing block. |
| Verification unavailable or ambiguous | Do not infer a new decision from unverified data; retain any existing block and escalate for review. |

If a previous dispute block is cleared after a verified resolution, the operator
sets `accessRevoked: false` and records `accessRestoredAt`, `accessRestoredBy` and
`accessRestorationReference`; retain the earlier audit fields. Clear a full-refund
block only as a documented correction to a verified mistake. Restoration never
extends `expiresAt`, resets usage, removes device limits or creates another Pass.
If Gumroad still reports `disputed: true`, the order-number claim remains rejected;
clearing the manual marker does not override provider verification.

Every new paid request reads the marker; a read failure fails closed. A request
already authorised before the revocation commit can finish. A cookie minted by an
in-flight activation cannot grant access on a subsequent request after revocation.
Already downloaded static content is outside this round's acceptance scope.

## Isolated real Firestore concurrency test

Use a separate, empty `chinaease-qa-*` or `chinaease-test-*` Google Cloud project,
enable Firestore/API with a `(default)` database, and use a service account with
Firestore read/write IAM **only in that QA project**. Do not copy customer data or
production credentials. Budget/quota and outbound Google API access are required.

The smallest practical predefined role is `roles/datastore.user`, granted only on
the QA project. It provides document get/list/create/update/delete and transaction
access, including deletion of this run's synthetic fixtures. Owner, Editor,
Firebase Admin and production IAM are not required. Provisioning the project/API,
database or service account is a separate operator action; the runner does none of
those. See the [official Firestore IAM roles](https://firebase.google.com/docs/firestore/security/iam).
Browser `VITE_FIREBASE_*` settings and the Firebase CLI default project are not QA
service-account credentials and are never used as a fallback.

The opt-in tool uses these dedicated environment variables, without falling back
to the application's normal `FIREBASE_*` variables:

- `CHINAEASE_PASS_TEST_PROJECT_ID`
- `CHINAEASE_PASS_TEST_CLIENT_EMAIL` — service account belonging to that project
- `CHINAEASE_PASS_TEST_PRIVATE_KEY` — keep outside the repository and logs
- `CHINAEASE_PASS_TEST_CONFIRM_PROJECT` — exact project ID, a separate confirmation

Safe local commands (no network):

```sh
node scripts/test-pass-firestore.mjs --self-test
node scripts/test-pass-firestore.mjs
```

`--self-test` checks configuration/URL guards, then starts a separate Node process
for `scripts/test-pass-firestore-prep.mjs` with no inherited cloud credentials.
The latter supplies runtime-generated RSA fixtures and an in-memory Google
transport, forbids real fetches, delays creation acknowledgements and exercises
CAS conflicts. It also proves an unrelated fixture is neither accessed nor
deleted. All output is marked `SIMULATED_FIRESTORE` or `INJECTED`; it is **not** a
real database/IAM acceptance. The preflight only reports presence booleans; the
script does not automatically load `.env` files.

Only after the dedicated configuration and QA write authorisation are available:

```sh
node scripts/test-pass-firestore.mjs --run
```

The tool rejects production, mismatched credentials, non-QA project names, other
database names and lookalike URL prefixes.
Gumroad stays mocked: this is **not a payment test**. Only the selected QA project's
Firestore and Google OAuth endpoints may receive network requests; redirects are
rejected. Exact synthetic order/Pass paths are registered before use. Responses
from this run confirm document ownership, including when another handler sees a
committed create before its creator receives the response. Merely attempting a
write never grants cleanup permission. Cleanup is limited to confirmed owned
synthetic documents, never existing devices/customer records. A write of unknown
outcome is checked through a guarded read; unresolved ownership or cleanup leaves
the run NOT VERIFIED and requires inspection of its synthetic run prefix. The
script never scans customer records or bulk-clears collections.

| `--run` evidence class | Prepared coverage |
| --- | --- |
| `QA_FIRESTORE` | Missing-document GET 404; concurrent first activation/one Pass; Trip/Group 2/5 caps; last-slot claim/recovery CAS; removal of a synthetic device and old Cookie denial; recovery; synthetic full-refund and dispute revocation blocking Cookie/code/order. |
| `INJECTED` | Create 404/403/503/500, network failure, invalid JSON/empty response; confirmed create followed by simulated response timeout and idempotent retry without resetting expiry/usage; failed device commit issuing no Cookie or device slot. |

Injected HTTP/network failures occur only after the synthetic target passes the
same QA guards, before the Google transport (except the explicitly labelled
post-commit timeout). They do not prove that Google generated those failures. No
actual refund or Gumroad order is used. The normal fresh-order/single-Pass
scenarios do not resolve the two historical/Buddy blockers documented above.
Cloud acceptance remains **NOT VERIFIED** until `--run` completes against that
isolated project. Preflight/guard success is not a real Firestore test result.

### Remaining authorisations

The dedicated QA setup and both scoped QA runs have now been authorised and
completed. Their authorisation never included production data, customer device
cleanup, migration, deployment or real payment.

1. Separately authorise the proposed production read-only aggregate audit. It
   must not silently expand to remediation or device removal.
2. If active duplicate Passes exist, approve the compatibility/entitlement policy
   before a narrowly scoped remediation; otherwise record the complete audit's
   exclusion of that historical precondition.
3. Draft PR publication is authorised. Obtain review and actual CI results, then
   separately approve any merge, deployment and controlled real-payment acceptance.

## Production configuration checklist (read-only verification first)

| Environment variable | Verify |
| --- | --- |
| `GUMROAD_ACCESS_TOKEN` | Server-only token can read this merchant's relevant orders; never a `VITE_*` value. |
| `GUMROAD_TRIP_PRODUCT_ID` | Exact opaque `product_id` of the actual Trip Pass. Required. |
| `GUMROAD_GROUP_PRODUCT_ID` | Exact opaque `product_id` of the actual Group Pass. Required and different from Trip. |
| `GUMROAD_TRIP_PERMALINK` | Same Trip product's `product_permalink`; source default `oentc` is not proof of live configuration. |
| `GUMROAD_GROUP_PERMALINK` | Same Group product's `product_permalink`; source default `mbgkxz` is not proof of live configuration. |
| `GUMROAD_WEBHOOK_SECRET` | Existing sales notification shared secret matches its configured URL. No new refund callback is needed for manual revocation. |
| `VITE_GUMROAD_TRIP_URL` | Public checkout resolves to that exact Trip product. |
| `VITE_GUMROAD_GROUP_URL` | Public checkout resolves to that exact Group product. |
| `SESSION_SECRET` | Present, server-only and consistent for the deployed membership handlers. |
| `FIREBASE_PROJECT_ID` | Intended application database; never used by the isolated QA runner. |
| `FIREBASE_CLIENT_EMAIL` | Correct service account with the intended project access. |
| `FIREBASE_PRIVATE_KEY` | Present as a protected server secret; never printed or committed. |

Compare ID, permalink, final checkout destination and the provider's returned
product fields together. Product names are not an authorisation fallback. Keep
Trip at $9.90 / 14 days / 2 devices / 50 messages and Group at $29.90 / 14 days /
5 devices / 200 messages. No human-service entitlement is introduced.

## Conditions before a controlled real-payment acceptance

- Review the local diff and explicitly approve the next delivery/deployment step.
- Preserve the completed scoped device and paid-ledger QA evidence; repeat only
  affected scenarios if later code changes warrant it.
- Resolve or formally exclude the historical duplicate-Pass precondition through
  the authorised read-only audit and any separately approved compatibility work.
- Independently verify the above merchant/product configuration; no keys in evidence.
- Assign an authorised operator and rehearse the manual block/restore procedure
  using synthetic QA orders, including old cookie and recovery-code rejection.
- Approve a separate controlled payment plan, test identity, spending limit and
  refund/dispute handling. Mocked Gumroad/Firestore tests do not replace this step.

Draft PR publication is authorised. Merge, production data changes, deployment
and real payment remain unauthorised.
