import { getDoc, patchDoc, queryOneWithId } from '../_shared/firestore.js';
import { sessionCookieHeader, sha256hex, signSessionToken } from '../_shared/session.js';

const TIERS = {
  trip:  { maxDevices: 2 },
  group: { maxDevices: 5 },
};

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
    const hourKey = `recover:ip:${ip}:${Math.floor(Date.now() / 3_600_000)}`;
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

  const pass = await queryOneWithId(env, 'passes', 'recoveryCodeHash', hash).catch(() => null);
  if (!pass) return json({ error: 'invalid_code' }, 401);

  const config = TIERS[pass.tier] || { maxDevices: 2 };
  const devices = Array.isArray(pass.devices) ? pass.devices : [];
  const alreadyBound = devices.some((d) => d.id === deviceId);

  if (!alreadyBound) {
    if (devices.length >= config.maxDevices) {
      return json({ error: 'max_devices_reached', maxDevices: config.maxDevices }, 403);
    }
    const now = Date.now();
    await patchDoc(env, `passes/${pass.id}`, {
      devices: [...devices, { id: deviceId, boundAt: now, lastSeenAt: now }],
    }, ['devices']);
  }

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
