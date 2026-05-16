const CACHE_NAME = 'weather-app-v7';
const STATIC_ASSETS = [
    './',
    './dashboard.html',
    './assets/css/styles.css',
    './assets/js/main.js',
    './assets/js/i18n.js',
    './assets/js/login.js',
    './assets/css/login.css',
    './login.html'
];

const EXTERNAL_ASSETS = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Install Event: Pre-cache static and external assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Pre-caching static assets v7');
            return cache.addAll([...STATIC_ASSETS, ...EXTERNAL_ASSETS]);
        })
    );
    self.skipWaiting();
});

// Activate Event: Clean up old caches AGGRESSIVELY
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    // Borrar TODO lo que no sea el caché actual v4
                    if (cache !== CACHE_NAME) {
                        console.log('[SW] Purging old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            // Reclamar clientes inmediatamente para aplicar cambios sin recarga manual
            return self.clients.claim();
        })
    );
});

// Fetch Event: Handle different strategies
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 1. API Proxiadas (/api/): Network First, fallback to cache
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Solo cachear si la respuesta es exitosa
                    if (response.ok) {
                        const clonedResponse = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, clonedResponse);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
        return;
    }

    // 2. Static Assets: Stale-While-Revalidate
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // Clonar inmediatamente antes de que el cuerpo sea consumido
                const clonedResponse = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, clonedResponse);
                });
                return networkResponse;
            });
            return cachedResponse || fetchPromise;
        })
    );
});
