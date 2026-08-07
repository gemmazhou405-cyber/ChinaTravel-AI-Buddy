const CACHE = 'chinaease-v2';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

function isHtmlNavigation(url) {
  const { pathname } = url;
  return pathname.endsWith('/') || !pathname.includes('.');
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (isHtmlNavigation(url)) {
    // Network-first for HTML pages: always fetch fresh so new deployments are seen immediately.
    // Fall back to cache only when offline.
    e.respondWith(
      fetch(req)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            caches.open(CACHE).then((c) => c.put(req, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(req)),
    );
  } else {
    // Cache-first for hashed assets (JS bundles, CSS, fonts, images).
    e.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        const response = await fetch(req);
        if (response.ok && response.type === 'basic') {
          cache.put(req, response.clone());
        }
        return response;
      }),
    );
  }
});
