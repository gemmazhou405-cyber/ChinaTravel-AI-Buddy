// Where did this visitor come from? Records a first touch (kept 30 days, never overwritten) and a
// last touch (updated on every new visit) so each trip enquiry can say which channel produced it.
//
// This module is also imported by functions/api/leads/trip.js, which re-runs sanitizeTouch() and
// classifyChannel() on the server so a lead never stores a channel the client merely asserted.
// Nothing here stores personal data: referrers keep only host + path, query strings are dropped,
// and no identifier is written.

export type LeadChannel =
  | 'utm'
  | 'partner'
  | 'organic_search'
  | 'ai_assistant'
  | 'social'
  | 'referral'
  | 'direct';

export type LeadTouch = {
  channel: LeadChannel;
  /** Search engine / AI assistant / social platform name, referring host, or UTM source. */
  channelDetail: string;
  /** External referrer as host + path, without query string or fragment. Empty for direct. */
  referrer: string;
  /** First page of this visit on our site (path only). */
  landingPage: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  partner: string;
  capturedAt: number;
};

export const LEAD_SOURCE_FIRST_TOUCH_KEY = 'chinaease:leadSource:firstTouch';
export const LEAD_SOURCE_LAST_TOUCH_KEY = 'chinaease:leadSource:lastTouch';
const SESSION_VISIT_KEY = 'chinaease:leadSource:visit';
export const FIRST_TOUCH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const OWN_HOSTS = ['chinaeasebuddy.com', 'chinaease-buddy.pages.dev'];
const SAFE_VALUE = /^[a-zA-Z0-9._~-]+$/;
const CHANNELS: readonly LeadChannel[] = ['utm', 'partner', 'organic_search', 'ai_assistant', 'social', 'referral', 'direct'];

// Order matters: AI assistants are checked before search engines (gemini.google.com, copilot on bing.com).
const AI_ASSISTANTS: Array<[RegExp, string]> = [
  [/(^|\.)chatgpt\.com$/, 'chatgpt'],
  [/(^|\.)chat\.openai\.com$/, 'chatgpt'],
  [/(^|\.)perplexity\.ai$/, 'perplexity'],
  [/(^|\.)claude\.ai$/, 'claude'],
  [/(^|\.)gemini\.google\.com$/, 'gemini'],
  [/(^|\.)bard\.google\.com$/, 'gemini'],
  [/(^|\.)copilot\.microsoft\.com$/, 'copilot'],
  [/(^|\.)copilot\.cloud\.microsoft$/, 'copilot'],
  [/(^|\.)chat\.deepseek\.com$/, 'deepseek'],
  [/(^|\.)grok\.com$/, 'grok'],
  [/(^|\.)meta\.ai$/, 'meta_ai'],
  [/(^|\.)poe\.com$/, 'poe'],
  [/(^|\.)you\.com$/, 'you'],
  [/(^|\.)kimi\.(com|moonshot\.cn)$/, 'kimi'],
  [/(^|\.)mistral\.ai$/, 'mistral'],
];

const SEARCH_ENGINES: Array<[RegExp, string]> = [
  [/(^|\.)google\.[a-z.]+$/, 'google'],
  [/(^|\.)bing\.com$/, 'bing'],
  [/(^|\.)duckduckgo\.com$/, 'duckduckgo'],
  [/(^|\.)search\.yahoo\.[a-z.]+$/, 'yahoo'],
  [/(^|\.)yahoo\.[a-z.]+$/, 'yahoo'],
  [/(^|\.)yandex\.[a-z.]+$/, 'yandex'],
  [/(^|\.)baidu\.com$/, 'baidu'],
  [/(^|\.)ecosia\.org$/, 'ecosia'],
  [/(^|\.)search\.brave\.com$/, 'brave'],
  [/(^|\.)startpage\.com$/, 'startpage'],
  [/(^|\.)naver\.com$/, 'naver'],
  [/(^|\.)qwant\.com$/, 'qwant'],
  [/(^|\.)sogou\.com$/, 'sogou'],
];

