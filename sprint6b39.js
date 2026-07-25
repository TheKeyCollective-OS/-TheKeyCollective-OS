import {store} from './store.js';

const BUILD='Sprint 6B.39 Final Stabilization';
const $=(selector,root=document)=>root.querySelector(selector);
const all=(selector,root=document)=>[...root.querySelectorAll(selector)];
const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0));
const localDate=()=>{const date=new Date();return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`};

function currentPage(){return ($('#page h1')?.textContent||'').trim();}
function go(route,router=window.__keyCollectiveRouter){
  if(router?.go){router.go(route);return;}
  const button=$(`.nav-button[data-route="${route}"]`);
  if(button){button.click();return;}
  location.hash=`#${route}`;
}
function gymState(){
  const state=store.get();
  const minutes=Math.max(0,Math.round(Number(state.gymMinutes)||0));
  const goal=Math.max(1,Math.round(Number(state.wellness?.gymGoalMinutes)||60));
  return {minutes,goal,percent:clamp(Math.round(minutes/goal*100),0,100)};
}
function sobrietyDays(){
  const reset=store.get().sobriety?.lastReset;
  if(!reset)return 0;
  const start=new Date(`${reset}T00:00:00`);
  const today=new Date(`${localDate()}T00:00:00`);
  if(Number.isNaN(start.getTime())||Number.isNaN(today.getTime()))return 0;
  // The reset date is day one, matching the approved dashboard convention.
  return Math.max(1,Math.floor((today-start)/86400000)+1);
}
function morningResetState(){
  const sanctuary=store.get().sanctuary||{};
  const snapshot=Array.isArray(sanctuary.morningSnapshot?.items)?sanctuary.morningSnapshot.items:[];
  const labels=Array.isArray(sanctuary.routines?.morning)?sanctuary.routines.morning:[];
  const completed=Array.isArray(sanctuary.completed?.morning)?sanctuary.completed.morning:[];
  const editor=sanctuary.routines?.['morning-reset'];
  if(Array.isArray(editor?.items)&&editor.items.length){
    const items=editor.items;
    return {done:items.filter(item=>Boolean(item?.done??item?.completed??item?.checked)).length,total:items.length};
  }
  // completed.morning is the live checklist written by Sanctuary. Snapshot supplies labels/fallback only.
  const total=Math.max(labels.length,completed.length,snapshot.length,Number(sanctuary.routineTotals?.morning)||0,1);
  const done=Array.from({length:total},(_,index)=>{
    if(index<completed.length)return Boolean(completed[index]);
    return Boolean(snapshot[index]?.done??snapshot[index]?.completed??snapshot[index]?.checked);
  }).filter(Boolean).length;
  return {done,total};
}
function briefCard(labelPattern){
  return all('#page .brief-metric-grid > .card').find(card=>labelPattern.test((card.querySelector('.mini')?.textContent||card.querySelector('h3')?.textContent||'').trim()))
    ||all('#page .card').find(card=>labelPattern.test((card.querySelector('.mini')?.textContent||card.querySelector('h3')?.textContent||'').trim()));
}
function bindButton(button,handler){
  if(!button)return;
  button.onclick=event=>{event.preventDefault();event.stopPropagation();handler(event)};
}

