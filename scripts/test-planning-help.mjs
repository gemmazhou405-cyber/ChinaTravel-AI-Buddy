// Run after npm run build. Exercises the real React/static renderers and analytics
// with local doubles; never opens mail, checkout, or a network connection.
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { renderPlanningHelp } from './render-planning-help.mjs';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const planning = await readJson('src/data/planningHelp.json');
const expectedServices = [
  'Itinerary review & fix — from $20',
  'Custom China itinerary — from $40',
  'Guide / private driver — ask for a quote',
];
const decode = (value) => value.replace(/&(?:amp|quot|#39|apos|lt|gt|#\d+|#x[\da-f]+);/gi, (entity) => {
  const names = { '&amp;': '&', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&lt;': '<', '&gt;': '>' };
  if (names[entity.toLowerCase()]) return names[entity.toLowerCase()];
  return String.fromCodePoint(entity.toLowerCase().startsWith('&#x') ? Number.parseInt(entity.slice(3, -1), 16) : Number(entity.slice(2, -1)));
});
const textOf = (html) => decode(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const anchorsOf = (html) => [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map(([, attributes, content]) => ({
  attributes: Object.fromEntries([...attributes.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [key, decode(value)])),
  label: textOf(content),
}));

assert.equal(planning.email, 'lin@chinaeasebuddy.com');
assert.equal(planning.emailLabel, 'Email Lin your route', 'free route-help label remains unchanged');
assert.equal(planning.emailHref, 'mailto:lin@chinaeasebuddy.com?subject=My%20China%20route', 'free route-help mail remains unchanged');
assert.equal(planning.paidLabel, 'Ask about paid trip planning');
assert.deepEqual(planning.paidServices, expectedServices);
assert.match(planning.serviceNote, /inquiry/i);
assert.match(planning.serviceNote, /quoted after consultation/i);
assert.match(planning.serviceNote, /may match or coordinate third-party providers/i);
assert.doesNotMatch(`${planning.body} ${planning.digitalScope}`, /fiverr/i);
assert.match(planning.digitalScope, /Human customized itinerary planning is a separate paid service\./);
const inquiry = new URL(planning.paidHref);
assert.equal(inquiry.protocol, 'mailto:');
assert.equal(inquiry.pathname, planning.email);
assert.deepEqual([...inquiry.searchParams.keys()].sort(), ['body', 'subject'], 'mailto has no extra recipients or tracking fields');
assert.equal(inquiry.searchParams.get('subject'), 'Paid China trip planning');
const inquiryBody = inquiry.searchParams.get('body');
for (const field of [/travel dates/i, /cities/i, /number of travelers/i, /already have an itinerary/i, /main questions\s*\/\s*priorities/i]) {
  assert.match(inquiryBody, field, 'paid inquiry asks for the agreed trip context');
}
assert.match(inquiryBody, /do not include passport numbers, payment details or other sensitive information/i);

function checkPlanningBox(html, expectedPlacement, where) {
  const anchors = anchorsOf(html);
  assert.equal(anchors.length, 2, `${where}: one free route-help and one paid-planning action`);
  const free = anchors.find(({ attributes }) => attributes['data-planning-help'] === 'email');
  const paid = anchors.find(({ attributes }) => attributes['data-planning-help'] === 'paid-planning');
  assert.ok(free && paid, `${where}: separate free and paid analytics actions`);
  assert.equal(free.attributes.href, planning.emailHref, `${where}: free email remains direct`);
  assert.equal(free.label, planning.emailLabel);
  assert.equal(paid.attributes.href, planning.paidHref, `${where}: structured paid inquiry survives HTML escaping`);
  assert.equal(paid.label, planning.paidLabel);
  assert.equal(paid.attributes.target, undefined, `${where}: email does not open a blank tab`);
  assert.equal(paid.attributes['data-planning-placement'], expectedPlacement);
  assert.equal(free.attributes['data-planning-placement'], expectedPlacement);
  for (const service of expectedServices) assert.ok(textOf(html).includes(service), `${where}: ${service}`);
  assert.ok(textOf(html).includes(planning.serviceNote), `${where}: inquiry/third-party provider boundary`);
  assert.doesNotMatch(html, /fiverr(?:\.com)?/i, `${where}: no deprecated planning destination or label`);
}

checkPlanningBox(renderPlanningHelp(planning, 'pricing'), 'pricing', 'static renderer');
// Render the actual TSX with the same React instance used by react-dom/server.
const require = createRequire(import.meta.url);
const reactBuild = await build({
  entryPoints: ['src/components/LinBox.tsx'], bundle: true, write: false,
  platform: 'node', format: 'cjs', jsx: 'automatic', external: ['react', 'react/jsx-runtime'],
  define: { 'import.meta.env.DEV': 'false' },
});
const componentModule = { exports: {} };
new Function('require', 'module', 'exports', reactBuild.outputFiles[0].text)(require, componentModule, componentModule.exports);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const reactHtml = renderToStaticMarkup(React.createElement(componentModule.exports.default, { placement: 'pricing' }));
checkPlanningBox(reactHtml, 'pricing', 'React LinBox');
console.log('PASS: shared service data, structured inquiry, free email, and React/static CTA parity.');

// Exercise delegated clicks through the real production analytics module.
const originalGlobals = Object.fromEntries(['window', 'document', 'Element', 'fetch'].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}
class ClickTarget {
  constructor(anchor) { this.anchor = anchor; }
  closest(selector) { return selector === 'a[data-planning-help]' ? this.anchor : null; }
}
const clickListeners = [];
const events = [];
try {
  globalThis.window = {
    location: new URL('https://chinaeasebuddy.com/7-day-china-itinerary/?utm_source=review&utm_medium=referral&utm_campaign=planning'),
    sessionStorage: new MemoryStorage(), localStorage: new MemoryStorage(),
  };
  globalThis.document = {
    referrer: 'https://example.test/china-guide',
    addEventListener: (type, listener) => { if (type === 'click') clickListeners.push(listener); },
  };
  globalThis.Element = ClickTarget;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/events', 'analytics only reaches the intercepted local endpoint');
    assert.equal(options.keepalive, true, 'navigation keeps attribution delivery alive');
    events.push(JSON.parse(options.body));
    return new Response('{}', { status: 200 });
  };
  const analyticsBuild = await build({
    entryPoints: ['src/lib/analytics.ts'], bundle: true, write: false,
    platform: 'browser', format: 'esm', define: { 'import.meta.env.DEV': 'false' },
  });
  const analytics = await import(`data:text/javascript;base64,${Buffer.from(analyticsBuild.outputFiles[0].text).toString('base64')}`);
  analytics.initAttribution();
  analytics.initAttribution();
  assert.equal(clickListeners.length, 1, 'multiple shared boxes install only one click listener');
  const click = (action, placement) => clickListeners[0]({ target: new ClickTarget({ dataset: { planningHelp: action, planningPlacement: placement } }) });
  click('email', 'home');
  click('paid-planning', 'pricing');
  click('app-setup', 'amap-setup');
  click('paid-planning', '<invalid>');
  click('unknown', 'home');
  click('fiverr', 'home');
  clickListeners[0]({ target: null });
  await Promise.resolve();
  assert.equal(events.length, 4, 'only supported actions are tracked');
  assert.deepEqual(events.map(({ ctaName, destination, tool }) => ({ ctaName, destination, tool })), [
    { ctaName: 'planning_email_click', destination: 'email', tool: 'planning_help_home' },
    { ctaName: 'planning_paid_planning_click', destination: 'paid-planning', tool: 'planning_help_pricing' },
    { ctaName: 'app_setup_guide_click', destination: 'app-setup-guide', tool: 'planning_help_amap-setup' },
    { ctaName: 'planning_paid_planning_click', destination: 'paid-planning', tool: 'planning_help_guide' },
  ]);
  for (const event of events) {
    assert.equal(event.event, 'cta_clicked', 'existing allowed event is retained');
    assert.equal(event.sourcePath, '/7-day-china-itinerary/');
    assert.equal(event.source, 'review');
    assert.equal(event.medium, 'referral');
    assert.equal(event.campaign, 'planning');
    assert.equal(event.referrerDomain, 'example.test');
  }
  assert.doesNotMatch(JSON.stringify(events), /mailto:|passport|travel dates|fiverr/i, 'inquiry body and deprecated service names never enter events');
} finally {
  for (const [key, descriptor] of Object.entries(originalGlobals)) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
}
console.log('PASS: free/paid/app event identities, sanitized placement, single listener, and source attribution.');

async function htmlFiles(directory) {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) paths.push(...await htmlFiles(path));
    else if (entry.name.endsWith('.html')) paths.push(path);
  }
  return paths;
}
const built = new Map();
let planningPageCount = 0;
for (const path of await htmlFiles('dist')) {
  const html = await readFile(path, 'utf8');
  built.set(path, html);
  assert.ok(anchorsOf(html).every(({ attributes }) => !/fiverr\.com/i.test(attributes.href ?? '')), `${path}: no public CTA points to the deprecated destination`);
  const boxes = [...html.matchAll(/<section\b[^>]*\bdata-planning-help-box\b[^>]*>[\s\S]*?<\/section>/gi)];
  if (boxes.length) planningPageCount += 1;
  for (const [box] of boxes) {
    const placement = anchorsOf(box)[0]?.attributes['data-planning-placement'];
    assert.ok(placement, `${path}: placement remains available for attribution`);
    checkPlanningBox(box, placement, path);
  }
}
for (const path of ['dist/index.html', 'dist/plan/index.html', 'dist/pricing/index.html', 'dist/7-day-china-itinerary/index.html', 'dist/china-payment-guide/index.html', 'dist/amap-english-mode-guide-2026/index.html']) {
  assert.match(built.get(path) ?? '', /data-planning-help="paid-planning"/, `${path}: representative shared CTA exists`);
}
assert.ok(planningPageCount > 0, 'generated output contains shared planning help');

