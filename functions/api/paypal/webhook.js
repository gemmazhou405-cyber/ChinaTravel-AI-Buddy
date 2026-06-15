import { getDoc, patchDoc, createDoc } from '../../_shared/firestore.js';
import { grantEntitlement, markEntitlementSuspended, markOrderStatus } from '../../_shared/entitlements.js';
import { jsonResponse } from '../../_shared/http.js';
import { captureDetails, verifyPaypalWebhook } from '../../_shared/paypal.js';
import { getPlan } from '../../_shared/plans.js';

function orderIdFromEvent(event) {
  return event?.resource?.supplementary_data?.related_ids?.order_id
    || event?.resource?.invoice_id
    || event?.resource?.custom_id?.split?.(':')?.[0]
    || '';
}

export async function onRequestPost({ request, env }) {
  const rawBody = await request.text();
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ ok: false }, { status: 400 });
  }

  try {
    const verified = await verifyPaypalWebhook(env, request, rawBody, event);
    if (!verified) return jsonResponse({ ok: false }, { status: 400 });

    const eventId = event.id || '';
    if (!eventId) return jsonResponse({ ok: false }, { status: 400 });
    const existingEvent = await getDoc(env, `paypalWebhookEvents/${eventId}`);
    if (existingEvent) return jsonResponse({ ok: true, duplicate: true });

    const paypalOrderId = orderIdFromEvent(event);
    await createDoc(env, 'paypalWebhookEvents', eventId, {
      eventType: event.event_type || '',
      paypalOrderId,
      processedAt: Date.now(),
      status: 'received',
    });

    if (!paypalOrderId) return jsonResponse({ ok: true, ignored: true });
    const order = await getDoc(env, `orders/${paypalOrderId}`);
    if (!order) return jsonResponse({ ok: true, ignored: true });
    const plan = getPlan(order.plan);
    if (!plan) return jsonResponse({ ok: true, ignored: true });

    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const details = captureDetails({
        status: 'COMPLETED',
        payer: { payer_id: event.resource?.payer?.payer_id, email_address: event.resource?.payer?.email_address },
        purchase_units: [{
          amount: { value: plan.price, currency_code: plan.currency },
          payments: { captures: [event.resource] },
        }],
      });
      if (
        details.amount === plan.price
        && details.currency === plan.currency
        && (!env.PAYPAL_MERCHANT_ID || !details.payeeMerchantId || details.payeeMerchantId === env.PAYPAL_MERCHANT_ID)
      ) {
        await grantEntitlement(env, { ...order, paypalOrderId }, details);
      }
    } else if (event.event_type === 'PAYMENT.CAPTURE.PENDING') {
      await markOrderStatus(env, paypalOrderId, 'pending');
    } else if (event.event_type === 'PAYMENT.CAPTURE.DECLINED') {
      await markOrderStatus(env, paypalOrderId, 'failed', { failureReason: 'paypal_declined' });
    } else if (event.event_type === 'PAYMENT.CAPTURE.REFUNDED') {
      await markEntitlementSuspended(env, { ...order, paypalOrderId }, 'refunded', { refundedAt: Date.now() });
    } else if (event.event_type === 'PAYMENT.CAPTURE.REVERSED') {
      await markEntitlementSuspended(env, { ...order, paypalOrderId }, 'reversed', { reversedAt: Date.now() });
    }

    await patchDoc(env, `paypalWebhookEvents/${eventId}`, { status: 'processed', processedAt: Date.now() });
    return jsonResponse({ ok: true });
  } catch {
    return jsonResponse({ ok: false }, { status: 500 });
  }
}
