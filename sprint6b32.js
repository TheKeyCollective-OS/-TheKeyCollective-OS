import {store} from './store.js';

const BUILD='Sprint 6B.32 Direct Runtime Correction';
const $=(s,r=document)=>r.querySelector(s);
const all=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
let applying=false,queued=false;

function gymData(){
  const s=store.get();
  return {minutes:Math.max(0,Math.round(Number(s.gymMinutes)||0)),goal:Math.max(1,Math.round(Number(s.wellness?.gymGoalMinutes)||60))};
}
function gymPct(){const g=gymData();return clamp(Math.round(g.minutes/g.goal*100),0,100)}
function ensureGymDate(){
  const s=store.get(),date=s.wellness?.gymDate;
  if(date===today())return;
  store.mutate(d=>{d.wellness=d.wellness||{};if(date)d.gymMinutes=0;d.wellness.gymDate=today()});
}
function morningData(){
  const a=store.get().sanctuary||{};
  const snap=Array.isArray(a.morningSnapshot?.items)?a.morningSnapshot.items:[];
  const labels=Array.isArray(a.routines?.morning)?a.routines.morning:[];
  const completed=Array.isArray(a.completed?.morning)?a.completed.morning:[];
  const total=Math.max(snap.length,labels.length,completed.length,Number(a.routineTotals?.morning)||0);
  const done=Array.from({length:total},(_,i)=>snap[i]?Boolean(snap[i].done):Boolean(completed[i])).filter(Boolean).length;
  return {done,total,pct:total?Math.round(done/total*100):0};
}
function captureMorning(){
  if(!$('#page h1')?.textContent.includes('Sanctuary'))return;
  const boxes=all('#page input[data-ritual="morning"]');
  if(!boxes.length)return;
  const items=boxes.map((box,i)=>({label:box.closest('label')?.querySelector('span')?.textContent?.trim()||`Morning item ${i+1}`,done:box.checked}));
  const old=store.get().sanctuary?.morningSnapshot;
  if(old?.date===today()&&JSON.stringify(old.items||[])===JSON.stringify(items))return;
  store.mutate(d=>{
    d.sanctuary=d.sanctuary||{};d.sanctuary.completed=d.sanctuary.completed||{};d.sanctuary.routines=d.sanctuary.routines||{};d.sanctuary.routineTotals=d.sanctuary.routineTotals||{};
    d.sanctuary.completed.morning=items.map(x=>x.done);d.sanctuary.routines.morning=items.map(x=>x.label);d.sanctuary.routineTotals.morning=items.length;d.sanctuary.morningSnapshot={date:today(),items};
  });
}
function cardByMini(...names){
  const wanted=names.map(x=>x.toLowerCase());
  return all('#page .brief-metric-grid article.card,#page .brief-metric-grid .card').find(c=>wanted.includes(c.querySelector('.mini')?.textContent.trim().toLowerCase()));
}
function patchBrief(){
  if(!$('#page h1')?.textContent.includes('Morning Brief'))return;
  const water=cardByMini('Water');
  if(water&&!water.matches('[data-brief-water-632]')){
    water.dataset.briefWater632='';water.classList.add('brief-water-632');
    water.innerHTML=`<div class="mini">Water</div><div class="metric" data-water-value-632></div><div class="bar"><span data-water-bar-632></span></div><div class="brief-controls-632"><button type="button" class="btn ghost" data-water-delta-632="-1">− Remove</button><button type="button" class="btn" data-water-delta-632="1">＋ Add</button></div><button type="button" class="btn ghost wide-632" data-route-632="wellness">Open Wellness Studio</button>`;
  }
  const movement=cardByMini('Movement','Gym time');
  if(movement&&!movement.matches('[data-brief-gym-632]')){
    movement.dataset.briefGym632='';movement.classList.add('brief-gym-632');
    movement.innerHTML=`<div class="mini">Gym Time</div><div class="metric" data-brief-gym-minutes-632></div><div class="bar"><span data-gym-bar-632></span></div><strong data-brief-gym-goal-632></strong><small data-brief-gym-percent-632></small><button type="button" class="btn ghost wide-632" data-route-632="wellness">Open Wellness Studio</button>`;
  }
  let routine=all('#page article.card,#page .card').find(c=>/^(Morning Routine|Morning Reset)$/i.test(c.querySelector('h3')?.textContent.trim()||'')||/Power on gently/i.test(c.textContent||''));
  if(!routine){routine=document.createElement('article');routine.className='card';const top=all('#page .intelligence-grid article.card,#page .intelligence-grid .card')[0];top?.insertAdjacentElement('beforebegin',routine)}
  if(routine&&!routine.matches('[data-morning-reset-632]')){
    routine.dataset.morningReset632='';routine.classList.add('morning-reset-632');
    routine.innerHTML=`<div class="mini">Power on gently</div><h3>Morning Reset</h3><div class="routine-summary-number" data-morning-count-632></div><div class="bar"><span data-morning-bar-632></span></div><p data-morning-copy-632></p><button type="button" class="btn ghost wide-632" data-route-632="sanctuary">Open Sanctuary</button>`;
  }
  updateVisible();
}
function patchWellness(){
  if(!$('#page h1')?.textContent.includes('Wellness Studio'))return;
  ensureGymDate();
  let keep=$('#wellnessGymCard632');
  all('#page article.card,#page .card').forEach(c=>{
    if(c===keep)return;
    const h=(c.querySelector('h3')?.textContent||'').trim();
    if(/^(Gym|Gym Time)$/i.test(h)||c.matches('[id*="wellnessGymCard"],[class*="wellness-gym-card"]'))c.remove();
  });
  if(!keep){
    keep=document.createElement('article');keep.id='wellnessGymCard632';keep.className='card wellness-gym-632';
    const water=all('#page article.card,#page .card').find(c=>/^(Water)$/i.test(c.querySelector('h3')?.textContent.trim()||'')||/Daily Hydration/i.test(c.textContent||''));
    if(water)water.insertAdjacentElement('afterend',keep);else $('#page')?.append(keep);
  }
  if(!keep.dataset.ready632){
    keep.dataset.ready632='';
    keep.innerHTML=`<div class="section-title"><div><div class="eyebrow">Daily movement</div><h3>Gym Time</h3></div><span class="pill" data-gym-pill-632></span></div><div class="gym-number-632" data-gym-number-632></div><p class="muted">Minutes logged today</p><div class="bar"><span data-gym-bar-632></span></div><div class="gym-controls-632"><button type="button" class="btn ghost" data-gym-delta-632="-15">− 15 min</button><button type="button" class="btn ghost" data-gym-delta-632="-5">− 5 min</button><button type="button" class="btn" data-gym-delta-632="5">＋ 5 min</button><button type="button" class="btn" data-gym-delta-632="15">＋ 15 min</button></div><label>Today’s gym goal<div class="gym-goal-row-632"><input type="number" min="1" step="5" inputmode="numeric" data-gym-goal-input-632><button type="button" class="btn" data-save-gym-goal-632>Save goal</button></div></label><div class="status" data-gym-status-632>Gym time syncs directly to Morning Brief.</div>`;
  }
  updateVisible();
}
function updateVisible(){
  const s=store.get(),water=clamp(s.water,0,8),g=gymData(),pct=gymPct(),m=morningData();
  all('[data-water-value-632]').forEach(n=>n.textContent=`${water}/8`);all('[data-water-bar-632]').forEach(n=>n.style.width=`${water/8*100}%`);
  all('[data-gym-number-632]').forEach(n=>n.textContent=g.minutes);all('[data-gym-pill-632]').forEach(n=>n.textContent=`${g.minutes} / ${g.goal} min`);all('[data-gym-goal-input-632]').forEach(n=>{if(document.activeElement!==n)n.value=g.goal});
  all('[data-brief-gym-minutes-632]').forEach(n=>n.textContent=`${g.minutes} min`);all('[data-brief-gym-goal-632]').forEach(n=>n.textContent=`${g.minutes} of ${g.goal} minutes`);all('[data-brief-gym-percent-632]').forEach(n=>n.textContent=`${pct}% of today’s goal`);all('[data-gym-bar-632]').forEach(n=>n.style.width=`${pct}%`);
  all('[data-morning-count-632]').forEach(n=>n.textContent=`${m.done} of ${m.total}`);all('[data-morning-bar-632]').forEach(n=>n.style.width=`${m.pct}%`);all('[data-morning-copy-632]').forEach(n=>n.textContent=`${m.done} of ${m.total} Sanctuary Morning Reset items complete.`);
}
function apply(){
  if(applying)return;applying=true;
  try{captureMorning();patchWellness();patchBrief();const b=$('#kcBuildStatus b');if(b)b.textContent=BUILD}finally{applying=false}
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}

