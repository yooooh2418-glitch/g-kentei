// G検定300 PWA Service Worker
// キャッシュ名のバージョンを上げると、次回アクセス時に古いキャッシュを破棄して更新します。
const CACHE = 'gkentei300-v2';

// オフラインで動かすために最初に取り込むファイル一式
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

// インストール：アセットを先読みキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  // 新しいSWをすぐ有効化
  self.skipWaiting();
});

// 有効化：古いバージョンのキャッシュを掃除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 取得：キャッシュ優先。なければネットワークから取りつつキャッシュに追加。
// 完全オフラインでも動くアプリなので cache-first が最適。
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // 同一オリジンの正常レスポンスだけキャッシュに残す
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          // ナビゲーション要求でオフライン時は index を返す
          if (req.mode === 'navigate') return caches.match('./index.html');
        });
    })
  );
});
