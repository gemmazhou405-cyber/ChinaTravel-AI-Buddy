import { createDoc, getDoc, patchDoc } from '../../_shared/firestore.js';
import {
  clientIp,
  withCors,
  jsonResponse,
  errorResponse,
  optionsResponse,
  parseJson,
} from '../../_shared/http.js';
import { sendTripLeadNotification, sendTripLeadConfirmation } from '../../_shared/email.js';
import { generateTripPlan } from '../../_shared/itinerary.js';
import { sendWhatsAppTripReminder } from '../../_shared/whatsapp.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

function parseWhatsApp(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 40) return null;
  // Keep the value useful for a manual reply without accepting arbitrary text.
  if (!/^[+0-9() .-]+$/.test(trimmed)) return null;
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return null;
  return trimmed;
}

function parseStringArray(value, maxItems = 12, maxLength = 80) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim().slice(0, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
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

  // requestId — used as idempotency key and Firestore document ID
  const requestIdRaw = typeof body.requestId === 'string' ? body.requestId.trim() : '';
  const docId = UUID_RE.test(requestIdRaw) ? requestIdRaw : crypto.randomUUID();

  // Sanitize optional fields
  const travelDate = clampStr(body.travelDate, 80);
  const helpWith = (() => {
    if (typeof body.helpWith !== 'string') return null;
    const t = body.helpWith.trim();
    if (!t) return null;
    return t.slice(0, 500);
  })();
  const contactMethod = body.contactMethod === 'whatsapp' ? 'whatsapp' : 'email';
  const whatsapp = parseWhatsApp(body.whatsapp);
  if (contactMethod === 'whatsapp' && !whatsapp) {
    return errorResponse(request, env, 400, 'invalid_whatsapp', 'Please provide a valid WhatsApp number or choose email.');
  }
  const travelers = (() => {
    const v = parseInt(body.travelers, 10);
    if (Number.isNaN(v) || v < 1 || v > 20) return null;
    return v;
  })();
  const tripLength = (() => {
    const v = parseInt(body.tripLength, 10);
    return Number.isNaN(v) || v < 1 || v > 60 ? null : v;
  })();
  const departureCountry = clampStr(body.departureCountry, 80);
  const arrivalCity = clampStr(body.arrivalCity, 80);
  const destinationCities = parseStringArray(body.destinationCities);
  const priorities = parseStringArray(body.priorities);
  const concerns = parseStringArray(body.concerns);
  const locale = clampStr(body.locale, 8) ?? 'en';
  const sourcePath = clampStr(body.sourcePath, 500);
  const utmSource = clampStr(body.utmSource, 80);
  const utmMedium = clampStr(body.utmMedium, 80);
  const utmCampaign = clampStr(body.utmCampaign, 120);
  const utmContent = clampStr(body.utmContent, 120);

  const emailHash = await sha256(emailRaw);
  const createdAt = Date.now();

  // Idempotency: if this requestId already exists, skip re-processing
  const existing = await getDoc(env, `tripLeads/${docId}`).catch(() => null);
  if (existing) {
    return withCors(jsonResponse({ status: 'received', alreadyProcessed: true }), request, env);
  }

  // Write lead to Firestore
  try {
    await createDoc(env, 'tripLeads', docId, {
      requestId: docId,
      email: emailRaw,
      emailHash,
      travelDate,
      travelers,
      tripLength,
      departureCountry,
      arrivalCity,
      destinationCities,
      priorities,
      concerns,
      helpWith,
      whatsapp,
      contactMethod,
      locale,
      sourcePath,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      consentVersion: 'trip-lead-2026-09',
      source: 'buddy_trip_lead',
      status: 'new',
      ipHash,
      createdAt,
      notificationStatus: 'pending',
      confirmationEmailStatus: 'pending',
      planGenerationStatus: 'pending',
      whatsappReminderStatus: contactMethod === 'whatsapp' ? 'pending' : 'not_requested',
    });
  } catch (err) {
    if (String(err?.message).includes(':409:')) {
      // Concurrent duplicate write — treat as already processed
      return withCors(jsonResponse({ status: 'received', alreadyProcessed: true }), request, env);
    }
    console.error('[leads/trip] Firestore write failed', String(err?.message).slice(0, 80));
    return errorResponse(request, env, 500, 'firestore_error', 'Could not save your enquiry. Please try again.');
  }

  // Shared lead payload for both email functions
  const lead = {
    requestId: docId,
    email: emailRaw,
    travelDate,
    travelers,
    tripLength,
    departureCountry,
    arrivalCity,
    destinationCities,
    priorities,
    concerns,
    helpWith,
    whatsapp,
    contactMethod,
    locale,
    sourcePath,
    utmSource,
    createdAt,
  };

  // Generate a real, personalised draft before the customer confirmation email.
  // If the provider is unavailable, the email explicitly promises a later review instead of sending a fake route.
  const planResult = await generateTripPlan(env, lead);
  const plan = planResult.ok ? planResult.plan : null;
  try {
    await patchDoc(env, `tripLeads/${docId}`, {
      planGenerationStatus: planResult.ok ? 'sent' : 'failed',
      ...(planResult.ok ? { generatedPlan: plan, planGeneratedAt: Date.now() } : { planGenerationErrorCode: planResult.errorCode }),
    });
  } catch (patchErr) {
    console.error('[leads/trip] plan_status_update_failed', String(patchErr?.message).slice(0, 80));
  }

  // Send notifications in parallel — each result is recorded independently.
  const [adminSettled, confirmSettled, whatsappSettled] = await Promise.allSettled([
    sendTripLeadNotification(env, lead),
    sendTripLeadConfirmation(env, lead, plan),
    sendWhatsAppTripReminder(env, lead),
  ]);
  const adminResult =
    adminSettled.status === 'fulfilled'
      ? adminSettled.value
      : { ok: false, errorCode: 'unknown_error' };
  const confirmResult =
    confirmSettled.status === 'fulfilled'
      ? confirmSettled.value
      : { ok: false, errorCode: 'unknown_error' };
  const whatsappResult =
    whatsappSettled.status === 'fulfilled'
      ? whatsappSettled.value
      : { ok: false, errorCode: 'unknown_error' };

  // Update admin notification status
  try {
    if (adminResult.ok) {
      await patchDoc(env, `tripLeads/${docId}`, {
        notificationStatus: 'sent',
        notificationSentAt: Date.now(),
      });
    } else {
      console.error('[leads/trip] notification_failed', { errorCode: adminResult.errorCode, rid: docId.slice(0, 8) });
      await patchDoc(env, `tripLeads/${docId}`, {
        notificationStatus: 'failed',
        notificationErrorCode: adminResult.errorCode,
      });
    }
  } catch (patchErr) {
    console.error('[leads/trip] admin_status_update_failed', String(patchErr?.message).slice(0, 60));
  }

  // Update customer confirmation status
  try {
    if (confirmResult.ok) {
      await patchDoc(env, `tripLeads/${docId}`, {
        confirmationEmailStatus: 'sent',
        confirmationEmailSentAt: Date.now(),
      });
    } else {
      console.error('[leads/trip] confirmation_failed', { errorCode: confirmResult.errorCode, rid: docId.slice(0, 8) });
      await patchDoc(env, `tripLeads/${docId}`, {
        confirmationEmailStatus: 'failed',
        confirmationEmailErrorCode: confirmResult.errorCode,
      });
    }
  } catch (patchErr) {
    console.error('[leads/trip] confirm_status_update_failed', String(patchErr?.message).slice(0, 60));
  }

  try {
    if (whatsappResult.ok) {
      await patchDoc(env, `tripLeads/${docId}`, { whatsappReminderStatus: 'sent', whatsappReminderSentAt: Date.now() });
    } else if (whatsappResult.errorCode !== 'not_requested') {
      console.error('[leads/trip] whatsapp_reminder_failed', { errorCode: whatsappResult.errorCode, rid: docId.slice(0, 8) });
      await patchDoc(env, `tripLeads/${docId}`, { whatsappReminderStatus: 'failed', whatsappReminderErrorCode: whatsappResult.errorCode });
    }
  } catch (patchErr) {
    console.error('[leads/trip] whatsapp_status_update_failed', String(patchErr?.message).slice(0, 60));
  }

  return withCors(jsonResponse({ status: 'received', planGenerated: Boolean(plan), whatsappReminderSent: Boolean(whatsappResult.ok) }), request, env);
}
