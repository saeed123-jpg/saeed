// Cleanup worker for older browser-shortcut/PWA installs.
// It removes previous caches, unregisters itself, then reloads open pages once.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      await self.registration.unregister();

      const pages = await self.clients.matchAll({
        includeUncontrolled: true,
        type: "window"
      });

      await Promise.all(
        pages.map((page) => {
          if ("navigate" in page) return page.navigate(page.url);
          return undefined;
        })
      );
    })()
  );
});
