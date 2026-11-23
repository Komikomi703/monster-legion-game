'use strict'

// Release preparation replaces these two literals with the exact distribution inventory.
const prefix = 'monster-legion:' + self.registration.scope + ':'
const version = prefix + '297d2bb6d952cf46'
const root = new URL(self.registration.scope)
const index = new URL('index.html', root).href
const paths = new Set(["art/book.png","art/clock.png","art/coin.png","art/crown.png","art/fire.png","art/flag.png","art/gem.png","art/group.png","art/help.png","art/legion-forest.webp","art/lock.png","art/map.png","art/muted.png","art/settings.png","art/speaker.png","art/stage-1.webp","art/stage-2.webp","art/stage-3.webp","art/star.png","art/sword.png","art/swords.png","art/title.png","art/trophy.png","assets/battle-DKvmeRNP.js","assets/battle-Ddqv364U.css","assets/index-CpNoQnzw.css","assets/index-w9pr_k17.js","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","icons/maskable.png","index.html","licenses/credits.txt","licenses/eventemitter3.txt","licenses/monster-legion.txt","licenses/phaser.txt","manifest.webmanifest","privacy.txt","screenshots/camp-desktop.webp","screenshots/camp-mobile.webp"].map((path) => new URL(path, root).href))

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(version)
      await cache.addAll(Array.from(paths, (url) => new Request(url, { cache: 'reload' })))
    })(),
  )
})
self.addEventListener('message', (event) => {
  if (event.data === 'ACTIVATE_UPDATE') event.waitUntil(self.skipWaiting())
})
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const older = (await caches.keys()).filter((key) => key.startsWith(prefix) && key !== version)
      // A second tab can still need its previous release's lazy-loaded battle bundle.
      await Promise.all(older.slice(0, -1).map((key) => caches.delete(key)))
      await self.clients.claim()
    })(),
  )
})
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (
    event.request.method !== 'GET' ||
    url.origin !== root.origin ||
    !url.pathname.startsWith(root.pathname)
  )
    return
  if (
    event.request.mode === 'navigate' &&
    (url.pathname === root.pathname || url.origin + url.pathname === index)
  ) {
    event.respondWith(
      caches.open(version).then(async (cache) => (await cache.match(index)) || fetch(event.request)),
    )
    return
  }
  if (paths.has(url.href)) {
    event.respondWith(
      caches.open(version).then(async (cache) => (await cache.match(url.href)) || fetch(event.request)),
    )
    return
  }
  if (url.pathname.startsWith(root.pathname + 'assets/')) {
    event.respondWith(
      (async () => {
        for (const key of await caches.keys()) {
          if (key === version || !key.startsWith(prefix)) continue
          const cached = await (await caches.open(key)).match(url.href)
          if (cached) return cached
        }
        return fetch(event.request)
      })(),
    )
  }
})
