// Only the three paid-Buddy QA groups. AI is always local; Google may be real
// only with --run and the dedicated QA environment. Never reads credential files.
import assert from 'node:assert/strict';
import { onRequestPost as chat } from '../functions/api/buddy/chat.js';
import { configuration, isQaFirestoreUrl } from './test-pass-firestore.mjs';
import { commitWrites, createDoc, fromFirestoreDocument, getDoc } from '../functions/_shared/firestore.js';
import { sha256hex, signSessionToken } from '../functions/_shared/session.js';
import { settlePassChatMessage } from '../functions/_shared/pass-chat-quota.js';

const PROJECT = 'chinaease-qa-20261029';
const args = process.argv.slice(2);
if (args.length !== 1 || !['--run', '--self-test'].includes(args[0])) {
  console.log('NOT VERIFIED: use --self-test offline, or explicitly --run with dedicated QA configuration.');
  if (args.length) process.exitCode = 2;
} else if (args[0] === '--self-test') {
  assert.ok(isQaFirestoreUrl(new URL(`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/passes/fixture`), PROJECT));
  assert.equal(isQaFirestoreUrl(new URL('https://firestore.googleapis.com/v1/projects/chinaease-buddy/databases/(default)/documents/passes/fixture'), PROJECT), false);
  assert.equal(isQaFirestoreUrl(new URL('https://api.gumroad.com/v2/sales/fixture'), PROJECT), false);
  console.log('PASS: paid QA scope guard; no network or device tests executed.');
} else {
  let env;
  try {
    env = configuration(process.env);
    assert.equal(env.FIREBASE_PROJECT_ID, PROJECT);
    assert.equal(env.FIREBASE_CLIENT_EMAIL, `chinaease-pass-qa@${PROJECT}.iam.gserviceaccount.com`);
  } catch {
    env = null;
    console.error('NOT VERIFIED: missing or mismatched dedicated QA configuration. No network used.');
    process.exitCode = 2;
  }
  if (env && !(await run(env))) process.exitCode = 1;
}

