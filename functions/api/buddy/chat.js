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
const TOTAL_REQUEST_BUDGET_MS = 21000;
const WORKER_MIN_TIMEOUT_MS = 5000;
const WORKER_MAX_TIMEOUT_MS = 14000;
const POST_WORKER_BUFFER_MS = 3500;
const CLEANUP_TIMEOUT_MS = 2500;
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

function remainingMs(deadlineAt) {
  return Math.max(0, deadlineAt - Date.now());
}

function timeoutError() {
  return new Error('upstream_timeout');
}

function assertTimeRemaining(deadlineAt, minimumMs = 1000) {
  if (remainingMs(deadlineAt) < minimumMs) throw timeoutError();
}

async function withTimeout(promise, timeoutMs, label) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(label)), Math.max(1, timeoutMs));
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function isLocalRequest(request) {
  const { hostname } = new URL(request.url);
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost');
}

function safeBotId(botId) {
  if (typeof botId !== 'string') return '';
  return botId.trim();
}

function validBotId(botId) {
  const value = safeBotId(botId);
  if (!value) return false;
  if (/^(0|undefined|null|nan)$/i.test(value)) return false;
  if (value.length < 8 || value.length > 80) return false;
  return /^[A-Za-z0-9_-]+$/.test(value);
}

function cozeConfigStatus(request, env) {
  const hasWorkerUrl = Boolean(env.COZE_WORKER_URL);
  const botId = safeBotId(env.COZE_BOT_ID);
  const hasInternalSecret = Boolean(env.COZE_INTERNAL_SECRET);
  if (!hasWorkerUrl || !validBotId(botId)) {
    return {
      ok: false,
      code: 'coze_configuration_error',
      providerCode: !hasWorkerUrl ? 'missing_worker_url' : 'invalid_bot_id',
    };
  }
  if (!hasInternalSecret && !isLocalRequest(request)) {
    return {
      ok: false,
      code: 'coze_configuration_error',
      providerCode: 'missing_internal_secret',
    };
  }
  return { ok: true, botId, hasInternalSecret };
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
        return { kind: 'duplicate_completed', reply: usageDoc.reply || '' };
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

async function markCompleted(env, usagePath, reply) {
  const now = Date.now();
  const transaction = await beginTransaction(env);
  await batchGetDocs(env, [usagePath], transaction);
  await commitTransaction(env, transaction, [
    updateWrite(env, usagePath, {
      status: 'completed',
      completedAt: now,
      reply: reply.slice(0, MAX_REPLY_CHARS),
    }, ['status', 'completedAt', 'reply']),
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

    const currentTotal = Number(userDoc.buddyAiQuotaUsed || 0);
    const currentDaily = Number(userDoc.dailyBuddyAiUsed || 0);
    const currentResetAt = userDoc.dailyResetAt ?? null;
    const nextUser = {
      buddyAiQuotaUsed: currentTotal >= Number(usageDoc.quotaAfter || 0)
        ? Math.max(Number(usageDoc.quotaBefore || 0), currentTotal - 1)
        : currentTotal,
      dailyBuddyAiUsed: currentResetAt === (usageDoc.dailyResetAtAfter ?? null) && currentDaily >= Number(usageDoc.dailyAfter || 0)
        ? Math.max(Number(usageDoc.dailyBefore || 0), currentDaily - 1)
        : currentDaily,
      dailyResetAt: currentResetAt,
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

async function callCoze(env, auth, message, context, deadlineAt) {
  if (!env.COZE_WORKER_URL || !validBotId(env.COZE_BOT_ID)) {
    throw new Error('service_unavailable');
  }
  const availableForWorker = remainingMs(deadlineAt) - POST_WORKER_BUFFER_MS;
  if (availableForWorker < WORKER_MIN_TIMEOUT_MS) throw timeoutError();
  const workerTimeoutMs = Math.min(WORKER_MAX_TIMEOUT_MS, Math.max(WORKER_MIN_TIMEOUT_MS, availableForWorker));
  const fetchTimeoutMs = Math.max(1000, Math.min(workerTimeoutMs + 1200, remainingMs(deadlineAt) - 1500));
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (env.COZE_INTERNAL_SECRET) headers['X-ChinaEase-Internal-Token'] = env.COZE_INTERNAL_SECRET;
    headers['X-ChinaEase-Timeout-Ms'] = String(workerTimeoutMs);
    const cozePayload = {
      message,
      context,
      botId: safeBotId(env.COZE_BOT_ID),
      userId: auth.uid,
      bot_id: safeBotId(env.COZE_BOT_ID),
      user_id: auth.uid,
      stream: false,
      additional_messages: [
        {
          role: 'user',
          content: message,
          content_type: 'text',
        },
      ],
      timeoutMs: workerTimeoutMs,
    };
    // The worker only routes POST /coze; COZE_WORKER_URL may be set with or without the path.
    const workerBase = env.COZE_WORKER_URL.replace(/\/+$/, '');
    const workerEndpoint = workerBase.endsWith('/coze') ? workerBase : `${workerBase}/coze`;
    const res = await fetch(workerEndpoint, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(fetchTimeoutMs),
      body: JSON.stringify(cozePayload),
    });
    const responseText = await res.text();
    if (!res.ok) {
      let errorPayload = {};
      try {
        errorPayload = responseText ? JSON.parse(responseText) : {};
      } catch {
        errorPayload = {};
      }
      const providerCode = errorPayload.code || errorPayload.error || `http_${res.status}`;
      logBuddy('warn', 'upstream_non_ok', {
        status: res.status,
        providerCode,
        responseLength: responseText.length,
        contentType: res.headers.get('Content-Type') || 'unknown',
      });
      if (errorPayload.error === 'upstream_timeout') throw new Error('upstream_timeout');
      if (errorPayload.error === 'coze_configuration_error' || providerCode === 4200) {
        throw new Error(`service_unavailable:${providerCode}`);
      }
      throw new Error(`upstream_error:${providerCode}`);
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
    if (error?.name === 'AbortError' || error?.name === 'TimeoutError' || error?.message === 'upstream_timeout') {
      throw timeoutError();
    }
    throw error;
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

async function handlePost(request, env, deadlineAt) {
  assertTimeRemaining(deadlineAt, 1500);
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

  const cozeConfig = cozeConfigStatus(request, env);
  if (!cozeConfig.ok) {
    logBuddy('error', 'missing_coze_config', {
      providerCode: cozeConfig.providerCode,
      hasWorkerUrl: Boolean(env.COZE_WORKER_URL),
      hasBotId: Boolean(env.COZE_BOT_ID),
      hasInternalSecret: Boolean(env.COZE_INTERNAL_SECRET),
    });
    return withCors(jsonResponse({
      error: 'service_unavailable',
      providerCode: cozeConfig.providerCode,
      message: 'Buddy is temporarily unavailable. Please try again later.',
    }, { status: 503 }), request, env);
  }

  assertTimeRemaining(deadlineAt, 9000);
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
      reply: reservation.reply || 'This request was already completed. Please send a new message if you need more help.',
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
    const reply = await callCoze(env, auth, message, context, deadlineAt);
    assertTimeRemaining(deadlineAt, 1500);
    const completionBudget = Math.max(500, Math.min(CLEANUP_TIMEOUT_MS, remainingMs(deadlineAt) - 500));
    await withTimeout(markCompleted(env, reservation.usagePath, reply), completionBudget, 'completion_timeout');
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
      const cleanupBudget = Math.max(500, Math.min(CLEANUP_TIMEOUT_MS, remainingMs(deadlineAt) - 500));
      await withTimeout(rollbackUsage(env, auth, reservation.usagePath, reason), cleanupBudget, 'rollback_timeout');
    } catch (rollbackError) {
      // Usage rollback failure is intentionally not exposed with internal details.
      logBuddy('warn', 'rollback_not_completed_before_deadline', {
        requestId: safeRequestId(requestId),
        uid: safeUserId(auth.uid),
        reason,
        errorCode: rollbackError instanceof Error ? rollbackError.message : 'unknown',
      });
    }
    return errorResponse(
      request,
      env,
      reason === 'upstream_timeout' ? 504 : reason === 'service_unavailable' ? 503 : 502,
      reason,
      reason === 'upstream_timeout'
        ? 'Buddy is temporarily unavailable. Please try again.'
        : 'Buddy is temporarily unavailable. Please try again later.',
    );
  }
}

export async function onRequestPost({ request, env }) {
  const deadlineAt = Date.now() + TOTAL_REQUEST_BUDGET_MS;
  try {
    return await handlePost(request, env, deadlineAt);
  } catch (error) {
    logBuddy('error', 'unhandled_exception', {
      errorCode: error instanceof Error ? error.message.split(':')[0] : 'unknown',
    });
    if (error instanceof Error && error.message === 'upstream_timeout') {
      return errorResponse(request, env, 504, 'upstream_timeout', 'Buddy is temporarily unavailable. Please try again.');
    }
    return errorResponse(request, env, 500, 'server_error', 'Buddy is temporarily unavailable. Please try again later.');
  }
}
