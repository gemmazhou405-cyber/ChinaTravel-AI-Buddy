import { createDoc, getDoc, patchDoc, queryOneWithId } from '../_shared/firestore.js';
import { generateRecoveryCode, sessionCookieHeader, sha256hex, signSessionToken } from '../_shared/session.js';
import { bindPassDevice, isSaleAccessRevoked } from '../_shared/entitlements.js';

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
  if (data?.success !== true || !sale || sale.refunded || sale.disputed || sale.chargedback || sale.paid !== true) return null;
  return { email: sale.email || '', productId: sale.product_id || '', permalink: sale.product_permalink || '' };
}

function mapTier(env, sale) {
  const tier = sale.productId === env.GUMROAD_TRIP_PRODUCT_ID ? 'trip'
    : sale.productId === env.GUMROAD_GROUP_PRODUCT_ID ? 'group' : null;
  if (!tier) return null;
  if (sale.permalink) {
    const permalinkTier = sale.permalink === (env.GUMROAD_TRIP_PERMALINK || 'oentc') ? 'trip'
      : sale.permalink === (env.GUMROAD_GROUP_PERMALINK || 'mbgkxz') ? 'group' : null;
    if (permalinkTier !== tier) return null;
  }
  return tier;
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' },
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.SESSION_SECRET) return json({ error: 'server_configuration_error' }, 503);
  if (!env.GUMROAD_TRIP_PRODUCT_ID || !env.GUMROAD_GROUP_PRODUCT_ID
    || env.GUMROAD_TRIP_PRODUCT_ID === env.GUMROAD_GROUP_PRODUCT_ID) {
    return json({ error: 'server_configuration_error' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const saleId = String(body.saleId ?? '').trim().slice(0, 100);
  const deviceId = String(body.deviceId ?? '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64);
  if (!saleId || !deviceId) return json({ error: 'bad_request' }, 400);

  try {
    if (await isSaleAccessRevoked(env, saleId)) return json({ error: 'pass_revoked' }, 403);
  } catch {
    return json({ error: 'activation_unavailable' }, 503);
  }

  // 1. Verify with Gumroad
  const sale = await verifyGumroadSale(env, saleId);
  if (!sale) return json({ error: 'invalid_sale' }, 400);
  const tier = mapTier(env, sale);
  if (!tier) return json({ error: 'invalid_sale' }, 400);

  async function existingSession(existing) {
    if (existing.gumroadSaleId !== saleId || existing.tier !== tier) return json({ error: 'invalid_sale' }, 400);
    const bound = await bindPassDevice(env, existing.id, deviceId, tier);
    if (!bound.ok) return json({ error: bound.error, ...(bound.maxDevices ? { maxDevices: bound.maxDevices } : {}) }, bound.status);
    const token = await signSessionToken(env.SESSION_SECRET, existing.id, deviceId);
    return json(
      { alreadyClaimed: true, tier, expiresAt: bound.pass.expiresAt },
      200,
      { 'Set-Cookie': sessionCookieHeader(token) },
    );
  }

  // Retain legacy random-ID passes; a database failure is not "no prior claim".
  try {
    const existing = await queryOneWithId(env, 'passes', 'gumroadSaleId', saleId);
    if (existing) return await existingSession(existing);
  } catch {
    return json({ error: 'activation_unavailable' }, 503);
  }

  // A stable document key makes simultaneous first claims compete on one pass.
  const passId = `sale-${await sha256hex(saleId)}`;
  const config = TIERS[tier];
  const now = Date.now();
  const recoveryCode = generateRecoveryCode();
  const recoveryCodeHash = await sha256hex(recoveryCode);
  const expiresAt = now + config.validDays * 86_400_000;

  try {
    const created = await createDoc(env, 'passes', passId, {
      tier,
      gumroadSaleId: saleId,
      email: sale.email,
      createdAt: now,
      expiresAt,
      messageAllowance: config.messageAllowance,
      messagesUsed: 0,
      itineraryRequestLimit: 20,
      itineraryRequestsUsed: 0,
      devices: [{ id: deviceId, boundAt: now, lastSeenAt: now }],
      recoveryCodeHash,
      marketingConsent: body.marketingConsent
        ? { granted: true, at: now, source: 'checkout' }
        : { granted: false },
    });
    if (created?.gumroadSaleId !== saleId || created?.tier !== tier
      || created?.recoveryCodeHash !== recoveryCodeHash) {
      throw new Error('pass_creation_not_confirmed');
    }
  } catch (error) {
    if (/firestore_error:409:/.test(String(error?.message))) {
      try {
        const existing = await getDoc(env, `passes/${passId}`);
        if (existing) return await existingSession({ ...existing, id: passId });
      } catch { /* fail closed below */ }
    }
    return json({ error: 'activation_unavailable' }, 503);
  }

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
