# 240-hour transit calculator: ranking work, 2026-10-21

## Outcome and access

Primary URL: https://chinaeasebuddy.com/china-240-hour-transit-calculator/

Primary outcome is Google organic clicks to that exact URL. Same-page, same-query ranking, relevant impressions and CTR explain progress. Passing a build, a live test or a working form does not prove ranking gains.

Latest available GSC export: supplied 2026-10-21 as `chinaeasebuddy.com-Performance-on-Search-2026-10-21.xlsx`. Filters are Web (text-based), Last 3 months and the exact calculator URL. Its 57 daily rows cover 2026-08-23–2026-10-18. Page totals are 0 clicks / 10 impressions / 0% CTR / average position 22.5. Unlike the earlier site-wide exports, this export's Queries sheet is page-filtered and establishes the two visible page-query pairs below. It is not a two-period comparison and ends before the October 20–21 changes. The older September 20–October 17 reference also had 0 / 10 / 0% / 22.5; their overlapping windows are not evidence of improvement or deterioration.

Current URL Inspection indexed state, Google-selected canonical and last Google crawl: **Unknown**. Historical GSC impressions show the URL has appeared in search, but do not establish its current indexed state. Ahrefs is now installed and its data interfaces are available. Actual requests for projects, account usage, exact-page organic keywords and candidate keyword metrics all returned `Insufficient plan`. Official Ahrefs documentation says MCP access requires Lite or higher. This is a plan restriction, not a website verification failure. No search volume, keyword difficulty or Ahrefs ranking data was retrieved. A direct GSC reader remains unavailable; the supplied export is the evidence source.

## Page-filtered query baseline supplied October 21

| Query | Clicks | Impressions | CTR | Average position | Decision |
| --- | --- | --- | --- | --- | --- |
| transit through mainland | 0 | 1 | 0% | 4.0 | Broad transit intent; one impression does not establish a stable top-four rank or keyword demand. Do not retitle the calculator around it. |
| visa free china | 0 | 1 | 0% | 193.0 | Broad entry-policy intent; retain the visa-free guide as the intended owner rather than widening the calculator. |

Visible queries account for 2 of 10 page impressions. The remaining 8 impressions have no disclosed query in this export; do not infer their wording, country or rank. The country and device tables each cover only 2 impressions, so do not treat those tables as complete audience distributions. Calculator/TWOV/deadline candidates are absent from the visible queries; this means their coverage is unconfirmed, not proven absent.

All nonzero daily impressions precede the latest changes: October 11 has 6 impressions at average position 36.0, October 12 has 1 at 2.0, and October 16 has 3 at 2.3. These are mixed-query daily averages, not a progression in the rank of one keyword. Ten impressions and zero clicks are too little evidence to blame the title or estimate a reliable CTR lift.

Decision: retain the October 20 title/description and October 21 content while collecting post-change evidence. Record exact-URL Inspection status, crawl time and Google-selected canonical next. Inspect the first complete post-change seven-day window October 22–28 only after GSC reports it, and interpret outcomes in light of recrawl. Do not create another calculator, merge it into a policy guide or claim the recent changes succeeded or failed. No website content changes were made during this export review.

Sources: user-supplied GSC workbook (Filters, Chart, Pages, Queries, Countries and Devices); https://help.ahrefs.com/en/articles/13913559-getting-started-with-ahrefs-mcp .

## Search-intent research

Public web searches were run for six combinations of 240-hour transit calculator, 10-day calculator, TWOV expiry and departure deadline. Results provide intent examples and competing pages, not a localized Google rank check or a volume estimate. Search-result order is not recorded as Google position. Demand and low competition remain unverified for every candidate below.

| Candidate phrase | Intent | Page owner / decision |
| --- | --- | --- |
| china 240 hour transit calculator | Find a tool | Calculator; primary existing intent, retain October 20 title |
| 240 hour visa free transit calculator | Find a tool | Calculator; closely related existing intent |
| china TWOV calculator | Find a tool using the TWOV abbreviation | Calculator; explain abbreviation naturally |
| china 10 day visa free transit calculator | Calculate a 10-day transit period | Calculator; connect 240 hours with ten full days |
| china transit departure deadline calculator | Calculate exit deadline | Calculator; reinforce useful result and worked examples |
| when does my 240 hour TWOV expire | Find an expiry date | Calculator; support with dated examples and FAQ |
| china 240 hour visa free calculator | Find a tool | Same calculator; no new URL |
| china transit visa expiry calculator | Ambiguous visa/transit wording | Candidate only; clarify visa-free transit scope, do not claim to calculate ordinary visas |
| how to calculate 240 hour visa free stay | Learn the calculation | Existing clock-start answer page for detailed explanation; calculator for actual dates |
| when does the 240 hour clock start | Rule explanation | `/china-240-hour-transit-clock-start/`; avoid creating another competing answer page |
| china 240 hour transit US citizens | Nationality and route | `/china-240-hour-transit-us-citizens/`; retain its calculator links |
| china 240 hour transit eligible ports | Port list | `/china-240-hour-transit-ports-provinces/`; retain distinct port intent |

