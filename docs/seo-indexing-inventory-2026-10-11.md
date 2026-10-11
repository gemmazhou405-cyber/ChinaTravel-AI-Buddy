# ChinaEase Buddy indexing and ranking inventory

Generated: 2026-10-11  
Production origin: https://chinaeasebuddy.com  
Current production sitemap URLs: 74  
Candidate sitemap URLs after this repair: 70

## Scope and evidence limits

- This inventory checks the production response, not a browser-rendered DOM. The candidate sitemap comes from the current local build and is compared with the live production sitemap.
- `First seen` is the earliest Git date on which the URL slug could be found. It is a repository proxy, not guaranteed to be the original production launch date.
- The GSC coverage report was last updated on 2026-10-04. It showed 66 indexed URLs and 34 not indexed URLs: 12 redirects, 11 alternate canonical URLs, 9 discovered-not-indexed URLs, and 2 crawled-not-indexed URLs.
- GSC URL Inspection on 2026-10-11 confirmed that `/guides/` is now indexed, while `/china-visa-free-checker/` and `/china-240-hour-visa-free-transit-2026/` remained discovered but not indexed.
- Redirect examples are protocol, `www`, and slash-normalization URLs. Alternate-canonical examples are Journey query parameters plus `www` variants. These are expected deduplication signals, not pages that should be forced into the index.
- Pages marked `not individually verified` must not be described as indexed or rejected without a fresh URL Inspection or GSC export.

## Technical summary

- Candidate sitemap URLs with blocking production-response findings: 0
- Current production-only URLs scheduled for sitemap removal: https://chinaeasebuddy.com/partners/china-visa-checker/, https://chinaeasebuddy.com/partners/first-trip-to-china/, https://chinaeasebuddy.com/partners/hostel-china-travel-help/, https://chinaeasebuddy.com/unsubscribe/.
- Candidate-only URLs awaiting deployment: none.
- The candidate sitemap includes only absolute production URLs and excludes known permanent redirect sources.
- Query-string Journey URLs and anchors are absent from the sitemap.
- A visible HTML link back to `/guides/` is present on generated guide pages in the current build.

## Confirmed technical decisions

- `/unsubscribe/` remains available for newsletter users but is now `noindex, follow` and excluded from the candidate sitemap because it is a utility action, not a search landing page.
- The three `/partners/` campaign landings remain available for referral attribution but are now `noindex, follow` and excluded from the candidate sitemap. Their static bodies are short, have no ordinary site inlinks, and overlap the primary guides/tools.
- `/china-visa-free-guide-2026/` is a historical redirect source. It correctly redirects to `/china-visa-free-travel-guide/` and is absent from the candidate sitemap.
- GSC's redirect and alternate-canonical examples are expected normalization signals. They should not be converted into indexable duplicate pages.

## Priority interpretation

- **P1**: confirmed GSC discovery issue, high-value search/conversion page, or a production technical finding.
- **P2**: technically healthy page without enough URL-level GSC evidence to justify rewriting or consolidation.
- A shared topic cluster is a review flag, not proof of cannibalization. Merge or redirect only after comparing page-by-query data and the answers each page provides.

## Per-page inventory

