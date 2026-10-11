# GSC observation baseline: 2026-10-11

Recorded from Google Search Console URL Inspection for the `sc-domain:chinaeasebuddy.com` property on October 11, 2026. This is a point-in-time observation, not a guarantee of current or future search visibility. Search Console reporting can lag production changes.

## URL inspection snapshot

| Page | GSC status | Last crawl reported | Sitemap / discovery note | Canonical note |
| --- | --- | --- | --- | --- |
| `https://chinaeasebuddy.com/didi-in-china-for-foreigners/` | Indexed | September 29, 2026 at 23:16:08 | Sitemap detected | Google selected the inspected URL |
| `https://chinaeasebuddy.com/china-hotels-for-foreigners/` | Indexed | October 4, 2026 at 06:03:51 | GSC displayed a temporary sitemap-processing error and no referring page | Google selected the inspected URL |
| `https://chinaeasebuddy.com/china-hotels-for-foreigners-no-rejection-guide/` | Indexed | October 5, 2026 at 04:59:23 | Sitemap detected; no referring page reported | Google selected the inspected URL |
| `https://chinaeasebuddy.com/china-visa-free-checker/` | Not indexed: Google does not know this URL | Not applicable | No sitemap or referring page detected in URL Inspection | Not applicable |
| `https://chinaeasebuddy.com/china-240-hour-visa-free-transit-2026/` | Discovered, currently not indexed | Not applicable | Sitemap detected; no referring page reported | Not applicable |
| `https://chinaeasebuddy.com/nia-12367-online-accommodation-registration-guide/` | Discovered, currently not indexed | Not applicable | Sitemap detected; GSC reported `/contact/` as a referring page | Not applicable |

## Production-change context

- The DiDi quick-reference content was already live before this observation. Its inspected copy was last crawled before the October 11 review-date update, so URL Inspection does not prove that Google has processed the latest text.
- The hotel rejection guide was expanded and deployed in production commit `574eaef` on October 11, 2026. Its reported October 5 crawl predates that deployment.
- Production crawlability checks passed after deployment: HTTP 200, indexable robots state, self-referencing canonical, parseable JSON-LD, and visible static HTML.
- A URL being present in the current sitemap or returning HTTP 200 does not mean Google has indexed it.

## Measurement plan

Use complete, non-overlapping reporting windows. Do not compare a partial current day with a completed historical period.

1. Record page-level clicks, impressions, CTR, average position, and queries for a complete seven-day window after Google recrawls the changed pages.
2. Repeat for a complete 28-day window and compare it with the immediately preceding 28 days.
3. Recheck URL Inspection for the same six canonical URLs, including the last crawl time and Google-selected canonical.
4. Separate index-status changes from ranking changes. A page can be indexed without receiving impressions, and an indexed page can rank outside the visible result set.
5. Treat the Visa Checker, 240-hour guide, and 12367 guide as discovery/indexing observations until GSC reports a crawl. Do not claim content or ranking impact before that point.

## Metrics not recorded in this snapshot

This file does not copy metrics from older exports. A fresh GSC Performance export using complete seven-day and 28-day ranges is still required for page-by-query comparisons. Ranking or click growth is not promised.
