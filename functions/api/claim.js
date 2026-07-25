import { createDoc, getDoc, patchDoc, queryOneWithId } from '../_shared/firestore.js';
import { generateRecoveryCode, sessionCookieHeader, sha256hex, signSessionToken } from '../_shared/session.js';

const TIERS = {
  trip:  { messageAllowance: 50,  validDays: 14, maxDevices: 2 },
  group: { messageAllowance: 200, validDays: 14, maxDevices: 5 },
};

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extraHeaders },
  });
}

async function verifyGumroadSale(env, saleId) {
  if (!env.GUMROAD_ACCESS_TOKEN) return null;
  const url = `https://api.gumroad.com/v2/sales/${encodeURIComponent(saleId)}?access_token=${env.GUMROAD_ACCESS_TOKEN}`;
  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  const sale = data?.sale;
  if (!sale || sale.refunded || sale.disputed || !sale.paid) return null;
  return { email: sale.email || '', productId: sale.product_id || '', productName: sale.product_name || '' };
}

function mapTier(env, productId, productName) {
  if (env.GUMROAD_TRIP_PRODUCT_ID && productId === env.GUMROAD_TRIP_PRODUCT_ID) return 'trip';
  if (env.GUMROAD_GROUP_PRODUCT_ID && productId === env.GUMROAD_GROUP_PRODUCT_ID) return 'group';
  // Fallback: name-based match when product IDs not configured
  return /group/i.test(productName) ? 'group' : 'trip';
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' },
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.SESSION_SECRET) return json({ error: 'server_configuration_error' }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const saleId = String(body.saleId ?? '').trim().slice(0, 100);
  const deviceId = String(body.deviceId ?? '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64);
  if (!saleId || !deviceId) return json({ error: 'bad_request' }, 400);

  // 1. Verify with Gumroad
  const sale = await verifyGumroadSale(env, saleId);
  if (!sale) return json({ error: 'invalid_sale' }, 400);

  // 2. Dedup — same sale claimed before?
  const existing = await queryOneWithId(env, 'passes', 'gumroadSaleId', saleId).catch(() => null);
  if (existing) {
    const config = TIERS[existing.tier] || TIERS.trip;
    const token = await signSessionToken(env.SESSION_SECRET, existing.id, deviceId);
    const alreadyHasDevice = Array.isArray(existing.devices) && existing.devices.some((d) => d.id === deviceId);
    if (!alreadyHasDevice && Array.isArray(existing.devices) && existing.devices.length < config.maxDevices) {
      const now = Date.now();
      await patchDoc(env, `passes/${existing.id}`, {
        devices: [...existing.devices, { id: deviceId, boundAt: now, lastSeenAt: now }],
      }, ['devices']).catch(() => {});
    }
    return json(
      { alreadyClaimed: true, tier: existing.tier, expiresAt: existing.expiresAt },
      200,
      { 'Set-Cookie': sessionCookieHeader(token) },
    );
  }

  // 3. Map tier
  const tier = mapTier(env, sale.productId, sale.productName);
  const config = TIERS[tier] || TIERS.trip;
  const now = Date.now();
  const passId = crypto.randomUUID();
  const recoveryCode = generateRecoveryCode();
  const recoveryCodeHash = await sha256hex(recoveryCode);
  const expiresAt = now + config.validDays * 86_400_000;

  // 4. Create pass document
  await createDoc(env, 'passes', passId, {
    tier,
    gumroadSaleId: saleId,
    email: sale.email,
    createdAt: now,
    expiresAt,
    messageAllowance: config.messageAllowance,
    messagesUsed: 0,
    devices: [{ id: deviceId, boundAt: now, lastSeenAt: now }],
    recoveryCodeHash,
    marketingConsent: body.marketingConsent
      ? { granted: true, at: now, source: 'checkout' }
      : { granted: false },
  });

  // 5. Mark sale as claimed (best-effort)
  await patchDoc(env, `gumroadSales/${saleId}`, { status: 'claimed', passId, claimedAt: now })
    .catch(() => {});

  // 6. Subscriber record if marketing consent given (best-effort)
  if (body.marketingConsent && sale.email) {
    const subKey = await sha256hex(sale.email);
    await createDoc(env, 'subscribers', subKey, {
      email: sale.email,
      consentAt: now,
      source: 'checkout',
      tier,
    }).catch(() => {});
  }

  const token = await signSessionToken(env.SESSION_SECRET, passId, deviceId);
  return json(
    {
      tier,
      expiresAt,
      messageAllowance: config.messageAllowance,
      maxDevices: config.maxDevices,
      recoveryCode, // Only returned once, never stored in plaintext
    },
    200,
    { 'Set-Cookie': sessionCookieHeader(token) },
  );
}
