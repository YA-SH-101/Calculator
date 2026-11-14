// Calculator offline support: network first, falls back to the saved copy when offline.
const V = "calc-v1";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== V).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  // Only our own files are handled here. Currency rates and fonts always go to the network.
  if (e.request.method !== "GET" || u.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r && r.ok) { const copy = r.clone(); caches.open(V).then((c) => c.put(e.request, copy)); }
        return r;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});
