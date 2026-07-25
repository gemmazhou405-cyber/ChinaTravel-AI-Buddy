import { getDoc } from '../../_shared/firestore.js';
import { verifySessionCookie } from '../../_shared/session.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, private' },
  });
}

export async function onRequestGet({ request, env }) {
  const session = await verifySessionCookie(request.headers.get('Cookie'), env.SESSION_SECRET);
  if (!session) return json({ error: 'unauthorized' }, 401);

  const pass = await getDoc(env, `passes/${session.passId}`).catch(() => null);
  if (!pass) return json({ error: 'unauthorized' }, 401);

  const devices = (Array.isArray(pass.devices) ? pass.devices : []).map((d) => ({
    id: d.id,
    boundAt: d.boundAt,
    lastSeenAt: d.lastSeenAt,
    isCurrent: d.id === session.deviceId,
  }));

  return json({ devices });
}
