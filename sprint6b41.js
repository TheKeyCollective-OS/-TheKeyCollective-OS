import {store} from './store.js';

const BUILD='Sprint 6B.41 Morning Brief Source-of-Truth Lock';
const $=(selector,root=document)=>root.querySelector(selector);
const all=(selector,root=document)=>[...root.querySelectorAll(selector)];
const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0));
const pageTitle=()=>($('#page h1')?.textContent||'').trim();

function wellnessSnapshot(){
  const state=store.get();
  const waterGoal=Math.max(1,Math.round(Number(state.wellness?.waterGoal)||8));
  const water=clamp(state.water,0,waterGoal);
  const minutes=Math.max(0,Math.round(Number(state.gymMinutes)||0));
  const movementGoal=Math.max(1,Math.round(Number(state.wellness?.gymGoalMinutes)||60));
  return {
    water,
    waterGoal,
    waterPercent:clamp(Math.round((water/waterGoal)*100),0,100),
    minutes,
    movementGoal,
    movementPercent:clamp(Math.round((minutes/movementGoal)*100),0,100)
  };
}

function morningResetSnapshot(){
  const sanctuary=store.get().sanctuary||{};
  const editable=sanctuary.routines?.['morning-reset'];
  if(Array.isArray(editable?.items)){
    const items=editable.items;
    return {done:items.filter(item=>Boolean(item?.done)).length,total:items.length};
  }

  const completed=Array.isArray(sanctuary.completed?.morning)?sanctuary.completed.morning:[];
  const labels=Array.isArray(sanctuary.routines?.morning)?sanctuary.routines.morning:[];
  const snapshot=Array.isArray(sanctuary.morningSnapshot?.items)?sanctuary.morningSnapshot.items:[];
  const total=Math.max(completed.length,labels.length,snapshot.length,Number(sanctuary.routineTotals?.morning)||0);
  const done=Array.from({length:total},(_,index)=>Boolean(
    completed[index]??snapshot[index]?.done??snapshot[index]?.completed??snapshot[index]?.checked
  )).filter(Boolean).length;
  return {done,total};
}

function briefCard(kind){
  const cards=all('#page .brief-metric-grid > .card, #page article.card, #page .card');
  const unique=[...new Set(cards)];
  if(kind==='water'){
    return unique.find(card=>card.hasAttribute('data-kc41-water-card'))
      ||unique.find(card=>card.querySelector('[data-kc40-water],[data-639-water-value],[data-water-value-636],[data-water-value-632]'))
      ||unique.find(card=>/^Water$/i.test((card.querySelector('.mini')?.textContent||card.querySelector('h3')?.textContent||'').trim()));
  }
  if(kind==='movement'){
    return unique.find(card=>card.hasAttribute('data-kc41-movement-card'))
      ||unique.find(card=>card.querySelector('[data-kc40-brief-minutes],[data-639-brief-gym-value],[data-gym-value-636]'))
      ||unique.find(card=>/^(Movement|Gym Time|Gym time)$/i.test((card.querySelector('.mini')?.textContent||card.querySelector('h3')?.textContent||'').trim()));
  }
  return unique.find(card=>card.hasAttribute('data-kc41-reset-card'))
    ||unique.find(card=>card.querySelector('[data-kc40-morning],[data-639-morning-value],[data-morning-value-636]'))
    ||unique.find(card=>/^(Morning Routine|Morning Reset)$/i.test((card.querySelector('h3')?.textContent||'').trim())||/Power on gently/i.test(card.textContent||''));
}

function routeTo(route,router=window.__keyCollectiveRouter){
  if(router?.go){router.go(route);return;}
  $(`.nav-button[data-route="${route}"]`)?.click();
}

function buildBrief(){
  if(pageTitle()!=='Morning Brief')return;

  const water=briefCard('water');
  if(water){
    water.dataset.kc41WaterCard='';
    water.innerHTML=`
      <div class="mini">Water</div>
      <div class="metric" data-kc41-water-value></div>
      <div class="bar"><span data-kc41-water-bar></span></div>
      <strong data-kc41-water-copy></strong>
      <small>Synced from Wellness Studio</small>
      <button type="button" class="btn ghost" data-kc41-route="wellness">Open Wellness Studio</button>`;
  }

  const movement=briefCard('movement');
  if(movement){
    movement.dataset.kc41MovementCard='';
    movement.innerHTML=`
      <div class="mini">Movement</div>
      <div class="metric" data-kc41-movement-value></div>
      <div class="bar"><span data-kc41-movement-bar></span></div>
      <strong data-kc41-movement-copy></strong>
      <small>Synced from Wellness Studio</small>
      <button type="button" class="btn ghost" data-kc41-route="wellness">Open Wellness Studio</button>`;
  }

  const reset=briefCard('reset');
  if(reset){
    reset.dataset.kc41ResetCard='';
    reset.innerHTML=`
      <div class="mini">Power on gently</div>
      <h3>Morning Reset</h3>
      <div class="routine-summary-number" data-kc41-reset-value></div>
      <div class="bar"><span data-kc41-reset-bar></span></div>
      <p data-kc41-reset-copy></p>
      <button type="button" class="btn ghost" data-kc41-route="sanctuary">Open Sanctuary</button>`;
  }

  paintBrief();
}

function paintBrief(){
  if(pageTitle()!=='Morning Brief')return;
  const wellness=wellnessSnapshot();
  const reset=morningResetSnapshot();
  const resetPercent=reset.total?clamp(Math.round((reset.done/reset.total)*100),0,100):0;

  all('[data-kc41-water-value]').forEach(node=>node.textContent=`${wellness.water} / ${wellness.waterGoal}`);
  all('[data-kc41-water-bar]').forEach(node=>node.style.width=`${wellness.waterPercent}%`);
  all('[data-kc41-water-copy]').forEach(node=>node.textContent=`${wellness.water} of ${wellness.waterGoal} glasses`);

  all('[data-kc41-movement-value]').forEach(node=>node.textContent=`${wellness.minutes} min`);
  all('[data-kc41-movement-bar]').forEach(node=>node.style.width=`${wellness.movementPercent}%`);
  all('[data-kc41-movement-copy]').forEach(node=>node.textContent=`${wellness.minutes} of ${wellness.movementGoal} minutes`);

  all('[data-kc41-reset-value]').forEach(node=>node.textContent=`${reset.done} of ${reset.total}`);
  all('[data-kc41-reset-bar]').forEach(node=>node.style.width=`${resetPercent}%`);
  all('[data-kc41-reset-copy]').forEach(node=>node.textContent=`${reset.done} of ${reset.total} Sanctuary Morning Reset items complete.`);
}

let bound=false;
function bind(router){
  if(bound)return;
  bound=true;
  document.addEventListener('click',event=>{
    const control=event.target.closest('[data-kc41-route]');
    if(!control)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    routeTo(control.dataset.kc41Route,router);
  },true);
  window.addEventListener('kc:state',()=>{
    if(pageTitle()==='Morning Brief')paintBrief();
  });
}

export async function enhanceSprint6B41(id,router){
  bind(router);
  if(id==='intelligence')buildBrief();
  const badge=$('#kcBuildStatus b');
  if(badge)badge.textContent=BUILD;
}
