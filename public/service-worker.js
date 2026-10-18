// Service Worker — RSandoli Training PWA
// App shell precache + network-first navigation + stale-while-revalidate assets.
// Atualização controlada: não faz skipWaiting automático; aguarda mensagem do app.
// Não faz cache de requisições cross-origin (API/Base44/auth) nem de métodos não-GET.

const SHELL_CACHE = "rsandoli_shell_v2";
const RUNTIME_CACHE = "rsandoli_runtime_v2";
const PRECACHE = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((c) => c.addAll(PRECACHE)));
  // Não chama skipWaiting() — atualização controlada pelo app (mensagem SKIP_WAITING)
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((names) =>
        Promise.all(
          names.map((n) => {
            if (n !== SHELL_CACHE && n !== RUNTIME_CACHE) return caches.delete(n);
          })
        )
      ),
      self.clients.claim(),
    ])
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // Ignora cross-origin (APIs externas, SDK Base44, auth, arquivos privados)
  if (url.origin !== self.location.origin) return;

  // Navegação: network-first, fallback offline para o shell
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request).then((r) => r || caches.match("/index.html"))
        )
    );
    return;
  }

  // Assets estáticos: stale-while-revalidate
  const dest = request.destination;
  if (dest === "script" || dest === "style" || dest === "font" || dest === "image" || dest === "worker") {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response && response.status === 200 && response.type === "basic") {
              const clone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }
});
