import { grantGumroadEntitlement } from '../../_shared/entitlements.js';
import { createDoc, queryCollection } from '../../_shared/firestore.js';
import { getPlan } from '../../_shared/plans.js';

export async function onRequestPost({ request, env }) {
  // Verify the admin secret
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token || !env.ADMIN_SECRET || token !== env.ADMIN_SECRET) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const email = (body?.email || '').toLowerCase().trim();
  const planId = (body?.plan || '').trim();

  if (!email) {
    return new Response(JSON.stringify({ error: 'missing_email' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const plan = getPlan(planId);
  if (!plan) {
    return new Response(JSON.stringify({ error: 'invalid_plan', valid: ['trip_pass', 'group_pass'] }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Look up the Firebase user by email
    const matchedUsers = await queryCollection(env, 'users', 'email', email, 1);
    const userDoc = matchedUsers[0];

    if (!userDoc || !userDoc.uid) {
      return new Response(JSON.stringify({ error: 'user_not_found', email }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const saleId = `admin_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const { expiresAt } = await grantGumroadEntitlement(env, {
      userId: userDoc.uid,
      planId,
      saleId,
      buyerEmail: email,
    });

    // Log the manual activation
    await createDoc(env, 'adminActivations', saleId, {
      activatedAt: Date.now(),
      email,
      userId: userDoc.uid,
      planId,
      grantedBy: 'admin_endpoint',
    });

    return new Response(JSON.stringify({
      ok: true,
      email,
      uid: userDoc.uid,
      plan: plan.userPlan,
      expiresInDays: plan.durationDays,
      expiresAt,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message.slice(0, 200) : 'unknown';
    return new Response(JSON.stringify({ error: 'activation_failed', detail }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