function renderMorningBrief(router){
  if(currentPage()!=='Morning Brief')return;
  const water=briefCard(/^Water$/i);
  if(water){
    water.className='card brief-water-639';
    water.innerHTML=`<div class="mini">Water</div><div class="metric" data-639-water-value></div><div class="bar"><span data-639-water-bar></span></div><div class="button-row"><button type="button" class="btn ghost" data-639-water-minus>− Remove</button><button type="button" class="btn" data-639-water-plus>＋ Add</button></div><button type="button" class="btn ghost" data-639-open-wellness>Open Wellness Studio</button>`;
    bindButton($('[data-639-water-minus]',water),()=>changeWater(-1));
    bindButton($('[data-639-water-plus]',water),()=>changeWater(1));
    bindButton($('[data-639-open-wellness]',water),()=>go('wellness',router));
  }
  const movement=briefCard(/^(Movement|Gym Time|Gym time)$/i);
  if(movement){
    movement.className='card brief-movement-639';
    movement.innerHTML=`<div class="mini">Movement</div><div class="metric" data-639-brief-gym-value></div><div class="bar"><span data-639-brief-gym-bar></span></div><strong data-639-brief-gym-copy></strong><small data-639-brief-gym-percent></small><button type="button" class="btn ghost" data-639-open-wellness>Open Wellness Studio</button>`;
    bindButton($('[data-639-open-wellness]',movement),()=>go('wellness',router));
  }
  let routine=all('#page .card').find(card=>/^(Morning Routine|Morning Reset)$/i.test((card.querySelector('h3')?.textContent||'').trim())||/Power on gently/i.test(card.textContent||''));
  if(routine){
    all('#page .card').filter(card=>card!==routine).forEach(card=>{if(/^(Morning Routine|Morning Reset)$/i.test((card.querySelector('h3')?.textContent||'').trim()))card.remove()});
    routine.className='card morning-reset-639';
    routine.innerHTML=`<div class="mini">Power on gently</div><h3>Morning Reset</h3><div class="routine-summary-number" data-639-morning-value></div><div class="bar"><span data-639-morning-bar></span></div><p data-639-morning-copy></p><button type="button" class="btn ghost" data-639-open-sanctuary>Open Sanctuary</button>`;
    bindButton($('[data-639-open-sanctuary]',routine),()=>go('sanctuary',router));
  }
  paintMorningBrief();
}
function paintMorningBrief(){
  if(currentPage()!=='Morning Brief')return;
  const water=clamp(store.get().water,0,8);
  const gym=gymState();
  const morning=morningResetState();
  const morningPercent=morning.total?clamp(Math.round(morning.done/morning.total*100),0,100):0;
  all('[data-639-water-value]').forEach(node=>node.textContent=`${water}/8`);
  all('[data-639-water-bar]').forEach(node=>node.style.width=`${water/8*100}%`);
  all('[data-639-brief-gym-value]').forEach(node=>node.textContent=`${gym.minutes} min`);
  all('[data-639-brief-gym-bar]').forEach(node=>node.style.width=`${gym.percent}%`);
  all('[data-639-brief-gym-copy]').forEach(node=>node.textContent=`${gym.minutes} of ${gym.goal} minutes`);
  all('[data-639-brief-gym-percent]').forEach(node=>node.textContent=`${gym.percent}% of today’s goal`);
  all('[data-639-morning-value]').forEach(node=>node.textContent=`${morning.done} of ${morning.total}`);
  all('[data-639-morning-bar]').forEach(node=>node.style.width=`${morningPercent}%`);
  all('[data-639-morning-copy]').forEach(node=>node.textContent=`${morning.done} of ${morning.total} Sanctuary Morning Reset items complete.`);
}
function changeWater(delta){
  store.mutate(state=>{state.water=clamp((Number(state.water)||0)+delta,0,8)});
  paintMorningBrief();paintWellness();
}

