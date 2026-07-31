const CACHE='key-collective-6c3-theme-hotfix-16.55.13';
const APP_SHELL=['./','./index.html','./tokens.css?v=16.21','./app.css?v=16.49.0','./app.js?v=16.49.0','./config.js','./router.js','./store.js','./weather.js','./controllers.js','./pages.js','./news.js','./sprint3.js','./sprint4.js','./sprint5.js','./sprint6a.js','./sprint6b.js','./sprint6b1.js','./sprint6b1final.js','./sprint6b2.js','./sprint6b3.js','./sprint6b4.js','./sprint6b5.js','./sprint6b6.js','./sprint6b7.js','./sprint6b8.js?v=16.43.7','./sprint6b9.js','./sprint6b10.js','./sprint6b11.js','./sprint6b12.js','./sprint6b13.js','./sprint6b13r2.js','./sprint6b14.js','./sprint6b15.js','./sprint6b16.js','./sprint6b17.js','./sprint6b18.js?v=16.43.7','./sprint6b19.js','./sprint6b22.js?v=16.43.7','./sprint6b23.js','./sprint6b24.js','./sprint6b25.js','./sprint6b26.js?v=16.43.7','./sprint6b43.js?v=16.44.7','./sprint6b44.js?v=16.44.9','./sprint6b45.js?v=16.45.1','./sprint6b46.js?v=16.46.1','./sprint6b47.js?v=16.48.2','./sprint6b48.js?v=16.48.2','./sprint6b49.js?v=16.49.0','./google-calendar.js','./memo-db.js','./photo-db.js','./logo.png','./profile.jpg','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
APP_SHELL.push('./app.css?v=16.53.4','./app.js?v=16.53.4','./sprint6c1.js?v=16.52.4','./sprint6c3.js?v=16.53.4','./assets/companion/kiki.png','./assets/companion/lulu.png','./assets/companion/kiki-busybody.png','./assets/companion/kiki-dance.png','./assets/companion/lulu-mommy.png','./assets/companion/lulu-flowers.png');
APP_SHELL.push('./app.css?v=16.54.5','./app.js?v=16.54.5','./manifest.webmanifest?v=16.54.5','./assets/key-collective-crest.svg','./favicon-48.png','./icon-maskable-512.png');
APP_SHELL.push('./app.css?v=16.55.13','./app.js?v=16.55.13','./sprint5.js?v=16.55.13','./assets/theme-amethyst-cheetah.png','./assets/theme-espresso-houndstooth.png','./assets/theme-onyx-bandana.png','./assets/theme-rose-polka.png');
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  const fallback=()=>caches.match(request).then(r=>r||caches.match('./index.html'));
  event.respondWith(fetch(request,{cache:'no-store'}).then(response=>{
    if(response.ok)caches.open(CACHE).then(cache=>cache.put(request,response.clone()));
    return response;
  }).catch(fallback));
});
