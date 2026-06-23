const ORIGIN = 'https://chinaeasebuddy.com';

const pages = [
  {
    path: '/',
    h1: /China travel help|Travel China without/i,
    keywords: ['ChinaEase Buddy', 'Travel Passes', 'Buddy AI'],
    links: ['/guides', '/pricing'],
  },
  {
    path: '/guides',
    h1: /China Travel Guides/i,
    keywords: ['China Travel Apps', 'Alipay for Foreigners', 'China Payment Guide', 'China Emergency Numbers'],
    links: ['/china-travel-apps', '/china-payment-guide', '/faq'],
  },
  {
    path: '/china-payment-guide',
    h1: /How to Pay in China as a Foreigner/i,
    keywords: ['Alipay', 'WeChat Pay', 'foreign card', 'payment failure'],
    links: ['/?journey=china&tool=pay', '/alipay-for-foreigners'],
  },
  {
    path: '/china-travel-apps',
    h1: /Essential Apps/i,
    keywords: ['Alipay', 'WeChat', 'Amap', 'Didi', 'Trip.com'],
    links: ['/?journey=before&tool=apps', '/china-travel-checklist'],
  },
  {
    path: '/alipay-for-foreigners',
    h1: /Can Foreigners Use Alipay in China/i,
    keywords: ['Alipay', 'foreign card', 'backup payment', 'China'],
    links: ['/?journey=before&tool=payment', '/china-payment-guide'],
  },
  {
    path: '/china-travel-checklist',
    h1: /China Travel Checklist/i,
    keywords: ['apps', 'payment setup', 'Hotel address', 'Emergency numbers'],
    links: ['/?journey=before&tool=checklist', '/china-travel-apps'],
  },
  {
    path: '/china-emergency-numbers',
    h1: /Emergency Numbers in China/i,
    keywords: ['110 Police', '120 Ambulance', '119 Fire', 'Hospital phrases'],
    links: ['/?journey=emergency', '/faq'],
  },
  {
    path: '/faq',
    h1: /FAQ|Frequently Asked Questions/i,
    keywords: ['What is ChinaEase Buddy?', 'Is ChinaEase Buddy free?', 'How do paid passes work?'],
    links: ['/', '/china-travel-apps'],
  },
  {
    path: '/pricing',
    h1: /Pricing|Travel Passes/i,
    keywords: ['Free', 'Trip Pass', 'Group Pass'],
    links: ['/', '/terms', '/privacy'],
  },
];

function firstMatch(html, pattern) {
  return html.match(pattern)?.[1]?.trim() || '';
}

function titleOf(html) {
  return firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
}

function metaDescriptionOf(html) {
  return firstMatch(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["'][^>]*>/i)
    || firstMatch(html, /<meta\s+content=["']([^"']+)["']\s+name=["']description["'][^>]*>/i);
}

function canonicalOf(html) {
  return firstMatch(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i)
    || firstMatch(html, /<link\s+href=["']([^"']+)["']\s+rel=["']canonical["'][^>]*>/i);
}

function h1sOf(html) {
  return [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map((match) => stripHtml(match[1]).trim())
    .filter(Boolean);
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function textSignature(text) {
  return text.slice(0, 1200).replace(/\d+/g, '#');
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1].trim())
    .filter(Boolean);
}

async function fetchPage(path) {
  const res = await fetch(`${ORIGIN}${path}`, {
    headers: {
      'User-Agent': 'ChinaEaseBuddyLaunchAudit/1.0 (+https://chinaeasebuddy.com)',
      Accept: 'text/html,application/xhtml+xml',
    },
  });
  const html = await res.text();
  return { status: res.status, html };
}

const results = [];
const signatures = new Map();

for (const page of pages) {
  const checks = [];
  let html = '';
  try {
    const response = await fetchPage(page.path);
    html = response.html;
    checks.push(['HTTP 200', response.status === 200, `status ${response.status}`]);
  } catch (error) {
    checks.push(['HTTP 200', false, error instanceof Error ? error.message : 'fetch failed']);
  }

  const title = titleOf(html);
  const description = metaDescriptionOf(html);
  const canonical = canonicalOf(html);
  const h1s = h1sOf(html);
  const text = stripHtml(html);
  const scripts = jsonLdBlocks(html);

  checks.push(['title', title.length >= 10, title || 'missing']);
  checks.push(['description', description.length >= 40, description || 'missing']);
  checks.push(['canonical', canonical === `${ORIGIN}${page.path === '/' ? '/' : page.path}`, canonical || 'missing']);
  checks.push(['single H1', h1s.length === 1 && page.h1.test(h1s[0]), h1s.join(' | ') || 'missing']);
  checks.push(['unique body', text.length >= 900, `${text.length} chars`]);
  checks.push(['no noindex', !/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html), '']);

  const missingKeywords = page.keywords.filter((keyword) => !text.toLowerCase().includes(keyword.toLowerCase()));
  checks.push(['page keywords', missingKeywords.length === 0, missingKeywords.length ? `missing: ${missingKeywords.join(', ')}` : 'ok']);

  const escapedLink = (link) => link.replace(/&/g, '&amp;');
  const missingLinks = page.links.filter((link) => {
    const encoded = escapedLink(link);
    return !html.includes(`href="${link}"`)
      && !html.includes(`href='${link}'`)
      && !html.includes(`href="${encoded}"`)
      && !html.includes(`href='${encoded}'`);
  });
  checks.push(['internal links', missingLinks.length === 0, missingLinks.length ? `missing: ${missingLinks.join(', ')}` : 'ok']);

  let jsonLdOk = scripts.length > 0;
  let jsonLdDetail = scripts.length ? `${scripts.length} block(s)` : 'missing';
  for (const block of scripts) {
    try {
      JSON.parse(block);
    } catch (error) {
      jsonLdOk = false;
      jsonLdDetail = error instanceof Error ? error.message : 'JSON.parse failed';
      break;
    }
  }
  checks.push(['JSON-LD parse', jsonLdOk, jsonLdDetail]);

  const signature = textSignature(text);
  const duplicateOf = [...signatures.entries()].find(([, value]) => value === signature)?.[0];
  checks.push(['not fallback clone', !duplicateOf, duplicateOf ? `same as ${duplicateOf}` : 'ok']);
  signatures.set(page.path, signature);

  for (const [name, pass, detail] of checks) {
    results.push({ path: page.path, name, pass, detail });
  }
}

const pad = (value, len) => String(value).padEnd(len, ' ');
console.log(`${pad('Page', 32)} ${pad('Check', 20)} ${pad('Result', 6)} Details`);
console.log('-'.repeat(96));
for (const result of results) {
  console.log(`${pad(result.path, 32)} ${pad(result.name, 20)} ${pad(result.pass ? 'PASS' : 'FAIL', 6)} ${result.detail || ''}`);
}

const failed = results.filter((result) => !result.pass);
if (failed.length) {
  console.error(`\n${failed.length} public HTML audit check(s) failed.`);
  process.exit(1);
}

console.log('\nAll public HTML audit checks passed.');
