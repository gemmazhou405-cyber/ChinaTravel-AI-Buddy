// Exercise verified sale activation, signed sessions and recovery using the real handlers.
// All fetches are intercepted: Gumroad, OAuth and Firestore are in-memory test doubles.
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { onRequestPost as claim } from '../functions/api/claim.js';
import { onRequestPost as recover } from '../functions/api/recover.js';
import { onRequestGet as getPass } from '../functions/api/pass.js';
import { fromFirestoreDocument, toFirestoreDocument } from '../functions/_shared/firestore.js';

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});
const env = {
  FIREBASE_PROJECT_ID: 'pass-test-project',
  FIREBASE_CLIENT_EMAIL: 'test@pass-test-project.iam.gserviceaccount.com',
  FIREBASE_PRIVATE_KEY: privateKey,
  SESSION_SECRET: 'local-pass-regression-secret',
  GUMROAD_ACCESS_TOKEN: 'local-test-token',
  GUMROAD_TRIP_PRODUCT_ID: 'test-trip-product',
  GUMROAD_GROUP_PRODUCT_ID: 'test-group-product',
};
const root = `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const docs = new Map();
const sales = new Map();
const unexpectedFetches = [];
let firestoreDown = false;
let revision = 0;
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json' },
});
const read = (path) => fromFirestoreDocument(docs.get(path));
const write = (path, data) => docs.set(path, {
  name: `${root}/${path}`, ...toFirestoreDocument(data),
  updateTime: new Date(1_700_000_000_000 + ++revision).toISOString(),
});

const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init = {}) => {
  const url = new URL(String(input));
  if (url.hostname === 'oauth2.googleapis.com') return json({ access_token: 'local-token', expires_in: 3600 });
  if (url.hostname === 'api.gumroad.com') {
    const sale = sales.get(decodeURIComponent(url.pathname.split('/').pop()));
    return sale ? json({ success: true, sale }) : json({ success: false }, 404);
  }
  if (url.hostname === 'firestore.googleapis.com') {
    if (firestoreDown) return json({ error: 'unavailable' }, 503);
    const path = decodeURIComponent(url.pathname.split('/documents')[1] || '').replace(/^\//, '');
    const body = init.body ? JSON.parse(init.body) : {};
    if (url.pathname.endsWith(':runQuery')) {
      const { from, where } = body.structuredQuery;
      const { field, value } = where.fieldFilter;
      const wanted = fromFirestoreDocument({ fields: { value } }).value;
      const found = [...docs.entries()].find(([key, doc]) => key.startsWith(`${from[0].collectionId}/`) && fromFirestoreDocument(doc)[field.fieldPath] === wanted);
      return json(found ? [{ document: found[1] }] : []);
    }
    if (url.pathname.endsWith(':commit')) {
      // Firestore validates all preconditions before applying the atomic write set.
      for (const write of body.writes || []) {
        const path = (write.update?.name || write.delete).replace(`${root}/`, '');
        const existing = docs.get(path);
        if (write.currentDocument?.exists === false && existing) return json({ error: 'already_exists' }, 409);
        if (write.currentDocument?.updateTime && existing?.updateTime !== write.currentDocument.updateTime) {
          return json({ error: 'failed_precondition' }, 409);
        }
      }
      for (const entry of body.writes || []) {
        const path = (entry.update?.name || entry.delete).replace(`${root}/`, '');
        if (entry.delete) docs.delete(path);
        else write(path, entry.updateMask ? { ...read(path), ...fromFirestoreDocument(entry.update) } : fromFirestoreDocument(entry.update));
      }
      return json({ writeResults: (body.writes || []).map(() => ({ updateTime: new Date(1_700_000_000_000 + revision).toISOString() })) });
    }
    if ((init.method || 'GET') === 'GET') return docs.has(path) ? json(docs.get(path)) : json({}, 404);
    if (init.method === 'POST') {
      const key = `${path}/${url.searchParams.get('documentId')}`;
      if (docs.has(key)) return json({ error: 'already_exists' }, 409);
      write(key, fromFirestoreDocument(body));
      return json(docs.get(key));
    }
    if (init.method === 'PATCH') {
      write(path, { ...read(path), ...fromFirestoreDocument(body) });
      return json(docs.get(path));
    }
  }
  unexpectedFetches.push(`${init.method || 'GET'} ${url.origin}${url.pathname}`);
  throw new Error(`Unexpected test fetch: ${url.origin}${url.pathname}`);
};

async function post(handler, path, body) {
  const response = await handler({
    request: new Request(`https://chinaeasebuddy.com/api/${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }), env,
  });
  return { status: response.status, body: await response.json(), cookie: response.headers.get('Set-Cookie')?.split(';')[0] };
}
async function state(cookie) {
  const response = await getPass({
    request: new Request('https://chinaeasebuddy.com/api/pass', { headers: cookie ? { Cookie: cookie } : {} }), env,
  });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Cache-Control'), /no-store/);
  return response.json();
}

