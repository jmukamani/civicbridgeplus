const CACHE_NAME = 'civicbridge-v1';
const OFFLINE_URL = '/offline.html';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/logo192.png',
  '/logo512.png',
  OFFLINE_URL
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL))
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  }
});