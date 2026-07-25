import {store} from './store.js';

const BUILD='Sprint 6B.37 Navigation + Wellness Stabilization';
const $=(s,r=document)=>r.querySelector(s);
const all=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,min,max)=>Math.min(max,Math.max(min,Number(v)||0));
const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const pageTitle=()=>($('#page h1')?.textContent||'').trim();
const isPage=name=>pageTitle()===name;

function routerGo(route){
  const router=window.__keyCollectiveRouter;
  if(router?.go){router.go(route);return;}
  const nav=$(`.nav-button[data-route="${route}"]`);
  if(nav){nav.click();return;}
  location.hash=`#${route}`;
}

function soberDays(){
  const reset=store.get().sobriety?.lastReset;
  if(!reset)return 0;
  const start=new Date(`${reset}T00:00:00`);
  const today=new Date(`${todayKey()}T00:00:00`);
  if(Number.isNaN(start.getTime())||Number.isNaN(today.getTime()))return 0;
  return Math.max(0,Math.floor((today-start)/86400000)+1);
}

function gymData(){
  const s=store.get();
  return {
    minutes:Math.max(0,Math.round(Number(s.gymMinutes)||0)),
    goal:Math.max(1,Math.round(Number(s.wellness?.gymGoalMinutes)||60))
  };
}

function renderWellness(){
  if(!isPage('Wellness Studio'))return;
  const page=$('#page');
  if(!page)return;

  // Keep the approved sobriety card, but enforce the shared inclusive count.
  const tracker=$('#sobrietyTracker6B18')||all('.card',page).find(c=>/Sobriety Tracker/i.test(c.textContent||''));
  if(tracker){
    const days=soberDays();
    const metric=tracker.querySelector('.metric');
    const pill=tracker.querySelector('.pill');
    if(metric)metric.textContent=String(days);
    if(pill)pill.textContent=`${days} day${days===1?'':'s'}`;
  }

  // Keep exactly one gym card and own its interactions in one stable layer.
  let gym=$('#wellnessGym637');
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
  gym.id='wellnessGym637';
  gym.dataset.owner637='gym';
  gym.innerHTML=`
    <div class="section-title"><div><div class="eyebrow">Daily movement</div><h3>Gym Time</h3></div><span class="pill" data-gym-pill-637></span></div>
    <div class="metric" data-gym-value-637></div>
    <p class="muted">Minutes logged today</p>
    <div class="bar"><span data-gym-bar-637></span></div>
    <div class="controls-635 gym-controls-635">
      <button type="button" class="btn ghost" data-wellness-action="gym" data-delta="-15">− 15 min</button>
      <button type="button" class="btn ghost" data-wellness-action="gym" data-delta="-5">− 5 min</button>
      <button type="button" class="btn" data-wellness-action="gym" data-delta="5">＋ 5 min</button>
      <button type="button" class="btn" data-wellness-action="gym" data-delta="15">＋ 15 min</button>
    </div>
    <label>Today’s gym goal<div class="goal-row-635"><input class="input" type="number" min="1" step="5" inputmode="numeric" data-gym-goal-637><button type="button" class="btn" data-wellness-action="gym-goal">Save goal</button></div></label>
    <div class="status" data-gym-status-637>Gym time syncs directly to Morning Brief.</div>`;

  // Stabilize the native water card without replacing approved visuals unnecessarily.
  const water=all('.card',page).find(c=>/^Water$/i.test((c.querySelector('h3')?.textContent||'').trim()));
  if(water){
    water.dataset.owner637='water';
    const metric=water.querySelector('.metric');
    if(metric)metric.dataset.waterValue637='';
    let controls=water.querySelector('[data-water-controls-637]');
    if(!controls){
      water.querySelector('#waterPlus')?.remove();
      water.querySelector('#waterReset')?.remove();
      controls=document.createElement('div');
      controls.dataset.waterControls637='';
      controls.className='row wrap';
      controls.innerHTML=`<button type="button" class="btn ghost" data-wellness-action="water" data-delta="-1">− Glass</button><button type="button" class="btn" data-wellness-action="water" data-delta="1">＋ Glass</button><button type="button" class="btn ghost" data-wellness-action="water-reset">Reset</button>`;
      water.append(controls);
    }
  }
  paintWellness();
  const b=$('#kcBuildStatus b');if(b)b.textContent=BUILD;
}

function paintWellness(){
  if(!isPage('Wellness Studio'))return;
  const s=store.get();
  const water=clamp(s.water,0,8);
  const g=gymData();
  const pct=clamp(Math.round(g.minutes/g.goal*100),0,100);
  all('[data-water-value-637]').forEach(n=>n.textContent=`${water}/8`);
  all('[data-gym-value-637]').forEach(n=>n.textContent=`${g.minutes} min`);
  all('[data-gym-pill-637]').forEach(n=>n.textContent=`${g.minutes} / ${g.goal} min`);
  all('[data-gym-bar-637]').forEach(n=>n.style.width=`${pct}%`);
  all('[data-gym-goal-637]').forEach(n=>{if(document.activeElement!==n)n.value=String(g.goal)});
}

function handleClick(event){
  const route=event.target.closest('[data-kc-route]');
  if(route){event.preventDefault();routerGo(route.dataset.kcRoute);return;}

  const button=event.target.closest('[data-wellness-action]');
  if(!button)return;
  event.preventDefault();
  const action=button.dataset.wellnessAction;
  if(action==='water'){
    const delta=Number(button.dataset.delta)||0;
    store.mutate(d=>{d.water=clamp((Number(d.water)||0)+delta,0,8)});
  }else if(action==='water-reset'){
    store.mutate(d=>{d.water=0});
  }else if(action==='gym'){
    const delta=Number(button.dataset.delta)||0;
    store.mutate(d=>{d.wellness=d.wellness||{};d.wellness.gymDate=todayKey();d.gymMinutes=Math.max(0,Math.round(Number(d.gymMinutes)||0)+delta)});
  }else if(action==='gym-goal'){
    const input=$('[data-gym-goal-637]');
    const goal=Math.max(1,Math.round(Number(input?.value)||60));
    store.mutate(d=>{d.wellness=d.wellness||{};d.wellness.gymGoalMinutes=goal});
    const status=$('[data-gym-status-637]');if(status)status.textContent='Daily gym goal saved and synced to Morning Brief.';
  }
  paintWellness();
}

document.addEventListener('click',handleClick,false);
window.addEventListener('kc:route-rendered',()=>setTimeout(renderWellness,0));
window.addEventListener('kc:state',()=>setTimeout(paintWellness,0));
window.addEventListener('hashchange',()=>setTimeout(renderWellness,0));
setTimeout(renderWellness,0);
