// Offline browser regression: every request is fulfilled or aborted locally.
// Requires Playwright in node_modules or NODE_PATH; no running server is needed.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = fileURLToPath(new URL('..', import.meta.url));
const origin = 'https://chinaease-dashboard.test';
const initialDevices = [
  { id: 'current-local-device', boundAt: 1793000000000, lastSeenAt: 1793000000000, isCurrent: true },
  { id: 'remote-other-device', boundAt: 1793000000000, lastSeenAt: 1793000000000, isCurrent: false },
];
const bundle = await build({
  stdin: { resolveDir: root, contents: `
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import './src/i18n';
    import PassDashboard from './src/components/PassDashboard';
    function Harness() {
      const [open, setOpen] = useState(true);
      const [passState, setPassState] = useState({ tier: 'trip', expiresAt: Date.now() + 86400000, messageAllowance: 50, messagesUsed: 0, remaining: 50, deviceCount: 2, maxDevices: 2 });
      async function refresh() {
        window.refreshCount = (window.refreshCount || 0) + 1;
        setPassState(await (await fetch('/api/pass')).json());
      }
      return open ? React.createElement(PassDashboard, {
        passState, onClose: () => setOpen(false), onAddDevice: () => {}, onDevicesChanged: refresh,
      }) : React.createElement('p', { id: 'closed' }, 'Dashboard closed');
    }
    createRoot(document.getElementById('root')).render(React.createElement(Harness));
  ` },
  bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic',
  define: { 'import.meta.env.DEV': 'false', 'process.env.NODE_ENV': '"production"' },
});
const passBundle = await build({
  stdin: { resolveDir: root, contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { usePass } from './src/hooks/usePass';
    import { isTripOrGroup } from './src/lib/membership';
    function Access() {
      const { passState, refreshPassState } = usePass();
      return React.createElement(React.Fragment, null,
        React.createElement('output', { id: 'premium-access' }, isTripOrGroup(passState) ? 'unlocked' : 'locked'),
        React.createElement('button', { onClick: () => void refreshPassState() }, 'Refresh pass'));
    }
    createRoot(document.getElementById('root')).render(React.createElement(Access));
  ` },
  bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic',
  define: { 'import.meta.env.DEV': 'false', 'process.env.NODE_ENV': '"production"' },
});
const claimBundle = await build({
  stdin: { resolveDir: root, contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import './src/i18n';
    import ClaimModal from './src/components/ClaimModal';
    createRoot(document.getElementById('root')).render(React.createElement(ClaimModal, {
      onClose: () => {}, onPassActivated: async () => { window.activationCount = (window.activationCount || 0) + 1; },
    }));
  ` },
  bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic',
  define: { 'import.meta.env.DEV': 'false', 'process.env.NODE_ENV': '"production"' },
});
const browser = await chromium.launch({ headless: true });
const failures = [];
try {
  for (const scenario of ['remove-remote', 'http-failure', 'network-failure', 'remove-self']) {
    try {
      await check(scenario);
      console.log(`PASS: dashboard ${scenario}`);
    } catch (error) {
      failures.push(`${scenario}: ${error.message.split('\n')[0]}`);
      console.log(`FAIL: dashboard ${scenario}: ${error.message.split('\n')[0]}`);
    }
  }
  for (const scenario of ['focus', 'visibility', 'stale-response']) {
    try {
      await checkRevalidation(scenario);
      console.log(`PASS: pass revalidation ${scenario}`);
    } catch (error) {
      failures.push(`${scenario}: ${error.message.split('\n')[0]}`);
      console.log(`FAIL: pass revalidation ${scenario}: ${error.message.split('\n')[0]}`);
    }
  }
  for (const scenario of ['initial-401', 'initial-503', 'initial-network', 'initial-malformed', 'initial-empty']) {
    try {
      await checkInitialList(scenario);
      console.log(`PASS: dashboard ${scenario}`);
    } catch (error) {
      failures.push(`${scenario}: ${error.message.split('\n')[0]}`);
      console.log(`FAIL: dashboard ${scenario}: ${error.message.split('\n')[0]}`);
    }
  }
  for (const language of ['en', 'fr', 'de', 'es', 'ja', 'ko']) {
    try {
      await checkClaimLimit(language);
      console.log(`PASS: claim device-limit feedback ${language}`);
    } catch (error) {
      failures.push(`claim-${language}: ${error.message.split('\n')[0]}`);
      console.log(`FAIL: claim device-limit feedback ${language}: ${error.message.split('\n')[0]}`);
    }
  }
} finally {
  await browser.close();
}
assert.deepEqual(failures, [], 'device dashboard regressions must all pass');

