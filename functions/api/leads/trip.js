import {
  commitWrites,
  createDoc,
  createWrite,
  getDoc,
  getDocSnapshot,
  patchDoc,
  queryCollection,
  updateWriteIfUnchanged,
} from '../../_shared/firestore.js';
import {
  clientIp,
  withCors,
  jsonResponse,
  errorResponse,
  optionsResponse,
  parseJson,
} from '../../_shared/http.js';
import { sendTripLeadNotification, sendTripLeadConfirmation } from '../../_shared/email.js';
import { hashIp } from '../../_shared/ip-hash.js';
import { generateTripPlan } from '../../_shared/itinerary.js';
import { sendWhatsAppTripReminder } from '../../_shared/whatsapp.js';
import { activePassForId } from '../../_shared/entitlements.js';
import { verifySessionCookie } from '../../_shared/session.js';
import { sanitizeTouch } from '../../../src/lib/leadSource.ts';
import { COUNTRY_NAMES } from '../../../src/data/chinaVisaPolicies.ts';

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
const PAID_ITINERARY_LIMIT = 20;
const FREE_PLANS_PER_IP_PER_DAY = 5;
const PAID_CLAIM_MAX_ATTEMPTS = 4;
const PAID_CLAIM_STALE_MS = 5 * 60 * 1000;

async function recordEmailDispatchEvent(request, env, docId, event, lead) {
  const eventId = `trip_${docId}_${event}`;
  const sourcePath = typeof lead.sourcePath === 'string' ? lead.sourcePath.split('?')[0].slice(0, 500) : '/';
  const analyticsDoc = {
    event,
    createdAt: Date.now(),
    environment: new URL(request.url).hostname.endsWith('.pages.dev') ? 'preview' : 'production',
    deviceCategory: 'unknown',
    sourcePath,
  };
  if (lead.utmSource) analyticsDoc.utmSource = lead.utmSource;
  if (lead.utmMedium) analyticsDoc.utmMedium = lead.utmMedium;
  if (lead.utmCampaign) analyticsDoc.utmCampaign = lead.utmCampaign;
  if (lead.utmContent) analyticsDoc.utmContent = lead.utmContent;
  try {
    await createDoc(env, 'analyticsEvents', eventId, analyticsDoc);
  } catch (error) {
    if (!isFirestoreConflict(error)) {
      console.error('[leads/trip] email_analytics_write_failed', { event, rid: docId.slice(0, 8) });
    }
  }
}

