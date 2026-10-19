# SEO optimization tracker

Use this log for every change intended to affect organic search. The date of a code commit is **not** a Google recrawl date. A successful live URL test is **not** proof that Google indexed the page.

## Changes and pre-change baselines

The performance baseline below comes from the GSC `sc-domain:chinaeasebuddy.com` Web search export downloaded on 2026-10-16. Its 28 complete daily rows cover **2026-09-16 through 2026-10-13**. These are **page-level** metrics, not keyword search volumes. The export's separate `Queries` sheet is site-wide; it cannot attribute a query to a particular page.

| Change ID | Live date / commit | Canonical page | Hypothesis and changed surface | GSC baseline: clicks / impressions / CTR / avg position | GSC URL Inspection baseline | Page-filtered query baseline | Next observation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SEO-2026-10-16-AMAP | 2026-10-16 / `3e04e79` | `/amap-english-mode-guide-2026/` | Answer English-setting steps and partial translation problems on the existing guide; keep URL and canonical. | 0 / 69 / 0% / 13.97 | Not recorded; inspect exact canonical URL | Not available in this workbook; do not assign site-wide `amap english` queries to this page | Record URL Inspection status, last crawl, Google canonical, then page-filtered Queries and page totals for complete 7- and 28-day periods. |
| SEO-2026-10-18-AIRPORT | 2026-10-18 / `5a0f404`, `a6ac34b` | `/china-airport-arrival-guide/` | Clarify search title and description; align static HTML and React H1; lead with immigration-to-hotel checklist; remove unsupported 30-minute promise. | 0 / 27 / 0% / 9.07 | Not recorded; inspect exact canonical URL | Not available in this workbook; do not assign site-wide `china arrivals` to this page | Record URL Inspection status, last crawl, Google canonical, then page-filtered Queries and page totals for complete 7- and 28-day periods. |
| SEO-2026-10-19-SIM | 2026-10-19 / `57068f1`, `a965bed` | `/china-sim-card-for-foreigners/` | Put the physical SIM/passport answer before eSIM, clarify official store and documented airport options, remove unverified CAN airport promise from the snippet; unchanged title, URL and canonical. | 0 / 31 / 0% / 25.23 | Not recorded; inspect exact canonical URL | Not available in this workbook; site-wide `china sim card` (5 impressions, avg position 49.2) and `sim card for china` (2, position 51) are intent clues only, not proven page-query pairs | Record URL Inspection status and last crawl, then export Queries filtered to this exact page for complete 7- and 28-day windows. |
| SEO-2026-10-19-YANGSHUO | 2026-10-19 / `0c3ed29`, `655578e` | `/3-day-guilin-yangshuo-itinerary/` | Add a three-day Yangshuo-only base option, station/transfer checks and matching FAQ to the existing itinerary; refresh description and review date, keep title, URL and canonical. | 0 / 43 / 0% / 58.58 | Unknown; inspect exact canonical URL | Not available in this workbook; site-wide `yangshuo itinerary` (13 impressions, position 80.77) and `guilin yangshuo itinerary` (12, position 81.0) are intent clues only, not proven page-query pairs or search volume | Record indexed state and last crawl, then export Queries filtered to this page for complete 7- and 28-day periods; compare the same query after Google recrawls. |
| SEO-2026-10-19-WECHAT-VERIFY | 2026-10-19 / `d5571e1`, `bc2a49d` | `/wechat-verification-without-friend-qr-2026/` | Clarify the no-friend QR prompt in the description and first answer; add decision table separating registration, recovery and payment identity checks; keep title, URL and canonical. | 1 / 52 / 1.92% / 5.94 | Unknown; a performance click suggests search visibility but is not URL Inspection evidence | Not available in this workbook; site-wide `wechat verification without friend 2026` (3 impressions, position 7.67) is an intent clue only, not a proven page-query pair or search volume | Inspect index state and last crawl; compare page-filtered queries, CTR and same-query ranking in complete equal windows after recrawl. |

