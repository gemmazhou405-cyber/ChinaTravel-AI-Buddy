type UtmKey = 'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_content' | 'utm_term';

type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer: string;
  landingPath: string;
  landingJourney?: string;
  landingTool?: string;
  firstVisitTimestamp: number;
};

type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;
export type AppErrorType =
  | 'auth_error'
  | 'ai_connection_error'
  | 'ai_timeout'
  | 'quota_exhausted'
  | 'image_invalid'
  | 'image_too_large'
  | 'scan_failed'
  | 'firestore_permission_error'
  | 'newsletter_error'
  | 'checkout_error';

const FIRST_TOUCH_KEY = 'chinaease:firstTouchAttribution';
const SESSION_ATTR_KEY = 'chinaease:sessionAttribution';
const SESSION_TEST_KEY = 'chinaease:testMode';
const ANON_SESSION_KEY = 'chinaease:anonymousSessionId';
const ONCE_PREFIX = 'chinaease:analyticsOnce:';
const FUNNEL_PREFIX = 'chinaease_funnel_';
const isDev = import.meta.env.DEV;

// Events that are posted to /api/events in production.
// All other events are dev-only console.log and are silently dropped in production.
const FUNNEL_EVENTS = new Set([
  'buddy_opened',
  'buddy_question_sent',
  'lead_cta_shown',
  'lead_form_opened',
  'lead_submit_started',
  'lead_submit_success',
  'lead_submit_failed',
  'gumroad_click',
]);

const utmKeys: UtmKey[] = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function safeStorage(kind: 'localStorage' | 'sessionStorage'): Storage | null {
  try { return window[kind]; } catch { return null; }
}

function readJson<T>(storage: Storage | null, key: string): T | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

function writeJson(storage: Storage | null, key: string, value: unknown) {
  if (!storage) return;
  try { storage.setItem(key, JSON.stringify(value)); } catch { /* storage full in private browsing */ }
}

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getAnonymousSessionId() {
  const local = safeStorage('localStorage');
  try {
    const existing = local?.getItem(ANON_SESSION_KEY);
    if (existing) return existing;
    const next = generateId();
    local?.setItem(ANON_SESSION_KEY, next);
    return next;
  } catch { return generateId(); }
}

function parseAttribution(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const attribution: Attribution = {
    referrer: document.referrer || '',
    landingPath: `${window.location.pathname}${window.location.search}`,
    landingJourney: params.get('journey') || undefined,
    landingTool: params.get('tool') || undefined,
    firstVisitTimestamp: Date.now(),
  };
  utmKeys.forEach((key) => {
    const value = params.get(key);
    if (value) attribution[key] = value;
  });
  return attribution;
}

export function initAttribution() {
  const local = safeStorage('localStorage');
  const session = safeStorage('sessionStorage');
  const current = parseAttribution();
  const firstTouch = readJson<Attribution>(local, FIRST_TOUCH_KEY);
  if (!firstTouch) writeJson(local, FIRST_TOUCH_KEY, current);
  writeJson(session, SESSION_ATTR_KEY, current);
  // Persist test flag for the session so environment stays "test" after navigation away from ?test_mode=1
  if (new URLSearchParams(window.location.search).get('test_mode') === '1') {
    try { session?.setItem(SESSION_TEST_KEY, '1'); } catch { /* ignore */ }
  }
  getAnonymousSessionId();
}

export function getAttributionContext() {
  const session = safeStorage('sessionStorage');
  const local = safeStorage('localStorage');
  const sessionAttribution = readJson<Attribution>(session, SESSION_ATTR_KEY);
  const firstTouch = readJson<Attribution>(local, FIRST_TOUCH_KEY);
  // Use session attribution if it carries any UTM signal; otherwise fall back to first-touch.
  // Checking any field avoids the edge case where utm_source is absent but another UTM is present.
  const hasSessionUtms = !!(
    sessionAttribution?.utm_source ||
    sessionAttribution?.utm_medium ||
    sessionAttribution?.utm_campaign ||
    sessionAttribution?.utm_content ||
    sessionAttribution?.utm_term
  );
  const attribution = (hasSessionUtms ? sessionAttribution : firstTouch) || parseAttribution();
  return {
    utm_source: attribution.utm_source || '',
    utm_medium: attribution.utm_medium || '',
    utm_campaign: attribution.utm_campaign || '',
    utm_content: attribution.utm_content || '',
    utm_term: attribution.utm_term || '',
    referrer: attribution.referrer || '',
    landingPath: attribution.landingPath || '',
    landingJourney: attribution.landingJourney || '',
    landingTool: attribution.landingTool || '',
    firstVisitTimestamp: attribution.firstVisitTimestamp || Date.now(),
    anonymousSessionId: getAnonymousSessionId(),
  };
}

