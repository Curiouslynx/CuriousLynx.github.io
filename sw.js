// увеличить OFFLINE_VERSION чтобы сбросить событие установки и ускорить обновление кэша из сети:
const OFFLINE_VERSION = 1;
const CACHE_NAME = 'offline';
const OFFLINE_URL = 'todo.html';


self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.add(new Request(OFFLINE_URL, {cache: 'reload'})); // Setting {cache: 'reload'} in the new request will ensure that the response isn't fulfilled from the HTTP cache; i.e., it will be from the network.
  })());
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
});


self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    if ('navigationPreload' in self.registration) { // Enable navigation preload if it's supported.See https://developers.google.com/web/updates/2017/02/navigation-preload
      await self.registration.navigationPreload.enable();
    }
  })());
  self.clients.claim(); // Tell the active service worker to take control of the page immediately.
});


self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') { // We only want to call event.respondWith() if this is a navigation request for an HTML page.
    event.respondWith((async () => {
      try {
        const preloadResponse = await event.preloadResponse; // First, try to use the navigation preload response if it's supported.
        if (preloadResponse) {
          return preloadResponse;
        }
        const networkResponse = await fetch(event.request); // Always try the network first.
        return networkResponse;
      } catch (error) { // catch в случае сетевой ошибки (когда http-ответ вне диапазона 4xx или 5xx):
        console.log('Fetch failed; returning offline page instead.', error);
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(OFFLINE_URL);
        return cachedResponse;
      }
    })());
  }
  // другие обработчики fetch выполнятся
});
