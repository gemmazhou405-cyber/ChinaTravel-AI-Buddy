import { commitWrites, getDoc, getDocSnapshot, updateWriteIfUnchanged } from './firestore.js';

export const PASS_DEVICES = { trip: 2, group: 5 };

function isAccessBlocked(record) {
  return Boolean(record && record.accessRevoked !== false
    && (Object.hasOwn(record, 'accessRevoked') || Object.hasOwn(record, 'accessRevokedAt')));
}

export function isPassDeviceBound(pass, deviceId) {
  return Boolean(deviceId && Array.isArray(pass?.devices) && pass.devices.some((device) => device.id === deviceId));
}

export function isPassCurrent(pass) {
  return Boolean(Object.hasOwn(PASS_DEVICES, pass?.tier) && !isAccessBlocked(pass) && Number.isFinite(pass.expiresAt) && pass.expiresAt > Date.now());
}

// An operator may revoke an order in the existing Firestore console. Keep this
// independent of provider status so a later sale ping/dispute result cannot undo it.
export async function isSaleAccessRevoked(env, saleId) {
  if (!saleId) return false; // Existing administrator-issued passes have no sale.
  const sale = await getDoc(env, `gumroadSales/${saleId}`);
  return isAccessBlocked(sale);
}

export async function getPassForAccess(env, passId) {
  const pass = await getDoc(env, `passes/${passId}`);
  if (!pass || isAccessBlocked(pass) || await isSaleAccessRevoked(env, pass.gumroadSaleId)) return null;
  return pass;
}

export async function activePassForId(env, passId, deviceId) {
  const pass = await getPassForAccess(env, passId);
  if (!pass) return { active: false, pass: null };
  return { active: isPassCurrent(pass) && isPassDeviceBound(pass, deviceId), pass };
}

// Activation, recovery and removal must compete on the same document version.
// Never issue a session for a device whose binding was not committed.
async function changeDevices(env, passId, change) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const snapshot = await getDocSnapshot(env, `passes/${passId}`);
    if (!snapshot || !Object.hasOwn(PASS_DEVICES, snapshot.data.tier)) {
      return { ok: false, status: 401, error: 'invalid_pass' };
    }
    const pass = snapshot.data;
    if (isAccessBlocked(pass) || await isSaleAccessRevoked(env, pass.gumroadSaleId)) {
      return { ok: false, status: 403, error: 'pass_revoked' };
    }
    const result = change(pass);
    if (!result.ok || !result.devices) return { ...result, pass };
    try {
      await commitWrites(env, [updateWriteIfUnchanged(env, `passes/${passId}`, { devices: result.devices }, snapshot.updateTime)]);
      return { ...result, pass: { ...pass, devices: result.devices } };
    } catch (error) {
      const message = String(error?.message);
      if (!/firestore_commit_error:(409|412):/.test(message)
        && !message.includes('FAILED_PRECONDITION') && !message.includes('ABORTED')) throw error;
    }
  }
  return { ok: false, status: 503, error: 'pass_update_conflict' };
}

export async function bindPassDevice(env, passId, deviceId, expectedTier) {
  return changeDevices(env, passId, (pass) => {
    if (expectedTier && pass.tier !== expectedTier) return { ok: false, status: 400, error: 'invalid_sale' };
    if (isPassDeviceBound(pass, deviceId)) return { ok: true };
    const devices = Array.isArray(pass.devices) ? pass.devices : [];
    const maxDevices = PASS_DEVICES[pass.tier];
    if (devices.length >= maxDevices) return { ok: false, status: 403, error: 'max_devices_reached', maxDevices };
    const now = Date.now();
    return { ok: true, devices: [...devices, { id: deviceId, boundAt: now, lastSeenAt: now }] };
  });
}

export async function removePassDevice(env, passId, currentDeviceId, targetId) {
  return changeDevices(env, passId, (pass) => {
    if (!isPassDeviceBound(pass, currentDeviceId)) return { ok: false, status: 401, error: 'unauthorized' };
    const devices = pass.devices.filter((device) => device.id !== targetId);
    return devices.length === pass.devices.length
      ? { ok: true, removed: false }
      : { ok: true, removed: true, devices };
  });
}
