const CACHE_NAME = 'sinal-escolar-v3'; // Mudei a versão para forçar atualização
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  // Lista de todos os sons
  './sons/a1.mp3',
  './sons/a2.mp3',
  './sons/a3.mp3',
  './sons/a4.mp3',
  './sons/a5.mp3',
  './sons/a6.mp3',
  './sons/a7.mp3',
  './sons/a8.mp3',
  './sons/a9.mp3',
  './sons/fim.mp3'
];

// O resto do código continua igual...
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((response) => response || fetch(e.request)));
});
