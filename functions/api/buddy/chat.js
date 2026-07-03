import { verifyFirebaseRequest } from '../../_shared/firebase-auth.js';
import { clientIp, errorResponse, jsonResponse, optionsResponse, parseJson, withCors } from '../../_shared/http.js';
import {
  batchGetDocs,
  beginTransaction,
  commitTransaction,
  createWrite,
  updateWrite,
} from '../../_shared/firestore.js';

const REQUEST_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_MESSAGE_CHARS = 1200;
const MAX_CONTEXT_ITEMS = 6;
const MAX_CONTEXT_CHARS = 3000;
const UPSTREAM_TIMEOUT_MS = 35000;
const MAX_REPLY_CHARS = 5000;
const USER_RATE_WINDOW_MS = 10000;
const USER_RATE_LIMIT = 3;
const IP_RATE_WINDOW_MS = 60000;
const IP_RATE_LIMIT = 40;

const FREE_LIMITS = {
  plan: 'free',
  buddyAiQuotaTotal: 5,
  dailyBuddyAiLimit: 5,
};

const PAID_LIMITS = {
  trip: {
    plan: 'trip',
    buddyAiQuotaTotal: 50,
    dailyBuddyAiLimit: 20,
  },
  group: {
    plan: 'group',
    buddyAiQuotaTotal: 200,
    dailyBuddyAiLimit: 50,
  },
};

const userHits = new Map();
const ipHits = new Map();

function safeRequestId(requestId) {
  return typeof requestId === 'string' ? requestId.slice(0, 8) : 'unknown';
}

function safeUserId(uid) {
  return typeof uid === 'string' ? uid.slice(0, 8) : 'unknown';
}

function logBuddy(level, event, fields = {}) {
  const safeFields = Object.fromEntries(
    Object.entries(fields).filter(([key]) => !/token|secret|message|reply|email/i.test(key)),
  );
  const logger = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info;
  logger(`[buddy.chat] ${event}`, safeFields);
}

function pruneHits(map, key, windowMs) {
  const now = Date.now();
  const hits = (map.get(key) || []).filter((ts) => now - ts < windowMs);
  map.set(key, hits);
  return hits;
}

function checkRateLimit(map, key, windowMs, limit) {
  if (!key) return true;
  const hits = pruneHits(map, key, windowMs);
  if (hits.length >= limit) return false;
  hits.push(Date.now());
  map.set(key, hits);
  return true;
}

function normalizeContext(context) {
  if (context === undefined) return [];
  if (!Array.isArray(context) || context.length > MAX_CONTEXT_ITEMS) return null;
  let total = 0;
  const normalized = [];
  for (const item of context) {
    if (typeof item === 'string') {
      const text = item.trim();
      total += text.length;
      normalized.push(text.slice(0, 600));
    } else if (item && typeof item === 'object') {
      const role = item.role === 'user' || item.role === 'buddy' ? item.role : 'user';
      const text = typeof item.text === 'string' ? item.text.trim() : '';
      total += text.length;
      normalized.push({ role, text: text.slice(0, 600) });
    } else {
      return null;
    }
  }
  return total <= MAX_CONTEXT_CHARS ? normalized : null;
}

function effectiveLimits(userDoc, now = Date.now()) {
  const rawPlan = userDoc?.plan;
  const activePaid = ['trip', 'group'].includes(rawPlan)
    && (!userDoc.planExpiresAt || userDoc.planExpiresAt > now);
  return activePaid ? PAID_LIMITS[rawPlan] : FREE_LIMITS;
}

function isDailyExpired(resetAt, now) {
  return !resetAt || now - resetAt >= 24 * 60 * 60 * 1000;
}

