const COOKIE_NAME = 'ceb_pass';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days
// Avoids visually confusing characters: no 0/O, 1/I/l
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function base64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function hmacSign(secret, data) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return base64url(sig);
}

export async function sha256hex(input) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return base64url(buf);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Token format: <passId>.<deviceId>.<HMAC-SHA256>
export async function signSessionToken(secret, passId, deviceId) {
  const payload = `${passId}.${deviceId}`;
  const sig = await hmacSign(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifySessionCookie(cookieHeader, secret) {
  if (!cookieHeader || !secret) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;

  const parts = match[1].split('.');
  // passId (UUID, no dots) + deviceId + sig = 3 parts
  if (parts.length !== 3) return null;

  const [passId, deviceId, sig] = parts;
  if (!passId || !deviceId || !sig) return null;

  const expected = await hmacSign(secret, `${passId}.${deviceId}`);
  if (!timingSafeEqual(sig, expected)) return null;

  return { passId, deviceId };
}

export function sessionCookieHeader(token) {
  return `${COOKIE_NAME}=${token}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`;
}

export function clearCookieHeader() {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

export function generateRecoveryCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  let out = '';
  for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return `${out.slice(0, 4)}-${out.slice(4, 8)}-${out.slice(8, 12)}`;
}
