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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PHONE_RE = /^\+[1-9]\d{7,14}$/;
const CODE_RE = /^\d{4,8}$/;
const TWILIO_TIMEOUT_MS = 8000;

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

function normalizePhone(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/[()\s.-]/g, '');
}

function twilioConfigured(env) {
  return Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_VERIFY_SERVICE_SID);
}

async function twilioPost(env, resource, params) {
  if (!twilioConfigured(env)) return { ok: false, errorCode: 'phone_verification_unavailable' };
  const credentials = String(env.TWILIO_ACCOUNT_SID) + ':' + String(env.TWILIO_AUTH_TOKEN);
  try {
    const response = await fetch(
      'https://verify.twilio.com/v2/Services/' + encodeURIComponent(env.TWILIO_VERIFY_SERVICE_SID) + '/' + resource,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + btoa(credentials),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(params),
        signal: AbortSignal.timeout(TWILIO_TIMEOUT_MS),
      },
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 429) return { ok: false, errorCode: 'too_many_requests' };
      return { ok: false, errorCode: resource === 'VerificationCheck' ? 'invalid_code' : 'verification_provider_error' };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, errorCode: 'verification_provider_error' };
  }
}

function verificationErrorResponse(request, env, errorCode) {
  if (errorCode === 'phone_verification_unavailable') {
    return errorResponse(request, env, 503, errorCode, 'Phone verification is not configured yet.');
  }
  if (errorCode === 'too_many_requests') {
    return errorResponse(request, env, 429, errorCode, 'Too many verification attempts. Please try again later.');
  }
  if (errorCode === 'invalid_code') {
    return errorResponse(request, env, 400, errorCode, 'The verification code is invalid or expired.');
  }
  return errorResponse(request, env, 502, errorCode, 'The verification provider is temporarily unavailable.');
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

  const action = typeof body.action === 'string' && body.action ? body.action : 'email_lead';
  if (!['email_lead', 'send_code', 'verify_code'].includes(action)) {
    return errorResponse(request, env, 400, 'invalid_action', 'Unsupported lead action.');
  }

  const ip = clientIp(request);
  const ipHash = await sha256(ip);
  if (!checkRateLimit(ipHash)) {
    return errorResponse(request, env, 429, 'too_many_requests', 'Too many requests. Please try again later.');
  }

  if (action === 'send_code') {
    const phone = normalizePhone(body.phone);
    if (!PHONE_RE.test(phone)) {
      return errorResponse(request, env, 400, 'invalid_phone', 'Enter a valid phone number in international format.');
    }
    const verification = await twilioPost(env, 'Verifications', { To: phone, Channel: 'sms' });
    if (!verification.ok) return verificationErrorResponse(request, env, verification.errorCode);
    return withCors(jsonResponse({ status: 'code_sent' }), request, env);
  }

  let verifiedPhone = null;
  if (action === 'verify_code') {
    const phone = normalizePhone(body.phone);
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    if (!PHONE_RE.test(phone)) {
      return errorResponse(request, env, 400, 'invalid_phone', 'Enter a valid phone number in international format.');
    }
    if (!CODE_RE.test(code)) {
      return errorResponse(request, env, 400, 'invalid_code', 'The verification code is invalid or expired.');
    }
    const verification = await twilioPost(env, 'VerificationCheck', { To: phone, Code: code });
    if (!verification.ok) return verificationErrorResponse(request, env, verification.errorCode);
    if (verification.data?.status !== 'approved') {
      return errorResponse(request, env, 400, 'invalid_code', 'The verification code is invalid or expired.');
    }
    verifiedPhone = phone;
    if (!clampStr(body.consentVersion, 60)) {
      return errorResponse(request, env, 400, 'consent_required', 'Consent is required for this request.');
    }
  }

  // Email is required for the legacy lead form, optional for the verified phone form.
  const emailRaw = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const emailValid = emailRaw.length <= 160 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw);
  if ((action === 'email_lead' && !emailRaw) || (emailRaw && !emailValid)) {
    return errorResponse(request, env, 400, 'invalid_email', 'Invalid or missing email.');
  }

  // requestId — used as idempotency key and Firestore document ID
  const requestIdRaw = typeof body.requestId === 'string' ? body.requestId.trim() : '';
  const docId = UUID_RE.test(requestIdRaw) ? requestIdRaw : crypto.randomUUID();

  // Sanitize optional fields
  const travelDate = clampStr(body.travelDate, 80);
  const destinations = clampStr(body.destinations, 160);
  const helpWith = (() => {
    if (typeof body.helpWith !== 'string') return null;
    const value = body.helpWith.trim();
    if (!value) return null;
    return value.slice(0, 500);
  })();
  const travelers = (() => {
    const value = parseInt(body.travelers, 10);
    if (Number.isNaN(value) || value < 1 || value > 20) return null;
    return value;
  })();
  const locale = clampStr(body.locale, 8) ?? 'en';
  const sourcePath = clampStr(body.sourcePath, 500);
  const utmSource = clampStr(body.utmSource, 80);
  const utmMedium = clampStr(body.utmMedium, 80);
  const utmCampaign = clampStr(body.utmCampaign, 120);
  const utmContent = clampStr(body.utmContent, 120);
  const consentVersion = clampStr(body.consentVersion, 60) ?? 'trip-lead-2026-08';

  const emailHash = emailRaw ? await sha256(emailRaw) : null;
  const phoneHash = verifiedPhone ? await sha256(verifiedPhone) : null;
  const createdAt = Date.now();

  // Idempotency: if this requestId already exists, skip re-processing
  const existing = await getDoc(env, 'tripLeads/' + docId).catch(() => null);
  if (existing) {
    return withCors(jsonResponse({ status: 'received', alreadyProcessed: true }), request, env);
  }

  // Write lead to Firestore
  try {
    await createDoc(env, 'tripLeads', docId, {
      requestId: docId,
      email: emailRaw || null,
      emailHash,
      phoneE164: verifiedPhone,
      phoneHash,
      phoneVerifiedAt: verifiedPhone ? createdAt : null,
      phoneVerificationProvider: verifiedPhone ? 'twilio_verify' : null,
      travelDate,
      travelers,
      destinations,
      helpWith,
      locale,
      sourcePath,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      consentVersion,
      source: action === 'verify_code' ? 'free_trip_plan' : 'buddy_trip_lead',
      status: 'new',
      ipHash,
      createdAt,
      notificationStatus: 'pending',
      confirmationEmailStatus: emailRaw ? 'pending' : 'not_requested',
    });
  } catch (err) {
    if (String(err?.message).includes(':409:')) {
      return withCors(jsonResponse({ status: 'received', alreadyProcessed: true }), request, env);
    }
    console.error('[leads/trip] Firestore write failed', String(err?.message).slice(0, 80));
    return errorResponse(request, env, 500, 'firestore_error', 'Could not save your enquiry. Please try again.');
  }

  const lead = {
    requestId: docId,
    email: emailRaw || null,
    phoneE164: verifiedPhone,
    travelDate,
    travelers,
    destinations,
    helpWith,
    locale,
    sourcePath,
    utmSource,
    createdAt,
  };

  const [adminSettled, confirmSettled] = await Promise.allSettled([
    sendTripLeadNotification(env, lead),
    emailRaw ? sendTripLeadConfirmation(env, lead) : Promise.resolve({ ok: false, errorCode: 'not_requested' }),
  ]);
  const adminResult =
    adminSettled.status === 'fulfilled'
      ? adminSettled.value
      : { ok: false, errorCode: 'unknown_error' };
  const confirmResult =
    confirmSettled.status === 'fulfilled'
      ? confirmSettled.value
      : { ok: false, errorCode: 'unknown_error' };

  try {
    if (adminResult.ok) {
      await patchDoc(env, 'tripLeads/' + docId, {
        notificationStatus: 'sent',
        notificationSentAt: Date.now(),
      });
    } else {
      console.error('[leads/trip] notification_failed', { errorCode: adminResult.errorCode, rid: docId.slice(0, 8) });
      await patchDoc(env, 'tripLeads/' + docId, {
        notificationStatus: 'failed',
        notificationErrorCode: adminResult.errorCode,
      });
    }
  } catch (patchErr) {
    console.error('[leads/trip] admin_status_update_failed', String(patchErr?.message).slice(0, 60));
  }

  try {
    if (!emailRaw) {
      await patchDoc(env, 'tripLeads/' + docId, { confirmationEmailStatus: 'not_requested' });
    } else if (confirmResult.ok) {
      await patchDoc(env, 'tripLeads/' + docId, {
        confirmationEmailStatus: 'sent',
        confirmationEmailSentAt: Date.now(),
      });
    } else {
      console.error('[leads/trip] confirmation_failed', { errorCode: confirmResult.errorCode, rid: docId.slice(0, 8) });
      await patchDoc(env, 'tripLeads/' + docId, {
        confirmationEmailStatus: 'failed',
        confirmationEmailErrorCode: confirmResult.errorCode,
      });
    }
  } catch (patchErr) {
    console.error('[leads/trip] confirm_status_update_failed', String(patchErr?.message).slice(0, 60));
  }

  return withCors(jsonResponse({ status: 'received', phoneVerified: Boolean(verifiedPhone) }), request, env);
}
