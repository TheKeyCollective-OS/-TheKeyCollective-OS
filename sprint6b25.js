import {store} from './store.js';

const BUILD='Sprint 6B.25 Stability + Sanctuary History';
const DAILY_IDS=['morning','afternoon','evening'];
const DEFAULT_TOTALS={morning:4,afternoon:4,evening:4};
const $=(s,r=document)=>r.querySelector(s);
const all=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const money=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(v)||0);
const localDate=(d=new Date())=>{
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
};

function countArray(value,total){
  const values=Array.isArray(value)?value:[];
  let completed=0;
  for(let i=0;i<total;i++)if(Boolean(values[i]))completed++;
  return completed;
}
function totalsFromState(state){
  const saved=state.sanctuary?.routineTotals||{};
  return {
    morning:Math.max(1,Number(saved.morning)||DEFAULT_TOTALS.morning),
    afternoon:Math.max(1,Number(saved.afternoon)||DEFAULT_TOTALS.afternoon),
    evening:Math.max(1,Number(saved.evening)||DEFAULT_TOTALS.evening)
  };
}
function snapshotFor(state,date=localDate()){
  const totals=totalsFromState(state),completed=state.sanctuary?.completed||{};
  const periods={};let total=0,done=0;
  DAILY_IDS.forEach(id=>{
    const possible=totals[id],finished=countArray(completed[id],possible);
    periods[id]={completed:finished,total:possible};total+=possible;done+=finished;
  });
  return {date,completed:done,total,periods,updatedAt:new Date().toISOString()};
}
function emptySnapshotFor(state,date){
  const totals=totalsFromState(state),periods={};let total=0;
  DAILY_IDS.forEach(id=>{periods[id]={completed:0,total:totals[id]};total+=totals[id];});
  return {date,completed:0,total,periods,updatedAt:new Date().toISOString()};
}
function ensureDailyRollover(){
  const state=store.get(),today=localDate();
  const sanctuary=state.sanctuary||{};
  const last=sanctuary.dailyDate;
  if(last===today){syncTodaySnapshot();return;}
  store.mutate(d=>{
    d.sanctuary=d.sanctuary||{completed:{},notes:{},routines:{}};
    d.sanctuary.history=d.sanctuary.history||{};
    if(d.sanctuary.dailyDate){
      const previous=d.sanctuary.dailyDate;
      d.sanctuary.history[previous]=snapshotFor(d,previous);
      const cursor=dateAtStart(previous),todayDate=dateAtStart(today);
      if(cursor&&todayDate){
        cursor.setDate(cursor.getDate()+1);
        while(cursor<todayDate){
          const key=localDate(cursor);
          if(!d.sanctuary.history[key])d.sanctuary.history[key]=emptySnapshotFor(d,key);
          cursor.setDate(cursor.getDate()+1);
        }
      }
      DAILY_IDS.forEach(id=>{d.sanctuary.completed[id]=[];});
    }
    d.sanctuary.dailyDate=today;
    d.sanctuary.routineTotals={...DEFAULT_TOTALS,...(d.sanctuary.routineTotals||{})};
    d.sanctuary.history[today]=snapshotFor(d,today);
  });
}
function syncTodaySnapshot(){
  const state=store.get(),today=localDate();
  const next=snapshotFor(state,today),old=state.sanctuary?.history?.[today];
  if(old&&old.completed===next.completed&&old.total===next.total)return;
  store.mutate(d=>{
    d.sanctuary=d.sanctuary||{};d.sanctuary.history=d.sanctuary.history||{};
    d.sanctuary.dailyDate=today;d.sanctuary.history[today]=snapshotFor(d,today);
  });
}
function dateAtStart(date){const d=new Date(`${date}T00:00:00`);return Number.isNaN(d.getTime())?null:d;}
function periodStats(kind){
  const state=store.get(),today=localDate(),history={...(state.sanctuary?.history||{}),[today]:snapshotFor(state,today)};
  const now=dateAtStart(today);let start=new Date(now);
  if(kind==='week'){const offset=(now.getDay()+6)%7;start.setDate(now.getDate()-offset);}
  if(kind==='month')start=new Date(now.getFullYear(),now.getMonth(),1);
  if(kind==='year')start=new Date(now.getFullYear(),0,1);
  let completed=0,total=0,days=0;
  Object.values(history).forEach(row=>{
    const d=dateAtStart(row.date);if(!d||d<start||d>now)return;
    completed+=Number(row.completed)||0;total+=Number(row.total)||0;days++;
  });
  return {completed,total,days,pct:total?Math.round(completed/total*100):0};
}
function currentStreak(){
  const state=store.get(),today=localDate(),history={...(state.sanctuary?.history||{}),[today]:snapshotFor(state,today)};
  let streak=0,d=new Date();
  for(let i=0;i<366;i++){
    const key=localDate(d),row=history[key];
    if(!row||!row.total||row.completed/row.total<.8)break;
    streak++;d.setDate(d.getDate()-1);
  }
  return streak;
}
function statCard(label,data){
  return `<article class="sanctuary-stat-6b25"><div class="mini">${label}</div><strong>${data.completed} of ${data.total}</strong><div class="bar"><span style="width:${clamp(data.pct,0,100)}%"></span></div><small>${data.pct}% complete${data.days?` · ${data.days} day${data.days===1?'':'s'}`:''}</small></article>`;
}
function sanctuarySummaryMarkup(){
  const today=periodStats('today'),week=periodStats('week'),month=periodStats('month'),year=periodStats('year'),streak=currentStreak();
  return `<section class="card sanctuary-history-6b25" id="sanctuaryHistory625"><div class="section-title"><div><div class="eyebrow">Consistency ledger</div><h2>Routine progress</h2><p>Completed checklist items compared with all available items—partial days count.</p></div><span class="pill">80% streak · ${streak} day${streak===1?'':'s'}</span></div><div class="sanctuary-stats-grid-6b25">${statCard('Today',today)}${statCard('This week',week)}${statCard('This month',month)}${statCard('Year to date',year)}</div><p class="muted sanctuary-rule-6b25">A streak day qualifies when at least 80% of the day’s Morning, Afternoon, and Evening items are completed.</p></section>`;
}
function afternoonMarkup(state){
  const steps=Array.isArray(state.sanctuary?.routines?.afternoon)&&state.sanctuary.routines.afternoon.length?state.sanctuary.routines.afternoon:['Midday reset','Hydration check','Review priorities','Clear one small space'];
  const completed=state.sanctuary?.completed?.afternoon||[];
  return `<article class="card ritual-card" data-daily-routine-625="afternoon"><span class="ritual-icon">🌤️</span><div><div class="mini">afternoon</div><h3>Afternoon Reset</h3><p>Pause, restore focus, and protect the rest of the day.</p></div><div class="ritual-checks">${steps.map((step,i)=>`<label><input type="checkbox" data-ritual="afternoon" data-step="${i}" ${completed[i]?'checked':''}><span>${step}</span></label>`).join('')}</div><textarea data-ritual-note="afternoon" rows="2" placeholder="Add a private note…">${String(state.sanctuary?.notes?.afternoon||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}</textarea></article>`;
}
function patchSanctuary(html){
  const t=document.createElement('template');t.innerHTML=html;
  const hero=t.content.querySelector('.sanctuary-hero');if(hero)hero.insertAdjacentHTML('afterend',sanctuarySummaryMarkup());
  const morning=all('.ritual-card',t.content).find(c=>c.querySelector('[data-ritual="morning"]'));
  if(morning&&!t.content.querySelector('[data-ritual="afternoon"]'))morning.insertAdjacentHTML('afterend',afternoonMarkup(store.get()));
  return t.innerHTML;
}
function patchDashboard(html){
  const t=document.createElement('template');t.innerHTML=html;
  all('.card',t.content).forEach(card=>{
    if(card.closest('.module-grid'))return;
    const text=(card.textContent||'').replace(/\s+/g,' ').trim();
    if(/Morning Routine/i.test(text)&&(/Power on gently|Open Sanctuary|of \d+/i.test(text)))card.remove();
  });
  return t.innerHTML;
}
function patchBrief(html){
  const t=document.createElement('template');t.innerHTML=html;
  const movement=t.content.querySelector('.editable-movement-6b24');
  if(movement){
    movement.classList.add('stable-control-6b25');
    const input=movement.querySelector('#briefMovement24');if(input)input.setAttribute('data-stable-movement-625','');
    const button=movement.querySelector('#saveMovement24');if(button){button.type='button';button.setAttribute('data-save-movement-625','');}
  }
  const savings=t.content.querySelector('.editable-savings-6b24');
  if(savings){
    savings.classList.add('stable-control-6b25');
    const input=savings.querySelector('#briefSavingsGoal24');if(input)input.setAttribute('data-stable-savings-625','');
    const button=savings.querySelector('#saveSavingsGoal24');if(button){button.type='button';button.setAttribute('data-save-savings-625','');}
    const d=savingsData();
    const copy=savings.querySelector('#briefSavingsCopy24');if(copy)copy.textContent=`${money(d.current)} of ${d.target?money(d.target):'goal not set'} · ${money(Math.max(0,d.target-d.current))} remaining`;
    let bar=savings.querySelector('.savings-progress-625');
    if(!bar){bar=document.createElement('div');bar.className='bar savings-progress-625';bar.innerHTML=`<span id="briefSavingsBar625" style="width:${d.pct}%"></span>`;savings.querySelector('.metric')?.insertAdjacentElement('afterend',bar);}
  }
  return t.innerHTML;
}
function savingsData(state=store.get()){
  const current=Math.max(0,Number(state.savings)||0),legacy=(state.savingsGoals||[]).find(g=>/savings goal|emergency fund/i.test(g.name||''));
  const target=Math.max(0,Number(state.financial?.savingsGoal??legacy?.target??0)||0);
  return {current,target,pct:target?clamp(Math.round(current/target*100),0,100):0};
}
export function patchPagesSprint6B25(pages){
  const sanctuary=pages.sanctuary,dashboard=pages.dashboard,brief=pages.intelligence;
  pages.sanctuary=()=>patchSanctuary(sanctuary());
  pages.dashboard=()=>patchDashboard(dashboard());
  pages.intelligence=()=>patchBrief(brief());
}
function saveMovement(input){
  const value=Math.max(0,Math.round(Number(input?.value)||0));
  localStorage.setItem('kc6b25.movement',String(value));
  store.mutate(s=>{s.gymMinutes=value;s.wellness={...(s.wellness||{}),movementMinutes:value};});
  if(input)input.value=String(value);
  const out=$('#briefMovementValue24');if(out)out.textContent=`${value} min`;
  const status=$('#briefMovementStatus24');if(status)status.textContent='Movement saved.';
}
function saveSavings(input){
  const target=Math.max(0,Number(input?.value)||0);localStorage.setItem('kc6b25.savingsGoal',String(target));
  store.mutate(s=>{
    s.financial={...(s.financial||{}),savingsGoal:target};s.savingsGoals=Array.isArray(s.savingsGoals)?s.savingsGoals:[];
    let goal=s.savingsGoals.find(g=>/savings goal/i.test(g.name||''));
    if(!goal){goal={id:`savings-goal-${Date.now()}`,name:'Savings Goal',current:Number(s.savings)||0,target,createdAt:new Date().toISOString()};s.savingsGoals.push(goal);}
    goal.current=Number(s.savings)||0;goal.target=target;
  });
  if(input)input.value=target?String(target):'';updateBriefSavings();
  const status=$('#briefSavingsStatus24');if(status)status.textContent='Savings goal saved and synchronized.';
}
function updateBriefSavings(){
  const d=savingsData();
  const pct=$('#briefSavingsPct24'),copy=$('#briefSavingsCopy24'),bar=$('#briefSavingsBar625');
  if(pct)pct.textContent=`${d.pct}%`;
  if(copy)copy.textContent=`${money(d.current)} of ${d.target?money(d.target):'goal not set'} · ${money(Math.max(0,d.target-d.current))} remaining`;
  if(bar)bar.style.width=`${d.pct}%`;
}
function restoreStableInputs(){
  const movement=$('[data-stable-movement-625]');
  if(movement){const stored=localStorage.getItem('kc6b25.movement'),value=stored!==null?Number(stored):Number(store.get().gymMinutes)||0;movement.value=String(Math.max(0,value));}
  const savings=$('[data-stable-savings-625]');
  if(savings){const d=savingsData(),stored=localStorage.getItem('kc6b25.savingsGoal'),value=stored!==null?Number(stored):d.target;savings.value=value?String(value):'';}
  updateBriefSavings();
}
function bindDelegatedActions(){
  if(document.documentElement.dataset.sprint625Bound)return;document.documentElement.dataset.sprint625Bound='true';
  document.addEventListener('click',e=>{
    const move=e.target.closest('[data-save-movement-625],#saveMovement24');if(move){e.preventDefault();e.stopImmediatePropagation();saveMovement($('[data-stable-movement-625],#briefMovement24'));return;}
    const save=e.target.closest('[data-save-savings-625],#saveSavingsGoal24');if(save){e.preventDefault();e.stopImmediatePropagation();saveSavings($('[data-stable-savings-625],#briefSavingsGoal24'));}
  },true);
  document.addEventListener('change',e=>{
    const ritual=e.target.closest('[data-ritual]');
    if(ritual&&DAILY_IDS.includes(ritual.dataset.ritual)){
      const id=ritual.dataset.ritual,index=Number(ritual.dataset.step),checked=ritual.checked;
      store.mutate(d=>{
        d.sanctuary=d.sanctuary||{completed:{},notes:{},routines:{}};
        d.sanctuary.completed=d.sanctuary.completed||{};
        d.sanctuary.completed[id]=Array.isArray(d.sanctuary.completed[id])?d.sanctuary.completed[id]:[];
        d.sanctuary.completed[id][index]=checked;
        d.sanctuary.routineTotals={...(d.sanctuary.routineTotals||{}),[id]:all(`[data-ritual=\"${id}\"]`).length||DEFAULT_TOTALS[id]};
        d.sanctuary.history=d.sanctuary.history||{};d.sanctuary.dailyDate=localDate();
        d.sanctuary.history[localDate()]=snapshotFor(d,localDate());
      });
      renderSanctuaryStats();
      return;
    }
    const note=e.target.closest('[data-ritual-note]');
    if(note&&DAILY_IDS.includes(note.dataset.ritualNote)){
      store.mutate(d=>{d.sanctuary=d.sanctuary||{};d.sanctuary.notes=d.sanctuary.notes||{};d.sanctuary.notes[note.dataset.ritualNote]=note.value;});
    }
  },true);
}
function renderSanctuaryStats(){
  const box=$('#sanctuaryHistory625');if(!box)return;
  const holder=document.createElement('template');holder.innerHTML=sanctuarySummaryMarkup();box.replaceWith(holder.content.firstElementChild);
}
function enforceEmeraldIconContrast(){
  if(document.documentElement.dataset.theme!=='emerald')return;
  all('.module .icon,.topbar .icon-button,.dashboard-shortcuts .icon,.quick-nav .icon').forEach(icon=>{
    icon.style.setProperty('color','#17352b','important');icon.style.setProperty('-webkit-text-fill-color','#17352b','important');icon.style.opacity='1';
  });
}
function removeDashboardRoutine(){
  all('#page .card').forEach(card=>{
    if(card.closest('.module-grid'))return;
    const text=(card.textContent||'').replace(/\s+/g,' ').trim();
    if(/Morning Routine/i.test(text)&&(/Power on gently|Open Sanctuary|of \d+/i.test(text)))card.remove();
  });
}
let stateBound=false;
function bindStateSync(){
  if(stateBound)return;stateBound=true;
  window.addEventListener('kc:state',()=>{updateBriefSavings();enforceEmeraldIconContrast();});
}
export async function enhanceSprint6B25(id){
  const badge=$('#kcBuildStatus b');if(badge)badge.textContent=BUILD;
  bindDelegatedActions();bindStateSync();ensureDailyRollover();
  if(id==='dashboard')removeDashboardRoutine();
  if(id==='intelligence')restoreStableInputs();
  if(id==='sanctuary'){
    const totals={morning:all('[data-ritual="morning"]').length||4,afternoon:all('[data-ritual="afternoon"]').length||4,evening:all('[data-ritual="evening"]').length||4};
    const old=store.get().sanctuary?.routineTotals||{};
    if(DAILY_IDS.some(k=>Number(old[k])!==totals[k]))store.mutate(s=>{s.sanctuary=s.sanctuary||{};s.sanctuary.routineTotals={...(s.sanctuary.routineTotals||{}),...totals};s.sanctuary.history=s.sanctuary.history||{};s.sanctuary.history[localDate()]=snapshotFor(s,localDate());});
    renderSanctuaryStats();
  }
  requestAnimationFrame(enforceEmeraldIconContrast);
}
