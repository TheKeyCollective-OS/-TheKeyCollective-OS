import {store} from './store.js';

const BUILD='Sprint 6B.42 Morning Brief Final Source-of-Truth Lock';
const $=(selector,root=document)=>root.querySelector(selector);
const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0));
const pageTitle=()=>($('#page h1')?.textContent||'').trim();

function wellnessSnapshot(){
  const state=store.get();
  const waterGoal=Math.max(1,Math.round(Number(state.wellness?.waterGoal)||8));
  const water=clamp(state.water,0,waterGoal);
  const minutes=Math.max(0,Math.round(Number(state.gymMinutes)||0));
  const movementGoal=Math.max(1,Math.round(Number(state.wellness?.gymGoalMinutes)||60));
  return {water,waterGoal,minutes,movementGoal};
}

function morningResetSnapshot(){
  const sanctuary=store.get().sanctuary||{};
  const live=Array.isArray(sanctuary.completed?.morning)?sanctuary.completed.morning:[];
  const labels=Array.isArray(sanctuary.routines?.morning)?sanctuary.routines.morning:[];
  const editor=Array.isArray(sanctuary.routines?.['morning-reset']?.items)?sanctuary.routines['morning-reset'].items:[];
  const snapshot=Array.isArray(sanctuary.morningSnapshot?.items)?sanctuary.morningSnapshot.items:[];
  const total=Math.max(live.length,labels.length,editor.length,snapshot.length,Number(sanctuary.routineTotals?.morning)||0);
  if(!total)return {done:0,total:0};
  const done=Array.from({length:total},(_,index)=>{
    if(index<live.length)return Boolean(live[index]);
    const item=editor[index]||snapshot[index];
    return Boolean(item?.done??item?.completed??item?.checked);
  }).filter(Boolean).length;
  return {done,total};
}

function go(route,router=window.__keyCollectiveRouter){
  if(router?.go){router.go(route);return;}
  document.querySelector(`.nav-button[data-route="${route}"]`)?.click();
}

function cardMarkup(kind){
  if(kind==='water')return `<div class="mini">Water</div><div class="metric" data-kc42-water></div><div class="bar"><span data-kc42-water-bar></span></div><p class="muted" data-kc42-water-copy></p><button type="button" class="btn ghost" data-kc42-go="wellness">Open Wellness Studio</button>`;
  if(kind==='movement')return `<div class="mini">Movement</div><div class="metric" data-kc42-movement></div><div class="bar"><span data-kc42-movement-bar></span></div><p class="muted" data-kc42-movement-copy></p><button type="button" class="btn ghost" data-kc42-go="wellness">Open Wellness Studio</button>`;
  return `<div class="mini">Power on gently</div><h3>Morning Reset</h3><div class="metric" data-kc42-reset></div><div class="bar"><span data-kc42-reset-bar></span></div><p class="muted" data-kc42-reset-copy></p><button type="button" class="btn ghost" data-kc42-go="sanctuary">Open Sanctuary</button>`;
}

function ensureBrief(){
  if(pageTitle()!=='Morning Brief')return;
  const page=$('#page');
  const grid=$('.brief-metric-grid',page);
  if(!grid)return;
  const cards=[...grid.children].filter(node=>node.classList?.contains('card'));
  const water=cards[0];
  const movement=cards[1];
  if(water&&!water.hasAttribute('data-kc42-water-card')){
    water.setAttribute('data-kc42-water-card','');
    water.innerHTML=cardMarkup('water');
  }
  if(movement&&!movement.hasAttribute('data-kc42-movement-card')){
    movement.setAttribute('data-kc42-movement-card','');
    movement.innerHTML=cardMarkup('movement');
  }
  let reset=$('[data-kc42-reset-card]',page);
  if(!reset){
    reset=document.createElement('article');
    reset.className='card';
    reset.setAttribute('data-kc42-reset-card','');
    reset.innerHTML=cardMarkup('reset');
    const intelligenceGrid=$('.intelligence-grid',page);
    if(intelligenceGrid)intelligenceGrid.insertAdjacentElement('beforebegin',reset);
    else grid.insertAdjacentElement('afterend',reset);
  }
  paintBrief();
}

function paintBrief(){
  if(pageTitle()!=='Morning Brief')return;
  const wellness=wellnessSnapshot();
  const reset=morningResetSnapshot();
  const waterPercent=clamp(Math.round(wellness.water/wellness.waterGoal*100),0,100);
  const movementPercent=clamp(Math.round(wellness.minutes/wellness.movementGoal*100),0,100);
  const resetPercent=reset.total?clamp(Math.round(reset.done/reset.total*100),0,100):0;
  $('[data-kc42-water]')?.replaceChildren(document.createTextNode(`${wellness.water} / ${wellness.waterGoal}`));
  if($('[data-kc42-water-bar]'))$('[data-kc42-water-bar]').style.width=`${waterPercent}%`;
  if($('[data-kc42-water-copy]'))$('[data-kc42-water-copy]').textContent=`${wellness.water} of ${wellness.waterGoal} glasses from Wellness Studio`;
  $('[data-kc42-movement]')?.replaceChildren(document.createTextNode(`${wellness.minutes} / ${wellness.movementGoal} min`));
  if($('[data-kc42-movement-bar]'))$('[data-kc42-movement-bar]').style.width=`${movementPercent}%`;
  if($('[data-kc42-movement-copy]'))$('[data-kc42-movement-copy]').textContent=`${wellness.minutes} minutes moved versus a ${wellness.movementGoal}-minute goal`;
  $('[data-kc42-reset]')?.replaceChildren(document.createTextNode(`${reset.done} / ${reset.total}`));
  if($('[data-kc42-reset-bar]'))$('[data-kc42-reset-bar]').style.width=`${resetPercent}%`;
  if($('[data-kc42-reset-copy]'))$('[data-kc42-reset-copy]').textContent=`${reset.done} of ${reset.total} Sanctuary Morning Reset items complete`;
}

let bound=false;
function bind(router){
  if(bound)return;
  bound=true;
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-kc42-go]');
    if(!target)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    go(target.dataset.kc42Go,router);
  },true);
  window.addEventListener('kc:state',()=>{ensureBrief();paintBrief();});
  const observer=new MutationObserver(()=>{
    if(pageTitle()==='Morning Brief')ensureBrief();
  });
  observer.observe($('#page')||document.body,{childList:true,subtree:true});
}

export async function enhanceSprint6B42(id,router){
  bind(router);
  if(id==='intelligence'){
    ensureBrief();
    requestAnimationFrame(ensureBrief);
    setTimeout(ensureBrief,80);
    setTimeout(ensureBrief,300);
  }
  const badge=$('#kcBuildStatus b');
  if(badge)badge.textContent=BUILD;
}
