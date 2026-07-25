import {store} from './store.js';

const BUILD='Sprint 6B.28 Morning Brief + Wellness Finalization';
const $=(selector,root=document)=>root.querySelector(selector);
const all=(selector,root=document)=>[...root.querySelectorAll(selector)];
const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0));
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));

function localDate(){
  const now=new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}

function ensureDailyGym(){
  const state=store.get();
  if(state.wellness?.gymDate===localDate())return;
  store.mutate(data=>{
    data.wellness=data.wellness||{};
    data.wellness.gymDate=localDate();
    data.gymMinutes=0;
  });
}

function gymData(state=store.get()){
  const minutes=Math.max(0,Math.round(Number(state.gymMinutes)||0));
  const goal=Math.max(1,Math.round(Number(state.wellness?.gymGoalMinutes)||60));
  return {minutes,goal,pct:clamp(Math.round(minutes/goal*100),0,100)};
}

function morningItems(state=store.get()){
  const sanctuary=state.sanctuary||{};
  const editorRoutine=sanctuary.routines?.['morning-reset'];
  if(Array.isArray(editorRoutine?.items)){
    const items=editorRoutine.items;
    return {
      total:items.length,
      done:items.filter(item=>Boolean(item?.done)).length,
      labels:items.map(item=>String(item?.text||''))
    };
  }
  const legacy=Array.isArray(sanctuary.routines?.morning)?sanctuary.routines.morning:[];
  const completed=Array.isArray(sanctuary.completed?.morning)?sanctuary.completed.morning:[];
  const total=Math.max(legacy.length,completed.length,Number(sanctuary.routineTotals?.morning)||0,1);
  return {total,done:Array.from({length:total},(_,index)=>Boolean(completed[index])).filter(Boolean).length,labels:legacy};
}

function morningData(state=store.get()){
  const data=morningItems(state);
  return {...data,pct:data.total?Math.round(data.done/data.total*100):0};
}

function findBriefCard(label){
  return all('#page .brief-metric-grid > .card').find(card=>{
    const mini=card.querySelector('.mini');
    return mini&&mini.textContent.trim().toLowerCase()===label.toLowerCase();
  });
}

function renderBriefWater(){
  const card=findBriefCard('Water');
  if(!card)return;
  const value=clamp(store.get().water,0,8);
  card.className='card brief-water-6b28';
  card.innerHTML=`
    <div class="mini">Water</div>
    <div class="metric" data-water-count-628>${value}/8</div>
    <div class="bar"><span data-water-bar-628 style="width:${value/8*100}%"></span></div>
    <div class="brief-stepper-6b28" aria-label="Water controls">
      <button type="button" class="btn ghost" data-water-step-628="-1" aria-label="Remove one glass">−</button>
      <button type="button" class="btn" data-water-step-628="1" aria-label="Add one glass">＋</button>
    </div>
    <small>Synced with Wellness Studio.</small>`;
}

function renderBriefGym(){
  let card=findBriefCard('Movement');
  if(!card)card=findBriefCard('Gym time');
  if(!card)return;
  const gym=gymData();
  card.className='card brief-gym-6b28';
  card.innerHTML=`
    <div class="mini">Gym time</div>
    <div class="metric" data-brief-gym-count-628>${gym.minutes} min</div>
    <div class="bar"><span data-brief-gym-bar-628 style="width:${gym.pct}%"></span></div>
    <strong data-brief-gym-goal-628>${gym.minutes} of ${gym.goal} minutes</strong>
    <small data-brief-gym-pct-628>${gym.pct}% of today’s goal · logged in Wellness Studio.</small>`;
}

function findMorningCard(){
  return all('#page .card').find(card=>card.querySelector('h3')?.textContent.trim()==='Morning Routine');
}

function renderMorningRoutine(){
  const card=findMorningCard();
  if(!card)return;
  const routine=morningData();
  card.className='card morning-routine-card morning-routine-6b28';
  card.innerHTML=`
    <div class="mini">Power on gently</div>
    <h3>Morning Routine</h3>
    <div class="routine-summary-number" data-morning-count-628>${routine.done} of ${routine.total}</div>
    <div class="bar"><span data-morning-bar-628 style="width:${routine.pct}%"></span></div>
    <p data-morning-copy-628>${routine.done} completed from Sanctuary’s ${routine.total}-item Morning Reset.</p>
    <button type="button" class="btn ghost" data-jump="sanctuary">Open Sanctuary</button>`;
}

