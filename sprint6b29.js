import {store} from './store.js';

const BUILD='Sprint 6B.29 Morning Brief + Wellness Runtime Corrections';
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

function normalizeMorningSnapshot(state=store.get()){
  const sanctuary=state.sanctuary||{};
  const snapshot=sanctuary.morningSnapshot;
  if(snapshot&&Array.isArray(snapshot.items)&&snapshot.items.length){
    const items=snapshot.items.map(item=>({label:String(item?.label||''),done:Boolean(item?.done)}));
    return {items,total:items.length,done:items.filter(item=>item.done).length};
  }
  const labels=Array.isArray(sanctuary.routines?.morning)&&sanctuary.routines.morning.length
    ?sanctuary.routines.morning.map(String)
    :['Make the bed','Open curtains','Kitchen refresh','Review today’s Top Three'];
  const completed=Array.isArray(sanctuary.completed?.morning)?sanctuary.completed.morning:[];
  const total=Math.max(labels.length,completed.length,Number(sanctuary.routineTotals?.morning)||0,1);
  const items=Array.from({length:total},(_,index)=>({label:labels[index]||`Morning item ${index+1}`,done:Boolean(completed[index])}));
  return {items,total,done:items.filter(item=>item.done).length};
}

function morningData(state=store.get()){
  const data=normalizeMorningSnapshot(state);
  return {...data,pct:data.total?Math.round(data.done/data.total*100):0};
}

function captureMorningFromSanctuary(){
  const boxes=all('#page [data-ritual="morning"]');
  if(!boxes.length)return;
  const items=boxes.map((box,index)=>({
    label:box.closest('label')?.querySelector('span')?.textContent?.trim()||`Morning item ${index+1}`,
    done:Boolean(box.checked)
  }));
  const current=store.get().sanctuary?.morningSnapshot;
  const nextSig=JSON.stringify(items);
  const currentSig=JSON.stringify(current?.items||[]);
  if(nextSig===currentSig&&current?.date===localDate())return;
  store.mutate(state=>{
    state.sanctuary=state.sanctuary||{};
    state.sanctuary.completed=state.sanctuary.completed||{};
    state.sanctuary.completed.morning=items.map(item=>item.done);
    state.sanctuary.routines=state.sanctuary.routines||{};
    state.sanctuary.routines.morning=items.map(item=>item.label);
    state.sanctuary.routineTotals={...(state.sanctuary.routineTotals||{}),morning:items.length};
    state.sanctuary.morningSnapshot={date:localDate(),items};
  });
}

function findBriefMetric(label){
  return all('#page .brief-metric-grid > .card').find(card=>card.querySelector('.mini')?.textContent.trim().toLowerCase()===label.toLowerCase());
}

function renderWaterCard(){
  const card=findBriefMetric('Water');
  if(!card)return;
  const value=clamp(store.get().water,0,8);
  card.className='card brief-water-6b29';
  card.innerHTML=`
    <div class="mini">Water</div>
    <div class="metric" data-water-count-629>${value}/8</div>
    <div class="bar"><span data-water-bar-629 style="width:${value/8*100}%"></span></div>
    <div class="brief-water-actions-6b29">
      <button type="button" class="btn ghost" data-water-step-629="-1" aria-label="Remove one glass of water">−</button>
      <button type="button" class="btn" data-water-step-629="1" aria-label="Add one glass of water">＋</button>
    </div>
    <button type="button" class="btn ghost brief-open-wellness-6b29" data-jump="wellness">Open Wellness Studio</button>`;
}

function renderBriefGym(){
  const card=findBriefMetric('Movement')||findBriefMetric('Gym time');
  if(!card)return;
  const gym=gymData();
  card.className='card brief-gym-6b29';
  card.innerHTML=`
    <div class="mini">Gym time</div>
    <div class="metric" data-brief-gym-count-629>${gym.minutes} min</div>
    <div class="bar"><span data-gym-bar-629 style="width:${gym.pct}%"></span></div>
    <strong data-brief-gym-goal-629>${gym.minutes} of ${gym.goal} minutes</strong>
    <small data-brief-gym-pct-629>${gym.pct}% of today’s goal</small>
    <button type="button" class="btn ghost" data-jump="wellness">Open Wellness Studio</button>`;
}

