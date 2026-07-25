import {store} from './store.js';

const BUILD='Sprint 6B.34 Interactive Controls + Navigation Repair';
const $=(s,r=document)=>r.querySelector(s);
const all=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,min,max)=>Math.min(max,Math.max(min,Number(v)||0));
const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
let scheduled=false;

function isPage(name){return new RegExp(name,'i').test($('#page h1')?.textContent||'');}
function sharedGym(){const s=store.get();return {minutes:Math.max(0,Math.round(Number(s.gymMinutes)||0)),goal:Math.max(1,Math.round(Number(s.wellness?.gymGoalMinutes)||60))};}
function ensureGymDay(){const s=store.get();if(s.wellness?.gymDate===todayKey())return;store.mutate(d=>{d.wellness=d.wellness||{};if(d.wellness.gymDate&&d.wellness.gymDate!==todayKey())d.gymMinutes=0;d.wellness.gymDate=todayKey();});}
function changeGym(delta){ensureGymDay();store.mutate(d=>{d.wellness=d.wellness||{};d.wellness.gymDate=todayKey();d.gymMinutes=Math.max(0,Math.round(Number(d.gymMinutes)||0)+Number(delta||0));});paint();}
function saveGymGoal(input,status){const goal=Math.max(1,Math.round(Number(input?.value)||60));store.mutate(d=>{d.wellness=d.wellness||{};d.wellness.gymGoalMinutes=goal;});if(status)status.textContent='Daily gym goal saved and synced to Morning Brief.';paint();}
function changeWater(delta){store.mutate(d=>{d.water=clamp((Number(d.water)||0)+Number(delta||0),0,8);});paint();}

function soberDays(){
  const reset=store.get().sobriety?.lastReset;
  if(!reset)return 0;
  const start=new Date(`${reset}T00:00:00`),today=new Date(`${todayKey()}T00:00:00`);
  if(Number.isNaN(start.getTime())||Number.isNaN(today.getTime()))return 0;
  // Preserve the app's established reset-date-as-day-zero convention.
  return Math.max(0,Math.floor((today-start)/86400000));
}

function morningData(){
  const s=store.get().sanctuary||{};
  const editor=s.routines?.['morning-reset'];
  if(Array.isArray(editor?.items))return {done:editor.items.filter(x=>Boolean(x?.done??x?.completed??x?.checked)).length,total:editor.items.length};
  const snap=Array.isArray(s.morningSnapshot?.items)?s.morningSnapshot.items:[];
  if(snap.length)return {done:snap.filter(x=>Boolean(x?.done)).length,total:snap.length};
  const labels=Array.isArray(s.routines?.morning)?s.routines.morning:[];
  const completed=Array.isArray(s.completed?.morning)?s.completed.morning:[];
  const total=Math.max(labels.length,completed.length,Number(s.routineTotals?.morning)||0);
  return {done:Array.from({length:total},(_,i)=>Boolean(completed[i])).filter(Boolean).length,total};
}

function captureMorning(){
  if(!isPage('Sanctuary'))return;
  let boxes=all('#page input[data-ritual="morning"]');
  if(!boxes.length){const card=all('#page .card').find(c=>/Morning Reset/i.test(c.querySelector('h3')?.textContent||''));boxes=card?all('input[type="checkbox"]',card):[];}
  if(!boxes.length)return;
  const items=boxes.map((box,i)=>({label:(box.closest('label')?.querySelector('span')?.textContent||box.closest('label')?.textContent||`Morning item ${i+1}`).trim(),done:box.checked}));
  const old=store.get().sanctuary?.morningSnapshot?.items||[];
  if(JSON.stringify(old)===JSON.stringify(items))return;
  store.mutate(d=>{d.sanctuary=d.sanctuary||{};d.sanctuary.completed=d.sanctuary.completed||{};d.sanctuary.routines=d.sanctuary.routines||{};d.sanctuary.routineTotals=d.sanctuary.routineTotals||{};d.sanctuary.completed.morning=items.map(x=>x.done);d.sanctuary.routines.morning=items.map(x=>x.label);d.sanctuary.routineTotals.morning=items.length;d.sanctuary.morningSnapshot={date:todayKey(),items};});
}

function go(route){
  const nav=$(`.nav-button[data-route="${route}"]`);
  if(nav){nav.click();return;}
  const next=`#${route}`;
  if(location.hash!==next)location.hash=next;
  else window.dispatchEvent(new HashChangeEvent('hashchange'));
}

