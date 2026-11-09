/* Service worker : fonctionnement hors ligne.
   À CHAQUE MISE EN LIGNE : incrémenter VERSION, et lister tout nouveau fichier dans SHELL. */
const VERSION = 'fouquet-terrain-v13';
const SHELL = ['./', 'index.html', 'manifest.webmanifest',
  'assets/logo.jpg', 'assets/icon-192.png', 'assets/icon-512.png',
  'sol/', 'sol/index.html', 'sol/app.js', 'sol/style.css',
  'eaux-sed/', 'eaux-sed/index.html', 'eaux-sed/app.js', 'eaux-sed/style.css',
  'visite/', 'visite/index.html', 'visite/app.js', 'visite/style.css',
  'eaux-sout/', 'eaux-sout/index.html', 'eaux-sout/app.js', 'eaux-sout/style.css',
  'gaz-sol/', 'gaz-sol/index.html', 'gaz-sol/app.js', 'gaz-sol/style.css',
  'air-ambiant/', 'air-ambiant/index.html', 'air-ambiant/app.js', 'air-ambiant/style.css',
  'analyse-risques/', 'analyse-risques/index.html', 'analyse-risques/app.js', 'analyse-risques/catalogue-ssp.js', 'analyse-risques/style.css',
  'shared/transfer.js'];

self.addEventListener('install', e => e.waitUntil(
  caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));

self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim())));

/* Réseau d'abord pour les fichiers de l'application (3 s maximum, revalidation forcée), cache en secours : les mises en ligne
   apparaissent dès le chargement suivant quand l'appareil est connecté, et l'application reste utilisable hors ligne.
   Ressources externes (lecteur de codes, versionné) : cache d'abord. */
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  const OK = [location.origin, 'https://fastly.jsdelivr.net', 'https://cdn.jsdelivr.net'];
  if (r.method !== 'GET' || !OK.includes(u.origin)) return;
  e.respondWith((async () => {
    const c = await caches.open(VERSION), hit = await c.match(r);
    if (u.origin !== location.origin) {
      if (hit) return hit;
      const res = await fetch(r); if (res.ok) c.put(r, res.clone()); return res;
    }
    const net = fetch(r, { cache: 'no-cache' }).then(res => { if (res.ok) c.put(r, res.clone()); return res; });
    if (!hit) return net;
    net.catch(() => {});
    try { return await Promise.race([net, new Promise((_, rej) => setTimeout(rej, 3000))]); }
    catch (err) { return hit; }
  })());
});