document.addEventListener('click',e=>{
  const w=e.target.closest('[data-water-delta-632]');if(w){e.preventDefault();e.stopImmediatePropagation();store.mutate(d=>{d.water=clamp((Number(d.water)||0)+Number(w.dataset.waterDelta632),0,8)});return}
  const g=e.target.closest('[data-gym-delta-632]');if(g){e.preventDefault();e.stopImmediatePropagation();ensureGymDate();store.mutate(d=>{d.wellness=d.wellness||{};d.wellness.gymDate=today();d.gymMinutes=Math.max(0,Math.round((Number(d.gymMinutes)||0)+Number(g.dataset.gymDelta632)))});return}
  const save=e.target.closest('[data-save-gym-goal-632]');if(save){e.preventDefault();e.stopImmediatePropagation();const goal=Math.max(1,Math.round(Number($('[data-gym-goal-input-632]')?.value)||60));store.mutate(d=>{d.wellness=d.wellness||{};d.wellness.gymGoalMinutes=goal});const status=$('[data-gym-status-632]');if(status)status.textContent='Daily gym goal saved.';return}
  const route=e.target.closest('[data-route-632]');if(route){e.preventDefault();location.hash=`#${route.dataset.route632}`}
},true);
document.addEventListener('change',e=>{if(e.target.matches('#page input[data-ritual="morning"]'))setTimeout(captureMorning,0)},true);
window.addEventListener('kc:state',()=>{updateVisible();schedule()});
new MutationObserver(schedule).observe($('#page')||document.body,{childList:true,subtree:true});
apply();setTimeout(apply,100);setTimeout(apply,400);setInterval(()=>{if(document.visibilityState==='visible')apply()},1200);
