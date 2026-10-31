// End-to-end test of how /api/buddy/chat charges pass holders, with an in-memory Firestore
// (transactions, document reads and patches) and a mock AI worker. No network access.
// Covers: a pass holder uses the 10 free daily messages first, then pass messages; both used up
// returns quota_exhausted; an expired pass falls back to the free quota; free users are unchanged;
// an AI failure refunds whichever message was actually used; a missing pass is rejected; and if
// the free counter is unavailable a pass holder is charged to the pass instead of being refused.
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { onRequestPost } from '../functions/api/buddy/chat.js';
import { hashIp } from '../functions/_shared/ip-hash.js';
import { FREE_CHAT_DAILY_LIMIT, freeChatUsagePath } from '../functions/_shared/free-chat-quota.js';
import { signSessionToken } from '../functions/_shared/session.js';
import { toFirestoreDocument } from '../functions/_shared/firestore.js';

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

const env = {
  FIREBASE_PROJECT_ID: 'test-project',
  FIREBASE_CLIENT_EMAIL: 'test@test-project.iam.gserviceaccount.com',
  FIREBASE_PRIVATE_KEY: privateKey,
  SESSION_SECRET: 'test-session-secret',
  IP_HASH_SALT: 'test-salt',
  COZE_WORKER_URL: 'https://ai-worker.test',
  COZE_BOT_ID: 'test_bot_12345',
  COZE_INTERNAL_SECRET: 'internal',
};

