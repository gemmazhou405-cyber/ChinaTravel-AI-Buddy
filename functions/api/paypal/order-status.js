import { getDoc } from '../../_shared/firestore.js';
import { errorResponse, jsonResponse, optionsResponse, withCors } from '../../_shared/http.js';
import { orderSafeStatus } from '../../_shared/entitlements.js';
import { verifyFirebaseRequest } from '../../_shared/firebase-auth.js';

export async function onRequestOptions({ request, env }) {
  return optionsResponse(request, env);
}

export async function onRequestGet({ request, env }) {
  try {
    const auth = await verifyFirebaseRequest(request, env);
    const url = new URL(request.url);
    const orderId = url.searchParams.get('orderId') || '';
    if (!orderId) return errorResponse(request, env, 400, 'missing_order_id', 'Missing order ID.');
    const order = await getDoc(env, `orders/${orderId}`);
    if (!order) return errorResponse(request, env, 404, 'order_not_found', 'Order not found.');
    if (order.userId !== auth.uid) return errorResponse(request, env, 403, 'wrong_user', 'This order belongs to another account.');
    return withCors(jsonResponse({
      orderId,
      status: orderSafeStatus(order.status),
      plan: order.plan,
      createdAt: order.createdAt || null,
      capturedAt: order.capturedAt || null,
      entitlementGrantedAt: order.entitlementGrantedAt || null,
    }), request, env);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('auth') || message.includes('token') || message.includes('issuer') || message.includes('audience')) {
      return errorResponse(request, env, 401, 'auth_required', 'Please sign in again.');
    }
    return errorResponse(request, env, 500, 'status_failed', 'Could not read order status.');
  }
}
