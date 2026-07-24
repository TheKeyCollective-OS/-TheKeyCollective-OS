import {store} from './store.js';

const BUILD='Sprint 6B.24 Connected Savings + Routine Repair';
const $=s=>document.querySelector(s);
const money=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(v)||0);
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));

function morningProgress(state=store.get()){
  const steps=Array.isArray(state.sanctuary?.completed?.morning)?state.sanctuary.completed.morning:[];
  const total=4;
  let done=0;
  for(let i=0;i<total;i++)if(Boolean(steps[i]))done++;
  return {done,total,pct:Math.round(done/total*100)};
}

function savingsData(state=store.get()){
  const current=Math.max(0,Number(state.savings)||0);
  const legacy=(state.savingsGoals||[]).find(g=>/savings goal|emergency fund/i.test(g.name||''));
  const target=Math.max(0,Number(state.financial?.savingsGoal ?? legacy?.target ?? 0)||0);
  const pct=target?clamp(Math.round(current/target*100),0,100):0;
  return {current,target,pct};
}

function routineMarkup(location){
  const p=morningProgress();
  return `<div class="mini">Power on gently</div><h3>Morning Routine</h3><div class="routine-summary-number" data-morning-count-24>${p.done} of ${p.total}</div><div class="bar"><span data-morning-bar-24 style="width:${p.pct}%"></span></div><p data-morning-copy-24>${p.done===p.total?'Morning rhythm complete.':'Synced directly from Sanctuary’s Morning Reset.'}</p><button type="button" class="btn ghost" data-jump="sanctuary">Open Sanctuary</button><span class="sr-only">${location}</span>`;
}

function patchBrief(html){
  const t=document.createElement('template');t.innerHTML=html;
  const cards=[...t.content.querySelectorAll('.brief-metric-grid .card')];
  const movement=cards.find(c=>/Movement/i.test(c.textContent||''));
  if(movement){
    const mins=Math.max(0,Number(store.get().gymMinutes)||0);
    movement.classList.add('editable-movement-6b24');
    movement.innerHTML=`<div class="mini">Movement</div><label class="movement-edit-6b24"><span>Minutes today</span><input id="briefMovement24" type="number" min="0" step="1" inputmode="numeric" value="${mins}"></label><div class="metric" id="briefMovementValue24">${mins} min</div><button type="button" class="btn" id="saveMovement24">Save Movement</button><p class="muted" id="briefMovementStatus24">Enter minutes, then tap Save.</p>`;
  }
  const savings=cards.find(c=>/Savings goals?/i.test(c.textContent||''));
  if(savings){
    const d=savingsData();
    savings.classList.add('editable-savings-6b24');
    savings.innerHTML=`<div class="mini">Savings goal</div><div class="metric" id="briefSavingsPct24">${d.pct}%</div><p class="muted" id="briefSavingsCopy24">${money(d.current)} of ${d.target?money(d.target):'goal not set'}</p><label class="savings-goal-edit-6b24"><span>Goal amount</span><input id="briefSavingsGoal24" type="number" min="0" step="0.01" inputmode="decimal" value="${d.target||''}" placeholder="5000.00"></label><button type="button" class="btn" id="saveSavingsGoal24">Save Savings Goal</button><p class="muted" id="briefSavingsStatus24">Current savings comes from Financial Studio.</p>`;
  }
  let routine=t.content.querySelector('.morning-routine-card');
  if(!routine){
    routine=document.createElement('article');
    routine.className='card morning-routine-card';
    const grid=t.content.querySelector('.intelligence-grid');
    if(grid)grid.before(routine);
  }
  routine.innerHTML=routineMarkup('Morning Brief');
  return t.innerHTML;
}

function patchDashboard(html){
  const t=document.createElement('template');t.innerHTML=html;
  const cards=[...t.content.querySelectorAll('.card')];
  let routine=cards.find(c=>/Morning Routine|Sanctuary progress/i.test(c.textContent||''));
  if(routine){
    routine.dataset.morningRoutine24='true';
    routine.innerHTML=routineMarkup('Executive Dashboard');
  }
  return t.innerHTML;
}

