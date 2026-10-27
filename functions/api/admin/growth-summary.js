import { queryNumericRangePage } from '../../_shared/firestore.js';
import { buildGrowthSummary, GROWTH_COLLECTIONS, MAX_RECORDS_PER_COLLECTION, PAGE_SIZE } from '../../_shared/growth-summary.js';

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

async function readRecent(env, config, from, to, signal) {
  const records = [];
  let cursor = null;
  let readTime = null;
  do {
    const page = await queryNumericRangePage(env, {
      ...config, from, to, cursor, readTime, signal,
      limit: Math.min(PAGE_SIZE, MAX_RECORDS_PER_COLLECTION - records.length + 1),
    });
    if (records.length + page.documents.length > MAX_RECORDS_PER_COLLECTION) {
      const error = new Error('safety_cap_reached');
      error.collection = config.collectionId;
      throw error;
    }
    records.push(...page.documents);
    cursor = page.cursor;
    readTime = page.readTime;
  } while (cursor);
  return records;
}

export async function onRequest({ request, env }) {
  const token = /^Bearer\s+(\S+)\s*$/i.exec(request.headers.get('Authorization') || '')?.[1];
  if (!token || typeof env.ADMIN_SECRET !== 'string' || !env.ADMIN_SECRET || token !== env.ADMIN_SECRET) {
    return json({ error: 'unauthorized' }, 401, { 'WWW-Authenticate': 'Bearer' });
  }
  if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405, { Allow: 'GET' });
  const now = Date.now();
  const controller = new AbortController();
  const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(25000)]);
  try {
    const entries = await Promise.all(GROWTH_COLLECTIONS.map(async (config) => [
      config.collectionId, await readRecent(env, config, now - 30 * 86_400_000, now, signal),
    ]));
    return json(buildGrowthSummary(Object.fromEntries(entries), now));
  } catch (error) {
    controller.abort();
    // Never expose Firestore response bodies, cursors, identifiers or credentials.
    if (error?.message === 'safety_cap_reached') {
      return json({ complete: false, error: 'report_incomplete', reason: 'safety_cap_reached', collection: error.collection, maxRecordsPerCollection: MAX_RECORDS_PER_COLLECTION }, 503);
    }
    return json({ complete: false, error: 'growth_summary_unavailable' }, 503);
  }
}