function checkRateLimit(ipHash) {
  const now = Date.now();
  const prev = (_ipRateMap.get(ipHash) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (prev.length >= RATE_MAX) return false;
  _ipRateMap.set(ipHash, [...prev, now]);
  return true;
}

const CLAIM_STALE_MS = 5 * 60 * 1000;

async function getActivePaidPass(request, env) {
  try {
    const session = await verifySessionCookie(request.headers.get('Cookie'), env.SESSION_SECRET);
    if (!session?.passId) return { active: false, passId: null, pass: null };
    const entitlement = await activePassForId(env, session.passId);
    const pass = entitlement.pass;
    const active = Boolean(
      pass
      && ['trip', 'group'].includes(pass.tier)
      && (!pass.expiresAt || pass.expiresAt > Date.now()),
    );
    return { active, passId: session.passId, pass };
  } catch {
    return { active: false, passId: null, pass: null };
  }
}

function isFirestoreConflict(error) {
  const message = String(error?.message);
  return message.includes('409')
    || message.includes('ABORTED')
    || message.includes('FAILED_PRECONDITION')
    || message.includes('ALREADY_EXISTS');
}

async function reservePaidItinerary(env, { passId, requestId }) {
  const passPath = `passes/${passId}`;
  const claimPath = `tripPlanPassClaims/${passId}_${requestId}`;

  for (let attempt = 0; attempt < PAID_CLAIM_MAX_ATTEMPTS; attempt += 1) {
    const [passSnapshot, claimSnapshot] = await Promise.all([
      getDocSnapshot(env, passPath),
      getDocSnapshot(env, claimPath),
    ]);
    const pass = passSnapshot?.data;
    if (!pass || (pass.expiresAt && pass.expiresAt <= Date.now())) {
      return { ok: false, reason: 'inactive' };
    }
    if (claimSnapshot?.data?.status === 'completed') {
      return { ok: true, claimPath, alreadyCompleted: true };
    }
    if (claimSnapshot?.data?.status === 'reserved') {
      return { ok: false, reason: 'processing' };
    }

    const used = Math.max(0, Number(pass.itineraryRequestsUsed) || 0);
    if (used >= PAID_ITINERARY_LIMIT) {
      return { ok: false, reason: 'limit' };
    }

    const now = Date.now();
    const claimData = {
      passId,
      requestId,
      status: 'reserved',
      createdAt: claimSnapshot?.data?.createdAt || now,
      updatedAt: now,
    };
    const writes = [
      updateWriteIfUnchanged(env, passPath, {
        itineraryRequestLimit: PAID_ITINERARY_LIMIT,
        itineraryRequestsUsed: used + 1,
      }, passSnapshot.updateTime),
      claimSnapshot
        ? updateWriteIfUnchanged(env, claimPath, claimData, claimSnapshot.updateTime)
        : createWrite(env, claimPath, claimData),
    ];

    try {
      await commitWrites(env, writes);
      return { ok: true, claimPath, used: used + 1 };
    } catch (error) {
      if (!isFirestoreConflict(error) || attempt === PAID_CLAIM_MAX_ATTEMPTS - 1) throw error;
    }
  }

  throw new Error('paid_itinerary_reservation_failed');
}

async function finishPaidItinerary(env, { passId, claimPath }, completed) {
  if (completed) {
    await patchDoc(env, claimPath, { status: 'completed', completedAt: Date.now() }, ['status', 'completedAt']);
    return;
  }

  const passPath = `passes/${passId}`;
  for (let attempt = 0; attempt < PAID_CLAIM_MAX_ATTEMPTS; attempt += 1) {
    const [passSnapshot, claimSnapshot] = await Promise.all([
      getDocSnapshot(env, passPath),
      getDocSnapshot(env, claimPath),
    ]);
    if (!claimSnapshot || claimSnapshot.data?.status !== 'reserved') return;
    if (!passSnapshot) {
      await patchDoc(env, claimPath, { status: 'failed', failedAt: Date.now() }, ['status', 'failedAt']);
      return;
    }

    const used = Math.max(0, Number(passSnapshot.data?.itineraryRequestsUsed) || 0);
    try {
      await commitWrites(env, [
        updateWriteIfUnchanged(env, passPath, {
          itineraryRequestLimit: PAID_ITINERARY_LIMIT,
          itineraryRequestsUsed: Math.max(0, used - 1),
        }, passSnapshot.updateTime),
        updateWriteIfUnchanged(env, claimPath, {
          status: 'failed',
          failedAt: Date.now(),
        }, claimSnapshot.updateTime),
      ]);
      return;
    } catch (error) {
      if (!isFirestoreConflict(error) || attempt === PAID_CLAIM_MAX_ATTEMPTS - 1) throw error;
    }
  }
}

async function releaseStalePaidItineraries(env, passId) {
  const claims = await queryCollection(env, 'tripPlanPassClaims', 'passId', passId, 25);
  const staleClaims = claims.filter((claim) => (
    claim.status === 'reserved'
    && Date.now() - (claim.updatedAt || claim.createdAt || 0) >= PAID_CLAIM_STALE_MS
  ));
  for (const claim of staleClaims) {
    await finishPaidItinerary(env, {
      passId,
      claimPath: `tripPlanPassClaims/${claim.id}`,
    }, false);
  }
}

function utcDay(now) {
  return new Date(now).toISOString().slice(0, 10).replace(/-/g, '');
}

// An IP address's daily slots: used ones and fresh pending ones count; failed ones don't.
function activeIpRequests(requests, now) {
  return requests.filter((entry) => entry?.status === 'used'
    || (entry?.status === 'pending' && now - (entry.createdAt || 0) < CLAIM_STALE_MS));
}

/**
 * Free visitors get one itinerary per email address, and an IP address can be used for at most
 * FREE_PLANS_PER_IP_PER_DAY free itineraries per UTC day (shared Wi-Fi, hostels, families).
 * Returns { ok: true, claim } or { ok: false, reason: 'email' | 'ip' | 'email_or_ip' }.
 */
async function reserveFreePlan(env, { emailHash, ipHash, requestId }) {
  const now = Date.now();
  const emailPath = `tripPlanClaims/email_${emailHash}`;
  const ipPath = `tripPlanClaims/ip_${ipHash}_${utcDay(now)}`;
  const [emailSnapshot, ipSnapshot] = await Promise.all([
    getDocSnapshot(env, emailPath),
    getDocSnapshot(env, ipPath),
  ]);

  const emailClaim = emailSnapshot?.data;
  if (emailClaim?.status === 'pending' && now - (emailClaim.createdAt || 0) < CLAIM_STALE_MS) {
    return { ok: false, reason: 'email' };
  }
  if (emailClaim?.status === 'used') {
    // A free plan whose itinerary email failed doesn't count; the visitor may try again.
    const priorLead = emailClaim.requestId
      ? await getDoc(env, `tripLeads/${emailClaim.requestId}`).catch(() => null)
      : null;
    if (priorLead?.confirmationEmailStatus !== 'failed') return { ok: false, reason: 'email' };
  }

  const ipRequests = Array.isArray(ipSnapshot?.data?.requests) ? ipSnapshot.data.requests : [];
  if (activeIpRequests(ipRequests, now).length >= FREE_PLANS_PER_IP_PER_DAY) {
    return { ok: false, reason: 'ip' };
  }

  const emailData = { requestId, status: 'pending', createdAt: now };
  const ipData = {
    day: utcDay(now),
    // Drop stale pending and failed entries so the document stays small.
    requests: [...activeIpRequests(ipRequests, now), { requestId, status: 'pending', createdAt: now }],
    updatedAt: now,
  };
  const writes = [
    emailSnapshot
      ? updateWriteIfUnchanged(env, emailPath, emailData, emailSnapshot.updateTime)
      : createWrite(env, emailPath, emailData),
    ipSnapshot
      ? updateWriteIfUnchanged(env, ipPath, ipData, ipSnapshot.updateTime)
      : createWrite(env, ipPath, ipData),
  ];

  try {
    // Atomically reserve both claims; optimistic preconditions reject races.
    await commitWrites(env, writes);
    return { ok: true, claim: { emailPath, ipPath, requestId } };
  } catch (error) {
    if (isFirestoreConflict(error)) return { ok: false, reason: 'email_or_ip' };
    throw error;
  }
}

async function finishFreePlanClaim(env, claim, status) {
  if (!claim) return;
  const completedAt = Date.now();
  await patchDoc(env, claim.emailPath, { status, completedAt }).catch((error) => {
    console.error('[leads/trip] claim_update_failed', String(error?.message).slice(0, 60));
  });
  // The IP document is shared by up to five requests, so update only this request's entry.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const snapshot = await getDocSnapshot(env, claim.ipPath);
      if (!snapshot) return;
      const requests = Array.isArray(snapshot.data?.requests) ? snapshot.data.requests : [];
      const next = requests.map((entry) => (entry?.requestId === claim.requestId
        ? { ...entry, status, completedAt }
        : entry));
      await commitWrites(env, [
        updateWriteIfUnchanged(env, claim.ipPath, { requests: next, updatedAt: completedAt }, snapshot.updateTime),
      ]);
      return;
    } catch (error) {
      if (!isFirestoreConflict(error) || attempt === 2) {
        console.error('[leads/trip] ip_claim_update_failed', String(error?.message).slice(0, 60));
        return;
      }
    }
  }
}