export function patchPagesSprint6B24(pages){
  const brief=pages.intelligence,dashboard=pages.dashboard;
  pages.intelligence=()=>patchBrief(brief());
  pages.dashboard=()=>patchDashboard(dashboard());
}

function updateRoutineDom(){
  const p=morningProgress();
  document.querySelectorAll('[data-morning-count-24]').forEach(n=>n.textContent=`${p.done} of ${p.total}`);
  document.querySelectorAll('[data-morning-bar-24]').forEach(n=>n.style.width=`${p.pct}%`);
  document.querySelectorAll('[data-morning-copy-24]').forEach(n=>n.textContent=p.done===p.total?'Morning rhythm complete.':'Synced directly from Sanctuary’s Morning Reset.');
}

function updateSavingsDom(){
  const d=savingsData();
  const pct=$('#briefSavingsPct24'),copy=$('#briefSavingsCopy24');
  if(pct)pct.textContent=`${d.pct}%`;
  if(copy)copy.textContent=`${money(d.current)} of ${d.target?money(d.target):'goal not set'}`;
}

function persistSavingsGoal(raw){
  const target=Math.max(0,Number(raw)||0);
  store.mutate(s=>{
    s.financial={...(s.financial||{}),savingsGoal:target};
    s.savingsGoals=Array.isArray(s.savingsGoals)?s.savingsGoals:[];
    let goal=s.savingsGoals.find(g=>/savings goal/i.test(g.name||''));
    if(!goal){
      goal={id:`savings-goal-${Date.now()}`,name:'Savings Goal',current:Number(s.savings)||0,target,createdAt:new Date().toISOString()};
      s.savingsGoals.push(goal);
    }else{
      goal.name='Savings Goal';goal.current=Number(s.savings)||0;goal.target=target;
    }
  });
}

function syncSavingsMilestone(){
  const s=store.get();
  const goal=(s.savingsGoals||[]).find(g=>/savings goal/i.test(g.name||''));
  if(!goal)return;
  const current=Number(s.savings)||0,target=Number(s.financial?.savingsGoal ?? goal.target)||0;
  if(Number(goal.current)===current&&Number(goal.target)===target)return;
  store.mutate(d=>{
    const g=(d.savingsGoals||[]).find(x=>/savings goal/i.test(x.name||''));
    if(g){g.current=Number(d.savings)||0;g.target=Number(d.financial?.savingsGoal ?? g.target)||0;}
  });
}

function bindMovement(){
  const input=$('#briefMovement24'),button=$('#saveMovement24');if(!input||!button)return;
  const save=()=>{
    const value=Math.max(0,Math.round(Number(input.value)||0));
    input.value=String(value);
    store.mutate(s=>{s.gymMinutes=value});
    const out=$('#briefMovementValue24');if(out)out.textContent=`${value} min`;
    const status=$('#briefMovementStatus24');if(status)status.textContent='Movement saved.';
  };
  button.addEventListener('click',save);
  input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();save();input.blur();}});
  input.addEventListener('input',()=>{const status=$('#briefMovementStatus24');if(status)status.textContent='Unsaved changes — tap Save.';});
}

function bindSavings(){
  const input=$('#briefSavingsGoal24'),button=$('#saveSavingsGoal24');if(!input||!button)return;
  const save=()=>{
    persistSavingsGoal(input.value);
    updateSavingsDom();
    const status=$('#briefSavingsStatus24');if(status)status.textContent='Savings goal saved and milestone synchronized.';
  };
  button.addEventListener('click',save);
  input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();save();input.blur();}});
  input.addEventListener('input',()=>{const status=$('#briefSavingsStatus24');if(status)status.textContent='Unsaved goal — tap Save.';});
}

let globalBound=false;
function bindGlobalSync(){
  if(globalBound)return;globalBound=true;
  window.addEventListener('kc:state',()=>{
    updateRoutineDom();updateSavingsDom();syncSavingsMilestone();
  });
}

export async function enhanceSprint6B24(id){
  const badge=$('#kcBuildStatus b');if(badge)badge.textContent=BUILD;
  bindGlobalSync();
  if(id==='intelligence'){bindMovement();bindSavings();updateRoutineDom();updateSavingsDom();}
  if(id==='dashboard')updateRoutineDom();
  if(id==='money')syncSavingsMilestone();
}
