const CACHE_NAME = 'deep-study-bible-v1';

// Add core assets to cache
const CORE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.png',
  '/apple-icon.png',
  '/data/bible.json',
  '/settings',
  '/search'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // We only want to intercept basic navigation requests and api requests where we can provide a fallback
  if (event.request.method !== 'GET') return;
  
  // For data API requests from bible-api.com (like fetching chapters), we use a stale-while-revalidate strategy if possible,
  // but wait, bible-api.com requests shouldn't be cached in the general asset cache without a limit.
  // Actually, for simplicity of the PWA, let's just do a Network First, fallback to Cache strategy for everything.
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If it's a valid response, clone it and cache it for future offline use
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, look in the cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If not in cache and it's a navigation request, maybe return the offline page?
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      })
  );
});
