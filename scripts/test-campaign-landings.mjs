import { readFile } from 'node:fs/promises';

const failures = [];
const requiredLinks = [
  '/plan/',
  '/first-trip-to-china/',
  '/china-travel-checklist/',
  '/china-travel-apps/',
  '/alipay-for-foreigners/',
  '/china-payment-guide/',
  '/china-emergency-numbers/',
];
const checks = [
  ['dist/partners/hostel-china-travel-help/index.html', '/partners/hostel-china-travel-help/', ['In China now?', 'Take a taxi or DiDi']],
  ['dist/partners/china-visa-checker/index.html', '/partners/china-visa-checker/', ['Check if you may need a visa for China', 'Check my China visa policy', 'Takes less than 1 minute', 'Passport nationality', 'Passport type', 'Planned entry date', 'Purpose of visit', 'Planned stay (days)', 'Trip type', 'Results appear on this page.', 'Why check before you fly?']],
  ['dist/partners/first-trip-to-china/index.html', '/partners/first-trip-to-china/', ['Not sure where to start?', 'Everything a first-time visitor should prepare']],
];

for (const [file, route, needles] of checks) {
  const html = await readFile(file, 'utf8');
  if (!html.includes(`https://chinaeasebuddy.com${route}`)) failures.push(`${route} missing canonical`);
  if (!html.includes('<meta name="robots" content="index, follow"')) failures.push(`${route} is not indexable`);
  if ((html.match(/<h1>/g) || []).length !== 1) failures.push(`${route} must contain one static H1`);
  for (const needle of [...needles, ...requiredLinks]) {
    if (!html.includes(needle)) failures.push(`${route} missing ${needle}`);
  }
}

const sitemap = await readFile('dist/sitemap.xml', 'utf8');
for (const [, route] of checks) {
  if (!sitemap.includes(`https://chinaeasebuddy.com${route}`)) failures.push(`${route} missing from sitemap`);
}
if (sitemap.includes('https://chinaeasebuddy.com/partners/</loc>')) failures.push('obsolete B2B /partners/ URL remains in sitemap');

const appSource = await readFile('src/App.tsx', 'utf8');
const packageSource = await readFile('package.json', 'utf8');
if (appSource.includes('PartnersPage')) failures.push('B2B PartnersPage is still mounted');
if (packageSource.includes('test:partner-lead')) failures.push('Partner Lead test remains in package scripts');

if (failures.length) {
  console.error(failures.map((item) => `FAIL ${item}`).join('\n'));
  process.exit(1);
}
console.log('three traveler campaign landing pages, static links, metadata and sitemap checks passed');
