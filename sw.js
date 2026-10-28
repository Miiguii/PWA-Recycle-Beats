const CACHE_NAME = 'recycle-beats-v6.0.0';

// Lista de archivos esenciales para que el sitio funcione sin internet
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './site.js',
  './manifest.json',
  './icon.svg',
  './image2.png',
  // Páginas legales
  './Advertencias/creditos.html',
  './Advertencias/licencias.html',
  './Advertencias/privacidad.html',
  './Advertencias/advertencias.html',
  './Advertencias/descargo.html',
  './Advertencias/uso-ia.html',
  // Imágenes y video principales
  './assets/video/Video_1.mp4',
  './assets/images/screenshots/Image_1.png',
  './assets/images/screenshots/Image_2.png',
  './assets/images/screenshots/Image_3.png',
  './assets/images/screenshots/Image_4.png',
  './assets/images/screenshots/Image_5.jpeg',
  './assets/images/team/IngaMigui.jpeg',
  './assets/images/team/IngaAme.jpg.jpeg',
  './assets/images/team/IngaYare.jpg.jpeg'
];

// 1. Instalar y guardar en caché
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Fuerza la activación del nuevo SW
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Error al cachear algunos archivos (puede que falten):', err);
      });
    })
  );
});

// 2. Activar y limpiar cachés viejas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Interceptar peticiones (Estrategia: Cache First, luego Red)
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones de extensiones de navegador o métodos que no sean GET
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Devuelve el archivo de la caché
      }
      
      // Si no está en caché, lo pide a internet
      return fetch(event.request).then((response) => {
        // Si la respuesta es válida, la guardamos en caché para la próxima
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});