| Priority | URL | First seen | Last modified | Target query / intent | Static words | Unique sentences | HTML inlinks | HTTP | GSC evidence | Topic cluster | Technical findings |
|---|---|---:|---:|---|---:|---:|---:|---:|---|---|---|
| P2 | [/](https://chinaeasebuddy.com/) | 2026-05-17 | 2026-09-29 | ChinaEase Buddy - AI Travel Assistant for Foreigners in China \| No Chinese Needed (2026) — practical how-to | 332 | 100% | 69 | 200 | not individually verified | other | none |
| P2 | [/guides/](https://chinaeasebuddy.com/guides/) | 2026-05-17 | 2026-10-10 | China Travel Guides for Foreigners: Visas, Apps & Itineraries — practical how-to | 1393 | 89% | 69 | 200 | indexed (live URL Inspection) | other | none |
| P1 | [/china-visa-free-travel-guide/](https://chinaeasebuddy.com/china-visa-free-travel-guide/) | 2026-09-20 | 2026-09-20 | China Visa-Free Travel Guide (2026) — practical how-to | 1765 | 78% | 26 | 200 | discovered, not indexed (2026-10-04 report) | visa and transit | none |
| P2 | [/china-airport-arrival-guide/](https://chinaeasebuddy.com/china-airport-arrival-guide/) | 2026-09-20 | 2026-10-09 | China Airport Arrival Guide 2026: What to Do After Landing — practical how-to | 1596 | 96% | 39 | 200 | not individually verified | other | none |
| P2 | [/china-hotels-for-foreigners/](https://chinaeasebuddy.com/china-hotels-for-foreigners/) | 2026-09-20 | 2026-10-07 | Can Foreigners Stay in Any Hotel in China? (2026) — travel planning information | 1807 | 74% | 48 | 200 | not individually verified | hotels and registration | none |
| P1 | [/china-food-ordering-guide/](https://chinaeasebuddy.com/china-food-ordering-guide/) | 2026-09-20 | 2026-09-20 | How to Order Food in China (2026) — practical how-to | 1710 | 77% | 30 | 200 | discovered, not indexed (2026-10-04 report) | food | none |
| P2 | [/chinese-travel-phrases/](https://chinaeasebuddy.com/chinese-travel-phrases/) | 2026-09-20 | 2026-09-20 | Essential Chinese Travel Phrases (2026) — travel planning information | 1343 | 97% | 23 | 200 | not individually verified | other | none |
| P2 | [/china-travel-safety-guide/](https://chinaeasebuddy.com/china-travel-safety-guide/) | 2026-09-20 | 2026-10-07 | Is It Safe to Travel to China? Tourist Safety Guide (2026) — practical how-to | 1842 | 98% | 25 | 200 | not individually verified | safety and emergency | none |
| P2 | [/china-travel-budget/](https://chinaeasebuddy.com/china-travel-budget/) | 2026-09-20 | 2026-10-07 | How Much Does a Trip to China Cost? 2026 Travel Budget — travel planning information | 1520 | 98% | 28 | 200 | not individually verified | other | none |
| P2 | [/terms/](https://chinaeasebuddy.com/terms/) | 2026-05-17 | 2026-09-26 | Terms of Service — legal/support | 432 | 27% | 0 | 200 | not individually verified | other | none |
| P2 | [/privacy/](https://chinaeasebuddy.com/privacy/) | 2026-05-17 | 2026-09-26 | Privacy Policy — legal/support | 436 | 27% | 0 | 200 | not individually verified | other | none |
| P2 | [/contact/](https://chinaeasebuddy.com/contact/) | 2026-05-17 | 2026-09-26 | Contact — legal/support | 421 | 27% | 0 | 200 | not individually verified | other | none |
| P2 | [/china-travel-apps/](https://chinaeasebuddy.com/china-travel-apps/) | 2026-05-31 | 2026-09-29 | China Travel Apps for Foreigners (2026): Payments, Maps & Rides — practical how-to | 1327 | 74% | 49 | 200 | not individually verified | apps | none |
| P2 | [/china-train-travel-guide/](https://chinaeasebuddy.com/china-train-travel-guide/) | 2026-09-17 | 2026-09-29 | China High-Speed Train Guide for Foreigners: 12306 Without Chinese ID (2026) — practical how-to | 1372 | 97% | 48 | 200 | not individually verified | trains | none |
| P1 | [/didi-in-china-for-foreigners/](https://chinaeasebuddy.com/didi-in-china-for-foreigners/) | 2026-09-18 | 2026-10-07 | DiDi in China for Foreigners: App, Payment & Rides (2026) — practical how-to | 1344 | 97% | 34 | 200 | not individually verified | DiDi and taxis | none |
| P2 | [/amap-in-english/](https://chinaeasebuddy.com/amap-in-english/) | 2026-09-18 | 2026-09-18 | AMap in English: China Map Guide (2026) — practical how-to | 1248 | 73% | 25 | 200 | not individually verified | maps and navigation | none |
| P2 | [/china-metro-guide/](https://chinaeasebuddy.com/china-metro-guide/) | 2026-05-21 | 2026-09-18 | China Metro Guide for Foreigners (2026) — practical how-to | 1528 | 98% | 39 | 200 | not individually verified | maps and navigation | none |
| P2 | [/7-day-china-itinerary/](https://chinaeasebuddy.com/7-day-china-itinerary/) | 2026-09-20 | 2026-09-20 | 7-Day China Itinerary for First-Time Visitors (2026) — itinerary planning | 1768 | 97% | 33 | 200 | not individually verified | itineraries | none |
| P2 | [/10-day-china-itinerary/](https://chinaeasebuddy.com/10-day-china-itinerary/) | 2026-09-18 | 2026-09-18 | 10-Day China Itinerary for First-Time Visitors — itinerary planning | 1447 | 96% | 45 | 200 | not individually verified | itineraries | none |
| P2 | [/14-day-china-itinerary/](https://chinaeasebuddy.com/14-day-china-itinerary/) | 2026-09-21 | 2026-09-21 | 14-Day China Itinerary for First-Time Visitors (2026) — itinerary planning | 1982 | 95% | 40 | 200 | not individually verified | itineraries | none |
| P2 | [/beijing-vs-shanghai/](https://chinaeasebuddy.com/beijing-vs-shanghai/) | 2026-09-21 | 2026-09-21 | Beijing vs Shanghai: Which Should You Visit? (2026) — comparison | 1940 | 97% | 27 | 200 | not individually verified | other | none |
| P2 | [/3-day-beijing-itinerary/](https://chinaeasebuddy.com/3-day-beijing-itinerary/) | 2026-09-21 | 2026-09-21 | 3-Day Beijing Itinerary for First-Time Visitors (2026) — itinerary planning | 1518 | 93% | 41 | 200 | not individually verified | itineraries | none |
| P2 | [/3-day-shanghai-itinerary/](https://chinaeasebuddy.com/3-day-shanghai-itinerary/) | 2026-09-21 | 2026-09-21 | 3-Day Shanghai Itinerary for First-Time Visitors (2026) — itinerary planning | 1624 | 95% | 30 | 200 | not individually verified | itineraries | none |
| P2 | [/3-day-xian-itinerary/](https://chinaeasebuddy.com/3-day-xian-itinerary/) | 2026-09-22 | 2026-09-21 | 3-Day Xi'an Itinerary for First-Time Visitors (2026) — itinerary planning | 1533 | 95% | 28 | 200 | not individually verified | itineraries | none |
| P2 | [/3-day-chongqing-itinerary/](https://chinaeasebuddy.com/3-day-chongqing-itinerary/) | 2026-09-22 | 2026-09-22 | 3-Day Chongqing Itinerary for First-Time Visitors (2026) — itinerary planning | 1452 | 93% | 24 | 200 | not individually verified | itineraries | none |
| P2 | [/3-day-chengdu-itinerary/](https://chinaeasebuddy.com/3-day-chengdu-itinerary/) | 2026-09-22 | 2026-09-22 | 3-Day Chengdu Itinerary for First-Time Visitors (2026) — itinerary planning | 1431 | 95% | 25 | 200 | not individually verified | itineraries | none |
| P2 | [/3-day-guilin-yangshuo-itinerary/](https://chinaeasebuddy.com/3-day-guilin-yangshuo-itinerary/) | 2026-09-22 | 2026-09-30 | 3-Day Guilin and Yangshuo Itinerary (2026) — itinerary planning | 1829 | 98% | 27 | 200 | not individually verified | itineraries | none |
| P2 | [/3-day-zhangjiajie-itinerary/](https://chinaeasebuddy.com/3-day-zhangjiajie-itinerary/) | 2026-09-22 | 2026-09-22 | 3-Day Zhangjiajie Itinerary for First-Time Visitors (2026) — itinerary planning | 1142 | 96% | 24 | 200 | not individually verified | itineraries | none |
| P2 | [/3-day-shenzhen-itinerary/](https://chinaeasebuddy.com/3-day-shenzhen-itinerary/) | 2026-09-22 | 2026-09-30 | 3-Day Shenzhen Itinerary for First-Time Visitors (2026) — itinerary planning | 1911 | 98% | 23 | 200 | not individually verified | itineraries | none |
| P2 | [/3-day-guangzhou-itinerary/](https://chinaeasebuddy.com/3-day-guangzhou-itinerary/) | 2026-09-23 | 2026-09-23 | 3-Day Guangzhou Itinerary for First-Time Visitors (2026) — itinerary planning | 1483 | 95% | 22 | 200 | not individually verified | itineraries | none |
| P2 | [/3-day-hangzhou-itinerary/](https://chinaeasebuddy.com/3-day-hangzhou-itinerary/) | 2026-09-23 | 2026-09-23 | 3-Day Hangzhou Itinerary for First-Time Visitors (2026) — itinerary planning | 1495 | 95% | 22 | 200 | not individually verified | itineraries | none |
| P2 | [/3-day-suzhou-itinerary/](https://chinaeasebuddy.com/3-day-suzhou-itinerary/) | 2026-09-25 | 2026-09-25 | 3-Day Suzhou Itinerary for First-Time Visitors (2026) — itinerary planning | 1337 | 97% | 24 | 200 | not individually verified | itineraries | none |
| P2 | [/3-day-nanjing-itinerary/](https://chinaeasebuddy.com/3-day-nanjing-itinerary/) | 2026-09-25 | 2026-09-25 | 3-Day Nanjing Itinerary for First-Time Visitors (2026) — itinerary planning | 1354 | 97% | 23 | 200 | not individually verified | itineraries | none |
| P1 | [/3-day-dali-itinerary/](https://chinaeasebuddy.com/3-day-dali-itinerary/) | 2026-09-25 | 2026-09-25 | 3-Day Dali Itinerary: Old Town, Erhai and Cangshan (2026) — itinerary planning | 1372 | 97% | 22 | 200 | discovered, not indexed (2026-10-04 report) | itineraries | none |
| P1 | [/china-golden-week-2026-travel-guide/](https://chinaeasebuddy.com/china-golden-week-2026-travel-guide/) | 2026-09-25 | 2026-10-10 | When Is China Golden Week 2026? October 1–7 Dates & Tips — practical how-to | 1042 | 96% | 23 | 200 | not individually verified | other | none |
| P2 | [/great-wall-of-china-day-trip-from-beijing/](https://chinaeasebuddy.com/great-wall-of-china-day-trip-from-beijing/) | 2026-09-25 | 2026-09-25 | Great Wall Day Trip from Beijing: Mutianyu or Badaling? (2026) — travel planning information | 1116 | 73% | 21 | 200 | not individually verified | other | none |
| P2 | [/chengdu-panda-base-guide/](https://chinaeasebuddy.com/chengdu-panda-base-guide/) | 2026-09-25 | 2026-10-08 | Chengdu Panda Base Guide 2026: Tickets, Price & Route — practical how-to | 1353 | 97% | 21 | 200 | not individually verified | other | none |
| P2 | [/didi-payment-for-foreigners/](https://chinaeasebuddy.com/didi-payment-for-foreigners/) | 2026-09-29 | 2026-10-08 | DiDi Pay in China for Foreigners (2026): Cards & Wallets — practical how-to | 1011 | 96% | 24 | 200 | not individually verified | payments | none |
| P1 | [/beijing-airport-to-city-guide/](https://chinaeasebuddy.com/beijing-airport-to-city-guide/) | 2026-09-29 | 2026-09-25 | Beijing Airport to City Centre: PEK vs PKX Transfers (2026) — comparison | 825 | 95% | 22 | 200 | discovered, not indexed (2026-10-04 report) | DiDi and taxis | none |
| P2 | [/amap-vs-google-maps-china/](https://chinaeasebuddy.com/amap-vs-google-maps-china/) | 2026-09-29 | 2026-09-25 | AMap vs Google Maps in China for Tourists (2026) — comparison | 866 | 95% | 21 | 200 | not individually verified | maps and navigation | none |
| P2 | [/best-time-to-visit-china/](https://chinaeasebuddy.com/best-time-to-visit-china/) | 2026-09-21 | 2026-09-21 | Best Time to Visit China: Month-by-Month Guide (2026) — practical how-to | 1766 | 97% | 36 | 200 | not individually verified | other | none |
| P2 | [/china-esim-internet-guide/](https://chinaeasebuddy.com/china-esim-internet-guide/) | 2026-09-17 | 2026-10-09 | China eSIM for Tourists (2026): Buy, Install & Get Online — practical how-to | 1373 | 96% | 35 | 200 | not individually verified | internet and SIM | none |
| P2 | [/china-sim-card-for-foreigners/](https://chinaeasebuddy.com/china-sim-card-for-foreigners/) | 2026-09-30 | 2026-09-30 | China SIM Card for Foreigners (2026): Passport Guide — practical how-to | 1122 | 96% | 19 | 200 | not individually verified | internet and SIM | none |
| P2 | [/alipay-for-foreigners/](https://chinaeasebuddy.com/alipay-for-foreigners/) | 2026-05-31 | 2026-09-16 | Alipay for Foreigners: Setup & Payment Guide (2026) — practical how-to | 905 | 96% | 8 | 200 | not individually verified | payments | none |
| P2 | [/wechat-pay-for-foreigners/](https://chinaeasebuddy.com/wechat-pay-for-foreigners/) | 2026-09-18 | 2026-10-08 | WeChat Pay for Foreigners (2026): Cards, Fees & Setup — practical how-to | 1398 | 65% | 25 | 200 | not individually verified | payments | none |
| P2 | [/china-payment-guide/](https://chinaeasebuddy.com/china-payment-guide/) | 2026-05-31 | 2026-09-30 | How to Pay in China as a Foreigner — practical how-to | 932 | 94% | 56 | 200 | not individually verified | payments | none |
| P2 | [/china-travel-checklist/](https://chinaeasebuddy.com/china-travel-checklist/) | 2026-05-31 | 2026-09-30 | China Travel Checklist for First-Time Visitors — travel planning information | 971 | 88% | 45 | 200 | not individually verified | other | none |
| P2 | [/china-emergency-numbers/](https://chinaeasebuddy.com/china-emergency-numbers/) | 2026-05-21 | 2026-09-26 | Emergency Numbers in China for Travelers — travel planning information | 500 | 50% | 24 | 200 | not individually verified | safety and emergency | none |
| P2 | [/china-train-booking-foreigners-12306/](https://chinaeasebuddy.com/china-train-booking-foreigners-12306/) | 2026-09-26 | 2026-09-26 | How to Book China High-Speed Train Tickets as a Foreigner: 12306 English Guide — practical how-to | 579 | 61% | 20 | 200 | not individually verified | trains | none |
| P1 | [/china-itinerary-first-time-7-10-14-days/](https://chinaeasebuddy.com/china-itinerary-first-time-7-10-14-days/) | 2026-09-26 | 2026-10-10 | China Itinerary for First-Timers: 7, 10 or 14 Days (2026) — itinerary planning | 401 | 67% | 24 | 200 | discovered, not indexed (2026-10-04 report) | itineraries | none |
| P2 | [/faq/](https://chinaeasebuddy.com/faq/) | 2026-05-17 | 2026-09-26 | ChinaEase Buddy FAQ \| China Travel Tools for Foreign Visitors — support questions | 513 | 53% | 21 | 200 | not individually verified | other | none |
| P1 | [/china-240-hour-visa-free-transit-2026/](https://chinaeasebuddy.com/china-240-hour-visa-free-transit-2026/) | 2026-10-01 | 2026-09-30 | China 240-Hour Visa-Free Transit 2026: 57 Countries, 65 Ports & 10-Day Rules — itinerary planning | 1804 | 96% | 24 | 200 | discovered, not indexed (2026-10-04 report) | visa and transit | none |
| P1 | [/nia-12367-online-accommodation-registration-guide/](https://chinaeasebuddy.com/nia-12367-online-accommodation-registration-guide/) | 2026-09-27 | 2026-10-02 | China Accommodation Registration Online: 12367 Guide — practical how-to | 1595 | 98% | 24 | 200 | discovered, not indexed (2026-10-04 report) | hotels and registration | none |
| P2 | [/amap-english-mode-guide-2026/](https://chinaeasebuddy.com/amap-english-mode-guide-2026/) | 2026-09-27 | 2026-10-05 | Amap English Guide: How to Switch Language & Search in English (2026) — practical how-to | 541 | 82% | 19 | 200 | not individually verified | maps and navigation | none |
| P2 | [/alipay-metro-qr-transport-code-guide/](https://chinaeasebuddy.com/alipay-metro-qr-transport-code-guide/) | 2026-09-27 | 2026-10-05 | How to Ride China Metro With Alipay as a Foreigner (Transport QR Guide 2026) — practical how-to | 550 | 89% | 19 | 200 | not individually verified | payments | none |
| P2 | [/china-travel-ai-itinerary-generator/](https://chinaeasebuddy.com/china-travel-ai-itinerary-generator/) | 2026-09-27 | 2026-10-05 | China Travel AI Itinerary Generator: Build a Personal Route in 30 Seconds (2026) — interactive tool | 542 | 88% | 19 | 200 | not individually verified | itineraries | none |
| P2 | [/240-hour-transit-zone-map-high-speed-rail/](https://chinaeasebuddy.com/240-hour-transit-zone-map-high-speed-rail/) | 2026-09-27 | 2026-10-05 | 240-Hour Transit Zone Map: Can You Take High-Speed Rail? (2026) — travel planning information | 585 | 84% | 19 | 200 | not individually verified | visa and transit | none |
| P2 | [/wechat-verification-without-friend-qr-2026/](https://chinaeasebuddy.com/wechat-verification-without-friend-qr-2026/) | 2026-09-27 | 2026-10-05 | WeChat Verification Without a Friend: Safe Registration Options (2026) — travel planning information | 577 | 82% | 19 | 200 | not individually verified | other | none |
| P2 | [/china-hotels-for-foreigners-no-rejection-guide/](https://chinaeasebuddy.com/china-hotels-for-foreigners-no-rejection-guide/) | 2026-09-27 | 2026-10-05 | Why Hotels in China Refuse Foreign Guests (and How to Avoid It) [2026] — practical how-to | 861 | 28% | 19 | 200 | not individually verified | hotels and registration | none |
| P2 | [/does-google-maps-work-in-china-amap-guide/](https://chinaeasebuddy.com/does-google-maps-work-in-china-amap-guide/) | 2026-09-27 | 2026-10-05 | Does Google Maps Work in China? Use Amap English Instead [2026] — practical how-to | 723 | 37% | 19 | 200 | not individually verified | maps and navigation | none |
| P2 | [/how-to-visit-great-wall-from-beijing-2026/](https://chinaeasebuddy.com/how-to-visit-great-wall-from-beijing-2026/) | 2026-09-27 | 2026-10-05 | How to Visit the Great Wall from Beijing Without a Tour (2026 Guide) — practical how-to | 642 | 38% | 19 | 200 | not individually verified | other | none |
| P2 | [/what-to-eat-in-china-first-time-guide/](https://chinaeasebuddy.com/what-to-eat-in-china-first-time-guide/) | 2026-09-27 | 2026-10-05 | What to Eat in China: 15 Must-Try Dishes for First-Time Visitors — practical how-to | 768 | 30% | 19 | 200 | not individually verified | food | none |
| P2 | [/how-to-use-wechat-as-foreigner-2026/](https://chinaeasebuddy.com/how-to-use-wechat-as-foreigner-2026/) | 2026-09-27 | 2026-10-05 | How to Use WeChat as a Foreigner (2026): Registration, Verification & Pay — practical how-to | 884 | 22% | 19 | 200 | not individually verified | other | none |
| P2 | [/is-china-safe-for-tourists-2026/](https://chinaeasebuddy.com/is-china-safe-for-tourists-2026/) | 2026-09-26 | 2026-10-09 | Is China Safe for US Citizens in 2026? Travel Advice — travel planning information | 801 | 89% | 21 | 200 | not individually verified | other | none |
| P2 | [/best-apps-for-china-travel-2026/](https://chinaeasebuddy.com/best-apps-for-china-travel-2026/) | 2026-09-26 | 2026-10-05 | Essential Apps for China Travel (2026): Payments, Maps & Transport — travel planning information | 706 | 36% | 20 | 200 | not individually verified | apps | none |
| P2 | [/beijing-shanghai-layover-240-hour-guide/](https://chinaeasebuddy.com/beijing-shanghai-layover-240-hour-guide/) | 2026-09-26 | 2026-10-05 | Beijing & Shanghai Layover Guide 2026: 240-Hour Visa-Free Transit Explained — practical how-to | 778 | 29% | 19 | 200 | not individually verified | visa and transit | none |
| P2 | [/tenpaygo-for-tourists/](https://chinaeasebuddy.com/tenpaygo-for-tourists/) | 2026-10-01 | 2026-10-01 | TenPayGo for Tourists: Setup & Payment Guide (2026) — practical how-to | 1409 | 98% | 22 | 200 | not individually verified | payments | none |
| P1 | [/china-visa-free-checker/](https://chinaeasebuddy.com/china-visa-free-checker/) | 2026-10-01 | 2026-10-02 | China Visa-Free Checker 2026: 30-Day & 240-Hour Rules — interactive tool | 1167 | 97% | 28 | 200 | discovered, not indexed (2026-10-04 report) | visa and transit | none |
| P2 | [/china-online-arrival-card-2026/](https://chinaeasebuddy.com/china-online-arrival-card-2026/) | 2026-10-05 | 2026-10-05 | China Arrival Card Online 2026: Official Link, QR Code & Who Needs It — travel planning information | 885 | 96% | 21 | 200 | not individually verified | visa and transit | none |
| P2 | [/first-trip-to-china/](https://chinaeasebuddy.com/first-trip-to-china/) | 2026-09-16 | 2026-09-25 | First Trip to China: What to Know Before You Go (2026) — travel planning information | 1153 | 100% | 42 | 200 | not individually verified | itineraries | none |

## Topic-overlap review groups

The following groups need page-by-query evidence before consolidation: visa and transit; payments; internet and SIM; DiDi and taxis; maps and navigation; hotels and accommodation registration; food; safety and emergency; itinerary planning; apps; and trains. The CSV companion includes up to five same-cluster URLs per page for manual comparison.

## Required GSC follow-up

1. Export page-by-query rows for pages with impressions, especially Golden Week, DiDi, hotels, eSIM, airport arrival, safety, budget, visa, payment, maps, and itinerary clusters.
2. Recheck the 2026-10-04 discovered-not-indexed examples after Google refreshes the report.
3. Use URL Inspection for a specific page before requesting indexing. A request is not evidence that indexing will occur.
4. Do not promise top-10 rankings. Measure query-specific position, CTR, and landing-page fit after recrawl.
