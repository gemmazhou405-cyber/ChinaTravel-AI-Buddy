import { commitWrites, getDoc, setWrite, updateWrite } from './firestore.js';
import { expiresAtFrom, getPlan } from './plans.js';

export function orderSafeStatus(status) {
  if (['pending', 'completed', 'failed', 'cancelled', 'refunded', 'reversed'].includes(status)) return status;
  return 'pending';
}

export async function activeUserPass(env, uid) {
  const userDoc = await getDoc(env, `users/${uid}`);
  if (!userDoc || !['trip', 'group'].includes(userDoc.plan)) return { active: false, userDoc };
  const now = Date.now();
  return {
    active: !userDoc.planExpiresAt || userDoc.planExpiresAt > now,
    userDoc,
  };
}

export async function grantEntitlement(env, order, capture) {
  const plan = getPlan(order.plan);
  if (!plan) throw new Error('invalid_order_plan');
  if (order.entitlementGrantedAt) {
    return { alreadyGranted: true, plan };
  }

  const now = Date.now();
  const expiresAt = expiresAtFrom(now, plan.durationDays);
  const userUpdates = {
    plan: plan.userPlan,
    planExpiresAt: expiresAt,
    buddyAiQuotaTotal: plan.aiLimit,
    buddyAiQuotaUsed: 0,
    menuScanQuotaTotal: plan.scanLimit,
    menuScanQuotaUsed: 0,
    dailyBuddyAiLimit: plan.dailyBuddyAiLimit,
    dailyBuddyAiUsed: 0,
    dailyResetAt: now,
    entitlementOrderId: order.paypalOrderId,
    entitlementStatus: 'active',
    entitlementUpdatedAt: now,
  };
  const entitlement = {
    plan: plan.userPlan,
    status: 'active',
    aiLimit: plan.aiLimit,
    aiUsed: 0,
    scanLimit: plan.scanLimit,
    scanUsed: 0,
    startedAt: now,
    expiresAt,
    orderId: order.paypalOrderId,
    captureId: capture.captureId,
    updatedAt: now,
  };
  const orderUpdates = {
    status: 'completed',
    paypalCaptureId: capture.captureId,
    paypalPayerId: capture.payerId,
    paypalPayerEmail: capture.payerEmail,
    capturedAt: now,
    entitlementGrantedAt: now,
    updatedAt: now,
  };

  await commitWrites(env, [
    updateWrite(env, `orders/${order.paypalOrderId}`, orderUpdates),
    setWrite(env, `users/${order.userId}`, userUpdates),
    setWrite(env, `entitlements/${order.userId}`, entitlement),
  ]);

  return { alreadyGranted: false, plan, expiresAt };
}

export async function markOrderStatus(env, paypalOrderId, status, extra = {}) {
  const now = Date.now();
  await commitWrites(env, [
    updateWrite(env, `orders/${paypalOrderId}`, {
      status,
      updatedAt: now,
      ...extra,
    }),
  ]);
}

export async function markEntitlementSuspended(env, order, status, extra = {}) {
  const now = Date.now();
  const writes = [
    updateWrite(env, `orders/${order.paypalOrderId}`, {
      status,
      updatedAt: now,
      ...extra,
    }),
  ];
  if (order.entitlementGrantedAt) {
    writes.push(setWrite(env, `entitlements/${order.userId}`, {
      plan: order.plan === 'group_pass' ? 'group' : 'trip',
      status,
      orderId: order.paypalOrderId,
      updatedAt: now,
      ...extra,
    }));
    writes.push(updateWrite(env, `users/${order.userId}`, {
      entitlementStatus: status,
      entitlementUpdatedAt: now,
    }));
  }
  await commitWrites(env, writes);
}
