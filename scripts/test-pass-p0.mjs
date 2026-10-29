// Security regressions against the real handlers. Every provider/database request is
// intercepted in memory; these tests never contact Gumroad, Firestore or Buddy AI.
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { onRequestPost as claim } from '../functions/api/claim.js';
import { onRequestPost as recover } from '../functions/api/recover.js';
import { onRequestGet as getPass } from '../functions/api/pass.js';
import { onRequestGet as getDevices } from '../functions/api/devices/index.js';
import { onRequestPost as removeDevice } from '../functions/api/devices/remove.js';
import { onRequestPost as buddy } from '../functions/api/buddy/chat.js';
import { onRequestPost as gumroadWebhook } from '../functions/api/gumroad/webhook.js';
import { createDoc, getDoc, getDocSnapshot, patchDoc, fromFirestoreDocument, toFirestoreDocument } from '../functions/_shared/firestore.js';
import { sha256hex, signSessionToken } from '../functions/_shared/session.js';

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});
const baseEnv = {
  FIREBASE_PROJECT_ID: 'local-pass-p0',
  FIREBASE_CLIENT_EMAIL: 'fixture@local-pass-p0.iam.gserviceaccount.com',
  FIREBASE_PRIVATE_KEY: privateKey,
  SESSION_SECRET: 'local-pass-p0-secret', GUMROAD_ACCESS_TOKEN: 'local-provider-token',
  GUMROAD_WEBHOOK_SECRET: 'local-webhook-secret',
  GUMROAD_TRIP_PRODUCT_ID: 'fixture-trip', GUMROAD_GROUP_PRODUCT_ID: 'fixture-group',
  COZE_WORKER_URL: 'https://buddy.fixture.test', COZE_BOT_ID: 'fixture-bot-1234',
  COZE_INTERNAL_SECRET: 'local-worker-secret',
};
const root = `projects/${baseEnv.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const docs = new Map();
const sales = new Map();
const unexpected = [];
const gumroadLookupPaths = [];
let revision = 0;
let readDown = false;
let orderReadDown = false;
let writeDown = false;
let storeFault = null;
let aiCalls = 0;
let envelopeSuccess = true;
let queryBarrier = null;
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const pathOf = (name) => name.replace(`${root}/`, '');
const read = (path) => fromFirestoreDocument(docs.get(path));
function write(path, value) {
  const updateTime = new Date(1_700_000_000_000 + ++revision).toISOString();
  docs.set(path, { name: `${root}/${path}`, ...toFirestoreDocument(value), updateTime });
}
function reset() {
  docs.clear(); sales.clear(); unexpected.length = 0;
  gumroadLookupPaths.length = 0;
  readDown = false; orderReadDown = false; writeDown = false; aiCalls = 0; envelopeSuccess = true;
  queryBarrier = null;
  storeFault = null;
}
function overlapQueries(count = 2) {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  queryBarrier = { remaining: count, gate, release };
}
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init = {}) => {
  const url = new URL(String(input));
  if (url.hostname === 'oauth2.googleapis.com') return json({ access_token: 'local-oauth', expires_in: 3600 });
  if (url.hostname === 'api.gumroad.com') {
    gumroadLookupPaths.push(url.pathname);
    const sale = sales.get(decodeURIComponent(url.pathname.split('/').pop()));
    return sale ? json({ success: envelopeSuccess, sale }) : json({ success: false }, 404);
  }
  if (url.hostname === 'buddy.fixture.test') {
    aiCalls++;
    return json({ reply: 'Local fixture reply.' });
  }
  if (url.hostname !== 'firestore.googleapis.com') {
    unexpected.push(`${init.method || 'GET'} ${url.origin}${url.pathname}`);
    throw new Error('Unexpected request outside in-memory providers');
  }
  const method = init.method || 'GET';
  const body = init.body ? JSON.parse(init.body) : {};
  const path = decodeURIComponent(url.pathname.split('/documents')[1] || '').replace(/^\//, '');
  if (storeFault?.method === method && storeFault.path === path) {
    if (storeFault.kind === 'network') throw new TypeError('synthetic network failure');
    if (storeFault.kind === 'committed-timeout') {
      write(`${path}/${url.searchParams.get('documentId')}`, fromFirestoreDocument(body));
      throw new DOMException('synthetic response timeout after commit', 'TimeoutError');
    }
    if (storeFault.kind === 'invalid-json') return new Response('{', { status: 200 });
    if (storeFault.kind === 'empty-document') return json({ name: `${root}/passes/empty` });
    if (storeFault.kind === 'wrong-document') return json(toFirestoreDocument({ tier: 'group', gumroadSaleId: 'different-order' }));
    return json({ error: 'synthetic write failure' }, storeFault.status);
  }
  if (url.pathname.endsWith(':runQuery')) {
    if (readDown) return json({ error: 'unavailable' }, 503);
    const { from, where, limit = 100 } = body.structuredQuery;
    const filter = where?.fieldFilter;
    const wanted = filter ? fromFirestoreDocument({ fields: { value: filter.value } }).value : undefined;
    const found = [...docs.entries()].filter(([key, doc]) => key.startsWith(`${from[0].collectionId}/`)
      && (!filter || fromFirestoreDocument(doc)[filter.field.fieldPath] === wanted));
    const rows = found.slice(0, limit).map(([, document]) => ({ document: structuredClone(document) }));
    if (queryBarrier) {
      const barrier = queryBarrier;
      if (--barrier.remaining === 0) { queryBarrier = null; barrier.release(); }
      await barrier.gate;
    }
    return json(rows);
  }
  if (url.pathname.endsWith(':commit')) {
    if (writeDown) return json({ error: 'unavailable' }, 503);
    // Validate every precondition before applying any write, as Firestore does.
    for (const item of body.writes || []) {
      const existing = docs.get(pathOf(item.update?.name || item.delete));
      const precondition = item.currentDocument;
      if (precondition?.exists === false && existing) return json({ error: 'already_exists' }, 409);
      if (precondition?.exists === true && !existing) return json({ error: 'not_found' }, 404);
      if (precondition?.updateTime && existing?.updateTime !== precondition.updateTime) {
        return json({ error: 'failed_precondition' }, 409);
      }
    }
    for (const item of body.writes || []) {
      if (item.delete) { docs.delete(pathOf(item.delete)); continue; }
      const key = pathOf(item.update.name);
      const patch = fromFirestoreDocument(item.update);
      write(key, item.updateMask ? { ...read(key), ...patch } : patch);
    }
    return json({ writeResults: (body.writes || []).map(() => ({ updateTime: new Date(1_700_000_000_000 + revision).toISOString() })) });
  }
  if (method === 'GET') {
    if (readDown || (orderReadDown && path.startsWith('gumroadSales/'))) return json({ error: 'unavailable' }, 503);
    return docs.has(path) ? json(structuredClone(docs.get(path))) : json({}, 404);
  }
  if (writeDown) return json({ error: 'unavailable' }, 503);
  if (method === 'POST') {
    const key = `${path}/${url.searchParams.get('documentId')}`;
    if (docs.has(key)) return json({ error: 'already_exists' }, 409);
    write(key, fromFirestoreDocument(body));
    return json(structuredClone(docs.get(key)));
  }
  if (method === 'PATCH') {
    const existing = docs.get(path);
    const condition = url.searchParams.get('currentDocument.updateTime');
    if (condition && existing?.updateTime !== condition) return json({ error: 'failed_precondition' }, 409);
    write(path, { ...read(path), ...fromFirestoreDocument(body) });
    return json(structuredClone(docs.get(path)));
  }
  throw new Error(`Unsupported in-memory Firestore method ${method}`);
};

async function post(handler, path, body, cookie, env = baseEnv) {
  const response = await handler({ request: new Request(`https://chinaeasebuddy.com/api/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify(body),
  }), env });
  return { status: response.status, body: await response.json(), cookie: response.headers.get('Set-Cookie')?.split(';')[0] };
}
async function get(handler, path, cookie) {
  const response = await handler({ request: new Request(`https://chinaeasebuddy.com/api/${path}`, { headers: cookie ? { Cookie: cookie } : {} }), env: baseEnv });
  return { status: response.status, body: await response.json() };
}
function validSale(tier = 'trip', extra = {}) {
  return { paid: true, product_id: baseEnv[`GUMROAD_${tier.toUpperCase()}_PRODUCT_ID`], product_name: `${tier} fixture`, email: 'fixture@example.test', ...extra };
}
const passesFor = (saleId) => [...docs.entries()].filter(([path, doc]) => path.startsWith('passes/') && fromFirestoreDocument(doc).gumroadSaleId === saleId);
async function activate(saleId = 'fixture-sale', tier = 'trip', deviceId = 'owner-device') {
  sales.set(saleId, validSale(tier));
  const result = await post(claim, 'claim', { saleId, deviceId });
  assert.equal(result.status, 200, 'fixture sale must activate before the security scenario');
  assert.ok(result.cookie, 'fixture activation must set a signed cookie');
  return result;
}
async function removedFixture() {
  const first = await activate();
  const second = await post(claim, 'claim', { saleId: 'fixture-sale', deviceId: 'remaining-device' });
  assert.equal(second.status, 200);
  const removed = await post(removeDevice, 'devices/remove', { deviceId: 'owner-device' }, second.cookie);
  assert.equal(removed.status, 200);
  assert.equal(removed.body.removed, true);
  return { first, second };
}
function revokeOrder(saleId = 'fixture-sale', reason = 'full_refund') {
  const path = `gumroadSales/${saleId}`;
  write(path, {
    ...read(path), accessRevoked: true, accessRevokedAt: Date.now(),
    accessRevocationReason: reason, accessRevocationReference: 'fixture-reviewed-evidence',
    accessRevokedBy: 'fixture-operator',
  });
}
function noGrant(result) {
  assert.ok(result.status >= 400, `request must be rejected, got HTTP ${result.status}`);
  assert.equal(result.cookie, undefined, 'rejected activation must not mint a session cookie');
}
const results = [];
async function test(name, run) {
  reset();
  try { await run(); assert.deepEqual(unexpected, []); results.push({ name, status: 'PASS' }); }
  catch (error) { results.push({ name, status: 'FAIL', reason: String(error.message).split('\n')[0] }); }
}
try {
  await test('missing GET document/snapshot still returns null', async () => {
    assert.equal(await getDoc(baseEnv, 'passes/missing'), null);
    assert.equal(await getDocSnapshot(baseEnv, 'passes/missing'), null);
  });
  for (const status of [404, 403, 503]) {
    for (const method of ['POST', 'PATCH']) {
      await test(`${method} ${status} is a write error, not a missing document`, async () => {
        storeFault = { method, path: method === 'POST' ? 'passes' : 'passes/write-fixture', status };
        await assert.rejects(() => method === 'POST'
          ? createDoc(baseEnv, 'passes', 'write-fixture', { tier: 'trip' })
          : patchDoc(baseEnv, 'passes/write-fixture', { messagesUsed: 1 }),
        new RegExp(`firestore_error:${status}:`));
      });
    }
  }
  for (const fault of [
    { status: 404 }, { status: 403 }, { status: 503 }, { status: 500 },
    { kind: 'network' }, { kind: 'invalid-json' }, { kind: 'empty-document' }, { kind: 'wrong-document' },
  ]) {
    const label = fault.kind || fault.status;
    await test(`first activation ${label}: no success, Cookie or recovery code`, async () => {
      sales.set('creation-failure', validSale());
      storeFault = { method: 'POST', path: 'passes', ...fault };
      const denied = await post(claim, 'claim', { saleId: 'creation-failure', deviceId: 'fixture-device' });
      assert.equal(denied.status, 503);
      noGrant(denied);
      assert.equal(denied.body.error, 'activation_unavailable');
      assert.equal(denied.body.recoveryCode, undefined);
      assert.equal(passesFor('creation-failure').length, 0);
    });
  }
  await test('unknown create outcome: retry reuses committed Pass without resetting it', async () => {
    sales.set('committed-timeout', validSale());
    storeFault = { method: 'POST', path: 'passes', kind: 'committed-timeout' };
    const denied = await post(claim, 'claim', { saleId: 'committed-timeout', deviceId: 'fixture-device' });
    assert.equal(denied.status, 503);
    noGrant(denied);
    assert.equal(denied.body.recoveryCode, undefined);
    const [path] = passesFor('committed-timeout')[0];
    const original = read(path);
    write(path, { ...original, messagesUsed: 9 });
    storeFault = null;
    const retry = await post(claim, 'claim', { saleId: 'committed-timeout', deviceId: 'fixture-device' });
    assert.equal(retry.status, 200);
    assert.equal(retry.body.alreadyClaimed, true);
    assert.equal(passesFor('committed-timeout').length, 1);
    assert.equal(read(path).messagesUsed, 9);
    assert.equal(read(path).expiresAt, original.expiresAt);
    assert.equal(read(path).recoveryCodeHash, original.recoveryCodeHash);
  });
  for (const [tier, cap] of [['trip', 2], ['group', 5]]) {
    await test(`${tier}: same-order device ${cap + 1} rejected`, async () => {
      const saleId = `${tier}-cap-sale`;
      await activate(saleId, tier, 'device-1');
      for (let number = 2; number <= cap; number++) {
        const added = await post(claim, 'claim', { saleId, deviceId: `device-${number}` });
        assert.equal(added.status, 200);
        assert.equal((await get(getPass, 'pass', added.cookie)).body.tier, tier);
      }
      const denied = await post(claim, 'claim', { saleId, deviceId: 'excess-device' });
      noGrant(denied);
      assert.equal(read(passesFor(saleId)[0][0]).devices.length, cap);
    });
  }
  await test('removed cookie: Premium Toolkit state becomes free', async () => {
    const { first } = await removedFixture();
    assert.equal((await get(getPass, 'pass', first.cookie)).body.tier, 'free');
  });
  await test('removed cookie: Buddy rejects before AI or quota use', async () => {
    const { first } = await removedFixture();
    const passPath = passesFor('fixture-sale')[0][0];
    const before = read(passPath).messagesUsed;
    const result = await post(buddy, 'buddy/chat', { requestId: crypto.randomUUID(), message: 'Fixture question', context: [] }, first.cookie);
    assert.ok([401, 403].includes(result.status), `removed session must be unauthorized, got HTTP ${result.status}`);
    assert.equal(aiCalls, 0, 'removed cookie must never reach AI');
    assert.equal(read(passPath).messagesUsed, before);
  });
  await test('removed cookie: device listing rejected', async () => {
    const { first } = await removedFixture();
    assert.equal((await get(getDevices, 'devices', first.cookie)).status, 401);
  });
  await test('removed cookie: cannot remove remaining device', async () => {
    const { first } = await removedFixture();
    noGrant(await post(removeDevice, 'devices/remove', { deviceId: 'remaining-device' }, first.cookie));
    assert.equal(read(passesFor('fixture-sale')[0][0]).devices.length, 1);
  });
  await test('unknown product cannot fall back to a paid tier', async () => {
    sales.set('unknown', validSale('trip', { product_id: 'unrelated-product', product_name: 'Group souvenir' }));
    noGrant(await post(claim, 'claim', { saleId: 'unknown', deviceId: 'fixture-device' }));
    assert.equal(passesFor('unknown').length, 0);
  });
  await test('missing product mapping cannot grant access', async () => {
    sales.set('missing-map', validSale());
    noGrant(await post(claim, 'claim', { saleId: 'missing-map', deviceId: 'fixture-device' }, undefined, { ...baseEnv, GUMROAD_TRIP_PRODUCT_ID: '', GUMROAD_GROUP_PRODUCT_ID: '' }));
    assert.equal(passesFor('missing-map').length, 0);
  });
  await test('ambiguous product mapping cannot grant access', async () => {
    sales.set('ambiguous-map', validSale());
    noGrant(await post(claim, 'claim', { saleId: 'ambiguous-map', deviceId: 'fixture-device' }, undefined, { ...baseEnv, GUMROAD_GROUP_PRODUCT_ID: baseEnv.GUMROAD_TRIP_PRODUCT_ID }));
    assert.equal(passesFor('ambiguous-map').length, 0);
  });
  await test('existing pass tier must match the verified sale product', async () => {
    await activate();
    const path = passesFor('fixture-sale')[0][0];
    write(path, { ...read(path), tier: 'group' });
    noGrant(await post(claim, 'claim', { saleId: 'fixture-sale', deviceId: 'second-device' }));
    assert.equal(read(path).devices.length, 1);
  });
  for (const [tier, allowance, maxDevices, otherTierPermalink] of [['trip', 50, 2, 'mbgkxz'], ['group', 200, 5, 'oentc']]) {
    for (const [label, permalink] of [
      ['original permalink', `Original${tier}Code`],
      ['different custom permalink', `${tier}-custom-slug`],
      ['other-tier name and permalink', otherTierPermalink],
    ]) {
      await test(`${tier}: strict Product ID grants only its tier with ${label}`, async () => {
        const saleId = `${tier}-permalink-contract`;
        sales.set(saleId, validSale(tier, { product_permalink: permalink, product_name: tier === 'trip' ? 'Group Pass fixture' : 'Trip Pass fixture' }));
        const result = await post(claim, 'claim', { saleId, deviceId: 'fixture-device' }, undefined, {
          ...baseEnv, GUMROAD_TRIP_PERMALINK: 'trip-public-slug', GUMROAD_GROUP_PERMALINK: 'group-public-slug',
        });
        assert.equal(result.status, 200);
        assert.ok(result.cookie, 'verified activation must mint a session cookie');
        assert.equal(result.body.tier, tier, 'name and permalink cannot change the ID-derived tier');
        assert.equal(result.body.messageAllowance, allowance);
        assert.equal(result.body.maxDevices, maxDevices);
        assert.equal(passesFor(saleId).length, 1);
        const state = await get(getPass, 'pass', result.cookie);
        assert.equal(state.body.tier, tier);
        assert.equal(state.body.remaining, allowance);
        assert.equal(state.body.maxDevices, maxDevices);
      });
    }
    for (const [label, productId] of [['unknown', 'unrelated-product'], ['near-match', `${baseEnv[`GUMROAD_${tier.toUpperCase()}_PRODUCT_ID`]}-wrong`], ['missing', undefined]]) {
      await test(`${tier}: ${label} Product ID cannot use name or permalink to grant access`, async () => {
        const saleId = `${tier}-${label}-product`;
        sales.set(saleId, validSale(tier, { product_id: productId, product_name: `${tier} Pass fixture`, product_permalink: tier === 'trip' ? 'oentc' : 'mbgkxz' }));
        noGrant(await post(claim, 'claim', { saleId, deviceId: 'fixture-device' }));
        assert.equal(passesFor(saleId).length, 0);
      });
    }
    for (const [label, extra] of [['refunded', { refunded: true }], ['disputed', { disputed: true }], ['chargedback', { chargedback: true }], ['unpaid', { paid: false }], ['non-boolean-paid', { paid: 'false' }]]) {
      await test(`${tier}: ${label} sale cannot grant new access`, async () => {
        const saleId = `${tier}-${label}`;
        sales.set(saleId, validSale(tier, extra));
        noGrant(await post(claim, 'claim', { saleId, deviceId: 'fixture-device' }));
        assert.equal(passesFor(saleId).length, 0);
      });
    }
  }
  await test('provider unsuccessful envelope cannot grant access', async () => {
    sales.set('provider-failure', validSale()); envelopeSuccess = false;
    noGrant(await post(claim, 'claim', { saleId: 'provider-failure', deviceId: 'fixture-device' }));
  });
  await test('sequential same-order activation preserves one pass and expiry', async () => {
    const first = await activate();
    const second = await post(claim, 'claim', { saleId: 'fixture-sale', deviceId: 'owner-device' });
    assert.equal(second.status, 200);
    assert.equal(passesFor('fixture-sale').length, 1);
    assert.equal(second.body.expiresAt, first.body.expiresAt);
  });
  for (const [oldTier, newTier] of [['trip', 'group'], ['trip', 'trip'], ['group', 'trip'], ['group', 'group']]) {
    await test(`${oldTier} to new ${newTier}: independent purchase preserves the old Pass and recovery`, async () => {
      const original = await activate('original-order', oldTier);
      const oldPath = passesFor('original-order')[0][0];
      write(oldPath, { ...read(oldPath), messagesUsed: 7 });
      const oldPass = structuredClone(read(oldPath));
      sales.set('new-order', validSale(newTier));
      const purchased = await post(claim, 'claim', { saleId: 'new-order', deviceId: 'owner-device' }, original.cookie);
      assert.equal(purchased.status, 200);
      assert.equal(purchased.body.tier, newTier);
      assert.notEqual(purchased.cookie, original.cookie, 'activating a distinct order returns its own Pass session');
      assert.equal(passesFor('original-order').length, 1);
      assert.equal(passesFor('new-order').length, 1);
      assert.deepEqual(read(oldPath), oldPass, 'new activation cannot transfer/reset old usage, validity, devices or recovery hash');
      const current = await get(getPass, 'pass', purchased.cookie);
      assert.equal(current.body.tier, newTier);
      assert.equal(current.body.messagesUsed, 0);
      assert.equal(current.body.messageAllowance, newTier === 'trip' ? 50 : 200);
      const previous = await get(getPass, 'pass', original.cookie);
      assert.equal(previous.body.tier, oldTier, 'old valid Cookie still refers to its independent Pass');
      assert.equal(previous.body.messagesUsed, 7);
      assert.equal(previous.body.expiresAt, oldPass.expiresAt);
      const recovered = await post(recover, 'recover', { code: original.body.recoveryCode, deviceId: 'owner-device' });
      assert.equal(recovered.status, 200);
      assert.equal(recovered.body.tier, oldTier);
      assert.equal(recovered.body.expiresAt, oldPass.expiresAt);
      assert.deepEqual(read(oldPath), oldPass, 'restoring the already-bound old device cannot reset its rights');
      assert.equal((await get(getPass, 'pass', purchased.cookie)).body.tier, newTier);
    });
  }
  for (const tier of ['trip', 'group']) {
    await test(`${tier}: opaque receipt reference is preserved and encoded for server-side Gumroad lookup`, async () => {
      const saleId = `Receipt_${tier}-OpaqueValue==`;
      const activated = await activate(saleId, tier);
      assert.equal(activated.body.tier, tier);
      assert.deepEqual(gumroadLookupPaths, [`/v2/sales/${encodeURIComponent(saleId)}`]);
      assert.equal(read(passesFor(saleId)[0][0]).gumroadSaleId, saleId);
      assert.equal((await get(getPass, 'pass', activated.cookie)).body.tier, tier);
    });
  }
  await test('concurrent first activation creates only one pass', async () => {
    sales.set('concurrent-sale', validSale('group'));
    overlapQueries();
    const responses = await Promise.all(['first-device', 'second-device'].map((deviceId) => post(claim, 'claim', { saleId: 'concurrent-sale', deviceId })));
    assert.ok(responses.some((result) => result.status === 200));
    assert.equal(passesFor('concurrent-sale').length, 1);
    for (const response of responses.filter((result) => result.cookie)) {
      assert.equal((await get(getPass, 'pass', response.cookie)).body.tier, 'group');
    }
  });
  await test('concurrent claims cannot both take the final device slot', async () => {
    await activate();
    overlapQueries();
    const results = await Promise.all(['claim-A', 'claim-B'].map((deviceId) => post(claim, 'claim', { saleId: 'fixture-sale', deviceId })));
    assert.equal(results.filter((result) => result.cookie).length, 1);
    assert.equal(read(passesFor('fixture-sale')[0][0]).devices.length, 2);
    for (const denied of results.filter((result) => !result.cookie)) noGrant(denied);
  });
  await test('concurrent recoveries cannot both take the final device slot', async () => {
    const first = await activate();
    overlapQueries();
    const results = await Promise.all(['recover-A', 'recover-B'].map((deviceId) => post(recover, 'recover', { code: first.body.recoveryCode, deviceId })));
    assert.equal(results.filter((result) => result.cookie).length, 1);
    assert.equal(read(passesFor('fixture-sale')[0][0]).devices.length, 2);
  });
  await test('failed Firestore read cannot create another pass', async () => {
    await activate(); readDown = true;
    noGrant(await post(claim, 'claim', { saleId: 'fixture-sale', deviceId: 'second-device' }));
    assert.equal(passesFor('fixture-sale').length, 1);
  });
  await test('failed device binding cannot mint a cookie', async () => {
    await activate(); writeDown = true;
    noGrant(await post(claim, 'claim', { saleId: 'fixture-sale', deviceId: 'second-device' }));
  });
  await test('failed first-pass write fails closed with an error response', async () => {
    sales.set('write-failure', validSale()); writeDown = true;
    noGrant(await post(claim, 'claim', { saleId: 'write-failure', deviceId: 'fixture-device' }));
    assert.equal(passesFor('write-failure').length, 0);
  });

  // Manual Firestore revocation is independent of provider retry/event timing.
  for (const reason of ['full_refund', 'dispute']) {
    await test(`manual ${reason}: old Cookie no longer grants Premium Toolkit`, async () => {
      const first = await activate();
      revokeOrder('fixture-sale', reason);
      assert.equal((await get(getPass, 'pass', first.cookie)).body.tier, 'free');
    });
  }
  await test('manual revocation: Buddy rejects before AI or quota use', async () => {
    const first = await activate();
    const passPath = passesFor('fixture-sale')[0][0];
    const before = read(passPath).messagesUsed;
    revokeOrder();
    const denied = await post(buddy, 'buddy/chat', { requestId: crypto.randomUUID(), message: 'Fixture question', context: [] }, first.cookie);
    assert.ok([401, 403].includes(denied.status), `revoked order must be unauthorized, got HTTP ${denied.status}`);
    assert.equal(aiCalls, 0);
    assert.equal(read(passPath).messagesUsed, before);
  });
  await test('manual revocation: recovery code cannot restore paid access', async () => {
    const first = await activate();
    revokeOrder();
    noGrant(await post(recover, 'recover', { code: first.body.recoveryCode, deviceId: 'recovery-device' }));
    assert.equal(read(passesFor('fixture-sale')[0][0]).devices.length, 1);
  });
  await test('manual revocation: original sale cannot create or rebind a Pass', async () => {
    await activate();
    revokeOrder();
    for (const deviceId of ['owner-device', 'new-device']) {
      noGrant(await post(claim, 'claim', { saleId: 'fixture-sale', deviceId }));
    }
    assert.equal(passesFor('fixture-sale').length, 1);
    assert.equal(read(passesFor('fixture-sale')[0][0]).devices.length, 1);
  });
  await test('manual revocation: order block prevents a fresh Pass when no Pass remains', async () => {
    sales.set('blocked-order', validSale());
    revokeOrder('blocked-order');
    noGrant(await post(claim, 'claim', { saleId: 'blocked-order', deviceId: 'new-device' }));
    assert.equal(passesFor('blocked-order').length, 0);
  });
  await test('manual revocation: device management APIs cannot use the old Cookie', async () => {
    const first = await activate();
    revokeOrder();
    noGrant(await get(getDevices, 'devices', first.cookie));
    noGrant(await post(removeDevice, 'devices/remove', { deviceId: 'owner-device' }, first.cookie));
    assert.equal(read(passesFor('fixture-sale')[0][0]).devices.length, 1);
  });
  await test('manual revocation: all historical Passes for the same sale are denied', async () => {
    const first = await activate();
    const original = read(passesFor('fixture-sale')[0][0]);
    write('passes/legacy-duplicate-fixture', { ...original, devices: [{ id: 'legacy-device', boundAt: Date.now(), lastSeenAt: Date.now() }] });
    const legacyCookie = `ceb_pass=${await signSessionToken(baseEnv.SESSION_SECRET, 'legacy-duplicate-fixture', 'legacy-device')}`;
    assert.equal((await get(getPass, 'pass', legacyCookie)).body.tier, 'trip');
    revokeOrder();
    for (const cookie of [first.cookie, legacyCookie]) {
      assert.equal((await get(getPass, 'pass', cookie)).body.tier, 'free');
    }
  });
  await test('manual revocation: provider status change cannot automatically restore access', async () => {
    const first = await activate();
    revokeOrder('fixture-sale', 'dispute');
    sales.set('fixture-sale', validSale('trip', { refunded: false, disputed: false, dispute_won: true }));
    noGrant(await post(claim, 'claim', { saleId: 'fixture-sale', deviceId: 'owner-device' }));
    noGrant(await post(recover, 'recover', { code: first.body.recoveryCode, deviceId: 'owner-device' }));
    assert.equal((await get(getPass, 'pass', first.cookie)).body.tier, 'free');
    assert.equal(read('gumroadSales/fixture-sale').accessRevoked, true);
  });
  await test('manual revocation: duplicate sale webhook preserves the operator block', async () => {
    const first = await activate();
    revokeOrder();
    const form = new FormData();
    for (const [key, value] of Object.entries({ sale_id: 'fixture-sale', email: 'fixture@example.test', product_id: baseEnv.GUMROAD_TRIP_PRODUCT_ID, product_permalink: 'oentc' })) form.set(key, value);
    const response = await gumroadWebhook({ request: new Request(`https://chinaeasebuddy.com/api/gumroad/webhook?secret=${baseEnv.GUMROAD_WEBHOOK_SECRET}`, { method: 'POST', body: form }), env: baseEnv });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).duplicate, true);
    assert.equal(read('gumroadSales/fixture-sale').accessRevoked, true);
    assert.equal((await get(getPass, 'pass', first.cookie)).body.tier, 'free');
  });
  for (const [label, value] of [['null', null], ['zero', 0], ['string-false', 'false']]) {
    await test(`manual revocation: malformed ${label} flag cannot restore access`, async () => {
      const first = await activate();
      revokeOrder();
      write('gumroadSales/fixture-sale', { ...read('gumroadSales/fixture-sale'), accessRevoked: value });
      assert.equal((await get(getPass, 'pass', first.cookie)).body.tier, 'free');
      noGrant(await post(recover, 'recover', { code: first.body.recoveryCode, deviceId: 'owner-device' }));
      noGrant(await post(claim, 'claim', { saleId: 'fixture-sale', deviceId: 'owner-device' }));
    });
  }
  await test('manual revocation: deleted flag with retained audit timestamp cannot restore access', async () => {
    const first = await activate();
    revokeOrder();
    const { accessRevoked, ...audit } = read('gumroadSales/fixture-sale');
    assert.equal(accessRevoked, true);
    assert.ok(audit.accessRevokedAt);
    write('gumroadSales/fixture-sale', audit);
    assert.equal((await get(getPass, 'pass', first.cookie)).body.tier, 'free');
    noGrant(await post(recover, 'recover', { code: first.body.recoveryCode, deviceId: 'owner-device' }));
    noGrant(await post(claim, 'claim', { saleId: 'fixture-sale', deviceId: 'owner-device' }));
  });
  await test('partial refund without an operator block does not automatically revoke access', async () => {
    const first = await activate();
    sales.set('fixture-sale', validSale('trip', { partially_refunded: true, refunded: false }));
    const before = read(passesFor('fixture-sale')[0][0]);
    assert.equal((await get(getPass, 'pass', first.cookie)).body.tier, 'trip');
    const repeated = await post(claim, 'claim', { saleId: 'fixture-sale', deviceId: 'owner-device' });
    assert.equal(repeated.status, 200);
    assert.equal(repeated.body.expiresAt, before.expiresAt);
    assert.equal(passesFor('fixture-sale').length, 1);
  });
  await test('verified manual restoration preserves expiry, usage and the original Pass', async () => {
    const first = await activate();
    const passPath = passesFor('fixture-sale')[0][0];
    write(passPath, { ...read(passPath), messagesUsed: 9 });
    const before = read(passPath);
    revokeOrder('fixture-sale', 'dispute');
    assert.equal((await get(getPass, 'pass', first.cookie)).body.tier, 'free');
    write('gumroadSales/fixture-sale', { ...read('gumroadSales/fixture-sale'), accessRevoked: false, accessRestoredAt: Date.now(), accessRestorationReference: 'fixture-verified-dispute-resolution' });
    const restored = await post(recover, 'recover', { code: first.body.recoveryCode, deviceId: 'owner-device' });
    assert.equal(restored.status, 200);
    assert.equal((await get(getPass, 'pass', restored.cookie)).body.tier, 'trip');
    assert.equal(read(passPath).expiresAt, before.expiresAt);
    assert.equal(read(passPath).messagesUsed, before.messagesUsed);
    assert.equal(passesFor('fixture-sale').length, 1);
  });
  await test('manual restoration cannot extend or reactivate an expired Pass', async () => {
    const first = await activate();
    const passPath = passesFor('fixture-sale')[0][0];
    const expiresAt = Date.now() - 1;
    write(passPath, { ...read(passPath), expiresAt, messagesUsed: 9 });
    revokeOrder('fixture-sale', 'dispute');
    write('gumroadSales/fixture-sale', { ...read('gumroadSales/fixture-sale'), accessRevoked: false, accessRestorationReference: 'fixture-verified-resolution' });
    const restored = await post(recover, 'recover', { code: first.body.recoveryCode, deviceId: 'owner-device' });
    assert.equal((await get(getPass, 'pass', restored.cookie)).body.tier, 'free');
    assert.equal(read(passPath).expiresAt, expiresAt);
    assert.equal(read(passPath).messagesUsed, 9);
    assert.equal(passesFor('fixture-sale').length, 1);
  });
  await test('manual Pass-level block revokes an administrator Pass without a sale', async () => {
    const code = 'ABCD-EFGH-JKLM';
    const path = 'passes/admin-pass-fixture';
    write(path, {
      source: 'admin_activation', tier: 'trip', expiresAt: Date.now() + 86_400_000,
      messagesUsed: 7, messageAllowance: 50,
      devices: [{ id: 'admin-owner-device', boundAt: Date.now(), lastSeenAt: Date.now() }],
      recoveryCodeHash: await sha256hex(code),
    });
    const cookie = `ceb_pass=${await signSessionToken(baseEnv.SESSION_SECRET, 'admin-pass-fixture', 'admin-owner-device')}`;
    assert.equal((await get(getPass, 'pass', cookie)).body.tier, 'trip', 'a legitimate unblocked administrator Pass remains compatible');
    write(path, { ...read(path), accessRevoked: true, accessRevokedAt: Date.now(), accessRevocationReason: 'verified_manual_action' });
    assert.equal((await get(getPass, 'pass', cookie)).body.tier, 'free');
    noGrant(await post(recover, 'recover', { code, deviceId: 'new-admin-device' }));
    const denied = await post(buddy, 'buddy/chat', { requestId: crypto.randomUUID(), message: 'Fixture question', context: [] }, cookie);
    assert.ok([401, 403].includes(denied.status));
    assert.equal(aiCalls, 0);
    assert.equal(read(path).messagesUsed, 7);
  });
  await test('order revocation read failure fails closed for paid state, Buddy and recovery', async () => {
    const first = await activate();
    const before = read(passesFor('fixture-sale')[0][0]).messagesUsed;
    orderReadDown = true;
    assert.equal((await get(getPass, 'pass', first.cookie)).body.tier, 'free');
    noGrant(await post(recover, 'recover', { code: first.body.recoveryCode, deviceId: 'owner-device' }));
    noGrant(await post(claim, 'claim', { saleId: 'fixture-sale', deviceId: 'owner-device' }));
    const denied = await post(buddy, 'buddy/chat', { requestId: crypto.randomUUID(), message: 'Fixture question', context: [] }, first.cookie);
    assert.ok(denied.status >= 400);
    assert.equal(aiCalls, 0);
    assert.equal(read(passesFor('fixture-sale')[0][0]).messagesUsed, before);
  });
  // Explicit diagnostic, not a passing acceptance claim. These known historical
  // cases remain blocking until an authorised legacy-entitlement policy exists.
  if (process.argv.includes('--audit-legacy-duplicates')) {
    console.error('Legacy duplicate audit: unresolved cases; failures must not be reported as accepted. No cloud access.');
    for (const [tier, cap] of [['trip', 2], ['group', 5]]) {
      await test(`UNRESOLVED ${tier}: historical duplicate recovery must respect the order-wide device cap`, async () => {
        const saleId = `legacy-duplicate-${tier}`;
        const first = await activate(saleId, tier, 'original-device-1');
        const cookies = [first.cookie];
        for (let index = 2; index < cap; index++) {
          const result = await post(claim, 'claim', { saleId, deviceId: `original-device-${index}` });
          assert.equal(result.status, 200);
          cookies.push(result.cookie);
        }
        const [originalPath] = passesFor(saleId)[0];
        const original = read(originalPath);
        write(originalPath, { ...original, messagesUsed: 9 });
        const duplicateId = `legacy-${tier}-duplicate`;
        const duplicateCode = 'WXYZ-ABCD-EFGH';
        write(`passes/${duplicateId}`, {
          ...original, messagesUsed: 17, recoveryCodeHash: await sha256hex(duplicateCode),
          devices: [{ id: 'legacy-device', boundAt: Date.now(), lastSeenAt: Date.now() }],
        });
        cookies.push(`ceb_pass=${await signSessionToken(baseEnv.SESSION_SECRET, duplicateId, 'legacy-device')}`);
        const recovered = await post(recover, 'recover', { code: duplicateCode, deviceId: 'additional-legacy-device' });
        if (recovered.cookie) cookies.push(recovered.cookie);
        const states = await Promise.all(cookies.map((cookie) => get(getPass, 'pass', cookie)));
        const activeDevices = states.filter(({ body }) => body.tier === tier).length;
        assert.equal(read(originalPath).messagesUsed, 9, 'audit must not reset the original allowance');
        assert.equal(read(`passes/${duplicateId}`).messagesUsed, 17, 'audit must not reset duplicate usage');
        assert.equal(passesFor(saleId).length, 2, 'audit must not delete history');
        assert.ok(activeDevices <= cap, `same order has ${activeDevices} effective devices; advertised cap is ${cap}`);
      });
    }
  }
} finally {
  globalThis.fetch = originalFetch;
}
for (const result of results) console.log(`${result.status}: ${result.name}${result.reason ? ` — ${result.reason}` : ''}`);
const failed = results.filter(({ status }) => status === 'FAIL').length;
console.log(`Pass P0 backend results: ${results.length - failed} PASS / ${failed} FAIL (${results.length} cases, all requests mocked).`);
if (!process.argv.includes('--audit-legacy-duplicates')) {
  console.log('KNOWN BLOCKER: historical duplicate Pass/device cases remain unresolved; run --audit-legacy-duplicates separately. A passing regression gate is not release approval.');
}
if (failed) process.exitCode = 1;
