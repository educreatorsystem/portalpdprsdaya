const PREFIX='pdpr-sktd-'+new URL(self.registration.scope).pathname+'-';
const CACHE=PREFIX+'v3';
const FILES=['./','./index.html','./assets/theme.css','./assets/tailwind.js','./assets/papaparse.min.js','./assets/fontawesome.css','./assets/fa-solid-900.woff2','./pwa.js','./manage-tasks.js','./manifest.webmanifest','./assets/icons/icon-192.png','./assets/icons/icon-512.png','./assets/icons/maskable-512.png','./assets/icons/apple-touch-icon.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{const u=new URL(event.request.url);if(event.request.method!=='GET'||u.origin!==location.origin||!u.href.startsWith(self.registration.scope))return;
if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.match(new URL('./index.html',self.registration.scope).href)));return;}
if(FILES.some(f=>new URL(f,self.registration.scope).href===u.href))event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
