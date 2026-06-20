import { grantGumroadEntitlement, activeUserPass } from '../../_shared/entitlements.js';
import { patchDoc, queryCollection } from '../../_shared/firestore.js';
import { verifyFirebaseRequest } from '../../_shared/firebase-auth.js';
import { getPlan } from '../../_shared/plans.js';

export async function onRequestPost({ request, env }) {
  try {
    const auth = await verifyFirebaseRequest(request, env);
    const email = (auth.email || '').toLowerCase().trim();
    if (!email) {
      return new Response(JSON.stringify({ ok: false, error: 'no_email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Find any pending Gumroad purchase for this email
    const pending = await queryCollection(env, 'gumroadPendingPurchases', 'email', email, 5);
    const pendingPurchase = pending.find((p) => p.status === 'pending');

    if (!pendingPurchase) {
      return new Response(JSON.stringify({ ok: true, granted: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If user already has an active paid pass, mark the pending record as handled and return
    const { active } = await activeUserPass(env, auth.uid);
    if (active) {
      await patchDoc(env, `gumroadPendingPurchases/${pendingPurchase.saleId}`, {
        status: 'skipped_active_pass',
        claimedAt: Date.now(),
        userId: auth.uid,
      }).catch(() => {});
      return new Response(JSON.stringify({ ok: true, granted: false, reason: 'already_active' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = Date.now();
    await grantGumroadEntitlement(env, {
      userId: auth.uid,
      planId: pendingPurchase.planId,
      saleId: pendingPurchase.saleId,
      buyerEmail: email,
    });

    // Mark both records as claimed
    await patchDoc(env, `gumroadPendingPurchases/${pendingPurchase.saleId}`, {
      status: 'claimed',
      claimedAt: now,
      userId: auth.uid,
    });
    await patchDoc(env, `gumroadSales/${pendingPurchase.saleId}`, {
      status: 'granted',
      grantedAt: now,
      userId: auth.uid,
    }).catch(() => {});

    const plan = getPlan(pendingPurchase.planId);
    return new Response(JSON.stringify({ ok: true, granted: true, plan: plan?.userPlan || pendingPurchase.planId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('auth') || message.includes('token') || message.includes('issuer') || message.includes('audience')) {
      return new Response(JSON.stringify({ error: 'auth_required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: 'claim_failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
