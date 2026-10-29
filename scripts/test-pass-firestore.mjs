// Opt-in cloud QA only. Default/--self-test never make a network request.
// Use a dedicated, empty QA project and a service account with access to that project only.
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { onRequestPost as claim } from '../functions/api/claim.js';
import { onRequestPost as recover } from '../functions/api/recover.js';
import { onRequestPost as removeDevice } from '../functions/api/devices/remove.js';
import { onRequestGet as getPass } from '../functions/api/pass.js';
import { commitWrites, createDoc, fromFirestoreDocument, getDoc, getDocSnapshot, patchDoc, queryCollection } from '../functions/_shared/firestore.js';
import { sha256hex } from '../functions/_shared/session.js';

const PREFIX = 'CHINAEASE_PASS_TEST_';
const REQUIRED = ['PROJECT_ID', 'CLIENT_EMAIL', 'PRIVATE_KEY', 'CONFIRM_PROJECT'];
const PRODUCTION_PROJECT = 'chinaease-buddy';

export function configuration(source) {
  const value = Object.fromEntries(REQUIRED.map((name) => [name, source[`${PREFIX}${name}`]?.trim() || '']));
  assert.ok(REQUIRED.every((name) => value[name]), 'dedicated QA configuration is incomplete');
  assert.notEqual(value.PROJECT_ID, PRODUCTION_PROJECT, 'production is forbidden');
  assert.match(value.PROJECT_ID, /^chinaease-(?:qa|test)-[a-z0-9][a-z0-9-]*$/, 'use a dedicated chinaease-qa-* or chinaease-test-* project');
  assert.equal(value.CONFIRM_PROJECT, value.PROJECT_ID, 'explicit project confirmation must match');
  assert.ok(value.CLIENT_EMAIL.endsWith(`@${value.PROJECT_ID}.iam.gserviceaccount.com`), 'service account must belong to the QA project');
  return {
    FIREBASE_PROJECT_ID: value.PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: value.CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: value.PRIVATE_KEY,
    SESSION_SECRET: crypto.randomUUID(),
    GUMROAD_ACCESS_TOKEN: 'mock-only-no-gumroad-access',
    GUMROAD_TRIP_PRODUCT_ID: 'qa-trip-fixture',
    GUMROAD_GROUP_PRODUCT_ID: 'qa-group-fixture',
  };
}

export function isQaFirestoreUrl(url, project) {
  const base = `/v1/projects/${project}/databases/(default)/documents`;
  return url.protocol === 'https:' && url.hostname === 'firestore.googleapis.com'
    && !url.port && !url.username && !url.password && !url.hash
    && (url.pathname === base || url.pathname.startsWith(`${base}/`)
      || url.pathname === `${base}:commit` || url.pathname === `${base}:runQuery`);
}