function cleanPayload(payload: AnalyticsPayload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

function getEnvironment(): string {
  try {
    if (window.location.hostname.endsWith('.pages.dev')) return 'preview';
    const session = safeStorage('sessionStorage');
    if (
      new URLSearchParams(window.location.search).get('test_mode') === '1' ||
      session?.getItem(SESSION_TEST_KEY) === '1'
    ) return 'test';
    return 'production';
  } catch { return 'production'; }
}

function getDeviceCategory(): string {
  try {
    const ua = navigator.userAgent.toLowerCase();
    if (/tablet|ipad/.test(ua)) return 'tablet';
    if (/mobile|android|iphone|ipod/.test(ua)) return 'mobile';
    return 'desktop';
  } catch { return 'unknown'; }
}

function getClientLocale(): string {
  const local = safeStorage('localStorage');
  try {
    const lng = local?.getItem('i18nextLng') || navigator.language || 'en';
    return lng.slice(0, 8);
  } catch { return 'en'; }
}

// Marks a funnel event as seen for this browser session. Returns true on first call
// (caller should fire the event), false if already seen (caller should skip).
// Keys are stored in sessionStorage and cleared when the tab/browser session ends.
// Values are never uploaded to any server.
export function markFunnelOnce(event: string): boolean {
  const session = safeStorage('sessionStorage');
  try {
    const key = `${FUNNEL_PREFIX}${event}`;
    if (session?.getItem(key)) return false;
    session?.setItem(key, '1');
    return true;
  } catch { return true; }
}

export function markTrackedOnce(key: string) {
  const session = safeStorage('sessionStorage');
  try {
    const storageKey = `${ONCE_PREFIX}${key}`;
    if (session?.getItem(storageKey)) return false;
    session?.setItem(storageKey, '1');
    return true;
  } catch { return true; }
}

export async function trackEvent(eventName: string, payload: AnalyticsPayload = {}, userId?: string | null) {
  void userId; // accepted by callers for future use; not included in event payload
  if (isDev) {
    const context = getAttributionContext();
    console.log('[ChinaEase analytics]', eventName, {
      ...cleanPayload(context),
      ...cleanPayload(payload),
      path: payload.path || `${window.location.pathname}${window.location.search}`,
      timestamp: Date.now(),
    });
  }

  if (!FUNNEL_EVENTS.has(eventName)) return;

  const attr = getAttributionContext();
  const body: Record<string, string> = {
    event: eventName,
    environment: getEnvironment(),
    deviceCategory: getDeviceCategory(),
    locale: getClientLocale(),
    sourcePath: window.location.pathname.slice(0, 500),
  };
  if (attr.utm_source) body.utmSource = attr.utm_source.slice(0, 80);
  if (attr.utm_medium) body.utmMedium = attr.utm_medium.slice(0, 80);
  if (attr.utm_campaign) body.utmCampaign = attr.utm_campaign.slice(0, 120);
  if (attr.utm_content) body.utmContent = attr.utm_content.slice(0, 80);
  if (attr.utm_term) body.utmTerm = attr.utm_term.slice(0, 80);
  const referrerDomain = (() => {
    try { return attr.referrer ? new URL(attr.referrer).hostname : ''; } catch { return ''; }
  })();
  if (referrerDomain) body.referrerDomain = referrerDomain.slice(0, 100);
  const landingPath = attr.landingPath ? attr.landingPath.split('?')[0] : '';
  if (landingPath) body.landingPath = landingPath.slice(0, 200);
  if (eventName === 'gumroad_click') {
    const plan = typeof payload.plan === 'string' ? payload.plan : '';
    if (plan === 'trip' || plan === 'group') body.plan = plan;
  }

  // Fire-and-forget: analytics failure must never surface to the user.
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {});
}

export function trackEventOnce(key: string, eventName: string, payload: AnalyticsPayload = {}, userId?: string | null) {
  if (!markTrackedOnce(key)) return;
  void trackEvent(eventName, payload, userId);
}

export function trackGumroadClick(plan: 'trip' | 'group') {
  void trackEvent('gumroad_click', { plan });
}

export function trackAppError(errorType: AppErrorType, payload: AnalyticsPayload = {}, userId?: string | null) {
  void trackEvent('app_error', { errorType, ...payload }, userId);
}
