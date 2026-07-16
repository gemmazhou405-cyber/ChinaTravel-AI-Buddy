const CERTS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

function base64UrlDecode(input) {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function decodeJson(part) {
  const bytes = base64UrlDecode(part);
  return JSON.parse(new TextDecoder().decode(bytes));
}

async function getJwk(kid) {
  const res = await fetch(CERTS_URL, {
    cf: { cacheTtl: 3600, cacheEverything: true },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error('firebase_jwks_unavailable');
  const body = await res.json();
  const jwk = body.keys?.find((key) => key.kid === kid);
  if (!jwk) throw new Error('firebase_jwk_missing');
  return jwk;
}

async function verifySignature(token, header) {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
  const jwk = await getJwk(header.kid);
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  return crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    base64UrlDecode(encodedSignature),
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
  );
}

export async function verifyFirebaseRequest(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new Error('auth_required');
  const token = match[1];
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('invalid_token');

  const header = decodeJson(parts[0]);
  const payload = decodeJson(parts[1]);
  if (header.alg !== 'RS256') throw new Error('invalid_alg');

  const projectId = env.FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error('server_missing_firebase_project');
  if (payload.aud !== projectId) throw new Error('invalid_audience');
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new Error('invalid_issuer');
  if (!payload.sub || typeof payload.sub !== 'string') throw new Error('invalid_subject');

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp <= now) throw new Error('token_expired');
  if (typeof payload.iat !== 'number' || payload.iat > now + 300) throw new Error('invalid_iat');

  const ok = await verifySignature(token, header);
  if (!ok) throw new Error('invalid_signature');
  return {
    uid: payload.sub,
    email: payload.email || '',
    emailVerified: Boolean(payload.email_verified),
  };
}
