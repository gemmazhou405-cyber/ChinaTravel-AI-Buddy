const routes = [
  '/partners/hostel-china-travel-help/',
  '/partners/china-visa-checker/',
  '/partners/first-trip-to-china/',
];

const origin = process.env.CAMPAIGN_TEST_ORIGIN || 'http://127.0.0.1:8788';
const failures = [];
for (const route of routes) {
  const response = await fetch(`${origin}${route}?partner=test-partner&channel=referral`, { redirect: 'manual' });
  const html = await response.text();
  if (response.status !== 200) failures.push(`${route} returned ${response.status}`);
  if (response.headers.get('location')) failures.push(`${route} unexpectedly redirected`);
  if (!html.includes(`https://chinaeasebuddy.com${route}`)) failures.push(`${route} canonical mismatch`);
}

if (failures.length) {
  console.error(failures.map((item) => `FAIL ${item}`).join('\n'));
  process.exit(1);
}
console.log('campaign routes return direct HTML 200 responses without redirect loops');
