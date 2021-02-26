self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open('ver1').then((cache) => cache.addAll([ //'./','./index.js',
      './todo.html'
    ])),
  );
});


self.addEventListener('fetch', (evt) => {
  console.log(evt.request.url);
  evt.respondWith(
    caches.match(evt.request).then((response) => response || fetch(evt.request)),
  );
});