function findMorningCard(){
  return all('#page .card').find(card=>card.querySelector('h3')?.textContent.trim()==='Morning Routine');
}

function renderMorningCard(){
  const card=findMorningCard();
  if(!card)return;
  const routine=morningData();
  card.className='card morning-routine-card morning-routine-6b29';
  card.innerHTML=`
    <div class="mini">Power on gently</div>
    <h3>Morning Routine</h3>
    <div class="routine-summary-number" data-morning-count-629>${routine.done} of ${routine.total}</div>
    <div class="bar"><span data-morning-bar-629 style="width:${routine.pct}%"></span></div>
    <p data-morning-copy-629>${routine.done} completed from Sanctuary’s ${routine.total}-item Morning Reset.</p>
    <button type="button" class="btn ghost" data-jump="sanctuary">Open Sanctuary</button>`;
}

function renderWellnessGym(){
  if(!$('#page h1')?.textContent.includes('Wellness Studio'))return;
  let card=$('#wellnessGymCard629')||$('#wellnessGymCard628');
  if(!card){
    card=document.createElement('article');
    const water=all('#page .card').find(node=>/Daily hydration/i.test(node.textContent||''));
    if(water)water.insertAdjacentElement('afterend',card);
    else $('#page .pagehead')?.insertAdjacentElement('afterend',card);
  }
  card.id='wellnessGymCard629';
  card.className='card wellness-gym-card-6b29';
  const gym=gymData();
  card.innerHTML=`
    <div class="section-title">
      <div><div class="eyebrow">Daily movement</div><h3>Gym Time</h3></div>
      <span class="pill" data-wellness-gym-pill-629>${gym.minutes} / ${gym.goal} min</span>
    </div>
    <div class="wellness-gym-number-6b29" data-wellness-gym-count-629>${gym.minutes}</div>
    <p class="muted">Minutes logged today</p>
    <div class="bar"><span data-gym-bar-629 style="width:${gym.pct}%"></span></div>
    <div class="wellness-gym-actions-6b29">
      <button type="button" class="btn ghost" data-gym-step-629="-5">− 5 min</button>
      <button type="button" class="btn" data-gym-step-629="5">＋ 5 min</button>
      <button type="button" class="btn ghost" data-gym-step-629="-15">− 15 min</button>
      <button type="button" class="btn" data-gym-step-629="15">＋ 15 min</button>
    </div>
    <label class="wellness-gym-goal-6b29">Today’s gym goal
      <div class="wellness-gym-goal-row-6b29">
        <input type="number" min="1" step="5" inputmode="numeric" value="${gym.goal}" data-gym-goal-input-629 aria-label="Daily gym goal in minutes">
        <button type="button" class="btn" data-save-gym-goal-629>Save goal</button>
      </div>
    </label>
    <div class="status" data-gym-status-629>${gym.pct>=100?'Today’s gym goal is complete.':'Use the buttons above to log today’s gym time.'}</div>`;
}

function updateWater(){
  const value=clamp(store.get().water,0,8);
  all('[data-water-count-629]').forEach(node=>node.textContent=`${value}/8`);
  all('[data-water-bar-629]').forEach(node=>node.style.width=`${value/8*100}%`);
}

function updateGym(){
  const gym=gymData();
  all('[data-brief-gym-count-629]').forEach(node=>node.textContent=`${gym.minutes} min`);
  all('[data-brief-gym-goal-629]').forEach(node=>node.textContent=`${gym.minutes} of ${gym.goal} minutes`);
  all('[data-brief-gym-pct-629]').forEach(node=>node.textContent=`${gym.pct}% of today’s goal`);
  all('[data-gym-bar-629]').forEach(node=>node.style.width=`${gym.pct}%`);
  all('[data-wellness-gym-count-629]').forEach(node=>node.textContent=String(gym.minutes));
  all('[data-wellness-gym-pill-629]').forEach(node=>node.textContent=`${gym.minutes} / ${gym.goal} min`);
  all('[data-gym-status-629]').forEach(node=>node.textContent=gym.pct>=100?'Today’s gym goal is complete.':'Use the buttons above to log today’s gym time.');
}

