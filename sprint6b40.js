import {store} from './store.js';

const BUILD='Sprint 6B.40 Final Corrective Shared-State Lock';
const $=(selector,root=document)=>root.querySelector(selector);
const all=(selector,root=document)=>[...root.querySelectorAll(selector)];
const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0));
const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const pageTitle=()=>($('#page h1')?.textContent||'').trim();

function shared(){
  const state=store.get();
  const water=clamp(state.water,0,8);
  const minutes=Math.max(0,Math.round(Number(state.gymMinutes)||0));
  const goal=Math.max(1,Math.round(Number(state.wellness?.gymGoalMinutes)||60));
  const percent=clamp(Math.round(minutes/goal*100),0,100);
  return {state,water,minutes,goal,percent};
}

// This is the same inclusive reset-date calculation used by the approved dashboard.
function dashboardSobrietyDays(state=store.get()){
  const reset=state.sobriety?.lastReset;
  if(!reset)return 0;
  const start=new Date(`${reset}T00:00:00`);
  const today=new Date(`${todayKey()}T00:00:00`);
  if(Number.isNaN(start.getTime())||Number.isNaN(today.getTime()))return 0;
  return Math.max(1,Math.floor((today-start)/86400000)+1);
}

function morningReset(state=store.get()){
  const sanctuary=state.sanctuary||{};
  const editor=sanctuary.routines?.['morning-reset'];
  if(Array.isArray(editor?.items)&&editor.items.length){
    return {done:editor.items.filter(item=>Boolean(item?.done??item?.completed??item?.checked)).length,total:editor.items.length};
  }
  const labels=Array.isArray(sanctuary.routines?.morning)?sanctuary.routines.morning:[];
  const completed=Array.isArray(sanctuary.completed?.morning)?sanctuary.completed.morning:[];
  const snapshot=Array.isArray(sanctuary.morningSnapshot?.items)?sanctuary.morningSnapshot.items:[];
  const total=Math.max(labels.length,completed.length,snapshot.length,Number(sanctuary.routineTotals?.morning)||0,1);
  const done=Array.from({length:total},(_,index)=>index<completed.length?Boolean(completed[index]):Boolean(snapshot[index]?.done??snapshot[index]?.completed??snapshot[index]?.checked)).filter(Boolean).length;
  return {done,total};
}

function captureSanctuary(){
  if(pageTitle()!=='Sanctuary')return;
  const boxes=all('#page input[data-ritual="morning"]');
  if(!boxes.length)return;
  const items=boxes.map((box,index)=>({
    label:box.closest('label')?.querySelector('span')?.textContent?.trim()||`Morning item ${index+1}`,
    done:Boolean(box.checked)
  }));
  const old=store.get().sanctuary?.morningSnapshot;
  if(old?.date===todayKey()&&JSON.stringify(old.items||[])===JSON.stringify(items))return;
  store.mutate(state=>{
    state.sanctuary=state.sanctuary||{};
    state.sanctuary.completed=state.sanctuary.completed||{};
    state.sanctuary.routines=state.sanctuary.routines||{};
    state.sanctuary.routineTotals=state.sanctuary.routineTotals||{};
    state.sanctuary.completed.morning=items.map(item=>item.done);
    state.sanctuary.routines.morning=items.map(item=>item.label);
    state.sanctuary.routineTotals.morning=items.length;
    state.sanctuary.morningSnapshot={date:todayKey(),items};
  });
}

function routeTo(route,router=window.__keyCollectiveRouter){
  if(router?.go){router.go(route);return;}
  $(`.nav-button[data-route="${route}"]`)?.click();
}

function briefCard(pattern){
  return all('#page .brief-metric-grid > .card').find(card=>pattern.test((card.querySelector('.mini')?.textContent||card.querySelector('h3')?.textContent||'').trim()))
    ||all('#page .card').find(card=>pattern.test((card.querySelector('.mini')?.textContent||card.querySelector('h3')?.textContent||'').trim()));
}

