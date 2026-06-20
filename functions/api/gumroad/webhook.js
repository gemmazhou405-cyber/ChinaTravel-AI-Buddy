import { grantGumroadEntitlement } from '../../_shared/entitlements.js';
import { createDoc, getDoc, patchDoc, queryCollection } from '../../_shared/firestore.js';

export async function onRequestPost({ request, env }) {
  // Verify the secret token Gumroad includes in the webhook URL
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');
  if (!secret || secret !== env.GUMROAD_WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Gumroad sends application/x-www-form-urlencoded
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'bad_body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const saleId = (formData.get('sale_id') || '').trim();
  const email = (formData.get('email') || '').toLowerCase().trim();
  const permalink = (formData.get('product_permalink') || '').trim();
  const isTest = formData.get('test') === 'true';

  // Return 200 for anything we don't need to process — prevents Gumroad retries
  if (!saleId || !email) {
    return new Response(JSON.stringify({ ok: true, ignored: true, reason: 'missing_fields' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (isTest) {
    return new Response(JSON.stringify({ ok: true, test: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Map product permalink to internal plan ID
  const tripPermalink = env.GUMROAD_TRIP_PERMALINK || 'oentc';
  const groupPermalink = env.GUMROAD_GROUP_PERMALINK || 'mbgkxz';
  let planId;
  if (permalink === tripPermalink) planId = 'trip_pass';
  else if (permalink === groupPermalink) planId = 'group_pass';
  else {
    return new Response(JSON.stringify({ ok: true, ignored: true, reason: 'unknown_product', permalink }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Deduplicate: if we've already seen this sale_id, skip
  const existing = await getDoc(env, `gumroadSales/${saleId}`).catch(() => null);
  if (existing) {
    return new Response(JSON.stringify({ ok: true, duplicate: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const now = Date.now();

  try {
    // Record the sale immediately so concurrent retries are deduplicated
    await createDoc(env, 'gumroadSales', saleId, {
      saleId,
      email,
      planId,
      permalink,
      status: 'received',
      receivedAt: now,
    });

    // Look up the Firebase user by their email
    const matchedUsers = await queryCollection(env, 'users', 'email', email, 1);
    const userDoc = matchedUsers[0];

    if (userDoc && userDoc.uid) {
      // User account exists — grant plan immediately
      await grantGumroadEntitlement(env, { userId: userDoc.uid, planId, saleId, buyerEmail: email });
      await patchDoc(env, `gumroadSales/${saleId}`, {
        status: 'granted',
        userId: userDoc.uid,
        grantedAt: now,
      });
    } else {
      // No matching account yet — store for pickup when buyer signs in or up
      await patchDoc(env, `gumroadSales/${saleId}`, { status: 'pending' });
      await createDoc(env, 'gumroadPendingPurchases', saleId, {
        saleId,
        email,
        planId,
        status: 'pending',
        createdAt: now,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    // Log the error but still return 200 — Gumroad retrying a partially-written sale is worse
    const errorMessage = err instanceof Error ? err.message.slice(0, 200) : 'unknown';
    await patchDoc(env, `gumroadSales/${saleId}`, { status: 'error', error: errorMessage }).catch(() => {});
    return new Response(JSON.stringify({ ok: false, error: 'internal' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
