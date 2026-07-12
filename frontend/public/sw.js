const CACHE_NAME = 'weaving-designs-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/logo.jpg',
  '/logo.png'
];

// Install SW and cache initial shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate SW and clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Bypass cache for API calls and non-local requests
  if (url.pathname.startsWith('/api/') || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Network-First strategy for HTML document navigations (ensures index.html is always fresh)
  if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // Cache-First strategy for static assets (images, fonts, scripts, styles)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Dynamically cache static bundle assets and images
          const isStaticAsset = url.pathname.includes('/assets/') || 
                                url.pathname.match(/\.(png|jpg|jpeg|gif|svg|woff2?|ico|json)$/i);
          if (isStaticAsset) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If a resource is not in cache and network fails, return fallback
          return new Response('Network error occurred', { status: 488, headers: { 'Content-Type': 'text/plain' } });
        });
    })
  );
});
