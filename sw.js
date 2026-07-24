const CACHE='key-collective-canonical-6b16-v34';
const APP_SHELL=['./','./index.html','./tokens.css?v=16.16','./app.css?v=16.16','./app.js?v=16.16','./config.js','./router.js','./store.js','./weather.js','./controllers.js','./pages.js','./news.js','./sprint3.js','./sprint4.js','./sprint5.js','./sprint6a.js','./sprint6b.js','./sprint6b1.js','./sprint6b1final.js','./sprint6b2.js','./sprint6b3.js','./sprint6b4.js','./sprint6b5.js','./sprint6b6.js','./sprint6b7.js','./sprint6b8.js','./sprint6b9.js','./sprint6b10.js','./sprint6b11.js','./sprint6b12.js','./sprint6b13.js','./sprint6b13r2.js','./sprint6b14.js','./sprint6b15.js','./sprint6b16.js','./memo-db.js','./photo-db.js','./logo.png','./profile.jpg','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request,{cache:'no-store'}).then(response=>{
      if(response.ok)caches.open(CACHE).then(cache=>cache.put('./index.html',response.clone()));
      return response;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(request).then(cached=>{
    const refresh=fetch(request,{cache:'no-store'}).then(response=>{
      if(response.ok)caches.open(CACHE).then(cache=>cache.put(request,response.clone()));
      return response;
    }).catch(()=>cached);
    return cached||refresh;
  }));
});
