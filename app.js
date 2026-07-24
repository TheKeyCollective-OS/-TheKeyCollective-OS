import {store} from './store.js';
import {createRouter} from './router.js';
import {pages} from './pages.js';
import * as ctl from './controllers.js';
import {enhance} from './sprint3.js';
import {patchPages,enhanceSprint4} from './sprint4.js';
import {patchPagesSprint5,enhanceSprint5} from './sprint5.js';
import {patchPagesSprint6A,enhanceSprint6A} from './sprint6a.js';
import {patchPagesSprint6B,enhanceSprint6B} from './sprint6b.js';
import {enhanceSprint6B1} from './sprint6b1.js';
import {enhanceSprint6B1Final} from './sprint6b1final.js';
import {patchPagesSprint6B2,enhanceSprint6B2} from './sprint6b2.js';
import {enhanceSprint6B3} from './sprint6b3.js';
import {enhanceSprint6B4} from './sprint6b4.js';
import {patchPagesSprint6B5,enhanceSprint6B5} from './sprint6b5.js';
import {enhanceSprint6B6} from './sprint6b6.js';
import {enhanceSprint6B7} from './sprint6b7.js';
import {patchPagesSprint6B8,enhanceSprint6B8} from './sprint6b8.js';
import {patchPagesSprint6B9,enhanceSprint6B9} from './sprint6b9.js';
import {patchPagesSprint6B10,enhanceSprint6B10} from './sprint6b10.js';
import {patchPagesSprint6B11,enhanceSprint6B11} from './sprint6b11.js';
import {enhanceSprint6B12} from './sprint6b12.js';
import {patchPagesSprint6B13,enhanceSprint6B13} from './sprint6b13.js';
import {patchPagesSprint6B13 as patchPagesSprint6B13R2,enhanceSprint6B13 as enhanceSprint6B13R2} from './sprint6b13r2.js';
import {patchPagesSprint6B13 as patchPagesSprint6B14,enhanceSprint6B13 as enhanceSprint6B14} from './sprint6b14.js';
import {enhanceSprint6B15} from './sprint6b15.js';
import {enhanceSprint6B16} from './sprint6b16.js';

patchPages(pages);
patchPagesSprint5(pages);
patchPagesSprint6A(pages);
patchPagesSprint6B(pages);
patchPagesSprint6B2(pages);
patchPagesSprint6B5(pages);
patchPagesSprint6B8(pages);
patchPagesSprint6B9(pages);
patchPagesSprint6B10(pages);
patchPagesSprint6B11(pages);
patchPagesSprint6B13(pages);
patchPagesSprint6B13R2(pages);
patchPagesSprint6B14(pages);

const repairedRoutes=new Set(['dashboard','calendar','goals','intelligence','wellness','career','money']);

function applyDesign(){
  const state=store.get();
  document.documentElement.dataset.theme=state.theme||'champagne';
  document.documentElement.dataset.cards=state.design?.cards||'glass';
  document.documentElement.dataset.radius=state.design?.radius||'soft';
  document.documentElement.dataset.texture=state.design?.texture||'clean';
  document.documentElement.dataset.type=state.design?.pack||state.design?.type||'classic';
  document.documentElement.dataset.motion=state.design?.motion||'standard';
}
applyDesign();

const routes=[
  ['dashboard','⌂','Executive Dashboard'],
  ['intelligence','✧','Morning Brief'],
  ['calendar','▦','Agenda'],
  ['lani','♡','Lani’s Corner'],
  ['career','◇','Payments Academy'],
  ['business','◈','Executive Intelligence'],
  ['money','$','Financial Studio'],
  ['wellness','✦','Wellness Studio'],
  ['sanctuary','⌂','Sanctuary'],
  ['journal','❧','Reflection Garden'],
  ['goals','◎','25 Hard'],
  ['progress','↗','Growth Studio'],
  ['premium','♛','Design + Data'],
  ['profile','◉','My Profile']
].map(([id,icon,label])=>({id,icon,label,render:pages[id]}));

