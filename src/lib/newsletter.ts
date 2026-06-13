import { getAttributionContext } from './analytics';

export type NewsletterResult = 'subscribed' | 'already_subscribed';

export async function subscribeNewsletter(email: string, locale: string, honeypot = '') {
  const attribution = getAttributionContext();
  const res = await fetch('/api/newsletter/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      locale,
      website: honeypot,
      sourcePath: `${window.location.pathname}${window.location.search}`,
      ...attribution,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || body.error || 'subscribe_failed');
  return body.status as NewsletterResult;
}

export async function unsubscribeNewsletter(email: string, token?: string | null) {
  const res = await fetch('/api/newsletter/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || body.error || 'unsubscribe_failed');
  return body.status as string;
}