function updateMorning(){
  const routine=morningData();
  all('[data-morning-count-629]').forEach(node=>node.textContent=`${routine.done} of ${routine.total}`);
  all('[data-morning-bar-629]').forEach(node=>node.style.width=`${routine.pct}%`);
  all('[data-morning-copy-629]').forEach(node=>node.textContent=`${routine.done} completed from Sanctuary’s ${routine.total}-item Morning Reset.`);
}

function removeDashboardVines(){
  if(!$('#page .dashboard-grid'))return;
  all('#page .dashboard-grid .card.luxe').forEach(card=>card.classList.add('no-vine-6b29'));
}

function bindRuntime(){
  if(document.documentElement.dataset.sprint629Bound)return;
  document.documentElement.dataset.sprint629Bound='true';
  document.addEventListener('click',event=>{
    const water=event.target.closest('[data-water-step-629]');
    if(water){
      event.preventDefault();
      event.stopImmediatePropagation();
      const delta=Number(water.getAttribute('data-water-step-629'))||0;
      store.mutate(state=>{state.water=clamp((Number(state.water)||0)+delta,0,8);});
      updateWater();
      return;
    }
    const gym=event.target.closest('[data-gym-step-629]');
    if(gym){
      event.preventDefault();
      event.stopImmediatePropagation();
      const delta=Number(gym.getAttribute('data-gym-step-629'))||0;
      store.mutate(state=>{
        state.wellness=state.wellness||{};
        state.wellness.gymDate=localDate();
        state.gymMinutes=Math.max(0,Math.round((Number(state.gymMinutes)||0)+delta));
      });
      updateGym();
      return;
    }
    const save=event.target.closest('[data-save-gym-goal-629]');
    if(save){
      event.preventDefault();
      event.stopImmediatePropagation();
      const input=$('[data-gym-goal-input-629]');
      const goal=Math.max(1,Math.round(Number(input?.value)||60));
      store.mutate(state=>{
        state.wellness=state.wellness||{};
        state.wellness.gymGoalMinutes=goal;
      });
      updateGym();
      const status=$('[data-gym-status-629]');
      if(status)status.textContent='Daily gym goal saved.';
    }
  },true);
  document.addEventListener('change',event=>{
    if(event.target.matches('#page [data-ritual="morning"]')){
      queueMicrotask(captureMorningFromSanctuary);
      setTimeout(captureMorningFromSanctuary,0);
    }
  },true);
  window.addEventListener('kc:state',()=>{
    updateWater();
    updateGym();
    updateMorning();
  });
}

export async function enhanceSprint6B29(id){
  const badge=$('#kcBuildStatus b');
  if(badge)badge.textContent=BUILD;
  bindRuntime();
  if(id==='sanctuary'){
    captureMorningFromSanctuary();
    requestAnimationFrame(captureMorningFromSanctuary);
    setTimeout(captureMorningFromSanctuary,120);
  }
  if(id==='intelligence'){
    renderWaterCard();
    renderBriefGym();
    renderMorningCard();
  }
  if(id==='wellness')renderWellnessGym();
  if(id==='dashboard')removeDashboardVines();
  requestAnimationFrame(()=>{
    if(id==='intelligence'){renderWaterCard();renderBriefGym();renderMorningCard();}
    if(id==='wellness')renderWellnessGym();
    if(id==='dashboard')removeDashboardVines();
  });
  setTimeout(()=>{
    if(id==='intelligence'){renderWaterCard();renderBriefGym();renderMorningCard();}
    if(id==='wellness')renderWellnessGym();
    if(id==='dashboard')removeDashboardVines();
  },180);
}