// ---- In-memory Firestore: transactions for the free counter, GET/PATCH for pass documents ----
const ROOT = `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const docs = new Map(); // path -> fields (Firestore REST value shapes)
let txCounter = 0;
let transactionsDown = false;
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
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(fromFs);
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
    const body = init.body ? JSON.parse(init.body) : {};
    const method = init.method || 'GET';
    if (url.pathname.endsWith(':beginTransaction')) {
      if (transactionsDown) return json({ error: { status: 'UNAVAILABLE' } }, 503);
      return json({ transaction: `tx-${++txCounter}` });
    }
    if (url.pathname.endsWith(':batchGet')) {
      return json(body.documents.map((name) => {
        const path = name.replace(`${ROOT}/`, '');
        return docs.has(path) ? { found: { name, fields: docs.get(path) } } : { missing: name };
      }));
    }
    if (url.pathname.endsWith(':commit')) {
      for (const write of body.writes) docs.set(write.update.name.replace(`${ROOT}/`, ''), write.update.fields);
      return json({ writeResults: body.writes.map(() => ({})) });
    }
    const path = decodeURIComponent(url.pathname.replace(`/v1/${ROOT}/`, ''));
    if (method === 'GET') return docs.has(path) ? json({ name: `${ROOT}/${path}`, fields: docs.get(path) }) : json({}, 404);
    if (method === 'PATCH') {
      const mask = url.searchParams.getAll('updateMask.fieldPaths');
      const merged = { ...(docs.get(path) || {}) };
      for (const [key, value] of Object.entries(body.fields)) if (!mask.length || mask.includes(key)) merged[key] = value;
      docs.set(path, merged);
      return json({ name: `${ROOT}/${path}`, fields: merged });
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

const DAY_MS = 86_400_000;
function putPass(passId, { tier = 'trip', allowance = 3, used = 0, expiresAt = Date.now() + 14 * DAY_MS } = {}) {
  docs.set(`passes/${passId}`, toFirestoreDocument({ tier, messageAllowance: allowance, messagesUsed: used, expiresAt }).fields);
}
const passUsed = (passId) => read(`passes/${passId}`).messagesUsed;
const freeCount = async (ip) => read(freeChatUsagePath(await hashIp(env, ip)))?.count ?? 0;

let rid = 0;
const nextRequestId = () => `00000000-0000-4000-8000-${String(++rid).padStart(12, '0')}`;
async function chat(ip, { passId, stream = false } = {}) {
  const headers = { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip, Origin: 'https://chinaeasebuddy.com' };
  if (passId) headers.Cookie = `ceb_pass=${await signSessionToken(env.SESSION_SECRET, passId, 'device-1')}`;
  const request = new Request('https://chinaeasebuddy.com/api/buddy/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({ requestId: nextRequestId(), message: 'Hi', stream }),
  });
  const response = await onRequestPost({ request, env });
  const text = await response.text();
  return { status: response.status, body: text.startsWith('{') ? JSON.parse(text) : text };
}

assert.equal(FREE_CHAT_DAILY_LIMIT, 10);
const results = [];
const pass = (name) => { results.push(name); };

// 1. A pass holder uses today's 10 free messages first; the pass count does not move.
const IP_PASS = '203.0.113.50';
const PASS = 'pass-active-0001';
putPass(PASS, { allowance: 3 });
for (let n = 1; n <= 10; n += 1) {
  const r = await chat(IP_PASS, { passId: PASS });
  assert.equal(r.status, 200, `pass holder message ${n} allowed`);
  assert.equal(r.body.usage.chargedTo, 'free', `message ${n} uses a free message`);
  assert.equal(r.body.usage.messagesUsed, 0, 'usage reports pass messages only');
  assert.equal(r.body.usage.messageAllowance, 3);
}
assert.equal(await freeCount(IP_PASS), 10);
assert.equal(passUsed(PASS), 0, 'no pass message used while free messages remain');
pass('Pass holder: first 10 messages each day use the free quota; pass count unchanged');

// 2. Free messages used up: further messages use the pass, one each.
for (let n = 1; n <= 3; n += 1) {
  const r = await chat(IP_PASS, { passId: PASS });
  assert.equal(r.status, 200, `pass message ${n} allowed`);
  assert.equal(r.body.usage.chargedTo, 'pass');
  assert.equal(r.body.usage.messagesUsed, n);
  assert.equal(r.body.usage.remaining, 3 - n);
}
assert.equal(passUsed(PASS), 3);
assert.equal(await freeCount(IP_PASS), 10, 'the free count stays at the limit');
pass('Pass holder: after the free 10, each message uses one pass message');

// 3. Both used up: refused with quota_exhausted, no AI call, nothing charged.
let aiBefore = aiCalls;
const bothUsed = await chat(IP_PASS, { passId: PASS });
assert.equal(bothUsed.status, 402);
assert.equal(bothUsed.body.error, 'quota_exhausted', 'the client shows chat.quotaExhausted for this code');
assert.equal(bothUsed.body.tier, 'trip');
assert.equal(aiCalls, aiBefore, 'no AI call when both are used up');
assert.equal(passUsed(PASS), 3);
pass('Pass holder: free and pass both used up returns quota_exhausted (new message)');

// 4. AI failure refunds the side actually charged.
//    a) Charged to the free quota: the free message comes back, the pass is untouched.
const IP_ROLLBACK = '203.0.113.60';
const PASS_RB = 'pass-rollback-0002';
putPass(PASS_RB, { allowance: 5 });
aiMode = 'fail';
const failedFree = await chat(IP_ROLLBACK, { passId: PASS_RB });
assert.equal(failedFree.status, 502);
assert.equal(await freeCount(IP_ROLLBACK), 0, 'free message refunded');
assert.equal(passUsed(PASS_RB), 0, 'pass untouched');
aiMode = 'timeout';
const timedOutFree = await chat(IP_ROLLBACK, { passId: PASS_RB, stream: true });
assert.equal(timedOutFree.status, 504);
assert.equal(await freeCount(IP_ROLLBACK), 0, 'free message refunded after a stream timeout');
assert.equal(passUsed(PASS_RB), 0);
aiMode = 'ok';
//    b) Charged to the pass: the pass message comes back, the free count stays at the limit.
for (let n = 0; n < 10; n += 1) await chat(IP_ROLLBACK, { passId: PASS_RB });
assert.equal(await freeCount(IP_ROLLBACK), 10);
aiMode = 'fail';
const failedPass = await chat(IP_ROLLBACK, { passId: PASS_RB });
assert.equal(failedPass.status, 502);
assert.equal(passUsed(PASS_RB), 0, 'pass message refunded');
assert.equal(await freeCount(IP_ROLLBACK), 10, 'free count not released, it was not charged');
aiMode = 'timeout';
const timedOutPass = await chat(IP_ROLLBACK, { passId: PASS_RB, stream: true });
assert.equal(timedOutPass.status, 504);
assert.equal(passUsed(PASS_RB), 0, 'pass message refunded after a stream timeout');
assert.equal(await freeCount(IP_ROLLBACK), 10);
aiMode = 'ok';
pass('AI failure or timeout refunds the side actually charged (free or pass), not the other');

// 5. Expired pass: treated as a free user, 10 a day, then the free-limit message.
const IP_EXPIRED = '203.0.113.70';
const PASS_OLD = 'pass-expired-0003';
putPass(PASS_OLD, { allowance: 50, used: 12, expiresAt: Date.now() - DAY_MS });
for (let n = 1; n <= 10; n += 1) {
  const r = await chat(IP_EXPIRED, { passId: PASS_OLD });
  assert.equal(r.status, 200, `expired pass, message ${n} allowed on the free quota`);
  assert.equal(r.body.usage.tier, 'free');
  assert.equal(r.body.usage.messagesUsed, n);
}
const expiredEleventh = await chat(IP_EXPIRED, { passId: PASS_OLD });
assert.equal(expiredEleventh.status, 429);
assert.equal(expiredEleventh.body.error, 'free_quota_exhausted', 'not pass_expired');
assert.equal(passUsed(PASS_OLD), 12, 'an expired pass is never charged');
pass('Expired pass: 10 free messages a day, then free_quota_exhausted (not pass_expired)');

// 6. Free users are unchanged: 10 a day, then free_quota_exhausted.
const IP_FREE = '203.0.113.80';
for (let n = 1; n <= 10; n += 1) {
  const r = await chat(IP_FREE);
  assert.equal(r.status, 200, `free message ${n} allowed`);
  assert.equal(r.body.usage.tier, 'free');
  assert.equal(r.body.usage.messagesUsed, n);
}
aiBefore = aiCalls;
const freeEleventh = await chat(IP_FREE);
assert.equal(freeEleventh.status, 429);
assert.equal(freeEleventh.body.error, 'free_quota_exhausted');
assert.equal(aiCalls, aiBefore);
pass('Free user: unchanged (10 a day, then free_quota_exhausted)');

// 7. A session whose pass document no longer exists is rejected.
const missing = await chat('203.0.113.90', { passId: 'pass-missing-0004' });
assert.equal(missing.status, 401);
assert.equal(missing.body.error, 'invalid_pass');
pass('Session for a missing pass: 401 invalid_pass');

// 8. Free counter unavailable: free users are refused, pass holders are charged to the pass.
transactionsDown = true;
const PASS_OUTAGE = 'pass-outage-0005';
putPass(PASS_OUTAGE, { allowance: 2 });
const outagePass = await chat('203.0.113.100', { passId: PASS_OUTAGE });
assert.equal(outagePass.status, 200);
assert.equal(outagePass.body.usage.chargedTo, 'pass');
assert.equal(passUsed(PASS_OUTAGE), 1);
const outageFree = await chat('203.0.113.101');
assert.equal(outageFree.status, 503);
assert.equal(outageFree.body.error, 'free_quota_unavailable');
transactionsDown = false;
pass('Free counter unavailable: free users refused (503), pass holders use the pass');

for (const name of results) console.log(`PASS  ${name}`);
console.log(`Pass chat quota tests passed (${results.length} cases).`);
