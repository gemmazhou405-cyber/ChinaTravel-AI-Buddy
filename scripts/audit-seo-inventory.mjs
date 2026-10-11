import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');
const outputPath = join(root, 'docs', 'seo-indexing-inventory-2026-10-11.md');
const csvPath = join(root, 'docs', 'seo-indexing-inventory-2026-10-11.csv');
const productionOrigin = 'https://chinaeasebuddy.com';

const gscDiscovered = new Set([
  '/3-day-dali-itinerary/',
  '/beijing-airport-to-city-guide/',
  '/china-240-hour-visa-free-transit-2026/',
  '/china-food-ordering-guide/',
  '/china-itinerary-first-time-7-10-14-days/',
  '/china-visa-free-checker/',
  '/china-visa-free-guide-2026/',
  '/china-visa-free-travel-guide/',
  '/nia-12367-online-accommodation-registration-guide/',
]);

const gscCrawled = new Set(['/guides/', '/sitemap.xml']);
const liveVerifiedIndexed = new Set(['/guides/']);

const priorityPaths = new Set([
  '/china-visa-free-checker/',
  '/china-240-hour-visa-free-transit-2026/',
  '/china-visa-free-travel-guide/',
  '/nia-12367-online-accommodation-registration-guide/',
  '/china-food-ordering-guide/',
  '/beijing-airport-to-city-guide/',
  '/3-day-dali-itinerary/',
  '/china-itinerary-first-time-7-10-14-days/',
  '/china-golden-week-2026-travel-guide/',
  '/didi-in-china-for-foreigners/',
]);

const clusterRules = [
  ['visa and transit', /visa|240-hour|arrival-card/],
  ['payments', /payment|alipay|wechat-pay|tenpaygo/],
  ['internet and SIM', /sim-card|esim|internet/],
  ['DiDi and taxis', /didi|airport-to-city/],
  ['maps and navigation', /amap|google-maps|metro/],
  ['hotels and registration', /hotel|accommodation-registration|12367/],
  ['food', /food|eat-in-china/],
  ['safety and emergency', /safety|emergency/],
  ['itineraries', /itinerary|first-trip-to-china/],
  ['apps', /travel-apps|best-apps/],
  ['trains', /train/],
];

