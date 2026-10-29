const DEFAULT_URLS = {
  trip: 'https://chinaeasebuddy.gumroad.com/l/oentc',
  group: 'https://chinaeasebuddy.gumroad.com/l/mbgkxz',
};

// This opens checkout only. Purchase and Pass activation remain server-verified.
export function gumroadCheckoutUrl(plan: 'trip' | 'group'): string {
  const configured = plan === 'trip' ? import.meta.env.VITE_GUMROAD_TRIP_URL : import.meta.env.VITE_GUMROAD_GROUP_URL;
  let url: URL;
  try { url = new URL(configured || DEFAULT_URLS[plan]); }
  catch { url = new URL(DEFAULT_URLS[plan]); }
  if (url.protocol !== 'https:') url = new URL(DEFAULT_URLS[plan]);
  url.searchParams.set('wanted', 'true');
  return url.href;
}
