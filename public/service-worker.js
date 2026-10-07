// Service Worker — Rsandoli_Training PWA
// Cache básico com estratégia network-first para navegação e cache-first para assets estáticos.

const CACHE_NAME = "Rsandoli_Training_v1";
const PRECACHE_URLS = ["/", "/index.html", "/manifest.json"];

// ---------- Install: pré-cacheia o app shell básico ----------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ---------- Activate: limpa caches antigos ----------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      )
    )
  );
  self.clients.claim();
});

// ---------- Fetch: estratégia por tipo de requisição ----------
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Apenas GET; ignora outras operações (mutações de API, etc.)
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Ignora requisições cross-origin (APIs externas, SDK Base44, etc.)
  if (url.origin !== self.location.origin) return;

  // Network-first para navegação (HTML) — garante atualizações frescas, fallback offline
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request).then((r) => r || caches.match("/index.html"))
        )
    );
    return;
  }

  // Cache-first para assets estáticos (JS, CSS, fontes, imagens)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
