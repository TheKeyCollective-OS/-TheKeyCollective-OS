
import {store} from './store.js';

const BUILD='Sprint 6B.10';
const $=s=>document.querySelector(s);
const all=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n)||0);
const localKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const atNoon=key=>new Date(`${key}T12:00:00`);
const lines=value=>String(value||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);

let agendaCursor=new Date(new Date().getFullYear(),new Date().getMonth(),1);
const AGENDA_MIN=new Date(2020,0,1);
const AGENDA_MAX=new Date(2030,11,1);

function agendaPage(){
  return `<div class="agenda-6b10">
    <div class="pagehead agenda-head"><div><div class="eyebrow">Your private daily planner</div><h1>Agenda</h1><p class="sub">Plan, edit, and revisit every day through December 2030.</p></div>
      <div class="agenda-month-controls"><button id="agendaPrev6B10" type="button" class="btn ghost" aria-label="Previous month">←</button><span id="agendaMonth6B10" class="pill"></span><button id="agendaNext6B10" type="button" class="btn ghost" aria-label="Next month">→</button></div>
    </div>
    <article class="card"><div class="calendar-legend"><span><i class="dot event"></i>Event</span><span><i class="dot task"></i>Task</span><span><i class="dot birthday"></i>Birthday</span><span><i class="dot holiday"></i>Holiday</span><span><i class="dot bill"></i>Bill</span></div><div id="agendaGrid6B10" class="calendar"></div></article>
    <div class="grid g2" style="margin-top:14px"><article class="card"><h3>Selected Day</h3><div id="agendaSelected6B10" class="status">Tap any date to open and edit its frosted detail window.</div></article><article class="card"><h3>Next 7 Days</h3><div id="agendaNextSeven6B10"></div></article></div>
    <article class="card agenda-editor-6b10" style="margin-top:14px">
      <div class="section-title"><div><div class="eyebrow">Add or edit a day</div><h3>Day Editor</h3></div><span class="pill">Same record as frosted window</span></div>
      ${editorFields('bottom')}
      <div class="row wrap"><button id="agendaSaveBottom6B10" type="button" class="btn">Save Day</button><button id="agendaClearBottom6B10" type="button" class="btn ghost">Clear Editor</button></div>
      <div id="agendaStatus6B10" class="status">Nothing has been changed yet.</div>
    </article>
  </div>`;
}
function editorFields(prefix){
  return `<div class="agenda-field-grid">
    <label>Date<input id="${prefix}AgendaDate6B10" class="input" type="date"></label>
    <label>Headline<input id="${prefix}AgendaSubject6B10" class="input" placeholder="Day headline"></label>
    <label>Events<textarea id="${prefix}AgendaEvents6B10" rows="3" placeholder="Events, one per line"></textarea></label>
    <label>Tasks<textarea id="${prefix}AgendaTasks6B10" rows="3" placeholder="Tasks, one per line"></textarea></label>
    <label>Birthdays<textarea id="${prefix}AgendaBirthdays6B10" rows="2" placeholder="Birthdays, one per line"></textarea></label>
    <label>Holidays<textarea id="${prefix}AgendaHolidays6B10" rows="2" placeholder="Holidays, one per line"></textarea></label>
    <label class="span-2">Notes<textarea id="${prefix}AgendaNotes6B10" rows="3" placeholder="Notes"></textarea></label>
  </div>`;
}
export function patchPagesSprint6B10(pages){pages.calendar=agendaPage}

