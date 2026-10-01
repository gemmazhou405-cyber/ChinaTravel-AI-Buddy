import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const pages = [
  'tenpaygo-for-tourists',
  'nia-12367-online-accommodation-registration-guide',
  'china-visa-free-checker',
];

for (const page of pages) {
  const file = join('dist', page, 'index.html');
  assert.ok(existsSync(file), `${page}: generated HTML exists`);
  const html = readFileSync(file, 'utf8');
  assert.match(html, /<title>[^<]+<\/title>/, `${page}: title`);
  assert.match(html, /<meta name="description" content="[^"]+" \/>/, `${page}: description`);
  assert.match(html, new RegExp(`<link rel="canonical" href="https://chinaeasebuddy\\.com/${page}/"`), `${page}: canonical`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page}: exactly one H1 in static HTML`);
  assert.doesNotMatch(html, /noindex/i, `${page}: indexable`);

  const schemaBlocks = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  assert.ok(schemaBlocks.length > 0, `${page}: JSON-LD exists`);
  schemaBlocks.forEach((match) => JSON.parse(match[1]));

  const links = [...html.matchAll(/<a[^>]+href="(\/[^"]*)"/g)].map((match) => match[1]);
  for (const href of links) {
    if (href === '/' || href.startsWith('/?') || href.startsWith('/#')) continue;
    const pathname = href.split(/[?#]/)[0].replace(/^\//, '').replace(/\/$/, '');
    assert.ok(existsSync(join('dist', pathname, 'index.html')), `${page}: internal link ${href} resolves`);
  }
  console.log(`PASS ${page}`);
}

const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
for (const page of pages) {
  assert.match(sitemap, new RegExp(`https://chinaeasebuddy\\.com/${page}/`), `${page}: sitemap entry`);
}
const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.ok(sitemapLocations.every((location) => !location.includes('?') && !location.includes('#')), 'sitemap excludes query strings and anchors');

const tripFunction = readFileSync('functions/api/leads/trip.js', 'utf8');
const tripClient = readFileSync('src/lib/tripLead.ts', 'utf8');
assert.match(tripFunction, /daily_itinerary\.slice\(0, 1\)/, 'browser preview remains Day 1 only');
assert.match(tripFunction, /email_dispatch_success/, 'email provider acceptance event exists');
assert.match(tripFunction, /email_dispatch_failure/, 'email provider failure event exists');
assert.doesNotMatch(tripFunction, /email_delivered/, 'no unsupported delivery claim');
assert.match(tripClient, /data\?\.status !== 'received'/, 'client accepts only explicit received responses as success');

console.log('Growth release audit passed.');
