import { CUSTOMER_FROM_DEFAULT, LIN_EMAIL, renderItineraryEmail } from './itinerary-email.js';

const EMAIL_TIMEOUT_MS = 5000;
const CHINAEASE_CONTACT_EMAIL = 'chinaeastbuddy@gmail.com';
const ADMIN_FROM_DEFAULT = 'ChinaEase Buddy <leads@notify.chinaeasebuddy.com>';

function escapeHtml(str) {
  if (str === null || str === undefined) return 'Not provided';
  const s = String(str).trim();
  if (!s) return 'Not provided';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function textVal(v) {
  if (v === null || v === undefined) return 'Not provided';
  const s = String(v).trim();
  return s || 'Not provided';
}

function listVal(value) {
  return Array.isArray(value) && value.length ? value.join(', ') : 'Not provided';
}

function outcomeLabel(value, labels) {
  return labels[value] || 'Not attempted';
}

function pathOnly(value) {
  return typeof value === 'string' && value ? value.split(/[?#]/)[0] || '/' : '';
}

function channelLabel(touch) {
  if (!touch) return 'unknown';
  return touch.channelDetail ? `${touch.channel} (${touch.channelDetail})` : touch.channel;
}

/** "Channel: organic_search (google.com) · Landing page: /x/ · Submitted on: /" (last touch). */
export function sourceSummaryLine(lead) {
  const touch = lead.lastTouch || lead.firstTouch;
  return [
    `Channel: ${channelLabel(touch)}`,
    `Landing page: ${touch?.landingPage || 'unknown'}`,
    `Submitted on: ${pathOnly(lead.sourcePath) || 'unknown'}`,
  ].join(' · ');
}

function touchDetails(touch) {
  if (!touch) return [['Recorded', 'No source data (storage blocked or older page version)']];
  const utm = [
    touch.utmSource && `source=${touch.utmSource}`,
    touch.utmMedium && `medium=${touch.utmMedium}`,
    touch.utmCampaign && `campaign=${touch.utmCampaign}`,
    touch.utmContent && `content=${touch.utmContent}`,
  ].filter(Boolean).join(', ');
  return [
    ['Channel', channelLabel(touch)],
    ['Referrer', touch.referrer || 'none (direct)'],
    ['Landing page', touch.landingPage || 'unknown'],
    ['UTM', utm || 'none'],
    ['Partner', touch.partner || 'none'],
    ['Recorded at', touch.capturedAt ? new Date(touch.capturedAt).toISOString() : 'unknown'],
  ];
}

function statusLabels(outcome) {
  return {
    planStatus: outcomeLabel(outcome.planGenerationStatus, { succeeded: 'Succeeded', failed: 'Failed' }),
    customerEmailStatus: outcomeLabel(outcome.customerItineraryEmailStatus, {
      accepted: 'Accepted by email provider',
      failed: 'Failed',
    }),
    whatsappStatus: outcomeLabel(outcome.whatsappReminderStatus, {
      accepted: 'Accepted by WhatsApp provider',
      failed: 'Failed',
      not_requested: 'Not requested',
    }),
  };
}

function leadRows(lead) {
  return [
    ['Submitted at', lead.createdAt ? new Date(lead.createdAt).toISOString() : null],
    ['Email', lead.email],
    ['Travel date', lead.travelDate],
    ['Travelers', lead.travelers],
    ['Trip length', lead.tripLength ? `${lead.tripLength} days` : null],
    ['Departure country', lead.departureCountry],
    ['Arrival city', lead.arrivalCity],
    ['Cities considered', listVal(lead.destinationCities)],
    ['Priorities', listVal(lead.priorities)],
    ['Concerns', listVal(lead.concerns)],
    ['Help needed', lead.helpWith],
    ['Preferred contact', lead.contactMethod],
    ['WhatsApp', lead.whatsapp],
    ['Locale', lead.locale],
    ['Source path', lead.sourcePath],
    ['UTM source', lead.utmSource],
    ['UTM medium', lead.utmMedium],
    ['UTM campaign', lead.utmCampaign],
    ['UTM content', lead.utmContent],
    ['Landing variant', lead.landingVariant],
    ['Partner ID', lead.partnerId],
    ['Partner type', lead.partnerType],
    ['Campaign channel', lead.campaignChannel],
    ['Campaign name', lead.campaignName],
  ];
}

function customerEmailSection(outcome) {
  const email = outcome.customerEmail;
  if (!email) {
    const reason = outcome.planGenerationStatus === 'failed'
      ? 'no itinerary was generated, so no email was sent'
      : 'no itinerary email was sent';
    return { html: `<p style="margin:0 0 16px;"><strong>The customer received nothing:</strong> ${escapeHtml(reason)}.</p>`, text: [`The customer received nothing: ${reason}.`] };
  }
  const { customerEmailStatus } = statusLabels(outcome);
  const meta = [
    ['Sending status', customerEmailStatus],
    ['From', email.from],
    ['Subject', email.subject],
    ['Resend email ID', outcome.customerItineraryEmailProviderId],
    ['Error code', outcome.customerItineraryEmailErrorCode],
  ];
  return {
    html: `<table style="border-collapse:collapse;margin:0 0 12px;">${meta.map(([label, value]) => `<tr><td style="padding:2px 12px 2px 0;font-weight:600;white-space:nowrap;">${label}</td><td style="padding:2px 0;">${escapeHtml(value)}</td></tr>`).join('')}</table>
<div style="border:1px solid #d0d7de;border-radius:8px;padding:16px;background:#fafafa;font-size:14px;">${email.bodyHtml}</div>`,
    text: [
      ...meta.map(([label, value]) => `${label}: ${textVal(value)}`),
      '',
      '----- customer email start -----',
      email.text,
      '----- customer email end -----',
    ],
  };
}

function buildHtml(lead, outcome = {}) {
  const { planStatus, customerEmailStatus, whatsappStatus } = statusLabels(outcome);
  const statusRows = [
    ['Plan generation', planStatus],
    ['Customer itinerary email', customerEmailStatus],
    ['Customer email ID', outcome.customerItineraryEmailProviderId],
    ['Plan error code', outcome.planGenerationErrorCode],
    ['Customer email error code', outcome.customerItineraryEmailErrorCode],
    ['Plan adjustments', outcome.planAdjustments?.length ? outcome.planAdjustments.join('; ') : 'None'],
    ['WhatsApp reminder', whatsappStatus],
  ];
  const table = (rows) => `<table style="border-collapse:collapse;width:100%;margin:0 0 16px;">${rows
    .map(([label, value]) => `<tr><td style="padding:4px 12px 4px 0;font-weight:600;white-space:nowrap;vertical-align:top;">${label}</td><td style="padding:4px 0;">${escapeHtml(value)}</td></tr>`)
    .join('\n')}</table>`;
  const customer = customerEmailSection(outcome);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:sans-serif;font-size:14px;color:#111;max-width:680px;margin:0 auto;padding:24px;">
<div style="background:#edf5f2;border:1px solid #155e63;border-radius:8px;padding:12px 14px;margin:0 0 18px;font-size:15px;"><strong>${escapeHtml(sourceSummaryLine(lead))}</strong></div>
<h2 style="margin:0 0 8px;font-size:15px;">First touch</h2>
${table(touchDetails(lead.firstTouch))}
<h2 style="margin:0 0 8px;font-size:15px;">Last touch</h2>
${table(touchDetails(lead.lastTouch))}
<h2 style="margin:0 0 8px;font-size:15px;">Delivery status</h2>
${table(statusRows)}
<h2 style="margin:0 0 8px;font-size:15px;">What the customer received</h2>
${customer.html}
<h2 style="margin:24px 0 8px;font-size:15px;">Form details</h2>
${table(leadRows(lead))}
</body></html>`;
}

function buildText(lead, outcome = {}) {
  const { planStatus, customerEmailStatus, whatsappStatus } = statusLabels(outcome);
  const block = (rows) => rows.map(([label, value]) => `${`${label}:`.padEnd(26)}${textVal(value)}`);
  return [
    sourceSummaryLine(lead),
    '',
    'FIRST TOUCH',
    ...block(touchDetails(lead.firstTouch)),
    '',
    'LAST TOUCH',
    ...block(touchDetails(lead.lastTouch)),
    '',
    'DELIVERY STATUS',
    `Plan generation:          ${planStatus}`,
    `Customer itinerary email: ${customerEmailStatus}`,
    `Customer email ID:        ${textVal(outcome.customerItineraryEmailProviderId)}`,
    `Plan error code:          ${textVal(outcome.planGenerationErrorCode)}`,
    `Customer email error:     ${textVal(outcome.customerItineraryEmailErrorCode)}`,
    `Plan adjustments:         ${outcome.planAdjustments?.length ? outcome.planAdjustments.join('; ') : 'None'}`,
    `WhatsApp reminder:        ${whatsappStatus}`,
    '',
    'WHAT THE CUSTOMER RECEIVED',
    ...customerEmailSection(outcome).text,
    '',
    'FORM DETAILS',
    ...block(leadRows(lead)),
  ].join('\n');
}

function emailSubjectValue(value, fallback) {
  if (value === null || value === undefined) return fallback;
  const safe = String(value).replace(/[\r\n]+/g, ' ').trim().slice(0, 60);
  return safe || fallback;
}

function classifyHttpError(status) {
  if (status === 401 || status === 403) return 'provider_rejected';
  if (status >= 400 && status < 500) return 'provider_rejected';
  return 'provider_error';
}

function safeProviderMessage(value) {
  if (typeof value !== 'string') return null;
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/re_[A-Za-z0-9_-]+/g, '[redacted]')
    .slice(0, 240);
}

async function sendResendEmail(env, payload, options = {}) {
  const signal =
    typeof AbortSignal.timeout === 'function'
      ? AbortSignal.timeout(EMAIL_TIMEOUT_MS)
      : (() => {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), EMAIL_TIMEOUT_MS);
          return controller.signal;
        })();
  const headers = {
    Authorization: `Bearer ${env.RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  };
  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal,
    });
    const responseBody = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        errorCode: classifyHttpError(res.status),
        providerStatus: res.status,
        providerErrorType: typeof responseBody?.name === 'string'
          ? responseBody.name.slice(0, 60)
          : 'unknown',
        providerMessage: safeProviderMessage(responseBody?.message),
      };
    }
    return {
      ok: true,
      providerId: typeof responseBody?.id === 'string' ? responseBody.id : null,
    };
  } catch (err) {
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      return { ok: false, errorCode: 'provider_timeout' };
    }
    return { ok: false, errorCode: 'unknown_error' };
  }
}

