import {store} from './store.js';import {createRouter} from './router.js';import {pages} from './pages.js';import * as ctl from './controllers.js';import {enhance} from './sprint3.js';import {patchPages,enhanceSprint4} from './sprint4.js';import {patchPagesSprint5,enhanceSprint5} from './sprint5.js';import {patchPagesSprint6A,enhanceSprint6A} from './sprint6a.js';import {patchPagesSprint6B,enhanceSprint6B} from './sprint6b.js';import {enhanceSprint6B1} from './sprint6b1.js';import {enhanceSprint6B1Final} from './sprint6b1final.js';import {patchPagesSprint6B2,enhanceSprint6B2} from './sprint6b2.js';
patchPages(pages);patchPagesSprint5(pages);patchPagesSprint6A(pages);patchPagesSprint6B(pages);patchPagesSprint6B2(pages);
const applyDesign=()=>{const x=store.get();document.documentElement.dataset.theme=x.theme||'champagne';document.documentElement.dataset.cards=x.design?.cards||'glass';document.documentElement.dataset.radius=x.design?.radius||'soft';document.documentElement.dataset.texture=x.design?.texture||'clean';document.documentElement.dataset.type=x.design?.pack||x.design?.type||'classic';document.documentElement.dataset.motion=x.design?.motion||'standard'};applyDesign();
const routes=[['dashboard','⌂','Executive Dashboard'],['intelligence','✧','Morning Brief'],['calendar','▦','Agenda'],['lani','♡','Lani’s Corner'],['career','◇','Payments Academy'],['business','◈','Executive Intelligence'],['money','$','Financial Studio'],['wellness','✦','Wellness Studio'],['sanctuary','⌂','Sanctuary'],['journal','❧','Reflection Garden'],['goals','◎','25 Hard'],['progress','↗','Growth Studio'],['premium','♛','Design + Data'],['profile','◉','My Profile']].map(([id,icon,label])=>({id,icon,label,render:pages[id]}));
const enhanced=['goals','wellness','money'];const router=createRouter({routes,onRender:async id=>{enhanced.includes(id)?enhance(id,router):(!['business','career','journal','sanctuary','premium'].includes(id)&&ctl[id]?.(router));if(!['business','career','journal','sanctuary','premium'].includes(id))await enhanceSprint4(id,router);await enhanceSprint5(id,router);await enhanceSprint6A(id,router);await enhanceSprint6B(id,router);await enhanceSprint6B1(id,router);await enhanceSprint6B1Final(id,router);await enhanceSprint6B2(id,router)}});const shell=document.querySelector('#appShell');document.querySelector('#menuButton').onclick=()=>shell.classList.add('menu-open');document.querySelector('#menuScrim').onclick=()=>shell.classList.remove('menu-open');document.addEventListener('keydown',e=>{if(e.key==='Escape')shell.classList.remove('menu-open')});document.querySelector('#themeButton').onclick=()=>router.go('premium');document.querySelector('.avatar').onclick=()=>router.go('profile');document.querySelector('.avatar').setAttribute('role','button');document.querySelector('.avatar').setAttribute('tabindex','0');document.querySelector('.avatar').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();router.go('profile')}};window.addEventListener('kc:state',()=>{applyDesign();window.dispatchEvent(new CustomEvent('kc:ui-refresh',{detail:{route:router.current()}}))});router.go('dashboard',false);

const updateOnline=()=>document.body.classList.toggle('offline',!navigator.onLine);addEventListener('online',updateOnline);addEventListener('offline',updateOnline);updateOnline();if(!new URLSearchParams(location.search).has('e2e')&&'serviceWorker' in navigator){
  let reloading=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(reloading)return;
    reloading=true;
    location.reload();
  });
  navigator.serviceWorker.register('./sw.js').then(registration=>{
    const activateWaiting=()=>{
      if(registration.waiting)registration.waiting.postMessage({type:'SKIP_WAITING'});
    };
    activateWaiting();
    registration.addEventListener('updatefound',()=>{
      const worker=registration.installing;
      worker?.addEventListener('statechange',()=>{
        if(worker.state==='installed'&&navigator.serviceWorker.controller)activateWaiting();
      });
    });
    window.addEventListener('focus',()=>registration.update().catch(()=>{}));
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible')registration.update().catch(()=>{});
    });
  }).catch(()=>{});
}
