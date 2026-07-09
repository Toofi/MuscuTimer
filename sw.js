const CACHE = 'series-repos-v2';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request).catch(() => r))
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      if (list.length) return list[0].focus();
      return self.clients.openWindow('./');
    })
  );
});

// Allows the page to ask the SW to display a notification (more reliable on Android
// than calling `new Notification()` directly from the page).
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'notify') {
    const { title, body, tag } = e.data;
    self.registration.showNotification(title, {
      body,
      tag,
      renotify: true,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      silent: true // le bip sonore est déjà joué par la page elle-même
    });
  }
});
