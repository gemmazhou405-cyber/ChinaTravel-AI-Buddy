// Free Buddy AI quota: FREE_CHAT_DAILY_LIMIT messages per salted IP hash per UTC day.
//
// Firestore is the only source of truth. Each count changes inside a Firestore read-write
// transaction, so concurrent requests cannot both take the last slot (KV has no atomic
// operations and caches reads, including "not found", for up to 60 seconds, so it could not
// enforce the limit). If Firestore is unavailable we refuse the request rather than give away
// unmetered AI calls.
//
// Documents: freeChatUsage/{ipHash}_{YYYYMMDD}
//   { ipHash, day, count, limit, createdAt, updatedAt, expireAt }
// expireAt is a timestamp two days after the UTC day ends; a Firestore TTL policy on
// freeChatUsage.expireAt can delete old documents automatically.
import { batchGetDocs, beginTransaction, commitTransaction, docName, toFirestoreDocument } from './firestore.js';

export const FREE_CHAT_DAILY_LIMIT = 10;
export const FREE_CHAT_COLLECTION = 'freeChatUsage';
const MAX_TRANSACTION_ATTEMPTS = 3;
const DAY_MS = 86_400_000;
const RETENTION_AFTER_DAY_MS = 2 * DAY_MS;

export function utcDayKey(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 10).replace(/-/g, '');
}

export function freeChatUsagePath(ipHash, now = Date.now()) {
  return `${FREE_CHAT_COLLECTION}/${ipHash}_${utcDayKey(now)}`;
}

function endOfUtcDay(now) {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  return start.getTime() + DAY_MS;
}

function isRetryableConflict(error) {
  const message = String(error?.message);
  return message.includes(':409:') || message.includes('ABORTED');
}

function hasFirestoreConfig(env) {
  return Boolean(env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY);
}

async function runTransaction(env, path, update) {
  for (let attempt = 1; attempt <= MAX_TRANSACTION_ATTEMPTS; attempt += 1) {
    const transaction = await beginTransaction(env);
    const docs = await batchGetDocs(env, [path], transaction);
    const current = docs.get(path) || null;
    const { write, result } = update(current);
    try {
      // Committing (even with no writes) releases the transaction's locks.
      await commitTransaction(env, transaction, write ? [{
        update: { name: docName(env, path), ...toFirestoreDocument(write) },
      }] : []);
      return result;
    } catch (error) {
      if (!isRetryableConflict(error) || attempt === MAX_TRANSACTION_ATTEMPTS) throw error;
    }
  }
  throw new Error('free_chat_quota_transaction_failed');
}

/**
 * Reserve one free message for this IP hash today.
 * Returns { ok: true, path, count } | { ok: false, code: 'free_quota_exhausted' }
 *       | { ok: false, code: 'free_quota_unavailable' } (Firestore missing or failing).
 */
export async function reserveFreeChatMessage(env, ipHash, { now = Date.now(), limit = FREE_CHAT_DAILY_LIMIT } = {}) {
  if (!hasFirestoreConfig(env)) return { ok: false, code: 'free_quota_unavailable' };
  const path = freeChatUsagePath(ipHash, now);
  try {
    return await runTransaction(env, path, (current) => {
      const count = Number(current?.count) || 0;
      if (count >= limit) return { write: null, result: { ok: false, code: 'free_quota_exhausted', count } };
      return {
        write: {
          ipHash,
          day: utcDayKey(now),
          count: count + 1,
          limit,
          createdAt: current?.createdAt || now,
          updatedAt: now,
          expireAt: new Date(endOfUtcDay(now) + RETENTION_AFTER_DAY_MS),
        },
        result: { ok: true, path, count: count + 1 },
      };
    });
  } catch (error) {
    console.error('[free-chat-quota] reserve_failed', String(error?.message).slice(0, 80));
    return { ok: false, code: 'free_quota_unavailable' };
  }
}

/** Give back one message reserved by reserveFreeChatMessage (the AI never started answering). */
export async function releaseFreeChatMessage(env, reservation, { now = Date.now() } = {}) {
  if (!reservation?.ok || !reservation.path) return false;
  try {
    return await runTransaction(env, reservation.path, (current) => {
      const count = Number(current?.count) || 0;
      if (!current || count <= 0) return { write: null, result: false };
      return {
        write: { ...current, count: count - 1, updatedAt: now, expireAt: new Date(current.expireAt || endOfUtcDay(now) + RETENTION_AFTER_DAY_MS) },
        result: true,
      };
    });
  } catch (error) {
    console.error('[free-chat-quota] release_failed', String(error?.message).slice(0, 80));
    return false;
  }
}

/**
 * Previous KV counter, kept only as a reference fallback. It is NOT used for any decision:
 * KV reads are cached (including misses) for up to 60 seconds and get-then-put is not atomic,
 * so bursts were never counted. Do not call this to allow or block requests.
 */
export async function legacyKvFreeQuotaCheck(env, ipHash, limit = FREE_CHAT_DAILY_LIMIT) {
  if (!env.RATE_LIMIT) return { ok: true };
  const today = new Date().toISOString().slice(0, 10);
  const key = `free:ip:${ipHash}:${today}`;
  const count = Number(await env.RATE_LIMIT.get(key).catch(() => null) ?? 0);
  if (count >= limit) {
    return { ok: false, status: 429, code: 'free_quota_exhausted' };
  }
  await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: 25 * 60 * 60 }).catch(() => {});
  return { ok: true };
}
