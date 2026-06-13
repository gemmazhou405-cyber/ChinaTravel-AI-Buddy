import { paypalBaseUrl } from './plans.js';

export async function paypalAccessToken(env) {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new Error('server_missing_paypal_credentials');
  }
  const credentials = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);
  const res = await fetch(`${paypalBaseUrl(env)}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error('paypal_token_failed');
  const body = await res.json();
  return body.access_token;
}

export async function createPaypalOrder(env, { plan, orderId, userId }) {
  const token = await paypalAccessToken(env);
  const origin = 'https://chinaeasebuddy.com';
  const res = await fetch(`${paypalBaseUrl(env)}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': orderId,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId,
          custom_id: `${userId}:${plan.id}`,
          invoice_id: orderId,
          description: plan.itemName,
          amount: {
            currency_code: plan.currency,
            value: plan.price,
            breakdown: {
              item_total: {
                currency_code: plan.currency,
                value: plan.price,
              },
            },
          },
          items: [
            {
              name: plan.itemName,
              quantity: '1',
              unit_amount: {
                currency_code: plan.currency,
                value: plan.price,
              },
            },
          ],
        },
      ],
      application_context: {
        brand_name: 'ChinaEase Buddy',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: `${origin}/?payment=paypal-return&order=${encodeURIComponent(orderId)}`,
        cancel_url: `${origin}/?payment=paypal-cancel&order=${encodeURIComponent(orderId)}`,
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`paypal_create_failed:${res.status}:${text.slice(0, 200)}`);
  }
  return res.json();
}

export async function capturePaypalOrder(env, paypalOrderId) {
  const token = await paypalAccessToken(env);
  const res = await fetch(`${paypalBaseUrl(env)}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `capture-${paypalOrderId}`,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok && body?.name !== 'ORDER_ALREADY_CAPTURED') {
    throw new Error(`paypal_capture_failed:${res.status}:${JSON.stringify(body).slice(0, 200)}`);
  }
  return body;
}

export function approvalUrl(order) {
  return order?.links?.find((link) => link.rel === 'approve')?.href || '';
}

export function captureDetails(order) {
  const unit = order?.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  return {
    status: order?.status || '',
    captureStatus: capture?.status || '',
    captureId: capture?.id || '',
    amount: capture?.amount?.value || unit?.amount?.value || '',
    currency: capture?.amount?.currency_code || unit?.amount?.currency_code || '',
    payerId: order?.payer?.payer_id || '',
    payerEmail: order?.payer?.email_address || '',
    payeeMerchantId: unit?.payee?.merchant_id || capture?.payee?.merchant_id || '',
  };
}

export async function verifyPaypalWebhook(env, request, rawBody, event) {
  if (!env.PAYPAL_WEBHOOK_ID) throw new Error('server_missing_paypal_webhook_id');
  const token = await paypalAccessToken(env);
  const res = await fetch(`${paypalBaseUrl(env)}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: request.headers.get('PayPal-Auth-Algo'),
      cert_url: request.headers.get('PayPal-Cert-Url'),
      transmission_id: request.headers.get('PayPal-Transmission-Id'),
      transmission_sig: request.headers.get('PayPal-Transmission-Sig'),
      transmission_time: request.headers.get('PayPal-Transmission-Time'),
      webhook_id: env.PAYPAL_WEBHOOK_ID,
      webhook_event: event,
    }),
  });
  if (!res.ok) return false;
  const body = await res.json();
  return body.verification_status === 'SUCCESS';
}