function calendarValue(date){return store.get().calendar?.[date]||{}}
function dayTypes(date){
  const v=calendarValue(date),types=[];
  if(lines(v.events).length)types.push('event');
  if(lines(v.tasks).length)types.push('task');
  if(lines(v.birthdays).length)types.push('birthday');
  if(lines(v.holidays).length)types.push('holiday');
  if((store.get().bills||[]).some(b=>b.due===date))types.push('bill');
  return types;
}
function dayItems(date){
  const v=calendarValue(date),items=[];
  lines(v.events).forEach(x=>items.push(['event','Event',x]));
  lines(v.tasks).forEach(x=>items.push(['task','Task',x]));
  lines(v.birthdays).forEach(x=>items.push(['birthday','Birthday',x]));
  lines(v.holidays).forEach(x=>items.push(['holiday','Holiday',x]));
  (store.get().bills||[]).filter(b=>b.due===date).forEach(b=>items.push(['bill',b.paid?'Paid bill':'Bill',`${b.name} · ${money(b.amount)}`]));
  if(v.notes)items.push(['note','Notes',v.notes]);
  return items;
}
function readEditor(prefix){
  return {
    date:$('#'+prefix+'AgendaDate6B10')?.value||'',
    subject:$('#'+prefix+'AgendaSubject6B10')?.value.trim()||'',
    events:$('#'+prefix+'AgendaEvents6B10')?.value||'',
    tasks:$('#'+prefix+'AgendaTasks6B10')?.value||'',
    birthdays:$('#'+prefix+'AgendaBirthdays6B10')?.value||'',
    holidays:$('#'+prefix+'AgendaHolidays6B10')?.value||'',
    notes:$('#'+prefix+'AgendaNotes6B10')?.value||''
  };
}
function fillEditor(prefix,date){
  const v=calendarValue(date);
  const values={Date:date,Subject:v.subject||'',Events:v.events||'',Tasks:v.tasks||'',Birthdays:v.birthdays||'',Holidays:v.holidays||'',Notes:v.notes||''};
  Object.entries(values).forEach(([key,value])=>{const el=$(`#${prefix}Agenda${key}6B10`);if(el)el.value=value});
}
function clearEditor(prefix){
  ['Date','Subject','Events','Tasks','Birthdays','Holidays','Notes'].forEach(key=>{const el=$(`#${prefix}Agenda${key}6B10`);if(el)el.value=''});
}
function saveAgenda(prefix){
  const value=readEditor(prefix),status=$('#agendaStatus6B10');
  if(!value.date){if(status)status.textContent='Choose a date first.';return false}
  store.mutate(d=>{d.calendar=d.calendar||{};d.calendar[value.date]={subject:value.subject,events:value.events,tasks:value.tasks,birthdays:value.birthdays,holidays:value.holidays,notes:value.notes}});
  if(status){status.textContent=`Saved ${value.date}.`;status.classList.add('saved-confirmation')}
  fillEditor('bottom',value.date);
  renderAgenda();
  openDay(value.date);
  return true;
}
function renderAgenda(){
  const grid=$('#agendaGrid6B10');if(!grid)return;
  const year=agendaCursor.getFullYear(),month=agendaCursor.getMonth(),first=new Date(year,month,1),days=new Date(year,month+1,0).getDate(),start=first.getDay();
  $('#agendaMonth6B10').textContent=first.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  $('#agendaPrev6B10').disabled=agendaCursor<=AGENDA_MIN;
  $('#agendaNext6B10').disabled=agendaCursor>=AGENDA_MAX;
  let html=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<div class="calendar-weekday">${x}</div>`).join('');
  html+='<div class="calendar-blank"></div>'.repeat(start);
  for(let day=1;day<=days;day++){
    const date=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    html+=`<button type="button" class="calendar-day ${date===localKey()?'today':''}" data-agenda-date-6b10="${date}"><b>${day}</b><span class="calendar-dots">${dayTypes(date).map(type=>`<i class="dot ${type}" title="${type}"></i>`).join('')}</span></button>`;
  }
  grid.innerHTML=html;
  renderNextSeven();
}
function renderNextSeven(){
  const host=$('#agendaNextSeven6B10');if(!host)return;
  const start=new Date(),end=new Date();end.setDate(end.getDate()+7);const from=localKey(start),to=localKey(end),items=[];
  Object.entries(store.get().calendar||{}).forEach(([date,v])=>{if(date>=from&&date<=to)items.push({date,label:v.subject||lines(v.events)[0]||lines(v.tasks)[0]||'Planned day'})});
  (store.get().bills||[]).forEach(b=>{if(b.due>=from&&b.due<=to)items.push({date:b.due,label:`${b.paid?'✓ ':''}${b.name} · ${money(b.amount)}`})});
  items.sort((a,b)=>a.date.localeCompare(b.date)||a.label.localeCompare(b.label));
  host.innerHTML=items.length?items.map(x=>`<button type="button" class="brief-line" data-agenda-date-6b10="${x.date}"><span>📅</span><div><b>${esc(x.label)}</b><small>${atNoon(x.date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</small></div></button>`).join(''):'<div class="status">Nothing scheduled in the next seven days.</div>';
}
function ensureDialog(){
  let dialog=$('#agendaDialog6B10');
  if(dialog)return dialog;
  document.body.insertAdjacentHTML('beforeend',`<dialog id="agendaDialog6B10" class="agenda-dialog frosted-day-dialog agenda-dialog-6b10"><article class="card agenda-modal"><button type="button" class="icon-button reflection-close" data-close-agenda-6b10>×</button><div id="agendaDialogBody6B10"></div></article></dialog>`);
  dialog=$('#agendaDialog6B10');
  dialog.addEventListener('click',event=>{if(event.target===dialog||event.target.closest('[data-close-agenda-6b10]'))dialog.close()});
  return dialog;
}
function openDay(date){
  const dialog=ensureDialog(),items=dayItems(date),value=calendarValue(date);
  $('#agendaDialogBody6B10').innerHTML=`<div class="eyebrow">Edit this day</div><h2>${atNoon(date).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</h2>
    <div class="agenda-dialog-summary">${items.map(([type,label,text])=>`<div class="agenda-quick-item ${type}"><span class="agenda-dot ${type}"></span><div><small>${esc(label)}</small><b>${esc(text)}</b></div></div>`).join('')||'<div class="status">This day is open.</div>'}</div>
    ${editorFields('dialog')}
    <div class="row wrap"><button id="agendaSaveDialog6B10" type="button" class="btn">Save Changes</button><button id="agendaClearDialog6B10" type="button" class="btn ghost">Clear Fields</button><button type="button" class="btn secondary" data-close-agenda-6b10>Close</button></div>`;
  fillEditor('dialog',date);
  $('#agendaSaveDialog6B10').onclick=()=>saveAgenda('dialog');
  $('#agendaClearDialog6B10').onclick=()=>clearEditor('dialog');
  const selected=$('#agendaSelected6B10');
  if(selected)selected.innerHTML=`<b>${esc(value.subject||date)}</b><p>${items.length?items.map(x=>esc(x[2])).join(' · '):'Nothing scheduled.'}</p>`;
  if(dialog.open)dialog.close();
  dialog.showModal();
}
function enhanceAgenda(){
  agendaCursor=new Date(new Date().getFullYear(),new Date().getMonth(),1);
  renderAgenda();
  $('#agendaPrev6B10').onclick=()=>{if(agendaCursor>AGENDA_MIN){agendaCursor=new Date(agendaCursor.getFullYear(),agendaCursor.getMonth()-1,1);renderAgenda()}};
  $('#agendaNext6B10').onclick=()=>{if(agendaCursor<AGENDA_MAX){agendaCursor=new Date(agendaCursor.getFullYear(),agendaCursor.getMonth()+1,1);renderAgenda()}};
  const openHandler=event=>{const button=event.target.closest('[data-agenda-date-6b10]');if(button)openDay(button.dataset.agendaDate6b10)};
  $('#agendaGrid6B10').onclick=openHandler;
  $('#agendaNextSeven6B10').onclick=openHandler;
  $('#agendaSaveBottom6B10').onclick=()=>saveAgenda('bottom');
  $('#agendaClearBottom6B10').onclick=()=>{clearEditor('bottom');const status=$('#agendaStatus6B10');if(status){status.textContent='Editor cleared.';status.classList.remove('saved-confirmation')}};
}

function checklistBills(){
  const state=store.get(),month=localKey().slice(0,7),monthBills=state.bills.filter(b=>String(b.due||'').startsWith(month));
  return monthBills.length?monthBills:[...state.bills];
}
function insertBillChecklist(){
  const page=$('.money-page')||document.querySelector('main');
  if(!page)return;
  let card=$('#billChecklistCard6B10');
  if(!card){
    card=document.createElement('article');
    card.id='billChecklistCard6B10';
    card.className='card bill-checklist-card-6b10';
    const manager=$('.bill-manager');
    if(manager)manager.after(card);else page.append(card);
  }
  renderBillChecklist();
}
function renderBillChecklist(){
  const card=$('#billChecklistCard6B10');if(!card)return;
  const state=store.get(),bills=checklistBills().sort((a,b)=>String(a.due||'').localeCompare(String(b.due||''))),paid=bills.filter(b=>b.paid),due=bills.filter(b=>!b.paid),paidTotal=paid.reduce((n,b)=>n+Number(b.amount||0),0),dueTotal=due.reduce((n,b)=>n+Number(b.amount||0),0),cash=Number(state.checking||0)+Number(state.savings||0)+Number(state.otherAssets||0);
  const filter=card.dataset.filter||'all',visible=bills.filter(b=>filter==='all'||(filter==='paid'?b.paid:!b.paid));
  card.innerHTML=`<div class="section-title"><div><div class="eyebrow">Complete bill checklist</div><h3>Paid and Still Due</h3><p class="muted">Every imported and manually entered bill appears here.</p></div><span class="pill">${paid.length} / ${bills.length} paid</span></div>
    <div class="paid-metric-grid"><div><span>Available cash</span><b>${money(cash)}</b></div><div><span>Paid</span><b>${money(paidTotal)}</b></div><div><span>Still due</span><b>${money(dueTotal)}</b></div><div><span>Cash after unpaid</span><b>${money(cash-dueTotal)}</b></div></div>
    <div class="segmented bill-filter-6b10"><button type="button" data-bill-filter-6b10="all">All</button><button type="button" data-bill-filter-6b10="due">Due</button><button type="button" data-bill-filter-6b10="paid">Paid</button></div>
    <div class="bill-checklist-6b10">${visible.map(b=>`<label class="bill-check-row-6b10 ${b.paid?'paid':''}"><input type="checkbox" data-bill-paid-6b10="${b.id}" ${b.paid?'checked':''}><div><b>${esc(b.name)}</b><small>${money(b.amount)} · due ${esc(b.due||'not set')} · ${esc(b.category||'Other')}</small>${b.paid?`<small>Paid ${esc(b.paidDate||localKey())}</small>`:''}</div><span>${b.paid?'Paid':'Still due'}</span></label>`).join('')||'<div class="status">No bills in this view.</div>'}</div>`;
  all('[data-bill-filter-6b10]').forEach(button=>{button.classList.toggle('active',button.dataset.billFilter6b10===filter);button.onclick=()=>{card.dataset.filter=button.dataset.billFilter6b10;renderBillChecklist()}});
  all('[data-bill-paid-6b10]').forEach(input=>input.onchange=()=>{
    store.mutate(d=>{const bill=d.bills.find(x=>String(x.id)===String(input.dataset.billPaid6b10));if(bill){bill.paid=input.checked;bill.paidDate=input.checked?localKey():''}});
    renderBillChecklist();
  });
}

function academyResults(){
  const results=Array.isArray(store.get().academyQuizResults)?store.get().academyQuizResults:[],now=new Date(),start=new Date(now);start.setDate(start.getDate()-6);const from=localKey(start),to=localKey(now),week=results.filter(r=>{const date=localKey(new Date(r.date));return date>=from&&date<=to});
  const latest=results[0],average=week.length?Math.round(week.reduce((n,r)=>n+Number(r.score||0),0)/week.length):0,missed={};
  week.forEach(r=>(r.missed||[]).forEach(term=>missed[term]=(missed[term]||0)+1));
  return {week,latest,average,review:Object.entries(missed).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0])};
}
function academySummary(){
  const s=academyResults();
  return `<div class="academy-summary-lines"><div><span>Quizzes this week</span><b>${s.week.length}</b></div><div><span>Latest score</span><b>${s.latest?`${s.latest.score}%`:'—'}</b></div><div><span>Weekly average</span><b>${s.week.length?`${s.average}%`:'—'}</b></div></div><p class="muted">${s.review.length?`Review: ${s.review.map(esc).join(' · ')}`:'No repeated misses yet.'}</p>`;
}
function ensureMorningBrief(router){
  const grid=$('.intelligence-grid');
  if(!grid)return;
  let card=$('#academyMorningCard6B10');
  if(!card){card=document.createElement('article');card.id='academyMorningCard6B10';card.className='card';grid.append(card)}
  card.innerHTML=`<div class="section-title"><h3>Payments Academy</h3><button id="openAcademyMorning6B10" class="btn ghost">Open Academy</button></div>${academySummary()}`;
  $('#openAcademyMorning6B10').onclick=()=>router.go('career');
}
function ensureDashboard(router){
  let card=$('#academyDashboardCard6B10');
  if(!card){
    const grid=$('.dashboard-grid');
    if(!grid)return;
    card=document.createElement('article');card.id='academyDashboardCard6B10';card.className='card luxe dashboard-panel';grid.append(card);
  }
  card.innerHTML=`<div class="mini">Payments Academy</div><h3>Your weekly learning signal</h3>${academySummary()}<button id="openAcademyDashboard6B10" class="btn ghost">Open Payments Academy</button>`;
  $('#openAcademyDashboard6B10').onclick=()=>router.go('career');
  all('button').filter(button=>/Open Morning Brief/i.test(button.textContent)).forEach(button=>button.onclick=()=>router.go('intelligence'));
}
function updateBuild(){const badge=$('#kcBuildStatus b');if(badge)badge.textContent=BUILD}

export async function enhanceSprint6B10(id,router){
  updateBuild();
  if(id==='calendar')enhanceAgenda();
  if(id==='money')setTimeout(insertBillChecklist,0);
  if(id==='intelligence')ensureMorningBrief(router);
  if(id==='dashboard')ensureDashboard(router);
}
