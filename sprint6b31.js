import {store} from './store.js';

const BUILD='Sprint 6B.31 Morning Brief + Wellness Consolidation';
const $=(selector,root=document)=>root.querySelector(selector);
const all=(selector,root=document)=>[...root.querySelectorAll(selector)];
const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0));

function localDate(){
  const now=new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}

function gymData(state=store.get()){
  const minutes=Math.max(0,Math.round(Number(state.gymMinutes)||0));
  const goal=Math.max(1,Math.round(Number(state.wellness?.gymGoalMinutes)||60));
  return {minutes,goal,pct:clamp(Math.round(minutes/goal*100),0,100)};
}

function morningData(state=store.get()){
  const sanctuary=state.sanctuary||{};
  const snapshot=Array.isArray(sanctuary.morningSnapshot?.items)?sanctuary.morningSnapshot.items:[];
  const labels=Array.isArray(sanctuary.routines?.morning)?sanctuary.routines.morning:[];
  const completed=Array.isArray(sanctuary.completed?.morning)?sanctuary.completed.morning:[];
  const total=Math.max(snapshot.length,labels.length,completed.length,Number(sanctuary.routineTotals?.morning)||0,4);
  const done=Array.from({length:total},(_,index)=>{
    if(snapshot[index])return Boolean(snapshot[index].done);
    return Boolean(completed[index]);
  }).filter(Boolean).length;
  return {done,total,pct:total?Math.round(done/total*100):0};
}

function captureMorningReset(){
  const boxes=all('#page input[data-ritual="morning"]');
  if(!boxes.length)return;
  const items=boxes.map((box,index)=>({
    label:box.closest('label')?.querySelector('span')?.textContent?.trim()||`Morning item ${index+1}`,
    done:Boolean(box.checked)
  }));
  const current=store.get().sanctuary?.morningSnapshot;
  if(current?.date===localDate()&&JSON.stringify(current.items||[])===JSON.stringify(items))return;
  store.mutate(state=>{
    state.sanctuary=state.sanctuary||{};
    state.sanctuary.completed=state.sanctuary.completed||{};
    state.sanctuary.routines=state.sanctuary.routines||{};
    state.sanctuary.routineTotals=state.sanctuary.routineTotals||{};
    state.sanctuary.completed.morning=items.map(item=>item.done);
    state.sanctuary.routines.morning=items.map(item=>item.label);
    state.sanctuary.routineTotals.morning=items.length;
    state.sanctuary.morningSnapshot={date:localDate(),items};
  });
}

function setWater(delta){
  store.mutate(state=>{state.water=clamp((Number(state.water)||0)+delta,0,8);});
}

function setGym(delta){
  store.mutate(state=>{
    state.wellness=state.wellness||{};
    state.wellness.gymDate=localDate();
    state.gymMinutes=Math.max(0,Math.round((Number(state.gymMinutes)||0)+delta));
  });
}

function removeLegacyGymCards(){
  all('#page #wellnessGymCard628,#page #wellnessGymCard629,#page #wellnessGymCard630,#page .wellness-gym-card-6b28,#page .wellness-gym-card-6b29,#page .wellness-gym-card-6b30').forEach(card=>card.remove());
  all('#page .wellness-grid > .card').forEach(card=>{
    if(card.id==='wellnessGymCard631')return;
    const heading=card.querySelector('h3')?.textContent.trim().toLowerCase();
    if(heading==='gym time')card.remove();
  });
}

function cleanLegacyMovementInput(){
  const wellness=$('#page h1')?.textContent.includes('Wellness Studio');
  if(!wellness)return;
  all('#page label').forEach(label=>{
    if(/^Movement minutes/i.test(label.textContent.trim()))label.remove();
  });
}

