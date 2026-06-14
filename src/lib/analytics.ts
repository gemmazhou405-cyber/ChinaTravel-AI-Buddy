import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config';

type UtmKey = 'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_content';

type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
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
const ANON_SESSION_KEY = 'chinaease:anonymousSessionId';
const ONCE_PREFIX = 'chinaease:analyticsOnce:';
const isDev = import.meta.env.DEV;

const utmKeys: UtmKey[] = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];

function safeStorage(kind: 'localStorage' | 'sessionStorage'): Storage | null {
  try {
    return window[kind];
  } catch {
    return null;
  }
}

function readJson<T>(storage: Storage | null, key: string): T | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(storage: Storage | null, key: string, value: unknown) {
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can fail in private browsing or embedded browsers.
  }
}

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
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
  } catch {
    return generateId();
  }
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

  if (!firstTouch) {
    writeJson(local, FIRST_TOUCH_KEY, current);
  }
  writeJson(session, SESSION_ATTR_KEY, current);
  getAnonymousSessionId();
}

export function getAttributionContext() {
  const session = safeStorage('sessionStorage');
  const local = safeStorage('localStorage');
  const sessionAttribution = readJson<Attribution>(session, SESSION_ATTR_KEY);
  const firstTouch = readJson<Attribution>(local, FIRST_TOUCH_KEY);
  const attribution = sessionAttribution || firstTouch || parseAttribution();

  return {
    utm_source: attribution.utm_source || '',
    utm_medium: attribution.utm_medium || '',
    utm_campaign: attribution.utm_campaign || '',
    utm_content: attribution.utm_content || '',
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

export function markTrackedOnce(key: string) {
  const session = safeStorage('sessionStorage');
  try {
    const storageKey = `${ONCE_PREFIX}${key}`;
    if (session?.getItem(storageKey)) return false;
    session?.setItem(storageKey, '1');
    return true;
  } catch {
    return true;
  }
}

export async function trackEvent(eventName: string, payload: AnalyticsPayload = {}, userId?: string | null) {
  const context = getAttributionContext();
  const event = {
    eventName,
    ...cleanPayload(context),
    ...cleanPayload(payload),
    path: payload.path || `${window.location.pathname}${window.location.search}`,
    timestamp: Date.now(),
    createdAt: serverTimestamp(),
    ...(userId ? { userId } : {}),
  };

  if (isDev) {
    console.log('[ChinaEase analytics] event queued', {
      eventName,
      payload: event,
    });
  }

  try {
    await addDoc(collection(db, 'analyticsEvents'), event);
    if (isDev) {
      console.log('[ChinaEase analytics] Firestore write succeeded', {
        eventName,
      });
    }
  } catch (error) {
    if (isDev) {
      console.warn('Analytics write failed, but app continues.', {
        eventName,
        error,
      });
    }
  }
}

export function trackEventOnce(key: string, eventName: string, payload: AnalyticsPayload = {}, userId?: string | null) {
  if (!markTrackedOnce(key)) return;
  void trackEvent(eventName, payload, userId);
}

export function trackAppError(errorType: AppErrorType, payload: AnalyticsPayload = {}, userId?: string | null) {
  void trackEvent('app_error', {
    errorType,
    ...payload,
  }, userId);
}
