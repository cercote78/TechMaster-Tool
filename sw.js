
const CACHE_NAME = 'techmaster-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Installazione: Caching immediato
self.addEventListener('install', (e) => {
  // Forza l'attivazione immediata del nuovo SW
  self.skipWaiting();
  
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS);
      })
      .catch((err) => {
        console.log('Cache install warning:', err);
      })
  );
});

// Attivazione: Prendi il controllo subito
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// Fetch: Strategia Network First con fallback Cache
self.addEventListener('fetch', (e) => {
  // Ignora richieste non http (es. chrome-extension)
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Se la rete risponde, clona e aggiorna la cache
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return response;
      })
      .catch(() => {
        // Se offline, usa la cache
        return caches.match(e.request);
      })
  );
});