const sprint3Routes=new Set(['wellness','money']);
const controllerExcluded=new Set(['business','career','journal','sanctuary','premium','calendar','goals']);

let router;
router=createRouter({
  routes,
  onRender:async id=>{
    if(id==='calendar'){
      await enhanceSprint6B14(id,router);
      await enhanceSprint6B16(id,router);
      return;
    }
    if(id==='money'){
      if(ctl.money)await ctl.money(router);
      await enhanceSprint6B14(id,router);
      await enhanceSprint6B15(id,router);
      await enhanceSprint6B16(id,router);
      return;
    }
    if(!repairedRoutes.has(id)){
      if(sprint3Routes.has(id))enhance(id,router);
      else if(!controllerExcluded.has(id)&&ctl[id])await ctl[id](router);
      await enhanceSprint4(id,router);
      await enhanceSprint5(id,router);
      await enhanceSprint6A(id,router);
      await enhanceSprint6B(id,router);
      await enhanceSprint6B1(id,router);
      await enhanceSprint6B1Final(id,router);
      await enhanceSprint6B2(id,router);
    }else{
      if(id==='dashboard'&&ctl.dashboard)await ctl.dashboard(router);
      if(id==='intelligence'&&ctl.intelligence)ctl.intelligence(router);
      if(id==='calendar'||id==='goals'||id==='intelligence')await enhanceSprint6B2(id,router);
      if(id==='wellness'){}
    }
    await enhanceSprint6B3(id,router);
    await enhanceSprint6B4(id,router);
    await enhanceSprint6B5(id,router);
    await enhanceSprint6B6(id,router);
    await enhanceSprint6B7(id,router);
    await enhanceSprint6B8(id,router);
    await enhanceSprint6B9(id,router);
    await enhanceSprint6B10(id,router);
    await enhanceSprint6B11(id,router);
    await enhanceSprint6B12(id,router);
    await enhanceSprint6B13(id,router);
    await enhanceSprint6B13R2(id,router);
    await enhanceSprint6B14(id,router);
    await enhanceSprint6B15(id,router);
    await enhanceSprint6B16(id,router);
  }});

const shell=document.querySelector('#appShell');
document.querySelector('#menuButton').onclick=()=>shell.classList.add('menu-open');
document.querySelector('#menuScrim').onclick=()=>shell.classList.remove('menu-open');
document.addEventListener('keydown',event=>{if(event.key==='Escape')shell.classList.remove('menu-open')});
document.querySelector('#themeButton').onclick=()=>router.go('premium');
document.querySelector('.avatar').onclick=()=>router.go('profile');
document.querySelector('.avatar').setAttribute('role','button');
document.querySelector('.avatar').setAttribute('tabindex','0');
document.querySelector('.avatar').onkeydown=event=>{
  if(event.key==='Enter'||event.key===' '){event.preventDefault();router.go('profile')}
};

window.addEventListener('kc:state',()=>{
  applyDesign();
  window.dispatchEvent(new CustomEvent('kc:ui-refresh',{detail:{route:router.current()}}));
});
router.go(router.initial,false,{replace:true});

const updateOnline=()=>document.body.classList.toggle('offline',!navigator.onLine);
addEventListener('online',updateOnline);
addEventListener('offline',updateOnline);
updateOnline();

if('serviceWorker' in navigator){
  let reloading=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(reloading)return;
    reloading=true;
    location.reload();
  });
  navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(registration=>{
    const activateWaiting=()=>{if(registration.waiting)registration.waiting.postMessage({type:'SKIP_WAITING'})};
    activateWaiting();
    registration.addEventListener('updatefound',()=>{
      const worker=registration.installing;
      worker?.addEventListener('statechange',()=>{
        if(worker.state==='installed'&&navigator.serviceWorker.controller)activateWaiting();
      });
    });
    addEventListener('focus',()=>registration.update().catch(()=>{}));
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible')registration.update().catch(()=>{});
    });
  }).catch(error=>console.warn('Service worker registration failed',error));
}
