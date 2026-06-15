import { grantEntitlement } from '../../_shared/entitlements.js';
import { getDoc, patchDoc } from '../../_shared/firestore.js';
import { errorResponse, jsonResponse, optionsResponse, parseJson, withCors } from '../../_shared/http.js';
import { captureDetails, capturePaypalOrder } from '../../_shared/paypal.js';
import { getPlan, paymentMode } from '../../_shared/plans.js';
import { verifyFirebaseRequest } from '../../_shared/firebase-auth.js';

export async function onRequestOptions({ request, env }) {
  return optionsResponse(request, env);
}

export async function onRequestPost({ request, env }) {
  try {
    const mode = paymentMode(env);
    if (mode !== 'sandbox') return errorResponse(request, env, 409, 'automatic_checkout_disabled', 'Automatic checkout is not enabled.');

    const auth = await verifyFirebaseRequest(request, env);
    const body = await parseJson(request);
    const paypalOrderId = String(body?.orderId || '').trim();
    if (!paypalOrderId) return errorResponse(request, env, 400, 'missing_order_id', 'Missing PayPal order ID.');

    const order = await getDoc(env, `orders/${paypalOrderId}`);
    if (!order) return errorResponse(request, env, 404, 'order_not_found', 'Order not found.');
    if (order.userId !== auth.uid) return errorResponse(request, env, 403, 'wrong_user', 'This order belongs to another account.');
    if (order.status === 'completed' && order.entitlementGrantedAt) {
      return withCors(jsonResponse({ status: 'completed', plan: order.plan, alreadyGranted: true }), request, env);
    }

    const plan = getPlan(order.plan);
    if (!plan) return errorResponse(request, env, 400, 'invalid_order_plan', 'Invalid order plan.');
    const captured = await capturePaypalOrder(env, paypalOrderId);
    const details = captureDetails(captured);
    if (details.status !== 'COMPLETED' || details.captureStatus !== 'COMPLETED') {
      await patchDoc(env, `orders/${paypalOrderId}`, { status: 'pending', updatedAt: Date.now() });
      return withCors(jsonResponse({ status: 'pending', message: 'Payment is still being confirmed.' }), request, env);
    }
    if (details.amount !== plan.price || details.currency !== plan.currency) {
      await patchDoc(env, `orders/${paypalOrderId}`, { status: 'failed', failureReason: 'amount_or_currency_mismatch', updatedAt: Date.now() });
      return errorResponse(request, env, 409, 'amount_mismatch', 'Payment amount could not be verified.');
    }
    if (env.PAYPAL_MERCHANT_ID && details.payeeMerchantId && details.payeeMerchantId !== env.PAYPAL_MERCHANT_ID) {
      await patchDoc(env, `orders/${paypalOrderId}`, { status: 'failed', failureReason: 'merchant_mismatch', updatedAt: Date.now() });
      return errorResponse(request, env, 409, 'merchant_mismatch', 'Payment merchant could not be verified.');
    }

    const result = await grantEntitlement(env, { ...order, paypalOrderId }, details);
    return withCors(jsonResponse({
      status: 'completed',
      plan: plan.userPlan,
      aiLimit: plan.aiLimit,
      scanLimit: plan.scanLimit,
      expiresAt: result.expiresAt || null,
      alreadyGranted: result.alreadyGranted,
    }), request, env);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('auth') || message.includes('token') || message.includes('issuer') || message.includes('audience')) {
      return errorResponse(request, env, 401, 'auth_required', 'Please sign in again.');
    }
    return errorResponse(request, env, 500, 'capture_failed', 'Could not confirm payment.');
  }
}