export async function sendTripLeadNotification(env, lead, outcome = {}) {
  if (!env.RESEND_API_KEY) {
    return { ok: false, errorCode: 'missing_config' };
  }
  const from = env.TRIP_LEAD_FROM_EMAIL || ADMIN_FROM_DEFAULT;
  const touch = lead.lastTouch || lead.firstTouch;
  const status = outcome.planGenerationStatus === 'failed' || outcome.customerItineraryEmailStatus === 'failed'
    ? 'action required'
    : 'itinerary email accepted';
  return sendResendEmail(
    env,
    {
      from,
      to: CHINAEASE_CONTACT_EMAIL,
      reply_to: lead.email,
      subject: `ChinaEase trip lead: ${status} · ${emailSubjectValue(channelLabel(touch), 'unknown')}`,
      html: buildHtml(lead, outcome),
      text: buildText(lead, outcome),
    },
    { idempotencyKey: lead.requestId ? `trip-lead-admin-${lead.requestId}` : undefined },
  );
}

/**
 * Send the itinerary to the traveller from Lin. Returns the provider result plus `email`
 * (from, subject, text, bodyHtml) so the internal notification can show exactly what was sent.
 * TRIP_CUSTOMER_FROM_EMAIL can override the sender without a code change (e.g. to roll back).
 */
