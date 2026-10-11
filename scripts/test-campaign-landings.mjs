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
  ['dist/partners/china-visa-checker/index.html', '/partners/china-visa-checker/', ['Free China visa policy check', 'Check if you may need a visa for China', 'href="/china-visa-free-checker/"', 'Check my China visa policy', 'Takes less than 1 minute', 'What the live checker asks', 'Possible result', 'This is an example, not a form.', 'Why check before you fly?']],
  ['dist/partners/first-trip-to-china/index.html', '/partners/first-trip-to-china/', ['Not sure where to start?', 'Everything a first-time visitor should prepare']],
];

for (const [file, route, needles] of checks) {
  const html = await readFile(file, 'utf8');
  if (!html.includes(`https://chinaeasebuddy.com${route}`)) failures.push(`${route} missing canonical`);
  const expectedRobots = route === '/partners/china-visa-checker/' ? 'index, follow' : 'noindex, follow';
  if (!html.includes(`<meta name="robots" content="${expectedRobots}"`)) failures.push(`${route} must be ${expectedRobots}`);
  if ((html.match(/<h1>/g) || []).length !== 1) failures.push(`${route} must contain one static H1`);
  for (const needle of [...needles, ...requiredLinks]) {
    if (!html.includes(needle)) failures.push(`${route} missing ${needle}`);
  }
  if (route === '/partners/china-visa-checker/' && html.includes('No account needed')) {
    failures.push(`${route} still claims that no account is needed`);
  }
  if (route === '/partners/china-visa-checker/' && html.includes('id="visa-checker-form"')) {
    failures.push(`${route} still embeds the full checker in the landing-page hero`);
  }
}

const sitemap = await readFile('dist/sitemap.xml', 'utf8');
for (const [, route] of checks) {
  const included = sitemap.includes(`https://chinaeasebuddy.com${route}`);
  if (route === '/partners/china-visa-checker/' && !included) failures.push(`${route} must be included in sitemap`);
  if (route !== '/partners/china-visa-checker/' && included) failures.push(`${route} must be excluded from sitemap`);
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
console.log('three traveler campaign landing pages, static links, robots metadata and sitemap checks passed');
