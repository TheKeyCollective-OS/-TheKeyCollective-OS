import {store} from './store.js';

const BUILD='Sprint 6B.30 Morning Brief + Wellness Source-of-Truth Repair';
const $=(selector,root=document)=>root.querySelector(selector);
const all=(selector,root=document)=>[...root.querySelectorAll(selector)];
const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0));

function localDate(){
  const now=new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}

function canonicalSoberDays(state=store.get()){
  const reset=state.sobriety?.lastReset;
  if(!reset)return 0;
  const start=new Date(`${reset}T00:00:00`);
  const today=new Date(`${localDate()}T00:00:00`);
  if(Number.isNaN(start.getTime())||Number.isNaN(today.getTime()))return 0;
  return Math.max(1,Math.floor((today-start)/86400000)+1);
}

function gymData(state=store.get()){
  const minutes=Math.max(0,Math.round(Number(state.gymMinutes)||0));
  const goal=Math.max(1,Math.round(Number(state.wellness?.gymGoalMinutes)||60));
  return {minutes,goal,pct:clamp(Math.round(minutes/goal*100),0,100)};
}

function morningData(state=store.get()){
  const sanctuary=state.sanctuary||{};
  const labels=Array.isArray(sanctuary.routines?.morning)&&sanctuary.routines.morning.length
    ?sanctuary.routines.morning.map(String)
    :['Make the bed','Open curtains','Kitchen refresh','Review today’s Top Three'];
  const completed=Array.isArray(sanctuary.completed?.morning)?sanctuary.completed.morning:[];
  const snapshot=Array.isArray(sanctuary.morningSnapshot?.items)?sanctuary.morningSnapshot.items:[];
  const total=Math.max(labels.length,completed.length,snapshot.length,Number(sanctuary.routineTotals?.morning)||0,1);
  const done=Array.from({length:total},(_,index)=>{
    if(index<completed.length)return Boolean(completed[index]);
    return Boolean(snapshot[index]?.done);
  }).filter(Boolean).length;
  return {done,total,pct:total?Math.round(done/total*100):0};
}

function syncSanctuaryMorningFromVisibleChecklist(){
  const boxes=all('#page input[data-ritual="morning"]');
  if(!boxes.length)return;
  const items=boxes.map((box,index)=>({
    label:box.closest('label')?.querySelector('span')?.textContent?.trim()||`Morning item ${index+1}`,
    done:Boolean(box.checked)
  }));
  const state=store.get();
  const existing=state.sanctuary?.morningSnapshot;
  if(existing?.date===localDate()&&JSON.stringify(existing.items||[])===JSON.stringify(items))return;
  store.mutate(draft=>{
    draft.sanctuary=draft.sanctuary||{};
    draft.sanctuary.completed=draft.sanctuary.completed||{};
    draft.sanctuary.routines=draft.sanctuary.routines||{};
    draft.sanctuary.routineTotals=draft.sanctuary.routineTotals||{};
    draft.sanctuary.completed.morning=items.map(item=>item.done);
    draft.sanctuary.routines.morning=items.map(item=>item.label);
    draft.sanctuary.routineTotals.morning=items.length;
    draft.sanctuary.morningSnapshot={date:localDate(),items};
  });
}

function findMetricCard(...labels){
  const wanted=labels.map(value=>value.toLowerCase());
  return all('#page .brief-metric-grid > .card').find(card=>wanted.includes(card.querySelector('.mini')?.textContent.trim().toLowerCase()));
}

function setWater(delta){
  store.mutate(state=>{state.water=clamp((Number(state.water)||0)+delta,0,8);});
}

function setGymMinutes(delta){
  store.mutate(state=>{
    state.wellness=state.wellness||{};
    state.wellness.gymDate=localDate();
    state.gymMinutes=Math.max(0,Math.round((Number(state.gymMinutes)||0)+delta));
  });
}

function renderBriefWater(){
  const card=findMetricCard('Water');
  if(!card)return;
  const value=clamp(store.get().water,0,8);
  card.className='card brief-water-6b30';
  card.innerHTML=`
    <div class="mini">Water</div>
    <div class="metric" data-water-count-630>${value}/8</div>
    <div class="bar"><span data-water-bar-630 style="width:${value/8*100}%"></span></div>
    <div class="button-row brief-water-actions-6b30">
      <button type="button" class="btn ghost" data-water-delta-630="-1" aria-label="Remove one glass of water">−</button>
      <button type="button" class="btn" data-water-delta-630="1" aria-label="Add one glass of water">Add water</button>
    </div>
    <button type="button" class="btn ghost" data-jump="wellness">Open Wellness Studio</button>`;
  card.querySelector('[data-water-delta-630="-1"]')?.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();setWater(-1);});
  card.querySelector('[data-water-delta-630="1"]')?.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();setWater(1);});
}

