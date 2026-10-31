import { removePassDevice } from '../../_shared/entitlements.js';
import { clearCookieHeader, verifySessionCookie } from '../../_shared/session.js';

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
  const session = await verifySessionCookie(request.headers.get('Cookie'), env.SESSION_SECRET);
  if (!session) return json({ error: 'unauthorized' }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const targetId = String(body.deviceId ?? '').trim();
  if (!targetId) return json({ error: 'bad_request' }, 400);

  let result;
  try {
    result = await removePassDevice(env, session.passId, session.deviceId, targetId);
  } catch {
    return json({ error: 'device_update_unavailable' }, 503);
  }
  if (!result.ok) return json({ error: result.error }, result.status);
  if (!result.removed) return json({ removed: false });

  // If removing own device, clear cookie
  const removingSelf = targetId === session.deviceId;
  return json(
    { removed: true, loggedOut: removingSelf },
    200,
    removingSelf ? { 'Set-Cookie': clearCookieHeader() } : {},
  );
}
