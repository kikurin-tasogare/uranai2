/* ============================================================
   sw.js — 占蔵のサービスワーカー
   ネットワーク優先+キャッシュ退避で、外出先・圏外でも
   一度開いたページが動くようにする。
   ============================================================ */

const CACHE = "senzo-v2";

const CORE = [
  "./",
  "index.html", "mandala.html",
  "sukuyo.html", "shichusuimei.html", "astrology.html", "maya.html",
  "ekikyo.html", "shibi.html", "jyotish.html", "kaigetsu.html",
  "css/style.css",
  "js/core.js", "js/almanac.js", "js/vendor/astronomy.browser.min.js",
  "js/sukuyo.js", "js/shichu.js", "js/astrology.js", "js/maya.js",
  "js/ekikyo.js", "js/shibi.js", "js/jyotish.js", "js/mandala.js", "js/kaigetsu.js",
  "icons/icon-192.png", "icons/icon-512.png",
  "manifest.webmanifest",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // 外部(フォント等)は素通し

  e.respondWith((async () => {
    try {
      // ネットワーク優先(常に最新)、成功したらキャッシュを更新
      const res = await fetch(e.request);
      if (res.ok) {
        const c = await caches.open(CACHE);
        c.put(e.request, res.clone());
      }
      return res;
    } catch (err) {
      // 圏外・機内モード → キャッシュから(?v= の違いは無視して照合)
      const hit = await caches.match(e.request, { ignoreSearch: true });
      if (hit) return hit;
      if (e.request.mode === "navigate") {
        const top = await caches.match("index.html");
        if (top) return top;
      }
      throw err;
    }
  })());
});
