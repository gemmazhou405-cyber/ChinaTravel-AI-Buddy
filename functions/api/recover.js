import { queryOneWithId } from '../_shared/firestore.js';
import { bindPassDevice } from '../_shared/entitlements.js';
import { sessionCookieHeader, sha256hex, signSessionToken } from '../_shared/session.js';
import { hashIp } from '../_shared/ip-hash.js';

// Strip formatting dashes so "ABCD-EFGH-IJKL" → "ABCDEFGHIJKL"
function normalizeCode(code) {
  return String(code ?? '').toUpperCase().replace(/[^A-Z2-9]/g, '').slice(0, 12);
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extraHeaders },
  });
}

export function onRequestOptions() {
  return new Response(null, { status: 204 });
}

export async function onRequestPost({ request, env }) {
  if (!env.SESSION_SECRET) return json({ error: 'server_configuration_error' }, 503);

  // IP-based rate limit: max 5 recovery attempts per hour per IP
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
  if (env.RATE_LIMIT) {
    const hourKey = `recover:ip:${await hashIp(env, ip)}:${Math.floor(Date.now() / 3_600_000)}`;
    const count = Number(await env.RATE_LIMIT.get(hourKey).catch(() => null) ?? 0);
    if (count >= 5) return json({ error: 'rate_limited' }, 429);
    await env.RATE_LIMIT.put(hourKey, String(count + 1), { expirationTtl: 7200 }).catch(() => {});
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const rawCode = normalizeCode(body.code);
  const deviceId = String(body.deviceId ?? '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64);
  if (rawCode.length !== 12 || !deviceId) return json({ error: 'bad_request' }, 400);

  // Re-format to canonical display form before hashing
  const code = `${rawCode.slice(0, 4)}-${rawCode.slice(4, 8)}-${rawCode.slice(8, 12)}`;
  const hash = await sha256hex(code);

  let pass;
  try {
    pass = await queryOneWithId(env, 'passes', 'recoveryCodeHash', hash);
  } catch {
    return json({ error: 'recovery_unavailable' }, 503);
  }
  if (!pass) return json({ error: 'invalid_code' }, 401);

  let bound;
  try {
    bound = await bindPassDevice(env, pass.id, deviceId);
  } catch {
    return json({ error: 'recovery_unavailable' }, 503);
  }
  if (!bound.ok) return json({ error: bound.error, ...(bound.maxDevices ? { maxDevices: bound.maxDevices } : {}) }, bound.status);
  pass = { ...bound.pass, id: pass.id };

  const token = await signSessionToken(env.SESSION_SECRET, pass.id, deviceId);
  const now = Date.now();
  return json(
    {
      tier: pass.tier,
      expiresAt: pass.expiresAt,
      expired: Boolean(pass.expiresAt && pass.expiresAt < now),
      remaining: Math.max(0, (pass.messageAllowance ?? 0) - (pass.messagesUsed ?? 0)),
    },
    200,
    { 'Set-Cookie': sessionCookieHeader(token) },
  );
}
