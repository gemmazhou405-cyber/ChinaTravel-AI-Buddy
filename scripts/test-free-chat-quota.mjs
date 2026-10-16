// End-to-end test of the free Buddy AI quota in /api/buddy/chat with an in-memory Firestore
// (transactions included) and a mock AI worker. No network access.
// Covers: 10th message allowed, 11th blocked, AI failure refunds the message, another IP is
// unaffected, Firestore unavailable refuses (fails closed), and KV is not consulted.
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { onRequestPost } from '../functions/api/buddy/chat.js';
import { hashIp } from '../functions/_shared/ip-hash.js';
import { FREE_CHAT_DAILY_LIMIT, freeChatUsagePath } from '../functions/_shared/free-chat-quota.js';

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

const kvCalls = [];
const env = {
  FIREBASE_PROJECT_ID: 'test-project',
  FIREBASE_CLIENT_EMAIL: 'test@test-project.iam.gserviceaccount.com',
  FIREBASE_PRIVATE_KEY: privateKey,
  SESSION_SECRET: 'test-session-secret',
  IP_HASH_SALT: 'test-salt',
  COZE_WORKER_URL: 'https://ai-worker.test',
  COZE_BOT_ID: 'test_bot_12345',
  COZE_INTERNAL_SECRET: 'internal',
  // A KV binding that would always allow: proves Firestore alone decides.
  RATE_LIMIT: {
    get: async (key) => { kvCalls.push(['get', key]); return null; },
    put: async (key) => { kvCalls.push(['put', key]); },
  },
};

