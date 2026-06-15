import { activeUserPass } from '../../_shared/entitlements.js';
import { createDoc, getDoc, patchDoc } from '../../_shared/firestore.js';
import { errorResponse, jsonResponse, optionsResponse, parseJson, withCors } from '../../_shared/http.js';
import { approvalUrl, createPaypalOrder } from '../../_shared/paypal.js';
import { getPlan, paymentMode } from '../../_shared/plans.js';
import { verifyFirebaseRequest } from '../../_shared/firebase-auth.js';

export async function onRequestOptions({ request, env }) {
  return optionsResponse(request, env);
}

export async function onRequestPost({ request, env }) {
  try {
    const mode = paymentMode(env);
    if (mode === 'live') return errorResponse(request, env, 403, 'live_disabled', 'Live PayPal checkout is not enabled yet.');
    if (mode === 'manual') return errorResponse(request, env, 409, 'manual_mode', 'Automatic checkout is disabled in manual mode.');

    const auth = await verifyFirebaseRequest(request, env);
    const body = await parseJson(request);
    const plan = getPlan(body?.planId);
    if (!plan) return errorResponse(request, env, 400, 'invalid_plan', 'Invalid travel pass.');

    const active = await activeUserPass(env, auth.uid);
    if (active.active) {
      return errorResponse(request, env, 409, 'active_pass_exists', 'You already have an active travel pass.');
    }

    const idempotencyKey = request.headers.get('Idempotency-Key') || crypto.randomUUID();
    const existingIdempotent = await getDoc(env, `paymentCreateRequests/${auth.uid}_${idempotencyKey}`);
    if (existingIdempotent?.paypalOrderId) {
      const existingOrder = await getDoc(env, `orders/${existingIdempotent.paypalOrderId}`);
      return withCors(jsonResponse({
        orderId: existingIdempotent.paypalOrderId,
        approvalUrl: existingOrder?.approvalUrl || '',
        status: existingOrder?.status || 'pending',
      }), request, env);
    }

    const internalOrderId = `ce_${Date.now()}_${crypto.randomUUID().slice(0, 12)}`;
    const order = await createPaypalOrder(env, { plan, orderId: internalOrderId, userId: auth.uid });
    const approve = approvalUrl(order);
    if (!order?.id || !approve) return errorResponse(request, env, 502, 'paypal_order_incomplete', 'PayPal did not return an approval link.');

    const now = Date.now();
    const orderRecord = {
      userId: auth.uid,
      userEmail: auth.email,
      plan: plan.id,
      amount: plan.price,
      amountCents: plan.amountCents,
      currency: plan.currency,
      environment: env.PAYPAL_ENV || 'sandbox',
      status: 'pending',
      internalOrderId,
      paypalOrderId: order.id,
      approvalUrl: approve,
      createdAt: now,
      sourcePath: body?.sourcePath?.slice?.(0, 500) || '',
      utm_source: body?.utm_source?.slice?.(0, 80) || '',
      utm_medium: body?.utm_medium?.slice?.(0, 80) || '',
      utm_campaign: body?.utm_campaign?.slice?.(0, 120) || '',
      utm_content: body?.utm_content?.slice?.(0, 120) || '',
    };
    await createDoc(env, 'orders', order.id, orderRecord);
    await patchDoc(env, `paymentCreateRequests/${auth.uid}_${idempotencyKey}`, {
      userId: auth.uid,
      paypalOrderId: order.id,
      createdAt: now,
    });

    return withCors(jsonResponse({ orderId: order.id, approvalUrl: approve, status: 'pending' }), request, env);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('auth') || message.includes('token') || message.includes('issuer') || message.includes('audience')) {
      return errorResponse(request, env, 401, 'auth_required', 'Please sign in again.');
    }
    return errorResponse(request, env, 500, 'create_order_failed', 'Could not create PayPal order.');
  }
}
