const CACHE_NAME = 'shm-site-v2';
const ASSETS = [
  './', './index.html', './track.html', './admin-login.html', './admin.html', './styles.css', './manifest.webmanifest',
  './assets/favicon.svg','./assets/og-cover.svg','./assets/product-1.svg','./assets/product-2.svg','./assets/product-3.svg','./google89cc9db4731079f1.html'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
