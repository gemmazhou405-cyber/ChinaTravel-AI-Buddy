import { createDoc } from '../_shared/firestore.js';
import { parseJson } from '../_shared/http.js';

const PRODUCTION_ORIGIN = 'https://chinaeasebuddy.com';
const PREVIEW_SUFFIX = '.chinaease-buddy.pages.dev';

const ALLOWED_EVENTS = new Set([
  'buddy_opened',
  'buddy_question_sent',
  'lead_cta_shown',
  'lead_form_opened',
  'lead_submit_started',
  'lead_submit_success',
  'lead_submit_failed',
]);

const ALLOWED_DEVICE_CATEGORIES = new Set(['mobile', 'tablet', 'desktop', 'unknown']);
const ALLOWED_ENVIRONMENTS = new Set(['production', 'test', 'preview']);
const ALLOWED_LOCALE_PREFIXES = new Set(['en', 'zh', 'fr', 'de', 'ja', 'ko']);

// Per-isolate best-effort rate limit. Not shared across Cloudflare isolates — V1 acceptable.
const _ipRateMap = new Map();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 30;

function checkRateLimit(ipHash) {
  const now = Date.now();
  const prev = (_ipRateMap.get(ipHash) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (prev.length >= RATE_MAX) return false;
  _ipRateMap.set(ipHash, [...prev, now]);
  return true;
}

async function sha256(input) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Returns true for allowed request origins; false for everything else.
function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (origin === PRODUCTION_ORIGIN) return true;
  if (origin === 'http://localhost:5173' || origin === 'http://127.0.0.1:5173') return true;
  try {
    return new URL(origin).hostname.endsWith(PREVIEW_SUFFIX);
  } catch { return false; }
}

// Build CORS headers for events endpoint. Echoes the specific origin (never wildcard).
function eventsCorsHeaders(origin) {
  const headers = new Headers();
  if (isAllowedOrigin(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }
  headers.set('Access-Control-Allow-Methods', 'POST,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  headers.set('Access-Control-Max-Age', '86400');
  headers.set('Vary', 'Origin');
  return headers;
}

function withCors(response, origin) {
  const next = new Response(response.body, response);
  eventsCorsHeaders(origin).forEach((value, key) => next.headers.set(key, value));
  return next;
}

function jsonOk(data, origin) {
  return withCors(
    new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    }),
    origin,
  );
}

function jsonErr(status, code, message, origin) {
  return withCors(
    new Response(JSON.stringify({ error: code, message }), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    }),
    origin,
  );
}

function clampStr(value, max) {
  if (typeof value !== 'string') return null;
  const t = value.trim();
  return t ? t.slice(0, max) : null;
}

// Server-side environment resolution. Pages.dev origin always maps to 'preview'
// regardless of what the client claims, preventing clients from misreporting.
function resolveEnvironment(origin, clientEnv) {
  if (origin) {
    try {
      if (new URL(origin).hostname.endsWith(PREVIEW_SUFFIX)) return 'preview';
    } catch {}
  }
  if (ALLOWED_ENVIRONMENTS.has(clientEnv)) return clientEnv;
  return 'production';
}

export async function onRequestOptions({ request }) {
  const origin = request.headers.get('Origin') || '';
  return new Response(null, { status: 204, headers: eventsCorsHeaders(origin) });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';

  if (!isAllowedOrigin(origin)) {
    return jsonErr(403, 'forbidden_origin', 'Origin not allowed.', origin);
  }

  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLength > 2048) return jsonErr(413, 'payload_too_large', 'Request too large.', origin);

  const body = await parseJson(request);
  if (!body) return jsonErr(400, 'invalid_json', 'Invalid JSON body.', origin);

  const eventName = typeof body.event === 'string' ? body.event.trim() : '';
  if (!ALLOWED_EVENTS.has(eventName)) {
    return jsonErr(400, 'unknown_event', `Unknown event.`, origin);
  }

  // IP used only for rate limiting — hash is never written to the analytics document.
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
  const ipHash = await sha256(ip);
  if (!checkRateLimit(ipHash)) {
    return jsonErr(429, 'too_many_requests', 'Too many requests.', origin);
  }

  // Strict field allowlist — explicit extraction only, no body spread.
  const locale = (() => {
    const v = clampStr(body.locale, 8);
    if (!v) return null;
    return ALLOWED_LOCALE_PREFIXES.has(v.slice(0, 2).toLowerCase()) ? v : null;
  })();
  const sourcePath = clampStr(body.sourcePath, 500);
  const utmSource = clampStr(body.utmSource, 80);
  const utmMedium = clampStr(body.utmMedium, 80);
  const utmCampaign = clampStr(body.utmCampaign, 120);
  const deviceCategory = ALLOWED_DEVICE_CATEGORIES.has(body.deviceCategory)
    ? body.deviceCategory
    : 'unknown';
  const environment = resolveEnvironment(origin, body.environment);

  // analyticsEvents document — contains no PII, no IP, no session ID, no requestId.
  const doc = {
    event: eventName,
    createdAt: Date.now(), // server-generated; client timestamp is ignored
    environment,
    deviceCategory,
  };
  if (locale) doc.locale = locale;
  if (sourcePath) doc.sourcePath = sourcePath;
  if (utmSource) doc.utmSource = utmSource;
  if (utmMedium) doc.utmMedium = utmMedium;
  if (utmCampaign) doc.utmCampaign = utmCampaign;

  // Firestore write failure is non-fatal — analytics must never break the user experience.
  try {
    if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
      await createDoc(env, 'analyticsEvents', crypto.randomUUID(), doc);
    }
  } catch (err) {
    console.error('[events] firestore_write_failed', String(err?.message).slice(0, 80));
  }

  return jsonOk({ status: 'ok' }, origin);
}
