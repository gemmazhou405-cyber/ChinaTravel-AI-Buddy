import { createDoc } from '../_shared/firestore.js';
import { verifySessionCookie } from '../_shared/session.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

const ALLOWED_FIELDS = new Set([
  'travelStyle', 'groupSize', 'dietaryNeeds', 'languages',
  'destinations', 'duration', 'interests', 'budget',
]);

function sanitize(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!ALLOWED_FIELDS.has(k)) continue;
    if (typeof v === 'string') out[k] = v.slice(0, 200);
    else if (Array.isArray(v)) out[k] = v.slice(0, 20).map((x) => String(x).slice(0, 100));
  }
  return out;
}

export function onRequestOptions() {
  return new Response(null, { status: 204 });
}

export async function onRequestPost({ request, env }) {
  const session = await verifySessionCookie(request.headers.get('Cookie'), env.SESSION_SECRET);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const profileId = session?.passId || crypto.randomUUID();
  const now = Date.now();

  await createDoc(env, 'profiles', profileId, {
    ...sanitize(body),
    passId: session?.passId ?? null,
    updatedAt: now,
  }).catch(() => {});

  return json({ ok: true });
}