/**
 * A free visitor whose quota is used up still sent us a real enquiry: store it (status
 * free_plan_blocked) and send the internal notification so someone can reply by hand.
 * Stored under `blocked_<requestId>` so a later retry with a travel pass can still use the
 * request ID, and a repeated blocked retry is deduplicated (no second notification).
 * Never throws: the visitor gets the 409 whatever happens here.
 */
async function recordBlockedFreePlanLead(env, docId, record, lead, reason) {
  const blockedDocId = `blocked_${docId}`;
  let stored = false;
  try {
    await createDoc(env, 'tripLeads', blockedDocId, {
      ...record,
      status: 'free_plan_blocked',
      freePlanBlockedReason: reason,
      notificationStatus: 'pending',
      planGenerationStatus: 'not_attempted',
      confirmationEmailStatus: 'not_attempted',
      customerItineraryEmailStatus: 'not_attempted',
      whatsappReminderStatus: record.contactMethod === 'whatsapp' ? 'not_attempted' : 'not_requested',
    });
    stored = true;
  } catch (error) {
    if (isFirestoreConflict(error)) return;
    // Still notify: an enquiry that reaches the inbox is better than one that is lost entirely.
    console.error('[leads/trip] blocked_lead_write_failed', String(error?.message).slice(0, 80));
  }

  let adminResult;
  try {
    adminResult = await sendTripLeadNotification(env, lead, {
      freePlanBlockedReason: reason,
      planGenerationStatus: 'not_attempted',
      customerItineraryEmailStatus: 'not_attempted',
      whatsappReminderStatus: lead.contactMethod === 'whatsapp' ? 'not_attempted' : 'not_requested',
    });
  } catch {
    adminResult = { ok: false, errorCode: 'unknown_error' };
  }
  if (!adminResult.ok) {
    console.error('[leads/trip] notification_failed', { errorCode: adminResult.errorCode, rid: docId.slice(0, 8) });
  }
  if (!stored) return;
  await patchDoc(env, `tripLeads/${blockedDocId}`, adminResult.ok
    ? { notificationStatus: 'accepted', notificationAcceptedAt: Date.now(), ...(adminResult.providerId ? { notificationProviderId: adminResult.providerId } : {}) }
    : { notificationStatus: 'failed', notificationErrorCode: adminResult.errorCode || 'unknown_error' })
    .catch((error) => {
      console.error('[leads/trip] blocked_lead_status_update_failed', String(error?.message).slice(0, 60));
    });
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
  return [...new Set(value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim().slice(0, maxLength))
    .filter(Boolean))]
    .slice(0, maxItems);
}

