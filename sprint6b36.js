import {store} from './store.js';

const BUILD='Sprint 6B.36 Final Morning + Wellness Interaction Lock';
const $=(s,r=document)=>r.querySelector(s);
const all=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,min,max)=>Math.min(max,Math.max(min,Number(v)||0));
const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
let scheduled=false;
let lastAction={key:'',at:0};

function isPage(name){return new RegExp(name,'i').test($('#page h1')?.textContent||'');}
function gymData(){const s=store.get();return {minutes:Math.max(0,Math.round(Number(s.gymMinutes)||0)),goal:Math.max(1,Math.round(Number(s.wellness?.gymGoalMinutes)||60))};}
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
function routeTo(route){
  const nav=$(`.nav-button[data-route="${route}"]`);
  if(nav){nav.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));return;}
  const next=`#${route}`;
  if(location.hash!==next)location.hash=next;
  else window.dispatchEvent(new HashChangeEvent('hashchange'));
}
function findBriefCard(label){const wanted=label.toLowerCase();return all('#page .brief-metric-grid .card').find(c=>(c.querySelector('.mini')?.textContent||'').trim().toLowerCase()===wanted);}

function ensureBrief(){
  if(!isPage('Morning Brief'))return;
  const water=findBriefCard('Water');
  if(water&&!water.matches('[data-owner-636="water"]')){
    water.dataset.owner636='water';
    water.innerHTML=`<div class="mini">Water</div><div class="metric brief-live-value-635" data-water-value-636></div><div class="bar"><span data-water-bar-636></span></div><div class="controls-635"><button type="button" class="btn ghost" data-kc-action="water" data-delta="-1">− Remove</button><button type="button" class="btn" data-kc-action="water" data-delta="1">＋ Add</button></div><button type="button" class="btn ghost wide-635" data-kc-route="wellness">Open Wellness Studio</button>`;
  }
  const gym=findBriefCard('Movement')||findBriefCard('Gym Time');
  if(gym&&!gym.matches('[data-owner-636="gym-brief"]')){
    gym.dataset.owner636='gym-brief';
    gym.innerHTML=`<div class="mini">Gym Time</div><div class="metric brief-live-value-635" data-brief-gym-value-636></div><div class="bar"><span data-gym-bar-636></span></div><strong class="brief-live-copy-635" data-brief-gym-copy-636></strong><small class="brief-live-copy-635" data-brief-gym-pct-636></small><button type="button" class="btn ghost wide-635" data-kc-route="wellness">Open Wellness Studio</button>`;
  }
  const routine=all('#page .card').find(c=>/^(Morning Routine|Morning Reset)$/i.test((c.querySelector('h3')?.textContent||'').trim())||/Power on gently/i.test(c.textContent||''));
  if(routine&&!routine.matches('[data-owner-636="morning"]')){
    routine.dataset.owner636='morning';
    routine.innerHTML=`<div class="mini">Power on gently</div><h3>Morning Reset</h3><div class="routine-summary-number brief-live-value-635" data-morning-value-636></div><div class="bar"><span data-morning-bar-636></span></div><p class="brief-live-copy-635" data-morning-copy-636></p><button type="button" class="btn ghost wide-635" data-kc-route="sanctuary">Open Sanctuary</button>`;
  }
}

function ensureWellnessGym(){
  if(!isPage('Wellness Studio'))return;
  let card=$('#wellnessGym636');
  const candidates=all('#page .card').filter(c=>/^(Gym|Gym Time)$/i.test((c.querySelector('h3')?.textContent||'').trim())||c.id?.startsWith('wellnessGym')||/wellness-gym/i.test(c.className||''));
  if(!card)card=candidates[0]||null;
  candidates.forEach(c=>{if(c!==card)c.remove();});
  if(!card){
    card=document.createElement('article');
    card.className='card gradient-card wellness-gym-635';
    const water=all('#page .card').find(c=>/^Water$/i.test((c.querySelector('h3')?.textContent||'').trim()));
    water?.insertAdjacentElement('afterend',card);
    if(!water)$('#page')?.append(card);
  }
  card.id='wellnessGym636';
  if(!card.matches('[data-owner-636="gym-wellness"]')){
    card.dataset.owner636='gym-wellness';
    card.innerHTML=`<div class="section-title"><div><div class="eyebrow">Daily movement</div><h3>Gym Time</h3></div><span class="pill" data-gym-pill-636></span></div><div class="metric" data-gym-value-636></div><p class="muted">Minutes logged today</p><div class="bar"><span data-gym-bar-636></span></div><div class="controls-635 gym-controls-635"><button type="button" class="btn ghost" data-kc-action="gym" data-delta="-15">− 15 min</button><button type="button" class="btn ghost" data-kc-action="gym" data-delta="-5">− 5 min</button><button type="button" class="btn" data-kc-action="gym" data-delta="5">＋ 5 min</button><button type="button" class="btn" data-kc-action="gym" data-delta="15">＋ 15 min</button></div><label>Today’s gym goal<div class="goal-row-635"><input class="input" type="number" min="1" step="5" inputmode="numeric" data-gym-goal-636><button type="button" class="btn" data-kc-action="gym-goal">Save goal</button></div></label><div class="status" data-gym-status-636>Gym time syncs directly to Morning Brief.</div>`;
  }
}