function decodeEntities(value) {
  return value
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function cleanText(html) {
  return decodeEntities(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  ).replace(/\s+/g, ' ').trim();
}

function matchOne(html, pattern) {
  return decodeEntities(html.match(pattern)?.[1]?.trim() || '');
}

function htmlDetails(html) {
  const bodyHtml = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
  const text = cleanText(bodyHtml);
  const hrefs = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map((match) => match[1]);
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim().toLowerCase())
    .filter((sentence) => sentence.split(/\s+/).length >= 8);
  return {
    title: matchOne(html, /<title>([\s\S]*?)<\/title>/i),
    description: matchOne(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i),
    canonical: matchOne(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i),
    robots: matchOne(html, /<meta\s+name=["']robots["']\s+content=["']([^"']+)["'][^>]*>/i),
    h1: matchOne(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    text,
    wordCount: text ? text.split(/\s+/).length : 0,
    hrefs,
    sentences,
  };
}

function intentFor(pathname, title) {
  const value = `${pathname} ${title}`.toLowerCase();
  if (/checker|generator/.test(value)) return 'interactive tool';
  if (/vs\b|compare|comparison/.test(value)) return 'comparison';
  if (/3-day|7-day|10-day|14-day|itinerary/.test(value)) return 'itinerary planning';
  if (/how to|guide|for foreigners|for tourists/.test(value)) return 'practical how-to';
  if (/faq/.test(value)) return 'support questions';
  if (/terms|privacy|contact/.test(value)) return 'legal/support';
  return 'travel planning information';
}

function clusterFor(pathname) {
  return clusterRules.find(([, pattern]) => pattern.test(pathname))?.[0] || 'other';
}

function targetQuery(title) {
  return title
    .replace(/\s*\|\s*ChinaEase Buddy.*$/i, '')
    .replace(/\s*[-–:]\s*ChinaEase Buddy.*$/i, '')
    .trim();
}

function firstSeen(pathname) {
  const slug = pathname === '/' ? 'ChinaEase Buddy' : pathname.replace(/^\//, '').replace(/\/$/, '');
  try {
    const output = execFileSync(
      'git',
      ['log', '--all', '--reverse', '-S', slug, '--format=%ad', '--date=short', '--', '.'],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    return output.split('\n').filter(Boolean)[0] || 'unknown';
  } catch {
    return 'unknown';
  }
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

async function fetchWithTimeout(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'ChinaEaseBuddy-SEO-Audit/1.0' },
    });
    return {
      status: response.status,
      finalUrl: response.url,
      contentType: response.headers.get('content-type') || '',
      html: await response.text(),
    };
  } catch (error) {
    return { status: 0, finalUrl: '', contentType: '', html: '', error: error instanceof Error ? error.name : 'fetch_error' };
  } finally {
    clearTimeout(timeout);
  }
}

async function mapLimited(values, limit, mapper) {
  const results = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor++;
      results[index] = await mapper(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker));
  return results;
}

const sitemap = await readFile(join(distDir, 'sitemap.xml'), 'utf8');
const sitemapEntries = [...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/g)]
  .map(([, url, lastmod]) => ({ url, lastmod }));

if (!sitemapEntries.length) {
  throw new Error('No URLs found in dist/sitemap.xml. Run npm run build first.');
}

const productionSitemapResponse = await fetchWithTimeout(`${productionOrigin}/sitemap.xml`);
if (productionSitemapResponse.status !== 200) {
  throw new Error(`Production sitemap request failed with ${productionSitemapResponse.status || productionSitemapResponse.error}`);
}
const productionSitemapUrls = new Set(
  [...productionSitemapResponse.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url),
);
const candidateSitemapUrls = new Set(sitemapEntries.map((entry) => entry.url));
const productionOnlyUrls = [...productionSitemapUrls].filter((url) => !candidateSitemapUrls.has(url)).sort();
const candidateOnlyUrls = [...candidateSitemapUrls].filter((url) => !productionSitemapUrls.has(url)).sort();

const localPages = [];
for (const entry of sitemapEntries) {
  const pathname = new URL(entry.url).pathname;
  const filePath = pathname === '/' ? join(distDir, 'index.html') : join(distDir, pathname, 'index.html');
  const html = await readFile(filePath, 'utf8');
  localPages.push({ ...entry, pathname, filePath, ...htmlDetails(html) });
}

const sentenceFrequency = new Map();
for (const page of localPages) {
  for (const sentence of new Set(page.sentences)) {
    sentenceFrequency.set(sentence, (sentenceFrequency.get(sentence) || 0) + 1);
  }
}

const inlinks = new Map(localPages.map((page) => [page.pathname, new Set()]));
for (const source of localPages) {
  for (const href of source.hrefs) {
    let target;
    try {
      target = new URL(href, productionOrigin).pathname;
    } catch {
      continue;
    }
    if (inlinks.has(target) && target !== source.pathname) inlinks.get(target).add(source.pathname);
  }
}

const production = await mapLimited(sitemapEntries, 6, (entry) => fetchWithTimeout(entry.url));
const rows = localPages.map((page, index) => {
  const live = production[index];
  const liveDetails = live.html ? htmlDetails(live.html) : null;
  const canonicalExpected = `${productionOrigin}${page.pathname}`;
  const technicalIssues = [];
  if (live.status !== 200) technicalIssues.push(`HTTP ${live.status || live.error || 'error'}`);
  if (live.finalUrl && live.finalUrl !== entryUrl(page.pathname)) technicalIssues.push(`redirects to ${live.finalUrl}`);
  if (!liveDetails?.canonical) technicalIssues.push('missing canonical');
  else if (liveDetails.canonical !== canonicalExpected) technicalIssues.push(`canonical ${liveDetails.canonical}`);
  if (/noindex/i.test(liveDetails?.robots || '')) technicalIssues.push('noindex');
  if (!liveDetails?.h1) technicalIssues.push('missing H1');
  if ((liveDetails?.wordCount || 0) < 250) technicalIssues.push(`thin static body (${liveDetails?.wordCount || 0} words)`);

  const gscStatus = liveVerifiedIndexed.has(page.pathname)
    ? 'indexed (live URL Inspection)'
    : gscDiscovered.has(page.pathname)
      ? 'discovered, not indexed (2026-10-04 report)'
      : gscCrawled.has(page.pathname)
        ? 'crawled, not indexed (2026-10-04 report)'
        : 'not individually verified';

  const uniqueSentences = page.sentences.filter((sentence) => sentenceFrequency.get(sentence) === 1).length;
  const uniqueRatio = page.sentences.length ? Math.round((uniqueSentences / page.sentences.length) * 100) : 0;
  const cluster = clusterFor(page.pathname);
  const overlaps = localPages
    .filter((candidate) => candidate.pathname !== page.pathname && clusterFor(candidate.pathname) === cluster && cluster !== 'other')
    .map((candidate) => candidate.pathname)
    .slice(0, 5);

  return {
    pathname: page.pathname,
    firstSeen: firstSeen(page.pathname),
    lastmod: page.lastmod,
    targetQuery: targetQuery(page.title),
    intent: intentFor(page.pathname, page.title),
    wordCount: liveDetails?.wordCount || 0,
    uniqueRatio,
    inlinks: inlinks.get(page.pathname)?.size || 0,
    http: live.status,
    robots: liveDetails?.robots || 'not set',
    canonical: liveDetails?.canonical || 'missing',
    gscStatus,
    cluster,
    overlaps: overlaps.join(' '),
    technicalIssues: technicalIssues.join('; ') || 'none',
    priority: technicalIssues.length || priorityPaths.has(page.pathname) ? 'P1' : 'P2',
  };
});

function entryUrl(pathname) {
  return `${productionOrigin}${pathname}`;
}

const hardFailures = rows.filter((row) => row.http !== 200 || row.canonical !== entryUrl(row.pathname) || /noindex/i.test(row.robots));
const report = `# ChinaEase Buddy indexing and ranking inventory

Generated: 2026-10-11  
Production origin: ${productionOrigin}  
Current production sitemap URLs: ${productionSitemapUrls.size}  
Candidate sitemap URLs after this repair: ${rows.length}

## Scope and evidence limits

- This inventory checks the production response, not a browser-rendered DOM. The candidate sitemap comes from the current local build and is compared with the live production sitemap.
- \`First seen\` is the earliest Git date on which the URL slug could be found. It is a repository proxy, not guaranteed to be the original production launch date.
- The GSC coverage report was last updated on 2026-10-04. It showed 66 indexed URLs and 34 not indexed URLs: 12 redirects, 11 alternate canonical URLs, 9 discovered-not-indexed URLs, and 2 crawled-not-indexed URLs.
- GSC URL Inspection on 2026-10-11 confirmed that \`/guides/\` is now indexed, while \`/china-visa-free-checker/\` and \`/china-240-hour-visa-free-transit-2026/\` remained discovered but not indexed.
- Redirect examples are protocol, \`www\`, and slash-normalization URLs. Alternate-canonical examples are Journey query parameters plus \`www\` variants. These are expected deduplication signals, not pages that should be forced into the index.
- Pages marked \`not individually verified\` must not be described as indexed or rejected without a fresh URL Inspection or GSC export.

## Technical summary

- Candidate sitemap URLs with blocking production-response findings: ${hardFailures.length}
- Current production-only URLs scheduled for sitemap removal: ${productionOnlyUrls.length ? productionOnlyUrls.join(', ') : 'none'}.
- Candidate-only URLs awaiting deployment: ${candidateOnlyUrls.length ? candidateOnlyUrls.join(', ') : 'none'}.
- The candidate sitemap includes only absolute production URLs and excludes known permanent redirect sources.
- Query-string Journey URLs and anchors are absent from the sitemap.
- A visible HTML link back to \`/guides/\` is present on generated guide pages in the current build.

## Confirmed technical decisions

- \`/unsubscribe/\` remains available for newsletter users but is now \`noindex, follow\` and excluded from the candidate sitemap because it is a utility action, not a search landing page.
- The three \`/partners/\` campaign landings remain available for referral attribution but are now \`noindex, follow\` and excluded from the candidate sitemap. Their static bodies are short, have no ordinary site inlinks, and overlap the primary guides/tools.
- \`/china-visa-free-guide-2026/\` is a historical redirect source. It correctly redirects to \`/china-visa-free-travel-guide/\` and is absent from the candidate sitemap.
- GSC's redirect and alternate-canonical examples are expected normalization signals. They should not be converted into indexable duplicate pages.

## Priority interpretation

- **P1**: confirmed GSC discovery issue, high-value search/conversion page, or a production technical finding.
- **P2**: technically healthy page without enough URL-level GSC evidence to justify rewriting or consolidation.
- A shared topic cluster is a review flag, not proof of cannibalization. Merge or redirect only after comparing page-by-query data and the answers each page provides.

## Per-page inventory

| Priority | URL | First seen | Last modified | Target query / intent | Static words | Unique sentences | HTML inlinks | HTTP | GSC evidence | Topic cluster | Technical findings |
|---|---|---:|---:|---|---:|---:|---:|---:|---|---|---|
${rows.map((row) => `| ${row.priority} | [${row.pathname}](${entryUrl(row.pathname)}) | ${row.firstSeen} | ${row.lastmod} | ${row.targetQuery.replaceAll('|', '\\|')} — ${row.intent} | ${row.wordCount} | ${row.uniqueRatio}% | ${row.inlinks} | ${row.http} | ${row.gscStatus} | ${row.cluster} | ${row.technicalIssues.replaceAll('|', '\\|')} |`).join('\n')}

## Topic-overlap review groups

The following groups need page-by-query evidence before consolidation: visa and transit; payments; internet and SIM; DiDi and taxis; maps and navigation; hotels and accommodation registration; food; safety and emergency; itinerary planning; apps; and trains. The CSV companion includes up to five same-cluster URLs per page for manual comparison.

## Required GSC follow-up

1. Export page-by-query rows for pages with impressions, especially Golden Week, DiDi, hotels, eSIM, airport arrival, safety, budget, visa, payment, maps, and itinerary clusters.
2. Recheck the 2026-10-04 discovered-not-indexed examples after Google refreshes the report.
3. Use URL Inspection for a specific page before requesting indexing. A request is not evidence that indexing will occur.
4. Do not promise top-10 rankings. Measure query-specific position, CTR, and landing-page fit after recrawl.
`;

const csvHeaders = ['priority', 'pathname', 'firstSeen', 'lastmod', 'targetQuery', 'intent', 'wordCount', 'uniqueRatio', 'inlinks', 'http', 'robots', 'canonical', 'gscStatus', 'cluster', 'overlaps', 'technicalIssues'];
const csv = [
  csvHeaders.map(csvCell).join(','),
  ...rows.map((row) => csvHeaders.map((header) => csvCell(row[header])).join(',')),
].join('\n');

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, report);
await writeFile(csvPath, `${csv}\n`);

console.log(`SEO inventory: ${rows.length} sitemap URLs checked`);
console.log(`Blocking production findings: ${hardFailures.length}`);
console.log(`Markdown: ${outputPath}`);
console.log(`CSV: ${csvPath}`);

if (hardFailures.length) {
  for (const failure of hardFailures) console.error(`FAIL ${failure.pathname}: ${failure.technicalIssues}`);
  process.exitCode = 1;
}
