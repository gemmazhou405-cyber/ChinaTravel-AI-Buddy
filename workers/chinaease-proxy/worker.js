const COZE_CHAT_URL = 'https://api.coze.cn/v3/chat';
const MAX_REPLY_CHARS = 6000;

function corsHeaders(env) {
  const configured = env.ALLOWED_ORIGIN || env.ALLOWED_ORIGINS || '*';
  return {
    'Access-Control-Allow-Origin': configured,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-ChinaEase-Internal-Token',
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

function safeCozeErrorPayload(payload, fallback = 'coze_error') {
  const code = payload?.code ?? payload?.error?.code ?? fallback;
  const msg = payload?.msg || payload?.message || payload?.error?.message || 'Coze request failed.';
  return { error: 'coze_error', code, msg };
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

async function handleCoze(request, env) {
  if (request.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, { status: 405 }, env);
  }

  if (!env.COZE_TOKEN) {
    console.error('[chinaease-proxy] missing_coze_token');
    return json({ error: 'service_unavailable' }, { status: 503 }, env);
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
    stream: true,
    additional_messages: [
      {
        role: 'user',
        content: message,
        content_type: 'text',
      },
    ],
  };

  const response = await fetch(COZE_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.COZE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cozeBody),
  });

  const responseText = await response.text();
  const contentType = response.headers.get('Content-Type') || 'application/json';

  if (!response.ok) {
    let payload = null;
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = null;
    }
    console.warn('[chinaease-proxy] coze_non_ok', {
      status: response.status,
      responseLength: responseText.length,
      code: payload?.code || payload?.error?.code || 'unknown',
    });
    return json(safeCozeErrorPayload(payload, `http_${response.status}`), { status: 502 }, env);
  }

  if (contentType.includes('application/json')) {
    let payload = null;
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = null;
    }
    if (payload?.code && Number(payload.code) !== 0) {
      console.warn('[chinaease-proxy] coze_json_error', {
        code: payload.code,
        responseLength: responseText.length,
      });
      return json(safeCozeErrorPayload(payload), { status: 502 }, env);
    }
  }

  const parsed = extractReplyFromCozeEvents(parseCozeSse(responseText));
  if (parsed.error) {
    console.warn('[chinaease-proxy] coze_stream_error', {
      code: parsed.error.code || 'unknown',
    });
    return json(parsed.error, { status: 502 }, env);
  }
  if (!parsed.reply) {
    console.warn('[chinaease-proxy] coze_no_answer', {
      contentType,
      responseLength: responseText.length,
      hasChatCompleted: responseText.includes('conversation.chat.completed'),
    });
    return json({ error: 'coze_no_answer', code: 'coze_no_answer', msg: 'Coze returned no assistant answer.' }, { status: 502 }, env);
  }

  return json({ reply: parsed.reply }, { status: 200 }, env);
}

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
