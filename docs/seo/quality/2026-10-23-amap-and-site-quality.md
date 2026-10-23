# October 23: Full-page Amap review and shared conversion/navigation repair

User direction: improve existing pages deeply, work towards positions 1–5 for relevant searches, and stop treating extra paragraphs as a complete daily optimisation. The execution standard is [page-quality-standard.md](../page-quality-standard.md). This batch adds no indexable page and does not claim a ranking result.

## Selection and evidence

The focused Amap page's primary job is changing the interface to English and resolving language/setup failures. The retained navigation guide's job is selecting the correct address, entrance and route. The comparison guide's job is choosing a map service. Shared topics do not establish cannibalisation; exact-page query ownership is still unavailable.

The October 21 workbook is the historical baseline, not a fresh outcome: focused Amap 1 click / 95 impressions / page-average 14.17; navigation guide 0 / 58 / 19.14; homepage 1 / 37 / 6.19. Workbook SHA-256: `711dde86cfbc0e56805034d3197d6c481fcad34de98cb3165ac076674ad20cd1`. Actual report boundaries, exact-page query pairs, target-market/device SERPs, monthly volume and keyword difficulty remain unknown. Whole-site queries such as `amap english` and `how to switch amap to english` are clues, not attributed page-query positions.

Current production inspection confirmed a missing visible service/contact route, despite an email address in Organization JSON-LD. The focused Amap page had eight sections and five FAQs, no interactive symptom/device triage, no phone screenshots and 72 static related links. This review addresses confirmed usability and content gaps under the user's new quality instruction; it is not justified by a newly demonstrated post-change rank decline. October 16/21 changes and this batch overlap.

Two competing answers were read on October 23: Trip.com's [Amap guide](https://sg.trip.com/guide/phone/amap.html/) gives a single profile/settings/general/language sequence; [Go2China](https://go2china.app/guide/how-to-use-amap/) separates untranslated business names from interface settings but also presents a single setup sequence. These retrieved answers are comparison material, not a verified target-country Google top-five sample. Their product claims are not used as primary evidence. Our contribution is conditional device/symptom diagnosis, explicit success checks and address/terminal verification rather than a claim to have tested a universally correct menu path.

## Entire-page review

| Dimension | Before | Change / retained evidence limit |
| --- | --- | --- |
| Intent | Setup page adjacent to a broadly titled “Amap in English” guide | Focus setup metadata on English settings/fixes; retitle the existing navigation page around addresses, metro and routes and add a contextual setup handoff. Keep both URLs. |
| Task completeness | Supported setup paragraphs and troubleshooting table; no early diagnosis | Add three phone choices × four symptoms, actionable next checks and correct section destinations. Distinguish Chinese menus, missing language options, Chinese place names and wrong search results. Add a pre-arrival success checklist. |
| Evidence | Official sources, but no firsthand device test | Recheck official stores/platform guidance; replace the broad Apple localisation source with its per-app-language documentation. State version/device variability and source-based evidence scope. Real phone screenshots, OS/app versions and firsthand observations remain missing. |
| Original value | Generic linear setup answer with illustrative searches | A working diagnostic and no-JavaScript symptom table lead to the relevant checks. Airport/station examples explicitly require the visitor to verify city, terminal and category; they are not reported test results. |
| Usability | Static sections used numeric anchors while React used title anchors; long related navigation | Use matching semantic destinations and retain legacy numeric anchors. Accessible labelled selects and live result announcements; flexible controls and scrolling table containers. Actual browser interaction is recorded separately from pure logic/static checks. |
| Trust / conversion | No visible Lin service block; schema-only email could falsely pass a grep check | Shared visible email/Fiverr contact with copyable email and clear free route-check versus paid-service scope. No fabricated author review, location, years abroad, photo, 48-hour SLA or fixed price. “Planning help from Lin” links to the contact without claiming Lin authored every guide. |
| Architecture | Static fallback could publish 72 links; independent renderers disagreed | Curated shared 5–8-topic links across 70 guides, including standalone and transit-question routes. Legal/campaign pages retain their different roles. Five–eight is our editorial rule, not a Google threshold. |
| Rendering / measurement | Raw contact not visible; existing click pipeline had no personal-service handoffs | Raw HTML and React share the contact/related data. Amap's ten sections and eight FAQs share one content file. Email and Fiverr clicks use existing allowed CTA events with safe placement/source fields; a click is not an enquiry, email delivery or sale. The standalone first-trip HTML has contact links but no client analytics runtime; its handoff clicks are not counted by this change. |

## Release scope and acceptance

Home title/H1 now emphasise trip planning with local help. The free automated itinerary form and digital passes remain functional. Contact blocks are placed below the homepage's initial form, below `/plan/`'s form, at the top of `/pricing/`, and before guide related links. Multilingual interactive pages use the same English contact copy.

No new redirect is needed for the four legacy aliases: DiDi use → current DiDi guide; old payment → payment guide; eSIM/VPN → eSIM guide; old trip-cost calculator → budget guide. The emergency URL's existing 308 to its slash version is already a permanent redirect. Preserve these rules. The six other proposed merges are not executed without checking unique task value and page-query evidence; the live audit showed independent 200 pages rather than proof of duplication.

The sitemap remains 76 URLs. Genuine main-content changes advance homepage and the two Amap lastmods to October 23. Plan/pricing local modified metadata changes reflect their service additions; these pages remain noindex and outside the sitemap. Other full-guide review dates remain intact; shared contact/navigation additions are not represented as 70 complete editorial reviews. The standalone first-trip source review/date is retained.

Release acceptance checks visible HTML, not only JSON-LD email strings: one contact block, both correct handoff links, a copyable email, valid byline target, curated canonical related links, no self links, matching Amap sections/FAQ schema, valid local anchors and no duplicate IDs. The helper is checked for all 12 phone/symptom paths, incomplete/invalid selections and no-JavaScript links. Funnel checks mock all requests and reject duplicate listeners, invalid placement or personal-data leakage. Existing form/source attribution, transit calculations and campaign routes are regression checks.

The structured record contains actual validation/release evidence and affected URLs. Build success and deployment are separate from formal-domain verification, Google indexing/recrawl, ranking and qualified clicks.

## Follow-up

After formal verification, preserve complete October 24–30 and October 24–November 20 provisional windows, plus equal adjacent reference windows. Reporting latency and later recrawl may require additional windows. Shared links/service blocks affect other current experiments; do not claim clean causal attribution. The October 21/22 windows and observations remain historical records.

The daily task must fully review one supported existing page and implement worthwhile verified improvements. Keep the calculator/budget strategic priority, but do not churn their recent versions merely to tick a daily edit box. Candidate next full reviews include DiDi payment, metro payment and TenPayGo after checking the actual visitor task, current sources and recent changes. Missing data cannot justify invented ranks, fake device evidence, a new article quota or a promised top-five date.
