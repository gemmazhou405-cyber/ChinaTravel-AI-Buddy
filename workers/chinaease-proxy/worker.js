const COZE_CHAT_URL = 'https://api.coze.cn/v3/chat';
const COZE_RETRIEVE_URL = 'https://api.coze.cn/v3/chat/retrieve';
const COZE_MESSAGE_LIST_URL = 'https://api.coze.cn/v3/chat/message/list';
const MAX_REPLY_CHARS = 6000;
const POLL_DELAYS_MS = [800, 1200, 1600, 2200, 3000];
const COZE_GLOBAL_BUDGET_MS = 14000;
const COZE_MIN_BUDGET_MS = 5000;
const COZE_INITIAL_FETCH_MS = 8000;
const COZE_POLL_FETCH_MS = 6000;

function corsHeaders(env) {
  const configured = env.ALLOWED_ORIGIN || env.ALLOWED_ORIGINS || '*';
  return {
    'Access-Control-Allow-Origin': configured,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-ChinaEase-Internal-Token,X-ChinaEase-Timeout-Ms',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(data, init = {}, env = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(env),
      ...(init.headers || {}),
    },
  });
}

function isLocalRequest(request) {
  const { hostname } = new URL(request.url);
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost');
}

async function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  if (left.length !== right.length) return false;
  const leftHash = await crypto.subtle.digest('SHA-256', left);
  const rightHash = await crypto.subtle.digest('SHA-256', right);
  const leftBytes = new Uint8Array(leftHash);
  const rightBytes = new Uint8Array(rightHash);
  let diff = 0;
  for (let i = 0; i < leftBytes.length; i += 1) diff |= leftBytes[i] ^ rightBytes[i];
  return diff === 0;
}

async function requireInternalAuth(request, env) {
  const configured = typeof env.COZE_INTERNAL_SECRET === 'string' ? env.COZE_INTERNAL_SECRET.trim() : '';
  if (!configured) {
    if (isLocalRequest(request)) return { ok: true };
    console.error('[chinaease-proxy] missing_internal_secret');
    return { ok: false, response: json({ error: 'coze_configuration_error', code: 'missing_internal_secret' }, { status: 503 }, env) };
  }

  const provided = request.headers.get('X-ChinaEase-Internal-Token') || '';
  if (!(await constantTimeEqual(provided, configured))) {
    return { ok: false, response: json({ error: 'unauthorized' }, { status: 401 }, env) };
  }
  return { ok: true };
}

function extractMessage(incoming) {
  const candidates = [
    incoming?.message,
    incoming?.messages?.[0]?.content,
    incoming?.additional_messages?.[0]?.content,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }
  return '';
}

function extractBotId(incoming) {
  const botId = incoming?.bot_id || incoming?.botId;
  return typeof botId === 'string' ? botId.trim() : '';
}

function extractUserId(incoming) {
  const userId = incoming?.user_id || incoming?.userId || 'chinaease-user';
  return typeof userId === 'string' && userId.trim() ? userId.trim().slice(0, 128) : 'chinaease-user';
}

function clampTimeoutMs(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return COZE_GLOBAL_BUDGET_MS;
  return Math.min(COZE_GLOBAL_BUDGET_MS, Math.max(COZE_MIN_BUDGET_MS, Math.floor(parsed)));
}

function extractContextMessages(incoming) {
  if (!Array.isArray(incoming?.context)) return [];
  const messages = [];
  let total = 0;
  for (const item of incoming.context.slice(-6)) {
    if (!item || typeof item !== 'object') continue;
    const role = item.role === 'buddy' ? 'assistant' : item.role === 'user' ? 'user' : '';
    const text = typeof item.text === 'string' ? item.text.trim().slice(0, 600) : '';
    if (!role || !text) continue;
    if (total + text.length > 3000) continue;
    total += text.length;
    messages.push({ role, content: text, content_type: 'text' });
  }
  return messages;
}

