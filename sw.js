const CACHE_NAME = 'gwt-pro-v3'; // Versión actualizada
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. INSTALACIÓN: Cacheamos inmediatamente lo local vital (la carcasa)
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting(); // Forzar activación inmediata
});

// 2. ACTIVACIÓN: Limpieza de versiones antiguas para ahorrar espacio
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
  return self.clients.claim(); // Tomar control de la página inmediatamente
});

// 3. INTERCEPTOR (FETCH): El corazón del modo Offline
self.addEventListener('fetch', (e) => {
  // Solo interceptamos peticiones web (http/https), ignoramos chrome-extension:// etc.
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // A) ¿Lo tenemos guardado? ¡Úsalo! (Velocidad instantánea y Offline)
      if (cachedResponse) {
        return cachedResponse;
      }

      // B) ¿No está guardado? Vamos a Internet a buscarlo
      return fetch(e.request).then((networkResponse) => {
        // Verificamos que la respuesta de internet sea válida
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
          return networkResponse;
        }

        // C) ¡TRUCO! Clonamos lo que bajamos de internet y lo guardamos para siempre
        // Esto guarda automáticamente React, Tailwind, Fuentes, etc.
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // D) Si no hay internet Y no estaba en caché
        // Para una Single Page App, normalmente el index.html ya cargó en el paso A.
        // Si fallara una imagen específica, aquí podríamos poner una imagen de error.
      });
    })
  );