function metricCard(names){const set=names.map(v=>v.toLowerCase());return all('#page .brief-metric-grid .card').find(c=>set.includes((c.querySelector('.mini')?.textContent||'').trim().toLowerCase()));}
function button(label,cls='btn'){const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=label;return b;}

function patchBrief(){
  if(!isPage('Morning Brief'))return;
  const water=metricCard(['Water']);
  if(water&&!water.dataset.interactive634){
    water.dataset.interactive634='true';water.replaceChildren();
    const mini=document.createElement('div');mini.className='mini';mini.textContent='Water';
    const value=document.createElement('div');value.className='metric';value.dataset.waterValue634='';
    const bar=document.createElement('div');bar.className='bar';const fill=document.createElement('span');fill.dataset.waterBar634='';bar.append(fill);
    const controls=document.createElement('div');controls.className='controls-634';
    const minus=button('− Remove','btn ghost');minus.onclick=e=>{e.preventDefault();changeWater(-1)};
    const plus=button('＋ Add');plus.onclick=e=>{e.preventDefault();changeWater(1)};
    controls.append(minus,plus);
    const open=button('Open Wellness Studio','btn ghost wide-634');open.onclick=e=>{e.preventDefault();go('wellness')};
    water.append(mini,value,bar,controls,open);
  }
  const gym=metricCard(['Movement','Gym Time','Gym time']);
  if(gym&&!gym.dataset.interactive634){
    gym.dataset.interactive634='true';gym.replaceChildren();
    const mini=document.createElement('div');mini.className='mini';mini.textContent='Gym Time';
    const value=document.createElement('div');value.className='metric';value.dataset.briefGymValue634='';
    const bar=document.createElement('div');bar.className='bar';const fill=document.createElement('span');fill.dataset.gymBar634='';bar.append(fill);
    const copy=document.createElement('strong');copy.dataset.briefGymCopy634='';
    const pct=document.createElement('small');pct.dataset.briefGymPct634='';
    const open=button('Open Wellness Studio','btn ghost wide-634');open.onclick=e=>{e.preventDefault();go('wellness')};
    gym.append(mini,value,bar,copy,pct,open);
  }
  const routine=all('#page .card').find(c=>/^(Morning Routine|Morning Reset)$/i.test((c.querySelector('h3')?.textContent||'').trim())||/Power on gently/i.test(c.textContent||''));
  if(routine&&!routine.dataset.interactive634){
    routine.dataset.interactive634='true';routine.replaceChildren();
    const mini=document.createElement('div');mini.className='mini';mini.textContent='Power on gently';
    const h=document.createElement('h3');h.textContent='Morning Reset';
    const value=document.createElement('div');value.className='routine-summary-number';value.dataset.morningValue634='';
    const bar=document.createElement('div');bar.className='bar';const fill=document.createElement('span');fill.dataset.morningBar634='';bar.append(fill);
    const copy=document.createElement('p');copy.dataset.morningCopy634='';
    const open=button('Open Sanctuary','btn ghost wide-634');open.onclick=e=>{e.preventDefault();go('sanctuary')};
    routine.append(mini,h,value,bar,copy,open);
  }
}

