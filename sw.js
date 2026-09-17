// 앱 화면 파일과 글꼴을 캐시해서 오프라인에서도 열리게 함. 시세 API는 캐시하지 않음.
const CACHE = 'asset-diary-mongle-v1.0.1';
// 같은 GitHub 계정(같은 주소)에 올린 다른 버전 앱의 캐시를 지우지 않도록, 이 앱 이름으로 시작하는 옛 캐시만 정리
const CACHE_PREFIX = 'asset-diary-mongle-';
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'manifest.webmanifest',
  'icon-192.png', 'icon-512.png', 'apple-touch-icon.png',
  'img/cash_down.png', 'img/cash_up.png', 'img/diary_down.png', 'img/diary_up.png', 'img/domestic_down.png', 'img/domestic_up.png', 'img/mascot_app_icon.png', 'img/mascot_hi.png', 'img/mascot_main.png', 'img/mood_happy.png', 'img/mood_jackpot.png', 'img/mood_neutral.png', 'img/mood_sad.png', 'img/mood_worried.png', 'img/overseas_down.png', 'img/overseas_up.png', 'img/piggy_happy.png', 'img/piggy_jackpot.png', 'img/piggy_neutral.png', 'img/piggy_sad.png', 'img/piggy_worried.png', 'img/pouch_down.png', 'img/pouch_up.png', 'img/realestate_down.png', 'img/realestate_up.png', 'img/total_happy.png', 'img/total_jackpot.png', 'img/total_sad.png', 'img/total_worried.png', 'img/treasure_down.png', 'img/treasure_up.png'];
// 글꼴 + 글자인식(Tesseract) 파일은 한 번 받으면 캐시
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (FONT_HOSTS.includes(url.hostname)) {
    // 글꼴: 캐시 우선
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res;
    })));
    return;
  }
  if (url.origin !== location.origin) return; // 시세 API 등은 그대로 네트워크
  // 앱 파일: 네트워크 우선(업데이트 즉시 반영) → 실패 시 캐시
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