async function checkInitialList(scenario) {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const errors = [];
  const unexpected = [];
  try {
    await context.addInitScript(() => localStorage.setItem('chinaease-lang', 'en'));
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.origin === origin) {
        if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: '<html><body><div id="root"></div><script src="/fixture.js"></script></body></html>' });
        if (url.pathname === '/fixture.js') return route.fulfill({ contentType: 'application/javascript', body: bundle.outputFiles[0].text });
        if (url.pathname === '/api/devices') {
          if (scenario === 'initial-network') return route.abort();
          if (scenario === 'initial-malformed') return route.fulfill({ json: { devices: [{}] } });
          if (scenario === 'initial-empty') return route.fulfill({ json: { devices: [] } });
          return route.fulfill({ status: scenario === 'initial-401' ? 401 : 503, json: { error: 'unavailable' } });
        }
      }
      unexpected.push(route.request().url());
      return route.abort();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(1500);
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(origin);
    if (scenario === 'initial-empty') {
      await page.getByText('0 of 2 devices', { exact: true }).waitFor();
      assert.equal(await page.getByRole('alert').count(), 0, 'a confirmed empty list is not a failed request');
      assert.equal(await page.getByRole('button', { name: 'Add this device with a recovery code', exact: true }).count(), 1);
    } else {
      await page.getByRole('alert').waitFor();
      assert.equal(await page.getByText('0 of 2 devices', { exact: true }).count(), 0, 'failed reads must not invent an empty device list');
      assert.equal(await page.getByRole('button', { name: 'Add this device with a recovery code', exact: true }).count(), 0, 'unknown capacity must not offer an extra device');
    }
    assert.deepEqual(errors, [], 'initial device requests do not cause runtime errors');
    assert.deepEqual(unexpected, [], 'initial device requests never reach a real provider');
  } finally {
    await context.close();
  }
}

async function checkClaimLimit(language) {
  const text = JSON.parse(readFileSync(new URL(`../src/i18n/locales/${language}.json`, import.meta.url), 'utf8')).translation;
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const unexpected = [];
  const claims = [];
  const errors = [];
  try {
    await context.addInitScript((lang) => localStorage.setItem('chinaease-lang', lang), language);
    await context.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === origin) {
        if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: '<html><body><div id="root"></div><script src="/fixture.js"></script></body></html>' });
        if (url.pathname === '/fixture.js') return route.fulfill({ contentType: 'application/javascript', body: claimBundle.outputFiles[0].text });
        if (url.pathname === '/api/claim') {
          claims.push(request.postDataJSON());
          return route.fulfill({ status: 403, json: { error: 'max_devices_reached', maxDevices: claims.length === 1 ? 2 : 5 } });
        }
      }
      unexpected.push(request.url());
      return route.abort();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(1500);
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(origin);
    for (const sale of ['trip-order-fixture', 'group-order-fixture']) {
      await page.getByPlaceholder(text.pass.claim.saleIdPlaceholder).fill(sale);
      await page.locator('form').getByRole('button', { name: text.pass.claim.submit, exact: true }).click();
      await page.getByText(text.pass.claim.errorMaxDevices, { exact: true }).waitFor();
    }
    assert.equal(claims.length, 2, 'both pass limits use the existing claim endpoint');
    assert.equal(await page.evaluate(() => window.activationCount || 0), 0, 'a rejected claim must not report activation');
    assert.deepEqual(errors, [], 'device-limit feedback has no runtime error');
    assert.deepEqual(unexpected, [], 'claim-limit fixtures never reach a real provider');
  } finally {
    await context.close();
  }
}

async function checkRevalidation(scenario) {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const errors = [];
  const cookies = [];
  const unexpected = [];
  const active = { tier: 'trip', expiresAt: Date.now() + 86400000, messageAllowance: 50, remaining: 50 };
  let revoked = false;
  let staleRoute;
  try {
    await context.addCookies([{ name: 'ceb_pass', value: 'old-cookie-fixture', url: origin, httpOnly: true, secure: true, sameSite: 'Lax' }]);
    await context.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === origin) {
        if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: '<html><body><div id="root"></div><script src="/fixture.js"></script></body></html>' });
        if (url.pathname === '/fixture.js') return route.fulfill({ contentType: 'application/javascript', body: passBundle.outputFiles[0].text });
        if (url.pathname === '/api/pass') {
          cookies.push(request.headers().cookie || '');
          if (scenario === 'stale-response' && cookies.length === 2) { staleRoute = route; return; }
          return route.fulfill({ json: revoked ? { tier: 'free' } : active });
        }
      }
      unexpected.push(request.url());
      return route.abort();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(1500);
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(origin);
    await page.waitForFunction(() => document.querySelector('#premium-access')?.textContent === 'unlocked');
    if (scenario === 'stale-response') {
      const started = page.waitForRequest((request) => request.url().endsWith('/api/pass'));
      await page.getByRole('button', { name: 'Refresh pass', exact: true }).click();
      await started;
      revoked = true;
      await page.getByRole('button', { name: 'Refresh pass', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('#premium-access')?.textContent === 'locked');
      const lateResponse = page.waitForResponse((response) => response.url().endsWith('/api/pass'));
      await staleRoute.fulfill({ json: active });
      staleRoute = null;
      await lateResponse;
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert.equal(await page.locator('#premium-access').textContent(), 'locked', 'a late paid response must not overwrite newer revoked state');
    } else {
      revoked = true;
      await page.evaluate((event) => {
        if (event === 'focus') window.dispatchEvent(new Event('focus'));
        else document.dispatchEvent(new Event('visibilitychange'));
      }, scenario);
      await page.waitForFunction(() => document.querySelector('#premium-access')?.textContent === 'locked');
    }
    assert.ok(cookies.length >= 2, 'foreground event revalidates the existing session');
    assert.ok(cookies.every((cookie) => cookie.includes('ceb_pass=old-cookie-fixture')), 'old cookie remains present while entitlement is revoked');
    assert.deepEqual(errors, [], 'foreground revalidation has no runtime error');
    assert.deepEqual(unexpected, [], 'entitlement checks never reach a real backend');
  } finally {
    if (staleRoute) await staleRoute.abort().catch(() => {});
    await context.close();
  }
}

