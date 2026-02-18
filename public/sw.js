// Service Worker for S.A.L.U.T.E. Reporter
// Provides offline functionality by caching all assets
// __BUILD_HASH__ is replaced at build time by the Vite plugin

const CACHE_NAME = 'salute-__BUILD_HASH__'

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
]

// Install - cache core assets, activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  )
})

// Activate - delete old caches, claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  )
})

// Fetch - stale-while-revalidate: serve cached instantly, update in background
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith(self.location.origin)) return

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request)
          .then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
              cache.put(event.request, response.clone())
            }
            return response
          })
          .catch(() => {
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return cache.match('/')
            }
          })

        return cached || networkFetch
      })
    )
  )
})
