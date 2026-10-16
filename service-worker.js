// Service Worker de Mi Recetario
// - Guarda en caché los archivos propios de la app para poder abrirla sin conexión.
// - NO toca Firebase ni TheMealDB: esas peticiones (otros dominios) pasan directo a la red.
const CACHE = "recetario-v1";
const ARCHIVOS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./js/db.js",
  "./js/api.js",
  "./js/firebase-config.js",
  "./js/pwa.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Instalación: guarda los archivos (si uno falta, no se cae todo).
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.allSettled(ARCHIVOS.map(a => c.add(a))))
  );
  self.skipWaiting();
});

// Activación: borra cachés de versiones anteriores.
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Peticiones: red primero (siempre la versión más nueva) y caché si no hay conexión.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;                              // no interceptar escrituras
  if (new URL(req.url).origin !== self.location.origin) return;  // Firebase, TheMealDB y gstatic van directo

  e.respondWith(
    fetch(req)
      .then(resp => {
        const copia = resp.clone();
        caches.open(CACHE).then(c => c.put(req, copia));
        return resp;
      })
      .catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
  );
});
