// Run against a local Vite dev/preview server. Requires Playwright in node_modules or NODE_PATH.
// Example: CHINAEASE_TEST_URL=http://127.0.0.1:4173 node scripts/test-premium-upgrade.mjs
// All APIs and external purchase pages are mocked; no production requests or purchases occur.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

const { chromium } = createRequire(import.meta.url)('playwright');
const base = new URL(process.env.CHINAEASE_TEST_URL || 'http://127.0.0.1:4173');
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(base.hostname), 'only test a local server');
const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const english = readJson('../src/i18n/locales/en.json').translation;
const restaurantCards = readJson('../docs/launch/phrase-cards.json').categories.find(({ id }) => id === 'restaurant').cards;
const config = loadEnv(process.env.CHINAEASE_TEST_MODE || 'production', fileURLToPath(new URL('..', import.meta.url)), 'VITE_GUMROAD_');
const checkoutUrls = {
  trip: config.VITE_GUMROAD_TRIP_URL || 'https://chinaease.gumroad.com/l/trip-pass',
  group: config.VITE_GUMROAD_GROUP_URL || 'https://chinaease.gumroad.com/l/group-pass',
};
assert.notEqual(checkoutUrls.trip, checkoutUrls.group, 'passes retain separate product destinations');
const browser = await chromium.launch({ headless: true });
const errors = [];
const tierState = (tier) => ({
  tier, expired: false, expiresAt: Date.now() + 86400000,
  messagesUsed: tier === 'trip' ? 50 : 200,
  messageAllowance: tier === 'trip' ? 50 : 200, remaining: 0,
  maxDevices: tier === 'trip' ? 2 : 5, deviceCount: 1,
});

async function session(initialState = { tier: 'free' }, language = 'en', viewport) {
  const context = await browser.newContext({ viewport: viewport || { width: 1440, height: 1000 } });
  let passState = initialState;
  const requests = [];
  await context.addInitScript((lang) => localStorage.setItem('chinaease-lang', lang), language);
  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== base.origin) {
      if (url.hostname.endsWith('.gumroad.com')) return route.fulfill({ contentType: 'text/html', body: '<p>Local checkout placeholder</p>' });
      return route.abort();
    }
    if (url.pathname === '/api/pass') return route.fulfill({ json: passState });
    if (['/api/claim', '/api/recover'].includes(url.pathname)) {
      requests.push({ path: url.pathname, body: request.postDataJSON() });
      passState = tierState(url.pathname === '/api/claim' ? 'trip' : 'group');
      return route.fulfill({ json: { ...passState, recoveryCode: 'ABCD-EFGH-JKLM' } });
    }
    if (url.pathname.startsWith('/api/')) return route.fulfill({ json: { ok: true } });
    return route.continue();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.on('pageerror', (error) => errors.push(error.message));
  return { context, page, requests };
}

async function food(page, text = english, fromHomepage = false) {
  await page.goto(base.href);
  if (fromHomepage) await page.getByRole('button', { name: text.home.nav.toolkit, exact: true }).click();
  await page.locator('#toolkit').getByRole('button', { name: new RegExp(text.home.toolkit.col2.i1.title) }).click();
  const category = page.locator('#phrase-category-restaurant');
  await category.locator(':scope > button').click();
  await category.getByRole('button', { name: text.common.showCard, exact: true }).first().waitFor();
  return category;
}

async function assertUnlocked(category, text = english) {
  assert.equal(await category.getByRole('button', { name: new RegExp(text.common.upgradeToUnlock) }).count(), 0);
  const cards = category.getByRole('button', { name: text.common.showCard, exact: true });
  assert.equal(await cards.count(), restaurantCards.length, 'paid pass reveals every restaurant card');
  assert.ok(await cards.evaluateAll((buttons) => buttons.every((button) => !button.disabled)));
}

