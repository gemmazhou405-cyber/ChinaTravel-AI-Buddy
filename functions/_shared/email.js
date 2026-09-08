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

function listVal(value) {
  return Array.isArray(value) && value.length ? value.join(', ') : 'Not provided';
}

function buildStarterRoute(lead) {
  const cities = Array.isArray(lead.destinationCities) && lead.destinationCities.length
    ? lead.destinationCities.slice(0, 6)
    : (lead.arrivalCity ? [lead.arrivalCity] : []);
  const days = Number(lead.tripLength) || 7;
  if (!cities.length) return ['We will suggest a route after reviewing your dates and interests.'];
  const usableDays = Math.max(days, cities.length);
  const baseDays = Math.floor(usableDays / cities.length);
  const extraDays = usableDays % cities.length;
  let day = 1;
  return cities.map((city, index) => {
    const cityDays = baseDays + (index < extraDays ? 1 : 0);
    const start = day;
    const end = day + cityDays - 1;
    day = end + 1;
    const focus = listVal(lead.priorities) === 'Not provided' ? 'a relaxed first look at the city' : listVal(lead.priorities).toLowerCase();
    return `Days ${start}–${end}: ${city} — build the day around ${focus}.`;
  });
}

function buildHtml(lead) {
  const submittedAt = lead.createdAt ? new Date(lead.createdAt).toISOString() : null;
  const rows = [
    ['Submitted at', escapeHtml(submittedAt)],
    ['Email', escapeHtml(lead.email)],
    ['Travel date', escapeHtml(lead.travelDate)],
    ['Travelers', escapeHtml(lead.travelers)],
    ['Trip length', escapeHtml(lead.tripLength ? `${lead.tripLength} days` : null)],
    ['Departure country', escapeHtml(lead.departureCountry)],
    ['Arrival city', escapeHtml(lead.arrivalCity)],
    ['Cities considered', escapeHtml(listVal(lead.destinationCities))],
    ['Priorities', escapeHtml(listVal(lead.priorities))],
    ['Concerns', escapeHtml(listVal(lead.concerns))],
    ['Help needed', escapeHtml(lead.helpWith)],
    ['Preferred contact', escapeHtml(lead.contactMethod)],
    ['WhatsApp', escapeHtml(lead.whatsapp)],
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
    `Trip length:  ${lead.tripLength ? `${lead.tripLength} days` : 'Not provided'}`,
    `From:         ${textVal(lead.departureCountry)}`,
    `Arrival city: ${textVal(lead.arrivalCity)}`,
    `Cities:       ${listVal(lead.destinationCities)}`,
    `Priorities:   ${listVal(lead.priorities)}`,
    `Concerns:     ${listVal(lead.concerns)}`,
    `Help needed:  ${textVal(lead.helpWith)}`,
    `Contact:      ${textVal(lead.contactMethod)}`,
    `WhatsApp:     ${textVal(lead.whatsapp)}`,
    `Locale:       ${textVal(lead.locale)}`,
    `Source path:  ${textVal(lead.sourcePath)}`,
    `UTM source:   ${textVal(lead.utmSource)}`,
  ].join('\n');
}

function planHtml(plan) {
  if (!plan) return '';
  const days = plan.daily_itinerary.map((item) => `<li style="margin:0 0 12px;"><strong>${escapeHtml(item.day)} · ${escapeHtml(item.city)}</strong><br>${escapeHtml(item.morning)}${item.afternoon ? ` · ${escapeHtml(item.afternoon)}` : ''}${item.evening ? ` · ${escapeHtml(item.evening)}` : ''}${item.transport ? `<br><span style="color:#555;">Transport: ${escapeHtml(item.transport)}</span>` : ''}${item.food ? `<br><span style="color:#555;">Food: ${escapeHtml(item.food)}</span>` : ''}${item.notes ? `<br><span style="color:#555;">Note: ${escapeHtml(item.notes)}</span>` : ''}</li>`).join('');
  const section = (title, items) => Array.isArray(items) && items.length ? `<h3 style="font-size:15px;margin:18px 0 8px;">${title}</h3><ul style="margin:0 0 16px;padding-left:20px;">${items.map((item) => `<li style="margin:0 0 6px;">${escapeHtml(item)}</li>`).join('')}</ul>` : '';
  return `<h3 style="font-size:15px;margin:18px 0 8px;">${escapeHtml(plan.title)}</h3><p style="margin:0 0 12px;">${escapeHtml(plan.summary)}</p><ol style="margin:0 0 16px;padding-left:20px;">${days}</ol>${section('Transport notes', plan.transport)}${section('Prepare before you go', plan.preparation)}${section('Personalised notes', plan.personalised_notes)}${section('Check before booking', plan.verify_before_booking)}`;
}

