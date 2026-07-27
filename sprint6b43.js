import {store} from './store.js';
import {getMemos} from './memo-db.js';

const BUILD='Sprint 6B.43 Wellness + Morning Brief Source of Truth';
const $=(selector,root=document)=>root.querySelector(selector);
const all=(selector,root=document)=>[...root.querySelectorAll(selector)];
const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0));
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function localDate(){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Phoenix',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
function title(){return ($('#page h1')?.textContent||'').trim()}
function routeTo(route,router){
  if(router?.go){router.go(route);return}
  $(`.nav-button[data-route="${route}"]`)?.click();
}
function wellnessData(state=store.get()){
  const waterGoal=Math.max(1,Math.round(Number(state.wellness?.waterGoal)||8));
  const water=clamp(state.water,0,waterGoal);
  const minutes=Math.max(0,Math.round(Number(state.gymMinutes)||0));
  const gymGoal=Math.max(1,Math.round(Number(state.wellness?.gymGoalMinutes)||60));
  return {water,waterGoal,minutes,gymGoal,waterPct:clamp(Math.round(water/waterGoal*100),0,100),gymPct:clamp(Math.round(minutes/gymGoal*100),0,100)};
}
function morningData(state=store.get()){
  const editable=state.sanctuary?.routines?.['morning-reset']?.items;
  if(Array.isArray(editable)){
    const done=editable.filter(item=>Boolean(item?.done)).length;
    return {done,total:editable.length,pct:editable.length?Math.round(done/editable.length*100):0};
  }
  const doneFlags=Array.isArray(state.sanctuary?.completed?.morning)?state.sanctuary.completed.morning:[];
  // Match Sanctuary's visible six-item default when no customized checklist
  // has been saved yet. Once the user edits Sanctuary, its saved items remain
  // the only source of truth.
  const total=Math.max(doneFlags.length,6);
  const done=doneFlags.slice(0,total).filter(Boolean).length;
  return {done,total,pct:total?Math.round(done/total*100):0};
}
function agendaItems(state=store.get()){
  const today=localDate(),endDate=new Date(`${today}T12:00:00`);endDate.setDate(endDate.getDate()+7);
  const end=`${endDate.getFullYear()}-${String(endDate.getMonth()+1).padStart(2,'0')}-${String(endDate.getDate()).padStart(2,'0')}`;
  const items=[];
  Object.entries(state.calendar||{}).forEach(([date,day])=>{
    if(date<today||date>end)return;
    const fields=[['Event',day.events],['Task',day.tasks],['Birthday',day.birthdays],['Holiday',day.holidays]];
    fields.forEach(([type,value])=>String(value||'').split(/\n|,/).map(text=>text.trim()).filter(Boolean).forEach(label=>items.push({date,type,label})));
    if(day.subject&&!fields.some(([,value])=>String(value||'').trim()))items.push({date,type:'Plan',label:day.subject});
  });
  (state.bills||[]).filter(bill=>!bill.paid&&bill.due>=today&&bill.due<=end).forEach(bill=>items.push({date:bill.due,type:'Bill',label:`${bill.name} · $${Number(bill.amount||0).toFixed(2)}`}));
  return items.sort((a,b)=>a.date.localeCompare(b.date)||a.type.localeCompare(b.type));
}
function soberStart(state=store.get()){return state.sobriety?.startDate||state.sobriety?.lastReset||''}
function soberDays(state=store.get()){
  const start=soberStart(state);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(start))return 0;
  const [sy,sm,sd]=start.split('-').map(Number),[ty,tm,td]=localDate().split('-').map(Number);
  const startAt=Date.UTC(sy,sm-1,sd),todayAt=Date.UTC(ty,tm-1,td);
  return Number.isNaN(startAt)?0:Math.max(1,Math.floor((todayAt-startAt)/86400000)+1);
}
function ensureState(){
  const state=store.get(),today=localDate(),existing=soberStart(state);
  const start=!existing||existing>today?today:existing;
  const fixSober=state.sobriety?.startDate!==start||state.sobriety?.lastReset!==start;
  const resetGym=state.wellness?.gymDate!==today;
  const now=Date.now(),fifteenDays=15*86400000;
  const billsNeedUpdate=(state.bills||[]).some(bill=>bill.paid&&(!(bill.paidAt||bill.paidDate)||now-new Date(bill.paidAt||`${bill.paidDate}T12:00:00`).getTime()>=fifteenDays));
  if(!fixSober&&!resetGym&&!billsNeedUpdate)return;
  store.mutate(d=>{
    d.wellness=d.wellness||{};d.sobriety=d.sobriety||{};
    d.sobriety.startDate=start;d.sobriety.lastReset=start;
    if(resetGym){d.wellness.gymDate=today;d.gymMinutes=0}
    d.bills=(d.bills||[]).map(bill=>{
      if(!bill.paid)return bill;
      const savedPaidAt=bill.paidAt||bill.paidDate&&`${bill.paidDate}T12:00:00`;
      if(!savedPaidAt)return {...bill,paidAt:new Date(now).toISOString(),paidDate:today};
      const paidAt=new Date(savedPaidAt).getTime();
      return Number.isFinite(paidAt)&&now-paidAt>=fifteenDays?{...bill,paid:false,paidAt:null,paidDate:''}:bill;
    });
  });
}
function card(pattern){return all('#page .card').find(node=>pattern.test((node.querySelector('h3')?.textContent||node.querySelector('.mini')?.textContent||'').trim()))}