try {
  const free = await session();
  let category = await food(free.page, english, true);
  const showCards = category.getByRole('button', { name: english.common.showCard, exact: true });
  assert.equal(await showCards.count(), 6);
  assert.equal(await showCards.evaluateAll((buttons) => buttons.filter((button) => !button.disabled).length), 3, 'three free cards remain usable');
  await showCards.first().click();
  await free.page.getByRole('spinbutton').fill('2');
  await free.page.getByRole('button', { name: `${english.common.showCard} →`, exact: true }).click();
  const fullscreen = free.page.locator('div.fixed').filter({ has: free.page.getByText(restaurantCards[0].en, { exact: true }) });
  await fullscreen.waitFor();
  await fullscreen.getByText(restaurantCards[0].zh.replace('___', '2'), { exact: true }).waitFor();
  await fullscreen.getByRole('button').first().click();
  await category.getByRole('button', { name: new RegExp(english.common.upgradeToUnlock) }).first().click();
  const plans = free.page.locator('#plans');
  await plans.getByRole('button', { name: 'Get Trip Pass', exact: true }).waitFor();
  await free.page.getByText(english.pay.upgradePrompt, { exact: true }).waitFor();
  assert.match(await plans.innerText(), /\$9\.90/);
  assert.match(await plans.innerText(), /\$29\.90/);
  for (const tier of ['trip', 'group']) {
    const popupPromise = free.page.waitForEvent('popup');
    await plans.getByRole('button', { name: english.pay.plans[tier].cta, exact: true }).click();
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    assert.equal(popup.url(), new URL(checkoutUrls[tier]).href, `${tier}: the correct existing product URL opens`);
    assert.match(new URL(popup.url()).hostname, /(^|\.)gumroad\.com$/, `${tier}: existing Gumroad purchase path opens`);
    assert.notEqual(new URL(popup.url()).pathname, '/');
    await popup.close();
  }
  console.log('PASS: homepage → Toolkit → Food → Restaurant Phrases → upgrade; free display; both Gumroad purchase paths.');
  await free.context.close();

  for (const tier of ['trip', 'group']) {
    const paid = await session(tierState(tier));
    category = await food(paid.page);
    await assertUnlocked(category);
    await paid.page.locator('#tabs').getByRole('button', { name: new RegExp(english.tabs.stay) }).filter({ visible: true }).click();
    // Select by the existing disclosure title, since its section has no stable ID.
    await paid.page.getByRole('button', { name: new RegExp(english.stay.customHelper.title) }).click();
    await paid.page.getByPlaceholder(english.stay.customHelper.placeholder).fill('Can I check out later?');
    await paid.page.getByRole('button', { name: english.stay.customHelper.generate, exact: true }).click();
    await paid.page.getByText('请问我最晚几点退房？', { exact: true }).waitFor();
    assert.equal(await paid.page.locator('#plans').count(), 0, `${tier}: helper does not send an active pass to upgrade`);
    console.log(`PASS: ${tier} with zero Buddy messages unlocks all restaurant cards and Custom Phrase Helper.`);
    await paid.context.close();
  }

  for (const [operation, tier] of [['claim', 'trip'], ['recover', 'group']]) {
    const activated = await session();
    category = await food(activated.page);
    await activated.page.getByRole('button', { name: english.nav.getPass, exact: true }).click();
    const dialog = activated.page.getByRole('dialog');
    if (operation === 'recover') await dialog.getByRole('button', { name: english.pass.recover.title, exact: true }).click();
    await dialog.getByPlaceholder(english.pass[operation][operation === 'claim' ? 'saleIdPlaceholder' : 'codePlaceholder']).fill(operation === 'claim' ? 'local-sale' : 'ABCD-EFGH-JKLM');
    await dialog.locator('form').getByRole('button', { name: english.pass[operation].submit, exact: true }).click();
    await dialog.getByRole('heading', { name: english.pass[operation].successTitle, exact: true }).waitFor();
    await activated.page.locator('header').getByRole('button', { name: new RegExp(english.pay.plans[tier].name) }).waitFor();
    await dialog.getByRole('button', { name: 'Close', exact: true }).click();
    await assertUnlocked(category);
    assert.equal(activated.requests[0].path, `/api/${operation}`);
    assert.match(activated.requests[0].body.deviceId, /^[0-9a-f-]{36}$/i);
    console.log(`PASS: ${operation} refreshes pass state and unlocks premium cards without reload.`);
    await activated.context.close();
  }

  for (const state of [{ tier: 'free' }, { tier: 'trip', expired: true }, tierState('trip'), tierState('group')]) {
    const regression = await session(state);
    await food(regression.page);
    for (const tab of ['before', 'stay', 'food', 'transport', 'emergency', 'pay']) {
      await regression.page.locator('#tabs').getByRole('button', { name: new RegExp(english.tabs[tab]) }).filter({ visible: true }).click();
      await regression.page.locator('main').getByRole('heading', { name: english.tabs[tab], exact: true }).waitFor();
      const categories = regression.page.locator('main [id^="phrase-category-"]');
      if (await categories.count()) {
        await categories.first().locator(':scope > button').click();
        const locked = categories.first().getByRole('button', { name: new RegExp(english.common.upgradeToUnlock) });
        assert.equal(await locked.count() > 0, state.tier === 'free' || Boolean(state.expired), `${state.tier}/${state.expired || false}: ${tab} gates`);
        if (await locked.count()) {
          await locked.first().click();
          await regression.page.locator('#plans').getByRole('button', { name: 'Get Trip Pass', exact: true }).waitFor();
        }
      }
    }
    console.log(`PASS: all six toolkit tabs in ${state.tier}${state.expired ? ' expired' : ''} state.`);
    await regression.context.close();
  }

  for (const language of ['de', 'es', 'fr', 'ja', 'ko']) {
    const text = readJson(`../src/i18n/locales/${language}.json`).translation;
    const localized = await session({ tier: 'free' }, language);
    category = await food(localized.page, text);
    await category.getByRole('button', { name: new RegExp(text.common.upgradeToUnlock) }).first().click();
    await localized.page.locator('#plans').getByRole('button', { name: text.pay.plans.trip.cta, exact: true }).waitFor();
    await localized.context.close();
  }
  const mobile = await session({ tier: 'free' }, 'en', { width: 390, height: 844 });
  category = await food(mobile.page);
  await category.getByRole('button', { name: new RegExp(english.common.upgradeToUnlock) }).first().click();
  await mobile.page.locator('#plans').getByRole('button', { name: 'Get Group Pass', exact: true }).waitFor();
  await mobile.context.close();
  console.log('PASS: upgrade in all six languages and mobile viewport.');
  assert.deepEqual(errors, [], 'no uncaught React/browser errors in any tested state');
} finally {
  await browser.close();
}
