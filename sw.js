/* Service worker : fonctionnement hors ligne.
   À CHAQUE MISE EN LIGNE : incrémenter VERSION, et lister tout nouveau fichier dans SHELL. */
const VERSION = 'fouquet-terrain-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest',
  'assets/logo.jpg', 'assets/icon-192.png', 'assets/icon-512.png',
  'sol/', 'sol/index.html', 'sol/app.js', 'sol/style.css'];

self.addEventListener('install', e => e.waitUntil(
  caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));

self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim())));

/* Cache d'abord, mise à jour en arrière-plan : la nouvelle version apparaît au chargement suivant. */
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.match(r).then(hit => {
    const net = fetch(r).then(res => { if (res.ok) caches.open(VERSION).then(c => c.put(r, res.clone())); return res; }).catch(() => hit);
    return hit || net;
  }));
});