The five retained tool-intent directions are the primary calculator phrase, TWOV calculator, 10-day transit calculator, departure deadline calculator, and TWOV expiry question. Their relevance is supported by observed competing tools and by the existing calculator's function. Their search volume, competition score and actual coverage on this URL are **Unknown** until suitable data is available. No numeric opportunity score was invented.

## Competitor observations and decision

- [China Travel Check's timer](https://gochina.taoliapp.com/tools/240-hour-transit-timer/) explicitly describes TWOV expiry and a Beijing-time boundary; it separates timing from eligibility. This supports a narrow expiry intent, not a claim that our tool outranks it or that the market is small.
- [ChinaReadyKit's transit tool](https://www.chinareadykit.com/transit/) combines entry-path, passport, route and port checks. Competing for every entry-policy query would expand this calculator beyond its verified capability.
- Other discovery results included [CheckChinaTransit's diagnostic](https://checkchinatransit.com/diagnostic/). Multiple dedicated tools exist, so the head term cannot be labeled low competition from result counts alone.
- The current calculator has an exact-match transit title, a working deadline calculation, route examples and official sources. Its body lacks the TWOV synonym and concrete month-end/year-end deadline comparisons. Address those limited gaps while keeping the October 20 search title and description for observation.

## Implemented content change

Change ID: `SEO-2026-10-21-TRANSIT-EXPIRY`.

Status: live 2026-10-21. Content commits: `e507fc9`, `c62dcd5`, `0fe22c9`; example regression commit: `c9b711f`. Vercel deployment succeeded. Production raw HTML returned HTTP 200 with the exact self-canonical and new example heading, year-end result, TWOV FAQ and October 21 modification date. Typecheck, build, calculator regression and public HTML audit passed. Title and description remain the October 20 version. No current Google recrawl or ranking outcome has been verified.

- Add one original example table for ordinary, month-end and year-end recorded entries. All three cases are checked against the existing calculator algorithm by the regression script.
- Explain TWOV and the relationship between 240 hours and ten full days in two concise FAQs. Keep actual-entry records, permitted-stay instructions and departure buffers explicit.
- Share new content between React and generated static HTML, including FAQ structured data. The policy-review label stays October 13; the content modification date is October 21.
- Retain the established policy, clock-start, US-passport and port-page boundaries. The four question pages already provide prominent calculator links, and yesterday's two contextual policy-guide links remain in place.

Official rule checks today: [Shanghai government, August 20 explanation](https://english.shanghai.gov.cn/en-Latest-WhatsNew/20260820/bcaad9737db44e6ab788dfd785832b6b.html) for the next-day midnight clock; [NIA current policy](https://en.nia.gov.cn/n147418/n147463/c183412/content.html) for 57 nationalities, 65 ports and permitted areas. Examples illustrate the formula and are not immigration permission or flight suitability decisions.

## Measurement handoff

1. In GSC select `sc-domain:chinaeasebuddy.com`, inspect the exact calculator URL and record index status, last crawl, Google-selected canonical and observation date. Save live-test eligibility separately if performed. Today's public HTTP check is not a substitute.
2. Performance → Search results → Web → Page: exact calculator URL → Queries. Export the last 28 complete, finalized days and the preceding non-overlapping 28 days with the same filters. Save exact start/end dates. Preserve a separate export for the US transit answer page; do not assign site-wide `240 hour` queries to either URL.
3. Build the first real query baseline: visible query, page, country/device filters if any, clicks, impressions and position. Newly visible terms mean first observed in the export, not proven new indexing or increased market demand.
4. Earliest calendar observation window after today's publication: October 22–28 (seven full days), reviewed only once GSC data is available; shift the interpretation if Google has not recrawled. October 14–20 can be a prior seven-day reference, with October 21 excluded. The earlier October 20 changes mean it is not a controlled single-change experiment.
5. A full later window is October 22–November 18, compared with September 23–October 20, with reporting delay allowed. If query impressions remain sparse, report uncertainty and avoid inferring failure from zero clicks or large percentage swings.
6. Success: more relevant Google clicks to this URL, supported by same-query rank and impression changes. No top-ten date or traffic multiplier is promised. Internal visits and calculator use are separate outcomes.

| Observation | Exact window | Indexed / last crawl / Google canonical | Page clicks / impressions / CTR / position | Page-filtered queries | Interpretation |
| --- | --- | --- | --- | --- | --- |
| Available pre-change reference | 2026-09-20–2026-10-17 | Unknown / Unknown / Unknown | 0 / 10 / 0% / 22.5 | Unknown | Predates October 20–21 changes |
| 2026-10-21 export review | 2026-08-23–2026-10-18; Last 3 months filter, no period comparison | Current state Unknown / Unknown / Unknown; historical search appearances confirmed | 0 / 10 / 0% / 22.5 | transit through mainland: 0/1/0%/4.0; visa free china: 0/1/0%/193.0; 8 impressions lack disclosed queries | Pre-change baseline only; no October 20–21 outcome data |
