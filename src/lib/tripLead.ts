import { getAttributionContext } from './analytics';

export interface TripLeadPayload {
  email: string;
  travelDate?: string;
  travelers?: number;
  tripLength?: number;
  departureCountry?: string;
  arrivalCity?: string;
  destinationCities?: string[];
  priorities?: string[];
  concerns?: string[];
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
        tripLength: payload.tripLength ?? '',
        departureCountry: payload.departureCountry ?? '',
        arrivalCity: payload.arrivalCity ?? '',
        destinationCities: payload.destinationCities ?? [],
        priorities: payload.priorities ?? [],
        concerns: payload.concerns ?? [],
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

// Kept for the legacy lead component that is no longer mounted on the homepage.
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

export type PhoneVerificationResult = { ok: true } | { ok: false; errorCode: string };

export async function requestPhoneVerification(_phone: string): Promise<PhoneVerificationResult> {
  void _phone;
  return { ok: false, errorCode: 'phone_verification_unavailable' };
}

export async function submitVerifiedTripLead(_payload: VerifiedTripLeadPayload): Promise<PhoneVerificationResult> {
  void _payload;
  return { ok: false, errorCode: 'phone_verification_unavailable' };
}