const SOCIAL_PLATFORMS: Array<[RegExp, string]> = [
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, 'facebook'],
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)(reddit\.com|redd\.it)$/, 'reddit'],
  [/(^|\.)quora\.com$/, 'quora'],
  [/(^|\.)trip\.com$/, 'trip.com'],
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'youtube'],
  [/(^|\.)tiktok\.com$/, 'tiktok'],
  [/(^|\.)(pinterest\.[a-z.]+|pin\.it)$/, 'pinterest'],
  [/(^|\.)(x\.com|twitter\.com|t\.co)$/, 'x'],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, 'linkedin'],
  [/(^|\.)threads\.(net|com)$/, 'threads'],
  [/(^|\.)xiaohongshu\.com$/, 'xiaohongshu'],
];

function matchHost(host: string, table: Array<[RegExp, string]>) {
  return table.find(([pattern]) => pattern.test(host))?.[1] ?? '';
}

function cleanValue(value: unknown, max = 80) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed && trimmed.length <= max && SAFE_VALUE.test(trimmed) ? trimmed : '';
}

function cleanPath(value: unknown, max = 200) {
  if (typeof value !== 'string' || !value.startsWith('/')) return '';
  // Path only: drop query string and fragment, and any segment that looks like an email address.
  const path = value.split(/[?#]/)[0]
    .split('/')
    .map((segment) => (segment.includes('@') || segment.includes('%40') ? '_' : segment))
    .join('/');
  return /^[\x21-\x7e]*$/.test(path) ? path.slice(0, max) : '';
}

export function isOwnHost(host: string, currentHost = '') {
  const h = host.toLowerCase();
  if (currentHost && h === currentHost.toLowerCase()) return true;
  return OWN_HOSTS.some((own) => h === own || h.endsWith(`.${own}`));
}

/** Reduce a document.referrer value to "host/path" with no query string. Internal or invalid → ''. */
export function sanitizeReferrer(value: unknown, currentHost = '') {
  if (typeof value !== 'string' || !value) return '';
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (!host || isOwnHost(host, currentHost.replace(/^www\./, ''))) return '';
    const path = cleanPath(url.pathname, 160);
    return `${host}${path === '/' ? '' : path}`.slice(0, 200);
  } catch {
    return '';
  }
}

function referrerHost(referrer: string) {
  return referrer.split('/')[0] ?? '';
}

export function classifyChannel(input: {
  referrer: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  partner?: string;
}): { channel: LeadChannel; channelDetail: string } {
  if (input.utmSource || input.utmMedium || input.utmCampaign) {
    return {
      channel: 'utm',
      channelDetail: [input.utmSource, input.utmMedium, input.utmCampaign].filter(Boolean).join(' / '),
    };
  }
  if (input.partner) return { channel: 'partner', channelDetail: input.partner };
  const host = referrerHost(input.referrer);
  if (!host) return { channel: 'direct', channelDetail: '' };
  const ai = matchHost(host, AI_ASSISTANTS);
  if (ai) return { channel: 'ai_assistant', channelDetail: host };
  const search = matchHost(host, SEARCH_ENGINES);
  if (search) return { channel: 'organic_search', channelDetail: host };
  const social = matchHost(host, SOCIAL_PLATFORMS);
  if (social) return { channel: 'social', channelDetail: social };
  return { channel: 'referral', channelDetail: host };
}

/** Build the touch for the current page load from its URL and document.referrer. */
export function buildTouch(input: { href: string; referrer: string; now?: number }): LeadTouch {
  const url = new URL(input.href);
  const params = url.searchParams;
  const referrer = sanitizeReferrer(input.referrer, url.hostname);
  const base = {
    referrer,
    landingPage: cleanPath(url.pathname) || '/',
    utmSource: cleanValue(params.get('utm_source')),
    utmMedium: cleanValue(params.get('utm_medium')),
    utmCampaign: cleanValue(params.get('utm_campaign'), 120),
    utmContent: cleanValue(params.get('utm_content'), 120),
    partner: cleanValue(params.get('partner') || params.get('ref'), 40),
    capturedAt: input.now ?? Date.now(),
  };
  return { ...base, ...classifyChannel(base) };
}

/** Server-side re-validation of a touch posted by the browser. Returns null when unusable. */
export function sanitizeTouch(value: unknown): LeadTouch | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const referrer = typeof raw.referrer === 'string' ? sanitizeReferrer(`https://${raw.referrer}`) : '';
  const capturedAt = typeof raw.capturedAt === 'number' && Number.isFinite(raw.capturedAt) ? Math.round(raw.capturedAt) : 0;
  const base = {
    referrer,
    landingPage: cleanPath(raw.landingPage) || '',
    utmSource: cleanValue(raw.utmSource),
    utmMedium: cleanValue(raw.utmMedium),
    utmCampaign: cleanValue(raw.utmCampaign, 120),
    utmContent: cleanValue(raw.utmContent, 120),
    partner: cleanValue(raw.partner, 40),
    capturedAt,
  };
  if (!base.landingPage && !capturedAt) return null;
  return { ...base, ...classifyChannel(base) };
}

