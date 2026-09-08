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

export interface TripPlanPreview {
  title: string;
  summary: string;
  days: Array<{
    day: string;
    city: string;
    morning: string;
    afternoon: string;
    evening: string;
  }>;
}

export type TripLeadResult =
  | { status: 'success'; planGenerated: boolean; planPreview: TripPlanPreview | null; whatsappReminderSent: boolean }
  | { status: 'free_plan_used' | 'too_many' | 'error'; planGenerated: false; planPreview: null; whatsappReminderSent: false };

export function isValidWhatsApp(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 40 || !/^[+0-9() .-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export async function submitTripLead(
  payload: TripLeadPayload,
): Promise<TripLeadResult> {
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
    if (res.status === 409) {
      const data = await res.json().catch(() => ({}));
      if (data?.error === 'free_plan_used' || data?.code === 'free_plan_used') {
        return { status: 'free_plan_used', planGenerated: false, planPreview: null, whatsappReminderSent: false };
      }
    }
    if (res.status === 429) return { status: 'too_many', planGenerated: false, planPreview: null, whatsappReminderSent: false };
    if (!res.ok) return { status: 'error', planGenerated: false, planPreview: null, whatsappReminderSent: false };
    const data = await res.json().catch(() => ({}));
    return {
      status: 'success',
      planGenerated: data.planGenerated === true,
      planPreview: data.planPreview && Array.isArray(data.planPreview.days) ? data.planPreview : null,
      whatsappReminderSent: data.whatsappReminderSent === true,
    };
  } catch {
    return { status: 'error', planGenerated: false, planPreview: null, whatsappReminderSent: false };
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
