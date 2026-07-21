// Service worker de Chef: runtime cache "network-first, cache fallback".
// Da datos frescos con conexión y funciona offline con lo último visto (plan, compra…).
const CACHE = "chef-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // no cachear: stream SSE del duelo ni endpoints de sesión
  if (url.pathname.startsWith("/api/auth")) return;
  if (url.pathname.startsWith("/api/duelo") && url.pathname.endsWith("/stream")) return;

  event.respondWith(
    (async () => {
      try {
        const res = await fetch(req);
        if (res && res.ok) {
          const cache = await caches.open(CACHE);
          cache.put(req, res.clone());
        }
        return res;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === "navigate") {
          const shell = await caches.match("/semana");
          if (shell) return shell;
        }
        return Response.error();
      }
    })(),
  );
});
