const CACHE_NAME = "myschedule-v1";
const BASE_URL = self.registration.scope;

const urlsToCache = [
  `${BASE_URL}`,
  `${BASE_URL}index.html`,
  `${BASE_URL}offline.html`,
  `${BASE_URL}manifest.json`,
  `${BASE_URL}assets/style.css`,
  `${BASE_URL}icons/icon-192x192-A.png`,
  `${BASE_URL}icons/icon-512x512-B.png`
];

// INSTALL
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("Cache berhasil dibuat");
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error("Cache gagal:", err))
  );
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("Hapus cache lama:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", event => {
  const request = event.request;

  // hanya GET
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then(response => {
      // kalau ada di cache → pakai cache
      if (response) return response;

      // kalau tidak → fetch dari network
      return fetch(request)
        .then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // fallback offline
          return caches.match(`${BASE_URL}offline.html`);
        });
    })
  );
});