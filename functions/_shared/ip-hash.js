// Salted IP hashing. IP addresses are never stored; only an HMAC-SHA256 of the address keyed
// with IP_HASH_SALT (a Cloudflare secret), so a stored hash cannot be reversed by hashing every
// possible IPv4 address. Changing the salt resets every IP-based limit, which is acceptable.
const encoder = new TextEncoder();
const keyCache = new Map();
let warnedMissingSalt = false;

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function saltFor(env) {
  if (env?.IP_HASH_SALT) return env.IP_HASH_SALT;
  // Fall back to another server-only secret so the hash is still keyed, never a bare SHA-256.
  if (env?.SESSION_SECRET) {
    if (!warnedMissingSalt) {
      warnedMissingSalt = true;
      console.warn('[ip-hash] IP_HASH_SALT is not set; using a key derived from SESSION_SECRET');
    }
    return `ip-hash:${env.SESSION_SECRET}`;
  }
  return null;
}

async function hmacKey(salt) {
  if (!keyCache.has(salt)) {
    keyCache.set(salt, crypto.subtle.importKey('raw', encoder.encode(salt), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']));
  }
  return keyCache.get(salt);
}

/** Salted, one-way hash of a client IP address (64 hex characters). */
export async function hashIp(env, ip) {
  const value = String(ip || 'unknown');
  const salt = saltFor(env);
  if (!salt) {
    if (!warnedMissingSalt) {
      warnedMissingSalt = true;
      console.error('[ip-hash] neither IP_HASH_SALT nor SESSION_SECRET is set; IP hashes are unsalted');
    }
    return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
  }
  return toHex(await crypto.subtle.sign('HMAC', await hmacKey(salt), encoder.encode(value)));
}
