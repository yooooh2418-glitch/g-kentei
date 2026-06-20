const C='msg-tracker-v1';
const ASSETS=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(ASSETS)).catch(()=>{}));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim());});
self.addEventListener('fetch',e=>{
  e.respondWith(caches.open(C).then(cache=>cache.match(e.request).then(hit=>{
    const net=fetch(e.request).then(res=>{try{if(e.request.method==='GET'&&res&&res.status===200)cache.put(e.request,res.clone());}catch(_){}return res;}).catch(()=>hit);
    return hit||net;
  })));
});
