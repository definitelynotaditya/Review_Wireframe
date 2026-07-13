const STATIC_CACHE = "woobly-static";
const RUNTIME_CACHE = "woobly-runtime";

/**
 * Only cache files that almost never change
 * ❌ DO NOT cache index.html
 */
const PRECACHE_ASSETS = ["/wooblylogo.svg", "/manifest.json"];

// Install
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS))
	);
	self.skipWaiting();
});

// Activate
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter(
							(key) =>
								![STATIC_CACHE, RUNTIME_CACHE].includes(key)
						)
						.map((key) => caches.delete(key))
				)
			)
	);
	self.clients.claim();
});

// Fetch
self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = new URL(request.url);

	if (url.origin !== location.origin) return;

	// HTML / SPA navigation → NETWORK FIRST
	if (request.mode === "navigate") {
		event.respondWith(
			fetch(request)
				.then((res) => {
					const clone = res.clone();
					caches
						.open(RUNTIME_CACHE)
						.then((cache) => cache.put(request, clone));
					return res;
				})
				.catch(() => caches.match(request))
		);
		return;
	}

	// API → NETWORK FIRST
	if (url.pathname.startsWith("/api")) {
		event.respondWith(
			fetch(request)
				.then((res) => {
					if (res.ok) {
						const clone = res.clone();
						caches
							.open(RUNTIME_CACHE)
							.then((cache) => cache.put(request, clone));
					}
					return res;
				})
				.catch(() => caches.match(request))
		);
		return;
	}

	// Static assets → CACHE FIRST
	event.respondWith(
		caches.match(request).then((cached) => {
			if (cached) return cached;
			return fetch(request).then((res) => {
				if (res.ok) {
					const clone = res.clone();
					caches
						.open(STATIC_CACHE)
						.then((cache) => cache.put(request, clone));
				}
				return res;
			});
		})
	);
});

// Allow skipWaiting from client
self.addEventListener("message", (event) => {
	if (event.data?.type === "SKIP_WAITING") {
		self.skipWaiting();
	}
});
