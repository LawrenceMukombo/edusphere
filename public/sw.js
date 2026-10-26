// public/sw.js — NWUCHAS CMIS Production Service Worker
// Governed by Phase 4 Offline-First Remediation Contract:
// 1. Caches strictly the versioned application shell and public static assets.
// 2. NEVER returns fake 200 success for failed mutations (POST/PUT/PATCH/DELETE).
// 3. Does NOT broadly cache authenticated /api/* endpoints or sensitive PII.

const CACHE_VERSION = 'v2.0.0';
const SHELL_CACHE = `nwuchas-shell-${CACHE_VERSION}`;
const STATIC_ASSETS_CACHE = `nwuchas-static-${CACHE_VERSION}`;

const SHELL_PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// 1. Install: Pre-cache versioned public application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => {
        console.log('[NWUCHAS SW] Pre-caching verified application shell');
        return cache.addAll(SHELL_PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[NWUCHAS SW] Shell pre-cache partial failure:', err);
      })
  );
});

// 2. Activate: Clean up obsolete or legacy school caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== SHELL_CACHE && key !== STATIC_ASSETS_CACHE) {
              console.log('[NWUCHAS SW] Evicting deprecated cache:', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Honest routing strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // A. Non-GET requests (mutations): NEVER fake success!
  // If the network fails, reject honestly so the offline IndexedDB queue can handle it.
  if (request.method !== 'GET') {
    return; // Pass through directly to network; fetch() fails naturally if offline
  }

  // B. Security: NEVER cache authenticated API routes or session endpoints
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'NETWORK_OFFLINE',
            message: 'Network connection unavailable. Request could not reach NWUCHAS server.',
          }),
          {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );
    return;
  }

  // C. Navigation Requests (Page Visits): Network-first with cache fallback, then offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match('/offline.html');
          if (fallback) return fallback;
          return new Response('Offline: Content unavailable', { status: 503, statusText: 'Offline' });
        })
    );
    return;
  }

  // D. Static Assets (Scripts, CSS, Icons, Fonts): Stale-While-Revalidate
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(STATIC_ASSETS_CACHE).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // E. Default: Network with Cache Fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// 4. Background Sync Listener: Delivers trigger to active client tabs
self.addEventListener('sync', (event) => {
  if (event.tag === 'nwuchas-offline-sync') {
    console.log('[NWUCHAS SW] Triggering honest offline background sync');
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'NWUCHAS_TRIGGER_OFFLINE_SYNC' });
        });
      })
    );
  }
});