function renderBrief(){
  if(pageTitle()!=='Morning Brief')return;
  const water=briefCard(/^Water$/i);
  if(water){
    water.innerHTML=`<div class="mini">Water</div><div class="metric" data-kc40-water></div><div class="bar"><span data-kc40-water-bar></span></div><div class="button-row"><button type="button" class="btn ghost" data-kc40-action="water" data-delta="-1">− Remove</button><button type="button" class="btn" data-kc40-action="water" data-delta="1">＋ Add</button></div><button type="button" class="btn ghost" data-kc40-route="wellness">Open Wellness Studio</button>`;
  }
  const movement=briefCard(/^(Movement|Gym Time)$/i);
  if(movement){
    movement.innerHTML=`<div class="mini">Movement</div><div class="metric" data-kc40-brief-minutes></div><div class="bar"><span data-kc40-gym-bar></span></div><strong data-kc40-brief-goal></strong><small data-kc40-brief-percent></small><button type="button" class="btn ghost" data-kc40-route="wellness">Open Wellness Studio</button>`;
  }
  const routine=all('#page .card').find(card=>/^(Morning Routine|Morning Reset)$/i.test((card.querySelector('h3')?.textContent||'').trim())||/Power on gently/i.test(card.textContent||''));
  if(routine){
    routine.innerHTML=`<div class="mini">Power on gently</div><h3>Morning Reset</h3><div class="routine-summary-number" data-kc40-morning></div><div class="bar"><span data-kc40-morning-bar></span></div><p data-kc40-morning-copy></p><button type="button" class="btn ghost" data-kc40-route="sanctuary">Open Sanctuary</button>`;
  }
  paint();
}

function renderWellness(){
  if(pageTitle()!=='Wellness Studio')return;
  const page=$('#page');
  const water=all('.card',page).find(card=>/^Water$/i.test((card.querySelector('h3')?.textContent||'').trim()));
  if(water){
    const metric=water.querySelector('.metric');
    if(metric)metric.setAttribute('data-kc40-water','');
    all('button',water).forEach(button=>button.remove());
    all('[data-kc40-water-controls]',water).forEach(node=>node.remove());
    water.insertAdjacentHTML('beforeend',`<div class="row wrap" data-kc40-water-controls><button type="button" class="btn ghost" data-kc40-action="water" data-delta="-1">− Remove</button><button type="button" class="btn" data-kc40-action="water" data-delta="1">＋ Add</button><button type="button" class="btn ghost" data-kc40-action="water-reset">Reset</button></div>`);
  }

  let gym=$('#wellnessGym640')||all('.card',page).find(card=>/^(Gym|Gym Time)$/i.test((card.querySelector('h3')?.textContent||'').trim()));
  all('.card',page).filter(card=>card!==gym&&/^(Gym|Gym Time)$/i.test((card.querySelector('h3')?.textContent||'').trim())).forEach(card=>card.remove());
  if(!gym){gym=document.createElement('article');water?.insertAdjacentElement('afterend',gym);if(!water)page.append(gym)}
  gym.id='wellnessGym640';
  gym.className='card gradient-card wellness-gym-635';
  gym.innerHTML=`<div class="section-title"><div><div class="eyebrow">Daily movement</div><h3>Gym Time</h3></div><span class="pill" data-kc40-gym-pill></span></div><div class="metric" data-kc40-gym-minutes></div><p class="muted">Minutes logged today</p><div class="bar"><span data-kc40-gym-bar></span></div><div class="controls-635 gym-controls-635"><button type="button" class="btn ghost" data-kc40-action="gym" data-delta="-15">− 15 min</button><button type="button" class="btn ghost" data-kc40-action="gym" data-delta="-5">− 5 min</button><button type="button" class="btn" data-kc40-action="gym" data-delta="5">＋ 5 min</button><button type="button" class="btn" data-kc40-action="gym" data-delta="15">＋ 15 min</button></div><label>Today’s gym goal<div class="goal-row-635"><input class="input" type="number" min="1" step="5" inputmode="numeric" data-kc40-gym-goal><button type="button" class="btn" data-kc40-action="gym-goal">Save goal</button></div></label><div class="status" data-kc40-gym-status>Gym time syncs directly to Morning Brief.</div>`;
  paint();
}

