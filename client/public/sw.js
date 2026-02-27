const CACHE_NAME = "elocab-cache-v3";
// Only cache static assets, NOT HTML or JS bundles
const urlsToCache = ["/logo.png", "/manifest.json"];

// Install service worker — skip waiting to activate immediately
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache:", CACHE_NAME);
      return cache.addAll(urlsToCache);
    }),
  );
  self.skipWaiting();
});

// Activate service worker — delete ALL old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch with NETWORK-FIRST strategy for HTML/JS/CSS, cache-first only for images
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and API/socket requests
  if (
    event.request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/socket.io/")
  ) {
    return;
  }

  // For navigation requests (HTML) and JS/CSS — always go network-first
  const isNavigationOrAsset =
    event.request.mode === "navigate" ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname === "/" ||
    url.pathname.endsWith(".html");

  if (isNavigationOrAsset) {
    // Network-first: try network, fall back to cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the fresh response for offline fallback
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache as fallback
          return caches.match(event.request);
        }),
    );
    return;
  }

  // For static assets (images, fonts) — cache-first
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    }),
  );
});

// Push notification handler
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "ELOCAB Notification";
  const options = {
    body: data.body || "You have a new notification",
    icon: "/logo.png",
    badge: "/logo.png",
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
});