function safeCozeErrorPayload(payload, fallback = 'coze_error') {
  const code = payload?.code ?? payload?.error?.code ?? fallback;
  const msg = payload?.msg || payload?.message || payload?.error?.message || 'Coze request failed.';
  const error = Number(code) === 4200 ? 'coze_configuration_error' : 'coze_error';
  return { error, code, msg };
}

function appendSseData(events, rawEvent, rawData) {
  if (!rawData || rawData === '[DONE]') return;
  try {
    events.push({ event: rawEvent || '', data: JSON.parse(rawData) });
  } catch {
    events.push({ event: rawEvent || '', data: { raw: rawData } });
  }
}

function parseCozeSse(text) {
  const events = [];
  let eventName = '';
  let dataLines = [];

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) {
      appendSseData(events, eventName, dataLines.join('\n'));
      eventName = '';
      dataLines = [];
      continue;
    }
    if (line.startsWith('event:')) {
      eventName = line.slice('event:'.length).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trimStart());
    }
  }
  appendSseData(events, eventName, dataLines.join('\n'));

  return events;
}

function extractReplyFromCozeEvents(events) {
  let deltaReply = '';
  let completedReply = '';
  let lastAnswer = '';

  for (const item of events) {
    const event = item.event;
    const data = item.data;
    const role = String(data?.role || '').toLowerCase();
    const type = String(data?.type || '').toLowerCase();
    const content = typeof data?.content === 'string' ? data.content : '';
    const isAssistantAnswer = role === 'assistant' || type === 'answer';

    if (data?.code && Number(data.code) !== 0) {
      return { error: safeCozeErrorPayload(data) };
    }

    if (content && isAssistantAnswer) {
      lastAnswer = content;
      if (event === 'conversation.message.delta') {
        deltaReply += content;
      } else if (event === 'conversation.message.completed') {
        completedReply = content;
      }
    }
  }

  const reply = (deltaReply || completedReply || lastAnswer).trim();
  return { reply: reply.slice(0, MAX_REPLY_CHARS) };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cozeHeaders(env) {
  return {
    Authorization: `Bearer ${env.COZE_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

async function fetchCozeJson(env, url, init = {}) {
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        ...cozeHeaders(env),
        ...(init.headers || {}),
      },
    });
    const responseText = await response.text();
    let payload = null;
    try {
      payload = responseText ? JSON.parse(responseText) : {};
    } catch {
      payload = null;
    }
    if (!response.ok) {
      console.warn('[chinaease-proxy] coze_non_ok', {
        status: response.status,
        responseLength: responseText.length,
        code: payload?.code || payload?.error?.code || 'unknown',
      });
      return { ok: false, status: response.status, payload };
    }
    if (payload?.code && Number(payload.code) !== 0) {
      console.warn('[chinaease-proxy] coze_json_error', {
        code: payload.code,
        responseLength: responseText.length,
      });
      return { ok: false, status: 502, payload };
    }
    return { ok: true, status: response.status, payload };
  } catch (err) {
    if (err?.name === 'AbortError' || err?.name === 'TimeoutError') {
      console.warn('[chinaease-proxy] coze_fetch_timeout', { url });
      return { ok: false, status: 408, payload: null, timedOut: true };
    }
    throw err;
  }
}

function textContent(value) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  if (typeof value.text === 'string') return value.text;
  if (typeof value.content === 'string') return value.content;
  try {
    const parsed = JSON.parse(value.content || value.text || '');
    return textContent(parsed);
  } catch {
    return '';
  }
}

function collectMessages(value, out = []) {
  if (!value || typeof value !== 'object') return out;
  if (Array.isArray(value)) {
    value.forEach((item) => collectMessages(item, out));
    return out;
  }
  const role = String(value.role || '').toLowerCase();
  const type = String(value.type || '').toLowerCase();
  if (role || type) out.push(value);
  for (const key of ['messages', 'message_list', 'items']) {
    if (Array.isArray(value[key])) collectMessages(value[key], out);
  }
  if (value.data && typeof value.data === 'object') collectMessages(value.data, out);
  return out;
}

function extractReplyFromPayload(payload) {
  const candidates = [
    payload?.reply,
    payload?.answer,
    payload?.message,
    payload?.data?.reply,
    payload?.data?.answer,
    payload?.data?.message,
    payload?.data?.content,
    payload?.content,
  ];
  for (const candidate of candidates) {
    const text = textContent(candidate).trim();
    if (text) return text.slice(0, MAX_REPLY_CHARS);
  }

  const messages = collectMessages(payload);
  const answer = [...messages].reverse().find((item) => {
    const role = String(item?.role || '').toLowerCase();
    const type = String(item?.type || '').toLowerCase();
    const content = textContent(item?.content || item);
    const isAnswer = role === 'assistant' || type === 'answer';
    const isDebug = ['reasoning', 'tool', 'verbose', 'follow_up'].includes(type);
    return isAnswer && !isDebug && content.trim();
  });
  return textContent(answer?.content || answer).trim().slice(0, MAX_REPLY_CHARS);
}

function chatStatus(payload) {
  return String(payload?.data?.status || payload?.status || payload?.data?.chat_status || '').toLowerCase();
}

function chatIds(payload) {
  return {
    chatId: payload?.data?.id || payload?.data?.chat_id || payload?.id || payload?.chat_id || '',
    conversationId: payload?.data?.conversation_id || payload?.conversation_id || '',
  };
}

async function retrieveChat(env, conversationId, chatId, signal) {
  const url = new URL(COZE_RETRIEVE_URL);
  url.searchParams.set('conversation_id', conversationId);
  url.searchParams.set('chat_id', chatId);
  return fetchCozeJson(env, url.toString(), signal ? { signal } : {});
}

async function listMessages(env, conversationId, chatId, signal) {
  const url = new URL(COZE_MESSAGE_LIST_URL);
  url.searchParams.set('conversation_id', conversationId);
  url.searchParams.set('chat_id', chatId);
  return fetchCozeJson(env, url.toString(), signal ? { signal } : {});
}

async function resolveCozeReply(env, createPayload, deadlineAt) {
  const immediate = extractReplyFromPayload(createPayload);
  if (immediate) return { reply: immediate };

  const { chatId, conversationId } = chatIds(createPayload);
  if (!chatId || !conversationId) return { error: 'coze_no_answer' };

  let lastStatus = chatStatus(createPayload);
  for (let i = 0; i < POLL_DELAYS_MS.length; i += 1) {
    const remaining = deadlineAt - Date.now();
    if (remaining < 700) return { error: 'upstream_timeout', status: lastStatus || 'deadline' };
    await delay(Math.min(POLL_DELAYS_MS[i], Math.max(0, remaining - 600)));

    const afterDelayRemaining = deadlineAt - Date.now();
    if (afterDelayRemaining < 500) return { error: 'upstream_timeout', status: lastStatus || 'deadline' };

    const pollMs = Math.min(afterDelayRemaining - 200, COZE_POLL_FETCH_MS);
    const retrieved = await retrieveChat(env, conversationId, chatId, AbortSignal.timeout(pollMs));
    if (retrieved.timedOut) return { error: 'upstream_timeout', status: 'fetch_timeout' };
    if (!retrieved.ok) return { error: safeCozeErrorPayload(retrieved.payload, `http_${retrieved.status}`) };

    const retrievedReply = extractReplyFromPayload(retrieved.payload);
    if (retrievedReply) return { reply: retrievedReply };

    lastStatus = chatStatus(retrieved.payload) || lastStatus;
    if (['failed', 'canceled', 'cancelled', 'requires_action'].includes(lastStatus)) {
      return { error: 'coze_failed', status: lastStatus };
    }

    if (['completed', 'complete', 'done'].includes(lastStatus)) {
      const listRemaining = deadlineAt - Date.now();
      if (listRemaining < 500) return { error: 'upstream_timeout', status: 'list_deadline' };
      const listMs = Math.min(listRemaining - 200, COZE_POLL_FETCH_MS);
      const messages = await listMessages(env, conversationId, chatId, AbortSignal.timeout(listMs));
      if (messages.timedOut) return { error: 'upstream_timeout', status: 'list_timeout' };
      if (!messages.ok) return { error: safeCozeErrorPayload(messages.payload, `http_${messages.status}`) };
      const messageReply = extractReplyFromPayload(messages.payload);
      return messageReply ? { reply: messageReply } : { error: 'coze_no_answer' };
    }
  }

  return { error: 'upstream_timeout', status: lastStatus || 'unknown' };
}

async function handleCoze(request, env) {
  if (request.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, { status: 405 }, env);
  }

  const auth = await requireInternalAuth(request, env);
  if (!auth.ok) return auth.response;

  if (!env.COZE_TOKEN) {
    console.error('[chinaease-proxy] missing_coze_token');
    return json({ error: 'coze_configuration_error', code: 'missing_coze_token' }, { status: 503 }, env);
  }

  let incoming;
  try {
    incoming = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, { status: 400 }, env);
  }

  const message = extractMessage(incoming);
  const botId = extractBotId(incoming);
  const userId = extractUserId(incoming);
  const contextMessages = extractContextMessages(incoming);
  const requestedTimeoutMs = request.headers.get('X-ChinaEase-Timeout-Ms') || incoming?.timeoutMs;
  const budgetMs = clampTimeoutMs(requestedTimeoutMs);

  if (!botId || !message) {
    console.warn('[chinaease-proxy] invalid_request', {
      hasBotId: Boolean(botId),
      hasMessage: Boolean(message),
    });
    return json({ error: 'Invalid request' }, { status: 400 }, env);
  }

  const cozeBody = {
    bot_id: botId,
    user_id: userId,
    stream: false,
    additional_messages: [
      ...contextMessages,
      {
        role: 'user',
        content: message,
        content_type: 'text',
      },
    ],
  };

  const globalDeadlineAt = Date.now() + budgetMs;
  const initialFetchMs = Math.max(1000, Math.min(COZE_INITIAL_FETCH_MS, budgetMs - 1000));
  const created = await fetchCozeJson(env, COZE_CHAT_URL, {
    method: 'POST',
    body: JSON.stringify(cozeBody),
    signal: AbortSignal.timeout(initialFetchMs),
  });

  if (created.timedOut) {
    console.warn('[chinaease-proxy] coze_initial_timeout');
    return json({ error: 'upstream_timeout', code: 'upstream_timeout' }, { status: 504 }, env);
  }
  if (!created.ok) {
    return json(safeCozeErrorPayload(created.payload, `http_${created.status}`), { status: 502 }, env);
  }
  const resolved = await resolveCozeReply(env, created.payload, globalDeadlineAt);
  if (resolved.reply) return json({ reply: resolved.reply }, { status: 200 }, env);

  if (resolved.error && typeof resolved.error === 'object') {
    return json(resolved.error, { status: 502 }, env);
  }

  const error = resolved.error || 'coze_no_answer';
  console.warn('[chinaease-proxy] coze_resolution_failed', { error, status: resolved.status || 'unknown' });
  if (error === 'upstream_timeout') return json({ error: 'upstream_timeout', code: 'upstream_timeout' }, { status: 504 }, env);
  if (error === 'coze_failed') return json({ error: 'coze_failed', code: resolved.status || 'coze_failed' }, { status: 502 }, env);
  return json({ error: 'coze_no_answer', code: 'coze_no_answer' }, { status: 502 }, env);
}

export const __test__ = {
  clampTimeoutMs,
  extractReplyFromPayload,
  extractReplyFromCozeEvents,
  parseCozeSse,
  chatIds,
  chatStatus,
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return json({ status: 'ok', service: 'ChinaEase Proxy' }, { status: 200 }, env);
    }

    if (url.pathname === '/coze') {
      try {
        return await handleCoze(request, env);
      } catch (error) {
        console.error('[chinaease-proxy] unhandled_error', {
          errorCode: error instanceof Error ? error.message.split(':')[0] : 'unknown',
        });
        return json({ error: 'upstream_error' }, { status: 502 }, env);
      }
    }

    return json({ error: 'not_found' }, { status: 404 }, env);
  },
};
