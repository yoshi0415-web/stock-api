const CACHE_NAME = "kabutree-cache-v2";

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

  // 🔥 APIはキャッシュしない
  if (event.request.url.includes("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 通常はキャッシュ優先
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});