import { createDoc } from '../_shared/firestore.js';
import { sha256hex } from '../_shared/session.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export function onRequestOptions() {
  return new Response(null, { status: 204 });
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const email = String(body.email ?? '').toLowerCase().trim().slice(0, 254);
  if (!email || !email.includes('@')) return json({ error: 'invalid_email' }, 400);

  const now = Date.now();
  const key = await sha256hex(email);
  await createDoc(env, 'subscribers', key, {
    email,
    consentAt: now,
    source: String(body.source ?? 'footer').slice(0, 40),
    locale: String(body.locale ?? '').slice(0, 10),
  }).catch(() => {});

  return json({ ok: true });
}
