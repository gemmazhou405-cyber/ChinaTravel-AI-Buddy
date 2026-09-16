import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const sitemapPath = join('dist', 'sitemap.xml');
const seoUrl = 'https://chinaeasebuddy.com/first-trip-to-china/';

let sitemap = await readFile(sitemapPath, 'utf8');
if (!sitemap.includes(seoUrl)) {
  sitemap = sitemap.replace(
    '</urlset>',
    `  <url>\n    <loc>${seoUrl}</loc>\n    <lastmod>2026-09-16</lastmod>\n  </url>\n</urlset>`,
  );
  await writeFile(sitemapPath, sitemap);
}
