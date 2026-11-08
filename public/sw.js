// Service worker: caches the app shell so it opens fast
// and shows the last news seen when offline.

const SHELL = 'eh-shell-v1';
const DATA = 'eh-data-v1';
const SHELL_FILES = ['/', '/styles.css', '/app.js', '/manifest.webmanifest', '/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL && k !== DATA).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  if (url.pathname.startsWith('/api/')) {
    // Data: network first; if it fails, the last saved copy.
    e.respondWith(
      fetch(e.request)
        .then((res) => { const copy = res.clone(); caches.open(DATA).then((c) => c.put(e.request, copy)); return res; })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  // App files: network first (to pick up changes), cache as fallback.
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