export async function sendTripLeadConfirmation(env, lead, plan = null, options = {}) {
  if (!plan) return { ok: false, errorCode: 'missing_plan' };
  const from = env.TRIP_CUSTOMER_FROM_EMAIL || CUSTOMER_FROM_DEFAULT;
  const rendered = renderItineraryEmail(lead, plan, options);
  const email = { from, subject: rendered.subject, text: rendered.text, bodyHtml: rendered.bodyHtml };
  if (!env.RESEND_API_KEY) {
    return { ok: false, errorCode: 'missing_config', email };
  }
  const result = await sendResendEmail(
    env,
    {
      from,
      to: lead.email,
      reply_to: LIN_EMAIL,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    },
    { idempotencyKey: lead.requestId ? `trip-lead-customer-${lead.requestId}` : undefined },
  );
  return { ...result, email };
}

export async function sendTripEmailDeliveryAlert(env, lead, delivery) {
  if (!env.RESEND_API_KEY) {
    return { ok: false, errorCode: 'missing_config' };
  }
  const from = env.TRIP_LEAD_FROM_EMAIL || ADMIN_FROM_DEFAULT;
  const eventType = emailSubjectValue(delivery.eventType, 'email.failure');
  const providerId = emailSubjectValue(delivery.providerId, 'Not provided');
  const requestId = emailSubjectValue(lead.requestId || lead.id, 'Not provided');
  const recipient = emailSubjectValue(lead.email, 'Not provided');
  const text = [
    'A customer itinerary email reported a delivery problem.',
    '',
    `Event: ${eventType}`,
    `Recipient: ${recipient}`,
    `Trip lead ID: ${requestId}`,
    `Resend email ID: ${providerId}`,
    '',
    'Check the Resend email log before contacting the traveler manually.',
  ].join('\n');
  return sendResendEmail(
    env,
    {
      from,
      to: CHINAEASE_CONTACT_EMAIL,
      reply_to: CHINAEASE_CONTACT_EMAIL,
      subject: `ChinaEase itinerary delivery problem: ${eventType}`,
      text,
      html: `<p><strong>A customer itinerary email reported a delivery problem.</strong></p><p>Event: ${escapeHtml(eventType)}<br>Recipient: ${escapeHtml(recipient)}<br>Trip lead ID: ${escapeHtml(requestId)}<br>Resend email ID: ${escapeHtml(providerId)}</p><p>Check the Resend email log before contacting the traveler manually.</p>`,
    },
    { idempotencyKey: `trip-email-alert-${eventType}-${providerId}`.slice(0, 240) },
  );
}
