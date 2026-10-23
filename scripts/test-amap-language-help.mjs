import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { getAmapLanguageFix } from '../src/lib/amapLanguageHelp.mjs';
import { renderAmapLanguageHelp } from './render-amap-help.mjs';

const content = JSON.parse(readFileSync('src/data/amapEnglishSetup.json', 'utf8'));
const ids = new Set(content.sections.map(({ title }) => `#${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`));
assert.equal(getAmapLanguageFix(content.helper, '', 'menus_chinese'), null);
assert.equal(getAmapLanguageFix(content.helper, 'iphone', ''), null);
assert.equal(getAmapLanguageFix(content.helper, 'unexpected', 'menus_chinese'), null);
assert.equal(getAmapLanguageFix(content.helper, 'android', 'unexpected'), null);
let count = 0;
for (const device of content.helper.devices) {
  for (const issue of content.helper.issues) {
    const fix = getAmapLanguageFix(content.helper, device.id, issue.id);
    assert(fix && ids.has(fix.href), `${device.id}/${issue.id} must lead to a real section`);
    assert(fix.steps.length >= 2, 'Every supported symptom needs actionable checks');
    if (issue.id === 'place_names') assert.equal(fix.href, '#english-interface-and-chinese-place-names-are-different');
    if (issue.id === 'wrong_result') assert.equal(fix.href, '#test-an-english-place-search-before-travel');
    if (issue.id === 'menus_chinese' && device.id === 'iphone') assert.equal(fix.href, '#iphone-check-the-app-language');
    if (issue.id === 'menus_chinese' && device.id === 'android') assert.equal(fix.href, '#android-check-app-languages');
    count += 1;
  }
}
const fallback = renderAmapLanguageHelp(content);
for (const href of fallback.matchAll(/href="([^"]+)"/g)) assert(ids.has(href[1]), 'No-JavaScript helper links must resolve');
for (const issue of content.helper.issues) assert(fallback.includes(issue.label.replaceAll('&', '&amp;')));
console.log(`PASS ${count} phone/symptom paths, invalid-input handling and no-JavaScript destination links.`);