async function run(env) {
  Object.assign(env, { COZE_WORKER_URL: 'https://buddy-qa.invalid', COZE_BOT_ID: 'qa-fixture-bot', COZE_INTERNAL_SECRET: 'qa-mock-only' });
  const root = `projects/${PROJECT}/databases/(default)/documents/`;
  const namespace = `buddy-qa-${crypto.randomUUID()}`;
  const registry = new Map();
  const owned = new Set();
  const pending = new Set();
  const originalFetch = globalThis.fetch;
  const metrics = { aiCalls: 0, casConflicts: 0, injectedAckLosses: 0, outOfScopeRequests: 0, deleted: 0, checked: 0, absent: 0, remaining: 0, unknown: 0 };
  const aiOutcomes = new Map();
  const aiCalls = new Map();
  let injected = null;
  let barrier = null;
  let stage = 'setup';
  let passed = 0;
  let failed = false;
  console.log(`Synthetic paid QA run: ${namespace}`);
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  function rejectScope() { metrics.outOfScopeRequests++; throw new Error('synthetic QA scope rejected'); }
  function registered(path) { if (!registry.has(path)) rejectScope(); return registry.get(path); }
  function namePath(name) {
    if (typeof name !== 'string' || !name.startsWith(root)) rejectScope();
    const path = name.slice(root.length); registered(path); return path;
  }
  function verifyDocument(document) {
    if (!document?.name) rejectScope();
    const path = namePath(document.name);
    const expected = registered(path);
    const data = fromFirestoreDocument(document);
    if (expected.kind === 'pass') assert.equal(data?.qaRun, namespace, 'only this run owns the Pass');
    else {
      assert.ok(owned.has(expected.parent), 'request parent must be confirmed owned');
      assert.equal(data?.inputHash, expected.inputHash, 'only this run owns the request');
    }
    owned.add(path);
  }
  function overlapReservations() {
    let release;
    barrier = { left: 2, promise: new Promise((resolve) => { release = resolve; }), release: () => release() };
  }
  async function waitForCompetitor() {
    if (!barrier) return;
    const current = barrier;
    if (--current.left === 0) { barrier = null; current.release(); }
    let timer;
    try { await Promise.race([current.promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('QA barrier timeout')), 5000); })]); }
    finally { clearTimeout(timer); }
  }
  async function intercept(input, init = {}) {
    const url = new URL(String(input));
    if (url.origin === env.COZE_WORKER_URL && url.pathname === '/coze' && init.method === 'POST') {
      const tag = JSON.parse(init.body).message;
      if (!aiOutcomes.has(tag)) rejectScope();
      metrics.aiCalls++; aiCalls.set(tag, (aiCalls.get(tag) || 0) + 1);
      const outcome = aiOutcomes.get(tag);
      if (outcome === 'unknown') throw new DOMException('injected AI transport timeout', 'TimeoutError');
      if (outcome === 'failed') return json({ error: 'upstream_error' }, 502);
      return json({ reply: 'Synthetic QA answer.' });
    }
    if (url.href === 'https://oauth2.googleapis.com/token' && init.method === 'POST') return originalFetch(input, { ...init, redirect: 'error' });
    if (!isQaFirestoreUrl(url, PROJECT)) rejectScope();
    const path = decodeURIComponent(url.pathname.split('/documents')[1] || '').replace(/^\//, '');
    const method = init.method || 'GET';
    const body = init.body ? JSON.parse(init.body) : {};
    if (method === 'GET') registered(path);
    else if (method === 'POST' && path === 'passes') {
      const target = registered(`passes/${url.searchParams.get('documentId')}`);
      if (target.kind !== 'pass' || body.fields?.qaRun?.stringValue !== namespace) rejectScope();
    } else if (method === 'POST' && path === ':commit') {
      if (!body.writes?.length) rejectScope();
      for (const write of body.writes) {
        const targetPath = namePath(write.update?.name || write.delete);
        const expected = registered(targetPath);
        if (write.delete && !owned.has(targetPath)) rejectScope();
        if (expected.kind === 'request' && !owned.has(expected.parent)) rejectScope();
        if (expected.kind === 'pass' && !owned.has(targetPath)) rejectScope();
      }
      if (body.writes.some((write) => write.update?.fields?.status?.stringValue === 'reserved')) await waitForCompetitor();
    } else rejectScope(); // No scans, queries, other collections or projects.
    const response = await originalFetch(input, { ...init, redirect: 'error' });
    if (response.ok && (method === 'GET' || path === 'passes')) verifyDocument(await response.clone().json());
    if (path === ':commit' && !response.ok) {
      let code = '';
      try { code = (await response.clone().json())?.error?.status || ''; } catch {}
      if ([409, 412].includes(response.status) || ['ABORTED', 'FAILED_PRECONDITION'].includes(code)) metrics.casConflicts++;
    }
    if (path === ':commit' && response.ok) {
      metrics.deleted += body.writes.filter((write) => write.delete).length;
      if (injected && body.writes.some((write) => write.update?.name === root + injected.path && write.update?.fields?.status?.stringValue === injected.status)) {
        injected = null; metrics.injectedAckLosses++;
        throw new TypeError('injected lost acknowledgement after real successful commit');
      }
    }
    return response;
  }
  globalThis.fetch = async (...arguments_) => {
    const operation = intercept(...arguments_); pending.add(operation);
    try { return await operation; } finally { pending.delete(operation); }
  };
  async function drain() {
    for (let attempt = 0; attempt < 20; attempt++) {
      await Promise.allSettled([...pending]);
      await new Promise((resolve) => setImmediate(resolve));
      if (!pending.size) {
        await new Promise((resolve) => setImmediate(resolve));
        if (!pending.size) return;
      }
    }
    throw new Error('QA operations did not settle');
  }
  async function fixture(label, used = 0) {
    const id = `${namespace}-${label}`, path = `passes/${id}`;
    registry.set(path, { kind: 'pass' });
    await createDoc(env, 'passes', id, {
      qaRun: namespace, source: 'qa-synthetic', tier: 'trip', expiresAt: Date.now() + 86_400_000,
      messageAllowance: 50, messagesUsed: used,
      devices: [{ id: 'qa-buddy-device', boundAt: Date.now(), lastSeenAt: Date.now() }],
    });
    return { id, path, cookie: `ceb_pass=${await signSessionToken(env.SESSION_SECRET, id, 'qa-buddy-device')}` };
  }
  async function request(pass, tag, outcome = 'success') {
    const id = crypto.randomUUID(), path = `${pass.path}/buddyRequests/${id}`;
    const inputHash = await sha256hex(JSON.stringify({ message: tag, stream: false }));
    registry.set(path, { kind: 'request', parent: pass.path, inputHash }); aiOutcomes.set(tag, outcome);
    return { id, path, tag, inputHash };
  }
  async function invoke(pass, req) {
    const response = await chat({ env, request: new Request('https://buddy-qa.invalid/api/buddy/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: pass.cookie },
      body: JSON.stringify({ requestId: req.id, message: req.tag, context: [], stream: false }),
    }) });
    return { status: response.status, body: await response.json() };
  }
  async function record(req, status) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const value = await getDoc(env, req.path);
      if (value?.status === status) return value;
      await drain();
    }
    throw new Error('ledger did not reach expected state');
  }
  try {
    stage = 'last message competition';
    const last = await fixture('last', 49);
    const contenders = await Promise.all([0, 1, 2].map((index) => request(last, `QA last ${index}`)));
    overlapReservations();
    const results = await Promise.all(contenders.map((req) => invoke(last, req)));
    assert.equal(results.filter(({ status }) => status === 200).length, 1);
    assert.ok(results.filter(({ status }) => status !== 200).every(({ body }) => body.error === 'quota_exhausted'));
    assert.equal(contenders.reduce((sum, req) => sum + (aiCalls.get(req.tag) || 0), 0), 1);
    assert.equal((await getDoc(env, last.path)).messagesUsed, 50);
    await record(contenders[results.findIndex(({ status }) => status === 200)], 'consumed');
    assert.ok(metrics.casConflicts > 0, 'real CAS competition must be observed');
    passed++; console.log('PASS [QA_FIRESTORE]: last message, three concurrent requests, one mocked AI call.');

    stage = 'same request retry and lost commit acknowledgement';
    const repeated = await fixture('retry');
    const same = await request(repeated, 'QA same request');
    injected = { path: same.path, status: 'reserved' }; overlapReservations();
    const duplicates = await Promise.all([invoke(repeated, same), invoke(repeated, same)]);
    assert.equal(duplicates.filter(({ status }) => status === 200).length, 1);
    assert.equal(duplicates.filter(({ status }) => status === 409).length, 1);
    await record(same, 'consumed');
    assert.equal((await invoke(repeated, same)).status, 409);
    assert.equal(aiCalls.get(same.tag), 1);
    assert.equal((await getDoc(env, repeated.path)).messagesUsed, 1);
    assert.equal(metrics.injectedAckLosses, 1);
    passed++; console.log('PASS [QA_FIRESTORE + INJECTED_ACK]: real commit, simulated lost acknowledgement, same-ID replay does not charge/call twice.');

    stage = 'interleaved success, definite failure and unknown result';
    const mixed = await fixture('mixed');
    const success = await request(mixed, 'QA interleaved success');
    const failure = await request(mixed, 'QA interleaved failure', 'failed');
    const unknown = await request(mixed, 'QA interleaved unknown', 'unknown');
    injected = { path: failure.path, status: 'released' }; overlapReservations();
    const outcomes = await Promise.all([invoke(mixed, success), invoke(mixed, failure), invoke(mixed, unknown)]);
    assert.deepEqual(outcomes.map(({ status }) => status), [200, 502, 504]);
    await record(success, 'consumed'); const released = await record(failure, 'released'); await record(unknown, 'reserved');
    const reservation = { ok: true, path: failure.path, passId: mixed.id, owner: released.owner, inputHash: released.inputHash };
    await Promise.all([settlePassChatMessage(env, reservation, 'released'), settlePassChatMessage(env, reservation, 'released')]);
    assert.equal((await invoke(mixed, unknown)).status, 409);
    assert.equal([success, failure, unknown].reduce((sum, req) => sum + (aiCalls.get(req.tag) || 0), 0), 3);
    assert.equal((await getDoc(env, mixed.path)).messagesUsed, 2);
    assert.equal(metrics.injectedAckLosses, 2);
    passed++; console.log('PASS [QA_FIRESTORE + MOCK_AI/INJECTED_ACK]: success consumed, definite failure released once, unknown held without replay.');
  } catch {
    failed = true; console.error(`FAIL: paid QA stage ${stage}. No credentials or response bodies printed.`);
  } finally {
    injected = null; barrier?.release(); barrier = null;
    try { await drain(); } catch { failed = true; }
    // Read only registered paths to confirm ownership, including unacknowledged
    // writes. Explicitly delete every owned request child, then its parent.
    for (const path of registry.keys()) {
      try { await getDoc(env, path); } catch { failed = true; }
    }
    const childrenFirst = [...owned].sort((a, b) => b.split('/').length - a.split('/').length);
    try { if (childrenFirst.length) await commitWrites(env, childrenFirst.map((path) => ({ delete: root + path }))); }
    catch { failed = true; }
    for (const path of registry.keys()) {
      metrics.checked++;
      try {
        if (await getDoc(env, path)) metrics.remaining++;
        else metrics.absent++;
      } catch { metrics.unknown++; }
    }
    await drain().catch(() => { failed = true; });
    globalThis.fetch = originalFetch;
  }
  const ok = !failed && passed === 3 && !metrics.remaining && !metrics.unknown && !metrics.outOfScopeRequests;
  console.log('PAID_QA_RESULT ' + JSON.stringify({ ok, groupsPassed: passed, ...metrics, scope: 'registered synthetic parents and request children only' }));
  if (!ok) console.error(`NOT VERIFIED: inspect only synthetic run ${namespace} in the QA project.`);
  return ok;
}
