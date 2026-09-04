import { getAttributionContext } from './analytics';

export interface TripLeadPayload {
  email: string;
  travelDate?: string;
  travelers?: number;
  helpWith?: string;
  requestId: string;
}

export async function submitTripLead(
  payload: TripLeadPayload,
): Promise<'success' | 'too_many' | 'error'> {
  const attr = getAttributionContext();
  try {
    const res = await fetch('/api/leads/trip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: payload.requestId,
        email: payload.email,
        travelDate: payload.travelDate ?? '',
        travelers: payload.travelers ?? '',
        helpWith: payload.helpWith ?? '',
        locale: document.documentElement.lang || 'en',
        sourcePath: window.location.pathname + window.location.search,
        utmSource: attr.utm_source,
        utmMedium: attr.utm_medium,
        utmCampaign: attr.utm_campaign,
        utmContent: attr.utm_content,
        website: '',
        consentVersion: 'trip-lead-2026-08',
      }),
    });
    if (res.status === 429) return 'too_many';
    if (!res.ok) return 'error';
    return 'success';
  } catch {
    return 'error';
  }
}

export interface VerifiedTripLeadPayload {
  requestId: string;
  phone: string;
  code: string;
  email?: string;
  travelDate?: string;
  travelers?: number;
  destinations?: string;
  consentVersion: string;
}

export type PhoneVerificationResult =
  | { ok: true }
  | { ok: false; errorCode: string };

async function postTripLeadAction(payload: Record<string, unknown>) {
  const attr = getAttributionContext();
  const res = await fetch('/api/leads/trip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      locale: document.documentElement.lang || 'en',
      sourcePath: window.location.pathname + window.location.search,
      utmSource: attr.utm_source,
      utmMedium: attr.utm_medium,
      utmCampaign: attr.utm_campaign,
      utmContent: attr.utm_content,
      website: '',
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    return { ok: false as const, errorCode: data.error || (res.status === 429 ? 'too_many_requests' : 'request_failed') };
  }
  return { ok: true as const };
}

export async function requestPhoneVerification(phone: string): Promise<PhoneVerificationResult> {
  try {
    return await postTripLeadAction({ action: 'send_code', phone });
  } catch {
    return { ok: false, errorCode: 'request_failed' };
  }
}

export async function submitVerifiedTripLead(
  payload: VerifiedTripLeadPayload,
): Promise<PhoneVerificationResult> {
  try {
    return await postTripLeadAction({
      action: 'verify_code',
      requestId: payload.requestId,
      phone: payload.phone,
      code: payload.code,
      email: payload.email || '',
      travelDate: payload.travelDate || '',
      travelers: payload.travelers ?? '',
      destinations: payload.destinations || '',
      helpWith: payload.destinations ? 'Cities or interests: ' + payload.destinations : '',
      consentVersion: payload.consentVersion,
    });
  } catch {
    return { ok: false, errorCode: 'request_failed' };
  }
}
