import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const site = 'https://chinaeasebuddy.com';
const template = await readFile('dist/index.html', 'utf8');

const resources = [
  ['/plan/', 'Free Trip Starter'],
  ['/first-trip-to-china/', 'First Trip to China guide'],
  ['/china-travel-checklist/', 'China travel checklist'],
  ['/china-travel-apps/', 'Essential China travel apps'],
  ['/alipay-for-foreigners/', 'Alipay for foreign visitors'],
  ['/china-payment-guide/', 'China payment guide'],
  ['/china-emergency-numbers/', 'China emergency numbers'],
];

const pages = [
  {
    route: 'partners/hostel-china-travel-help',
    title: 'China Travel Help for Hotel and Hostel Guests | ChinaEase Buddy',
    description: 'Practical help with payments, taxis, hotel addresses, food, useful Chinese and emergencies while you are in China.',
    eyebrow: 'Local help for guests in China',
    h1: 'In China now? Get the practical help you need next.',
    intro: 'Pay, take a taxi, show your hotel address, order food and find emergency help without guessing.',
    primaryHref: '/plan/',
    primaryLabel: 'Get my free local China travel plan',
    sectionTitle: 'Solve the next travel problem in a few taps',
    cards: [
      ['/china-payment-guide/', 'Pay in China', 'Set up Alipay or WeChat Pay and keep a backup payment method ready.'],
      ['/didi-in-china-for-foreigners/', 'Take a taxi or DiDi', 'Book rides, confirm pickup points and avoid address confusion.'],
      ['/?journey=china&tool=stay', 'Show your hotel address', 'Keep your hotel name and address ready in Chinese for drivers.'],
      ['/china-emergency-numbers/', 'Emergency contacts', 'Find key numbers and practical steps for urgent situations.'],
      ['/?journey=china&tool=food', 'Useful Chinese phrases', 'Show clear phrases to drivers, hotel staff and restaurant teams.'],
      ['/?journey=china&tool=food', 'Food and allergy help', 'Explain dietary needs and confirm ingredients directly with staff.'],
    ],
  },
  {
    route: 'partners/china-visa-checker',
    kind: 'visa',
    title: 'Free China Visa Policy Check for Travelers | ChinaEase Buddy',
    description: 'Check if you may need a visa for China before your trip. Use ChinaEase Buddy’s free visa policy checker, then prepare payments, apps, internet, and your first China itinerary.',
    eyebrow: 'Free China visa policy check',
    h1: 'Check if you may need a visa for China',
    intro: 'Answer a few simple questions and get a quick China travel requirement check before you book your trip.',
    primaryHref: '/china-visa-free-checker/',
    primaryLabel: 'Check my China visa policy',
    sectionTitle: 'After your visa check, prepare the rest',
    cards: [
      ['/china-payment-guide/', 'Payments', 'Prepare Alipay, WeChat Pay, cards and a realistic backup option.'],
      ['/china-sim-card-for-foreigners/', 'Internet and eSIM', 'Compare eSIM and physical SIM choices before you land.'],
      ['/china-travel-apps/', 'Essential apps', 'Set up maps, transport, payments and translation in advance.'],
      ['/china-airport-arrival-guide/', 'Airport arrival basics', 'Plan mobile data, transport and your first address before departure.'],
      ['/plan/', 'Free China trip plan', 'Turn your dates, cities and interests into a practical route preview.'],
    ],
  },
  {
    route: 'partners/first-trip-to-china',
    title: 'First Trip to China: Start Here | ChinaEase Buddy',
    description: 'A practical starting point for payments, internet, transport, hotels, food, language, safety and itinerary planning.',
    eyebrow: 'First trip to China',
    h1: 'Not sure where to start? Start with what matters.',
    intro: 'Get the basics for payments, internet, transport, hotels, food, language, safety and itinerary planning in one clear place.',
    primaryHref: '/plan/',
    primaryLabel: 'Start my free China trip plan',
    sectionTitle: 'Everything a first-time visitor should prepare',
    cards: [
      ['/china-travel-checklist/', 'First-trip checklist', 'See what to prepare before departure and what to keep accessible.'],
      ['/china-payment-guide/', 'Payments', 'Set up mobile payment and keep cards or cash as a backup.'],
      ['/china-sim-card-for-foreigners/', 'Internet', 'Choose an eSIM or physical SIM that suits your trip.'],
      ['/didi-in-china-for-foreigners/', 'Transport', 'Use DiDi, metro and trains with fewer language surprises.'],
      ['/china-hotels-for-foreigners/', 'Hotels', 'Choose a practical area and keep your address ready in Chinese.'],
      ['/?journey=china&tool=food', 'Food and language', 'Order more confidently and show useful phrases in real situations.'],
      ['/china-emergency-numbers/', 'Safety', 'Save emergency numbers and know the first steps if something goes wrong.'],
    ],
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function metaTag(html, selector, value) {
  const safe = escapeHtml(value);
  if (selector === 'description') return html.replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${safe}" />`);
  if (selector === 'canonical') return html.replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${safe}" />`);
  if (selector === 'og:title') return html.replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${safe}" />`);
  if (selector === 'og:description') return html.replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${safe}" />`);
  if (selector === 'og:url') return html.replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${safe}" />`);
  if (selector === 'twitter:title') return html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${safe}" />`);
  if (selector === 'twitter:description') return html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${safe}" />`);
  return html;
}

for (const page of pages) {
  const canonical = `${site}/${page.route}/`;
  const cards = page.cards.map(([href, title, description]) => (
    `<article><h3><a href="${escapeHtml(href)}">${escapeHtml(title)}</a></h3><p>${escapeHtml(description)}</p></article>`
  )).join('');
  const resourceLinks = resources.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('');
  const body = page.kind === 'visa'
    ? `<main><section><p>${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.h1)}</h1><p>${escapeHtml(page.intro)}</p><p>Based on your passport, destination, and travel purpose.</p><a href="#visa-checker-form">${escapeHtml(page.primaryLabel)}</a><p>Free account required · Takes less than 1 minute</p><aside aria-label="Free China visa policy checker"><form id="visa-checker-form"><h2>Check your planned trip</h2><p>Enter your details below. Create a free account to reveal your result.</p><label>Passport nationality<select required name="nationality"><option value="">Select nationality</option></select></label><label>Passport type<select required name="passportType"><option value="">Select passport type</option><option value="ordinary">Ordinary passport</option><option value="other">Diplomatic/service/official/other</option></select></label><label>Planned entry date<input required type="date" name="entryDate"></label><label>Purpose of visit<select required name="purpose"><option value="">Select purpose</option><option value="tourism">Tourism</option><option value="business">Business</option><option value="transit">Transit</option></select></label><label>Planned stay (days)<input required type="number" min="1" max="180" value="10" name="stayDays"></label><label>Trip type<select required name="tripType"><option value="">Select trip type</option><option value="mainland_visit">Mainland China visit</option><option value="transit">Transit through Mainland China</option><option value="hainan_only">Hainan only</option></select></label><button type="submit">Check my China visa policy</button><p>Free account required · Results appear after sign-up or login</p></form></aside></section><section><h2>Why check before you fly?</h2><article><h3>Rules depend on your trip</h3><p>Visa-free policies can depend on your passport, trip length, route and purpose, not nationality alone.</p></article><article><h3>Avoid last-minute uncertainty</h3><p>Airline boarding and entry checks are easier when you understand which policy may apply before departure.</p></article><article><h3>Prepare the right documents</h3><p>Check the requirements before committing to non-refundable bookings and keep relevant travel documents ready.</p></article></section><section><h2>${escapeHtml(page.sectionTitle)}</h2>${cards}<a href="/plan/">Get a free China trip plan</a><a href="/china-travel-checklist/">Open China travel checklist</a></section><section><h2>Keep planning with ChinaEase Buddy</h2><ul>${resourceLinks}</ul></section></main>`
    : `<main><section><p>${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.h1)}</h1><p>${escapeHtml(page.intro)}</p><a href="${escapeHtml(page.primaryHref)}">${escapeHtml(page.primaryLabel)}</a></section><section><h2>${escapeHtml(page.sectionTitle)}</h2>${cards}</section><section><h2>Build a trip around your real dates</h2><p>Use the Free Trip Starter to choose cities, dates and interests, see an immediate Day 1 preview and receive the full plan by email.</p><a href="/plan/">Open the Free Trip Starter</a></section><section><h2>Keep planning with ChinaEase Buddy</h2><ul>${resourceLinks}</ul></section></main>`;
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
  html = metaTag(html, 'description', page.description);
  html = metaTag(html, 'canonical', canonical);
  html = metaTag(html, 'og:title', page.title);
  html = metaTag(html, 'og:description', page.description);
  html = metaTag(html, 'og:url', canonical);
  html = metaTag(html, 'twitter:title', page.title);
  html = metaTag(html, 'twitter:description', page.description);
  html = html.replace(/<meta name="robots"[^>]*>/g, '');
  html = html.replace('</head>', '    <meta name="robots" content="index, follow" />\n</head>');
  html = html.replace(/<div id="root">[\s\S]*<\/div>\s*<\/body>/, `<div id="root">${body}</div>\n  </body>`);
  const target = path.join('dist', page.route);
  await mkdir(target, { recursive: true });
  await writeFile(path.join(target, 'index.html'), html);
}

const sitemapPath = 'dist/sitemap.xml';
let sitemap = await readFile(sitemapPath, 'utf8');
for (const page of pages) {
  const url = `${site}/${page.route}/`;
  if (!sitemap.includes(`<loc>${url}</loc>`)) {
    sitemap = sitemap.replace(
      '</urlset>',
      `  <url>\n    <loc>${url}</loc>\n    <lastmod>2026-10-05</lastmod>\n  </url>\n</urlset>`,
    );
  }
}
await writeFile(sitemapPath, sitemap);

console.log('Campaign landing pages generated');
