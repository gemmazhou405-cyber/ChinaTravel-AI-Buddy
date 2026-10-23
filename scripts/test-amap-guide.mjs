import { existsSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { shotIds } from '../src/lib/amapGuideMarkup.mjs';
import { createAmapGuideRenderer } from './render-amap-guide.mjs';

const content = JSON.parse(readFileSync('src/data/amapEnglishSetup.json', 'utf8'));
const used = shotIds(content);
assert.deepEqual([...used].sort((a, b) => a - b), Object.keys(content.screenshots).sort((a, b) => a - b), 'Every screenshot is placed exactly once');
for (const [id, shot] of Object.entries(content.screenshots)) {
  assert(existsSync(`public${shot.src}`), `Screenshot ${id} file exists`);
  assert(shot.alt.length > 20 && shot.width <= 1080 && shot.height > 0, `Screenshot ${id} has alt text and dimensions`);
}

const guide = createAmapGuideRenderer(content);
const html = guide.quickAnswer() + guide.cta() + guide.body();
const images = [...html.matchAll(/<img [^>]+>/g)].map(([tag]) => tag);
assert.equal(images.length, used.length);
assert(!images[0].includes('loading="lazy"') && images.slice(1).every((tag) => tag.includes('loading="lazy"')), 'Only the first screenshot loads eagerly');
assert.equal((html.match(new RegExp(content.screenshotCaption, 'g')) || []).length, used.length, 'Every screenshot has the caption');

const ids = new Set([...html.matchAll(/ id="([^"]+)"/g)].map((match) => match[1]));
for (const id of ['switch', 'english-grayed-out', 'search', 'sign-in', 'taxi', 'metro', 'hi-china', 'menu-translation', 'offline', 'troubleshooting']) assert(ids.has(id), `Anchor #${id} exists`);
for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.has(id), `In-page link #${id} resolves`);
assert(html.includes('href="https://www.fiverr.com/s/p3dZbQR"'));
assert(images.every((tag) => tag.includes('width="640"')), 'Screenshots are 640px wide');
for (const step of [1, 2, 3, 4]) assert(html.includes(`>Step ${step}</strong>`), `Step ${step} label`);
const rowWidths = [...html.matchAll(/justify-content:center;[^>]*>((?:\s*<figure[\s\S]*?<\/figure>)+)\s*<\/div>/g)].map(([, row]) => [...row.matchAll(/max-width:(\d+)px/g)].map((m) => Number(m[1])));
assert.deepEqual(rowWidths.map((row) => row.length), [4, 1, 2, 2, 1, 1, 1, 1, 3, 1, 1], 'Screenshot rows: steps, pairs and the ordering trio');
assert(rowWidths.every((row) => row.every((width) => width === (row.length >= 3 ? 220 : 300))), 'Row widths: 220px for rows of 3+, otherwise 300px');
assert(!html.includes('[[shot:') && !html.includes('**'), 'No raw markup leaks into HTML');
console.log(`PASS ${used.length} screenshots, ${ids.size} anchors, in-page links and setup CTA.`);
