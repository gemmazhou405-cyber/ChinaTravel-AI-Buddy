# Final Functional Stabilization Checklist

Scope: functional repair only. Do not redesign the approved homepage, replace approved image assets, push changes, or include `mac_storage_scan_report_20260709_215150.md`.

## Pre-change audit

- [x] Inspect current git status.
- [x] Inspect payment API routes.
- [x] Inspect existing plan/entitlement helpers.
- [x] Inspect current Ask Buddy frontend, Pages Function, and Coze proxy Worker.
- [x] Preserve unrelated working functionality and approved visual assets.

## Phase 1 — Ask Buddy Reliability

- [ ] Normalize Coze proxy to support immediate, message-list, and polling-based Coze v3 responses.
- [ ] Validate `COZE_BOT_ID` in the Pages Function before contacting the proxy.
- [ ] Require matching `COZE_INTERNAL_SECRET` between Pages Function and `chinaease-proxy` in production.
- [ ] Send recent safe multi-turn context from `ChatModal`.
- [ ] Add retry UX for provider failures without double-charging quota.
- [x] Store completed reply for idempotent duplicate requests.
- [x] Make rollback request-specific and safer under concurrency.
- [x] Clarify free account requirement for Ask Buddy.
- [x] Add focused tests for auth, provider errors, Coze response shapes, idempotency, and rollback.

## Phase 2 — Unify Payment And Membership Activation

- [x] Report missing backend pieces before frontend changes.
- [ ] Create shared checkout controller/component for all paid CTAs.
- [x] Remove Gumroad from primary new-purchase CTAs.
- [x] Use PayPal create/capture/status flow consistently.
- [x] Implement return/cancel/status UX based on server-side status.
- [x] Reconcile plan configuration across server, frontend, account display, and quota checks.
- [x] Keep manual claims only as manual-mode or emergency fallback.
- [x] Remove Gumroad from new-purchase flows while retaining legacy backend claim/webhook code.
- [ ] Add success state with plan, expiry, and remaining Buddy allowance.
- [ ] Improve account purchase/usage status.
- [ ] Add payment tests for invalid plan/amount/currency, duplicate capture, active pass, pending/cancelled/completed states.

## Phase 3 — Copy And Product Truthfulness

- [x] Remove public claims that menu-photo translation is generally available.
- [x] Preserve safe allergen language and no guarantee wording.
- [ ] Clarify no-VPN claims.
- [ ] Soften foreign-card acceptance claims.
- [x] Make every plan state exact validity, total Buddy allowance, daily allowance, and activation timing.
- [ ] Add “Free account required. No card required.” near Ask Buddy entry points.

## Phase 4 — Product UX And Fallbacks

- [ ] Add helpful toolkit fallback links when Buddy is unavailable.
- [ ] Improve quota exhausted messaging with total/daily distinction.
- [ ] Improve account panel plan/expiry/usage/pending state.
- [ ] Improve checkout accessibility and popup-blocked fallback.
- [ ] Add safe analytics events without PII or message text.

## Phase 5 — Validation

- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Run configured tests.
- [ ] Run focused API/curl tests where credentials allow.
- [ ] Test specified viewport sizes and reduced motion.
- [ ] Confirm secrets are not in frontend bundle.
- [ ] Confirm direct `/coze` is blocked without internal token.
- [ ] Create `docs/final-functional-audit.md`.
- [ ] Commit each phase separately locally only.