function patchWellness(){
  if(!isPage('Wellness Studio'))return;
  ensureGymDay();
  let card=$('#wellnessGym634');
  all('#page .card').forEach(c=>{if(c===card)return;const h=(c.querySelector('h3')?.textContent||'').trim();if(/^(Gym|Gym Time)$/i.test(h)||c.id?.startsWith('wellnessGym')||/wellness-gym/i.test(c.className||''))c.remove();});
  if(!card){
    card=document.createElement('article');card.id='wellnessGym634';card.className='card gradient-card wellness-gym-634';
    const water=all('#page .card').find(c=>/^Water$/i.test((c.querySelector('h3')?.textContent||'').trim()));
    water?.insertAdjacentElement('afterend',card);if(!water)$('#page')?.append(card);
  }
  if(card.dataset.interactive634)return;
  card.dataset.interactive634='true';
  card.innerHTML=`<div class="section-title"><div><div class="eyebrow">Daily movement</div><h3>Gym Time</h3></div><span class="pill" data-gym-pill-634></span></div><div class="metric" data-gym-value-634></div><p class="muted">Minutes logged today</p><div class="bar"><span data-gym-bar-634></span></div><div class="controls-634 gym-controls-634"></div><label>Today’s gym goal<div class="goal-row-634"><input class="input" type="number" min="1" step="5" inputmode="numeric" data-gym-goal-634><button type="button" class="btn" data-save-goal-634>Save goal</button></div></label><div class="status" data-gym-status-634>Gym time syncs directly to Morning Brief.</div>`;
  const controls=$('.gym-controls-634',card);
  [[-15,'− 15 min','btn ghost'],[-5,'− 5 min','btn ghost'],[5,'＋ 5 min','btn'],[15,'＋ 15 min','btn']].forEach(([delta,label,cls])=>{const b=button(label,cls);b.onclick=e=>{e.preventDefault();changeGym(delta)};controls.append(b)});
  const input=$('[data-gym-goal-634]',card),status=$('[data-gym-status-634]',card);
  $('[data-save-goal-634]',card).onclick=e=>{e.preventDefault();saveGymGoal(input,status)};
}

function paintSobriety(){
  const days=soberDays();
  if(isPage('Wellness Studio')){
    const tracker=$('#sobrietyTracker6B18')||all('#page .card').find(c=>/Sobriety Tracker/i.test(c.textContent||''));
    if(tracker){const pill=tracker.querySelector('.pill'),metric=tracker.querySelector('.metric');if(pill)pill.textContent=`${days} day${days===1?'':'s'}`;if(metric)metric.textContent=String(days);}
  }
  if(isPage('Executive Dashboard')){
    const panel=all('#page .dashboard-panel,#page .card').find(c=>/Wellness today/i.test(c.textContent||''));
    if(panel){const span=all('.metric-row > span',panel).find(n=>/Days sober|Gym min/i.test(n.textContent||''));if(span)span.innerHTML=`<b>${days}</b><small>Days sober</small>`;}
  }
}

function paint(){
  const s=store.get(),water=clamp(s.water,0,8),g=sharedGym(),gpct=clamp(Math.round(g.minutes/g.goal*100),0,100),m=morningData(),mpct=m.total?clamp(Math.round(m.done/m.total*100),0,100):0;
  all('[data-water-value-634]').forEach(n=>n.textContent=`${water}/8`);all('[data-water-bar-634]').forEach(n=>n.style.width=`${water/8*100}%`);
  all('[data-gym-value-634]').forEach(n=>n.textContent=`${g.minutes} min`);all('[data-gym-pill-634]').forEach(n=>n.textContent=`${g.minutes} / ${g.goal} min`);all('[data-gym-goal-634]').forEach(n=>{if(document.activeElement!==n)n.value=g.goal});
  all('[data-brief-gym-value-634]').forEach(n=>n.textContent=`${g.minutes} min`);all('[data-brief-gym-copy-634]').forEach(n=>n.textContent=`${g.minutes} of ${g.goal} minutes`);all('[data-brief-gym-pct-634]').forEach(n=>n.textContent=`${gpct}% of today’s goal · logged in Wellness Studio.`);all('[data-gym-bar-634]').forEach(n=>n.style.width=`${gpct}%`);
  all('[data-morning-value-634]').forEach(n=>n.textContent=`${m.done} of ${m.total}`);all('[data-morning-bar-634]').forEach(n=>n.style.width=`${mpct}%`);all('[data-morning-copy-634]').forEach(n=>n.textContent=`${m.done} of ${m.total} Sanctuary Morning Reset items complete.`);
  paintSobriety();
}

function reconcile(){captureMorning();patchWellness();patchBrief();paint();const b=$('#kcBuildStatus b');if(b)b.textContent=BUILD;}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;reconcile()})}

document.addEventListener('change',e=>{if(e.target.matches('#page input[data-ritual="morning"],#page .ritual-card input[type="checkbox"]'))setTimeout(()=>{captureMorning();paint()},0)},true);
window.addEventListener('kc:state',paint);
window.addEventListener('hashchange',()=>setTimeout(reconcile,0));
window.addEventListener('kc:ui-refresh',()=>setTimeout(reconcile,0));
new MutationObserver(()=>schedule()).observe($('#page')||document.body,{childList:true,subtree:true});
reconcile();setTimeout(reconcile,150);setTimeout(reconcile,700);
