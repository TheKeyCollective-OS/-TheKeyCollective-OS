import {store} from './store.js';

const BUILD='Sprint 6B.38 Shared State Finalization';
const $=(s,r=document)=>r.querySelector(s);
const all=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,min,max)=>Math.min(max,Math.max(min,Number(v)||0));
const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const pageTitle=()=>($('#page h1')?.textContent||'').trim();
const isPage=name=>pageTitle()===name;

function go(route){
  const router=window.__keyCollectiveRouter;
  if(router?.go){router.go(route);return;}
  const nav=$(`.nav-button[data-route="${route}"]`);
  if(nav){nav.click();return;}
  location.hash=`#${route}`;
}

function gymData(){
  const s=store.get();
  const minutes=Math.max(0,Math.round(Number(s.gymMinutes)||0));
  const goal=Math.max(1,Math.round(Number(s.wellness?.gymGoalMinutes)||60));
  return {minutes,goal,pct:clamp(Math.round(minutes/goal*100),0,100)};
}

// Use the exact day-zero convention already used by the locked dashboard.
function soberDays(){
  const reset=store.get().sobriety?.lastReset;
  if(!reset)return 0;
  const start=new Date(`${reset}T00:00:00`);
  const today=new Date(`${todayKey()}T00:00:00`);
  if(Number.isNaN(start.getTime())||Number.isNaN(today.getTime()))return 0;
  return Math.max(0,Math.floor((today-start)/86400000));
}

function morningData(){
  const sanctuary=store.get().sanctuary||{};
  const editor=sanctuary.routines?.['morning-reset'];
  if(Array.isArray(editor?.items)){
    return {
      done:editor.items.filter(item=>Boolean(item?.done??item?.completed??item?.checked)).length,
      total:editor.items.length
    };
  }
  const snapshot=Array.isArray(sanctuary.morningSnapshot?.items)?sanctuary.morningSnapshot.items:[];
  const labels=Array.isArray(sanctuary.routines?.morning)?sanctuary.routines.morning:[];
  const completed=Array.isArray(sanctuary.completed?.morning)?sanctuary.completed.morning:[];
  const total=Math.max(snapshot.length,labels.length,completed.length,Number(sanctuary.routineTotals?.morning)||0,1);
  const done=Array.from({length:total},(_,index)=>{
    // The live checklist is canonical; snapshot is only a fallback.
    if(index<completed.length)return Boolean(completed[index]);
    return Boolean(snapshot[index]?.done??snapshot[index]?.completed??snapshot[index]?.checked);
  }).filter(Boolean).length;
  return {done,total};
}

function findMetricCard(labels){
  const wanted=labels.map(x=>x.toLowerCase());
  return all('#page .brief-metric-grid > .card').find(card=>{
    const label=(card.querySelector('.mini')?.textContent||card.querySelector('h3')?.textContent||'').trim().toLowerCase();
    return wanted.includes(label);
  })||all('#page .card').find(card=>{
    const label=(card.querySelector('.mini')?.textContent||card.querySelector('h3')?.textContent||'').trim().toLowerCase();
    return wanted.includes(label);
  });
}

function renderMorningBrief(){
  if(!isPage('Morning Brief'))return;
  const page=$('#page');
  if(!page)return;

  const water=findMetricCard(['Water']);
  if(water){
    water.className='card brief-water-638';
    water.dataset.owner638='water';
    water.innerHTML=`
      <div class="mini">Water</div>
      <div class="metric" data-brief-water-638></div>
      <div class="bar"><span data-brief-water-bar-638></span></div>
      <div class="button-row brief-water-actions-638">
        <button type="button" class="btn ghost" data-action-638="water" data-delta="-1">− Remove</button>
        <button type="button" class="btn" data-action-638="water" data-delta="1">＋ Add</button>
      </div>
      <button type="button" class="btn ghost" data-route-638="wellness">Open Wellness Studio</button>`;
  }

  const movement=findMetricCard(['Movement','Gym time','Gym Time']);
  if(movement){
    movement.className='card brief-gym-638';
    movement.dataset.owner638='gym-summary';
    movement.innerHTML=`
      <div class="mini">Movement</div>
      <div class="metric" data-brief-gym-638></div>
      <div class="bar"><span data-brief-gym-bar-638></span></div>
      <strong data-brief-gym-copy-638></strong>
      <small data-brief-gym-pct-638></small>
      <button type="button" class="btn ghost" data-route-638="wellness">Open Wellness Studio</button>`;
  }

  let routine=all('#page .card').find(card=>{
    const h=(card.querySelector('h3')?.textContent||'').trim();
    return /^(Morning Routine|Morning Reset)$/i.test(h)||/Power on gently/i.test(card.textContent||'');
  });
  if(!routine){
    routine=document.createElement('article');
    ($('#page .intelligence-grid')||page).prepend(routine);
  }
  // Remove any duplicate stale Morning Routine / Reset card.
  all('#page .card').filter(card=>card!==routine).forEach(card=>{
    const h=(card.querySelector('h3')?.textContent||'').trim();
    if(/^(Morning Routine|Morning Reset)$/i.test(h)||/Power on gently/i.test(card.textContent||''))card.remove();
  });
  routine.className='card morning-reset-638';
  routine.dataset.owner638='morning-reset';
  routine.innerHTML=`
    <div class="mini">Power on gently</div>
    <h3>Morning Reset</h3>
    <div class="routine-summary-number" data-morning-value-638></div>
    <div class="bar"><span data-morning-bar-638></span></div>
    <p data-morning-copy-638></p>
    <button type="button" class="btn ghost" data-route-638="sanctuary">Open Sanctuary</button>`;

  paintMorningBrief();
}

