import {store} from './store.js';

const BUILD='Sprint 6B.35 Final Morning Brief Values + Sobriety Alignment';
const $=(s,r=document)=>r.querySelector(s);
const all=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,min,max)=>Math.min(max,Math.max(min,Number(v)||0));
const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
let scheduled=false;

function isPage(name){return new RegExp(name,'i').test($('#page h1')?.textContent||'');}
function routeTo(route){const nav=$(`.nav-button[data-route="${route}"]`);if(nav){nav.click();return;}location.hash=`#${route}`;}
function gymData(){const s=store.get();return {minutes:Math.max(0,Math.round(Number(s.gymMinutes)||0)),goal:Math.max(1,Math.round(Number(s.wellness?.gymGoalMinutes)||60))};}
function morningData(){const s=store.get().sanctuary||{};const editor=s.routines?.['morning-reset'];if(Array.isArray(editor?.items))return {done:editor.items.filter(x=>Boolean(x?.done??x?.completed??x?.checked)).length,total:editor.items.length};const snap=Array.isArray(s.morningSnapshot?.items)?s.morningSnapshot.items:[];if(snap.length)return {done:snap.filter(x=>Boolean(x?.done)).length,total:snap.length};const labels=Array.isArray(s.routines?.morning)?s.routines.morning:[];const completed=Array.isArray(s.completed?.morning)?s.completed.morning:[];const total=Math.max(labels.length,completed.length,Number(s.routineTotals?.morning)||0);return {done:Array.from({length:total},(_,i)=>Boolean(completed[i])).filter(Boolean).length,total};}
function soberDaysInclusive(){const reset=store.get().sobriety?.lastReset;if(!reset)return 0;const start=new Date(`${reset}T00:00:00`),today=new Date(`${todayKey()}T00:00:00`);if(Number.isNaN(start.getTime())||Number.isNaN(today.getTime()))return 0;return Math.max(0,Math.floor((today-start)/86400000)+1);}

function findBriefCard(label){const wanted=label.toLowerCase();return all('#page .brief-metric-grid .card').find(c=>(c.querySelector('.mini')?.textContent||'').trim().toLowerCase()===wanted);}
function ensureBrief(){if(!isPage('Morning Brief'))return;
  const water=findBriefCard('Water');
  if(water && !water.querySelector('[data-water-value-635]')) water.innerHTML=`<div class="mini">Water</div><div class="metric brief-live-value-635" data-water-value-635></div><div class="bar"><span data-water-bar-635></span></div><div class="controls-635"><button type="button" class="btn ghost" data-water-step-635="-1">− Remove</button><button type="button" class="btn" data-water-step-635="1">＋ Add</button></div><button type="button" class="btn ghost wide-635" data-route-635="wellness">Open Wellness Studio</button>`;
  const gym=findBriefCard('Movement')||findBriefCard('Gym Time');
  if(gym && !gym.querySelector('[data-brief-gym-value-635]')) gym.innerHTML=`<div class="mini">Gym Time</div><div class="metric brief-live-value-635" data-brief-gym-value-635></div><div class="bar"><span data-gym-bar-635></span></div><strong class="brief-live-copy-635" data-brief-gym-copy-635></strong><small class="brief-live-copy-635" data-brief-gym-pct-635></small><button type="button" class="btn ghost wide-635" data-route-635="wellness">Open Wellness Studio</button>`;
  const routine=all('#page .card').find(c=>/^(Morning Routine|Morning Reset)$/i.test((c.querySelector('h3')?.textContent||'').trim())||/Power on gently/i.test(c.textContent||''));
  if(routine && !routine.querySelector('[data-morning-value-635]')) routine.innerHTML=`<div class="mini">Power on gently</div><h3>Morning Reset</h3><div class="routine-summary-number brief-live-value-635" data-morning-value-635></div><div class="bar"><span data-morning-bar-635></span></div><p class="brief-live-copy-635" data-morning-copy-635></p><button type="button" class="btn ghost wide-635" data-route-635="sanctuary">Open Sanctuary</button>`;
}

