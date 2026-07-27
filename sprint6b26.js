import {store} from './store.js';

const BUILD='Sprint 6B.26 Executive Polish + Synchronization';
const $=(s,r=document)=>r.querySelector(s);
const all=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));

function morningProgress(state=store.get()){
  const configured=Array.isArray(state.sanctuary?.routines?.morning)?state.sanctuary.routines.morning.length:0;
  const total=Math.max(1,configured||Number(state.sanctuary?.routineTotals?.morning)||4);
  const checks=Array.isArray(state.sanctuary?.completed?.morning)?state.sanctuary.completed.morning:[];
  let done=0;
  for(let i=0;i<total;i++)if(Boolean(checks[i]))done++;
  return {done,total,pct:Math.round(done/total*100)};
}

function localDate(){
  const p=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Phoenix',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),v=Object.fromEntries(p.map(x=>[x.type,x.value]));
  return `${v.year}-${v.month}-${v.day}`;
}

function soberDays(state=store.get()){
  const reset=state.sobriety?.startDate||state.sobriety?.lastReset;
  if(!reset)return 0;
  const [ay,am,ad]=reset.split('-').map(Number),[by,bm,bd]=localDate().split('-').map(Number);
  return Math.max(1,Math.floor((Date.UTC(by,bm-1,bd)-Date.UTC(ay,am-1,ad))/86400000)+1);
}

function closestGoals(state=store.get()){
  const goals=Array.isArray(state.goals)?state.goals:[];
  const normalized=goals.map((goal,index)=>({
    name:String(goal.name||goal.title||`Goal ${index+1}`),
    progress:clamp(Math.round(Number(goal.progress)||0),0,100),
    index
  }));
  const active=normalized.filter(goal=>goal.progress<100).sort((a,b)=>b.progress-a.progress||a.index-b.index);
  const complete=normalized.filter(goal=>goal.progress>=100).sort((a,b)=>a.index-b.index);
  return [...active,...complete].slice(0,3);
}

function topGoalsMarkup(){
  const goals=closestGoals();
  if(!goals.length)return '<div class="status">Add milestones in 25 Hard to see your closest wins here.</div>';
  return `<div class="closest-goals-6b26">${goals.map((goal,index)=>`<div class="closest-goal-6b26"><span class="goal-rank-6b26">${index+1}</span><div><b>${escapeHtml(goal.name)}</b><div class="bar"><span style="width:${goal.progress}%"></span></div></div><strong>${goal.progress}%</strong></div>`).join('')}</div>`;
}

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
}

function patchBrief(html){
  const t=document.createElement('template');
  t.innerHTML=html;
  const cards=all('.brief-metric-grid .card',t.content);

  const water=cards.find(card=>/^\s*Water\b/i.test(card.textContent||''));
  if(water){
    const value=clamp(Number(store.get().water)||0,0,99);
    water.classList.add('brief-water-6b26');
    water.innerHTML=`<div class="mini">Water</div><div class="metric" data-brief-water-count-6b26>${value}/8</div><div class="bar"><span data-brief-water-bar-6b26 style="width:${clamp(value/8*100,0,100)}%"></span></div><div class="button-row brief-water-actions-6b26"><button type="button" class="btn ghost" data-brief-water-6b26="-1" aria-label="Remove one glass of water">−</button><button type="button" class="btn" data-brief-water-6b26="1">Add water</button></div><p class="muted">Synced with Wellness Studio.</p>`;
  }

  const hard=cards.find(card=>/25 Hard/i.test(card.textContent||''));
  if(hard){
    hard.classList.add('brief-hard-6b26');
    hard.innerHTML=`<div class="section-title"><div><div class="mini">25 Hard</div><h3>Top 3 closest goals</h3></div><button type="button" class="btn ghost compact" data-jump="goals">Open</button></div><div data-closest-goals-6b26>${topGoalsMarkup()}</div>`;
  }

  let routine=t.content.querySelector('.morning-routine-card');
  if(routine){
    const p=morningProgress();
    routine.dataset.morningRoutine626='true';
    routine.innerHTML=`<div class="mini">Power on gently</div><h3>Morning Routine</h3><div class="routine-summary-number" data-morning-count-626>${p.done} of ${p.total}</div><div class="bar"><span data-morning-bar-626 style="width:${p.pct}%"></span></div><p data-morning-copy-626>${p.pct===100?'Morning rhythm complete.':'Synced live from Sanctuary’s Morning Reset.'}</p><button type="button" class="btn ghost" data-jump="sanctuary">Open Sanctuary</button>`;
  }
  return t.innerHTML;
}