function buildPlanPreview(plan) {
  if (!plan || !Array.isArray(plan.daily_itinerary)) return null;
  return {
    title: plan.title,
    summary: plan.summary,
    days: plan.daily_itinerary.slice(0, 1).map((item) => ({
      day: item.day,
      city: item.city,
      morning: item.morning,
      afternoon: item.afternoon,
      evening: item.evening,
    })),
  };
}

export async function onRequestOptions({ request, env }) {
  return optionsResponse(request, env);
}

export async function onRequestPost({ request, env }) {
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLength > 12288) return errorResponse(request, env, 413, 'payload_too_large', 'Request too large.');

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
  const ipHash = await hashIp(env, ip);
  if (!checkRateLimit(ipHash)) {
    return errorResponse(request, env, 429, 'too_many_requests', 'Too many requests. Please try again later.');
  }

  // requestId — used as idempotency key and Firestore document ID
  const requestIdRaw = typeof body.requestId === 'string' ? body.requestId.trim() : '';
  const docId = UUID_RE.test(requestIdRaw) ? requestIdRaw : crypto.randomUUID();

  // Sanitize optional fields
  const cities = parseStringArray(body.cities, 3, 40);
  const interests = parseStringArray(body.interests, 8, 40);
  const dates = clampStr(body.dates, 80);
  const travelDate = clampStr(body.travelDate, 80) ?? dates;
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
  // Optional ISO 3166-1 alpha-2 code of the passport-issuing country (never a passport number).
  const passportCountry = (() => {
    const code = typeof body.passportCountry === 'string' ? body.passportCountry.trim().toUpperCase() : '';
    return /^[A-Z]{2}$/.test(code) && code !== 'ZZ' && COUNTRY_NAMES[code] ? code : null;
  })();
  const arrivalCity = clampStr(body.arrivalCity, 80);
  const destinationCitiesInput = parseStringArray(body.destinationCities);
  const destinationCities = destinationCitiesInput.length > 0 ? destinationCitiesInput : cities;
  const prioritiesInput = parseStringArray(body.priorities);
  const priorities = prioritiesInput.length > 0 ? prioritiesInput : interests;
  const concerns = parseStringArray(body.concerns);
  const consentVersion = clampStr(body.consentVersion, 40) ?? 'trip-lead-2026-09';
  const locale = clampStr(body.locale, 8) ?? 'en';
  const sourcePath = clampStr(body.sourcePath, 500);
  const utmSource = clampStr(body.utmSource, 80);
  const utmMedium = clampStr(body.utmMedium, 80);
  const utmCampaign = clampStr(body.utmCampaign, 120);
  const utmContent = clampStr(body.utmContent, 120);
  const safeCampaignSlug = (value, max = 80) => {
    const normalized = clampStr(value, max);
    return normalized && /^[a-z0-9][a-z0-9._~-]*$/i.test(normalized) ? normalized : null;
  };
  const partnerId = safeCampaignSlug(body.partnerId, 40);
  const partnerType = safeCampaignSlug(body.partnerType, 40);
  const campaignChannel = safeCampaignSlug(body.campaignChannel, 40);
  const campaignName = safeCampaignSlug(body.campaignName, 120);
  const landingVariant = ['hostel', 'visa', 'first-trip'].includes(body.landingVariant) ? body.landingVariant : null;
  const firstTouchSource = clampStr(body.firstTouchSource, 80);
  const firstTouchMedium = clampStr(body.firstTouchMedium, 80);
  const firstTouchCampaign = clampStr(body.firstTouchCampaign, 120);
  const lastTouchSource = clampStr(body.lastTouchSource, 80);
  const lastTouchMedium = clampStr(body.lastTouchMedium, 80);
  const lastTouchCampaign = clampStr(body.lastTouchCampaign, 120);
  const referrer = (() => {
    const value = clampStr(body.referrer, 200);
    if (!value) return null;
    try {
      const url = new URL(value);
      return `${url.origin}${url.pathname}`.slice(0, 200);
    } catch { return null; }
  })();

  // Visit source (first touch kept 30 days in the browser, last touch per visit). Re-sanitised and
  // re-classified here so only host/path referrers and allowlisted values are stored.
  const leadSourceRaw = body.leadSource && typeof body.leadSource === 'object' ? body.leadSource : {};
  const lastTouch = sanitizeTouch(leadSourceRaw.lastTouch);
  const firstTouch = sanitizeTouch(leadSourceRaw.firstTouch) ?? lastTouch;
  const sourceTouch = lastTouch ?? firstTouch;
  const leadChannel = sourceTouch?.channel ?? null;
  const leadChannelDetail = sourceTouch?.channelDetail || null;
  const landingPage = sourceTouch?.landingPage || null;

  const emailHash = await sha256(emailRaw);
  const createdAt = Date.now();

  // Idempotency: if this requestId already exists, skip re-processing
  const existing = await getDoc(env, `tripLeads/${docId}`).catch(() => null);
  if (existing) {
    if (existing.planGenerationStatus === 'failed') {
      return errorResponse(
        request,
        env,
        503,
        'plan_generation_failed',
        'We could not generate your itinerary. Your free request was not used; please try again shortly.',
      );
    }
    const existingEmailStatus = existing.customerItineraryEmailStatus || existing.confirmationEmailStatus;
    if (['failed', 'bounced', 'suppressed', 'complained'].includes(existingEmailStatus)) {
      return errorResponse(
        request,
        env,
        503,
        'email_delivery_failed',
        'We could not email your itinerary. Please try again shortly.',
      );
    }
    const planSucceeded = ['succeeded', 'sent'].includes(existing.planGenerationStatus);
    const emailAccepted = ['accepted', 'sent', 'delivered'].includes(existingEmailStatus);
    if (planSucceeded && emailAccepted) {
      return withCors(jsonResponse({
        status: 'received',
        alreadyProcessed: true,
        planGenerated: true,
        planPreview: buildPlanPreview(existing.generatedPlan),
        whatsappReminderSent: ['accepted', 'sent'].includes(existing.whatsappReminderStatus),
      }), request, env);
    }
    return errorResponse(
      request,
      env,
      409,
      'request_in_progress',
      'This itinerary request is still being processed. Please wait a moment before trying again.',
    );
  }

  // Shared lead payload for both email functions
  const lead = {
    requestId: docId,
    email: emailRaw,
    cities,
    dates,
    interests,
    travelDate,
    travelers,
    tripLength,
    departureCountry,
    passportCountry,
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
    partnerId,
    partnerType,
    campaignChannel,
    campaignName,
    landingVariant,
    firstTouchSource,
    firstTouchMedium,
    firstTouchCampaign,
    lastTouchSource,
    lastTouchMedium,
    lastTouchCampaign,
    referrer,
    firstTouch,
    lastTouch,
    leadChannel,
    leadChannelDetail,
    landingPage,
    createdAt,
  };

  // Stored in tripLeads: the shared payload plus consent and source labels.
  const leadRecord = { ...lead, consentVersion, source: 'buddy_trip_lead' };

  // Paid pass holders can generate new plans. Free visitors get one successful
  // personalised plan per email address, and at most 5 per IP address per day.
  const paidPass = await getActivePaidPass(request, env);
  let freePlanClaim = null;
  let paidPlanClaim = null;
  if (paidPass.active) {
    let reservation;
    try {
      await releaseStalePaidItineraries(env, paidPass.passId);
      reservation = await reservePaidItinerary(env, { passId: paidPass.passId, requestId: docId });
    } catch (error) {
      console.error('[leads/trip] paid_plan_claim_failed', String(error?.message).slice(0, 80));
      return errorResponse(request, env, 500, 'claim_error', 'Could not check travel-pass eligibility. Please try again.');
    }
    if (!reservation.ok) {
      if (reservation.reason === 'limit') {
        return errorResponse(request, env, 409, 'paid_plan_limit_reached', 'This travel pass has reached its 20-itinerary limit.');
      }
      return errorResponse(request, env, 409, 'request_in_progress', 'This itinerary request is already being processed.');
    }
    paidPlanClaim = { passId: paidPass.passId, claimPath: reservation.claimPath };
  } else {
    let reservation;
    try {
      reservation = await reserveFreePlan(env, { emailHash, ipHash, requestId: docId });
    } catch (error) {
      console.error('[leads/trip] free_plan_claim_failed', String(error?.message).slice(0, 80));
      return errorResponse(request, env, 500, 'claim_error', 'Could not check free-plan eligibility. Please try again.');
    }
    if (!reservation.ok) {
      // Keep the enquiry and tell the team anyway: this is still a warm lead worth a reply.
      await recordBlockedFreePlanLead(env, docId, { ...leadRecord, emailHash, ipHash }, lead, reservation.reason);
      return errorResponse(
        request,
        env,
        409,
        'free_plan_used',
        'Your free plan quota has been used. Please use a new email address or upgrade your membership.',
      );
    }
    freePlanClaim = reservation.claim;
  }

  // Write lead to Firestore
  try {
    await createDoc(env, 'tripLeads', docId, {
      ...leadRecord,
      emailHash,
      ipHash,
      status: 'new',
      notificationStatus: 'pending',
      confirmationEmailStatus: 'pending',
      customerItineraryEmailStatus: 'pending',
      planGenerationStatus: 'pending',
      whatsappReminderStatus: contactMethod === 'whatsapp' ? 'pending' : 'not_requested',
    });
  } catch (err) {
    if (String(err?.message).includes(':409:')) {
      // Concurrent duplicate write — treat as already processed
      return withCors(jsonResponse({ status: 'received', alreadyProcessed: true }), request, env);
    }
    console.error('[leads/trip] Firestore write failed', String(err?.message).slice(0, 80));
    await finishFreePlanClaim(env, freePlanClaim, 'failed');
    if (paidPlanClaim) {
      await finishPaidItinerary(env, paidPlanClaim, false).catch((error) => {
        console.error('[leads/trip] paid_claim_rollback_failed', String(error?.message).slice(0, 80));
      });
    }
    return errorResponse(request, env, 500, 'firestore_error', 'Could not save your enquiry. Please try again.');
  }

  // A request is complete only when a real itinerary exists and the customer
  // email provider has accepted that itinerary email. Never consume a quota for
  // a generic receipt or send a reminder for an email that was not accepted.
  let planResult;
  try {
    planResult = await generateTripPlan(env, lead);
  } catch {
    planResult = { ok: false, errorCode: 'unknown_error' };
  }
  const plan = planResult.ok ? planResult.plan : null;
  try {
    await patchDoc(env, `tripLeads/${docId}`, {
      planGenerationStatus: planResult.ok ? 'succeeded' : 'failed',
      ...(planResult.ok
        ? { generatedPlan: plan, planGeneratedAt: Date.now(), planAdjustments: planResult.adjustments || [] }
        : { planGenerationErrorCode: planResult.errorCode || 'unknown_error' }),
    });
  } catch (patchErr) {
    console.error('[leads/trip] plan_status_update_failed', String(patchErr?.message).slice(0, 80));
  }

  let confirmResult = { ok: false, errorCode: 'not_attempted' };
  let whatsappResult = {
    ok: false,
    errorCode: contactMethod === 'whatsapp' ? 'not_attempted' : 'not_requested',
  };

  if (planResult.ok) {
    try {
      confirmResult = await sendTripLeadConfirmation(env, lead, plan);
    } catch {
      confirmResult = { ok: false, errorCode: 'unknown_error' };
    }
    if (confirmResult.ok) {
      try {
        whatsappResult = await sendWhatsAppTripReminder(env, lead);
      } catch {
        whatsappResult = { ok: false, errorCode: 'unknown_error' };
      }
    }
  }

  const customerItineraryEmailStatus = !planResult.ok
    ? 'not_attempted'
    : confirmResult.ok ? 'accepted' : 'failed';
  const whatsappReminderStatus = whatsappResult.ok
    ? 'accepted'
    : whatsappResult.errorCode === 'not_requested' ? 'not_requested'
      : whatsappResult.errorCode === 'not_attempted' ? 'not_attempted' : 'failed';

  // Send the internal notification last so it reports the actual generation
  // and customer-email outcomes instead of only the submitted form fields.
  let adminResult;
  try {
    adminResult = await sendTripLeadNotification(env, lead, {
      planGenerationStatus: planResult.ok ? 'succeeded' : 'failed',
      planGenerationErrorCode: planResult.ok ? null : (planResult.errorCode || 'unknown_error'),
      customerItineraryEmailStatus,
      customerItineraryEmailProviderId: confirmResult.providerId || null,
      customerItineraryEmailErrorCode: confirmResult.ok || confirmResult.errorCode === 'not_attempted'
        ? null
        : confirmResult.errorCode,
      whatsappReminderStatus,
      planAdjustments: planResult.ok ? (planResult.adjustments || []) : [],
      customerEmail: confirmResult.email || null,
    });
  } catch {
    adminResult = { ok: false, errorCode: 'unknown_error' };
  }

  if (!adminResult.ok) {
    console.error('[leads/trip] notification_failed', { errorCode: adminResult.errorCode, rid: docId.slice(0, 8) });
  }
  if (planResult.ok && !confirmResult.ok) {
    console.error('[leads/trip] itinerary_email_failed', {
      errorCode: confirmResult.errorCode,
      providerStatus: confirmResult.providerStatus ?? null,
      providerErrorType: confirmResult.providerErrorType ?? null,
      providerMessage: confirmResult.providerMessage ?? null,
      rid: docId.slice(0, 8),
    });
  }
  if (whatsappReminderStatus === 'failed') {
    console.error('[leads/trip] whatsapp_reminder_failed', { errorCode: whatsappResult.errorCode, rid: docId.slice(0, 8) });
  }

  try {
    const statusPatch = {
      planGenerationStatus: planResult.ok ? 'succeeded' : 'failed',
      ...(planResult.ok
        ? { generatedPlan: plan, planGeneratedAt: Date.now() }
        : { planGenerationErrorCode: planResult.errorCode || 'unknown_error' }),
      notificationStatus: adminResult.ok ? 'accepted' : 'failed',
      confirmationEmailStatus: customerItineraryEmailStatus,
      customerItineraryEmailStatus,
      whatsappReminderStatus,
      ...(confirmResult.email ? { customerItineraryEmailSubject: confirmResult.email.subject, customerItineraryEmailFrom: confirmResult.email.from } : {}),
      ...(adminResult.ok
        ? { notificationAcceptedAt: Date.now(), ...(adminResult.providerId ? { notificationProviderId: adminResult.providerId } : {}) }
        : { notificationErrorCode: adminResult.errorCode }),
      ...(confirmResult.ok
        ? {
            confirmationEmailAcceptedAt: Date.now(),
            customerItineraryEmailAcceptedAt: Date.now(),
            ...(confirmResult.providerId
              ? {
                  confirmationEmailProviderId: confirmResult.providerId,
                  customerItineraryEmailProviderId: confirmResult.providerId,
                }
              : {}),
          }
        : confirmResult.errorCode === 'not_attempted'
          ? {}
          : {
              confirmationEmailErrorCode: confirmResult.errorCode,
              customerItineraryEmailErrorCode: confirmResult.errorCode,
            }),
      ...(whatsappResult.ok ? { whatsappReminderAcceptedAt: Date.now() } : {}),
    };
    await patchDoc(env, `tripLeads/${docId}`, statusPatch);
  } catch (patchErr) {
    console.error('[leads/trip] delivery_status_update_failed', String(patchErr?.message).slice(0, 60));
  }

  if (planResult.ok) {
    await recordEmailDispatchEvent(
      request,
      env,
      docId,
      confirmResult.ok ? 'email_dispatch_success' : 'email_dispatch_failure',
      lead,
    );
  }

  const itineraryCompleted = planResult.ok && confirmResult.ok;
  await finishFreePlanClaim(env, freePlanClaim, itineraryCompleted ? 'used' : 'failed');
  if (paidPlanClaim) {
    await finishPaidItinerary(env, paidPlanClaim, itineraryCompleted).catch((error) => {
      console.error('[leads/trip] paid_claim_finalize_failed', String(error?.message).slice(0, 80));
    });
  }

  const planPreview = buildPlanPreview(plan);

  if (!planResult.ok) {
    return errorResponse(
      request,
      env,
      503,
      'plan_generation_failed',
      'We could not generate your itinerary. Your free request was not used; please try again shortly.',
    );
  }

  if (!confirmResult.ok) {
    return errorResponse(
      request,
      env,
      503,
      'email_delivery_failed',
      'We could not email your itinerary. Please try again shortly.',
    );
  }

  return withCors(jsonResponse({
    status: 'received',
    planGenerated: true,
    planErrorCode: null,
    planPreview,
    whatsappReminderSent: Boolean(whatsappResult.ok),
  }), request, env);
}