function paintMorningBrief(){
  if(!isPage('Morning Brief'))return;
  const water=clamp(store.get().water,0,8);
  const gym=gymData();
  const morning=morningData();
  const morningPct=morning.total?clamp(Math.round(morning.done/morning.total*100),0,100):0;
  all('[data-brief-water-638]').forEach(n=>n.textContent=`${water}/8`);
  all('[data-brief-water-bar-638]').forEach(n=>n.style.width=`${water/8*100}%`);
  all('[data-brief-gym-638]').forEach(n=>n.textContent=`${gym.minutes} min`);
  all('[data-brief-gym-bar-638]').forEach(n=>n.style.width=`${gym.pct}%`);
  all('[data-brief-gym-copy-638]').forEach(n=>n.textContent=`${gym.minutes} of ${gym.goal} minutes`);
  all('[data-brief-gym-pct-638]').forEach(n=>n.textContent=`${gym.pct}% of today’s goal`);
  all('[data-morning-value-638]').forEach(n=>n.textContent=`${morning.done} of ${morning.total}`);
  all('[data-morning-bar-638]').forEach(n=>n.style.width=`${morningPct}%`);
  all('[data-morning-copy-638]').forEach(n=>n.textContent=`${morning.done} of ${morning.total} Sanctuary Morning Reset items complete.`);
}

function renderWellness(){
  if(!isPage('Wellness Studio'))return;
  const page=$('#page');
  if(!page)return;

  const tracker=$('#sobrietyTracker6B18')||all('.card',page).find(c=>/Sobriety Tracker/i.test(c.textContent||''));
  if(tracker){
    const days=soberDays();
    const metric=tracker.querySelector('.metric');
    const pill=tracker.querySelector('.pill');
    if(metric)metric.textContent=String(days);
    if(pill)pill.textContent=`${days} day${days===1?'':'s'}`;
  }

  // Preserve the approved working Sprint 6B.37 Gym Time card unchanged.
  let gym=$('#wellnessGym638')||$('#wellnessGym637');
  const candidates=all('.card',page).filter(c=>{
    const h=(c.querySelector('h3')?.textContent||'').trim();
    return /^(Gym|Gym Time)$/i.test(h)||c.id?.startsWith('wellnessGym')||/wellness-gym/i.test(c.className||'');
  });
  if(!gym)gym=candidates[0]||null;
  candidates.forEach(c=>{if(c!==gym)c.remove()});
  if(!gym){
    gym=document.createElement('article');
    gym.className='card gradient-card';
    const water=all('.card',page).find(c=>/^Water$/i.test((c.querySelector('h3')?.textContent||'').trim()));
    (water||page.lastElementChild)?.insertAdjacentElement(water?'afterend':'beforebegin',gym);
  }
  gym.id='wellnessGym638';
  gym.innerHTML=`
    <div class="section-title"><div><div class="eyebrow">Daily movement</div><h3>Gym Time</h3></div><span class="pill" data-gym-pill-638></span></div>
    <div class="metric" data-gym-value-638></div>
    <p class="muted">Minutes logged today</p>
    <div class="bar"><span data-gym-bar-638></span></div>
    <div class="controls-635 gym-controls-635">
      <button type="button" class="btn ghost" data-action-638="gym" data-delta="-15">− 15 min</button>
      <button type="button" class="btn ghost" data-action-638="gym" data-delta="-5">− 5 min</button>
      <button type="button" class="btn" data-action-638="gym" data-delta="5">＋ 5 min</button>
      <button type="button" class="btn" data-action-638="gym" data-delta="15">＋ 15 min</button>
    </div>
    <label>Today’s gym goal<div class="goal-row-635"><input class="input" type="number" min="1" step="5" inputmode="numeric" data-gym-goal-638><button type="button" class="btn" data-action-638="gym-goal">Save goal</button></div></label>
    <div class="status" data-gym-status-638>Gym time syncs directly to Morning Brief.</div>`;

  const water=all('.card',page).find(c=>/^Water$/i.test((c.querySelector('h3')?.textContent||'').trim()));
  if(water){
    water.dataset.owner638='water';
    const metric=water.querySelector('.metric');
    if(metric)metric.dataset.wellnessWater638='';
    // Remove every legacy control so only one reliable control set remains.
    all('button',water).forEach(button=>button.remove());
    all('[data-water-controls-637],[data-water-controls-638]',water).forEach(node=>node.remove());
    const controls=document.createElement('div');
    controls.dataset.waterControls638='';
    controls.className='row wrap';
    controls.innerHTML=`<button type="button" class="btn ghost" data-action-638="water" data-delta="-1">− Glass</button><button type="button" class="btn" data-action-638="water" data-delta="1">＋ Glass</button><button type="button" class="btn ghost" data-action-638="water-reset">Reset</button>`;
    water.append(controls);
  }
  paintWellness();
  const badge=$('#kcBuildStatus b');if(badge)badge.textContent=BUILD;
}

