// Paid Buddy regressions against the real handler. Every Google/AI request is
// served in memory; no credentials, customers or network services are used.
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { onRequestPost } from '../functions/api/buddy/chat.js';
import { fromFirestoreDocument, toFirestoreDocument } from '../functions/_shared/firestore.js';
import { sha256hex, signSessionToken } from '../functions/_shared/session.js';

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});
const env = {
  FIREBASE_PROJECT_ID: 'paid-quota-offline-fixture',
  FIREBASE_CLIENT_EMAIL: 'runner@paid-quota-offline-fixture.iam.gserviceaccount.com',
  FIREBASE_PRIVATE_KEY: privateKey, SESSION_SECRET: 'local-paid-quota-session',
  COZE_WORKER_URL: 'https://paid-worker.fixture.test', COZE_BOT_ID: 'fixture-bot-1234',
  COZE_INTERNAL_SECRET: 'local-fixture-only',
};
const root = `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/`;
const passId = 'paid-pass-fixture';
const passPath = `passes/${passId}`;
const deviceId = 'paid-device-fixture';
const docs = new Map();
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const read = (path) => fromFirestoreDocument(docs.get(path));
let revision = 0, nextId = 0, ip = 0, aiCalls = 0;
let firestoreDown = false, failAllCommits = false, ledgerReadDown = false;
let aiMode = 'ok', aiOverride = null, passReadGate = null, fault = null;
const unexpected = [];
function write(path, value) {
  docs.set(path, { name: `${root}${path}`, ...toFirestoreDocument(value), updateTime: new Date(1_700_000_000_000 + ++revision).toISOString() });
}
function seed(used = 0, allowance = 50) {
  docs.clear(); unexpected.length = 0; aiCalls = 0;
  firestoreDown = false; failAllCommits = false; ledgerReadDown = false;
  aiMode = 'ok'; aiOverride = null; passReadGate = null; fault = null;
  write(passPath, {
    tier: 'trip', gumroadSaleId: 'paid-fixture-order', createdAt: Date.now(), expiresAt: Date.now() + 86_400_000,
    messageAllowance: allowance, messagesUsed: used,
    devices: [{ id: deviceId, boundAt: Date.now(), lastSeenAt: Date.now() }],
  });
}
function overlapReads(count = 2) {
  let release;
  passReadGate = { remaining: count, promise: new Promise((resolve) => { release = resolve; }), release: () => release() };
}
const rid = () => `00000000-0000-4000-8000-${String(++nextId).padStart(12, '0')}`;
const recordPath = (id) => `${passPath}/buddyRequests/${id.toLowerCase()}`;
function phaseOf(writes) {
  const entry = writes.find((item) => item.update?.name.includes('/buddyRequests/'));
  return entry ? fromFirestoreDocument(entry.update)?.status : 'legacy';
}
function stream(partial) {
  const encoder = new TextEncoder();
  return new Response(new ReadableStream({
    start(controller) {
      if (!partial) { controller.error(new Error('synthetic stream failure before content')); return; }
      controller.enqueue(encoder.encode('data: {"delta":"Fixture content"}\n\n'));
      setTimeout(() => controller.error(new Error('synthetic stream failure after content')), 0);
    },
  }), { headers: { 'Content-Type': 'text/event-stream' } });
}
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init = {}) => {
  const url = new URL(String(input));
  if (url.hostname === 'oauth2.googleapis.com') return json({ access_token: 'offline-oauth-fixture', expires_in: 3600 });
  if (url.hostname === 'paid-worker.fixture.test') {
    aiCalls++;
    const body = JSON.parse(init.body);
    if (aiOverride) return aiOverride(body);
    if (aiMode === 'fail') return json({ error: 'upstream_error' }, 502);
    if (aiMode === 'timeout') throw new DOMException('synthetic worker timeout', 'TimeoutError');
    if (aiMode === 'stream-http-failure') return json({ error: 'upstream_error' }, 502);
    if (aiMode === 'worker-timeout') return json({ error: 'upstream_timeout' }, 504);
    if (aiMode === 'stream-empty-failure') return new Response('data: {"error":"stream_error"}\n\n', { headers: { 'Content-Type': 'text/event-stream' } });
    if (aiMode === 'stream-empty-done') return new Response('data: {"done":true}\n\n', { headers: { 'Content-Type': 'text/event-stream' } });
    if (aiMode === 'stream-empty-done-late-content') return new Response('data: {"done":true}\n\ndata: {"delta":"Late fixture content"}\n\n', { headers: { 'Content-Type': 'text/event-stream' } });
    if (aiMode === 'stream-raw-empty-failure') return stream(false);
    if (aiMode === 'stream-partial-failure') return stream(true);
    if (body.stream) return new Response('data: {"delta":"Fixture reply"}\n\ndata: {"done":true}\n\n', { headers: { 'Content-Type': 'text/event-stream' } });
    return json({ reply: 'Fixture paid reply.' });
  }
  if (url.hostname !== 'firestore.googleapis.com') {
    unexpected.push(`${init.method || 'GET'} ${url.origin}${url.pathname}`);
    throw new Error('unexpected request outside offline fixtures');
  }
  if (firestoreDown) return json({ error: { status: 'UNAVAILABLE' } }, 503);
  const method = init.method || 'GET';
  const body = init.body ? JSON.parse(init.body) : {};
  const path = decodeURIComponent(url.pathname.split('/documents')[1] || '').replace(/^\//, '');
  if (path === ':commit') {
    if (failAllCommits) return json({ error: { status: 'UNAVAILABLE' } }, 503);
    const phase = phaseOf(body.writes || []);
    const matches = fault && fault.phase === phase && fault.remaining > 0;
    if (matches) fault.remaining--;
    if (matches && fault.kind === 'before-commit') return json({ error: { status: 'UNAVAILABLE' } }, 503);
    for (const entry of body.writes || []) {
      const key = (entry.update?.name || entry.delete).slice(root.length);
      const current = docs.get(key);
      const condition = entry.currentDocument;
      if (condition?.exists === false && current) return json({ error: { status: 'ALREADY_EXISTS' } }, 409);
      if (condition?.exists === true && !current) return json({ error: { status: 'NOT_FOUND' } }, 404);
      if (condition?.updateTime && current?.updateTime !== condition.updateTime) return json({ error: { status: 'FAILED_PRECONDITION' } }, 412);
    }
    for (const entry of body.writes || []) {
      const key = (entry.update?.name || entry.delete).slice(root.length);
      if (entry.delete) docs.delete(key);
      else write(key, entry.updateMask ? { ...read(key), ...fromFirestoreDocument(entry.update) } : fromFirestoreDocument(entry.update));
    }
    if (matches && ['after-commit', 'after-commit-unreadable'].includes(fault.kind)) {
      if (fault.kind === 'after-commit-unreadable') ledgerReadDown = true;
      throw new TypeError('synthetic lost commit acknowledgement');
    }
    return json({ writeResults: (body.writes || []).map(() => ({ updateTime: new Date(1_700_000_000_000 + revision).toISOString() })) });
  }
  if (method === 'GET') {
    if (ledgerReadDown && path.includes('/buddyRequests/')) return json({ error: { status: 'UNAVAILABLE' } }, 503);
    const snapshot = docs.has(path) ? structuredClone(docs.get(path)) : null;
    if (path === passPath && passReadGate) {
      const gate = passReadGate;
      if (--gate.remaining === 0) { passReadGate = null; gate.release(); }
      await gate.promise;
    }
    return snapshot ? json(snapshot) : json({}, 404);
  }
  if (method === 'PATCH') {
    write(path, { ...read(path), ...fromFirestoreDocument(body) });
    return json(structuredClone(docs.get(path)));
  }
  throw new Error(`unsupported offline Firestore method ${method}`);
};

async function chat(id = rid(), { message = 'Fixture question', context = [], streaming = false } = {}) {
  const cookie = `ceb_pass=${await signSessionToken(env.SESSION_SECRET, passId, deviceId)}`;
  const response = await onRequestPost({ request: new Request('https://chinaeasebuddy.com/api/buddy/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie, 'CF-Connecting-IP': `192.0.2.${++ip}` },
    body: JSON.stringify({ requestId: id, message, context, stream: streaming }),
  }), env });
  let text = '', bodyReadFailed = false;
  try { text = await response.text(); } catch { bodyReadFailed = true; }
  return { status: response.status, body: text.startsWith('{') ? JSON.parse(text) : text, bodyReadFailed };
}
const results = [];
async function test(name, run) {
  seed();
  try { await run(); assert.deepEqual(unexpected, []); results.push({ name, ok: true }); }
  catch (error) {
    const numbers = typeof error.actual === 'number' && typeof error.expected === 'number'
      ? ` (actual ${error.actual}, expected ${error.expected})` : '';
    results.push({ name, ok: false, reason: String(error.message).split('\n')[0] + numbers });
  }
}
try {
  await test('last message: two concurrent requests permit only one AI call', async () => {
    seed(49); overlapReads();
    const responses = await Promise.all([chat(), chat()]);
    assert.equal(responses.filter(({ status }) => status === 200).length, 1);
    assert.equal(aiCalls, 1);
    assert.equal(read(passPath).messagesUsed, 50);
  });
  await test('parallel success/failure releases only the failed request quota', async () => {
    overlapReads();
    let release;
    const failed = new Promise((resolve) => { release = resolve; });
    aiOverride = async ({ message }) => {
      if (message === 'will-fail') { await failed; return json({ error: 'upstream_error' }, 502); }
      release(); return json({ reply: 'successful fixture reply' });
    };
    const responses = await Promise.all([chat(rid(), { message: 'will-fail' }), chat(rid(), { message: 'will-succeed' })]);
    assert.deepEqual(responses.map(({ status }) => status).sort(), [200, 502]);
    assert.equal(read(passPath).messagesUsed, 1);
    assert.equal(aiCalls, 2);
  });
  await test('same request ID concurrently invokes and charges AI once', async () => {
    const id = rid(); overlapReads();
    const responses = await Promise.all([chat(id), chat(id)]);
    assert.equal(responses.filter(({ status }) => status === 200).length, 1);
    assert.equal(responses.filter(({ status }) => status === 409).length, 1);
    assert.equal(aiCalls, 1); assert.equal(read(passPath).messagesUsed, 1);
  });
  await test('retry after success cannot invoke or charge AI again', async () => {
    const id = rid(); assert.equal((await chat(id)).status, 200);
    assert.equal((await chat(id)).status, 409);
    assert.equal(aiCalls, 1); assert.equal(read(passPath).messagesUsed, 1);
    assert.doesNotMatch(JSON.stringify(read(recordPath(id))), /Fixture question|Fixture paid reply/);
  });
  await test('request ID case normalization cannot bypass idempotency', async () => {
    const id = 'aabbccdd-eeee-4aaa-8bbb-cccccccccccc';
    assert.equal((await chat(id)).status, 200);
    assert.equal((await chat(id.toUpperCase())).status, 409);
    assert.equal(aiCalls, 1); assert.equal(read(passPath).messagesUsed, 1);
  });
  for (const change of [{ message: 'Changed fixture question' }, { context: ['Changed context'] }, { streaming: true }]) {
    await test(`same request ID with changed ${Object.keys(change)[0]} is rejected`, async () => {
      const id = rid(); assert.equal((await chat(id)).status, 200);
      assert.equal((await chat(id, change)).status, 409);
      assert.equal(aiCalls, 1); assert.equal(read(passPath).messagesUsed, 1);
    });
  }
  for (const mode of ['fail', 'stream-http-failure']) {
    await test(`${mode}: failure refunds once and same-ID retry may succeed`, async () => {
      const id = rid(); aiMode = mode;
      assert.ok((await chat(id, { streaming: mode.startsWith('stream') })).status >= 500);
      assert.equal(read(passPath).messagesUsed, 0);
      aiMode = 'ok';
      assert.equal((await chat(id, { streaming: mode.startsWith('stream') })).status, 200);
      assert.equal(read(passPath).messagesUsed, 1); assert.equal(aiCalls, 2);
    });
  }
  await test('unknown upstream timeout keeps one reservation and blocks replay', async () => {
    const id = rid(); aiMode = 'timeout';
    assert.equal((await chat(id)).status, 504);
    assert.equal(read(passPath).messagesUsed, 1);
    assert.equal((await chat(id)).status, 409);
    assert.equal(read(passPath).messagesUsed, 1); assert.equal(aiCalls, 1);
  });
  for (const streaming of [false, true]) {
    await test(`Worker HTTP timeout (${streaming ? 'stream' : 'JSON'}) keeps one reservation and blocks replay`, async () => {
      const id = rid(); aiMode = 'worker-timeout';
      assert.equal((await chat(id, { streaming })).status, 504);
      assert.equal(read(passPath).messagesUsed, 1);
      assert.equal((await chat(id, { streaming })).status, 409);
      assert.equal(read(passPath).messagesUsed, 1); assert.equal(aiCalls, 1);
    });
  }
  await test('a released request can retry with rebuilt context without double charging', async () => {
    const id = rid(); aiMode = 'fail';
    assert.equal((await chat(id)).status, 502);
    assert.equal(read(passPath).messagesUsed, 0);
    aiMode = 'ok';
    assert.equal((await chat(id, { context: ['Rebuilt fixture context'] })).status, 200);
    assert.equal(read(passPath).messagesUsed, 1); assert.equal(aiCalls, 2);
  });
  await test('released request ID cannot be reused for a different message', async () => {
    const id = rid(); aiMode = 'fail';
    assert.equal((await chat(id)).status, 502);
    assert.equal(read(passPath).messagesUsed, 0);
    aiMode = 'ok';
    assert.equal((await chat(id, { message: 'Different fixture message' })).status, 409);
    assert.equal(read(passPath).messagesUsed, 0); assert.equal(aiCalls, 1);
  });
  await test('committed reservation with lost ACK is reconciled without double charge', async () => {
    fault = { phase: 'reserved', kind: 'after-commit', remaining: 1 };
    assert.equal((await chat()).status, 200);
    assert.equal(fault.remaining, 0); assert.equal(aiCalls, 1); assert.equal(read(passPath).messagesUsed, 1);
  });
  await test('uncommitted transient reservation failure never double charges', async () => {
    fault = { phase: 'reserved', kind: 'before-commit', remaining: 1 };
    const id = rid(); let response = await chat(id);
    if (response.status === 503) response = await chat(id);
    assert.equal(response.status, 200);
    assert.equal(fault.remaining, 0); assert.equal(aiCalls, 1); assert.equal(read(passPath).messagesUsed, 1);
  });
  await test('unknown reservation outcome with unreadable ledger fails closed', async () => {
    const id = rid(); fault = { phase: 'reserved', kind: 'after-commit-unreadable', remaining: 1 };
    assert.equal((await chat(id)).status, 503);
    assert.equal(aiCalls, 0); assert.equal(read(passPath).messagesUsed, 1);
    ledgerReadDown = false;
    assert.equal((await chat(id)).status, 409);
    assert.equal(aiCalls, 0); assert.equal(read(passPath).messagesUsed, 1);
  });
  for (const phase of ['consumed', 'released']) {
    await test(`lost ${phase} ACK never causes a second charge or refund`, async () => {
      const id = rid(); fault = { phase, kind: 'after-commit', remaining: 1 };
      aiMode = phase === 'released' ? 'fail' : 'ok';
      const first = await chat(id);
      assert.equal(first.status, phase === 'released' ? 502 : 200);
      assert.equal(fault.remaining, 0);
      assert.equal(read(passPath).messagesUsed, phase === 'released' ? 0 : 1);
      aiMode = 'ok';
      assert.equal((await chat(id)).status, phase === 'released' ? 200 : 409);
      assert.equal(read(passPath).messagesUsed, 1);
      assert.equal(aiCalls, phase === 'released' ? 2 : 1);
    });
  }
  await test('failed consume persistence cannot refund a successful answer or allow replay', async () => {
    const id = rid(); fault = { phase: 'consumed', kind: 'before-commit', remaining: 100 };
    assert.equal((await chat(id)).status, 200);
    assert.equal(read(passPath).messagesUsed, 1);
    assert.equal(read(recordPath(id)).status, 'reserved');
    assert.equal((await chat(id)).status, 409);
    assert.equal(aiCalls, 1); assert.equal(read(passPath).messagesUsed, 1);
  });
  await test('persistent write outage refuses AI without charging', async () => {
    failAllCommits = true;
    assert.equal((await chat()).status, 503);
    assert.equal(aiCalls, 0); assert.equal(read(passPath).messagesUsed, 0);
  });
  await test('read outage refuses AI without charging', async () => {
    firestoreDown = true;
    assert.equal((await chat()).status, 503);
    assert.equal(aiCalls, 0); assert.equal(read(passPath).messagesUsed, 0);
  });
  await test('explicit Worker SSE error before content releases the request quota', async () => {
    aiMode = 'stream-empty-failure';
    await chat(rid(), { streaming: true });
    assert.equal(read(passPath).messagesUsed, 0);
  });
  await test('empty completed stream does not charge a message without output', async () => {
    aiMode = 'stream-empty-done';
    await chat(rid(), { streaming: true });
    assert.equal(read(passPath).messagesUsed, 0);
  });
  await test('a refunded empty done event terminates before any late content', async () => {
    aiMode = 'stream-empty-done-late-content';
    const response = await chat(rid(), { streaming: true });
    assert.equal(response.status, 200);
    assert.doesNotMatch(response.body, /Late fixture content/);
    assert.equal(read(passPath).messagesUsed, 0);
  });
  await test('raw stream transport failure before content remains uncertain and cannot replay', async () => {
    const id = rid(); aiMode = 'stream-raw-empty-failure';
    await chat(id, { streaming: true });
    assert.equal(read(passPath).messagesUsed, 1);
    assert.equal((await chat(id, { streaming: true })).status, 409);
    assert.equal(aiCalls, 1);
  });
  await test('stream failure after content retains one charge and blocks replay', async () => {
    const id = rid(); aiMode = 'stream-partial-failure';
    const response = await chat(id, { streaming: true });
    assert.equal(response.status, 200);
    assert.equal(read(passPath).messagesUsed, 1);
    assert.equal((await chat(id, { streaming: true })).status, 409);
    assert.equal(aiCalls, 1);
  });
  await test('successful stream is charged once and cannot replay', async () => {
    const id = rid(); const response = await chat(id, { streaming: true });
    assert.equal(response.status, 200); assert.equal(response.bodyReadFailed, false);
    assert.match(response.body, /Fixture reply/);
    assert.equal((await chat(id, { streaming: true })).status, 409);
    assert.equal(aiCalls, 1); assert.equal(read(passPath).messagesUsed, 1);
  });
  await test('releasing the same reservation twice returns exactly one message', async () => {
    const { reservePassChatMessage, settlePassChatMessage } = await import('../functions/_shared/pass-chat-quota.js');
    const reservation = await reservePassChatMessage(env, { passId, deviceId, requestId: rid(), inputHash: await sha256hex('fixture input') });
    assert.equal(reservation.ok, true);
    assert.equal(read(passPath).messagesUsed, 1);
    await Promise.allSettled([settlePassChatMessage(env, reservation, 'released'), settlePassChatMessage(env, reservation, 'released')]);
    assert.equal(read(passPath).messagesUsed, 0);
    assert.equal(read(reservation.path).status, 'released');
  });
  await test('an old attempt cannot refund the same request after a retry reserves it', async () => {
    const { reservePassChatMessage, settlePassChatMessage } = await import('../functions/_shared/pass-chat-quota.js');
    const options = { passId, deviceId, requestId: rid(), inputHash: await sha256hex('fixture input') };
    const first = await reservePassChatMessage(env, options);
    assert.equal(first.ok, true);
    await settlePassChatMessage(env, first, 'released');
    const second = await reservePassChatMessage(env, options);
    assert.equal(second.ok, true);
    assert.notEqual(second.owner, first.owner);
    await settlePassChatMessage(env, first, 'released').catch(() => {});
    assert.equal(read(passPath).messagesUsed, 1);
    assert.equal(read(second.path).owner, second.owner);
    assert.equal(read(second.path).status, 'reserved');
  });
  await test('a consumed request cannot later refund its quota', async () => {
    const { reservePassChatMessage, settlePassChatMessage } = await import('../functions/_shared/pass-chat-quota.js');
    const reservation = await reservePassChatMessage(env, { passId, deviceId, requestId: rid(), inputHash: await sha256hex('fixture input') });
    assert.equal(reservation.ok, true);
    await settlePassChatMessage(env, reservation, 'consumed');
    await settlePassChatMessage(env, reservation, 'released').catch(() => {});
    assert.equal(read(passPath).messagesUsed, 1);
    assert.equal(read(reservation.path).status, 'consumed');
  });
  await test('uncommitted release failure holds quota until that reservation is reconciled', async () => {
    const { reservePassChatMessage, settlePassChatMessage } = await import('../functions/_shared/pass-chat-quota.js');
    const reservation = await reservePassChatMessage(env, { passId, deviceId, requestId: rid(), inputHash: await sha256hex('fixture input') });
    assert.equal(reservation.ok, true);
    fault = { phase: 'released', kind: 'before-commit', remaining: 100 };
    await settlePassChatMessage(env, reservation, 'released').catch(() => {});
    assert.equal(read(passPath).messagesUsed, 1);
    assert.equal(read(reservation.path).status, 'reserved');
    fault = null;
    await settlePassChatMessage(env, reservation, 'released');
    await settlePassChatMessage(env, reservation, 'released');
    assert.equal(read(passPath).messagesUsed, 0);
    assert.equal(read(reservation.path).status, 'released');
  });
} finally {
  globalThis.fetch = originalFetch;
}
for (const result of results) console.log(`${result.ok ? 'PASS' : 'FAIL'}: ${result.name}${result.reason ? ` — ${result.reason}` : ''}`);
const failed = results.filter(({ ok }) => !ok).length;
console.log(`Paid Buddy quota: ${results.length - failed} PASS / ${failed} FAIL (${results.length} offline cases).`);
if (failed) process.exitCode = 1;
