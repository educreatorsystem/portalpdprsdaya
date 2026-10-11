const CACHE = 'pdpr-sktd-shell-v1';
const PREFIX = 'pdpr-sktd-shell-';
const ROOT = new URL('./',self.location.href);
const FILES = ['./','./index.html','./vendor/tailwind.js','./pwa.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png','./icons/apple-touch-icon.png'];
const allowed = new Set(FILES.map(path=>new URL(path,ROOT).href));
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys()){if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);}await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 // Never intercept POST, Google Sheet, Apps Script, images of submissions, or external data.
 if(event.request.method!=='GET'||!allowed.has(event.request.url))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);return (await cache.match(event.request))||fetch(event.request);})());
});