function paintWellness(){
  if(!isPage('Wellness Studio'))return;
  const water=clamp(store.get().water,0,8);
  const gym=gymData();
  all('[data-wellness-water-638]').forEach(n=>n.textContent=`${water}/8`);
  all('[data-gym-value-638]').forEach(n=>n.textContent=`${gym.minutes} min`);
  all('[data-gym-pill-638]').forEach(n=>n.textContent=`${gym.minutes} / ${gym.goal} min`);
  all('[data-gym-bar-638]').forEach(n=>n.style.width=`${gym.pct}%`);
  all('[data-gym-goal-638]').forEach(n=>{if(document.activeElement!==n)n.value=String(gym.goal)});
  const tracker=$('#sobrietyTracker6B18')||all('#page .card').find(c=>/Sobriety Tracker/i.test(c.textContent||''));
  if(tracker){
    const days=soberDays();
    const metric=tracker.querySelector('.metric');
    const pill=tracker.querySelector('.pill');
    if(metric)metric.textContent=String(days);
    if(pill)pill.textContent=`${days} day${days===1?'':'s'}`;
  }
}

function handleClick(event){
  const route=event.target.closest('[data-route-638]');
  if(route){event.preventDefault();go(route.dataset.route638);return;}
  const button=event.target.closest('[data-action-638]');
  if(!button)return;
  event.preventDefault();
  const action=button.dataset.action638;
  if(action==='water'){
    const delta=Number(button.dataset.delta)||0;
    store.mutate(d=>{d.water=clamp((Number(d.water)||0)+delta,0,8)});
  }else if(action==='water-reset'){
    store.mutate(d=>{d.water=0});
  }else if(action==='gym'){
    const delta=Number(button.dataset.delta)||0;
    store.mutate(d=>{d.wellness=d.wellness||{};d.wellness.gymDate=todayKey();d.gymMinutes=Math.max(0,Math.round(Number(d.gymMinutes)||0)+delta)});
  }else if(action==='gym-goal'){
    const input=$('[data-gym-goal-638]');
    const goal=Math.max(1,Math.round(Number(input?.value)||60));
    store.mutate(d=>{d.wellness=d.wellness||{};d.wellness.gymGoalMinutes=goal});
    const status=$('[data-gym-status-638]');if(status)status.textContent='Daily gym goal saved and synced to Morning Brief.';
  }
  paintMorningBrief();
  paintWellness();
}

document.addEventListener('click',handleClick,false);
window.addEventListener('kc:route-rendered',()=>setTimeout(()=>{renderMorningBrief();renderWellness()},0));
window.addEventListener('kc:state',()=>setTimeout(()=>{paintMorningBrief();paintWellness()},0));
window.addEventListener('hashchange',()=>setTimeout(()=>{renderMorningBrief();renderWellness()},0));
setTimeout(()=>{renderMorningBrief();renderWellness()},0);
