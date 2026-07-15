// Service Worker for offline support and caching
const CACHE_NAME = "nutri-intelligence-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/src/main.tsx",
  "/src/App.tsx",
  "/src/index.css"
];

self.addEventListener("install", (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch((err) => {
        console.warn("Service worker install caching failed or was blocked:", err);
      })
  );
});

self.addEventListener("activate", (event: any) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache).catch(() => false);
            }
          })
        );
      })
      .catch((err) => {
        console.warn("Service worker activate cache cleanup failed or was blocked:", err);
      })
  );
});

self.addEventListener("fetch", (event: any) => {
  // Avoid interception for chrome extensions or foreign origins
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== "basic") {
              return response;
            }

            // Do not cache API endpoints or server-side requests
            if (event.request.url.includes("/api/")) {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache).catch(() => {});
              })
              .catch(() => {});

            return response;
          })
          .catch(() => {
            // Fallback if network fails and resource not cached
            if (event.request.headers.get("accept")?.includes("text/html")) {
              return caches.match("/").catch(() => undefined as any);
            }
          });
      })
      .catch(() => {
        // If caches.match fails, fallback directly to fetching from the network
        return fetch(event.request).catch(() => undefined as any);
      })
  );
});

export {};
