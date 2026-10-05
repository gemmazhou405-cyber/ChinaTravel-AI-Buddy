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
import { generateTripPlan } from '../../_shared/itinerary.js';
import { sendWhatsAppTripReminder } from '../../_shared/whatsapp.js';
import { activePassForId } from '../../_shared/entitlements.js';
import { verifySessionCookie } from '../../_shared/session.js';

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

async function reserveFreePlan(env, { emailHash, ipHash, requestId }) {
  const paths = [
    `tripPlanClaims/email_${emailHash}`,
    `tripPlanClaims/ip_${ipHash}`,
  ];
  const snapshots = await Promise.all(paths.map((path) => getDocSnapshot(env, path)));
  const now = Date.now();

  const priorLeadIds = [...new Set(snapshots
    .map((snapshot) => snapshot?.data)
    .filter((claim) => claim?.status === 'used' && claim.requestId)
    .map((claim) => claim.requestId))];
  const priorLeads = new Map(await Promise.all(priorLeadIds.map(async (priorRequestId) => [
    priorRequestId,
    await getDoc(env, `tripLeads/${priorRequestId}`).catch(() => null),
  ])));

  for (const [index, path] of paths.entries()) {
    const claim = snapshots[index]?.data;
    const pendingIsFresh = claim?.status === 'pending' && now - (claim.createdAt || 0) < CLAIM_STALE_MS;
    const priorDeliveryFailed = claim?.status === 'used'
      && priorLeads.get(claim.requestId)?.confirmationEmailStatus === 'failed';
    if ((claim?.status === 'used' && !priorDeliveryFailed) || pendingIsFresh) {
      return { ok: false, reason: path.includes('/email_') ? 'email' : 'ip' };
    }
  }

  const data = { requestId, status: 'pending', createdAt: now };
  const writes = paths.map((path, index) => {
    const snapshot = snapshots[index];
    return snapshot
      ? updateWriteIfUnchanged(env, path, data, snapshot.updateTime)
      : createWrite(env, path, data);
  });

  try {
    // Atomically reserve both claims; optimistic preconditions reject races.
    await commitWrites(env, writes);
    return { ok: true, paths };
  } catch (error) {
    const message = String(error?.message);
    if (
      message.includes('409')
      || message.includes('ABORTED')
      || message.includes('FAILED_PRECONDITION')
      || message.includes('ALREADY_EXISTS')
    ) {
      return { ok: false, reason: 'email_or_ip' };
    }
    throw error;
  }
}

async function finishFreePlanClaim(env, paths, status) {
  if (!paths?.length) return;
  await Promise.all(paths.map((path) => patchDoc(env, path, {
    status,
    completedAt: Date.now(),
  }).catch((error) => {
    console.error('[leads/trip] claim_update_failed', String(error?.message).slice(0, 60));
  })));
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
  const lastTouchSource = clampStr(body.lastTouchSource, 80);

  const emailHash = await sha256(emailRaw);
  const createdAt = Date.now();

  // Idempotency: if this requestId already exists, skip re-processing
  const existing = await getDoc(env, `tripLeads/${docId}`).catch(() => null);
  if (existing) {
    return withCors(jsonResponse({ status: 'received', alreadyProcessed: true }), request, env);
  }

  // Paid pass holders can generate new plans. Free visitors get one successful
  // personalised plan per email address and per IP address.
  const paidPass = await getActivePaidPass(request, env);
  let freePlanClaimPaths = null;
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
      return errorResponse(
        request,
        env,
        409,
        'free_plan_used',
        'Your free plan quota has been used. Please use a new email address or upgrade your membership.',
      );
    }
    freePlanClaimPaths = reservation.paths;
  }

  // Write lead to Firestore
  try {
    await createDoc(env, 'tripLeads', docId, {
      requestId: docId,
      email: emailRaw,
      emailHash,
      cities,
      dates,
      interests,
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
      partnerId,
      partnerType,
      campaignChannel,
      campaignName,
      landingVariant,
      firstTouchSource,
      lastTouchSource,
      consentVersion,
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
    await finishFreePlanClaim(env, freePlanClaimPaths, 'failed');
    if (paidPlanClaim) {
      await finishPaidItinerary(env, paidPlanClaim, false).catch((error) => {
        console.error('[leads/trip] paid_claim_rollback_failed', String(error?.message).slice(0, 80));
      });
    }
    return errorResponse(request, env, 500, 'firestore_error', 'Could not save your enquiry. Please try again.');
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
    lastTouchSource,
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
      console.error('[leads/trip] confirmation_failed', {
        errorCode: confirmResult.errorCode,
        providerStatus: confirmResult.providerStatus ?? null,
        providerErrorType: confirmResult.providerErrorType ?? null,
        providerMessage: confirmResult.providerMessage ?? null,
        rid: docId.slice(0, 8),
      });
      await patchDoc(env, `tripLeads/${docId}`, {
        confirmationEmailStatus: 'failed',
        confirmationEmailErrorCode: confirmResult.errorCode,
      });
    }
  } catch (patchErr) {
    console.error('[leads/trip] confirm_status_update_failed', String(patchErr?.message).slice(0, 60));
  }

  await recordEmailDispatchEvent(
    request,
    env,
    docId,
    confirmResult.ok ? 'email_dispatch_success' : 'email_dispatch_failure',
    lead,
  );

  // A free itinerary is consumed only when the customer email provider accepts
  // the message. Failed delivery attempts remain retryable.
  await finishFreePlanClaim(env, freePlanClaimPaths, confirmResult.ok ? 'used' : 'failed');
  if (paidPlanClaim) {
    await finishPaidItinerary(env, paidPlanClaim, confirmResult.ok).catch((error) => {
      console.error('[leads/trip] paid_claim_finalize_failed', String(error?.message).slice(0, 80));
    });
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

  const planPreview = plan
    ? {
        title: plan.title,
        summary: plan.summary,
        days: plan.daily_itinerary.slice(0, 1).map((item) => ({
          day: item.day,
          city: item.city,
          morning: item.morning,
          afternoon: item.afternoon,
          evening: item.evening,
        })),
      }
    : null;

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
    planGenerated: Boolean(plan),
    planErrorCode: plan ? null : planResult.errorCode,
    planPreview,
    whatsappReminderSent: Boolean(whatsappResult.ok),
  }), request, env);
}