async function check(scenario) {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const errors = [];
  const removals = [];
  const unexpected = [];
  let devices = initialDevices.map((device) => ({ ...device }));
  try {
    await context.addInitScript(() => localStorage.setItem('chinaease-lang', 'en'));
    await context.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === origin) {
        if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: '<html><body><div id="root"></div><script src="/fixture.js"></script></body></html>' });
        if (url.pathname === '/fixture.js') return route.fulfill({ contentType: 'application/javascript', body: bundle.outputFiles[0].text });
        if (url.pathname === '/api/devices') return route.fulfill({ json: { devices } });
        if (url.pathname === '/api/devices/remove') {
          const payload = request.postDataJSON();
          removals.push(payload);
          if (scenario === 'http-failure') return route.fulfill({ status: 503, json: { error: 'unavailable' } });
          if (scenario === 'network-failure') return route.abort();
          devices = devices.filter(({ id }) => id !== payload.deviceId);
          return route.fulfill({ json: { removed: true, loggedOut: scenario === 'remove-self' } });
        }
        if (url.pathname === '/api/pass') return route.fulfill({ json: scenario === 'remove-self' ? { tier: 'free' } : { tier: 'trip', deviceCount: devices.length, maxDevices: 2 } });
      }
      unexpected.push(request.url());
      return route.abort();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(1500);
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(origin);
    try { await page.getByRole('listitem').first().waitFor(); } catch {
      assert.deepEqual(errors, [], 'device rows must render without runtime errors');
      throw new Error('device rows did not render');
    }
    assert.equal(await page.getByRole('listitem').count(), 2, 'API id fields produce both device rows');
    await page.getByText('2 of 2 devices', { exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Add this device with a recovery code', exact: true }).count(), 0, 'a full pass does not offer an extra device');
    const targetId = scenario === 'remove-self' ? 'current-local-device' : 'remote-other-device';
    const row = page.getByRole('listitem').filter({ hasText: targetId.slice(0, 8) });
    const response = scenario === 'network-failure'
      ? page.waitForEvent('requestfailed', { predicate: (request) => request.url().endsWith('/api/devices/remove') })
      : page.waitForResponse((response) => response.url().endsWith('/api/devices/remove'));
    await row.getByRole('button', { name: 'Remove', exact: true }).click();
    await response;
    assert.deepEqual(removals, [{ deviceId: targetId }], 'remove sends the API device id');
    if (scenario === 'remove-self') {
      await page.locator('#closed').waitFor();
      await page.waitForFunction(() => window.refreshCount === 1);
      assert.equal(await page.getByRole('dialog').count(), 0, 'self-removal closes the revoked dashboard');
    } else if (scenario === 'remove-remote') {
      await page.getByText('1 of 2 devices', { exact: true }).waitFor();
      assert.equal(await page.getByRole('listitem').count(), 1);
      assert.equal(await page.getByRole('button', { name: 'Add this device with a recovery code', exact: true }).count(), 1, 'a confirmed removal opens one device slot');
      assert.equal(await page.evaluate(() => window.refreshCount), 1, 'removal refreshes the parent entitlement state');
    } else {
      await row.getByRole('button', { name: 'Remove', exact: true }).waitFor();
      assert.equal(await page.getByRole('listitem').count(), 2, 'failed removal keeps the device list');
      await page.getByText('2 of 2 devices', { exact: true }).waitFor();
      assert.equal(await page.getByRole('button', { name: 'Add this device with a recovery code', exact: true }).count(), 0, 'a failed removal does not invent a free device slot');
      assert.equal(await page.evaluate(() => window.refreshCount || 0), 0);
    }
    assert.deepEqual(errors, [], 'device management never throws a runtime error');
    assert.deepEqual(unexpected, [], 'no request can reach a real service');
  } finally {
    await context.close();
  }
}
