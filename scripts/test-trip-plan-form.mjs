// Requires Playwright in node_modules or NODE_PATH. No server is needed: every
// browser request is fulfilled or aborted locally, including lead submissions.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { buildGrowthSummary } from '../functions/_shared/growth-summary.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = fileURLToPath(new URL('..', import.meta.url));
const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const planning = await readJson('../src/data/planningHelp.json');
const fixtureOrigin = 'https://chinaease-form.test';
const email = 'form-regression@example.test';
const bundle = await build({
  stdin: { resolveDir: root, contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import './src/i18n';
    import TripPlanForm from './src/components/home/TripPlanForm';
    import { initAttribution } from './src/lib/analytics';
    initAttribution();
    createRoot(document.getElementById('root')).render(React.createElement(TripPlanForm, { embedded: true }));
  ` },
  bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic',
  define: { 'import.meta.env.DEV': 'false', 'process.env.NODE_ENV': '"production"' },
});
const browser = await chromium.launch({ headless: true });
const allEvents = [];
try {
  for (const language of ['en', 'fr', 'de', 'es', 'ja', 'ko']) {
    await scenario(language, false);
  }
  await scenario('en', true);
  const summary = buildGrowthSummary({ analyticsEvents: allEvents, tripLeads: [], gumroadSales: [] }, Date.now());
  assert.equal(summary.windows.last7Days.analytics.paidPlanningCtaClicks, 6, 'each localized paid-planning click enters Growth Summary once');
  assert.deepEqual(summary.windows.last7Days.analytics.gumroadClicks, { trip: 0, group: 0 }, 'planning inquiries do not count as Pass purchases/clicks');
} finally {
  await browser.close();
}

async function scenario(language, deliveryFailure) {
  const text = (await readJson(`../src/i18n/locales/${language}.json`)).translation;
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const events = [];
  const submissions = [];
  const unexpected = [];
  const errors = [];
  try {
    await context.addInitScript((lang) => {
      localStorage.setItem('chinaease-lang', lang);
      window.ga4Calls = [];
      window.gtag = (...args) => window.ga4Calls.push(args);
    }, language);
    await context.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === fixtureOrigin) {
        if (url.pathname === '/plan/') return route.fulfill({ contentType: 'text/html', body: `<html lang="${language}"><body><div id="root"></div><script src="/fixture.js"></script></body></html>` });
        if (url.pathname === '/fixture.js') return route.fulfill({ contentType: 'application/javascript', body: bundle.outputFiles[0].text });
        if (url.pathname === '/api/events') {
          events.push({ ...request.postDataJSON(), createdAt: Date.now() });
          return route.fulfill({ json: { ok: true } });
        }
        if (url.pathname === '/api/leads/trip') {
          submissions.push(request.postDataJSON());
          return route.fulfill(deliveryFailure
            ? { status: 503, json: { error: 'email_delivery_failed' } }
            : { json: { status: 'received', planGenerated: true, planPreview: { title: 'Local test itinerary', days: [{ day: 'Day 1', city: 'Beijing', morning: 'Local test preview', afternoon: '', evening: '' }] } } });
        }
      }
      unexpected.push(request.url());
      return route.abort();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${fixtureOrigin}/plan/`);
    const cta = page.getByRole('link', { name: text.lead.tripPlanCta, exact: true });
    assert.equal(await cta.count(), 0, 'paid follow-up is absent before success');
    await page.locator('#trip-plan-city-beijing').click();
    await page.getByRole('button', { name: text.lead.progressive.selectDates, exact: true }).click();
    await page.locator('input[type="date"]').nth(0).fill('2099-10-27');
    await page.locator('input[type="date"]').nth(1).fill('2099-10-30');
    await page.getByRole('button', { name: text.lead.progressive.continuePreview, exact: true }).click();
    await page.getByRole('button', { name: text.lead.progressive.continue, exact: true }).click();
    await page.locator('#itinerary-email').fill(email);
    await page.getByRole('button', { name: text.lead.progressive.submit, exact: true }).click();
    if (deliveryFailure) {
      await page.getByRole('alert').filter({ hasText: text.lead.progressive.emailDeliveryFailed }).waitFor();
      assert.equal(await cta.count(), 0, 'failed delivery does not show a success CTA');
      assert.equal(events.filter(({ event }) => event === 'free_trip_starter_submit').length, 0);
    } else {
      await cta.waitFor();
      assert.equal(await cta.getAttribute('href'), planning.paidHref, `${language}: shared paid inquiry address`);
      assert.equal(await cta.getAttribute('target'), null, 'email inquiry does not open a blank tab');
      assert.doesNotMatch(await page.locator('#trip-plan-form').innerText(), /\$39|39\s*\$|39ドル|39달러|48\s*(?:hours|heures|Stunden|horas|時間|시간)/i);
      assert.equal(await page.locator('a[href*="aajhsx"], a[href*="gumroad"]').count(), 0);
      await page.getByText('Local test preview', { exact: true }).waitFor();
      await page.evaluate(() => document.addEventListener('click', (event) => event.preventDefault()));
      const response = page.waitForResponse((res) => res.url().endsWith('/api/events') && res.request().postDataJSON().event === 'cta_clicked');
      await cta.click();
      await response;
      const clicks = events.filter(({ event }) => event === 'cta_clicked');
      assert.equal(clicks.length, 1, 'a single click records one existing planning CTA event');
      assert.equal(clicks[0].ctaName, 'planning_paid_planning_click');
      assert.equal(clicks[0].destination, 'paid-planning');
      assert.equal(clicks[0].tool, 'planning_help_plan_success');
      assert.doesNotMatch(JSON.stringify(clicks), /form-regression|mailto:|passport|Travel%20dates/i, 'traveler details and mailto body stay out of analytics');
      const ga4 = await page.evaluate(() => window.ga4Calls.filter((args) => args[1] === 'trip_plan_cta_click'));
      assert.deepEqual(ga4, [['event', 'trip_plan_cta_click', { location: 'plan_success' }]], 'existing GA4 identity and location remain unchanged');
    }
    assert.equal(submissions.length, 1, 'one mocked lead request per scenario');
    assert.equal(submissions[0].email, email);
    assert.deepEqual(unexpected, [], 'no unmocked or external requests are allowed');
    assert.deepEqual(errors, [], 'the real form renders without browser errors');
    allEvents.push(...events);
  } finally {
    await context.close();
  }
}

console.log('Trip Plan form checks passed: six languages, shared paid inquiry, preserved GA4, one Growth Summary CTA per click, and failed-delivery state.');
