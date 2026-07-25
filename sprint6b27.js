import {store} from './store.js';

const BUILD='Sprint 6B.27 Final Functional Synchronization';
const $=(s,r=document)=>r.querySelector(s);
const all=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));

function morningProgress(state=store.get()){
  const sanctuary=state.sanctuary||{};
  const configured=Array.isArray(sanctuary.routines?.morning)?sanctuary.routines.morning.length:0;
  const completed=Array.isArray(sanctuary.completed?.morning)?sanctuary.completed.morning:[];
  const saved=Math.max(0,Number(sanctuary.routineTotals?.morning)||0);
  const total=Math.max(1,configured,completed.length,saved,4);
  let done=0;
  for(let i=0;i<total;i++)if(Boolean(completed[i]))done++;
  return {done,total,pct:Math.round(done/total*100)};
}

function localDate(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// Wellness Studio treats the reset date itself as day one.
function soberDays(state=store.get()){
  const reset=state.sobriety?.lastReset;
  if(!reset)return 0;
  const start=new Date(`${reset}T00:00:00`);
  const today=new Date(`${localDate()}T00:00:00`);
  if(Number.isNaN(start.getTime())||Number.isNaN(today.getTime()))return 0;
  return Math.max(1,Math.floor((today-start)/86400000)+1);
}

function findMetricCard(label){
  return all('#page .brief-metric-grid > .card').find(card=>{
    const mini=card.querySelector('.mini');
    return mini&&mini.textContent.trim().toLowerCase()===label.toLowerCase();
  });
}

function renderWaterCard(){
  const card=findMetricCard('Water');
  if(!card)return;
  const value=clamp(Number(store.get().water)||0,0,8);
  card.classList.add('brief-water-6b27');
  card.innerHTML=`
    <div class="mini">Water</div>
    <div class="metric" data-water-count-6b27>${value}/8</div>
    <div class="bar"><span data-water-bar-6b27 style="width:${value/8*100}%"></span></div>
    <div class="brief-water-controls-6b27">
      <button type="button" class="btn ghost" data-water-delta-6b27="-1" aria-label="Remove one glass of water">−</button>
      <button type="button" class="btn" data-water-delta-6b27="1" aria-label="Add one glass of water">＋</button>
    </div>
    <small>Synced with Wellness Studio.</small>`;
}

function updateWater(){
  const value=clamp(Number(store.get().water)||0,0,8);
  all('[data-water-count-6b27]').forEach(node=>node.textContent=`${value}/8`);
  all('[data-water-bar-6b27]').forEach(node=>node.style.width=`${value/8*100}%`);
}

function findMorningCard(){
  return all('#page .card').find(card=>{
    const heading=card.querySelector('h3');
    return heading&&heading.textContent.trim()==='Morning Routine';
  });
}

function renderMorningRoutine(){
  const card=findMorningCard();
  if(!card)return;
  const p=morningProgress();
  card.classList.add('morning-routine-card','morning-routine-6b27');
  card.innerHTML=`
    <div class="mini">Power on gently</div>
    <h3>Morning Routine</h3>
    <div class="routine-summary-number" data-morning-count-6b27>${p.done} of ${p.total}</div>
    <div class="bar"><span data-morning-bar-6b27 style="width:${p.pct}%"></span></div>
    <p data-morning-copy-6b27>${p.pct===100?'Morning rhythm complete.':'Synced live from Sanctuary’s Morning Reset.'}</p>
    <button type="button" class="btn ghost" data-jump="sanctuary">Open Sanctuary</button>`;
}

function updateMorningRoutine(){
  const p=morningProgress();
  all('[data-morning-count-6b27]').forEach(node=>node.textContent=`${p.done} of ${p.total}`);
  all('[data-morning-bar-6b27]').forEach(node=>node.style.width=`${p.pct}%`);
  all('[data-morning-copy-6b27]').forEach(node=>node.textContent=p.pct===100?'Morning rhythm complete.':'Synced live from Sanctuary’s Morning Reset.');
}

function renderDashboardSobriety(){
  const panel=all('#page .dashboard-panel').find(card=>/Wellness today/i.test(card.textContent||''));
  if(!panel)return;
  const rows=all('.metric-row > span',panel);
  const target=rows.find(span=>/Gym min|Days sober/i.test(span.textContent||''))||rows[1];
  if(target)target.innerHTML=`<b data-sobriety-count-6b27>${soberDays()}</b><small>Days sober</small>`;
}

function updateDashboardSobriety(){
  all('[data-sobriety-count-6b27]').forEach(node=>node.textContent=String(soberDays()));
}

function bindActions(){
  if(document.documentElement.dataset.sprint627Bound)return;
  document.documentElement.dataset.sprint627Bound='true';
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-water-delta-6b27]');
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const delta=Number(button.dataset.waterDelta6b27)||0;
    store.mutate(state=>{state.water=clamp((Number(state.water)||0)+delta,0,8);});
  },true);
}

let stateBound=false;
function bindState(){
  if(stateBound)return;
  stateBound=true;
  window.addEventListener('kc:state',()=>{
    updateWater();
    updateMorningRoutine();
    updateDashboardSobriety();
  });
}

export async function enhanceSprint6B27(id){
  const badge=$('#kcBuildStatus b');
  if(badge)badge.textContent=BUILD;
  bindActions();
  bindState();
  // Run after every older enhancement has finished. No Design + Data or theme code is changed here.
  if(id==='intelligence'){
    renderWaterCard();
    renderMorningRoutine();
  }
  if(id==='dashboard')renderDashboardSobriety();
  requestAnimationFrame(()=>{
    if(id==='intelligence'){
      renderWaterCard();
      renderMorningRoutine();
    }
    if(id==='dashboard')renderDashboardSobriety();
  });
  setTimeout(()=>{
    if(id==='intelligence'){
      renderWaterCard();
      renderMorningRoutine();
    }
    if(id==='dashboard')renderDashboardSobriety();
  },120);
}
