// Offline component/browser regressions. Every API and asset request is local;
// window.open is recorded instead of navigating to Gumroad or making purchases.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = fileURLToPath(new URL('..', import.meta.url));
const origin = 'https://chinaease-purchase.test';
const text = JSON.parse(readFileSync(new URL('../src/i18n/locales/en.json', import.meta.url), 'utf8')).translation;
const define = {
  'import.meta.env.DEV': 'false', 'process.env.NODE_ENV': '"production"',
  'import.meta.env.BASE_URL': '"/"',
  'import.meta.env.VITE_GUMROAD_TRIP_URL': '"https://checkout-fixture.gumroad.com/l/trip?affiliate_id=fixture"',
  'import.meta.env.VITE_GUMROAD_GROUP_URL': '"https://checkout-fixture.gumroad.com/l/group?wanted=false"',
};
const purchase = await build({
  stdin: { resolveDir: root, contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import './src/i18n';
    import HomePasses from './src/components/home/HomePasses';
    import PricingPlans from './src/components/PricingPlans';
    import PolicyPage from './src/components/PolicyPage';
    const state = Object.freeze(window.fixturePass);
    window.originalPass = JSON.stringify(state);
    window.opens = []; window.freeCount = 0; window.toasts = [];
    window.open = (url, target, features) => { window.opens.push({ url, target, features }); return null; };
    const surface = new URLSearchParams(location.search).get('surface');
    document.addEventListener('click', event => {
      const anchor = event.target.closest('a');
      if (!anchor) return;
      if (new URL(anchor.href).hostname.endsWith('.gumroad.com')) {
        event.preventDefault(); window.open(anchor.href, anchor.target, anchor.rel);
      } else if (surface === 'pricing' && anchor.getAttribute('href') === '/') {
        event.preventDefault(); window.freeCount++;
      }
    });
    createRoot(document.getElementById('root')).render(surface === 'home'
      ? React.createElement(HomePasses, { passState: state, showToast: message => window.toasts.push(message), onOpenToolkit: () => window.freeCount++ })
      : surface === 'pricing' ? React.createElement(PolicyPage, { type: 'pricing', passState: state })
      : React.createElement(PricingPlans, { passState: state, showToast: message => window.toasts.push(message) }));
  ` },
  bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', define,
});
const claim = await build({
  stdin: { resolveDir: root, contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import './src/i18n';
    import ClaimModal from './src/components/ClaimModal';
    window.activationCount = 0;
    createRoot(document.getElementById('root')).render(React.createElement(ClaimModal, {
      onClose: () => {}, onPassActivated: async () => { window.activationCount++; },
    }));
  ` },
  bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', define,
});
const browser = await chromium.launch({ headless: true });
const failures = [];
let passed = 0;
async function check(name, run) {
  try { await run(); passed++; console.log(`PASS: ${name}`); }
  catch (error) { failures.push({ name, error: error.message.split('\n')[0] }); console.log(`FAIL: ${name}: ${error.message.split('\n')[0]}`); }
}
try {
  for (const surface of ['home', 'toolkit', 'pricing']) {
    for (const tier of ['free', 'trip', 'group', 'expired-trip', 'expired-group']) {
      await check(`${surface}: ${tier} can buy both separate Passes without changing existing access`, () => purchaseScenario(surface, tier));
    }
  }
  await check('Order ID receipt copy, opaque input and manual-only activation', claimScenario);
} finally {
  await browser.close();
}
console.log(`Pass purchase flow: ${passed} PASS / ${failures.length} FAIL (offline browser scenarios).`);
assert.deepEqual(failures, [], 'purchase-flow regressions must all pass');

