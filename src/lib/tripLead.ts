import { getAttributionContext } from './analytics';

export interface TripLeadPayload {
  firstName?: string;
  email: string;
  countryOfResidence?: string;
  plannedTravelMonth?: string;
  numberOfTravellers?: number;
  citiesAndInterests?: string;
  whatsapp?: string;
  travelDate?: string;
  travelers?: number | string;
  helpWith?: string;
  cities?: string[];
  dates?: string;
  interests?: string[];
  consentAccepted?: boolean;
  consentVersion?: string;
  locale?: string;
  sourcePath?: string;
  requestId: string;
}

export async function submitTripLead(
  payload: TripLeadPayload,
): Promise<'success' | 'too_many' | 'error'> {
  const attr = getAttributionContext();
  const usesProgressiveFields =
    payload.cities !== undefined || payload.dates !== undefined || payload.interests !== undefined;
  const formFields = usesProgressiveFields
    ? {
        cities: payload.cities ?? [],
        dates: payload.dates ?? '',
        travelers: payload.travelers ?? '',
        interests: payload.interests ?? [],
      }
    : {
        firstName: payload.firstName,
        countryOfResidence: payload.countryOfResidence,
        plannedTravelMonth: payload.plannedTravelMonth ?? payload.travelDate ?? '',
        numberOfTravellers: payload.numberOfTravellers ?? payload.travelers ?? '',
        citiesAndInterests: payload.citiesAndInterests ?? '',
        whatsapp: payload.whatsapp ?? '',
        travelDate: payload.plannedTravelMonth ?? payload.travelDate ?? '',
        travelers: payload.numberOfTravellers ?? payload.travelers ?? '',
        helpWith: payload.citiesAndInterests ?? payload.helpWith ?? '',
      };
  try {
    const res = await fetch('/api/leads/trip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: payload.requestId,
        email: payload.email,
        ...formFields,
        consentAccepted: payload.consentAccepted ?? false,
        consentVersion: payload.consentVersion ?? 'trip-lead-2026-08',
        locale: (payload.locale ?? document.documentElement.lang) || 'en',
        sourcePath: payload.sourcePath ?? (window.location.pathname + window.location.search),
        utmSource: attr.utm_source,
        utmMedium: attr.utm_medium,
        utmCampaign: attr.utm_campaign,
        utmContent: attr.utm_content,
        website: '',
        honeypot: '',
      }),
    });

    if (res.status === 429) return 'too_many';
    if (res.status !== 200) return 'error';

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return 'error';

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      return 'error';
    }

    if (
      data &&
      typeof data === 'object' &&
      'status' in data &&
      (data as Record<string, unknown>).status === 'received'
    ) {
      return 'success';
    }
    return 'error';
  } catch {
    return 'error';
  }
}
