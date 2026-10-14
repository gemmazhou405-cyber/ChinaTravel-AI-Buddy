import { createDoc, patchDoc, queryCollection } from '../../_shared/firestore.js';
import { sendTripEmailDeliveryAlert } from '../../_shared/email.js';
import { verifyResendWebhook } from '../../_shared/resend-webhook.js';

const MAX_BODY_BYTES = 64 * 1024;
const TRACKED_EVENTS = new Set([
  'email.sent',
  'email.delivered',
  'email.delivery_delayed',
  'email.bounced',
  'email.failed',
  'email.suppressed',
  'email.complained',
  'email.opened',
  'email.clicked',
]);
const FAILURE_EVENTS = new Set([
  'email.bounced',
  'email.failed',
  'email.suppressed',
  'email.complained',
]);

function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function eventTimestamp(value) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function deliveryPatch(event, webhookId) {
  const receivedAt = eventTimestamp(event.created_at);
  const patch = {
    customerItineraryEmailLastEvent: event.type,
    customerItineraryEmailLastEventAt: receivedAt,
    customerItineraryEmailLastWebhookId: webhookId,
  };
  if (event.type === 'email.sent') {
    patch.customerItineraryEmailStatus = 'sent';
    patch.confirmationEmailStatus = 'sent';
    patch.customerItineraryEmailSentAt = receivedAt;
  } else if (event.type === 'email.delivered') {
    patch.customerItineraryEmailStatus = 'delivered';
    patch.confirmationEmailStatus = 'delivered';
    patch.customerItineraryEmailDeliveredAt = receivedAt;
  } else if (event.type === 'email.delivery_delayed') {
    patch.customerItineraryEmailStatus = 'delayed';
    patch.confirmationEmailStatus = 'delayed';
    patch.customerItineraryEmailDelayedAt = receivedAt;
  } else if (event.type === 'email.bounced') {
    patch.customerItineraryEmailStatus = 'bounced';
    patch.confirmationEmailStatus = 'bounced';
    patch.customerItineraryEmailBouncedAt = receivedAt;
    if (typeof event.data?.bounce?.type === 'string') {
      patch.customerItineraryEmailBounceType = event.data.bounce.type.slice(0, 40);
    }
  } else if (event.type === 'email.failed' || event.type === 'email.suppressed') {
    const status = event.type.slice('email.'.length);
    patch.customerItineraryEmailStatus = status;
    patch.confirmationEmailStatus = status;
    patch.customerItineraryEmailFailedAt = receivedAt;
  } else if (event.type === 'email.complained') {
    patch.customerItineraryEmailStatus = 'complained';
    patch.confirmationEmailStatus = 'complained';
    patch.customerItineraryEmailComplainedAt = receivedAt;
  } else if (event.type === 'email.opened') {
    patch.customerItineraryEmailOpenedAt = receivedAt;
  } else if (event.type === 'email.clicked') {
    patch.customerItineraryEmailClickedAt = receivedAt;
  }
  return patch;
}

export async function onRequestPost({ request, env }) {
  if (!env.RESEND_WEBHOOK_SECRET) return response({ ok: false, error: 'missing_config' }, 503);
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) return response({ ok: false, error: 'payload_too_large' }, 413);

  const payload = await request.text();
  if (new TextEncoder().encode(payload).byteLength > MAX_BODY_BYTES) {
    return response({ ok: false, error: 'payload_too_large' }, 413);
  }
  const verified = await verifyResendWebhook({
    payload,
    headers: request.headers,
    secret: env.RESEND_WEBHOOK_SECRET,
  });
  if (!verified) return response({ ok: false, error: 'invalid_signature' }, 400);

  let event;
  try {
    event = JSON.parse(payload);
  } catch {
    return response({ ok: false, error: 'invalid_json' }, 400);
  }
  if (!TRACKED_EVENTS.has(event?.type)) return response({ ok: true, ignored: true });

  const providerId = typeof event.data?.email_id === 'string' ? event.data.email_id.slice(0, 200) : '';
  const webhookId = (request.headers.get('svix-id') || request.headers.get('webhook-id') || '').slice(0, 200);
  if (!providerId || !webhookId) return response({ ok: true, ignored: true, reason: 'missing_id' });

  try {
    const leads = await queryCollection(env, 'tripLeads', 'customerItineraryEmailProviderId', providerId, 1);
    const lead = leads[0];
    if (!lead) return response({ ok: true, ignored: true, reason: 'unmatched_email' });

    const incomingAt = eventTimestamp(event.created_at);
    if ((lead.customerItineraryEmailLastEventAt || 0) > incomingAt) {
      return response({ ok: true, ignored: true, reason: 'older_event' });
    }

    await patchDoc(env, `tripLeads/${lead.id}`, deliveryPatch(event, webhookId));
    if (FAILURE_EVENTS.has(event.type)) {
      await sendTripEmailDeliveryAlert(env, lead, {
        eventType: event.type,
        providerId,
        webhookId,
      }).catch(() => {});
    }
    await createDoc(env, 'resendWebhookEvents', webhookId, {
      webhookId,
      providerId,
      type: event.type,
      leadId: lead.id,
      receivedAt: Date.now(),
      eventCreatedAt: incomingAt,
    }).catch(() => {});
    return response({ ok: true });
  } catch (error) {
    console.error('[webhooks/resend] processing_failed', String(error?.message).slice(0, 100));
    return response({ ok: false, error: 'processing_failed' }, 500);
  }
}