function paint(){
  const {water,minutes,goal,percent}=shared();
  const morning=morningReset();
  const morningPercent=morning.total?clamp(Math.round(morning.done/morning.total*100),0,100):0;
  all('[data-kc40-water]').forEach(node=>node.textContent=`${water}/8`);
  all('[data-kc40-water-bar]').forEach(node=>node.style.width=`${water/8*100}%`);
  all('[data-kc40-gym-minutes]').forEach(node=>node.textContent=`${minutes} min`);
  all('[data-kc40-gym-pill]').forEach(node=>node.textContent=`${minutes} / ${goal} min`);
  all('[data-kc40-gym-bar]').forEach(node=>node.style.width=`${percent}%`);
  all('[data-kc40-gym-goal]').forEach(node=>{if(document.activeElement!==node)node.value=String(goal)});
  all('[data-kc40-brief-minutes]').forEach(node=>node.textContent=`${minutes} min`);
  all('[data-kc40-brief-goal]').forEach(node=>node.textContent=`${minutes} of ${goal} minutes`);
  all('[data-kc40-brief-percent]').forEach(node=>node.textContent=`${percent}% of today’s goal`);
  all('[data-kc40-morning]').forEach(node=>node.textContent=`${morning.done} of ${morning.total}`);
  all('[data-kc40-morning-bar]').forEach(node=>node.style.width=`${morningPercent}%`);
  all('[data-kc40-morning-copy]').forEach(node=>node.textContent=`${morning.done} of ${morning.total} Sanctuary Morning Reset items complete.`);

  if(pageTitle()==='Wellness Studio'){
    const days=dashboardSobrietyDays();
    const tracker=$('#sobrietyTracker6B18')||all('#page .card').find(card=>/Sobriety Tracker/i.test(card.textContent||''));
    if(tracker){
      const metric=tracker.querySelector('.metric');
      const pill=tracker.querySelector('.pill');
      if(metric)metric.textContent=String(days);
      if(pill)pill.textContent=`${days} day${days===1?'':'s'}`;
    }
  }
}

function act(control){
  const action=control.dataset.kc40Action;
  if(action==='water'){
    const delta=Number(control.dataset.delta)||0;
    store.mutate(state=>{state.water=clamp((Number(state.water)||0)+delta,0,8)});
  }else if(action==='water-reset'){
    store.mutate(state=>{state.water=0});
  }else if(action==='gym'){
    const delta=Number(control.dataset.delta)||0;
    store.mutate(state=>{state.wellness=state.wellness||{};state.wellness.gymDate=todayKey();state.gymMinutes=Math.max(0,Math.round(Number(state.gymMinutes)||0)+delta)});
  }else if(action==='gym-goal'){
    const goal=Math.max(1,Math.round(Number($('[data-kc40-gym-goal]')?.value)||60));
    store.mutate(state=>{state.wellness=state.wellness||{};state.wellness.gymGoalMinutes=goal});
    const status=$('[data-kc40-gym-status]');if(status)status.textContent=`Daily gym goal saved at ${goal} minutes and synced to Morning Brief.`;
  }
}

let bound=false;
function bind(router){
  if(bound)return;bound=true;
  document.addEventListener('click',event=>{
    const route=event.target.closest('[data-kc40-route]');
    if(route){event.preventDefault();event.stopImmediatePropagation();routeTo(route.dataset.kc40Route,router);return;}
    const control=event.target.closest('[data-kc40-action]');
    if(!control)return;
    event.preventDefault();event.stopImmediatePropagation();act(control);paint();
  },true);
  document.addEventListener('change',event=>{
    if(event.target.matches('#page input[data-ritual="morning"]'))setTimeout(captureSanctuary,0);
  },true);
  window.addEventListener('kc:state',paint);
}

export async function enhanceSprint6B40(id,router){
  bind(router);
  if(id==='sanctuary'){captureSanctuary();requestAnimationFrame(captureSanctuary)}
  if(id==='intelligence')renderBrief();
  if(id==='wellness')renderWellness();
  const badge=$('#kcBuildStatus b');if(badge)badge.textContent=BUILD;
}
