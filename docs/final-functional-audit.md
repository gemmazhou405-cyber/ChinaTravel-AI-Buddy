# Final Functional Stabilization Audit

Last updated: 2026-07-15

## Scope

This pass focused on launch-critical functional stability without redesigning the homepage, changing approved scenario images, switching PayPal Live, or adding unverified product claims.

## Local commits

- `90ab67d fix: stabilize Ask Buddy and Coze integration`
- `90063d0 fix: unify checkout and membership activation`
- `cb7f020 fix: align launch copy with verified capabilities`

An additional SEO crawlability source fix is pending in the working tree and should be committed after review.

## Ask Buddy

- Browser chat now uses `/api/buddy/chat`, not a public Coze URL.
- The Pages Function verifies Firebase auth, validates request shape, reserves quota server-side, calls the Coze proxy, stores completed reply metadata for idempotent duplicate requests, and rolls back quota on upstream failure.
- The Coze proxy normalizes successful replies to `{ reply: string }` and supports Coze v3 non-streaming create, retrieve, and message-list polling.
- The Coze proxy requires `COZE_INTERNAL_SECRET` for non-local requests.
- Frontend retry reuses the same `requestId` and does not append a duplicate user message.
- Guest users are asked to create a free account before using Buddy.

Required Cloudflare runtime variables:

- Pages Function: `COZE_WORKER_URL`, `COZE_BOT_ID`, `COZE_INTERNAL_SECRET`, Firebase service credentials.
- Coze Worker: `COZE_TOKEN`, `COZE_INTERNAL_SECRET`.

If either side lacks `COZE_INTERNAL_SECRET`, production Buddy will intentionally fail closed rather than expose the proxy.

## Payment And Entitlements

- New paid CTAs no longer use Gumroad as the primary purchase destination.
- In `VITE_PAYMENT_MODE=sandbox`, paid CTAs open the PayPal order/capture checkout modal.
- In `manual` mode, paid CTAs use the current manual PayPal payment links as fallback.
- Successful capture refreshes user state after entitlement activation.
- Active paid pass users are blocked from creating another purchase in the UI.
- Paid CTA analytics continue to use `cta_clicked` with `plan: trip_pass` or `plan: group_pass`.

Plan values used by the server catalogue:

- Free: 5 Buddy AI messages.
- Trip Pass: USD 9.90 one-time, 50 Buddy AI messages, 20 scan fields retained for future backend support, 7 days.
- Group Pass: USD 29.90 one-time, 200 Buddy AI messages, 100 scan fields retained for future backend support, 14 days, one shared account.

Live PayPal remains disabled.

## Menu Photo / Scan Truthfulness

Final approach: safe default / private testing.

- Public homepage, scenario, toolkit, city-guide, FAQ, and pricing copy no longer advertise menu photo translation as a generally available paid feature.
- Public copy now frames food help as dish reference, restaurant phrases, possible ingredient/common allergen reminders, and private testing for menu photo help.
- Existing scan fields remain in code and server plan catalogue for future implementation, but public UI should not sell scan quota as an active capability.
- Safe allergen wording is retained: possible ingredients/common allergens only, always confirm with restaurant staff, no guarantee or medical claim.

## SEO / Crawlability

Production audit before deployment showed:

- Guide pages return unique static HTML with title, meta description, H1, visible body content, links, and valid JSON-LD.
- Production canonical URLs currently still point to the old `chinaease-buddy.pages.dev` source and will need redeploying after the source fix.
- Production homepage static fallback was too thin and lacked `Travel Passes`, `Buddy AI`, `/guides`, and `/pricing`.

Source fixes now made:

- `index.html` canonical, Open Graph, Twitter image URLs, and schema URLs use `https://chinaeasebuddy.com`.
- `scripts/copy-policy-pages.mjs` uses `https://chinaeasebuddy.com` for generated static pages and sitemap.
- `public/robots.txt`, `public/sitemap.xml`, and `public/llms.txt` use the production domain.
- `index.html` fallback content now contains one product H1, Travel Passes, Buddy AI, Guides, Pricing, FAQ, and core guide links.

Production `npm run audit:public-html` should be rerun after deployment.

## Validation Results

Passed locally:

- `npm run test:buddy`
- `npm run typecheck`
- `npm run build`
- `node scripts/audit-firestore-rules.mjs`

Production public HTML audit:

- First run without network permission failed due sandboxed fetch.
- Network-enabled run reached production and found 13 failures caused by old deployed source:
  - canonical URLs still pointed to pages.dev.
  - homepage static fallback lacked enough body content/keywords/links.
- Source fixes are present locally but not reflected on production until deployment.

Build warnings:

- Browserslist database is outdated.
- Main JS chunk is larger than 500 kB. This is existing technical debt, not introduced by this pass.

## Firestore Rules

Rules audit passed:

- Broad `users` read/write rejected.
- Free user creation requires Firebase auth email match.
- Client cannot create paid user plan or edit sensitive counters/entitlements.
- `usageRequests` server-write only, own reads only.
- `orders` and `entitlements` client writes denied, own reads only.
- `paypalWebhookEvents` fully denied.
- `newsletterLeads` fully denied.
- `analyticsEvents` create-only preserved.
- `paymentClaims` use canonical `trip_pass` / `group_pass`.

## Still Requires Owner / Deployment Work

- Deploy the local commits and source fixes to Cloudflare Pages production.
- Configure matching `COZE_INTERNAL_SECRET` on both Pages and the `chinaease-proxy` Worker if not already present.
- Run production `/api/buddy/chat` with a real verified Firebase user after deployment.
- Rerun `npm run audit:public-html` against production after deployment.
- Complete PayPal Sandbox buyer approval and webhook tests before any live payment cutover.
- Do not switch `PAYMENT_MODE=live` until Sandbox order creation, capture, webhook reconciliation, and entitlement activation all pass.

## Files Intentionally Not Included

- `mac_storage_scan_report_20260709_215150.md` remains untracked and was not committed.
