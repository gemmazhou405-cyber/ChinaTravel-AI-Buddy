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
    ['Travel date', escapeHtml(lead.travelDate)],
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
    `Travel date:  ${textVal(lead.travelDate)}`,
    `Travelers:    ${textVal(lead.travelers)}`,
    `Help needed:  ${textVal(lead.helpWith)}`,
    `Locale:       ${textVal(lead.locale)}`,
    `Source path:  ${textVal(lead.sourcePath)}`,
    `UTM source:   ${textVal(lead.utmSource)}`,
  ].join('\n');
}

function classifyHttpError(status) {
  if (status === 401 || status === 403) return 'provider_rejected';
  if (status >= 400 && status < 500) return 'provider_rejected';
  return 'provider_error';
}

export async function sendTripLeadNotification(env, lead) {
  if (!env.RESEND_API_KEY || !env.TRIP_LEAD_NOTIFY_EMAIL) {
    return { ok: false, errorCode: 'missing_config' };
  }

  const from = env.TRIP_LEAD_FROM_EMAIL || 'ChinaEase Buddy <leads@notify.chinaeasebuddy.com>';
  const to = env.TRIP_LEAD_NOTIFY_EMAIL;

  const signal =
    typeof AbortSignal.timeout === 'function'
      ? AbortSignal.timeout(EMAIL_TIMEOUT_MS)
      : (() => {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), EMAIL_TIMEOUT_MS);
          return controller.signal;
        })();

  let status = null;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: 'New ChinaEase trip lead',
        html: buildHtml(lead),
        text: buildText(lead),
      }),
      signal,
    });
    status = res.status;
    if (!res.ok) {
      return { ok: false, errorCode: classifyHttpError(status) };
    }
    return { ok: true };
  } catch (err) {
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      return { ok: false, errorCode: 'provider_timeout' };
    }
    return { ok: false, errorCode: 'unknown_error' };
  }
}
