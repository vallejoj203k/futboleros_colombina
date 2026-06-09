const CACHE = 'mv2026-v3';
const STATIC = ['/', '/index.html', '/logo.png', '/login.jpg'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(STATIC); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // API calls — always network, never cache
  if (e.request.url.includes('/api/')) return;

  var url = e.request.url;
  var isHTML = url.endsWith('/') || url.endsWith('/index.html') || !url.includes('.');

  if (isHTML) {
    // HTML — network-first: always try to get fresh version, fall back to cache offline
    e.respondWith(
      fetch(e.request).then(function(res) {
        if (res.ok) {
          var clone = res.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        }
        return res;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
  } else {
    // Assets (images, etc.) — cache-first
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        return cached || fetch(e.request).then(function(res) {
          if (res.ok && e.request.method === 'GET') {
            var clone = res.clone();
            caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
          }
          return res;
        });
      })
    );
  }
});
