const CACHE_NAME = "elocab-static-v4";
const STATIC = ["/index.html", "/images/logo.png", "/manifest.json"];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC)),
  );
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((k) => k.startsWith("elocab-") && k !== CACHE_NAME)
              .map((k) => caches.delete(k)),
          ),
        ),
      self.clients.claim(),
    ]),
  );
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/socket.io/")
  )
    return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, copy)),
          );
        }
        return response;
      })
      .catch(
        async () =>
          (await caches.match(event.request)) ||
          (event.request.mode === "navigate"
            ? await caches.match("/index.html")
            : Response.error()),
      ),
  );
});
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data?.json() || {};
  } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title || "ELOCAB update", {
      body: data.body || "Your journey has an update.",
      icon: "/images/logo.png",
      badge: "/images/logo.png",
      data: data.data || {},
    }),
  );
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const value = event.notification.data?.url;
  const url =
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
      ? value
      : "/";
  event.waitUntil(clients.openWindow(url));
});
