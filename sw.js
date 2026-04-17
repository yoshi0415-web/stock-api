const CACHE_NAME = "kabutree-cache-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/script.js",
  "/icon1.0.PNG"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
