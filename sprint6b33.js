import {store} from './store.js';

const BUILD='Sprint 6B.33 Morning + Wellness Control Repair';
const $=(s,r=document)=>r.querySelector(s);
const all=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,min,max)=>Math.min(max,Math.max(min,Number(v)||0));
const localDate=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
let busy=false,queued=false;

function gym(){const s=store.get();return {minutes:Math.max(0,Math.round(Number(s.gymMinutes)||0)),goal:Math.max(1,Math.round(Number(s.wellness?.gymGoalMinutes)||60))};}
function ensureGymDay(){const s=store.get();if(s.wellness?.gymDate===localDate())return;store.mutate(d=>{d.wellness=d.wellness||{};if(d.wellness.gymDate)d.gymMinutes=0;d.wellness.gymDate=localDate();});}
function setGym(delta){ensureGymDay();store.mutate(d=>{d.wellness=d.wellness||{};d.wellness.gymDate=localDate();d.gymMinutes=Math.max(0,Math.round(Number(d.gymMinutes)||0)+delta);});renderValues();}
function saveGoal(){const input=$('[data-gym-goal-633]');const goal=Math.max(1,Math.round(Number(input?.value)||60));store.mutate(d=>{d.wellness=d.wellness||{};d.wellness.gymGoalMinutes=goal;});const status=$('[data-gym-status-633]');if(status)status.textContent='Daily gym goal saved and synced to Morning Brief.';renderValues();}
function setWater(delta){const current=clamp(store.get().water,0,8);store.mutate(d=>{d.water=clamp(current+delta,0,8);});renderValues();}