async function main() {
  if (process.argv.slice(2).some((arg) => !['--self-test', '--run'].includes(arg))
    || process.argv.slice(2).length > 1) {
    console.error('NOT VERIFIED: use no flag, --self-test, or --run separately. No network used.');
    process.exitCode = 2;
    return;
  }
  if (process.argv.includes('--self-test')) {
    const fixture = Object.fromEntries(REQUIRED.map((name) => [`${PREFIX}${name}`, 'fixture']));
    fixture[`${PREFIX}PROJECT_ID`] = fixture[`${PREFIX}CONFIRM_PROJECT`] = 'chinaease-qa-fixture';
    fixture[`${PREFIX}CLIENT_EMAIL`] = 'runner@chinaease-qa-fixture.iam.gserviceaccount.com';
    assert.equal(configuration(fixture).FIREBASE_PROJECT_ID, 'chinaease-qa-fixture');
    for (const input of [
      {},
      { FIREBASE_PROJECT_ID: 'chinaease-qa-fixture', FIREBASE_CLIENT_EMAIL: 'generic', FIREBASE_PRIVATE_KEY: 'generic' },
      { ...fixture, [`${PREFIX}PROJECT_ID`]: PRODUCTION_PROJECT, [`${PREFIX}CONFIRM_PROJECT`]: PRODUCTION_PROJECT },
      { ...fixture, [`${PREFIX}CONFIRM_PROJECT`]: 'different-project' },
      { ...fixture, [`${PREFIX}CLIENT_EMAIL`]: 'runner@chinaease-buddy.iam.gserviceaccount.com' },
      { ...fixture, [`${PREFIX}PROJECT_ID`]: 'arbitrary-shared-project' },
    ]) assert.throws(() => configuration(input));
    const base = 'https://firestore.googleapis.com/v1/projects/';
    assert.ok(isQaFirestoreUrl(new URL(`${base}chinaease-qa-fixture/databases/(default)/documents/passes/x`), 'chinaease-qa-fixture'));
    assert.equal(isQaFirestoreUrl(new URL(`${base}chinaease-buddy/databases/(default)/documents/passes/x`), 'chinaease-qa-fixture'), false);
    assert.equal(isQaFirestoreUrl(new URL('https://api.gumroad.com/v2/sales/x'), 'chinaease-qa-fixture'), false);
    for (const suffix of ['documents-elsewhere/passes/x', 'documents:delete']) {
      assert.equal(isQaFirestoreUrl(new URL(`${base}chinaease-qa-fixture/databases/(default)/${suffix}`), 'chinaease-qa-fixture'), false);
    }
    assert.equal(isQaFirestoreUrl(new URL(`${base}chinaease-qa-fixture/databases/other/documents/passes/x`), 'chinaease-qa-fixture'), false);
    console.log('PASS: QA-only project, confirmation, service-account and URL guards; generic/production credentials rejected. No network used.');
    const simulated = spawnSync(process.execPath, [fileURLToPath(new URL('./test-pass-firestore-prep.mjs', import.meta.url))], {
      stdio: 'inherit', env: { PATH: process.env.PATH }, timeout: 60_000,
    });
    if (simulated.status !== 0) process.exitCode = 1;
  } else if (!process.argv.includes('--run')) {
    console.log(JSON.stringify({
      status: 'NOT VERIFIED', networkUsed: false,
      configurationPresent: Object.fromEntries(REQUIRED.map((name) => [`${PREFIX}${name}`, Boolean(process.env[`${PREFIX}${name}`])])),
      next: 'Configure a dedicated QA project, then explicitly run this script with --run.',
    }));
  } else {
    let env;
    try { env = configuration(process.env); }
    catch { console.error('NOT VERIFIED: missing or unsafe dedicated QA configuration. No network used.'); process.exitCode = 2; }
    if (env && !(await run(env)).ok) process.exitCode = 1;
  }
}

