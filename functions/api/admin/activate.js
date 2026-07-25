import { createDoc } from '../../_shared/firestore.js';
import { generateRecoveryCode, sha256hex } from '../../_shared/session.js';

const TIERS = {
  trip:  { messageAllowance: 50,  validDays: 14, maxDevices: 2 },
  group: { messageAllowance: 200, validDays: 14, maxDevices: 5 },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost({ request, env }) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token || !env.ADMIN_SECRET || token !== env.ADMIN_SECRET) {
    return json({ error: 'unauthorized' }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  // Accept 'tier' ('trip'/'group') or legacy 'plan' ('trip_pass'/'group_pass')
  const tier = String(body?.tier || (body?.plan || '').replace('_pass', '') || '').trim();
  const note = String(body?.note || body?.email || '').trim().slice(0, 254);

  if (!TIERS[tier]) {
    return json({ error: 'invalid_tier', valid: Object.keys(TIERS) }, 400);
  }

  const config = TIERS[tier];
  const now = Date.now();
  const passId = crypto.randomUUID();
  const recoveryCode = generateRecoveryCode();
  const recoveryCodeHash = await sha256hex(recoveryCode);
  const expiresAt = now + config.validDays * 86_400_000;

  try {
    await createDoc(env, 'passes', passId, {
      tier,
      createdAt: now,
      expiresAt,
      messageAllowance: config.messageAllowance,
      messagesUsed: 0,
      maxDevices: config.maxDevices,
      devices: [],
      recoveryCodeHash,
      adminNote: note,
      source: 'admin_activation',
    });

    await createDoc(env, 'adminActivations', passId, {
      activatedAt: now,
      tier,
      passId,
      note,
      grantedBy: 'admin_endpoint',
    }).catch(() => {});

    return json({
      ok: true,
      tier,
      passId,
      recoveryCode,
      expiresAt,
      validDays: config.validDays,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message.slice(0, 200) : 'unknown';
    return json({ error: 'activation_failed', detail }, 500);
  }
}