function ensureWellnessGym(){if(!isPage('Wellness Studio'))return;let card=$('#wellnessGym635')||$('#wellnessGym634')||all('#page .card').find(c=>/^(Gym|Gym Time)$/i.test((c.querySelector('h3')?.textContent||'').trim()));
  all('#page .card').forEach(c=>{if(c===card)return;const h=(c.querySelector('h3')?.textContent||'').trim();if(/^(Gym|Gym Time)$/i.test(h))c.remove();});
  if(!card){card=document.createElement('article');card.className='card gradient-card wellness-gym-635';const water=all('#page .card').find(c=>/^Water$/i.test((c.querySelector('h3')?.textContent||'').trim()));water?.insertAdjacentElement('afterend',card);if(!water)$('#page')?.append(card);} card.id='wellnessGym635';
  if(!card.querySelector('[data-gym-value-635]')) card.innerHTML=`<div class="section-title"><div><div class="eyebrow">Daily movement</div><h3>Gym Time</h3></div><span class="pill" data-gym-pill-635></span></div><div class="metric" data-gym-value-635></div><p class="muted">Minutes logged today</p><div class="bar"><span data-gym-bar-635></span></div><div class="controls-635 gym-controls-635"><button type="button" class="btn ghost" data-gym-step-635="-15">− 15 min</button><button type="button" class="btn ghost" data-gym-step-635="-5">− 5 min</button><button type="button" class="btn" data-gym-step-635="5">＋ 5 min</button><button type="button" class="btn" data-gym-step-635="15">＋ 15 min</button></div><label>Today’s gym goal<div class="goal-row-635"><input class="input" type="number" min="1" step="5" inputmode="numeric" data-gym-goal-635><button type="button" class="btn" data-save-gym-goal-635>Save goal</button></div></label><div class="status" data-gym-status-635>Gym time syncs directly to Morning Brief.</div>`;
}

function paintSobriety(){if(!isPage('Wellness Studio'))return;const days=soberDaysInclusive();const tracker=$('#sobrietyTracker6B18')||all('#page .card').find(c=>/Sobriety Tracker/i.test(c.textContent||''));if(!tracker)return;const pill=tracker.querySelector('.pill'),metric=tracker.querySelector('.metric');if(pill)pill.textContent=`${days} day${days===1?'':'s'}`;if(metric)metric.textContent=String(days);}
function paint(){const s=store.get(),water=clamp(s.water,0,8),g=gymData(),gpct=clamp(Math.round(g.minutes/g.goal*100),0,100),m=morningData(),mpct=m.total?clamp(Math.round(m.done/m.total*100),0,100):0;
  all('[data-water-value-635]').forEach(n=>n.textContent=`${water}/8`);all('[data-water-bar-635]').forEach(n=>n.style.width=`${water/8*100}%`);
  all('[data-gym-value-635]').forEach(n=>n.textContent=`${g.minutes} min`);all('[data-gym-pill-635]').forEach(n=>n.textContent=`${g.minutes} / ${g.goal} min`);all('[data-gym-goal-635]').forEach(n=>{if(document.activeElement!==n)n.value=g.goal});all('[data-gym-bar-635],[data-gym-bar-635]').forEach(n=>n.style.width=`${gpct}%`);
  all('[data-brief-gym-value-635]').forEach(n=>n.textContent=`${g.minutes} min`);all('[data-brief-gym-copy-635]').forEach(n=>n.textContent=`${g.minutes} of ${g.goal} minutes`);all('[data-brief-gym-pct-635]').forEach(n=>n.textContent=`${gpct}% of today’s goal · logged in Wellness Studio.`);
  all('[data-morning-value-635]').forEach(n=>n.textContent=`${m.done} of ${m.total}`);all('[data-morning-bar-635]').forEach(n=>n.style.width=`${mpct}%`);all('[data-morning-copy-635]').forEach(n=>n.textContent=`${m.done} of ${m.total} Sanctuary Morning Reset items complete.`);
  paintSobriety();
}

function handleClick(e){const water=e.target.closest('[data-water-step-635]');if(water){e.preventDefault();e.stopImmediatePropagation();store.mutate(d=>{d.water=clamp((Number(d.water)||0)+Number(water.dataset.waterStep635),0,8)});paint();return;}const gym=e.target.closest('[data-gym-step-635]');if(gym){e.preventDefault();e.stopImmediatePropagation();store.mutate(d=>{d.gymMinutes=Math.max(0,Math.round(Number(d.gymMinutes)||0)+Number(gym.dataset.gymStep635));d.wellness=d.wellness||{};d.wellness.gymDate=todayKey();});paint();return;}const save=e.target.closest('[data-save-gym-goal-635]');if(save){e.preventDefault();e.stopImmediatePropagation();const input=$('[data-gym-goal-635]');const goal=Math.max(1,Math.round(Number(input?.value)||60));store.mutate(d=>{d.wellness=d.wellness||{};d.wellness.gymGoalMinutes=goal});const status=$('[data-gym-status-635]');if(status)status.textContent='Daily gym goal saved and synced to Morning Brief.';paint();return;}const route=e.target.closest('[data-route-635]');if(route){e.preventDefault();e.stopImmediatePropagation();routeTo(route.dataset.route635);}}

function reconcile(){ensureWellnessGym();ensureBrief();paint();const b=$('#kcBuildStatus b');if(b)b.textContent=BUILD;}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;reconcile()})}
document.addEventListener('click',handleClick,true);
window.addEventListener('kc:state',paint);window.addEventListener('hashchange',()=>setTimeout(reconcile,0));window.addEventListener('kc:ui-refresh',()=>setTimeout(reconcile,0));new MutationObserver(schedule).observe($('#page')||document.body,{childList:true,subtree:true});
reconcile();setTimeout(reconcile,100);setTimeout(reconcile,500);setTimeout(reconcile,1200);
