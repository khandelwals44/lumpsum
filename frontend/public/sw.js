const CACHE_VERSION = "v2";
const HTML_CACHE = `lumpsum-html-${CACHE_VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !k.includes(CACHE_VERSION)).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Disable caching in local development to avoid stale bundles
  if (self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1") {
    return;
  }

  const isHTML =
    event.request.mode === "navigate" ||
    (event.request.headers.get("accept") || "").includes("text/html");
  if (isHTML) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(event.request);
          const cache = await caches.open(HTML_CACHE);
          cache.put(event.request, fresh.clone());
          return fresh;
        } catch (e) {
          const cache = await caches.open(HTML_CACHE);
          const cached = await cache.match(event.request);
          return cached || Response.error();
        }
      })()
    );
  }
});
