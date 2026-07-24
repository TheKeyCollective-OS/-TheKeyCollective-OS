import {store} from './store.js';

const BUILD='Sprint 6B.23 Forced Sync + Contrast';
const $=s=>document.querySelector(s);
const money=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(v)||0);

function sanctuaryProgress(){
  const completed=store.get().sanctuary?.completed||{};
  let done=0,total=0;
  Object.values(completed).forEach(group=>{
    if(Array.isArray(group)){total+=group.length;done+=group.filter(Boolean).length;}
  });
  return {done,total};
}

function patchBrief(html){
  const t=document.createElement('template');t.innerHTML=html;
  const cards=[...t.content.querySelectorAll('.brief-metric-grid .card')];
  const movement=cards.find(c=>/Movement/i.test(c.textContent||''));
  if(movement){
    const mins=Number(store.get().gymMinutes||0);
    movement.classList.add('editable-movement-6b23');
    movement.innerHTML=`<div class="mini">Movement</div><label class="movement-edit-6b23"><span>Minutes today</span><input id="briefMovement23" type="number" min="0" step="1" inputmode="numeric" value="${mins}"></label><div class="metric" id="briefMovementValue23">${mins} min</div><p class="muted" id="briefMovementStatus23">Updates as you type.</p>`;
  }
  return t.innerHTML;
}

function patchDashboard(html){
  const t=document.createElement('template');t.innerHTML=html;
  const p=sanctuaryProgress();
  const cards=[...t.content.querySelectorAll('.card')];
  const routine=cards.find(c=>/Morning routine|Sanctuary progress/i.test(c.textContent||''));
  if(routine){
    const pill=routine.querySelector('.pill');
    if(pill)pill.textContent=`${p.done} of ${p.total}`;
    const h=routine.querySelector('h3');
    if(h)h.textContent='Sanctuary progress';
    const status=[...routine.querySelectorAll('p,.status,small')].find(n=>/Sanctuary|routine|synchronized|complete/i.test(n.textContent||''));
    if(status)status.textContent=`${p.done} of ${p.total} Sanctuary steps complete.`;
  }
  return t.innerHTML;
}

function patchMoney(html){
  const t=document.createElement('template');t.innerHTML=html;
  const hero=[...t.content.querySelectorAll('.forecast-hero')][0];
  if(hero){
    hero.dataset.forecastHero23='true';
    const metric=hero.querySelector('.metric');if(metric)metric.id='forecastMargin23';
    hero.querySelectorAll('.forecast-strip b').forEach((b,i)=>b.dataset.forecastMonth=[1,3,6,12][i]);
  }
  const income=t.content.querySelector('#forecastIncome');
  const spending=t.content.querySelector('#forecastSpending');
  if(income)income.setAttribute('inputmode','decimal');
  if(spending)spending.setAttribute('inputmode','decimal');
  const btn=t.content.querySelector('#saveForecast');
  if(btn)btn.textContent='Forecast saves automatically';
  return t.innerHTML;
}

export function patchPagesSprint6B23(pages){
  const brief=pages.intelligence,dash=pages.dashboard,moneyPage=pages.money;
  pages.intelligence=()=>patchBrief(brief());
  pages.dashboard=()=>patchDashboard(dash());
  pages.money=()=>patchMoney(moneyPage());
}

function bindMovement(){
  const input=$('#briefMovement23');if(!input)return;
  const save=()=>{
    const value=Math.max(0,Math.round(Number(input.value)||0));
    store.mutate(s=>{s.gymMinutes=value});
    const out=$('#briefMovementValue23');if(out)out.textContent=`${value} min`;
    const status=$('#briefMovementStatus23');if(status)status.textContent='Movement saved.';
  };
  input.addEventListener('input',save);input.addEventListener('change',save);
}

function bindForecast(){
  const income=$('#forecastIncome'),spending=$('#forecastSpending');if(!income||!spending)return;
  const update=()=>{
    const monthlyIncome=Math.max(0,Number(income.value)||0);
    const monthlySpending=Math.max(0,Number(spending.value)||0);
    store.mutate(s=>{s.monthlyIncome=monthlyIncome;s.financial={...(s.financial||{}),monthlySpending};});
    const bills=(store.get().bills||[]).reduce((n,b)=>n+Number(b.amount||0),0);
    const margin=monthlyIncome-monthlySpending-bills;
    const metric=$('#forecastMargin23');if(metric)metric.textContent=money(margin);
    document.querySelectorAll('[data-forecast-month]').forEach(n=>{n.textContent=money(margin*Number(n.dataset.forecastMonth||1));});
    const pill=[...document.querySelectorAll('.pagehead .pill')].find(n=>/Forecast/i.test(n.textContent||''));
    if(pill)pill.textContent=`Forecast ${margin>=0?'positive':'attention needed'}`;
  };
  income.addEventListener('input',update);spending.addEventListener('input',update);
  income.addEventListener('change',update);spending.addEventListener('change',update);
  $('#saveForecast')?.addEventListener('click',e=>{e.preventDefault();update();});
}

export async function enhanceSprint6B23(id){
  const badge=$('#kcBuildStatus b');if(badge)badge.textContent=BUILD;
  if(id==='intelligence')bindMovement();
  if(id==='money')bindForecast();
}