function renderWellness(){
  if(title()!=='Wellness Studio')return;
  const page=$('#page'),water=card(/^Water$/i);
  if(water)water.innerHTML=`<div class="section-title"><div><div class="eyebrow">Daily hydration</div><h3>Water</h3></div><span class="pill" data-kc43-water-pill></span></div><div class="metric" data-kc43-water></div><div class="bar"><span data-kc43-water-bar></span></div><div class="row wrap"><button type="button" class="btn ghost" data-kc43-action="water" data-delta="-1">− Remove one</button><button type="button" class="btn" data-kc43-action="water" data-delta="1">＋ Add water</button><button type="button" class="btn ghost" data-kc43-action="water-reset">Reset</button></div><div class="status">Synced with Morning Brief.</div>`;
  all('#page .card').filter(node=>/^(Gym|Gym Time)$/i.test((node.querySelector('h3')?.textContent||'').trim())).forEach(node=>node.remove());
  const gym=document.createElement('article');
  gym.className='card gradient-card';gym.dataset.kc43GymCard='';
  gym.innerHTML=`<div class="section-title"><div><div class="eyebrow">Daily movement</div><h3>Gym Time</h3></div><span class="pill" data-kc43-gym-pill></span></div><div class="metric" data-kc43-gym></div><p class="muted">Minutes logged today</p><div class="bar"><span data-kc43-gym-bar></span></div><div class="gym-controls-634"><button type="button" class="btn ghost" data-kc43-action="gym" data-delta="-15">− 15 min</button><button type="button" class="btn ghost" data-kc43-action="gym" data-delta="-5">− 5 min</button><button type="button" class="btn" data-kc43-action="gym" data-delta="5">＋ 5 min</button><button type="button" class="btn" data-kc43-action="gym" data-delta="15">＋ 15 min</button></div><label>Today’s gym goal<div class="goal-row-634"><input class="input" type="number" min="1" step="5" inputmode="numeric" data-kc43-gym-goal><button type="button" class="btn" data-kc43-action="gym-goal">Save goal</button></div></label><div class="status" data-kc43-gym-status>Synced with Morning Brief.</div>`;
  if(water)water.insertAdjacentElement('afterend',gym);else page.prepend(gym);
  paintWellness();
}
let memoUrls=[];
async function renderBriefDetails(){
  if(title()!=='Morning Brief')return;
  const agenda=all('#page .card').find(node=>/^Agenda$/i.test((node.querySelector('h3')?.textContent||'').trim()));
  if(agenda){
    const items=agendaItems();
    agenda.innerHTML=`<div class="section-title"><h3>Agenda</h3><button type="button" class="btn ghost" data-kc43-route="calendar">Open</button></div>${items.length?items.map(item=>`<div class="brief-line"><span>${item.type==='Bill'?'💳':'📅'}</span><div><b>${esc(item.label)}</b><small>${new Date(`${item.date}T12:00:00`).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} · ${esc(item.type)}</small></div></div>`).join(''):'<div class="status">Nothing scheduled in the next seven days.</div>'}`;
  }
  const highlights=all('#page .card').find(node=>/^(Personal Highlights|Memory Highlights)$/i.test((node.querySelector('h3')?.textContent||'').trim()));
  if(!highlights)return;
  memoUrls.forEach(URL.revokeObjectURL);memoUrls=[];
  let memos=[];try{memos=(await getMemos()).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||''))).slice(0,3)}catch{}
  highlights.innerHTML=`<div class="section-title"><h3>Personal Highlights</h3><button type="button" class="btn ghost" data-kc43-route="business">Open Intelligence</button></div>${memos.length?memos.map(memo=>{const url=URL.createObjectURL(memo.blob);memoUrls.push(url);return `<div class="memo-row"><audio controls preload="metadata" src="${url}"></audio><div><b>${esc(memo.title||'Voice memo')}</b><small>${memo.createdAt?new Date(memo.createdAt).toLocaleString():'Saved voice memo'}</small></div></div>`}).join(''):'<div class="status">Your three newest voice memos will appear here.</div>'}`;
}
async function renderBrief(){
  if(title()!=='Morning Brief')return;
  const grid=$('#page .brief-metric-grid'),cards=grid?all(':scope > .card',grid):[];
  if(cards[0])cards[0].innerHTML=`<div class="mini">Water</div><div class="metric" data-kc43-water></div><div class="bar"><span data-kc43-water-bar></span></div><p class="muted" data-kc43-water-copy></p><div class="row wrap"><button type="button" class="btn ghost" data-kc43-action="water" data-delta="-1">− Remove</button><button type="button" class="btn" data-kc43-action="water" data-delta="1">＋ Add</button></div><button type="button" class="btn ghost" data-kc43-route="wellness" aria-label="Open Wellness Studio from Water">Open Wellness Studio</button>`;
  if(cards[1])cards[1].innerHTML=`<div class="mini">Movement</div><div class="metric" data-kc43-gym></div><div class="bar"><span data-kc43-gym-bar></span></div><p class="muted" data-kc43-gym-copy></p><button type="button" class="btn ghost" data-kc43-route="wellness" aria-label="Open Wellness Studio from Movement">Open Wellness Studio</button>`;
  const reset=all('#page .card').find(node=>/Power on gently/i.test(node.textContent||'')||/^(Morning Routine|Morning Reset)$/i.test((node.querySelector('h3')?.textContent||'').trim()));
  if(reset)reset.innerHTML=`<div class="mini">Power on gently</div><h3>Morning Reset</h3><div class="routine-summary-number" data-kc43-reset></div><div class="bar"><span data-kc43-reset-bar></span></div><p data-kc43-reset-copy></p><button type="button" class="btn ghost" data-kc43-route="sanctuary">Open Sanctuary</button>`;
  paintBrief();
  await renderBriefDetails();
}
function paintWellness(){
  if(title()!=='Wellness Studio')return;
  const d=wellnessData(),page=$('#page');
  all('[data-kc43-water]',page).forEach(n=>n.textContent=`${d.water}/${d.waterGoal}`);
  all('[data-kc43-water-pill]',page).forEach(n=>n.textContent=`${d.water}/${d.waterGoal} glasses`);
  all('[data-kc43-water-bar]',page).forEach(n=>n.style.width=`${d.waterPct}%`);
  all('[data-kc43-gym]',page).forEach(n=>n.textContent=`${d.minutes} min`);
  all('[data-kc43-gym-pill]',page).forEach(n=>n.textContent=`${d.minutes} / ${d.gymGoal} min`);
  all('[data-kc43-gym-bar]',page).forEach(n=>n.style.width=`${d.gymPct}%`);
  all('[data-kc43-gym-goal]',page).forEach(n=>{if(document.activeElement!==n)n.value=String(d.gymGoal)});
  const tracker=$('#sobrietyTracker6B18')||all('#page .card').find(n=>/Sobriety Tracker/i.test(n.textContent||''));
  if(!tracker)return;
  const days=soberDays(),metric=tracker.querySelector('.metric'),pill=tracker.querySelector('.pill'),status=tracker.querySelector('.status');
  if(metric)metric.textContent=String(days);if(pill)pill.textContent=`${days} day${days===1?'':'s'}`;
  if(status)status.innerHTML=`<b>Streak started:</b> ${new Date(`${soberStart()}T12:00:00`).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}`;
  const reset=tracker.querySelector('#resetSobriety6B18');
  if(reset)reset.onclick=()=>{if(confirm('Reset your sobriety streak to today?'))store.mutate(s=>{s.sobriety={...(s.sobriety||{}),startDate:localDate(),lastReset:localDate()}})};
}
function paintDashboardSobriety(){
  const days=soberDays();
  all('[data-dashboard-sobriety-6b26], [data-sobriety-count-6b27], [data-sobriety-days-6b20]').forEach(node=>node.textContent=String(days));
  const wellness=all('#page .dashboard-panel, #page .card').find(node=>/Wellness today/i.test(node.textContent||''));
  if(!wellness)return;
  const row=all('.metric-row > span',wellness).find(node=>/Days sober|Gym min/i.test(node.textContent||''));
  if(row)row.innerHTML=`<b data-dashboard-sobriety-6b43>${days}</b><small>Days sober</small>`;
}
function paintBrief(){
  if(title()!=='Morning Brief')return;
  const d=wellnessData(),m=morningData(),page=$('#page');
  all('[data-kc43-water]',page).forEach(n=>n.textContent=`${d.water} / ${d.waterGoal}`);all('[data-kc43-water-bar]',page).forEach(n=>n.style.width=`${d.waterPct}%`);all('[data-kc43-water-copy]',page).forEach(n=>n.textContent=`${d.water} of ${d.waterGoal} glasses`);
  all('[data-kc43-gym]',page).forEach(n=>n.textContent=`${d.minutes} / ${d.gymGoal} min`);all('[data-kc43-gym-bar]',page).forEach(n=>n.style.width=`${d.gymPct}%`);all('[data-kc43-gym-copy]',page).forEach(n=>n.textContent=`${d.minutes} minutes moved versus today’s ${d.gymGoal}-minute goal`);
  all('[data-kc43-reset]',page).forEach(n=>n.textContent=`${m.done} of ${m.total}`);all('[data-kc43-reset-bar]',page).forEach(n=>n.style.width=`${m.pct}%`);all('[data-kc43-reset-copy]',page).forEach(n=>n.textContent=`${m.done} of ${m.total} Sanctuary Morning Reset items complete.`);
}
function act(control){
  const action=control.dataset.kc43Action,delta=Number(control.dataset.delta)||0;
  if(action==='water')store.mutate(s=>{const goal=Math.max(1,Number(s.wellness?.waterGoal)||8);s.water=clamp((Number(s.water)||0)+delta,0,goal)});
  if(action==='water-reset')store.mutate(s=>{s.water=0});
  if(action==='gym')store.mutate(s=>{s.wellness=s.wellness||{};s.wellness.gymDate=localDate();s.gymMinutes=Math.max(0,Math.round(Number(s.gymMinutes)||0)+delta)});
  if(action==='gym-goal'){
    const goal=Math.max(1,Math.round(Number($('[data-kc43-gym-goal]')?.value)||60));
    store.mutate(s=>{s.wellness=s.wellness||{};s.wellness.gymGoalMinutes=goal});
    const status=$('[data-kc43-gym-status]');if(status)status.textContent=`Daily gym goal saved at ${goal} minutes.`;
  }
}
let bound=false;
function bind(router){
  if(bound)return;bound=true;
  document.addEventListener('click',event=>{
    const route=event.target.closest('[data-kc43-route]');if(route){event.preventDefault();routeTo(route.dataset.kc43Route,router);return}
    const control=event.target.closest('[data-kc43-action]');if(control){event.preventDefault();act(control)}
  });
  window.addEventListener('kc:state',()=>{
    paintWellness();paintBrief();paintDashboardSobriety();
    requestAnimationFrame(()=>{paintWellness();paintBrief();paintDashboardSobriety()});
  });
}
export async function enhanceSprint6B43(id,router){
  bind(router);ensureState();
  if(id==='dashboard')requestAnimationFrame(()=>requestAnimationFrame(paintDashboardSobriety));
  if(id==='wellness'){
    renderWellness();
    requestAnimationFrame(()=>requestAnimationFrame(()=>{renderWellness();paintWellness()}));
  }
  if(id==='intelligence'){
    await renderBrief();
    requestAnimationFrame(()=>requestAnimationFrame(()=>renderBrief()));
  }
  const badge=$('#kcBuildStatus b');if(badge)badge.textContent=BUILD;
}
