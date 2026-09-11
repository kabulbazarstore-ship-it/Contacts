/* =========================================================
   مخاطبین | Service Worker
   نسخه: 2
   ========================================================= */

const CACHE_NAME = 'contacts-app-v2';

const APP_FILES = [
    './',
    './index.html',
    './manifest.json',
    './icon.svg'
];

/* =========================
   نصب Service Worker
   ========================= */
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
            .then(() => self.skipWaiting())
    );
});


/* =========================
   فعال‌سازی
   ========================= */
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});


/* =========================
   درخواست‌های اینترنتی
   ========================= */
self.addEventListener('fetch', event => {

    // فقط درخواست‌های GET
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {

                // اگر در کش بود، همان را نمایش بده
                if (cachedResponse) {
                    return cachedResponse;
                }

                // اگر نبود، از اینترنت دریافت کن
                return fetch(event.request)
                    .then(networkResponse => {

                        // فقط پاسخ معتبر را ذخیره کن
                        if (
                            networkResponse &&
                            networkResponse.status === 200 &&
                            networkResponse.type === 'basic'
                        ) {
                            const responseClone = networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(
                                        event.request,
                                        responseClone
                                    );
                                });
                        }

                        return networkResponse;
                    })
                    .catch(() => {
                        // اگر اینترنت نبود و فایل در کش نبود
                        return caches.match('./index.html');
                    });
            })
    );
});