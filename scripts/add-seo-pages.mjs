import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { renderPlanningHelp } from './render-planning-help.mjs';

const planningHelp = JSON.parse(await readFile('src/data/planningHelp.json', 'utf8'));
const related = JSON.parse(await readFile('src/data/guideRelatedLinks.json', 'utf8'))['first-trip-to-china'];

const escapeHtml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

const seoUrl = 'https://chinaeasebuddy.com/first-trip-to-china/';
const seoPath = '/first-trip-to-china/';

async function ensureSitemapEntry() {
  const sitemapPath = join('dist', 'sitemap.xml');
  let sitemap = await readFile(sitemapPath, 'utf8');
  if (!sitemap.includes(seoUrl)) {
    sitemap = sitemap.replace(
      '</urlset>',
      `  <url>\n    <loc>${seoUrl}</loc>\n    <lastmod>2026-09-25</lastmod>\n  </url>\n</urlset>`,
    );
    await writeFile(sitemapPath, sitemap);
  }
}

async function ensureHomepageInternalLink() {
  const path = join('dist', 'index.html');
  let html = await readFile(path, 'utf8');
  if (!html.includes(`href="${seoPath}"`)) {
    const guidesLink = '<a href="/guides/"';
    const index = html.indexOf(guidesLink);
    if (index !== -1) {
      const link = '<a href="/first-trip-to-china/" style="border: 1px solid rgba(15, 82, 87, 0.18); border-radius: 999px; color: #0F5257; padding: 12px 18px; font-weight: 700; text-decoration: none;">First trip to China</a>\n          ';
      html = `${html.slice(0, index)}${link}${html.slice(index)}`;
      await writeFile(path, html);
    }
  }
}

async function ensureGuidesInternalLink() {
  const path = join('dist', 'guides', 'index.html');
  let html = await readFile(path, 'utf8');
  if (!html.includes(`href="${seoPath}"`)) {
    const marker = '<h2 id="guide-list"';
    const index = html.indexOf(marker);
    if (index !== -1) {
      const insertAt = html.indexOf('>', index) + 1;
      const link = '\n          <p style="margin: 12px 0 18px;"><a href="/first-trip-to-china/" style="color: #155e63; font-weight: 700;">Start here: First trip to China — what to know before you go</a></p>';
      html = `${html.slice(0, insertAt)}${link}${html.slice(insertAt)}`;
      await writeFile(path, html);
    }
  }
}

await ensureSitemapEntry();
await ensureHomepageInternalLink();
await ensureGuidesInternalLink();

// This guide is a standalone HTML page, so it does not use the React GuidePage shell.
const firstTripPath = join('dist', 'first-trip-to-china', 'index.html');
let firstTripHtml = await readFile(firstTripPath, 'utf8');
firstTripHtml = firstTripHtml.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/, `$1<p><a href="#lin-help">${escapeHtml(planningHelp.byline)}</a></p>`);
firstTripHtml = firstTripHtml.replace(/<section>\s*<h2>Related China travel guides<\/h2>[\s\S]*?<\/section>/, `${renderPlanningHelp(planningHelp, 'guide')}<nav aria-label="Related China travel guides"><h2>Related China travel guides</h2><div class="related">${related.map(({ label, href }) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`).join('')}</div></nav>`);
await writeFile(firstTripPath, firstTripHtml);
