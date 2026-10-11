// Increment VERSION when publishing changed app files.
const VERSION='v1.0.0';
const PREFIX='pdpr-sktd-'+self.registration.scope;
const CACHE=PREFIX+VERSION;
const FILES=['./','./index.html','./styles.css','./app.js','./config.js','./manifest.webmanifest','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||!u.href.startsWith(self.registration.scope))return;
// Cache app files only: no CSV, API responses, passwords or student images.
if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match(new URL('./index.html',self.registration.scope).href)));return;}
if(FILES.some(f=>new URL(f,self.registration.scope).href===u.href))e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request)));
});