function renderWellness(){
  if(currentPage()!=='Wellness Studio')return;
  const page=$('#page');if(!page)return;
  const water=all('.card',page).find(card=>/^Water$/i.test((card.querySelector('h3')?.textContent||'').trim()));
  if(water){
    const metric=water.querySelector('.metric');if(metric)metric.dataset.waterValue639='';
    all('button',water).forEach(button=>button.remove());
    all('[data-water-controls-637],[data-water-controls-638],[data-water-controls-639]',water).forEach(node=>node.remove());
    const controls=document.createElement('div');controls.dataset.waterControls639='';controls.className='row wrap';
    controls.innerHTML=`<button type="button" class="btn ghost" data-639-wellness-water-minus>− Glass</button><button type="button" class="btn" data-639-wellness-water-plus>＋ Glass</button><button type="button" class="btn ghost" data-639-wellness-water-reset>Reset</button>`;
    water.append(controls);
    bindButton($('[data-639-wellness-water-minus]',water),()=>changeWater(-1));
    bindButton($('[data-639-wellness-water-plus]',water),()=>changeWater(1));
    bindButton($('[data-639-wellness-water-reset]',water),()=>{store.mutate(state=>{state.water=0});paintWellness()});
  }
  let gym=$('#wellnessGym639')||all('.card',page).find(card=>/^(Gym|Gym Time)$/i.test((card.querySelector('h3')?.textContent||'').trim()));
  all('.card',page).filter(card=>card!==gym&&/^(Gym|Gym Time)$/i.test((card.querySelector('h3')?.textContent||'').trim())).forEach(card=>card.remove());
  if(!gym){gym=document.createElement('article');gym.className='card gradient-card';water?.insertAdjacentElement('afterend',gym);if(!water)page.append(gym)}
  gym.id='wellnessGym639';
  gym.innerHTML=`<div class="section-title"><div><div class="eyebrow">Daily movement</div><h3>Gym Time</h3></div><span class="pill" data-639-gym-pill></span></div><div class="metric" data-639-gym-value></div><p class="muted">Minutes logged today</p><div class="bar"><span data-639-gym-bar></span></div><div class="controls-635 gym-controls-635"><button type="button" class="btn ghost" data-639-gym-step="-15">− 15 min</button><button type="button" class="btn ghost" data-639-gym-step="-5">− 5 min</button><button type="button" class="btn" data-639-gym-step="5">＋ 5 min</button><button type="button" class="btn" data-639-gym-step="15">＋ 15 min</button></div><label>Today’s gym goal<div class="goal-row-635"><input class="input" type="number" min="1" step="5" inputmode="numeric" data-639-gym-goal><button type="button" class="btn" data-639-save-gym-goal>Save goal</button></div></label><div class="status" data-639-gym-status>Gym time syncs directly to Morning Brief.</div>`;
  all('[data-639-gym-step]',gym).forEach(button=>bindButton(button,()=>changeGym(Number(button.dataset.gymStep)||0)));
  bindButton($('[data-639-save-gym-goal]',gym),()=>saveGymGoal(gym));
  paintWellness();
}
function changeGym(delta){
  store.mutate(state=>{state.wellness=state.wellness||{};state.wellness.gymDate=localDate();state.gymMinutes=Math.max(0,Math.round(Number(state.gymMinutes)||0)+delta)});
  paintWellness();paintMorningBrief();
}
function saveGymGoal(gym){
  const input=$('[data-639-gym-goal]',gym);
  const goal=Math.max(1,Math.round(Number(input?.value)||60));
  store.mutate(state=>{state.wellness=state.wellness||{};state.wellness.gymGoalMinutes=goal});
  const status=$('[data-639-gym-status]',gym);if(status)status.textContent=`Daily gym goal saved at ${goal} minutes and synced to Morning Brief.`;
  paintWellness();paintMorningBrief();
}
function paintWellness(){
  if(currentPage()!=='Wellness Studio')return;
  const water=clamp(store.get().water,0,8),gym=gymState(),days=sobrietyDays();
  all('[data-water-value-639]').forEach(node=>node.textContent=`${water}/8`);
  all('[data-639-gym-value]').forEach(node=>node.textContent=`${gym.minutes} min`);
  all('[data-639-gym-pill]').forEach(node=>node.textContent=`${gym.minutes} / ${gym.goal} min`);
  all('[data-639-gym-bar]').forEach(node=>node.style.width=`${gym.percent}%`);
  all('[data-639-gym-goal]').forEach(node=>{if(document.activeElement!==node)node.value=String(gym.goal)});
  const tracker=$('#sobrietyTracker6B18')||all('#page .card').find(card=>/Sobriety Tracker/i.test(card.textContent||''));
  if(tracker){const metric=tracker.querySelector('.metric'),pill=tracker.querySelector('.pill');if(metric)metric.textContent=String(days);if(pill)pill.textContent=`${days} day${days===1?'':'s'}`}
}

let stateBound=false;
export async function enhanceSprint6B39(id,router){
  if(id==='intelligence')renderMorningBrief(router);
  if(id==='wellness')renderWellness(router);
  const badge=$('#kcBuildStatus b');if(badge)badge.textContent=BUILD;
  if(!stateBound){
    stateBound=true;
    window.addEventListener('kc:state',()=>{paintMorningBrief();paintWellness()});
  }
}