function paint(){
  const s=store.get();
  const water=clamp(s.water,0,8);
  const g=gymData();
  const gpct=clamp(Math.round(g.minutes/g.goal*100),0,100);
  const m=morningData();
  const mpct=m.total?clamp(Math.round(m.done/m.total*100),0,100):0;
  all('[data-water-value-636]').forEach(n=>n.textContent=`${water}/8`);
  all('[data-water-bar-636]').forEach(n=>n.style.width=`${water/8*100}%`);
  all('[data-gym-value-636]').forEach(n=>n.textContent=`${g.minutes} min`);
  all('[data-gym-pill-636]').forEach(n=>n.textContent=`${g.minutes} / ${g.goal} min`);
  all('[data-gym-goal-636]').forEach(n=>{if(document.activeElement!==n)n.value=String(g.goal)});
  all('[data-gym-bar-636]').forEach(n=>n.style.width=`${gpct}%`);
  all('[data-brief-gym-value-636]').forEach(n=>n.textContent=`${g.minutes} min`);
  all('[data-brief-gym-copy-636]').forEach(n=>n.textContent=`${g.minutes} of ${g.goal} minutes`);
  all('[data-brief-gym-pct-636]').forEach(n=>n.textContent=`${gpct}% of today’s goal · logged in Wellness Studio.`);
  all('[data-morning-value-636]').forEach(n=>n.textContent=`${m.done} of ${m.total}`);
  all('[data-morning-bar-636]').forEach(n=>n.style.width=`${mpct}%`);
  all('[data-morning-copy-636]').forEach(n=>n.textContent=`${m.done} of ${m.total} Sanctuary Morning Reset items complete.`);
}

function once(key){const now=Date.now();if(lastAction.key===key&&now-lastAction.at<450)return false;lastAction={key,at:now};return true;}
function act(target){
  const route=target.closest('[data-kc-route]');
  if(route){const key=`route:${route.dataset.kcRoute}`;if(!once(key))return true;routeTo(route.dataset.kcRoute);return true;}
  const control=target.closest('[data-kc-action]');
  if(!control)return false;
  const action=control.dataset.kcAction;
  const key=`${action}:${control.dataset.delta||''}`;
  if(!once(key))return true;
  if(action==='water'){
    const delta=Number(control.dataset.delta)||0;
    store.mutate(d=>{d.water=clamp((Number(d.water)||0)+delta,0,8)});
    paint();
    return true;
  }
  if(action==='gym'){
    const delta=Number(control.dataset.delta)||0;
    store.mutate(d=>{d.wellness=d.wellness||{};d.wellness.gymDate=todayKey();d.gymMinutes=Math.max(0,Math.round(Number(d.gymMinutes)||0)+delta)});
    paint();
    return true;
  }
  if(action==='gym-goal'){
    const input=$('[data-gym-goal-636]');
    const goal=Math.max(1,Math.round(Number(input?.value)||60));
    store.mutate(d=>{d.wellness=d.wellness||{};d.wellness.gymGoalMinutes=goal});
    const status=$('[data-gym-status-636]');if(status)status.textContent='Daily gym goal saved and synced to Morning Brief.';
    paint();
    return true;
  }
  return false;
}

function intercept(e){
  if(!act(e.target))return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
}

function reconcile(){ensureWellnessGym();ensureBrief();paint();const b=$('#kcBuildStatus b');if(b)b.textContent=BUILD;}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;reconcile()})}

// Handle the action on pointer/touch release before legacy layers can replace the button.
document.addEventListener('pointerup',intercept,true);
document.addEventListener('touchend',intercept,{capture:true,passive:false});
document.addEventListener('click',intercept,true);
window.addEventListener('kc:state',()=>{paint();setTimeout(reconcile,0)});
window.addEventListener('hashchange',()=>setTimeout(reconcile,0));
window.addEventListener('kc:ui-refresh',()=>setTimeout(reconcile,0));
new MutationObserver(schedule).observe($('#page')||document.body,{childList:true,subtree:true});
reconcile();setTimeout(reconcile,100);setTimeout(reconcile,450);setTimeout(reconcile,1000);
