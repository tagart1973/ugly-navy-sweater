// Service worker self-destruct — unregisters all service workers for this scope
self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(cacheNames) {
      // Delete ALL caches
      return Promise.all(cacheNames.map(function(name) {
        console.log('Deleting cache:', name);
        return caches.delete(name);
      }));
    }).then(function() {
      // Unregister this service worker
      return self.registration.unregister();
    }).then(function() {
      console.log('Service worker unregistered');
    })
  );
});

// Intercept fetch requests and bypass cache entirely
self.addEventListener('fetch', function(e) {
  // Just pass through to network — no caching
  e.respondWith(fetch(e.request));
});