function morning(){
  const s=store.get().sanctuary||{};
  const editor=s.routines?.['morning-reset'];
  if(Array.isArray(editor?.items)){
    const items=editor.items;
    return {done:items.filter(x=>Boolean(x?.done??x?.completed??x?.checked)).length,total:items.length};
  }
  const snap=Array.isArray(s.morningSnapshot?.items)?s.morningSnapshot.items:[];
  if(snap.length)return {done:snap.filter(x=>Boolean(x?.done)).length,total:snap.length};
  const labels=Array.isArray(s.routines?.morning)?s.routines.morning:[];
  const completed=Array.isArray(s.completed?.morning)?s.completed.morning:[];
  const total=Math.max(labels.length,completed.length,Number(s.routineTotals?.morning)||0);
  return {done:Array.from({length:total},(_,i)=>Boolean(completed[i])).filter(Boolean).length,total};
}
function captureMorning(){
  if(!/Sanctuary/i.test($('#page h1')?.textContent||''))return;
  let boxes=all('#page input[data-ritual="morning"]');
  if(!boxes.length){
    const card=all('#page .card').find(c=>/Morning Reset/i.test(c.querySelector('h3')?.textContent||''));
    boxes=card?all('input[type="checkbox"]',card):[];
  }
  if(!boxes.length)return;
  const items=boxes.map((box,i)=>({label:(box.closest('label')?.querySelector('span')?.textContent||box.closest('label')?.textContent||`Morning item ${i+1}`).trim(),done:box.checked}));
  const old=store.get().sanctuary?.morningSnapshot?.items||[];
  if(JSON.stringify(old)===JSON.stringify(items))return;
  store.mutate(d=>{d.sanctuary=d.sanctuary||{};d.sanctuary.completed=d.sanctuary.completed||{};d.sanctuary.routines=d.sanctuary.routines||{};d.sanctuary.routineTotals=d.sanctuary.routineTotals||{};d.sanctuary.completed.morning=items.map(x=>x.done);d.sanctuary.routines.morning=items.map(x=>x.label);d.sanctuary.routineTotals.morning=items.length;d.sanctuary.morningSnapshot={date:localDate(),items};});
}
function briefCard(minis){const names=minis.map(x=>x.toLowerCase());return all('#page .brief-metric-grid .card').find(c=>names.includes((c.querySelector('.mini')?.textContent||'').trim().toLowerCase()));}
function patchBrief(){
  if(!/Morning Brief/i.test($('#page h1')?.textContent||''))return;
  const water=briefCard(['Water']);
  if(water){water.dataset.water633='';water.innerHTML=`<div class="mini">Water</div><div class="metric" data-water-value-633></div><div class="bar"><span data-water-bar-633></span></div><div class="controls-633"><button type="button" class="btn ghost" data-water-633="-1">− Remove</button><button type="button" class="btn" data-water-633="1">＋ Add</button></div><button type="button" class="btn ghost wide-633" data-go-633="wellness">Open Wellness Studio</button>`;}
  const move=briefCard(['Movement','Gym Time','Gym time']);
  if(move){move.dataset.gymBrief633='';move.innerHTML=`<div class="mini">Gym Time</div><div class="metric" data-brief-gym-value-633></div><div class="bar"><span data-gym-bar-633></span></div><strong data-brief-gym-copy-633></strong><small data-brief-gym-pct-633></small><button type="button" class="btn ghost wide-633" data-go-633="wellness">Open Wellness Studio</button>`;}
  let routine=all('#page .card').find(c=>/^(Morning Routine|Morning Reset)$/i.test((c.querySelector('h3')?.textContent||'').trim())||/Power on gently/i.test(c.textContent||''));
  if(!routine){routine=document.createElement('article');routine.className='card';const grid=$('#page .intelligence-grid');grid?.insertAdjacentElement('beforebegin',routine);}
  if(routine){routine.dataset.morning633='';routine.innerHTML=`<div class="mini">Power on gently</div><h3>Morning Reset</h3><div class="routine-summary-number" data-morning-value-633></div><div class="bar"><span data-morning-bar-633></span></div><p data-morning-copy-633></p><button type="button" class="btn ghost wide-633" data-go-633="sanctuary">Open Sanctuary</button>`;}
}
function patchWellness(){
  if(!/Wellness Studio/i.test($('#page h1')?.textContent||''))return;
  ensureGymDay();
  let card=$('#wellnessGym633');
  all('#page .card').forEach(c=>{if(c===card)return;const h=(c.querySelector('h3')?.textContent||'').trim();if(/^(Gym|Gym Time)$/i.test(h)||c.id?.startsWith('wellnessGymCard')||/wellness-gym/i.test(c.className||''))c.remove();});
  if(!card){card=document.createElement('article');card.id='wellnessGym633';card.className='card gradient-card wellness-gym-633';const water=all('#page .card').find(c=>/^(Water)$/i.test((c.querySelector('h3')?.textContent||'').trim()));water?.insertAdjacentElement('afterend',card);if(!water)$('#page')?.append(card);}
  card.innerHTML=`<div class="section-title"><div><div class="eyebrow">Daily movement</div><h3>Gym Time</h3></div><span class="pill" data-gym-pill-633></span></div><div class="metric" data-gym-value-633></div><p class="muted">Minutes logged today</p><div class="bar"><span data-gym-bar-633></span></div><div class="controls-633 gym-controls-633"><button type="button" class="btn ghost" data-gym-633="-15">− 15 min</button><button type="button" class="btn ghost" data-gym-633="-5">− 5 min</button><button type="button" class="btn" data-gym-633="5">＋ 5 min</button><button type="button" class="btn" data-gym-633="15">＋ 15 min</button></div><label>Today’s gym goal<div class="goal-row-633"><input class="input" type="number" min="1" step="5" inputmode="numeric" data-gym-goal-633><button type="button" class="btn" data-save-goal-633>Save goal</button></div></label><div class="status" data-gym-status-633>Gym time syncs directly to Morning Brief.</div>`;
}
function renderValues(){
  const s=store.get(),w=clamp(s.water,0,8),g=gym(),pct=clamp(Math.round(g.minutes/g.goal*100),0,100),m=morning(),mpct=m.total?clamp(Math.round(m.done/m.total*100),0,100):0;
  all('[data-water-value-633]').forEach(n=>n.textContent=`${w}/8`);all('[data-water-bar-633]').forEach(n=>n.style.width=`${w/8*100}%`);
  all('[data-gym-value-633]').forEach(n=>n.textContent=`${g.minutes} min`);all('[data-gym-pill-633]').forEach(n=>n.textContent=`${g.minutes} / ${g.goal} min`);all('[data-gym-goal-633]').forEach(n=>{if(document.activeElement!==n)n.value=g.goal});
  all('[data-brief-gym-value-633]').forEach(n=>n.textContent=`${g.minutes} min`);all('[data-brief-gym-copy-633]').forEach(n=>n.textContent=`${g.minutes} of ${g.goal} minutes`);all('[data-brief-gym-pct-633]').forEach(n=>n.textContent=`${pct}% of today’s goal · logged in Wellness Studio.`);all('[data-gym-bar-633]').forEach(n=>n.style.width=`${pct}%`);
  all('[data-morning-value-633]').forEach(n=>n.textContent=`${m.done} of ${m.total}`);all('[data-morning-bar-633]').forEach(n=>n.style.width=`${mpct}%`);all('[data-morning-copy-633]').forEach(n=>n.textContent=`${m.done} of ${m.total} Sanctuary Morning Reset items complete.`);
}
function apply(){if(busy)return;busy=true;try{captureMorning();patchWellness();patchBrief();renderValues();const b=$('#kcBuildStatus b');if(b)b.textContent=BUILD;}finally{busy=false;}}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}

window.addEventListener('click',e=>{
  const water=e.target.closest('[data-water-633]');if(water){e.preventDefault();e.stopImmediatePropagation();setWater(Number(water.dataset.water633));return;}
  const gymBtn=e.target.closest('[data-gym-633]');if(gymBtn){e.preventDefault();e.stopImmediatePropagation();setGym(Number(gymBtn.dataset.gym633));return;}
  if(e.target.closest('[data-save-goal-633]')){e.preventDefault();e.stopImmediatePropagation();saveGoal();return;}
  const go=e.target.closest('[data-go-633]');if(go){e.preventDefault();e.stopImmediatePropagation();location.hash=`#${go.dataset.go633}`;return;}
},true);
window.addEventListener('change',e=>{if(e.target.matches('#page input[data-ritual="morning"],#page .ritual-card input[type="checkbox"]'))setTimeout(()=>{captureMorning();renderValues();},0);},true);
window.addEventListener('kc:state',()=>{renderValues();schedule();});
new MutationObserver(schedule).observe($('#page')||document.body,{childList:true,subtree:true});
apply();setTimeout(apply,120);setTimeout(apply,500);setInterval(()=>{if(document.visibilityState==='visible')apply();},1500);