async function reserveUsage(env, auth, requestId) {
  const usagePath = `usageRequests/${auth.uid}_${requestId}`;
  const userPath = `users/${auth.uid}`;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const transaction = await beginTransaction(env);
    const docs = await batchGetDocs(env, [userPath, usagePath], transaction);
    const userDoc = docs.get(userPath);
    const usageDoc = docs.get(usagePath);
    const now = Date.now();

    if (!userDoc) {
      return { kind: 'error', status: 401, code: 'auth_required' };
    }

    if (usageDoc) {
      if (usageDoc.status === 'completed') {
        return { kind: 'duplicate_completed' };
      }
      if (usageDoc.status === 'reserved') {
        return { kind: 'duplicate_processing' };
      }
      return { kind: 'duplicate_failed', reason: usageDoc.failureReason || 'previous_request_failed' };
    }

    const limits = effectiveLimits(userDoc, now);
    const resetDaily = isDailyExpired(userDoc.dailyResetAt, now);
    const dailyBefore = resetDaily ? 0 : Number(userDoc.dailyBuddyAiUsed || 0);
    const totalBefore = Number(userDoc.buddyAiQuotaUsed || 0);

    if (totalBefore >= limits.buddyAiQuotaTotal) {
      return {
        kind: 'error',
        status: 403,
        code: 'quota_exhausted',
        quotaType: 'total',
        limit: limits.buddyAiQuotaTotal,
        plan: limits.plan,
      };
    }

    if (dailyBefore >= limits.dailyBuddyAiLimit) {
      return {
        kind: 'error',
        status: 403,
        code: 'quota_exhausted',
        quotaType: 'daily',
        limit: limits.dailyBuddyAiLimit,
        plan: limits.plan,
      };
    }

    const nextDailyResetAt = resetDaily ? now : (userDoc.dailyResetAt || now);
    const usageRequest = {
      userId: auth.uid,
      requestId,
      type: 'buddy_ai',
      status: 'reserved',
      createdAt: now,
      plan: limits.plan,
      quotaBefore: totalBefore,
      quotaAfter: totalBefore + 1,
      dailyBefore,
      dailyAfter: dailyBefore + 1,
      dailyResetAtBefore: userDoc.dailyResetAt ?? null,
      dailyResetAtAfter: nextDailyResetAt,
    };

    const writes = [
      updateWrite(env, userPath, {
        buddyAiQuotaUsed: totalBefore + 1,
        dailyBuddyAiUsed: dailyBefore + 1,
        dailyResetAt: nextDailyResetAt,
      }, ['buddyAiQuotaUsed', 'dailyBuddyAiUsed', 'dailyResetAt']),
      createWrite(env, usagePath, usageRequest),
    ];

    try {
      await commitTransaction(env, transaction, writes);
      return { kind: 'reserved', usagePath, usage: usageRequest, userDoc, limits };
    } catch (error) {
      if (attempt === 2 || !String(error?.message || '').includes('409')) throw error;
    }
  }

  return { kind: 'error', status: 409, code: 'duplicate_request' };
}

async function markCompleted(env, usagePath) {
  const now = Date.now();
  const transaction = await beginTransaction(env);
  await batchGetDocs(env, [usagePath], transaction);
  await commitTransaction(env, transaction, [
    updateWrite(env, usagePath, {
      status: 'completed',
      completedAt: now,
    }, ['status', 'completedAt']),
  ]);
}

async function rollbackUsage(env, auth, usagePath, reason) {
  const userPath = `users/${auth.uid}`;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const transaction = await beginTransaction(env);
    const docs = await batchGetDocs(env, [userPath, usagePath], transaction);
    const userDoc = docs.get(userPath);
    const usageDoc = docs.get(usagePath);
    if (!userDoc || !usageDoc || usageDoc.status !== 'reserved') return;

    const nextUser = {
      buddyAiQuotaUsed: Math.max(0, Number(userDoc.buddyAiQuotaUsed || 0) - 1),
      dailyBuddyAiUsed: Math.max(0, Number(userDoc.dailyBuddyAiUsed || 0) - 1),
      dailyResetAt: usageDoc.dailyResetAtBefore ?? null,
    };

    try {
      await commitTransaction(env, transaction, [
        updateWrite(env, userPath, nextUser, ['buddyAiQuotaUsed', 'dailyBuddyAiUsed', 'dailyResetAt']),
        updateWrite(env, usagePath, {
          status: 'failed',
          failedAt: Date.now(),
          failureReason: reason,
        }, ['status', 'failedAt', 'failureReason']),
      ]);
      return;
    } catch (error) {
      if (attempt === 2 || !String(error?.message || '').includes('409')) throw error;
    }
  }
}