function planText(plan) {
  if (!plan) return [];
  const lines = [plan.title, plan.summary, '', 'Daily itinerary:'];
  for (const item of plan.daily_itinerary) {
    lines.push(`${item.day} · ${item.city}`);
    if (item.morning) lines.push(`Morning: ${item.morning}`);
    if (item.afternoon) lines.push(`Afternoon: ${item.afternoon}`);
    if (item.evening) lines.push(`Evening: ${item.evening}`);
    if (item.transport) lines.push(`Transport: ${item.transport}`);
    if (item.food) lines.push(`Food: ${item.food}`);
    if (item.notes) lines.push(`Note: ${item.notes}`);
    lines.push('');
  }
  for (const [title, items] of [['Transport notes', plan.transport], ['Prepare before you go', plan.preparation], ['Personalised notes', plan.personalised_notes], ['Check before booking', plan.verify_before_booking]]) {
    if (items?.length) { lines.push(`${title}:`, ...items.map((item) => `- ${item}`), ''); }
  }
  return lines;
}

function buildConfirmationHtml(lead, plan) {
  const travelDate = escapeHtml(lead.travelDate);
  const travelers = escapeHtml(lead.travelers);
  // Escape HTML first, then convert newlines to <br> for multi-line display
  const helpWithEscaped = escapeHtml(lead.helpWith);
  const helpWith =
    helpWithEscaped === 'Not provided' ? helpWithEscaped : helpWithEscaped.replace(/\n/g, '<br>');
  const rows = [
    ['Trip date', travelDate],
    ['Travelers', travelers],
    ['Trip length', escapeHtml(lead.tripLength ? `${lead.tripLength} days` : null)],
    ['Arrival city', escapeHtml(lead.arrivalCity)],
    ['Cities considered', escapeHtml(listVal(lead.destinationCities))],
    ['Trip focus', escapeHtml(listVal(lead.priorities))],
    ['Help needed', helpWith],
    ['Preferred contact', escapeHtml(lead.contactMethod)],
  ];
  const trs = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;font-weight:600;white-space:nowrap;vertical-align:top;">${label}</td><td style="padding:4px 0;word-break:break-word;">${value}</td></tr>`,
    )
    .join('\n');
  const content = plan
    ? `<p style="margin:0 0 16px;">We generated a personalised first draft from the details you shared. Our team can refine it and send any final practical notes within 48 hours.</p>${planHtml(plan)}`
    : `<p style="margin:0 0 16px;">We received your request, but we could not generate your personalised plan this time. Please submit the form again in a few minutes.</p>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:sans-serif;font-size:14px;color:#111;max-width:600px;margin:0 auto;padding:24px;">
<p style="margin:0 0 12px;">Hi,</p>
<p style="margin:0 0 12px;">Thanks for sharing your China trip details with ChinaEase Buddy.</p>
<table style="border-collapse:collapse;width:100%;margin:0 0 16px;">
${trs}
</table>
${content}
<p style="margin:0 0 12px;">This message does not subscribe you to our newsletter.</p>
<p style="margin:0 0 16px;">Please do not reply with passport details, payment card information, or sensitive medical information.</p>
<p style="margin:0;">ChinaEase Buddy<br><a href="https://chinaeasebuddy.com" style="color:#0066cc;">https://chinaeasebuddy.com</a></p>
</body></html>`;
}

function buildConfirmationText(lead, plan) {
  return [
    'Hi,',
    '',
    'Thanks for sharing your China trip details with ChinaEase Buddy.',
    '',
    ...(plan ? ['We generated a personalised first draft from the details you shared. Our team can refine it and send any final practical notes within 48 hours.'] : ['We received your request, but we could not generate your personalised plan this time. Please submit the form again in a few minutes.']),
    '',
    `Trip date:\n${textVal(lead.travelDate)}`,
    '',
    `Travelers:\n${textVal(lead.travelers)}`,
    '',
    `Trip length:\n${lead.tripLength ? `${lead.tripLength} days` : 'Not provided'}`,
    '',
    `Arrival city:\n${textVal(lead.arrivalCity)}`,
    '',
    `Cities considered:\n${listVal(lead.destinationCities)}`,
    '',
    `Trip focus:\n${listVal(lead.priorities)}`,
    '',
    `Help needed:\n${textVal(lead.helpWith)}`,
    '',
    `Preferred contact:\n${textVal(lead.contactMethod)}`,
    '',
    ...(plan ? planText(plan) : []),
    '',
    'Our team will review the details and follow up with practical transport, arrival, and preparation notes. This message does not subscribe you to our newsletter.',
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
      reply_to: lead.email,
      subject: 'New ChinaEase trip lead',
      html: buildHtml(lead),
      text: buildText(lead),
    },
    { idempotencyKey: lead.requestId ? `trip-lead-admin-${lead.requestId}` : undefined },
  );
}

export async function sendTripLeadConfirmation(env, lead, plan = null) {
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
      html: buildConfirmationHtml(lead, plan),
      text: buildConfirmationText(lead, plan),
    },
    { idempotencyKey: lead.requestId ? `trip-lead-customer-${lead.requestId}` : undefined },
  );
}