const appDestinations = {
  amapEnglishSetup: ['/amap-english-mode-guide-2026/', '/amap-english-mode-guide-2026/#switch'],
  mapsGuide: ['/amap-vs-google-maps-china/', '/amap-english-mode-guide-2026/#download'],
  wechatVerificationGuide: ['/wechat-verification-without-friend-qr-2026/', '/wechat-verification-without-friend-qr-2026/#no-helper'],
  tenpaygoGuide: ['/tenpaygo-for-tourists/', '/tenpaygo-for-tourists/#sign-up'],
  didiGuide: ['/didi-in-china-for-foreigners/', '/didi-in-china-for-foreigners/#download'],
  didiPaymentGuide: ['/didi-payment-for-foreigners/', '/didi-payment-for-foreigners/#alipay-wechat'],
  alipayMetroGuide: ['/alipay-metro-qr-transport-code-guide/', '/alipay-metro-qr-transport-code-guide/#alipay-ride-code'],
  appsHubGuide: ['/china-travel-apps/', '/china-travel-apps/#before'],
  checklistGuide: ['/china-travel-checklist/', '/china-travel-apps/#before'],
  airportArrivalGuide: ['/china-airport-arrival-guide/', '/china-travel-checklist/#apps-and-connectivity'],
};
for (const [name, [route, expectedHref]] of Object.entries(appDestinations)) {
  const content = await readJson(`src/data/${name}.json`);
  assert.equal(content.cta.href, expectedHref, `${name}: intent-specific free help`);
  const appAction = anchorsOf(built.get(`dist${route}index.html`) ?? '').filter(({ attributes }) => attributes['data-planning-help'] === 'app-setup');
  assert.equal(appAction.length, 1, `${route}: one distinct setup action`);
  assert.equal(appAction[0].attributes.href, expectedHref);
  assert.equal(appAction[0].attributes.target, undefined, `${route}: free guide uses ordinary internal navigation`);
  const target = new URL(expectedHref, 'https://chinaeasebuddy.com');
  const targetHtml = built.get(`dist${target.pathname}index.html`);
  assert.ok(targetHtml, `${route}: target page exists`);
  assert.ok([...targetHtml.matchAll(/\bid="([^"]+)"/g)].some(([, id]) => id === target.hash.slice(1)), `${route}: ${target.hash} resolves`);
}
console.log(`PASS: ${planningPageCount} generated planning-help pages, six representative routes, and all ten intent-specific setup CTAs.`);
