// Paid Buddy quota and request identity are committed atomically. No reply or
// conversation text is stored here; only the request fingerprint and outcome.
import { commitWrites, createWrite, getDocSnapshot, updateWriteIfUnchanged } from './firestore.js';
import { isPassCurrent, isPassDeviceBound, isSaleAccessRevoked } from './entitlements.js';

const MAX_ATTEMPTS = 3;
const unavailable = () => ({ ok: false, status: 503, code: 'pass_quota_unavailable' });

function conflict(error) {
  return /:(409|412):|FAILED_PRECONDITION|ABORTED/.test(String(error?.message));
}

function granted(pass, record, path, passId) {
  return {
    ok: true, pass, path, passId, owner: record.owner,
    inputHash: record.inputHash, count: record.count,
  };
}

export async function reservePassChatMessage(env, { passId, deviceId, requestId, inputHash }) {
  const passPath = `passes/${passId}`;
  const path = `${passPath}/buddyRequests/${requestId.toLowerCase()}`;
  const owner = crypto.randomUUID();
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const [passSnapshot, requestSnapshot] = await Promise.all([
      getDocSnapshot(env, passPath), getDocSnapshot(env, path),
    ]);
    const pass = passSnapshot?.data;
    if (!isPassDeviceBound(pass, deviceId)) return { ok: false, status: 401, code: 'invalid_pass' };
    if (!isPassCurrent(pass)) {
      const expired = Number.isFinite(pass.expiresAt) && pass.expiresAt <= Date.now();
      return { ok: false, status: expired ? 402 : 401, code: expired ? 'pass_expired' : 'invalid_pass', tier: pass.tier };
    }
    if (await isSaleAccessRevoked(env, pass.gumroadSaleId)) return { ok: false, status: 401, code: 'invalid_pass' };

    const existing = requestSnapshot?.data;
    if (existing) {
      if (existing.inputHash !== inputHash) return { ok: false, status: 409, code: 'request_conflict' };
      if (existing.status === 'reserved' && existing.owner === owner) return granted(pass, existing, path, passId);
      if (existing.status === 'reserved' || existing.status === 'consumed') {
        return { ok: false, status: 409, code: existing.status === 'consumed' ? 'request_already_processed' : 'request_in_progress' };
      }
      if (existing.status !== 'released') return unavailable();
    }
    const used = pass.messagesUsed ?? 0;
    const allowance = pass.messageAllowance ?? 0;
    if (!Number.isSafeInteger(used) || used < 0 || !Number.isSafeInteger(allowance) || allowance < 0) return unavailable();
    if (used >= allowance) return { ok: false, status: 402, code: 'quota_exhausted', tier: pass.tier, remaining: 0 };

    const now = Date.now();
    const record = { owner, inputHash, status: 'reserved', count: used + 1, createdAt: existing?.createdAt ?? now, updatedAt: now };
    try {
      await commitWrites(env, [
        updateWriteIfUnchanged(env, passPath, { messagesUsed: used + 1 }, passSnapshot.updateTime),
        requestSnapshot
          ? updateWriteIfUnchanged(env, path, record, requestSnapshot.updateTime)
          : createWrite(env, path, record),
      ]);
      return granted(pass, record, path, passId);
    } catch (error) {
      // A lost commit acknowledgement is not proof of failure. Only this owner
      // may continue after a point-read confirms its atomic reservation.
      let observed;
      try { observed = (await getDocSnapshot(env, path))?.data; }
      catch { return unavailable(); }
      if (observed?.owner === owner && observed.inputHash === inputHash && observed.status === 'reserved') {
        return granted(pass, observed, path, passId);
      }
      if (!conflict(error) && observed) return unavailable();
      // Missing/old data after an uncertain write can be retried with the SAME
      // owner. The ledger precondition prevents two commits charging twice.
    }
  }
  return unavailable();
}

export async function settlePassChatMessage(env, reservation, outcome) {
  if (!reservation?.ok || !['consumed', 'released'].includes(outcome)) return false;
  const { path, passId, owner, inputHash } = reservation;
  const passPath = `passes/${passId}`;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let requestSnapshot;
    let passSnapshot;
    try {
      [requestSnapshot, passSnapshot] = await Promise.all([
        getDocSnapshot(env, path), outcome === 'released' ? getDocSnapshot(env, passPath) : null,
      ]);
      const record = requestSnapshot?.data;
      if (!record || record.owner !== owner || record.inputHash !== inputHash) return false;
      if (record.status === outcome) return true;
      if (record.status !== 'reserved') return false;
      const writes = [updateWriteIfUnchanged(env, path, { status: outcome, updatedAt: Date.now() }, requestSnapshot.updateTime)];
      if (outcome === 'released') {
        const used = passSnapshot?.data?.messagesUsed;
        if (!Number.isSafeInteger(used) || used <= 0) return false;
        writes.unshift(updateWriteIfUnchanged(env, passPath, { messagesUsed: used - 1 }, passSnapshot.updateTime));
      }
      await commitWrites(env, writes);
      return true;
    } catch {
      // Re-reading the owner and state makes release/consume idempotent even if
      // a response was lost, or a newer retry has already taken over the record.
      try {
        const observed = (await getDocSnapshot(env, path))?.data;
        if (observed?.owner !== owner || observed.inputHash !== inputHash) return false;
        if (observed.status === outcome) return true;
        if (observed.status !== 'reserved') return false;
      } catch { return false; }
    }
  }
  return false; // Keep an unconfirmed reservation charged; never guess a refund.
}