async function callCoze(env, auth, message, context) {
  if (!env.COZE_WORKER_URL || !env.COZE_BOT_ID) {
    throw new Error('service_unavailable');
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort('upstream_timeout'), UPSTREAM_TIMEOUT_MS);
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (env.COZE_INTERNAL_SECRET) {
      headers['X-ChinaEase-Internal-Token'] = env.COZE_INTERNAL_SECRET;
    }
    const cozePayload = {
      message,
      context,
      botId: env.COZE_BOT_ID,
      userId: auth.uid,
      bot_id: env.COZE_BOT_ID,
      user_id: auth.uid,
      stream: false,
      additional_messages: [
        {
          role: 'user',
          content: message,
          content_type: 'text',
        },
      ],
    };
    // The worker only routes POST /coze; COZE_WORKER_URL may be set with or without the path.
    const workerBase = env.COZE_WORKER_URL.replace(/\/+$/, '');
    const workerEndpoint = workerBase.endsWith('/coze') ? workerBase : `${workerBase}/coze`;
    const res = await fetch(workerEndpoint, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify(cozePayload),
    });
    const responseText = await res.text();
    if (!res.ok) {
      logBuddy('warn', 'upstream_non_ok', {
        status: res.status,
        responseLength: responseText.length,
        contentType: res.headers.get('Content-Type') || 'unknown',
      });
      throw new Error(`upstream_error:${res.status}`);
    }
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      logBuddy('warn', 'upstream_non_json', {
        status: res.status,
        responseLength: responseText.length,
        contentType: res.headers.get('Content-Type') || 'unknown',
      });
      throw new Error('upstream_error:non_json');
    }
    const reply = extractReply(data);
    if (!reply) throw new Error('upstream_empty_reply');
    return reply.slice(0, MAX_REPLY_CHARS);
  } catch (error) {
    if (error?.name === 'AbortError' || error === 'upstream_timeout') {
      throw new Error('upstream_timeout');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function extractReply(data) {
  const candidates = [
    data?.reply,
    data?.answer,
    data?.message,
    data?.data?.reply,
    data?.data?.answer,
    data?.data?.message,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }

  const messages = Array.isArray(data?.messages)
    ? data.messages
    : Array.isArray(data?.data?.messages)
      ? data.data.messages
      : [];
  const answer = [...messages].reverse().find((item) => {
    const role = String(item?.role || '').toLowerCase();
    const type = String(item?.type || '').toLowerCase();
    return role === 'assistant' || type === 'answer';
  });
  if (typeof answer?.content === 'string' && answer.content.trim()) return answer.content.trim();

  return '';
}

export async function onRequestOptions({ request, env }) {
  return optionsResponse(request, env);
}

async function handlePost(request, env) {
  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > 15000) {
    return errorResponse(request, env, 413, 'invalid_request', 'Request body is too large.');
  }

  let auth;
  try {
    auth = await verifyFirebaseRequest(request, env);
  } catch {
    return errorResponse(request, env, 401, 'auth_required', 'Please sign in to use Buddy AI.');
  }

  if (!auth.emailVerified) {
    return errorResponse(request, env, 403, 'email_verification_required', 'Please verify your email to use Buddy AI.');
  }

  if (!checkRateLimit(userHits, auth.uid, USER_RATE_WINDOW_MS, USER_RATE_LIMIT)
      || !checkRateLimit(ipHits, clientIp(request), IP_RATE_WINDOW_MS, IP_RATE_LIMIT)) {
    return errorResponse(request, env, 429, 'rate_limited', 'Please wait a moment before trying again.');
  }

  const body = await parseJson(request);
  if (!body || typeof body !== 'object') {
    return errorResponse(request, env, 400, 'invalid_request', 'Invalid request.');
  }

  const requestId = typeof body.requestId === 'string' ? body.requestId.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const context = normalizeContext(body.context);

  if (!REQUEST_ID_RE.test(requestId) || !message || context === null) {
    return errorResponse(request, env, 400, 'invalid_request', 'Invalid request.');
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return errorResponse(request, env, 413, 'message_too_long', 'Message is too long.');
  }

  if (!env.COZE_WORKER_URL || !env.COZE_BOT_ID) {
    logBuddy('error', 'missing_coze_config', {
      hasWorkerUrl: Boolean(env.COZE_WORKER_URL),
      hasBotId: Boolean(env.COZE_BOT_ID),
      hasInternalSecret: Boolean(env.COZE_INTERNAL_SECRET),
    });
    return errorResponse(request, env, 503, 'service_unavailable', 'Buddy is temporarily unavailable. Please try again later.');
  }

  let reservation;
  try {
    logBuddy('info', 'reserve_start', { requestId: safeRequestId(requestId), uid: safeUserId(auth.uid) });
    reservation = await reserveUsage(env, auth, requestId);
  } catch (error) {
    logBuddy('error', 'reserve_failed', {
      requestId: safeRequestId(requestId),
      uid: safeUserId(auth.uid),
      errorCode: error instanceof Error ? error.message.split(':')[0] : 'unknown',
    });
    return errorResponse(request, env, 503, 'upstream_error', 'Buddy is temporarily unavailable.');
  }

  if (reservation.kind === 'duplicate_completed') {
    return withCors(jsonResponse({
      status: 'completed',
      duplicate: true,
      message: 'This request was already completed. Please send a new message if you need more help.',
    }), request, env);
  }
  if (reservation.kind === 'duplicate_processing') {
    return errorResponse(request, env, 409, 'duplicate_request', 'This request is still processing.');
  }
  if (reservation.kind === 'duplicate_failed') {
    return errorResponse(request, env, 409, 'duplicate_request', 'This request already failed. Please try again with a new request.');
  }
  if (reservation.kind === 'error') {
    const payload = {
      error: reservation.code,
      message: reservation.code === 'quota_exhausted' ? 'Buddy AI quota exhausted.' : 'Unable to process request.',
      quotaType: reservation.quotaType,
      limit: reservation.limit,
      plan: reservation.plan,
    };
    return withCors(jsonResponse(payload, { status: reservation.status || 400 }), request, env);
  }

  try {
    const reply = await callCoze(env, auth, message, context);
    await markCompleted(env, reservation.usagePath);
    logBuddy('info', 'completed', {
      requestId: safeRequestId(requestId),
      uid: safeUserId(auth.uid),
      plan: reservation.limits.plan,
    });
    return withCors(jsonResponse({
      status: 'completed',
      reply,
      usage: {
        plan: reservation.limits.plan,
        buddyAiQuotaUsed: reservation.usage.quotaAfter,
        buddyAiQuotaTotal: reservation.limits.buddyAiQuotaTotal,
        dailyBuddyAiUsed: reservation.usage.dailyAfter,
        dailyBuddyAiLimit: reservation.limits.dailyBuddyAiLimit,
      },
    }), request, env);
  } catch (error) {
    const reason = error instanceof Error && error.message === 'upstream_timeout'
      ? 'upstream_timeout'
      : error instanceof Error && error.message === 'service_unavailable'
        ? 'service_unavailable'
        : 'upstream_error';
    logBuddy(reason === 'upstream_error' ? 'warn' : 'error', 'failed', {
      requestId: safeRequestId(requestId),
      uid: safeUserId(auth.uid),
      reason,
      errorCode: error instanceof Error ? error.message.split(':').slice(0, 2).join(':') : 'unknown',
    });
    try {
      await rollbackUsage(env, auth, reservation.usagePath, reason);
    } catch {
      // Usage rollback failure is intentionally not exposed with internal details.
    }
    return errorResponse(
      request,
      env,
      reason === 'upstream_timeout' ? 504 : reason === 'service_unavailable' ? 503 : 502,
      reason,
      reason === 'upstream_timeout'
        ? 'Buddy timed out. Please try again.'
        : 'Buddy is temporarily unavailable. Please try again later.',
    );
  }
}

export async function onRequestPost({ request, env }) {
  try {
    return await handlePost(request, env);
  } catch (error) {
    logBuddy('error', 'unhandled_exception', {
      errorCode: error instanceof Error ? error.message.split(':')[0] : 'unknown',
    });
    return errorResponse(request, env, 500, 'server_error', 'Buddy is temporarily unavailable. Please try again later.');
  }
}
