import { getAttributionContext } from './analytics';

export interface TripLeadPayload {
  email: string;
  travelDate?: string;
  travelers?: number;
  helpWith?: string;
  whatsapp?: string;
  contactMethod?: 'email' | 'whatsapp';
  requestId: string;
}

export function isValidWhatsApp(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 40 || !/^[+0-9() .-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
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
        whatsapp: payload.whatsapp ?? '',
        contactMethod: payload.contactMethod ?? 'email',
        locale: document.documentElement.lang || 'en',
        sourcePath: window.location.pathname + window.location.search,
        utmSource: attr.utm_source,
        utmMedium: attr.utm_medium,
        utmCampaign: attr.utm_campaign,
        utmContent: attr.utm_content,
        website: '',
        consentVersion: 'trip-lead-2026-09',
      }),
    });
    if (res.status === 429) return 'too_many';
    if (!res.ok) return 'error';
    return 'success';
  } catch {
    return 'error';
  }
}
