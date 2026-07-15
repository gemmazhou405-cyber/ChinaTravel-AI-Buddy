import type { User } from 'firebase/auth';
import { getAttributionContext } from './analytics';

export type PaymentMode = 'manual' | 'sandbox' | 'live';
export type PaidPlanId = 'trip_pass' | 'group_pass';

export const MANUAL_PAYPAL_LINKS = {
  trip: 'https://www.paypal.com/ncp/payment/863ZKSY6RJ64J',
  group: 'https://www.paypal.com/ncp/payment/CL8J5WJVK3TAJ',
} as const;

export interface CheckoutOrder {
  orderId: string;
  approvalUrl: string;
  status: string;
}

export interface CaptureResult {
  status: 'completed' | 'pending' | 'failed';
  plan?: 'trip' | 'group';
  aiLimit?: number;
  scanLimit?: number;
  expiresAt?: number | null;
  alreadyGranted?: boolean;
  message?: string;
}

export const paymentMode = (import.meta.env.VITE_PAYMENT_MODE || 'manual') as PaymentMode;

async function authedFetch<T>(user: User, url: string, init: RequestInit = {}): Promise<T> {
  const token = await user.getIdToken();
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(body.message || body.error || 'Request failed');
    (error as Error & { code?: string }).code = body.error;
    throw error;
  }
  return body as T;
}

export function planToCheckoutId(plan: 'trip' | 'group'): PaidPlanId {
  return plan === 'trip' ? 'trip_pass' : 'group_pass';
}

export async function createCheckoutOrder(user: User, plan: 'trip' | 'group') {
  const attribution = getAttributionContext();
  return authedFetch<CheckoutOrder>(user, '/api/paypal/create-order', {
    method: 'POST',
    headers: { 'Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify({
      planId: planToCheckoutId(plan),
      sourcePath: `${window.location.pathname}${window.location.search}`,
      ...attribution,
    }),
  });
}

export async function captureCheckoutOrder(user: User, orderId: string) {
  return authedFetch<CaptureResult>(user, '/api/paypal/capture-order', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  });
}

export async function getCheckoutOrderStatus(user: User, orderId: string) {
  const token = await user.getIdToken();
  const res = await fetch(`/api/paypal/order-status?orderId=${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || body.error || 'Could not read order status');
  return body as { status: string; plan?: string };
}
