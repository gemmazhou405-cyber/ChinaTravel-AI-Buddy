// Network-isolated checks for the optional protected-report client.
import assert from 'node:assert/strict';
import { runReport } from './report-growth.mjs';

const secret = 'local-growth-report-test-secret';
const endpoint = 'https://chinaeasebuddy.example/api/admin/growth-summary';
const env = { GROWTH_REPORT_URL: endpoint, ADMIN_SECRET: secret };
const complete = { complete: true, windows: { last7Days: { paidPlanningCtaClicks: 2 }, last30Days: { paidPlanningCtaClicks: 4 } }, revenue: null };

async function invoke(overrides = {}) {
  const writes = [];
  const requests = [];
  const fetcher = overrides.fetcher || (async (...args) => {
    requests.push(args);
    return Response.json(complete);
  });
  const code = await runReport({ env: overrides.env || env, fetcher, write: (value) => writes.push(value) });
  return { code, output: writes.join(''), requests };
}

for (const configured of [{}, { ADMIN_SECRET: secret }, { GROWTH_REPORT_URL: endpoint }, { ...env, ADMIN_SECRET: '  ' }]) {
  const result = await invoke({ env: configured });
  assert.equal(result.code, 1);
  assert.equal(result.requests.length, 0, 'missing configuration performs no request');
  assert.doesNotMatch(result.output, new RegExp(secret));
}

const success = await invoke();
assert.equal(success.code, 0);
assert.deepEqual(JSON.parse(success.output), complete, 'success prints the complete aggregate JSON');
assert.equal(success.requests.length, 1);
const [url, options] = success.requests[0];
assert.equal(url, endpoint);
assert.equal(options.method, 'GET');
assert.equal(options.headers.Authorization, `Bearer ${secret}`);
assert.equal(options.headers.Accept, 'application/json');
assert.equal(options.redirect, 'error', 'credentials cannot be forwarded through a redirect');
assert.equal(options.cache, 'no-store');
assert.ok(options.signal instanceof AbortSignal);
assert.equal(options.signal.aborted, false);
assert.equal(options.body, undefined, 'read-only request has no body');

for (const target of [
  'http://127.0.0.1:8788/api/admin/growth-summary',
  'http://localhost:8788/api/admin/growth-summary',
  'http://[::1]:8788/api/admin/growth-summary',
]) {
  const result = await invoke({ env: { ...env, GROWTH_REPORT_URL: target } });
  assert.equal(result.code, 0, 'loopback HTTP is available for local verification');
}

for (const target of [
  'not a URL',
  'http://chinaeasebuddy.example/api/admin/growth-summary',
  'http://localhost.example/api/admin/growth-summary',
  'ftp://localhost/api/admin/growth-summary',
  'file:///api/admin/growth-summary',
  'https://chinaeasebuddy.example/api/admin/activate',
  `${endpoint}/`,
  `${endpoint}?secret=${secret}`,
  `${endpoint}?`,
  `${endpoint}#${secret}`,
  `${endpoint}#`,
  `https://user:${secret}@chinaeasebuddy.example/api/admin/growth-summary`,
]) {
  const result = await invoke({ env: { ...env, GROWTH_REPORT_URL: target } });
  assert.equal(result.code, 1, `unsafe or incorrect URL rejected`);
  assert.equal(result.requests.length, 0, 'URL is validated before sending the secret');
  assert.doesNotMatch(result.output, new RegExp(secret));
  assert.ok(!result.output.includes(target), 'invalid configuration is not echoed');
}

const headerInjection = await invoke({ env: { ...env, ADMIN_SECRET: `${secret}\r\nInjected: value` } });
assert.equal(headerInjection.code, 1);
assert.equal(headerInjection.requests.length, 0);
assert.doesNotMatch(headerInjection.output, /Injected|local-growth-report-test-secret/);

for (const status of [301, 302, 307, 401, 403, 500, 503]) {
  let parsed = false;
  const result = await invoke({ fetcher: async () => ({
    ok: false, status,
    json: () => { parsed = true; throw new Error(secret); },
  }) });
  assert.equal(result.code, 1);
  assert.equal(parsed, false, 'error response bodies are never read or printed');
  assert.match(result.output, new RegExp(`HTTP ${status}`));
  assert.doesNotMatch(result.output, new RegExp(secret));
}

for (const payload of [null, {}, { complete: false, windows: complete.windows }, { complete: true, windows: null }, { complete: true, windows: [] }]) {
  const result = await invoke({ fetcher: async () => Response.json(payload) });
  assert.equal(result.code, 1);
  assert.match(result.output, /complete aggregate summary/);
  assert.doesNotMatch(result.output, /paidPlanningCtaClicks/);
}

const nonJson = await invoke({ fetcher: async () => new Response(`HTML error: ${secret}`, { status: 200 }) });
assert.equal(nonJson.code, 1);
assert.match(nonJson.output, /JSON summary/);
assert.doesNotMatch(nonJson.output, new RegExp(secret));

for (const error of [new Error(`Authorization: Bearer ${secret}`), new Error(`redirected to https://example.test/${secret}`), new DOMException(secret, 'TimeoutError')]) {
  const result = await invoke({ fetcher: async () => { throw error; } });
  assert.equal(result.code, 1);
  assert.match(result.output, /request failed or timed out/);
  assert.doesNotMatch(result.output, new RegExp(secret));
}

console.log('Growth-report client checks passed (configuration, URL guard, bearer auth, no redirects, read-only request, complete JSON, and safe errors).');
