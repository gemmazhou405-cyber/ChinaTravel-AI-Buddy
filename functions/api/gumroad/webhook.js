import { createDoc, getDoc, patchDoc } from '../../_shared/firestore.js';

// GET requests (e.g. Firebase OAuth redirect fallback) go home
export function onRequestGet() {
  return Response.redirect('/', 302);
}

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');
  if (!secret || secret !== env.GUMROAD_WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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
  const productId = (formData.get('product_id') || '').trim();
  const isTest = formData.get('test') === 'true';

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

  // Deduplicate
  const existing = await getDoc(env, `gumroadSales/${saleId}`).catch(() => null);
  if (existing) {
    return new Response(JSON.stringify({ ok: true, duplicate: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const tripPermalink = env.GUMROAD_TRIP_PERMALINK || 'oentc';
  const groupPermalink = env.GUMROAD_GROUP_PERMALINK || 'mbgkxz';
  let tier = null;
  if (permalink === tripPermalink || productId === env.GUMROAD_TRIP_PRODUCT_ID) tier = 'trip';
  else if (permalink === groupPermalink || productId === env.GUMROAD_GROUP_PRODUCT_ID) tier = 'group';

  const now = Date.now();
  try {
    // Record sale — the buyer will call /api/claim to create their pass
    await createDoc(env, 'gumroadSales', saleId, {
      saleId,
      email,
      tier,
      permalink,
      productId,
      status: 'received',
      receivedAt: now,
    });

    if (!tier) {
      await patchDoc(env, `gumroadSales/${saleId}`, { status: 'unknown_product' }).catch(() => {});
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message.slice(0, 200) : 'unknown';
    await patchDoc(env, `gumroadSales/${saleId}`, { status: 'error', error: errorMessage }).catch(() => {});
    return new Response(JSON.stringify({ ok: false, error: 'internal' }), {
      status: 200, // Return 200 so Gumroad doesn't retry a partially-written document
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