function renderBriefGym(){
  const card=findMetricCard('Movement','Gym time');
  if(!card)return;
  const gym=gymData();
  card.className='card brief-gym-6b30';
  card.innerHTML=`
    <div class="mini">Gym time</div>
    <div class="metric" data-brief-gym-count-630>${gym.minutes} min</div>
    <div class="bar"><span data-gym-bar-630 style="width:${gym.pct}%"></span></div>
    <strong data-brief-gym-goal-630>${gym.minutes} of ${gym.goal} minutes</strong>
    <small data-brief-gym-pct-630>${gym.pct}% of today’s goal</small>
    <button type="button" class="btn ghost" data-jump="wellness">Open Wellness Studio</button>`;
}

function findMorningCard(){
  return all('#page .card').find(card=>{
    const heading=card.querySelector('h3')?.textContent.trim();
    return heading==='Morning Routine'||heading==='Morning Reset';
  });
}

function renderMorningReset(){
  const card=findMorningCard();
  if(!card)return;
  const routine=morningData();
  card.className='card morning-routine-card morning-reset-6b30';
  card.innerHTML=`
    <div class="mini">Power on gently</div>
    <h3>Morning Reset</h3>
    <div class="routine-summary-number" data-morning-count-630>${routine.done} of ${routine.total}</div>
    <div class="bar"><span data-morning-bar-630 style="width:${routine.pct}%"></span></div>
    <p data-morning-copy-630>${routine.done} of ${routine.total} Sanctuary checklist items complete.</p>
    <button type="button" class="btn ghost" data-jump="sanctuary">Open Sanctuary</button>`;
}

function renderWellnessGym(){
  if(!$('#page h1')?.textContent.includes('Wellness Studio'))return;
  let card=$('#wellnessGymCard630')||$('#wellnessGymCard629')||$('#wellnessGymCard628');
  if(!card){
    card=document.createElement('article');
    const hydration=all('#page .card').find(node=>/Hydration/i.test(node.textContent||''));
    if(hydration)hydration.insertAdjacentElement('afterend',card);
    else $('#page .wellness-grid')?.append(card);
  }
  card.id='wellnessGymCard630';
  card.className='card wellness-gym-card-6b30';
  const gym=gymData();
  card.innerHTML=`
    <div class="section-title">
      <div><div class="eyebrow">Daily movement</div><h3>Gym Time</h3></div>
      <span class="pill" data-wellness-gym-pill-630>${gym.minutes} / ${gym.goal} min</span>
    </div>
    <div class="wellness-gym-number-6b30" data-wellness-gym-count-630>${gym.minutes}</div>
    <p class="muted">Minutes logged today</p>
    <div class="bar"><span data-gym-bar-630 style="width:${gym.pct}%"></span></div>
    <div class="button-row wellness-gym-actions-6b30">
      <button type="button" class="btn ghost" data-gym-delta-630="-15">− 15 min</button>
      <button type="button" class="btn ghost" data-gym-delta-630="-5">− 5 min</button>
      <button type="button" class="btn" data-gym-delta-630="5">＋ 5 min</button>
      <button type="button" class="btn" data-gym-delta-630="15">＋ 15 min</button>
    </div>
    <label>Today’s gym goal
      <div class="wellness-gym-goal-row-6b30">
        <input type="number" min="1" step="5" inputmode="numeric" value="${gym.goal}" data-gym-goal-input-630 aria-label="Daily gym goal in minutes">
        <button type="button" class="btn" data-save-gym-goal-630>Save goal</button>
      </div>
    </label>
    <div class="status" data-gym-status-630>${gym.pct>=100?'Today’s gym goal is complete.':'Use the controls above to log today’s gym time.'}</div>`;
  all('[data-gym-delta-630]',card).forEach(button=>button.addEventListener('click',event=>{
    event.preventDefault();event.stopPropagation();
    setGymMinutes(Number(button.getAttribute('data-gym-delta-630'))||0);
  }));
  card.querySelector('[data-save-gym-goal-630]')?.addEventListener('click',event=>{
    event.preventDefault();event.stopPropagation();
    const input=card.querySelector('[data-gym-goal-input-630]');
    const goal=Math.max(1,Math.round(Number(input?.value)||60));
    store.mutate(state=>{state.wellness=state.wellness||{};state.wellness.gymGoalMinutes=goal;});
    const status=card.querySelector('[data-gym-status-630]');
    if(status)status.textContent='Daily gym goal saved.';
  });
}

