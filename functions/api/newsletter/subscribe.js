import { createDoc, getDoc, patchDoc } from '../../_shared/firestore.js';
import { clientIp, errorResponse, jsonResponse, optionsResponse, parseJson, withCors } from '../../_shared/http.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sha256(input) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function onRequestOptions({ request, env }) {
  return optionsResponse(request, env);
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await parseJson(request);
    if (!body || body.website) {
      return withCors(jsonResponse({ status: 'ignored' }), request, env);
    }
    const normalizedEmail = String(body.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(normalizedEmail) || normalizedEmail.length > 160) {
      return errorResponse(request, env, 400, 'invalid_email', 'Please enter a valid email address.');
    }

    const docId = await sha256(normalizedEmail);
    const existing = await getDoc(env, `newsletterLeads/${docId}`);
    const now = Date.now();
    const token = crypto.randomUUID();
    const unsubscribeTokenHash = await sha256(`${normalizedEmail}:${token}`);
    const payload = {
      email: normalizedEmail,
      normalizedEmail,
      locale: String(body.locale || 'en').slice(0, 8),
      sourcePath: String(body.sourcePath || '').slice(0, 500),
      utm_source: String(body.utm_source || '').slice(0, 80),
      utm_medium: String(body.utm_medium || '').slice(0, 80),
      utm_campaign: String(body.utm_campaign || '').slice(0, 120),
      utm_content: String(body.utm_content || '').slice(0, 120),
      consentVersion: '2026-06-13',
      status: 'active',
      subscribedAt: existing?.subscribedAt || now,
      updatedAt: now,
      ipHash: await sha256(clientIp(request)),
      unsubscribeTokenHash,
    };

    if (existing) {
      await patchDoc(env, `newsletterLeads/${docId}`, payload);
      return withCors(jsonResponse({ status: 'already_subscribed', unsubscribeToken: token }), request, env);
    }
    await createDoc(env, 'newsletterLeads', docId, payload);
    return withCors(jsonResponse({ status: 'subscribed', unsubscribeToken: token }), request, env);
  } catch {
    return errorResponse(request, env, 500, 'subscribe_failed', 'Could not subscribe right now.');
  }
}
