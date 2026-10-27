# ChinaEase Fiverr CTA migration — local review

Base: `019bfd32991766b0831b0407d95ded32f93ad8c9` (latest main pulled before this work).
No deployment or merge to main is part of this change.

## Baseline inventory (recorded before source edits)

Search: case-insensitive `fiverr`, `jyjZ6ma`, and `p3dZbQR` over all tracked repository text. Duplicate query matches count once per line. Git metadata, dependencies, and generated builds are excluded from the source inventory; hidden working-tree search found the same source matches.

**63 matching lines in 34 files; 83 literal `fiverr` substring occurrences** (including URLs and analytics identifiers; 81 standalone-word matches).

| Category | Matching lines | Files | Literal substrings |
| --- | ---: | ---: | ---: |
| 1. Public personalized planning and shared tracking | 8 | 4 | 8 |
| 2. Public app/setup copy and shared tracking | 22 | 12 | 22 |
| 3. Historical documentation and test/audit fixtures | 33 | 18 | 53 |
| 4. Unrelated/non-public content | 0 | 0 | 0 |
| Total | 63 | 34 | 83 |

Actual public source href definitions: **1 shared personalized-planning URL** (`https://www.fiverr.com/s/jyjZ6ma`) and **10 app/setup CTA URLs** (all `https://www.fiverr.com/s/p3dZbQR`). Source search hits are not separate public links. The pre-existing local build snapshot contained 69 generated personalized-planning hrefs and 10 generated app/setup hrefs; generated duplicates are excluded from the source counts.

Historical specs and release records remain historical evidence. Active renderer, analytics, and audit/test expectations are updated to match current behavior.

### Complete matching-file inventory

Each row lists every matching line for that file at the base commit.

| Category | File | Baseline lines |
| --- | --- | --- |
| 1 | `scripts/render-planning-help.mjs` | 12 |
| 1 | `src/components/LinBox.tsx` | 20 |
| 1 | `src/data/planningHelp.json` | 4, 8, 9 |
| 1 | `src/lib/analytics.ts` | 162, 166, 167 |
| 2 | `scripts/render-amap-guide.mjs` | 61 |
| 2 | `src/components/AmapGuide.tsx` | 158 |
| 2 | `src/data/airportArrivalGuide.json` | 23, 24 |
| 2 | `src/data/alipayMetroGuide.json` | 24, 25 |
| 2 | `src/data/amapEnglishSetup.json` | 20, 21 |
| 2 | `src/data/appsHubGuide.json` | 29, 30 |
| 2 | `src/data/checklistGuide.json` | 28, 29 |
| 2 | `src/data/didiGuide.json` | 24, 25 |
| 2 | `src/data/didiPaymentGuide.json` | 23, 24 |
| 2 | `src/data/mapsGuide.json` | 27, 28 |
| 2 | `src/data/tenpaygoGuide.json` | 24, 25 |
| 2 | `src/data/wechatVerificationGuide.json` | 22, 23 |
| 3 | `docs/seo/airport-arrival-spec.md` | 99, 259 |
| 3 | `docs/seo/alipay-metro-spec.md` | 99, 210 |
| 3 | `docs/seo/amap-page-spec.md` | 24, 161, 370 |
| 3 | `docs/seo/apps-hub-spec.md` | 111, 254 |
| 3 | `docs/seo/checklist-spec.md` | 108, 240 |
| 3 | `docs/seo/didi-guide-update/didi-guide-spec.md` | 112, 292 |
| 3 | `docs/seo/didi-payment-spec.md` | 110, 263 |
| 3 | `docs/seo/maps-update/maps-spec.md` | 250 |
| 3 | `docs/seo/optimization-tracker.md` | 5, 13 |
| 3 | `docs/seo/quality/2026-10-23-amap-and-site-quality.json` | 270, 450 |
| 3 | `docs/seo/quality/2026-10-23-amap-and-site-quality.md` | 24, 26 |
| 3 | `docs/seo/quality/2026-10-23-lin-help-rollout.md` | 9 |
| 3 | `docs/seo/quality/2026-10-23-pricing-scope-fix.md` | 3, 5, 9 |
| 3 | `docs/seo/tenpaygo-update/tenpaygo-spec.md` | 117, 309 |
| 3 | `docs/seo/wechat-verification-spec.md` | 103, 235 |
| 3 | `scripts/audit-live-lin-help.py` | 91 |
| 3 | `scripts/audit-public-html.mjs` | 301 |
| 3 | `scripts/test-amap-guide.mjs` | 24 |

## Shared personal-planning conversion

The existing free route-help email, subject, label, and existing free-response copy remain unchanged. The Free Trip Starter and digital Trip/Group products remain separate from paid human planning.

The paid action is **Ask about paid trip planning**, opening the user's email client at `lin@chinaeasebuddy.com` with subject **Paid China trip planning**. The structured body requests travel dates, cities, number of travelers, whether an itinerary already exists, and main questions/priorities; it asks users not to include sensitive information. No email is sent automatically and no checkout is introduced.

Only the user-confirmed starting prices are displayed:

- Itinerary review & fix — from $20
- Custom China itinerary — from $40
- Guide / private driver — ask for a quote

Guide/driver copy requires consultation and allows ChinaEase to match or coordinate third-party providers. It does not claim ChinaEase operates those services. No new delivery times, revision counts, booking guarantees, supplier guarantees, or additional package prices are introduced.

The existing `cta_clicked` pipeline is retained. `paid-planning` uses `planning_paid_planning_click`; free email retains `planning_email_click`. Setup-guide clicks use `app-setup` / `app_setup_guide_click`. Placement and session/UTM attribution remain in the existing pipeline.

## App/setup decisions

