import { getCampaignPartner, type CampaignLandingVariant } from '../data/campaignPartners';

const FIRST_TOUCH_KEY = 'chinaease:campaign:firstTouch';
const LAST_TOUCH_KEY = 'chinaease:campaign:lastTouch';
const SAFE_VALUE = /^[a-zA-Z0-9._~-]+$/;

export type CampaignTouch = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  campaign: string;
  channel: string;
  ref: string;
  partner_id: string;
  partner_type: string;
  landing_variant: string;
  source_path: string;
  captured_at: number;
};

function safeSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try { return window.sessionStorage; } catch { return null; }
}

export function sanitizeCampaignValue(value: string | null | undefined, max = 80): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed || trimmed.length > max || !SAFE_VALUE.test(trimmed)) return '';
  return trimmed;
}

function readTouch(key: string): CampaignTouch | null {
  try {
    const raw = safeSessionStorage()?.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CampaignTouch;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch { return null; }
}

function writeTouch(key: string, touch: CampaignTouch) {
  try { safeSessionStorage()?.setItem(key, JSON.stringify(touch)); } catch { /* private mode */ }
}

export function captureCampaignAttribution(variant?: CampaignLandingVariant | null) {
  if (typeof window === 'undefined') return { touch: null, partner: null };
  const params = new URLSearchParams(window.location.search);
  const rawPartner = sanitizeCampaignValue(params.get('partner') || params.get('ref'), 40);
  const rawChannel = sanitizeCampaignValue(params.get('channel'), 40);
  const rawCampaign = sanitizeCampaignValue(params.get('campaign'), 120);
  const partner = variant ? getCampaignPartner(rawPartner, variant) : null;
  const touch: CampaignTouch = {
    utm_source: sanitizeCampaignValue(params.get('utm_source')),
    utm_medium: sanitizeCampaignValue(params.get('utm_medium')),
    utm_campaign: sanitizeCampaignValue(params.get('utm_campaign'), 120),
    utm_content: sanitizeCampaignValue(params.get('utm_content')),
    campaign: rawCampaign,
    channel: rawChannel,
    ref: rawPartner,
    partner_id: rawPartner,
    partner_type: partner?.type ?? rawChannel,
    landing_variant: variant ?? '',
    source_path: window.location.pathname.slice(0, 160),
    captured_at: Date.now(),
  };
  const hasSignal = Boolean(
    touch.utm_source || touch.utm_medium || touch.utm_campaign || touch.utm_content
      || touch.campaign || touch.channel || touch.partner_id,
  );
  if (hasSignal) {
    if (!readTouch(FIRST_TOUCH_KEY)) writeTouch(FIRST_TOUCH_KEY, touch);
    writeTouch(LAST_TOUCH_KEY, touch);
  }
  return { touch, partner };
}

export function getCampaignAttribution() {
  const first = readTouch(FIRST_TOUCH_KEY);
  const last = readTouch(LAST_TOUCH_KEY) ?? first;
  return {
    firstTouch: first,
    lastTouch: last,
    first_touch_source: first?.utm_source || first?.partner_id || '',
    last_touch_source: last?.utm_source || last?.partner_id || '',
    partner_id: last?.partner_id || '',
    partner_type: last?.partner_type || '',
    channel: last?.channel || '',
    campaign: last?.campaign || '',
    landing_variant: last?.landing_variant || '',
  };
}
