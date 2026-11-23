const CACHE='eatsmap-v11';
const SHELL=['./','./index.html','./manifest.json','./leaflet.js','./leaflet.css','./icon-192.png','./icon-512.png','./starter.json','./offers.json','./ratings.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.hostname.includes('nominatim'))return;
  if(u.origin===location.origin){ // app files: network first so updates arrive, cache when offline
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)));
  }else if(u.hostname==='tile.openstreetmap.org'){ // map tiles: show cached ones when offline
    e.respondWith(caches.open(CACHE+'-tiles').then(async c=>{try{const r=await fetch(e.request);c.put(e.request,r.clone());return r}catch(err){return (await c.match(e.request))||Response.error()}}));
  }
});
