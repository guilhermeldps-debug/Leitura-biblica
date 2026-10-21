/* Service worker do Leitura Bíblica.
   Guarda os arquivos do app para uso offline. Não mexe no progresso:
   marcações, anotações e conexões ficam no localStorage do aparelho,
   que o service worker não lê nem apaga. */
const VERSION = "v15";
const APP_CACHE = "leitura-biblica-app-" + VERSION;
const FONT_CACHE = "leitura-biblica-fontes";
const APP_FILES = [
  "./",
  "index.html",
  "privacidade.html",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-192-maskable.png",
  "icons/icon-512-maskable.png",
  "icons/apple-touch-icon.png",
  "icons/favicon-48.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(APP_CACHE).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("leitura-biblica") && k !== APP_CACHE && k !== FONT_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Fontes do Google: guarda na primeira vez e usa a cópia depois (funciona offline).
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(caches.open(FONT_CACHE).then(async cache => {
      const hit = await cache.match(req);
      const net = fetch(req).then(res => { if (res.ok || res.type === "opaque") cache.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Páginas: tenta a rede (para receber atualizações) e cai no cache sem internet.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then(res => { if (res.ok) caches.open(APP_CACHE).then(c => c.put(req, res.clone())); return res; })
        .catch(async () => (await caches.match(req, { ignoreSearch: true })) || caches.match("index.html"))
    );
    return;
  }

  // Demais arquivos do app: responde do cache e atualiza em segundo plano.
  event.respondWith(caches.open(APP_CACHE).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