// ---- In-memory Firestore: documents, transactions, batchGet, commit ----
const ROOT = `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const docs = new Map(); // path -> fields (Firestore REST value shapes)
let txCounter = 0;
let firestoreDown = false;
let aiMode = 'ok';
let aiCalls = 0;

function fromFs(value) {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('nullValue' in value) return null;
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([k, v]) => [k, fromFs(v)]));
  return undefined;
}
const read = (path) => {
  const fields = docs.get(path);
  return fields ? Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, fromFs(v)])) : null;
};
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

globalThis.fetch = async (input, init = {}) => {
  const url = new URL(String(input));
  if (url.hostname === 'oauth2.googleapis.com') return json({ access_token: 'test-token', expires_in: 3600 });
  if (url.hostname === 'firestore.googleapis.com') {
    if (firestoreDown) return json({ error: { status: 'UNAVAILABLE' } }, 503);
    const body = init.body ? JSON.parse(init.body) : {};
    if (url.pathname.endsWith(':beginTransaction')) return json({ transaction: `tx-${++txCounter}` });
    if (url.pathname.endsWith(':batchGet')) {
      assert.ok(body.transaction, 'reads happen inside a transaction');
      return json(body.documents.map((name) => {
        const path = name.replace(`${ROOT}/`, '');
        return docs.has(path) ? { found: { name, fields: docs.get(path) } } : { missing: name };
      }));
    }
    if (url.pathname.endsWith(':commit')) {
      assert.ok(body.transaction, 'writes happen inside a transaction');
      for (const write of body.writes) docs.set(write.update.name.replace(`${ROOT}/`, ''), write.update.fields);
      return json({ writeResults: body.writes.map(() => ({})) });
    }
    return json({}, 404);
  }
  if (url.hostname === 'ai-worker.test') {
    aiCalls += 1;
    if (aiMode === 'fail') return json({ error: 'upstream_error' }, 502);
    if (aiMode === 'timeout') return json({ error: 'upstream_timeout' }, 504);
    return json({ reply: 'Hi! How can I help with your China trip?' });
  }
  throw new Error(`unexpected fetch ${url}`);
};

let rid = 0;
const nextRequestId = () => `00000000-0000-4000-8000-${String(++rid).padStart(12, '0')}`;
async function chat(ip, { stream = false } = {}) {
  const request = new Request('https://chinaeasebuddy.com/api/buddy/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip, Origin: 'https://chinaeasebuddy.com' },
    body: JSON.stringify({ requestId: nextRequestId(), message: 'Hi', stream }),
  });
  const response = await onRequestPost({ request, env });
  const text = await response.text();
  return { status: response.status, body: text.startsWith('{') ? JSON.parse(text) : text };
}

const IP_A = '203.0.113.10';
const IP_B = '198.51.100.20';
const pathA = freeChatUsagePath(await hashIp(env, IP_A));
const pathB = freeChatUsagePath(await hashIp(env, IP_B));
assert.equal(FREE_CHAT_DAILY_LIMIT, 10);
assert.match(pathA, /^freeChatUsage\/[0-9a-f]{64}_\d{8}$/, 'document ID is IP hash + UTC date');

// 1. Nine successful messages, then one AI failure: the failed message is refunded.
for (let n = 1; n <= 9; n += 1) {
  const r = await chat(IP_A);
  assert.equal(r.status, 200, `message ${n} allowed`);
  assert.equal(r.body.usage.messagesUsed, n);
}
assert.equal(read(pathA).count, 9);

aiMode = 'fail';
const failed = await chat(IP_A);
assert.equal(failed.status, 502);
assert.equal(read(pathA).count, 9, 'AI failure gives the message back');

aiMode = 'timeout';
const timedOut = await chat(IP_A, { stream: true });
assert.equal(timedOut.status, 504);
assert.equal(read(pathA).count, 9, 'AI timeout before the stream starts gives the message back');
aiMode = 'ok';

// 2. The 10th message is allowed; the 11th is blocked with the existing quota message.
const tenth = await chat(IP_A);
assert.equal(tenth.status, 200, '10th message allowed');
assert.equal(tenth.body.usage.messagesUsed, 10);
assert.equal(tenth.body.usage.remaining, 0);
assert.equal(read(pathA).count, 10);

const aiCallsBefore = aiCalls;
const eleventh = await chat(IP_A);
assert.equal(eleventh.status, 429, '11th message blocked');
assert.equal(eleventh.body.error, 'free_quota_exhausted');
assert.equal(aiCalls, aiCallsBefore, 'no AI call once the quota is used');
assert.equal(read(pathA).count, 10, 'a blocked request does not change the count');

// The stored document has the fields needed for clean-up.
const stored = read(pathA);
assert.equal(stored.limit, 10);
assert.match(stored.day, /^\d{8}$/);
assert.ok(Date.parse(stored.expireAt) > Date.now() + 86_400_000, 'expireAt is a timestamp after the day ends');

// 3. Another IP is unaffected.
const other = await chat(IP_B);
assert.equal(other.status, 200, 'another IP still has its own quota');
assert.equal(read(pathB).count, 1);

// 4. Firestore unavailable: refuse (fail closed) with a friendly message, no AI call.
firestoreDown = true;
const aiBeforeOutage = aiCalls;
const outage = await chat('192.0.2.30');
assert.equal(outage.status, 503);
assert.equal(outage.body.error, 'free_quota_unavailable');
assert.match(outage.body.message, /try again in a few minutes/);
assert.equal(aiCalls, aiBeforeOutage, 'no unmetered AI call while Firestore is down');
firestoreDown = false;

// Missing Firestore configuration also fails closed.
const noConfig = await onRequestPost({
  request: new Request('https://chinaeasebuddy.com/api/buddy/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.31' },
    body: JSON.stringify({ requestId: nextRequestId(), message: 'Hi' }),
  }),
  env: { ...env, FIREBASE_PRIVATE_KEY: '' },
});
assert.equal(noConfig.status, 503);
assert.equal((await noConfig.json()).error, 'free_quota_unavailable');

// 5. KV is no longer consulted for the decision.
assert.equal(kvCalls.length, 0, 'the KV counter is not used');

console.log('Free chat quota tests passed (10th allowed, 11th blocked, failures refunded, per-IP, fails closed).');
