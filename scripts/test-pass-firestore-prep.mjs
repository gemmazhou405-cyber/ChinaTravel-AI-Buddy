// Exercise the complete QA runner with a local Google REST double. No real
// Firestore, OAuth, Gumroad or customer request is permitted by this test.
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { toFirestoreDocument } from '../functions/_shared/firestore.js';

const originalFetch = globalThis.fetch;
let forbiddenNetworkCalls = 0;
globalThis.fetch = async () => {
  forbiddenNetworkCalls++;
  throw new Error('real network is forbidden in runner preparation tests');
};

try {
  const { configuration, isQaFirestoreUrl, run } = await import('./test-pass-firestore.mjs');
  const project = 'chinaease-qa-offline-fixture';
  const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });
  const env = configuration({
    CHINAEASE_PASS_TEST_PROJECT_ID: project,
    CHINAEASE_PASS_TEST_CLIENT_EMAIL: `runner@${project}.iam.gserviceaccount.com`,
    CHINAEASE_PASS_TEST_PRIVATE_KEY: privateKey,
    CHINAEASE_PASS_TEST_CONFIRM_PROJECT: project,
  });
  const root = `projects/${project}/databases/(default)/documents/`;
  const docs = new Map();
  const waitingForCreateResponse = new Map();
  const counters = { requests: 0, oauth: 0, passCreates: 0, earlyVisibility: 0, concurrentCreateBarriers: 0, conflicts: 0, deleted: 0 };
  const unrelatedPath = 'passes/unrelated-offline-fixture';
  let revision = 0;
  const json = (body, status = 200) => new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json' },
  });
  const store = (path, fields) => docs.set(path, {
    name: `${root}${path}`,
    fields: structuredClone(fields),
    updateTime: new Date(1_700_000_000_000 + ++revision).toISOString(),
  });
  store(unrelatedPath, toFirestoreDocument({
    gumroadSaleId: 'outside-the-run', tier: 'trip', expiresAt: Date.now() + 86_400_000,
    devices: [{ id: 'unrelated-device', boundAt: 1, lastSeenAt: 1 }], messagesUsed: 23,
  }).fields);
  const unrelatedBefore = JSON.stringify(docs.get(unrelatedPath));
  const copy = (path, observeRead = true) => {
    const observed = observeRead && waitingForCreateResponse.get(path);
    if (observed) { counters.earlyVisibility++; observed(); }
    return structuredClone(docs.get(path));
  };
  const pathOf = (name) => {
    assert.ok(typeof name === 'string' && name.startsWith(root), 'all writes must target the fixture project');
    const path = name.slice(root.length);
    assert.notEqual(path, unrelatedPath, 'an unrelated document must never be changed or deleted');
    return path;
  };
  const applyFields = (path, document, mask) => {
    if (!mask) return store(path, document.fields || {});
    const fields = structuredClone(docs.get(path)?.fields || {});
    for (const field of mask.fieldPaths || []) {
      assert.ok(!field.includes('.'), 'this fixture expects only the runner\'s top-level field masks');
      if (Object.hasOwn(document.fields || {}, field)) fields[field] = structuredClone(document.fields[field]);
      else delete fields[field];
    }
    store(path, fields);
  };

  async function fakeGoogle(input, init = {}) {
    counters.requests++;
    const url = new URL(String(input));
    const method = init.method || 'GET';
    assert.equal(init.redirect, 'error', 'every simulated Google request must prohibit redirects');
    if (url.href === 'https://oauth2.googleapis.com/token') {
      assert.equal(method, 'POST');
      counters.oauth++;
      return json({ access_token: 'offline-fixture-only', expires_in: 3600 });
    }
    assert.ok(isQaFirestoreUrl(url, project), 'only the explicit QA project may reach the fake transport');
    const suffix = url.pathname.split('/documents')[1] || '';
    const path = decodeURIComponent(suffix).replace(/^\//, '');
    const body = init.body ? JSON.parse(init.body) : {};
    if (path === ':runQuery') {
      assert.equal(method, 'POST');
      const { from, where, limit = 100 } = body.structuredQuery;
      assert.equal(from.length, 1);
      assert.equal(from[0].collectionId, 'passes');
      const filter = where.fieldFilter;
      assert.equal(filter.op, 'EQUAL');
      const rows = [...docs.entries()].filter(([key, document]) => key.startsWith('passes/')
        && JSON.stringify(document.fields?.[filter.field.fieldPath]) === JSON.stringify(filter.value));
      return json(rows.slice(0, limit).map(([key]) => ({ document: copy(key) })));
    }
    if (path === ':commit') {
      assert.equal(method, 'POST');
      assert.ok(body.writes?.length);
      for (const write of body.writes) {
        const key = pathOf(write.update?.name || write.delete);
        const existing = docs.get(key);
        if (write.currentDocument?.exists === false && existing) {
          return json({ error: { status: 'ALREADY_EXISTS' } }, 409);
        }
        if ((write.currentDocument?.exists === true && !existing)
          || (write.currentDocument?.updateTime && existing?.updateTime !== write.currentDocument.updateTime)) {
          counters.conflicts++;
          return json({ error: { status: 'FAILED_PRECONDITION' } }, 412);
        }
      }
      for (const write of body.writes) {
        const key = pathOf(write.update?.name || write.delete);
        if (write.delete) {
          if (docs.delete(key)) counters.deleted++;
        } else applyFields(key, write.update, write.updateMask);
      }
      return json({ writeResults: body.writes.map(() => ({ updateTime: new Date(1_700_000_000_000 + revision).toISOString() })) });
    }
    if (method === 'POST') {
      assert.ok(['passes', 'gumroadSales'].includes(path));
      const id = url.searchParams.get('documentId');
      assert.ok(id);
      const key = `${path}/${id}`;
      assert.notEqual(key, unrelatedPath);
      if (docs.has(key)) return json({ error: { status: 'ALREADY_EXISTS' } }, 409);
      store(key, body.fields || {});
      const responseDocument = structuredClone(docs.get(key));
      if (path === 'passes') {
        counters.passCreates++;
        if (body.fields?.gumroadSaleId?.stringValue?.endsWith('-first')) {
          // Hold only concurrent first-claim responses until another GET/query
          // actually observes the committed document. No scheduler delay is used.
          let release;
          const observed = new Promise((resolve) => { release = resolve; });
          waitingForCreateResponse.set(key, release);
          counters.concurrentCreateBarriers++;
          let timer;
          try {
            await Promise.race([observed, new Promise((_, reject) => {
              timer = setTimeout(() => reject(new Error('concurrent create was not observed before its response')), 5000);
            })]);
          } finally {
            clearTimeout(timer);
            waitingForCreateResponse.delete(key);
          }
        }
      }
      return json(responseDocument);
    }
    assert.notEqual(path, unrelatedPath, 'the runner must not directly read an unrelated fixture');
    if (method === 'GET') return docs.has(path) ? json(copy(path)) : json({ error: { status: 'NOT_FOUND' } }, 404);
    if (method === 'PATCH') {
      applyFields(path, body, { fieldPaths: url.searchParams.getAll('updateMask.fieldPaths') });
      return json(copy(path, false));
    }
    assert.fail('unsupported simulated Google REST operation');
  }

  const result = await run(env, { transport: fakeGoogle, mode: 'offline-simulation' });
  assert.equal(result.ok, true, 'all runner scenarios and cleanup must succeed locally');
  assert.equal(result.mode, 'offline-simulation');
  assert.equal(result.uncertainWrites, false);
  assert.ok(result.evidence.some(({ source }) => source === 'INJECTED'), 'fault injection must be labelled separately');
  assert.ok(result.evidence.some(({ source }) => source === 'SIMULATED_FIRESTORE'), 'simulated persistence must be identified');
  assert.ok(result.evidence.every(({ source }) => source !== 'QA_FIRESTORE'), 'offline tests cannot claim real database acceptance');
  assert.ok(counters.oauth > 0 && counters.passCreates > 0 && counters.deleted > 0);
  assert.equal(counters.concurrentCreateBarriers, 2, 'both tier-specific concurrent creates must use an observation barrier');
  assert.equal(waitingForCreateResponse.size, 0, 'no create response may remain blocked');
  assert.ok(counters.earlyVisibility > 0, 'creation must be observable before its response reaches the creator');
  assert.ok(counters.conflicts > 0, 'simulated CAS races must exercise retry handling');
  assert.equal(forbiddenNetworkCalls, 0, 'no real network request may be attempted');
  assert.deepEqual([...docs.keys()], [unrelatedPath], 'cleanup may remove only this run\'s synthetic documents');
  assert.equal(JSON.stringify(docs.get(unrelatedPath)), unrelatedBefore, 'the unrelated fixture must remain unchanged');
  console.log(`PASS: offline runner preparation (${result.evidence.length} labelled scenarios); deterministic create-observation barriers, CAS retries and scoped cleanup verified. Real Firestore/IAM remain NOT VERIFIED.`);
} finally {
  globalThis.fetch = originalFetch;
}
