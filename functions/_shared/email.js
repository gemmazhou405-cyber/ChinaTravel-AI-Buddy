const EMAIL_TIMEOUT_MS = 5000;

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

function buildHtml(lead) {
  const submittedAt = lead.createdAt ? new Date(lead.createdAt).toISOString() : null;
  const rows = [
    ['Submitted at', escapeHtml(submittedAt)],
    ['Email', escapeHtml(lead.email)],
    ['Phone (verified)', escapeHtml(lead.phoneE164)],
    ['Travel date', escapeHtml(lead.travelDate)],
    ['Destinations / interests', escapeHtml(lead.destinations)],
    ['Travelers', escapeHtml(lead.travelers)],
    ['Help needed', escapeHtml(lead.helpWith)],
    ['Locale', escapeHtml(lead.locale)],
    ['Source path', escapeHtml(lead.sourcePath)],
    ['UTM source', escapeHtml(lead.utmSource)],
  ];
  const trs = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;font-weight:600;white-space:nowrap;vertical-align:top;">${label}</td><td style="padding:4px 0;">${value}</td></tr>`,
    )
    .join('\n');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:sans-serif;font-size:14px;color:#111;max-width:600px;margin:0 auto;padding:24px;">
<h2 style="margin:0 0 16px;font-size:16px;">New trip planning enquiry</h2>
<table style="border-collapse:collapse;width:100%;">
${trs}
</table>
</body></html>`;
}

function buildText(lead) {
  const submittedAt = lead.createdAt ? new Date(lead.createdAt).toISOString() : null;
  return [
    'New trip planning enquiry',
    '',
    `Submitted at: ${textVal(submittedAt)}`,
    `Email:        ${textVal(lead.email)}`,
    `Phone (verified): ${textVal(lead.phoneE164)}`,
    `Travel date:  ${textVal(lead.travelDate)}`,
    `Travelers:    ${textVal(lead.travelers)}`,
    `Destinations: ${textVal(lead.destinations)}`,
    `Help needed:  ${textVal(lead.helpWith)}`,
    `Locale:       ${textVal(lead.locale)}`,
    `Source path:  ${textVal(lead.sourcePath)}`,
    `UTM source:   ${textVal(lead.utmSource)}`,
  ].join('\n');
}

function buildConfirmationHtml(lead) {
  const travelDate = escapeHtml(lead.travelDate);
  const travelers = escapeHtml(lead.travelers);
  // Escape HTML first, then convert newlines to <br> for multi-line display
  const helpWithEscaped = escapeHtml(lead.helpWith);
  const helpWith =
    helpWithEscaped === 'Not provided' ? helpWithEscaped : helpWithEscaped.replace(/\n/g, '<br>');
  const rows = [
    ['Trip date', travelDate],
    ['Travelers', travelers],
    ['Help needed', helpWith],
  ];
  const trs = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;font-weight:600;white-space:nowrap;vertical-align:top;">${label}</td><td style="padding:4px 0;word-break:break-word;">${value}</td></tr>`,
    )
    .join('\n');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:sans-serif;font-size:14px;color:#111;max-width:600px;margin:0 auto;padding:24px;">
<p style="margin:0 0 12px;">Hi,</p>
<p style="margin:0 0 12px;">Thanks for sharing your China trip details with ChinaEase Buddy.</p>
<p style="margin:0 0 16px;">We&#39;ve received your request and will review the information you submitted.</p>
<table style="border-collapse:collapse;width:100%;margin:0 0 16px;">
${trs}
</table>
<p style="margin:0 0 12px;">This message confirms that your trip enquiry was received. It does not subscribe you to our newsletter.</p>
<p style="margin:0 0 16px;">Please do not reply with passport details, payment card information, or sensitive medical information.</p>
<p style="margin:0;">ChinaEase Buddy<br><a href="https://chinaeasebuddy.com" style="color:#0066cc;">https://chinaeasebuddy.com</a></p>
</body></html>`;
}

function buildConfirmationText(lead) {
  return [
    'Hi,',
    '',
    'Thanks for sharing your China trip details with ChinaEase Buddy.',
    '',
    "We've received your request and will review the information you submitted.",
    '',
    `Trip date:\n${textVal(lead.travelDate)}`,
    '',
    `Travelers:\n${textVal(lead.travelers)}`,
    '',
    `Help needed:\n${textVal(lead.helpWith)}`,
    '',
    'This message confirms that your trip enquiry was received. It does not subscribe you to our newsletter.',
    '',
    'Please do not reply with passport details, payment card information, or sensitive medical information.',
    '',
    'ChinaEase Buddy',
    'https://chinaeasebuddy.com',
  ].join('\n');
}

function classifyHttpError(status) {
  if (status === 401 || status === 403) return 'provider_rejected';
  if (status >= 400 && status < 500) return 'provider_rejected';
  return 'provider_error';
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
    if (!res.ok) return { ok: false, errorCode: classifyHttpError(res.status) };
    return { ok: true };
  } catch (err) {
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      return { ok: false, errorCode: 'provider_timeout' };
    }
    return { ok: false, errorCode: 'unknown_error' };
  }
}

export async function sendTripLeadNotification(env, lead) {
  if (!env.RESEND_API_KEY || !env.TRIP_LEAD_NOTIFY_EMAIL) {
    return { ok: false, errorCode: 'missing_config' };
  }
  const from = env.TRIP_LEAD_FROM_EMAIL || 'ChinaEase Buddy <leads@notify.chinaeasebuddy.com>';
  return sendResendEmail(
    env,
    {
      from,
      to: env.TRIP_LEAD_NOTIFY_EMAIL,
      ...(lead.email ? { reply_to: lead.email } : {}),
      subject: 'New ChinaEase trip lead',
      html: buildHtml(lead),
      text: buildText(lead),
    },
    { idempotencyKey: lead.requestId ? `trip-lead-admin-${lead.requestId}` : undefined },
  );
}

export async function sendTripLeadConfirmation(env, lead) {
  if (!env.RESEND_API_KEY || !env.TRIP_LEAD_NOTIFY_EMAIL) {
    return { ok: false, errorCode: 'missing_config' };
  }
  const from = env.TRIP_LEAD_FROM_EMAIL || 'ChinaEase Buddy <leads@notify.chinaeasebuddy.com>';
  return sendResendEmail(
    env,
    {
      from,
      to: lead.email,
      reply_to: env.TRIP_LEAD_NOTIFY_EMAIL,
      subject: "We've received your China trip details",
      html: buildConfirmationHtml(lead),
      text: buildConfirmationText(lead),
    },
    { idempotencyKey: lead.requestId ? `trip-lead-customer-${lead.requestId}` : undefined },
  );
}