function renderWellnessGym(){
  if(!$('#page h1')?.textContent.includes('Wellness Studio'))return;
  let card=$('#wellnessGymCard628');
  if(!card){
    card=document.createElement('article');
    card.id='wellnessGymCard628';
    card.className='card wellness-gym-card-6b28';
    const water=all('#page .card').find(node=>/Daily hydration/i.test(node.textContent||''));
    if(water)water.insertAdjacentElement('afterend',card);
    else $('#page .pagehead')?.insertAdjacentElement('afterend',card);
  }
  const gym=gymData();
  card.innerHTML=`
    <div class="section-title">
      <div><div class="eyebrow">Daily movement</div><h3>Gym Time</h3></div>
      <span class="pill" data-wellness-gym-pill-628>${gym.minutes} / ${gym.goal} min</span>
    </div>
    <div class="wellness-gym-number-6b28" data-wellness-gym-count-628>${gym.minutes}</div>
    <p class="wellness-gym-label-6b28">Minutes logged today</p>
    <div class="bar"><span data-wellness-gym-bar-628 style="width:${gym.pct}%"></span></div>
    <div class="wellness-gym-actions-6b28">
      <button type="button" class="btn ghost" data-gym-step-628="-5">− 5 min</button>
      <button type="button" class="btn" data-gym-step-628="5">＋ 5 min</button>
      <button type="button" class="btn ghost" data-gym-step-628="-15">− 15 min</button>
      <button type="button" class="btn" data-gym-step-628="15">＋ 15 min</button>
    </div>
    <label class="wellness-gym-goal-6b28">Today’s gym goal
      <div class="wellness-gym-goal-row-6b28">
        <input type="number" min="1" step="5" inputmode="numeric" value="${gym.goal}" data-gym-goal-input-628 aria-label="Daily gym goal in minutes">
        <button type="button" class="btn" data-save-gym-goal-628>Save goal</button>
      </div>
    </label>
    <div class="status" data-gym-status-628>${gym.pct>=100?'Today’s gym goal is complete.':'Gym time syncs instantly to Morning Brief.'}</div>`;
}

function updateWater(){
  const value=clamp(store.get().water,0,8);
  all('[data-water-count-628]').forEach(node=>node.textContent=`${value}/8`);
  all('[data-water-bar-628]').forEach(node=>node.style.width=`${value/8*100}%`);
}

function updateGym(){
  const gym=gymData();
  all('[data-brief-gym-count-628]').forEach(node=>node.textContent=`${gym.minutes} min`);
  all('[data-brief-gym-goal-628]').forEach(node=>node.textContent=`${gym.minutes} of ${gym.goal} minutes`);
  all('[data-brief-gym-pct-628]').forEach(node=>node.textContent=`${gym.pct}% of today’s goal · logged in Wellness Studio.`);
  all('[data-brief-gym-bar-628],[data-wellness-gym-bar-628]').forEach(node=>node.style.width=`${gym.pct}%`);
  all('[data-wellness-gym-count-628]').forEach(node=>node.textContent=String(gym.minutes));
  all('[data-wellness-gym-pill-628]').forEach(node=>node.textContent=`${gym.minutes} / ${gym.goal} min`);
  all('[data-gym-status-628]').forEach(node=>node.textContent=gym.pct>=100?'Today’s gym goal is complete.':'Gym time syncs instantly to Morning Brief.');
}

function updateMorning(){
  const routine=morningData();
  all('[data-morning-count-628]').forEach(node=>node.textContent=`${routine.done} of ${routine.total}`);
  all('[data-morning-bar-628]').forEach(node=>node.style.width=`${routine.pct}%`);
  all('[data-morning-copy-628]').forEach(node=>node.textContent=`${routine.done} completed from Sanctuary’s ${routine.total}-item Morning Reset.`);
}

function bindActions(){
  if(document.documentElement.dataset.sprint628Bound)return;
  document.documentElement.dataset.sprint628Bound='true';
  document.addEventListener('click',event=>{
    const water=event.target.closest('[data-water-step-628]');
    if(water){
      event.preventDefault();event.stopImmediatePropagation();
      const delta=Number(water.dataset.waterStep628)||0;
      store.mutate(data=>{data.water=clamp((Number(data.water)||0)+delta,0,8);});
      return;
    }
    const gym=event.target.closest('[data-gym-step-628]');
    if(gym){
      event.preventDefault();event.stopImmediatePropagation();
      const delta=Number(gym.dataset.gymStep628)||0;
      store.mutate(data=>{data.gymMinutes=Math.max(0,(Number(data.gymMinutes)||0)+delta);data.wellness=data.wellness||{};data.wellness.gymDate=localDate();});
      return;
    }
    const save=event.target.closest('[data-save-gym-goal-628]');
    if(save){
      event.preventDefault();event.stopImmediatePropagation();
      const input=$('[data-gym-goal-input-628]');
      const goal=Math.max(1,Math.round(Number(input?.value)||60));
      store.mutate(data=>{data.wellness=data.wellness||{};data.wellness.gymGoalMinutes=goal;});
      const status=$('[data-gym-status-628]');if(status)status.textContent='Daily gym goal saved.';
    }
  },true);
}

let stateBound=false;
function bindState(){
  if(stateBound)return;
  stateBound=true;
  window.addEventListener('kc:state',()=>{
    updateWater();updateGym();updateMorning();
  });
}

export async function enhanceSprint6B28(id){
  const badge=$('#kcBuildStatus b');if(badge)badge.textContent=BUILD;
  ensureDailyGym();bindActions();bindState();
  if(id==='intelligence'){
    renderBriefWater();renderBriefGym();renderMorningRoutine();
  }
  if(id==='wellness')renderWellnessGym();
  requestAnimationFrame(()=>{
    if(id==='intelligence'){renderBriefWater();renderBriefGym();renderMorningRoutine();}
    if(id==='wellness')renderWellnessGym();
  });
  setTimeout(()=>{
    if(id==='intelligence'){renderBriefWater();renderBriefGym();renderMorningRoutine();}
    if(id==='wellness')renderWellnessGym();
  },150);
}