function renderWellnessGym(){
  if(!$('#page h1')?.textContent.includes('Wellness Studio'))return;
  removeLegacyGymCards();
  cleanLegacyMovementInput();
  const hydration=all('#page .wellness-grid > .card').find(card=>/Hydration/i.test(card.textContent||''));
  let card=$('#wellnessGymCard631');
  if(!card){
    card=document.createElement('article');
    card.id='wellnessGymCard631';
    if(hydration)hydration.insertAdjacentElement('afterend',card);
    else $('#page .wellness-grid')?.prepend(card);
  }
  const gym=gymData();
  card.className='card wellness-gym-card-6b31';
  card.innerHTML=`
    <div class="section-title"><div><div class="eyebrow">Daily movement</div><h3>Gym Time</h3></div><span class="pill" data-gym-pill-631>${gym.minutes} / ${gym.goal} min</span></div>
    <div class="wellness-gym-number-6b31" data-gym-count-631>${gym.minutes}</div>
    <p class="muted">Minutes logged today</p>
    <div class="bar"><span data-gym-bar-631 style="width:${gym.pct}%"></span></div>
    <div class="button-row wellness-gym-actions-6b31">
      <button type="button" class="btn ghost" data-gym-delta-631="-15">− 15 min</button>
      <button type="button" class="btn ghost" data-gym-delta-631="-5">− 5 min</button>
      <button type="button" class="btn" data-gym-delta-631="5">＋ 5 min</button>
      <button type="button" class="btn" data-gym-delta-631="15">＋ 15 min</button>
    </div>
    <label>Today’s gym goal
      <div class="wellness-gym-goal-row-6b31">
        <input type="number" min="1" step="5" inputmode="numeric" value="${gym.goal}" data-gym-goal-631 aria-label="Daily gym goal in minutes">
        <button type="button" class="btn" data-save-gym-goal-631>Save goal</button>
      </div>
    </label>
    <div class="status" data-gym-status-631>${gym.pct>=100?'Today’s gym goal is complete.':'Gym time syncs directly to Morning Brief.'}</div>`;
}

function metricCard(label){
  return all('#page .brief-metric-grid > .card').find(card=>card.querySelector('.mini')?.textContent.trim().toLowerCase()===label.toLowerCase());
}

function renderBriefWater(){
  const card=metricCard('Water');
  if(!card)return;
  const value=clamp(store.get().water,0,8);
  card.className='card brief-water-6b31';
  card.innerHTML=`
    <div class="mini">Water</div>
    <div class="metric" data-water-count-631>${value}/8</div>
    <div class="bar"><span data-water-bar-631 style="width:${value/8*100}%"></span></div>
    <div class="button-row brief-water-actions-6b31">
      <button type="button" class="btn ghost" data-water-delta-631="-1" aria-label="Remove one glass">−</button>
      <button type="button" class="btn" data-water-delta-631="1" aria-label="Add one glass">Add water</button>
    </div>
    <button type="button" class="btn ghost" data-jump="wellness">Open Wellness Studio</button>`;
}

function renderBriefGym(){
  const card=metricCard('Movement')||metricCard('Gym time');
  if(!card)return;
  const gym=gymData();
  card.className='card brief-gym-6b31';
  card.innerHTML=`
    <div class="mini">Gym time</div>
    <div class="metric" data-brief-gym-count-631>${gym.minutes} min</div>
    <div class="bar"><span data-gym-bar-631 style="width:${gym.pct}%"></span></div>
    <strong data-brief-gym-goal-631>${gym.minutes} of ${gym.goal} minutes</strong>
    <small data-brief-gym-pct-631>${gym.pct}% of today’s goal</small>
    <button type="button" class="btn ghost" data-jump="wellness">Open Wellness Studio</button>`;
}

function findMorningResetCard(){
  return all('#page .card').find(card=>{
    const heading=card.querySelector('h3')?.textContent.trim();
    return heading==='Morning Routine'||heading==='Morning Reset'||/Power on gently/i.test(card.textContent||'');
  });
}

