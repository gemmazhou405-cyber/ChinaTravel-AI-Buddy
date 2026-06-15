import { getDoc, patchDoc } from '../../_shared/firestore.js';
import { errorResponse, jsonResponse, optionsResponse, parseJson, withCors } from '../../_shared/http.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sha256(input) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function unsubscribe(env, email, token) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(normalizedEmail)) return { ok: false, code: 'invalid_email' };
  const docId = await sha256(normalizedEmail);
  const existing = await getDoc(env, `newsletterLeads/${docId}`);
  if (!existing) return { ok: true, status: 'not_found' };
  if (token) {
    const tokenHash = await sha256(`${normalizedEmail}:${token}`);
    if (existing.unsubscribeTokenHash && tokenHash !== existing.unsubscribeTokenHash) {
      return { ok: false, code: 'invalid_token' };
    }
  }
  await patchDoc(env, `newsletterLeads/${docId}`, {
    status: 'unsubscribed',
    unsubscribedAt: Date.now(),
    updatedAt: Date.now(),
  });
  return { ok: true, status: 'unsubscribed' };
}

export async function onRequestOptions({ request, env }) {
  return optionsResponse(request, env);
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const result = await unsubscribe(env, url.searchParams.get('email'), url.searchParams.get('token'));
  if (!result.ok) return errorResponse(request, env, 400, result.code, 'Could not unsubscribe.');
  return withCors(jsonResponse(result), request, env);
}

export async function onRequestPost({ request, env }) {
  const body = await parseJson(request);
  const result = await unsubscribe(env, body?.email, body?.token);
  if (!result.ok) return errorResponse(request, env, 400, result.code, 'Could not unsubscribe.');
  return withCors(jsonResponse(result), request, env);
}