function renderCanonicalSobriety(){
  const days=canonicalSoberDays();
  // Wellness Studio tracker
  const tracker=$('#sobrietyTracker6B18')||all('#page .card').find(card=>/Sobriety Tracker/i.test(card.textContent||''));
  if(tracker&&$('#page h1')?.textContent.includes('Wellness Studio')){
    const pill=tracker.querySelector('.pill');
    const metric=tracker.querySelector('.metric');
    if(pill)pill.textContent=`${days} day${days===1?'':'s'}`;
    if(metric)metric.textContent=String(days);
  }
  // Approved dashboard layout: value only.
  const wellnessPanel=all('#page .dashboard-panel,#page .card').find(card=>/Wellness today/i.test(card.textContent||''));
  if(wellnessPanel){
    const target=all('.metric-row > span',wellnessPanel).find(span=>/Days sober|Gym min/i.test(span.textContent||''));
    if(target)target.innerHTML=`<b data-sober-days-630>${days}</b><small>Days sober</small>`;
  }
}

function updateVisibleValues(){
  const water=clamp(store.get().water,0,8);
  all('[data-water-count-630]').forEach(node=>node.textContent=`${water}/8`);
  all('[data-water-bar-630]').forEach(node=>node.style.width=`${water/8*100}%`);
  const gym=gymData();
  all('[data-brief-gym-count-630]').forEach(node=>node.textContent=`${gym.minutes} min`);
  all('[data-brief-gym-goal-630]').forEach(node=>node.textContent=`${gym.minutes} of ${gym.goal} minutes`);
  all('[data-brief-gym-pct-630]').forEach(node=>node.textContent=`${gym.pct}% of today’s goal`);
  all('[data-wellness-gym-count-630]').forEach(node=>node.textContent=String(gym.minutes));
  all('[data-wellness-gym-pill-630]').forEach(node=>node.textContent=`${gym.minutes} / ${gym.goal} min`);
  all('[data-gym-bar-630]').forEach(node=>node.style.width=`${gym.pct}%`);
  const morning=morningData();
  all('[data-morning-count-630]').forEach(node=>node.textContent=`${morning.done} of ${morning.total}`);
  all('[data-morning-bar-630]').forEach(node=>node.style.width=`${morning.pct}%`);
  all('[data-morning-copy-630]').forEach(node=>node.textContent=`${morning.done} of ${morning.total} Sanctuary checklist items complete.`);
  renderCanonicalSobriety();
}

function bindGlobalRuntime(){
  if(document.documentElement.dataset.sprint630Bound)return;
  document.documentElement.dataset.sprint630Bound='true';
  // Fallback delegated controls survive any older delayed rerender.
  document.addEventListener('click',event=>{
    const water=event.target.closest('[data-water-delta-630]');
    if(water){event.preventDefault();event.stopImmediatePropagation();setWater(Number(water.getAttribute('data-water-delta-630'))||0);return;}
    const gym=event.target.closest('[data-gym-delta-630]');
    if(gym){event.preventDefault();event.stopImmediatePropagation();setGymMinutes(Number(gym.getAttribute('data-gym-delta-630'))||0);return;}
  },true);
  document.addEventListener('change',event=>{
    if(event.target.matches('#page input[data-ritual="morning"]')){
      queueMicrotask(syncSanctuaryMorningFromVisibleChecklist);
      setTimeout(syncSanctuaryMorningFromVisibleChecklist,0);
    }
  },true);
  window.addEventListener('kc:state',updateVisibleValues);
}

function renderRoute(id){
  if(id==='sanctuary')syncSanctuaryMorningFromVisibleChecklist();
  if(id==='intelligence'){
    renderBriefWater();
    renderBriefGym();
    renderMorningReset();
  }
  if(id==='wellness'){
    renderWellnessGym();
    renderCanonicalSobriety();
  }
  if(id==='dashboard')renderCanonicalSobriety();
}

export async function enhanceSprint6B30(id){
  const badge=$('#kcBuildStatus b');
  if(badge)badge.textContent=BUILD;
  bindGlobalRuntime();
  renderRoute(id);
  requestAnimationFrame(()=>renderRoute(id));
  setTimeout(()=>renderRoute(id),220);
  setTimeout(()=>renderRoute(id),500);
}
