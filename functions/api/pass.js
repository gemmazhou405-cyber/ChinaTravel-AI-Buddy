import { getDoc } from '../_shared/firestore.js';
import { verifySessionCookie } from '../_shared/session.js';

const TIERS = {
  trip:  { maxDevices: 2 },
  group: { maxDevices: 5 },
};

function json(data) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, private' },
  });
}

export async function onRequestGet({ request, env }) {
  const session = await verifySessionCookie(request.headers.get('Cookie'), env.SESSION_SECRET);
  if (!session) return json({ tier: 'free' });

  let pass;
  try {
    pass = await getDoc(env, `passes/${session.passId}`);
  } catch {
    return json({ tier: 'free' });
  }
  if (!pass) return json({ tier: 'free' });

  const now = Date.now();
  const expired = Boolean(pass.expiresAt && pass.expiresAt < now);
  const remaining = Math.max(0, (pass.messageAllowance ?? 0) - (pass.messagesUsed ?? 0));
  const devices = Array.isArray(pass.devices) ? pass.devices : [];
  const maxDevices = TIERS[pass.tier]?.maxDevices ?? 2;

  return json({
    tier: expired ? 'free' : (pass.tier ?? 'free'),
    expiresAt: pass.expiresAt ?? null,
    messagesUsed: pass.messagesUsed ?? 0,
    messageAllowance: pass.messageAllowance ?? 0,
    remaining,
    expired,
    deviceCount: devices.length,
    maxDevices,
  });
}
