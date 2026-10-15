// End-to-end test of the free-plan quota in /api/leads/trip with an in-memory Firestore and
// Resend: blocked enquiries are stored (free_plan_blocked) and notified before the 409, and an
// IP address gets at most 5 free itineraries per day. No network access, no AI call succeeds.
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { onRequestPost } from '../functions/api/leads/trip.js';
import { hashIp } from '../functions/_shared/ip-hash.js';

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

const env = {
  FIREBASE_PROJECT_ID: 'test-project',
  FIREBASE_CLIENT_EMAIL: 'test@test-project.iam.gserviceaccount.com',
  FIREBASE_PRIVATE_KEY: privateKey,
  RESEND_API_KEY: 'test-resend-key',
  DEEPSEEK_API_KEY: 'test-ai-key',
  IP_HASH_SALT: 'test-salt',
};

// ---- In-memory Firestore (REST shapes used by functions/_shared/firestore.js) ----
const ROOT = `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const docs = new Map(); // path -> { fields, updateTime }
let clock = 0;
const nextTime = () => `2026-10-15T00:00:00.${String(++clock).padStart(6, '0')}Z`;
const sent = [];
const aiCalls = [];

function fsValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(fsValue) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fsValue(v)])) } };
}
function fromFs(value) {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(fromFs);
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([k, v]) => [k, fromFs(v)]));
  return undefined;
}
const read = (path) => {
  const doc = docs.get(path);
  return doc ? Object.fromEntries(Object.entries(doc.fields).map(([k, v]) => [k, fromFs(v)])) : null;
};
const seed = (path, data) => docs.set(path, { fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, fsValue(v)])), updateTime: nextTime() });
const docJson = (path) => ({ name: `${ROOT}/${path}`, ...docs.get(path) });
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function applyWrite(write) {
  const path = write.update.name.replace(`${ROOT}/`, '');
  const current = docs.get(path);
  if (write.currentDocument?.exists === false && current) return 'ALREADY_EXISTS';
  if (write.currentDocument?.updateTime && current?.updateTime !== write.currentDocument.updateTime) return 'FAILED_PRECONDITION';
  const fields = write.updateMask
    ? { ...(current?.fields || {}), ...Object.fromEntries(write.updateMask.fieldPaths.map((f) => [f, write.update.fields[f]])) }
    : write.update.fields;
  docs.set(path, { fields, updateTime: nextTime() });
  return null;
}

globalThis.fetch = async (input, init = {}) => {
  const url = new URL(String(input));
  const method = init.method || 'GET';
  if (url.hostname === 'oauth2.googleapis.com') return json({ access_token: 'test-token', expires_in: 3600 });
  if (url.hostname === 'api.resend.com') {
    sent.push(JSON.parse(init.body));
    return json({ id: `email-${sent.length}` });
  }
  if (url.hostname === 'firestore.googleapis.com') {
    const path = decodeURIComponent(url.pathname.split('/documents')[1] || '').replace(/^\//, '');
    if (url.pathname.endsWith('/documents:commit')) {
      const { writes } = JSON.parse(init.body);
      const snapshot = new Map(docs);
      for (const write of writes) {
        const error = applyWrite(write);
        if (error) {
          docs.clear();
          snapshot.forEach((value, key) => docs.set(key, value));
          return json({ error: { status: error } }, error === 'ALREADY_EXISTS' ? 409 : 400);
        }
      }
      return json({ writeResults: writes.map(() => ({})) });
    }
    if (url.pathname.endsWith(':runQuery')) return json([]);
    if (method === 'GET') return docs.has(path) ? json(docJson(path)) : json({}, 404);
    if (method === 'POST') {
      const full = `${path}/${url.searchParams.get('documentId')}`;
      if (docs.has(full)) return json({ error: { status: 'ALREADY_EXISTS' } }, 409);
      docs.set(full, { fields: JSON.parse(init.body).fields, updateTime: nextTime() });
      return json(docJson(full));
    }
    if (method === 'PATCH') {
      const mask = url.searchParams.getAll('updateMask.fieldPaths');
      const body = JSON.parse(init.body).fields;
      const current = docs.get(path)?.fields || {};
      docs.set(path, { fields: { ...current, ...Object.fromEntries(mask.map((f) => [f, body[f]])) }, updateTime: nextTime() });
      return json(docJson(path));
    }
  }
  // Anything else is the AI provider: fail it so no itinerary is generated or emailed.
  aiCalls.push(url.hostname);
  return json({ error: 'unavailable' }, 503);
};

const IP = '203.0.113.7';
const ipHash = await hashIp(env, IP);
const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const ipPath = `tripPlanClaims/ip_${ipHash}_${day}`;

async function submit(requestId, email, ip = IP) {
  const request = new Request('https://chinaeasebuddy.com/api/leads/trip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip, Origin: 'https://chinaeasebuddy.com' },
    body: JSON.stringify({ requestId, email, travelDate: '2026-11-20', tripLength: 5, travelers: 2, destinationCities: ['Beijing'] }),
  });
  const response = await onRequestPost({ request, env });
  return { status: response.status, body: await response.json() };
}

// Salted hash: not the bare SHA-256 of the IP, and it changes with the salt.
const bare = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(IP))))
  .map((b) => b.toString(16).padStart(2, '0')).join('');
assert.notEqual(ipHash, bare, 'IP hash is salted');
assert.notEqual(ipHash, await hashIp({ IP_HASH_SALT: 'other' }, IP), 'salt changes the hash');
assert.match(ipHash, /^[0-9a-f]{64}$/);

// 1. Email already used: stored as free_plan_blocked, admin notified, then 409.
const usedEmail = 'used@example.com';
const usedEmailHash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(usedEmail))))
  .map((b) => b.toString(16).padStart(2, '0')).join('');
seed(`tripPlanClaims/email_${usedEmailHash}`, { requestId: 'old-request', status: 'used', createdAt: Date.now() - 86_400_000 });
const r1 = '11111111-1111-4111-8111-111111111111';
const blocked = await submit(r1, usedEmail);
assert.equal(blocked.status, 409);
assert.equal(blocked.body.error, 'free_plan_used');
const stored = read(`tripLeads/blocked_${r1}`);
assert.ok(stored, 'blocked enquiry is stored in tripLeads');
assert.equal(stored.status, 'free_plan_blocked');
assert.equal(stored.freePlanBlockedReason, 'email');
assert.equal(stored.requestId, r1);
assert.equal(stored.email, usedEmail);
assert.equal(stored.planGenerationStatus, 'not_attempted');
assert.equal(stored.notificationStatus, 'accepted');
assert.equal(stored.ipHash, ipHash);
assert.equal(read(`tripLeads/${r1}`), null, 'the request ID stays free for a later paid retry');
assert.equal(sent.length, 1, 'one admin notification');
assert.equal(sent[0].to, 'chinaeastbuddy@gmail.com');
assert.match(sent[0].subject, /free plan already used/);
assert.match(sent[0].text, /Free plan check: +Blocked: this email address has already received its free itinerary/);
assert.match(sent[0].text, /The customer received nothing: .*no itinerary was generated or emailed/);
assert.equal(aiCalls.length, 0, 'no AI call for a blocked enquiry');

// A repeated blocked submit with the same request ID is not notified twice.
const again = await submit(r1, usedEmail);
assert.equal(again.status, 409);
assert.equal(sent.length, 1);

// 2. IP limit: 4 used today -> the 5th request is allowed (reserved, then failed when the AI fails).
seed(ipPath, {
  day,
  requests: [1, 2, 3, 4].map((n) => ({ requestId: `r${n}`, status: 'used', createdAt: Date.now() - n * 1000 })),
  updatedAt: Date.now(),
});
const r5 = '55555555-5555-4555-8555-555555555555';
const fifth = await submit(r5, 'fifth@example.com');
assert.equal(fifth.status, 503, 'the fifth request is let through (AI fails in this test)');
assert.equal(aiCalls.length > 0, true, 'the fifth request reached plan generation');
const afterFifth = read(ipPath).requests;
assert.equal(afterFifth.length, 5);
assert.equal(afterFifth.find((entry) => entry.requestId === r5).status, 'failed', 'a failed attempt does not use a slot');

// Now mark it used: the 6th request from the same IP today is blocked with reason "ip".
seed(ipPath, { day, requests: afterFifth.map((entry) => ({ ...entry, status: 'used' })), updatedAt: Date.now() });
const r6 = '66666666-6666-4666-8666-666666666666';
const sentBefore = sent.length;
const sixth = await submit(r6, 'sixth@example.com');
assert.equal(sixth.status, 409);
assert.equal(sixth.body.error, 'free_plan_used');
assert.equal(read(`tripLeads/blocked_${r6}`).freePlanBlockedReason, 'ip');
assert.equal(sent.length, sentBefore + 1);
assert.match(sent.at(-1).text, /this IP address has reached its 5 free itineraries for today/);

// A different IP on the same day is unaffected.
const r7 = '77777777-7777-4777-8777-777777777777';
const otherIp = await submit(r7, 'seventh@example.com', '198.51.100.9');
assert.equal(otherIp.status, 503, 'another IP is not blocked');
assert.equal(read(`tripLeads/blocked_${r7}`), null);

console.log('Trip lead quota tests passed (blocked enquiries stored and notified; 5 free plans per IP per day; salted IP hash).');
