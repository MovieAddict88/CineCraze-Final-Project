const CACHE_VERSION = 'v1.0.0';
const APP_CACHE = `cinecraze-app-${CACHE_VERSION}`;
const RUNTIME_CACHE = `cinecraze-runtime-${CACHE_VERSION}`;

const OFFLINE_URL = '/offline.html';

const APP_SHELL = [
  '/',
  '/index.php',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  OFFLINE_URL,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('cinecraze-') && key !== APP_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Bypass non-GET or cross-origin requests not relevant to caching
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Same-origin navigation requests: Network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put('/index.php', copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match('/index.php');
          return cached || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Static assets: Cache-first
  if (url.origin === location.origin && (
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.webmanifest') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp')
  )) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(APP_CACHE).then((cache) => cache.put(request, copy));
          return response;
        });
      })
    );
    return;
  }

  // Other requests: Network with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request))
  );
});
