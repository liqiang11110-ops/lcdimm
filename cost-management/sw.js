const VERSION = 'juanjie-cost-pwa-20260612';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll([
      '/cost-management/manifest.webmanifest',
      '/cost-management/icon.svg',
      '/cost-management/icon-192.svg',
      '/cost-management/icon-512.svg',
      '/cost-management/icon-192.png',
      '/cost-management/icon-512.png',
      '/cost-management/apple-touch-icon.png'
    ]))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/') || url.hostname.includes('app.tcloudbase.com')) {
    event.respondWith(fetch(event.request));
    return;
  }
  if (url.pathname.endsWith('.webmanifest') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.png')) {
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
  }
});
