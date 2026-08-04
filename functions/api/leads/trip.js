import { createDoc } from '../../_shared/firestore.js';
import {
  clientIp,
  withCors,
  jsonResponse,
  errorResponse,
  optionsResponse,
  parseJson,
} from '../../_shared/http.js';

async function sha256(input) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Per-Worker-instance rate limit — not shared across isolates (V1 acceptable).
// Provides best-effort protection against bursts within a single instance lifetime.
const _ipRateMap = new Map();
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_MAX = 5;

function checkRateLimit(ipHash) {
  const now = Date.now();
  const prev = (_ipRateMap.get(ipHash) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (prev.length >= RATE_MAX) return false;
  _ipRateMap.set(ipHash, [...prev, now]);
  return true;
}

function clampStr(value, max) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export async function onRequestOptions({ request, env }) {
  return optionsResponse(request, env);
}

export async function onRequestPost({ request, env }) {
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLength > 8192) return errorResponse(request, env, 413, 'payload_too_large', 'Request too large.');

  const body = await parseJson(request);
  if (!body) return errorResponse(request, env, 400, 'invalid_json', 'Invalid JSON body.');

  // Honeypot
  if (body.website) return withCors(jsonResponse({ status: 'ignored' }), request, env);

  // Email validation
  const emailRaw = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!emailRaw || emailRaw.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
    return errorResponse(request, env, 400, 'invalid_email', 'Invalid or missing email.');
  }

  // Rate limit
  const ip = clientIp(request);
  const ipHash = await sha256(ip);
  if (!checkRateLimit(ipHash)) {
    return errorResponse(request, env, 429, 'too_many_requests', 'Too many requests. Please try again later.');
  }

  // Sanitize optional fields
  const travelDate = clampStr(body.travelDate, 80);
  const helpWith = (() => {
    if (typeof body.helpWith !== 'string') return null;
    const t = body.helpWith.trim();
    if (!t) return null;
    return t.slice(0, 500);
  })();
  const travelers = (() => {
    const v = parseInt(body.travelers, 10);
    if (Number.isNaN(v) || v < 1 || v > 20) return null;
    return v;
  })();
  const locale = clampStr(body.locale, 8) ?? 'en';
  const sourcePath = clampStr(body.sourcePath, 500);
  const utmSource = clampStr(body.utmSource, 80);
  const utmMedium = clampStr(body.utmMedium, 80);
  const utmCampaign = clampStr(body.utmCampaign, 120);
  const utmContent = clampStr(body.utmContent, 120);

  const emailHash = await sha256(emailRaw);
  const docId = crypto.randomUUID();

  try {
    await createDoc(env, 'tripLeads', docId, {
      email: emailRaw,
      emailHash,
      travelDate,
      travelers,
      helpWith,
      locale,
      sourcePath,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      consentVersion: 'trip-lead-2026-08',
      source: 'buddy_trip_lead',
      status: 'new',
      ipHash,
      createdAt: Date.now(),
    });
  } catch (err) {
    console.error('[leads/trip] Firestore write failed', err);
    return errorResponse(request, env, 500, 'firestore_error', 'Could not save your enquiry. Please try again.');
  }

  return withCors(jsonResponse({ status: 'received' }), request, env);
}
