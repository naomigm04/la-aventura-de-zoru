const CACHE_NAME = 'zoru-adventure-v2'; // Incrementa la versión
const urlsToCache = [
  '/',
  '/index.html',
  '/historia.html',
  '/personajes.html',
  '/mecanica.html',
  '/css/styles.css',
  '/js/app.js',
  '/manifest.json',
  '/img/zoruaventurero.jpeg',
  '/img/bosque.png',
  '/img/cueva.png',
  '/img/aguila.jpeg',
  '/img/cp.jpeg',
  '/img/finalboss.jpeg',
  '/img/finaldenivel.jpeg',
  '/img/gema.jpeg',
  '/img/hermana.png',
  '/img/picos.jpeg',
  '/img/sapo.jpeg',
  '/img/vida.jpeg',
  '/img/villano.png',
  '/img/zariguella.jpeg',
  '/img/zoru.jpeg',
  '/img/zoru.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache).catch(error => {
          console.error('Error al cachear recursos:', error);
        });
      })
  );
});

self.addEventListener('fetch', event => {
  // Excluye peticiones a APIs externas si las tienes
  if (event.request.url.startsWith('http') && !event.request.url.includes(location.hostname)) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve la respuesta en caché o haz la petición
        return response || fetch(event.request).then(fetchResponse => {
          // Opcional: cachear nuevas respuestas
          if (event.request.method === 'GET') {
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return fetchResponse;
        });
      }).catch(() => {
        // Fallback para cuando no hay conexión y no está en caché
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/offline.html'); // Crea esta página
        }
        return new Response('Modo offline - Recurso no disponible', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});