const DEFAULT_TOLERANCE_SECONDS = 5 * 60;

function headerValue(headers, name) {
  if (typeof headers?.get === 'function') return headers.get(name);
  const key = Object.keys(headers || {}).find((item) => item.toLowerCase() === name);
  return key ? headers[key] : null;
}

function decodeBase64(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export async function verifyResendWebhook({
  payload,
  headers,
  secret,
  nowSeconds = Math.floor(Date.now() / 1000),
  toleranceSeconds = DEFAULT_TOLERANCE_SECONDS,
}) {
  if (typeof payload !== 'string' || !secret) return false;
  const messageId = headerValue(headers, 'svix-id') || headerValue(headers, 'webhook-id');
  const timestampRaw = headerValue(headers, 'svix-timestamp') || headerValue(headers, 'webhook-timestamp');
  const signaturesRaw = headerValue(headers, 'svix-signature') || headerValue(headers, 'webhook-signature');
  if (!messageId || !timestampRaw || !signaturesRaw) return false;

  const timestamp = Number(timestampRaw);
  if (!Number.isInteger(timestamp) || Math.abs(nowSeconds - timestamp) > toleranceSeconds) return false;

  try {
    const secretBody = secret.startsWith('whsec_') ? secret.slice(6) : secret;
    const key = await crypto.subtle.importKey(
      'raw',
      decodeBase64(secretBody),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const signedPayload = new TextEncoder().encode(`${messageId}.${timestamp}.${payload}`);
    const signatures = signaturesRaw.split(/\s+/).filter(Boolean);
    for (const versionedSignature of signatures) {
      const separator = versionedSignature.indexOf(',');
      if (separator < 0 || versionedSignature.slice(0, separator) !== 'v1') continue;
      const signature = decodeBase64(versionedSignature.slice(separator + 1));
      if (await crypto.subtle.verify('HMAC', key, signature, signedPayload)) return true;
    }
  } catch {
    return false;
  }
  return false;
}