export function isLeadChannel(value: unknown): value is LeadChannel {
  return typeof value === 'string' && (CHANNELS as readonly string[]).includes(value);
}

function storage(kind: 'localStorage' | 'sessionStorage'): Storage | null {
  if (typeof window === 'undefined') return null;
  try { return window[kind]; } catch { return null; }
}

type Stored = { touch: LeadTouch; expiresAt: number };

function readStored(store: Storage | null, key: string, now: number): LeadTouch | null {
  try {
    const raw = store?.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed?.touch || typeof parsed.expiresAt !== 'number' || parsed.expiresAt <= now) {
      store?.removeItem(key);
      return null;
    }
    return parsed.touch;
  } catch { return null; }
}

function writeStored(store: Storage | null, key: string, touch: LeadTouch, now: number) {
  try { store?.setItem(key, JSON.stringify({ touch, expiresAt: now + FIRST_TOUCH_TTL_MS } satisfies Stored)); } catch { /* storage blocked */ }
}

let capturedThisPage = false;

/**
 * Call once per page load. A page load counts as a new visit when it carries UTM/partner
 * parameters, arrives from an external site, or is the first page of a browser session.
 * Internal navigation and reloads keep the existing last touch.
 */
export function captureLeadSource(now = Date.now()) {
  if (typeof window === 'undefined' || capturedThisPage) return;
  capturedThisPage = true;
  const local = storage('localStorage');
  const session = storage('sessionStorage');
  let touch: LeadTouch;
  try {
    touch = buildTouch({ href: window.location.href, referrer: document.referrer, now });
  } catch { return; }

  let sessionSeen = false;
  try {
    sessionSeen = session?.getItem(SESSION_VISIT_KEY) === '1';
    session?.setItem(SESSION_VISIT_KEY, '1');
  } catch { /* ignore */ }

  const isNewVisit = touch.channel !== 'direct' || !sessionSeen;
  if (!readStored(local, LEAD_SOURCE_FIRST_TOUCH_KEY, now)) writeStored(local, LEAD_SOURCE_FIRST_TOUCH_KEY, touch, now);
  if (isNewVisit || !readStored(local, LEAD_SOURCE_LAST_TOUCH_KEY, now)) writeStored(local, LEAD_SOURCE_LAST_TOUCH_KEY, touch, now);
}

/** Touches to send with a trip enquiry. Falls back to the current page when storage is blocked. */
export function getLeadSource(now = Date.now()): { firstTouch: LeadTouch | null; lastTouch: LeadTouch | null } {
  if (typeof window === 'undefined') return { firstTouch: null, lastTouch: null };
  const local = storage('localStorage');
  const firstTouch = readStored(local, LEAD_SOURCE_FIRST_TOUCH_KEY, now);
  const lastTouch = readStored(local, LEAD_SOURCE_LAST_TOUCH_KEY, now);
  if (firstTouch || lastTouch) return { firstTouch: firstTouch ?? lastTouch, lastTouch: lastTouch ?? firstTouch };
  try {
    const current = buildTouch({ href: window.location.href, referrer: document.referrer, now });
    return { firstTouch: current, lastTouch: current };
  } catch {
    return { firstTouch: null, lastTouch: null };
  }
}

export function resetLeadSourceCaptureForTests() {
  capturedThisPage = false;
}
