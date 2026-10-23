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
assert(!html.includes('[[shot:') && !html.includes('**'), 'No raw markup leaks into HTML');
console.log(`PASS ${used.length} screenshots, ${ids.size} anchors, in-page links and setup CTA.`);