function renderMorningReset(){
  let card=findMorningResetCard();
  if(!card){
    card=document.createElement('article');
    const grid=$('#page .intelligence-grid');
    if(grid)grid.prepend(card);
    else $('#page')?.append(card);
  }
  const routine=morningData();
  card.className='card morning-reset-6b31';
  card.innerHTML=`
    <div class="mini">Power on gently</div>
    <h3>Morning Reset</h3>
    <div class="routine-summary-number" data-morning-count-631>${routine.done} of ${routine.total}</div>
    <div class="bar"><span data-morning-bar-631 style="width:${routine.pct}%"></span></div>
    <p data-morning-copy-631>${routine.done} of ${routine.total} Sanctuary checklist items complete.</p>
    <button type="button" class="btn ghost" data-jump="sanctuary">Open Sanctuary</button>`;
}

function renderMorningBrief(){
  if(!$('#page h1')?.textContent.includes('Morning Brief'))return;
  renderBriefWater();
  renderBriefGym();
  renderMorningReset();
}

function updateVisible(){
  const water=clamp(store.get().water,0,8);
  all('[data-water-count-631]').forEach(node=>node.textContent=`${water}/8`);
  all('[data-water-bar-631]').forEach(node=>node.style.width=`${water/8*100}%`);
  const gym=gymData();
  all('[data-gym-count-631]').forEach(node=>node.textContent=String(gym.minutes));
  all('[data-gym-pill-631]').forEach(node=>node.textContent=`${gym.minutes} / ${gym.goal} min`);
  all('[data-brief-gym-count-631]').forEach(node=>node.textContent=`${gym.minutes} min`);
  all('[data-brief-gym-goal-631]').forEach(node=>node.textContent=`${gym.minutes} of ${gym.goal} minutes`);
  all('[data-brief-gym-pct-631]').forEach(node=>node.textContent=`${gym.pct}% of today’s goal`);
  all('[data-gym-bar-631]').forEach(node=>node.style.width=`${gym.pct}%`);
  const routine=morningData();
  all('[data-morning-count-631]').forEach(node=>node.textContent=`${routine.done} of ${routine.total}`);
  all('[data-morning-bar-631]').forEach(node=>node.style.width=`${routine.pct}%`);
  all('[data-morning-copy-631]').forEach(node=>node.textContent=`${routine.done} of ${routine.total} Sanctuary checklist items complete.`);
}

function bindRuntime(){
  if(document.documentElement.dataset.sprint631Bound)return;
  document.documentElement.dataset.sprint631Bound='true';
  document.addEventListener('click',event=>{
    const water=event.target.closest('[data-water-delta-631]');
    if(water){event.preventDefault();event.stopImmediatePropagation();setWater(Number(water.dataset.waterDelta631)||0);return;}
    const gym=event.target.closest('[data-gym-delta-631]');
    if(gym){event.preventDefault();event.stopImmediatePropagation();setGym(Number(gym.dataset.gymDelta631)||0);return;}
    const save=event.target.closest('[data-save-gym-goal-631]');
    if(save){
      event.preventDefault();event.stopImmediatePropagation();
      const goal=Math.max(1,Math.round(Number($('[data-gym-goal-631]')?.value)||60));
      store.mutate(state=>{state.wellness=state.wellness||{};state.wellness.gymGoalMinutes=goal;});
      const status=$('[data-gym-status-631]');if(status)status.textContent='Daily gym goal saved.';
    }
  },true);
  document.addEventListener('change',event=>{
    if(event.target.matches('#page input[data-ritual="morning"]')){
      queueMicrotask(captureMorningReset);
      setTimeout(captureMorningReset,0);
    }
  },true);
  window.addEventListener('kc:state',updateVisible);
}

export async function enhanceSprint6B31(id){
  const badge=$('#kcBuildStatus b');if(badge)badge.textContent=BUILD;
  bindRuntime();
  if(id==='sanctuary')captureMorningReset();
  if(id==='wellness')renderWellnessGym();
  if(id==='intelligence')renderMorningBrief();
  requestAnimationFrame(()=>{
    if(id==='sanctuary')captureMorningReset();
    if(id==='wellness')renderWellnessGym();
    if(id==='intelligence')renderMorningBrief();
  });
  setTimeout(()=>{
    if(id==='sanctuary')captureMorningReset();
    if(id==='wellness')renderWellnessGym();
    if(id==='intelligence')renderMorningBrief();
  },250);
}