function patchDashboard(html){
  const t=document.createElement('template');
  t.innerHTML=html;
  const wellness=all('.dashboard-panel',t.content).find(card=>/Wellness today/i.test(card.textContent||''));
  if(wellness){
    const spans=all('.metric-row > span',wellness);
    const target=spans.find(span=>/Gym min|Days sober/i.test(span.textContent||''));
    if(target)target.innerHTML=`<b data-dashboard-sobriety-6b26>${soberDays()}</b><small>Days sober</small>`;
  }
  return t.innerHTML;
}

export function patchPagesSprint6B26(pages){
  const brief=pages.intelligence;
  const dashboard=pages.dashboard;
  pages.intelligence=()=>patchBrief(brief());
  pages.dashboard=()=>patchDashboard(dashboard());
}

function renderWater(){
  const value=clamp(Number(store.get().water)||0,0,99);
  all('[data-brief-water-count-6b26]').forEach(node=>node.textContent=`${value}/8`);
  all('[data-brief-water-bar-6b26]').forEach(node=>node.style.width=`${clamp(value/8*100,0,100)}%`);
}

function renderRoutine(){
  const p=morningProgress();
  all('[data-morning-count-626]').forEach(node=>node.textContent=`${p.done} of ${p.total}`);
  all('[data-morning-bar-626]').forEach(node=>node.style.width=`${p.pct}%`);
  all('[data-morning-copy-626]').forEach(node=>node.textContent=p.pct===100?'Morning rhythm complete.':'Synced live from Sanctuary’s Morning Reset.');
}

function renderClosestGoals(){
  all('[data-closest-goals-6b26]').forEach(node=>node.innerHTML=topGoalsMarkup());
}

function renderSobriety(){
  all('[data-dashboard-sobriety-6b26]').forEach(node=>node.textContent=String(soberDays()));
}

function bindActions(){
  if(document.documentElement.dataset.sprint626Bound)return;
  document.documentElement.dataset.sprint626Bound='true';
  document.addEventListener('click',event=>{
    const control=event.target.closest('[data-brief-water-6b26]');
    if(!control)return;
    event.preventDefault();
    const delta=Number(control.dataset.briefWater6b26)||0;
    store.mutate(state=>{state.water=clamp((Number(state.water)||0)+delta,0,99);});
    renderWater();
  },true);
}

function enforceEmeraldContrast(){
  if(document.documentElement.dataset.theme!=='emerald')return;
  all('#page .card, #page .module, #page .status, #page .entry, #page .brief-line, #page .insight, #page .ritual-checks label').forEach(node=>node.classList.add('emerald-light-surface-6b26'));
  all('#page .btn:not(.ghost):not(.secondary), .sidebar, .sidebar *, .command-banner').forEach(node=>node.classList.add('emerald-dark-surface-6b26'));
}

let stateBound=false;
function bindStateSync(){
  if(stateBound)return;
  stateBound=true;
  window.addEventListener('kc:state',()=>{
    renderWater();
    renderRoutine();
    renderClosestGoals();
    renderSobriety();
    requestAnimationFrame(enforceEmeraldContrast);
  });
}

export async function enhanceSprint6B26(id){
  const badge=$('#kcBuildStatus b');
  if(badge)badge.textContent=BUILD;
  bindActions();
  bindStateSync();
  if(id==='intelligence'){
    renderWater();
    renderRoutine();
    renderClosestGoals();
  }
  if(id==='dashboard')renderSobriety();
  requestAnimationFrame(()=>requestAnimationFrame(enforceEmeraldContrast));
}