The 2026-10-13 end date means the baseline is **not** an immediately adjacent pre-change window. Use it as a reference, not a controlled before/after comparison. Save the export name and exact dates for each later snapshot.

## Observation records

Append one row per **change ID and observation date**. Never overwrite a prior snapshot. `Unknown` is a valid value; leave no field that could be mistaken for a confirmed index state.

| Change ID | Observation date | GSC report last updated | URL Inspection: indexed? | Last Google crawl | Google-selected canonical | Performance window (start–end, complete days) | Page clicks / impressions / CTR / avg position | Page-filtered queries: examples, impressions, position | Export or screenshot | Interpretation / next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SEO-2026-10-16-AMAP | Pending | Unknown | Unknown | Unknown | Unknown | Pending | Pending | Pending | Pending | Wait for dated GSC evidence. |
| SEO-2026-10-18-AIRPORT | Pending | Unknown | Unknown | Unknown | Unknown | Pending | Pending | Pending | Pending | Wait for dated GSC evidence. |
| SEO-2026-10-19-SIM | Pending | Unknown | Unknown | Unknown | Unknown | Pending | Pending | Pending | Pending | Wait for dated GSC evidence. |
| SEO-2026-10-19-YANGSHUO | Pending | Unknown | Unknown | Unknown | Unknown | Pending | Pending | Pending | Pending | Wait for dated GSC evidence. |
| SEO-2026-10-19-WECHAT-VERIFY | Pending | Unknown | Unknown | Unknown | Unknown | Pending | Pending | Pending | Pending | Wait for dated GSC evidence. |

## Collection steps for each SEO change

1. **Before publication:** record exact canonical URL, intended query and search intent, change hypothesis, live date/commit, and a complete pre-change GSC page window. Export the **page-filtered Queries** table for the same window. If unavailable, mark it `Unknown`; the site-wide Queries export is not a substitute.
2. **Index state:** in GSC URL Inspection inspect the **exact canonical URL** on `sc-domain:chinaeasebuddy.com`. Record the indexed report and its last crawl, Google-selected canonical, and the date of the report. A live test only checks eligibility; record it separately. If the page was already indexed, check whether Google recrawled after the change.
3. **At each review:** capture a complete 7-day window first, then a complete 28-day window after recrawl when enough data exists. For a clean comparison use the immediately preceding, non-overlapping window of equal length, same search type, same URL, and same filters. Do not include partial days or an overlapping pre/post period. Account for GSC reporting delay.
4. **Keyword coverage:** use a query table filtered to the **same page**, with its exact date range. Record visible query, clicks, impressions and position. Label newly visible queries as `first observed in this export`, not as newly indexed or proven new demand; GSC hides some low-volume queries. If the export has only Pages and site-wide Queries, leave the page-query relationship unknown.
5. **Ranking:** compare the **same query on the same page** across equal windows, ideally with enough impressions to reduce noise. Page average position is a mix of queries and can move when query mix changes. Record CTR and clicks alongside ranking; do not promise a ranking increase from one edit.
6. **Decision:** keep, revise or revert only after considering recrawl timing, query match, impressions, clicks and sample size. If Google has not recrawled, the content change has not yet been tested in Search.

## Required GSC exports for the next review

- Performance → Search results → Web → 7 or 28 **complete** days → filter **Page: exact URL** → export both `Pages` and `Queries` for each changed URL; also export the matching immediately preceding equal-length period.
- URL Inspection screenshots or notes for each exact URL: indexed report, last crawl, Google canonical and inspection time. Save a separate live-test result if used.
- Keep exports with the observation date and exact window in the filename; place review notes in this file. Do not publish user/account identifiers or raw private GSC exports in the public website build.

Google documentation: [URL Inspection and live tests](https://support.google.com/webmasters/answer/9012289) and [performance filtering and anonymized queries](https://support.google.com/webmasters/answer/17011165).
