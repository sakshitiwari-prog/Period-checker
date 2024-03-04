const VERSION = "v5";
const CACHE_NAME = `period-tracker-${VERSION}`;
const APP_STATIC_RESOURCES = ["/", "/index.html", "/Logo.png", "/script.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        await cache.addAll(APP_STATIC_RESOURCES);
      } catch (error) {
        console.error("Failed to cache static resources:", error);
        throw error;
      }
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      // console.log(cacheNames, "cacheNames");
      await Promise.all(
        cacheNames.map((name) => {
          // console.log(name !== CACHE_NAME);
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
      await clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      // console.log(event.request, "-------------");
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })()
  );
});
