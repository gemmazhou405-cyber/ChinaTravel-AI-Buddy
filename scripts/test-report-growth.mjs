// Network-isolated checks for the optional protected-report client.
import assert from 'node:assert/strict';
import { runReport } from './report-growth.mjs';

const secret = 'local-readonly-growth-test-secret';
const adminSecret = 'local-admin-activation-test-secret';
const endpoint = 'https://chinaeasebuddy.example/api/admin/growth-summary';
const env = { GROWTH_REPORT_URL: endpoint, GROWTH_REPORT_SECRET: secret, ADMIN_SECRET: adminSecret };
const complete = { complete: true, windows: { last7Days: { paidPlanningCtaClicks: 2 }, last30Days: { paidPlanningCtaClicks: 4 } }, revenue: null };
const assertNoSecrets = (output) => {
  for (const value of [secret, adminSecret]) assert.ok(!output.includes(value), 'output never contains either credential');
};

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

for (const configured of [
  {}, { GROWTH_REPORT_SECRET: secret }, { GROWTH_REPORT_URL: endpoint },
  { GROWTH_REPORT_URL: endpoint, ADMIN_SECRET: adminSecret },
  ...[undefined, null, '', '  ', 123, true, {}, []].map((value) => ({ ...env, GROWTH_REPORT_SECRET: value })),
]) {
  const result = await invoke({ env: configured });
  assert.equal(result.code, 1);
  assert.equal(result.requests.length, 0, 'missing configuration performs no request');
  assertNoSecrets(result.output);
}

const success = await invoke();
assert.equal(success.code, 0);
assert.deepEqual(JSON.parse(success.output), complete, 'success prints the complete aggregate JSON');
assert.equal(success.requests.length, 1);
const [url, options] = success.requests[0];
assert.equal(url, endpoint);
assert.equal(options.method, 'GET');
assert.equal(options.headers.Authorization, `Bearer ${secret}`);
assert.notEqual(options.headers.Authorization, `Bearer ${adminSecret}`, 'a configured admin key is never used by the report client');
assert.equal(options.headers.Accept, 'application/json');
assert.equal(options.redirect, 'error', 'credentials cannot be forwarded through a redirect');
assert.equal(options.cache, 'no-store');
assert.ok(options.signal instanceof AbortSignal);
assert.equal(options.signal.aborted, false);
assert.equal(options.body, undefined, 'read-only request has no body');
for (const value of [undefined, '', '   ', 123]) {
  const result = await invoke({ env: { ...env, ADMIN_SECRET: value } });
  assert.equal(result.code, 0, 'a valid report credential works independently of ADMIN_SECRET');
  assert.equal(result.requests[0][1].headers.Authorization, `Bearer ${secret}`);
}

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
  assertNoSecrets(result.output);
  assert.ok(!result.output.includes(target), 'invalid configuration is not echoed');
}

const headerInjection = await invoke({ env: { ...env, GROWTH_REPORT_SECRET: `${secret}\r\nInjected: value` } });
assert.equal(headerInjection.code, 1);
assert.equal(headerInjection.requests.length, 0);
assert.doesNotMatch(headerInjection.output, /Injected/);
assertNoSecrets(headerInjection.output);

for (const status of [301, 302, 307, 401, 403, 500, 503]) {
  let parsed = false;
  const result = await invoke({ fetcher: async () => ({
    ok: false, status,
    json: () => { parsed = true; throw new Error(`${secret} ${adminSecret}`); },
  }) });
  assert.equal(result.code, 1);
  assert.equal(parsed, false, 'error response bodies are never read or printed');
  assert.match(result.output, new RegExp(`HTTP ${status}`));
  assertNoSecrets(result.output);
}

for (const payload of [null, {}, { complete: false, windows: complete.windows, detail: `${secret} ${adminSecret}` }, { complete: true, windows: null }, { complete: true, windows: [] }]) {
  const result = await invoke({ fetcher: async () => Response.json(payload) });
  assert.equal(result.code, 1);
  assert.match(result.output, /complete aggregate summary/);
  assert.doesNotMatch(result.output, /paidPlanningCtaClicks/);
  assertNoSecrets(result.output);
}

const nonJson = await invoke({ fetcher: async () => new Response(`HTML error: ${secret} ${adminSecret}`, { status: 200 }) });
assert.equal(nonJson.code, 1);
assert.match(nonJson.output, /JSON summary/);
assertNoSecrets(nonJson.output);

for (const error of [new Error(`Authorization: Bearer ${secret}; admin ${adminSecret}`), new Error(`redirected to https://example.test/${secret}/${adminSecret}`), new DOMException(`${secret} ${adminSecret}`, 'TimeoutError')]) {
  const result = await invoke({ fetcher: async () => { throw error; } });
  assert.equal(result.code, 1);
  assert.match(result.output, /request failed or timed out/);
  assertNoSecrets(result.output);
}

console.log('Growth-report client checks passed (isolated report key, no admin fallback, configuration, URL guard, bearer auth, no redirects, read-only request, complete JSON, and safe errors).');