export async function run(env, { transport = globalThis.fetch, mode = 'real-qa' } = {}) {
  assert.ok(['real-qa', 'offline-simulation'].includes(mode), 'explicit QA evidence mode required');
  if (mode === 'offline-simulation') assert.notEqual(transport, globalThis.fetch, 'offline mode requires an in-memory transport');
  assert.match(env.FIREBASE_PROJECT_ID, /^chinaease-(?:qa|test)-[a-z0-9][a-z0-9-]*$/, 'production and shared projects are forbidden');
  assert.ok(env.FIREBASE_CLIENT_EMAIL.endsWith(`@${env.FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`), 'QA service account required');
  const root = `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/`;
  const namespace = `pass-qa-${crypto.randomUUID()}`;
  console.log(`Synthetic QA run prefix [${mode}]: ${namespace}`);
  const sales = new Map();
  const recoveryHashes = new Set();
  const created = new Set();
  const attemptedPasses = new Set();
  const attemptedOrders = new Set();
  const knownPasses = new Map();
  const knownOrders = new Set();
  const pendingHandlers = new Set();
  const originalFetch = globalThis.fetch;
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  let gate = null;
  let fault = null;
  let stage = 'setup';
  let uncertainWrites = false;
  const evidence = [];
  function passed(label, source = 'firestore') {
    const kind = source === 'injected' ? 'INJECTED' : mode === 'real-qa' ? 'QA_FIRESTORE' : 'SIMULATED_FIRESTORE';
    evidence.push({ label, source: kind });
    console.log(`PASS [${kind}]: ${label}`);
  }
  function rememberOwned(document) {
    if (!document?.name) return;
    assert.ok(document.name.startsWith(root), 'response outside the selected QA database');
    const path = document.name.slice(root.length);
    const data = fromFirestoreDocument(document);
    if (knownOrders.has(path)) {
      assert.equal(data?.qaRun, namespace, 'order response must belong to this run');
    } else {
      assert.ok(attemptedPasses.has(path) && knownPasses.has(path), 'only registered synthetic Pass responses may be used');
      assert.equal(data?.gumroadSaleId, knownPasses.get(path), 'Pass response must belong to this run');
    }
    created.add(path);
  }
  async function ensureOwned(path) {
    if (!created.has(path) && attemptedPasses.has(path)) {
      // Another handler can observe a committed create before its response returns.
      // Verify ownership through the guarded GET; never permit attempted paths alone.
      const stored = await getDoc(env, path);
      assert.equal(stored?.gumroadSaleId, knownPasses.get(path), 'unconfirmed Pass ownership');
    }
    assert.ok(created.has(path), 'updates/cleanup require confirmed ownership by this run');
  }

  // Hold the first two competing writes until both old snapshots have been read.
  function overlap(kind) {
    let release;
    const promise = new Promise((resolve) => { release = resolve; });
    gate = { kind, remaining: 2, promise, release };
  }
  async function waitForCompetitor(kind) {
    if (gate?.kind !== kind) return;
    const current = gate;
    if (--current.remaining === 0) { gate = null; current.release(); }
    let timer;
    try { await Promise.race([current.promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('QA concurrency barrier timed out')), 15000); })]); }
    finally { clearTimeout(timer); }
  }

  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    if (url.protocol === 'https:' && url.hostname === 'api.gumroad.com') {
      const sale = sales.get(decodeURIComponent(url.pathname.split('/').pop()));
      return sale ? json({ success: true, sale }) : json({ success: false }, 404);
    }
    if (url.href === 'https://oauth2.googleapis.com/token' && init.method === 'POST') return transport(input, { ...init, redirect: 'error' });
    assert.ok(isQaFirestoreUrl(url, env.FIREBASE_PROJECT_ID), 'network outside the explicit QA project is forbidden');
    const path = decodeURIComponent(url.pathname.split('/documents')[1] || '').replace(/^\//, '');
    const body = init.body ? JSON.parse(init.body) : {};
    const method = init.method || 'GET';
    let createdPath = null;
    if (path === ':runQuery') {
      const query = body.structuredQuery;
      const filter = query?.where?.fieldFilter;
      assert.equal(query?.from?.[0]?.collectionId, 'passes');
      assert.equal(filter?.op, 'EQUAL');
      assert.ok((filter?.field?.fieldPath === 'gumroadSaleId' && sales.has(filter.value.stringValue))
        || (filter?.field?.fieldPath === 'recoveryCodeHash' && recoveryHashes.has(filter.value.stringValue)), 'only this run\'s synthetic orders/recovery codes may be queried');
    } else if (path === ':commit') {
      assert.ok(body.writes?.length, 'an explicit write list is required');
      for (const write of body.writes) {
        const name = write.update?.name || write.delete;
        assert.ok(name?.startsWith(root), 'write outside the selected QA database');
        await ensureOwned(name.slice(root.length));
      }
      if (body.writes.some((write) => write.update)) await waitForCompetitor('devices');
    } else if (method === 'POST' && ['passes', 'gumroadSales'].includes(path)) {
      const id = url.searchParams.get('documentId');
      const saleId = path === 'passes' ? body.fields?.gumroadSaleId?.stringValue : id;
      assert.ok(id && sales.has(saleId), 'only this run\'s synthetic order documents may be created');
      createdPath = `${path}/${id}`;
      if (path === 'passes') {
        assert.equal(knownPasses.get(createdPath), saleId, 'Pass ID must be derived from this synthetic order');
        attemptedPasses.add(createdPath);
        await waitForCompetitor('create');
      } else {
        assert.ok(knownOrders.has(createdPath), 'order must be preregistered');
        attemptedOrders.add(createdPath);
      }
    } else if (method === 'GET') {
      assert.ok(knownPasses.has(path) || knownOrders.has(path), 'reads may only address exact preregistered synthetic documents');
    } else if (method === 'PATCH') {
      assert.ok(created.has(path), 'patch may only touch a document created by this run');
    } else assert.fail('unsupported QA Firestore operation');
    const matchesFault = fault && fault.method === method && fault.path === path
      && (!fault.documentId || fault.documentId === url.searchParams.get('documentId'));
    if (matchesFault) {
      fault.hits++;
      if (fault.kind === 'http') return json({ error: 'injected_failure' }, fault.status);
      if (fault.kind === 'network') throw new TypeError('injected QA network failure');
      if (fault.kind === 'invalid-json') return new Response('{', { status: 200 });
      if (fault.kind === 'empty-document') return json({});
    }
    const response = await transport(input, { ...init, redirect: 'error' });
    if (response.ok) {
      if (path === ':runQuery') {
        for (const row of await response.clone().json()) if (row.document) rememberOwned(row.document);
      } else if ((method === 'GET' && (attemptedPasses.has(path) || attemptedOrders.has(path))) || createdPath) {
        rememberOwned(await response.clone().json());
      }
    }
    if (matchesFault && fault.kind === 'committed-timeout' && response.ok) {
      throw new DOMException('injected timeout after a confirmed synthetic create', 'TimeoutError');
    }
    return response;
  };

  function post(handler, body, cookie) {
    const pending = (async () => {
      const response = await handler({ request: new Request('https://chinaease-qa.invalid/api/fixture', {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify(body),
      }), env });
      return { status: response.status, body: await response.json(), cookie: response.headers.get('Set-Cookie')?.split(';')[0] };
    })();
    pendingHandlers.add(pending);
    pending.then(() => pendingHandlers.delete(pending), () => pendingHandlers.delete(pending));
    return pending;
  }
  async function state(cookie) {
    const response = await getPass({ request: new Request('https://chinaease-qa.invalid/api/pass', { headers: { Cookie: cookie } }), env });
    return response.json();
  }
  async function order(tier, suffix) {
    const saleId = `${namespace}-${tier}-${suffix}`;
    sales.set(saleId, { paid: true, product_id: env[`GUMROAD_${tier.toUpperCase()}_PRODUCT_ID`], email: 'qa-fixture@example.test' });
    knownOrders.add(`gumroadSales/${saleId}`);
    knownPasses.set(`passes/sale-${await sha256hex(saleId)}`, saleId);
    await createDoc(env, 'gumroadSales', saleId, { saleId, tier, status: 'received', receivedAt: Date.now(), qaRun: namespace });
    return saleId;
  }
  let failure = false;
  try {
    stage = 'missing-document GET';
    const missingSale = await order('trip', 'missing-read');
    const missingPath = `passes/sale-${await sha256hex(missingSale)}`;
    assert.equal(await getDoc(env, missingPath), null);
    assert.equal(await getDocSnapshot(env, missingPath), null);
    passed(stage);

    for (const spec of [
      { label: 'create-404', kind: 'http', status: 404 },
      { label: 'create-403', kind: 'http', status: 403 },
      { label: 'create-503', kind: 'http', status: 503 },
      { label: 'create-500', kind: 'http', status: 500 },
      { label: 'create-network', kind: 'network' },
      { label: 'create-invalid-json', kind: 'invalid-json' },
      { label: 'create-empty-document', kind: 'empty-document' },
    ]) {
      stage = spec.label;
      const saleId = await order('trip', spec.label);
      const id = `sale-${await sha256hex(saleId)}`;
      fault = { method: 'POST', path: 'passes', documentId: id, hits: 0, ...spec };
      const denied = await post(claim, { saleId, deviceId: 'qa-failed-create' });
      assert.equal(fault.hits, 1, 'the intended synthetic create must receive the injection');
      fault = null;
      assert.equal(denied.status, 503);
      assert.equal(denied.body.error, 'activation_unavailable');
      assert.equal(denied.cookie, undefined);
      assert.equal(denied.body.recoveryCode, undefined);
      assert.equal(await getDoc(env, `passes/${id}`), null, 'failed create must not leave a Pass');
      assert.equal((await queryCollection(env, 'passes', 'gumroadSaleId', saleId, 2)).length, 0);
      passed(stage, 'injected');
    }

    stage = 'committed create response timeout and idempotent retry';
    const timedOutSale = await order('trip', 'committed-timeout');
    const timedOutId = `sale-${await sha256hex(timedOutSale)}`;
    fault = { method: 'POST', path: 'passes', documentId: timedOutId, hits: 0, kind: 'committed-timeout' };
    const uncertain = await post(claim, { saleId: timedOutSale, deviceId: 'qa-timeout-owner' });
    assert.equal(fault.hits, 1);
    fault = null;
    assert.equal(uncertain.status, 503);
    assert.equal(uncertain.cookie, undefined);
    assert.equal(uncertain.body.recoveryCode, undefined);
    const persisted = await getDoc(env, `passes/${timedOutId}`);
    await patchDoc(env, `passes/${timedOutId}`, { messagesUsed: 9 });
    const retried = await post(claim, { saleId: timedOutSale, deviceId: 'qa-timeout-owner' });
    assert.equal(retried.status, 200);
    assert.equal(retried.body.alreadyClaimed, true);
    const afterRetry = await getDoc(env, `passes/${timedOutId}`);
    assert.equal(afterRetry.messagesUsed, 9);
    assert.equal(afterRetry.expiresAt, persisted.expiresAt);
    assert.equal(afterRetry.recoveryCodeHash, persisted.recoveryCodeHash);
    assert.equal((await queryCollection(env, 'passes', 'gumroadSaleId', timedOutSale, 2)).length, 1);
    passed(stage, 'injected');

    for (const [tier, cap] of [['trip', 2], ['group', 5]]) {
      stage = `${tier} concurrent activation and ${cap}-device cap`;
      const saleId = await order(tier, 'first');
      overlap('create');
      const attempts = await Promise.all(Array.from({ length: cap + 2 }, (_, index) => post(claim, { saleId, deviceId: `qa-device-${index}` })));
      const accepted = attempts.filter((result) => result.status === 200);
      assert.equal(accepted.length, cap, `${tier}: exactly the advertised device capacity may activate`);
      assert.ok(attempts.filter((result) => result.status !== 200).every((result) => !result.cookie));
      const passes = await queryCollection(env, 'passes', 'gumroadSaleId', saleId, 20);
      assert.equal(passes.length, 1, `${tier}: parallel first claims create one pass`);
      assert.equal(passes[0].devices.length, cap);
      for (const result of accepted) assert.equal((await state(result.cookie)).tier, tier);
      passed(stage);
      stage = `${tier} device removal, old Cookie and recovery code`;
      const code = accepted.find((result) => result.body.recoveryCode)?.body.recoveryCode;
      assert.ok(code, 'the initial creator supplies a recovery code');
      recoveryHashes.add(await sha256hex(code));
      const owner = accepted[0];
      const target = accepted[1];
      const targetId = target.cookie.split('.')[1];
      assert.equal((await post(removeDevice, { deviceId: targetId }, owner.cookie)).body.removed, true);
      assert.equal((await state(target.cookie)).tier, 'free', 'removed cookie no longer grants paid state');
      assert.equal((await post(recover, { code, deviceId: 'qa-recovered-device' })).status, 200);
      assert.equal((await post(recover, { code, deviceId: 'qa-over-limit-device' })).status, 403);
      passed(stage);

      stage = `${tier} claim/recovery last-slot competition`;
      const finalSale = await order(tier, 'last-slot');
      const initial = await post(claim, { saleId: finalSale, deviceId: 'qa-owner' });
      assert.equal(initial.status, 200);
      const finalCode = initial.body.recoveryCode;
      recoveryHashes.add(await sha256hex(finalCode));
      for (let index = 1; index < cap - 1; index++) assert.equal((await post(recover, { code: finalCode, deviceId: `qa-before-${index}` })).status, 200);
      overlap('devices');
      const last = await Promise.all([
        post(claim, { saleId: finalSale, deviceId: 'qa-last-claim' }),
        post(recover, { code: finalCode, deviceId: 'qa-last-recover' }),
      ]);
      assert.equal(last.filter((result) => result.status === 200).length, 1, `${tier}: concurrent claim/recovery share the last slot`);
      assert.ok(last.filter((result) => result.status !== 200).every((result) => !result.cookie));
      const current = await getDoc(env, `passes/${initial.cookie.slice('ceb_pass='.length).split('.')[0]}`);
      assert.equal(current.devices.length, cap);
      passed(stage);

      for (const reason of ['full_refund', 'dispute']) {
        stage = `${tier} manual ${reason} revocation`;
        const revokedSale = reason === 'full_refund' ? finalSale : await order(tier, 'dispute');
        const activated = reason === 'full_refund' ? initial : await post(claim, { saleId: revokedSale, deviceId: 'qa-owner' });
        assert.equal(activated.status, 200);
        const revokedCode = reason === 'full_refund' ? finalCode : activated.body.recoveryCode;
        recoveryHashes.add(await sha256hex(revokedCode));
        await patchDoc(env, `gumroadSales/${revokedSale}`, { accessRevoked: true, accessRevocationReason: reason, accessRevokedAt: Date.now() });
        assert.equal((await state(activated.cookie)).tier, 'free');
        for (const rejected of [
          await post(recover, { code: revokedCode, deviceId: 'qa-owner' }),
          await post(claim, { saleId: revokedSale, deviceId: 'qa-owner' }),
        ]) {
          assert.equal(rejected.status, 403);
          assert.equal(rejected.cookie, undefined, 'revocation denial must not issue a new cookie');
        }
        passed(stage);
      }
    }

    stage = 'failed device write cannot mint Cookie or consume a slot';
    const bindingSale = await order('trip', 'failed-binding');
    const binding = await post(claim, { saleId: bindingSale, deviceId: 'qa-binding-owner' });
    assert.equal(binding.status, 200);
    recoveryHashes.add(await sha256hex(binding.body.recoveryCode));
    fault = { method: 'POST', path: ':commit', kind: 'http', status: 503, hits: 0 };
    const deniedBinding = await post(recover, { code: binding.body.recoveryCode, deviceId: 'qa-binding-denied' });
    assert.equal(fault.hits, 1);
    fault = null;
    assert.equal(deniedBinding.status, 503);
    assert.equal(deniedBinding.cookie, undefined);
    assert.equal((await state(binding.cookie)).deviceCount, 1);
    passed(stage, 'injected');
  } catch {
    failure = true;
    console.error(`FAIL: QA stage ${stage}. No credentials or response bodies are printed.`);
  } finally {
    fault = null;
    gate?.release();
    await Promise.allSettled([...pendingHandlers]);
    for (const path of [...attemptedPasses, ...attemptedOrders]) {
      if (created.has(path)) continue;
      try { await getDoc(env, path); } // A guarded read confirms ownership or absence.
      catch { uncertainWrites = true; }
    }
    try {
      if (created.size) await commitWrites(env, [...created].map((path) => ({ delete: `${root}${path}` })));
      console.log(`QA cleanup [${mode}]: ${created.size} documents confirmed as owned by this run removed.`);
    } catch {
      failure = true;
      console.error('QA cleanup did not complete.');
    }
    globalThis.fetch = originalFetch;
  }
  if (uncertainWrites) failure = true;
  if (failure) console.error(`NOT VERIFIED: inspect synthetic run prefix ${namespace} in the dedicated QA project only; unknown writes must not be assumed cleaned.`);
  else console.log(mode === 'real-qa'
    ? 'PASS: real QA Firestore scenarios completed; INJECTED cases are simulated failures. Gumroad remained mocked.'
    : 'PASS: runner simulation only. Real Firestore, IAM and payment acceptance remain NOT VERIFIED.');
  return { ok: !failure, mode, evidence, uncertainWrites };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
