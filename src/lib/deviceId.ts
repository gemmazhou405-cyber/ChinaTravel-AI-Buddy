// A random per-browser ID that binds a pass to this device (see /api/claim and /api/recover).
// It identifies the browser only, never the person, and is kept in localStorage so the same
// device is recognised on later visits. If storage is blocked we fall back to a per-page ID.
const DEVICE_ID_KEY = 'chinaease-device-id';
const VALID_ID_RE = /^[a-zA-Z0-9-]{16,64}$/;

let memoryId: string | null = null;

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function getDeviceId(): string {
  try {
    const saved = window.localStorage.getItem(DEVICE_ID_KEY);
    if (saved && VALID_ID_RE.test(saved)) return saved;
    const created = newId();
    window.localStorage.setItem(DEVICE_ID_KEY, created);
    return created;
  } catch {
    memoryId ??= newId();
    return memoryId;
  }
}
