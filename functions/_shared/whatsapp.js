const WHATSAPP_TIMEOUT_MS = 8000;

function timeoutSignal(ms) {
  if (typeof AbortSignal.timeout === 'function') return AbortSignal.timeout(ms);
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

function classifyStatus(status) {
  if (status === 401 || status === 403) return 'provider_rejected';
  if (status >= 400 && status < 500) return 'provider_rejected';
  return 'provider_error';
}

export async function sendWhatsAppTripReminder(env, lead) {
  if (lead.contactMethod !== 'whatsapp' || !lead.whatsapp) return { ok: false, errorCode: 'not_requested' };
  if (!env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID || !env.WHATSAPP_TEMPLATE_NAME || !env.WHATSAPP_API_VERSION) {
    return { ok: false, errorCode: 'missing_config' };
  }
  const to = lead.whatsapp.replace(/\D/g, '');
  const endpoint = `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: env.WHATSAPP_TEMPLATE_NAME,
          language: { code: env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US' },
        },
      }),
      signal: timeoutSignal(WHATSAPP_TIMEOUT_MS),
    });
    if (!response.ok) return { ok: false, errorCode: classifyStatus(response.status) };
    return { ok: true };
  } catch (error) {
    if (error?.name === 'AbortError' || error?.name === 'TimeoutError') return { ok: false, errorCode: 'provider_timeout' };
    return { ok: false, errorCode: 'unknown_error' };
  }
}
