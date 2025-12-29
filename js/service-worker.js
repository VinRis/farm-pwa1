// Service Worker for PWA
const CACHE_NAME = 'agriflow-v1';
const urlsToCache = [
  '/farm-pwa1/',
  '/farm-pwa1/index.html',
  '/farm-pwa1/dairy.html',
  '/farm-pwa1/poultry.html',
  '/farm-pwa1/settings.html',
  '/farm-pwa1/master-report.html',
  '/farm-pwa1/css/style.css',
  '/farm-pwa1/css/dark-mode.css',
  '/farm-pwa1/js/app.js',
  '/farm-pwa1/js/charts.js',
  '/farm-pwa1/js/firebase.js',
  '/farm-pwa1/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(
          response => {
            // Check if valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          }
        ).catch(() => {
          // If fetch fails and the request is for a page, return the offline page
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/farm-pwa1/index.html');
          }
        });
      })
  );
});

// Activate event
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
