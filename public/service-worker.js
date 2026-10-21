// Service Worker — RSandoli Training (PWA)
//
// Objetivos:
//  - manter o app shell disponível sem conexão (estrutura, não dados do servidor);
//  - nunca armazenar credenciais, tokens ou respostas autenticadas;
//  - entregar versões novas sem prender o usuário a um cache antigo;
//  - deixar o usuário decidir quando aplicar a atualização.

const VERSION = "v3";
const SHELL_CACHE = `rsandoli-shell-${VERSION}`;
const ASSET_CACHE = `rsandoli-assets-${VERSION}`;
const KNOWN_CACHES = [SHELL_CACHE, ASSET_CACHE];
// Caches privados gerenciados pelo aplicativo (limpos no logout/remoção de dados).
const APP_MANAGED_CACHES = ["rsandoli-offline-content"];
const PRECACHE = ["/", "/index.html", "/manifest.json"];

// ---------- Install ----------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // Best-effort: uma falha de rede não deve impedir a instalação do SW.
      Promise.all(
        PRECACHE.map((url) =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => null)
        )
      )
    )
  );
  // Sem skipWaiting automático: a atualização é aplicada quando o app sinalizar.
});

// ---------- Activate ----------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.map((name) => {
          if (KNOWN_CACHES.includes(name)) return null;
          // Caches privados do app não são removidos aqui: a limpeza acontece
          // no logout ou em "Sair e remover dados deste dispositivo".
          if (APP_MANAGED_CACHES.some((p) => name.startsWith(p))) return null;
          return caches.delete(name);
        })
      );
      await self.clients.claim();
    })()
  );
});

// ---------- Mensagens do aplicativo ----------
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }
  if (data.type === "GET_VERSION" && event.ports && event.ports[0]) {
    event.ports[0].postMessage({ version: VERSION });
  }
});

// ---------- Fetch ----------
function isCacheableAsset(request, url) {
  if (request.method !== "GET") return false;
  if (!url.pathname.startsWith("/assets/") && !url.pathname.startsWith("/icons/")) return false;
  if (url.search) return false;
  return true;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Somente leitura, apenas same-origin e nunca requisições autenticadas.
  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;
  if (request.headers.has("authorization")) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/functions/")) return;

  // Navegação: rede primeiro (conteúdo sempre fresco), cache como reserva offline.
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          if (fresh && fresh.ok) {
            const cache = await caches.open(SHELL_CACHE);
            cache.put("/index.html", fresh.clone()).catch(() => {});
          }
          return fresh;
        } catch {
          const cache = await caches.open(SHELL_CACHE);
          return (
            (await cache.match(request)) ||
            (await cache.match("/index.html")) ||
            (await cache.match("/")) ||
            new Response("Sem conexão.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } })
          );
        }
      })()
    );
    return;
  }

  // Assets com hash: cache primeiro com revalidação em segundo plano.
  if (isCacheableAsset(request, url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSET_CACHE);
        const cached = await cache.match(request);
        if (cached) {
          event.waitUntil(
            fetch(request)
              .then((res) => { if (res && res.ok) cache.put(request, res.clone()); })
              .catch(() => {})
          );
          return cached;
        }
        try {
          const res = await fetch(request);
          if (res && res.ok && res.type === "basic") cache.put(request, res.clone()).catch(() => {});
          return res;
        } catch {
          return new Response("", { status: 504 });
        }
      })()
    );
  }
});
