const COZE_CHAT_URL = 'https://api.coze.cn/v3/chat';

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
    stream: false,
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
    console.warn('[chinaease-proxy] coze_non_ok', {
      status: response.status,
      responseLength: responseText.length,
    });
  }

  return new Response(responseText, {
    status: response.status,
    headers: {
      'Content-Type': contentType,
      ...corsHeaders(env),
    },
  });
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
