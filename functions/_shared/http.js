const DEFAULT_ALLOWED_ORIGINS = ['https://chinaeasebuddy.com', 'http://localhost:5173', 'http://127.0.0.1:5173'];

export function jsonResponse(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const configured = (env.ALLOWED_ORIGINS || '').split(',').map((item) => item.trim()).filter(Boolean);
  const allowed = configured.length ? configured : DEFAULT_ALLOWED_ORIGINS;
  const headers = new Headers();
  if (allowed.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Authorization,Content-Type,PayPal-Transmission-Id,PayPal-Transmission-Time,PayPal-Transmission-Sig,PayPal-Cert-Url,PayPal-Auth-Algo');
  headers.set('Access-Control-Max-Age', '86400');
  headers.set('Vary', 'Origin');
  return headers;
}

export function optionsResponse(request, env) {
  return new Response(null, { status: 204, headers: corsHeaders(request, env) });
}

export function withCors(response, request, env) {
  const next = new Response(response.body, response);
  corsHeaders(request, env).forEach((value, key) => next.headers.set(key, value));
  return next;
}

export function errorResponse(request, env, status, code, message) {
  return withCors(jsonResponse({ error: code, message }, { status }), request, env);
}

export async function parseJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function clientIp(request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
}