Each link was reviewed by intent. The replacements below are existing free guide sections; these CTAs do not lead to the paid itinerary email and no app-setup service is created. The surrounding CTA copy now describes self-service resources rather than promising human setup or successful verification.

| Source JSON | Original intent | Existing free destination |
| --- | --- | --- |
| `amapEnglishSetup.json` | Amap language/taxi/metro setup | `/amap-english-mode-guide-2026/#switch` |
| `mapsGuide.json` | Amap installation after map comparison | `/amap-english-mode-guide-2026/#download` |
| `wechatVerificationGuide.json` | WeChat verification and payment alternatives | `/wechat-verification-without-friend-qr-2026/#no-helper` |
| `tenpaygoGuide.json` | TenPayGo registration/card setup | `/tenpaygo-for-tourists/#sign-up` |
| `didiGuide.json` | DiDi installation/setup | `/didi-in-china-for-foreigners/#download` |
| `didiPaymentGuide.json` | DiDi payment options | `/didi-payment-for-foreigners/#alipay-wechat` |
| `alipayMetroGuide.json` | Alipay metro ride-code setup | `/alipay-metro-qr-transport-code-guide/#alipay-ride-code` |
| `appsHubGuide.json` | Essential apps before travel | `/china-travel-apps/#before` |
| `checklistGuide.json` | Pre-trip app preparation | `/china-travel-apps/#before` |
| `airportArrivalGuide.json` | Arrival connectivity/app preparation | `/china-travel-checklist/#apps-and-connectivity` |

All ten target routes and fragment IDs exist. No ambiguous Fiverr links are intentionally retained. Historical documentation links remain unchanged.

## Scope boundaries and validation

Trip Pass remains $9.90 / 14 days / 2 devices / 50 Buddy messages; Group Pass remains $29.90 / 14 days / 5 devices / 200 Buddy messages. Both retain full Premium Toolkit access. Payment handlers and the device-cap issue are outside this change.

Validation results are recorded in the Draft PR after local checks. No new route, indexable page, or sitemap entry is introduced.

Fresh baseline main and migration builds have identical generated sitemap URL sets (68 entries); route generation is unchanged.

### Completed local validation

All checks passed:

- `npm run typecheck` (including locale and campaign key parity).
- `npm run build` (existing Browserslist/chunk-size warnings only).
- `npm run test:planning-help`: real React/static parity, structured mailto, existing free CTA, three analytics actions/attribution, all 70 generated planning-help pages, six representative routes, all ten setup destinations and fragment targets.
- `npm run test:campaign-landings` and `npm run test:campaign-attribution`.
- `npm run test:release-fixes`, `npm run test:amap-guide`, and `npm run test:pass-entitlements`.
- `npm run test:premium-upgrade` with bundled Playwright against the local production build; Trip/Group checkout URLs and premium states remain correct; all network/payment/activation requests mocked.
- `python3 scripts/audit-page-quality.py`: 70 checked pages, 67 expected planning-help pages covered by its sitemap-based selection.
- `AUDIT_ORIGIN=http://127.0.0.1:4174 npm run audit:public-html`: all checks passed on a temporary local server honoring the existing redirect rules.
- Updated `audit-live-lin-help.py` check function exercised against all six representative local pages; no production fetches.
- Browser checks on homepage, `/plan/`, `/pricing/`, `/7-day-china-itinerary/`, `/china-payment-guide/`, and Amap, both with and without JavaScript: paid mailto parameters, unchanged free CTA, native guide navigation, and preserved attribution. Mailto navigation was intercepted; no email was sent. Desktop/mobile layout visually inspected.
- Targeted ESLint and Python compilation.
- Public source/build search: zero Fiverr destinations remain in public personal-planning or setup CTAs. Historical records and regression assertions remain intentionally searchable.
- Protected-file assertions: digital pass prices/terms, purchase links, entitlement and payment/device handlers, existing guide content/metadata, historical `docs/seo` files, and route definitions unchanged.

No ambiguous setup links remain. A mailto opens the user's email client; this is an inquiry handoff, not a purchase or email-delivery confirmation. Mailbox delivery and service fulfillment were not tested.

### Changed-file manifest

- `docs/reviews/fiverr-cta-migration-2026-10-27.md`
- `package.json`
- `scripts/audit-live-lin-help.py`
- `scripts/audit-page-quality.py`
- `scripts/audit-public-html.mjs`
- `scripts/render-amap-guide.mjs`
- `scripts/render-planning-help.mjs`
- `scripts/test-amap-guide.mjs`
- `scripts/test-planning-help.mjs`
- `src/components/AmapGuide.tsx`
- `src/components/LinBox.tsx`
- `src/data/airportArrivalGuide.json`
- `src/data/alipayMetroGuide.json`
- `src/data/amapEnglishSetup.json`
- `src/data/appsHubGuide.json`
- `src/data/checklistGuide.json`
- `src/data/didiGuide.json`
- `src/data/didiPaymentGuide.json`
- `src/data/mapsGuide.json`
- `src/data/planningHelp.json`
- `src/data/tenpaygoGuide.json`
- `src/data/wechatVerificationGuide.json`
- `src/lib/analytics.ts`

### Latest-main synchronization

During the final fetch, main advanced to `f3a5d7514e533434b12367f10a6b8aa6c7b7f4ef` with the Nanjing guide update. The unpublished review branch was rebased onto it without conflicts. Nanjing content, sources, rich rendering, inbound links, and both updated audit sections were preserved. The original pre-edit reference inventory remains tied to `019bfd32991766b0831b0407d95ded32f93ad8c9`; latest main introduces no additional Fiverr references. Typecheck, production build, planning/analytics/pass/release checks and generated-page audits were repeated after synchronization.