try {
  assert.deepEqual(await state(), { tier: 'free' }, 'no session remains free');
  assert.deepEqual(await state('ceb_pass=forged.device.signature'), { tier: 'free' }, 'a forged session cannot grant access');

  for (const [tier, allowance, maxDevices] of [['trip', 50, 2], ['group', 200, 5]]) {
    const saleId = `${tier}-sale`;
    sales.set(saleId, { paid: true, product_id: env[`GUMROAD_${tier.toUpperCase()}_PRODUCT_ID`], product_name: 'Test product', email: 'traveler@example.test' });
    const before = Date.now();
    const activated = await post(claim, 'claim', { saleId, deviceId: `${tier}-device-1` });
    const after = Date.now();
    assert.equal(activated.status, 200, `${tier}: verified sale activates`);
    assert.equal(activated.body.tier, tier, `${tier}: configured product ID maps to the correct pass`);
    assert.equal(activated.body.messageAllowance, allowance);
    assert.equal(activated.body.maxDevices, maxDevices);
    assert.ok(activated.body.expiresAt >= before + 14 * 86_400_000 && activated.body.expiresAt <= after + 14 * 86_400_000, `${tier}: validity is 14 days from activation`);
    assert.match(activated.body.recoveryCode, /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    assert.ok(activated.cookie?.startsWith('ceb_pass='), `${tier}: activation sets the existing signed session cookie`);

    const active = await state(activated.cookie);
    assert.equal(active.tier, tier, `${tier}: activated cookie unlocks paid state`);
    assert.equal(active.expired, false);
    assert.equal(active.messageAllowance, allowance);
    assert.equal(active.remaining, allowance);
    assert.equal(active.deviceCount, 1);
    assert.equal(active.maxDevices, maxDevices);
    const passId = activated.cookie.slice('ceb_pass='.length).split('.')[0];
    const passPath = `passes/${passId}`;
    assert.equal(read(passPath).recoveryCode, undefined, `${tier}: recovery code is not stored in plaintext`);

    // Exhausting Buddy messages must not remove an otherwise valid Toolkit entitlement.
    write(passPath, { ...read(passPath), messagesUsed: allowance });
    const exhausted = await state(activated.cookie);
    assert.equal(exhausted.tier, tier, `${tier}: exhausted Buddy quota retains paid Toolkit access`);
    assert.equal(exhausted.remaining, 0);
    assert.equal(exhausted.expired, false);

    for (let device = 2; device <= maxDevices; device++) {
      const restored = await post(recover, 'recover', { code: activated.body.recoveryCode.toLowerCase().replaceAll('-', ''), deviceId: `${tier}-device-${device}` });
      assert.equal(restored.status, 200, `${tier}: device ${device} can recover access`);
      assert.equal(restored.body.tier, tier);
      assert.equal(restored.body.expired, false);
      const restoredState = await state(restored.cookie);
      assert.equal(restoredState.tier, tier, `${tier}: recovered cookie restores paid Toolkit state`);
      assert.equal(restoredState.remaining, 0, `${tier}: recovery does not reset Buddy usage`);
      assert.equal(restoredState.expiresAt, activated.body.expiresAt, `${tier}: recovery does not extend validity`);
      assert.equal(restoredState.deviceCount, device);
    }
    const overLimit = await post(recover, 'recover', { code: activated.body.recoveryCode, deviceId: `${tier}-extra-device` });
    assert.equal(overLimit.status, 403, `${tier}: recovery enforces ${maxDevices}-device limit`);
    assert.equal(overLimit.body.error, 'max_devices_reached');
    assert.equal(overLimit.cookie, undefined);
    const sameDevice = await post(recover, 'recover', { code: activated.body.recoveryCode, deviceId: `${tier}-device-1` });
    assert.equal(sameDevice.status, 200, `${tier}: an already-bound device can recover at the limit`);
    assert.equal((await state(sameDevice.cookie)).deviceCount, maxDevices);

    write(passPath, { ...read(passPath), expiresAt: Date.now() - 1 });
    const expired = await state(activated.cookie);
    assert.equal(expired.tier, 'free', `${tier}: expired pass no longer grants paid access`);
    assert.equal(expired.expired, true);
    const expiredRecovery = await post(recover, 'recover', { code: activated.body.recoveryCode, deviceId: `${tier}-device-1` });
    assert.equal(expiredRecovery.body.expired, true);
    assert.equal((await state(expiredRecovery.cookie)).tier, 'free', `${tier}: recovery cannot reactivate an expired pass`);
  }

  for (const flag of ['refunded', 'disputed']) {
    sales.set(flag, { paid: true, [flag]: true, product_id: env.GUMROAD_TRIP_PRODUCT_ID });
    const rejected = await post(claim, 'claim', { saleId: flag, deviceId: 'test-device' });
    assert.equal(rejected.status, 400, `${flag} sale is rejected`);
    assert.equal(rejected.body.error, 'invalid_sale');
    assert.equal(rejected.cookie, undefined);
  }
  sales.set('unpaid', { paid: false, product_id: env.GUMROAD_TRIP_PRODUCT_ID });
  assert.equal((await post(claim, 'claim', { saleId: 'unpaid', deviceId: 'test-device' })).body.error, 'invalid_sale');
  assert.equal((await post(recover, 'recover', { code: 'ABCD-EFGH-JKLM', deviceId: 'test-device' })).status, 401, 'unknown recovery code is rejected');
  firestoreDown = true;
  assert.deepEqual(await state('ceb_pass=forged.device.signature'), { tier: 'free' });
  // A validly signed but missing pass cannot grant access either.
  const { signSessionToken } = await import('../functions/_shared/session.js');
  const missingCookie = `ceb_pass=${await signSessionToken(env.SESSION_SECRET, 'missing-pass', 'test-device')}`;
  assert.deepEqual(await state(missingCookie), { tier: 'free' }, 'Firestore unavailable fails closed');
  firestoreDown = false;
  assert.deepEqual(await state(missingCookie), { tier: 'free' }, 'missing pass document stays free');
  assert.deepEqual(unexpectedFetches, [], 'every request stayed inside the test doubles');
  console.log('Pass entitlement checks passed (activation, signed sessions, recovery, quota exhaustion, expiration, 14 days, 2/5 devices, 50/200 messages).');
} finally {
  globalThis.fetch = originalFetch;
}