async function fixture(bundle, state, url) {
  const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
  const events = [];
  const mutations = [];
  const unexpected = [];
  const errors = [];
  await context.addInitScript(pass => {
    localStorage.setItem('chinaease-lang', 'en');
    window.fixturePass = pass;
  }, state);
  await context.route('**/*', async route => {
    const request = route.request();
    const requestUrl = new URL(request.url());
    if (requestUrl.origin === origin) {
      if (requestUrl.pathname === '/') return route.fulfill({ contentType: 'text/html', body: '<html><body><div id="root"></div><script src="/fixture.js"></script></body></html>' });
      if (requestUrl.pathname === '/fixture.js') return route.fulfill({ contentType: 'application/javascript', body: bundle.outputFiles[0].text });
      if (requestUrl.pathname === '/logo.png') return route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/FhcAAAAASUVORK5CYII=', 'base64') });
      if (requestUrl.pathname === '/api/events') { events.push(request.postDataJSON()); return route.fulfill({ json: { ok: true } }); }
      if (requestUrl.pathname.startsWith('/api/')) {
        mutations.push({ path: requestUrl.pathname, method: request.method(), body: request.postDataJSON() });
        return route.fulfill({ status: 400, json: { error: 'invalid_sale' } });
      }
    }
    unexpected.push({ method: request.method(), host: requestUrl.hostname, path: requestUrl.pathname });
    return route.abort();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(3000);
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url);
  return { context, page, events, mutations, unexpected, errors };
}

async function purchaseScenario(surface, stateName) {
  const expired = stateName.startsWith('expired-');
  const tier = stateName.replace('expired-', '');
  const state = tier === 'free' ? { tier: 'free' } : {
    tier, expired, expiresAt: Date.now() + (expired ? -1 : 86400000),
    messageAllowance: tier === 'trip' ? 50 : 200, messagesUsed: 7,
    remaining: tier === 'trip' ? 43 : 193, maxDevices: tier === 'trip' ? 2 : 5, deviceCount: 1,
  };
  const { context, page, events, mutations, unexpected, errors } = await fixture(purchase, state, `${origin}/?surface=${surface}`);
  try {
    await page.getByRole('heading', { name: text.pay.plans.trip.name, exact: true }).waitFor();
    await page.getByText(text.pay.checkout.separatePassNotice, { exact: true }).waitFor();
    const current = tier !== 'free' && !expired;
    assert.equal(await page.getByText(text.pay.checkout.currentPass, { exact: true }).count(), current ? 1 : 0);
    for (const cardTier of ['trip', 'group']) {
      const card = page.getByRole('heading', { name: text.pay.plans[cardTier].name, exact: true }).locator('..');
      assert.equal(await card.getByText(text.pay.checkout.currentPass, { exact: true }).count(), current && cardTier === tier ? 1 : 0, 'the Current Pass badge belongs only to the active tier');
    }
    for (const bought of ['trip', 'group']) {
      const label = current && bought === tier
        ? text.pay.checkout.buyAgain.replace('{{pass}}', text.pay.plans[bought].name)
        : text.pay.plans[bought].cta;
      const button = page.getByRole(surface === 'pricing' ? 'link' : 'button', { name: label, exact: true });
      assert.equal(await button.isEnabled(), true, `${bought}: purchase must not be blocked by an active Pass`);
      const notice = await button.getAttribute('aria-describedby');
      assert.ok(notice, 'paid purchase references its separate-Pass warning');
      assert.equal(await page.locator(`[id="${notice}"]`).innerText(), text.pay.checkout.separatePassNotice);
      await button.click();
      const opened = await page.evaluate(() => window.opens.at(-1));
      const destination = new URL(opened.url);
      assert.equal(destination.origin, 'https://checkout-fixture.gumroad.com');
      assert.equal(destination.pathname, `/l/${bought}`);
      assert.equal(destination.searchParams.get('wanted'), 'true');
      if (bought === 'trip') assert.equal(destination.searchParams.get('affiliate_id'), 'fixture', 'checkout preserves existing query parameters');
      assert.equal(opened.target, '_blank');
      assert.match(opened.features, /noopener/);
      assert.match(opened.features, /noreferrer/);
    }
    await page.getByRole(surface === 'pricing' ? 'link' : 'button', { name: text.pay.plans.free.cta, exact: true }).click();
    await page.waitForLoadState('networkidle');
    assert.equal(await page.evaluate(() => window.opens.length), 2, 'free CTA must not open checkout');
    assert.equal(await page.evaluate(() => JSON.stringify(window.fixturePass) === window.originalPass), true, 'purchase clicks cannot alter existing entitlement data');
    assert.equal(await page.evaluate(() => window.freeCount), surface === 'toolkit' ? 0 : 1);
    assert.equal((await page.evaluate(() => window.toasts)).length, surface === 'toolkit' ? 1 : 0, 'the existing free-toolkit action remains available');
    assert.equal(events.filter(event => event.event === 'gumroad_click').length, surface === 'pricing' ? 0 : 2, 'the existing surface-specific Gumroad events are preserved');
    if (surface !== 'pricing') assert.deepEqual(events.filter(event => event.event === 'gumroad_click').map(event => event.plan), ['trip', 'group']);
    assert.equal(events.filter(event => event.event === 'cta_clicked').length, 3);
    assert.deepEqual(mutations, [], 'buying must not pre-activate or modify any membership API');
    assert.deepEqual(unexpected, [], 'no actual checkout or external request may occur');
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
}

async function claimScenario() {
  const { context, page, mutations, unexpected, errors } = await fixture(claim, { tier: 'free' }, `${origin}/?activate=1&paid=true&tier=group&sale_id=unverified`);
  try {
    assert.match(text.pass.claim.saleIdLabel, /Gumroad Order ID/);
    assert.match(text.pass.claim.subtitle, /receipt/i);
    await page.getByText(text.pass.claim.saleIdLabel, { exact: true }).waitFor();
    assert.deepEqual(mutations, [], 'return URL parameters cannot submit an activation');
    const reference = 'AbCd_Ef-Gh==';
    await page.getByPlaceholder(text.pass.claim.saleIdPlaceholder).fill(`  ${reference}  `);
    await page.locator('form').getByRole('button', { name: text.pass.claim.submit, exact: true }).click();
    await page.getByText(text.pass.claim.errorNotFound, { exact: true }).waitFor();
    assert.equal(mutations.length, 1);
    assert.equal(mutations[0].path, '/api/claim');
    assert.equal(mutations[0].body.saleId, reference, 'UI keeps the exact opaque receipt reference after trimming only surrounding whitespace');
    assert.match(mutations[0].body.deviceId, /^[0-9a-f-]{36}$/i);
    assert.equal(await page.evaluate(() => window.activationCount), 0, 'a rejected receipt reference must not grant paid access');
    assert.deepEqual(unexpected, []);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
}
