
import {store} from './store.js';

const BUILD='Sprint 6B.13';
const $=s=>document.querySelector(s);
const all=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n)||0);
const localKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const lines=v=>String(v||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const FALLBACK_HOLIDAYS={"2026": [{"date": "2026-01-01", "name": "New Year's Day", "source": "fallback"}, {"date": "2026-01-19", "name": "Martin Luther King Jr. Day", "source": "fallback"}, {"date": "2026-02-16", "name": "Washington's Birthday", "source": "fallback"}, {"date": "2026-05-25", "name": "Memorial Day", "source": "fallback"}, {"date": "2026-06-19", "name": "Juneteenth National Independence Day", "source": "fallback"}, {"date": "2026-07-04", "name": "Independence Day", "source": "fallback"}, {"date": "2026-09-07", "name": "Labor Day", "source": "fallback"}, {"date": "2026-10-12", "name": "Columbus Day", "source": "fallback"}, {"date": "2026-11-11", "name": "Veterans Day", "source": "fallback"}, {"date": "2026-11-26", "name": "Thanksgiving Day", "source": "fallback"}, {"date": "2026-12-25", "name": "Christmas Day", "source": "fallback"}], "2027": [{"date": "2027-01-01", "name": "New Year's Day", "source": "fallback"}, {"date": "2027-01-18", "name": "Martin Luther King Jr. Day", "source": "fallback"}, {"date": "2027-02-15", "name": "Washington's Birthday", "source": "fallback"}, {"date": "2027-05-31", "name": "Memorial Day", "source": "fallback"}, {"date": "2027-06-19", "name": "Juneteenth National Independence Day", "source": "fallback"}, {"date": "2027-07-04", "name": "Independence Day", "source": "fallback"}, {"date": "2027-09-06", "name": "Labor Day", "source": "fallback"}, {"date": "2027-10-11", "name": "Columbus Day", "source": "fallback"}, {"date": "2027-11-11", "name": "Veterans Day", "source": "fallback"}, {"date": "2027-11-25", "name": "Thanksgiving Day", "source": "fallback"}, {"date": "2027-12-25", "name": "Christmas Day", "source": "fallback"}], "2028": [{"date": "2028-01-01", "name": "New Year's Day", "source": "fallback"}, {"date": "2028-01-17", "name": "Martin Luther King Jr. Day", "source": "fallback"}, {"date": "2028-02-21", "name": "Washington's Birthday", "source": "fallback"}, {"date": "2028-05-29", "name": "Memorial Day", "source": "fallback"}, {"date": "2028-06-19", "name": "Juneteenth National Independence Day", "source": "fallback"}, {"date": "2028-07-04", "name": "Independence Day", "source": "fallback"}, {"date": "2028-09-04", "name": "Labor Day", "source": "fallback"}, {"date": "2028-10-09", "name": "Columbus Day", "source": "fallback"}, {"date": "2028-11-11", "name": "Veterans Day", "source": "fallback"}, {"date": "2028-11-23", "name": "Thanksgiving Day", "source": "fallback"}, {"date": "2028-12-25", "name": "Christmas Day", "source": "fallback"}], "2029": [{"date": "2029-01-01", "name": "New Year's Day", "source": "fallback"}, {"date": "2029-01-15", "name": "Martin Luther King Jr. Day", "source": "fallback"}, {"date": "2029-02-19", "name": "Washington's Birthday", "source": "fallback"}, {"date": "2029-05-28", "name": "Memorial Day", "source": "fallback"}, {"date": "2029-06-19", "name": "Juneteenth National Independence Day", "source": "fallback"}, {"date": "2029-07-04", "name": "Independence Day", "source": "fallback"}, {"date": "2029-09-03", "name": "Labor Day", "source": "fallback"}, {"date": "2029-10-08", "name": "Columbus Day", "source": "fallback"}, {"date": "2029-11-11", "name": "Veterans Day", "source": "fallback"}, {"date": "2029-11-22", "name": "Thanksgiving Day", "source": "fallback"}, {"date": "2029-12-25", "name": "Christmas Day", "source": "fallback"}], "2030": [{"date": "2030-01-01", "name": "New Year's Day", "source": "fallback"}, {"date": "2030-01-21", "name": "Martin Luther King Jr. Day", "source": "fallback"}, {"date": "2030-02-18", "name": "Washington's Birthday", "source": "fallback"}, {"date": "2030-05-27", "name": "Memorial Day", "source": "fallback"}, {"date": "2030-06-19", "name": "Juneteenth National Independence Day", "source": "fallback"}, {"date": "2030-07-04", "name": "Independence Day", "source": "fallback"}, {"date": "2030-09-02", "name": "Labor Day", "source": "fallback"}, {"date": "2030-10-14", "name": "Columbus Day", "source": "fallback"}, {"date": "2030-11-11", "name": "Veterans Day", "source": "fallback"}, {"date": "2030-11-28", "name": "Thanksgiving Day", "source": "fallback"}, {"date": "2030-12-25", "name": "Christmas Day", "source": "fallback"}]};
const HOLIDAY_CACHE_KEY='keyCollectiveOS.usHolidays.v4';
const HOLIDAY_CACHE_TTL=1000*60*60*24*30;

let agendaCursor=new Date(new Date().getFullYear(),new Date().getMonth(),1);
const MIN_MONTH=new Date(2020,0,1);
const MAX_MONTH=new Date(2030,11,1);
let holidayMap={};

function agendaPage(){
  return `<div class="agenda-final-6b13">
    <header class="pagehead"><div><div class="eyebrow">Your private daily planner</div><h1>Agenda</h1><p class="sub">National holidays, birthdays, bills, and personal plans in one editable calendar.</p></div>
      <div class="agenda-nav-6b13"><button id="agendaPrev6B13" class="btn ghost" type="button" aria-label="Previous month">←</button><span id="agendaMonth6B13" class="pill">Calendar</span><button id="agendaNext6B13" class="btn ghost" type="button" aria-label="Next month">→</button></div></header>
    <article class="card agenda-calendar-card-6b13">
      <div class="calendar-legend"><span><i class="dot event"></i>Event</span><span><i class="dot task"></i>Task</span><span><i class="dot birthday"></i>Birthday</span><span><i class="dot holiday"></i>Holiday</span><span><i class="dot bill"></i>Bill</span></div>
      <div id="agendaCalendar6B13" class="calendar-grid-6b13" aria-live="polite"></div>
      <div id="holidayStatus6B13" class="mini">Loading U.S. national holidays…</div>
    </article>
    <article class="card agenda-editor-card-6b13">
      <div class="section-title"><div><div class="eyebrow">Add or edit a day</div><h3>Day Editor</h3></div><span class="pill">Saved locally</span></div>
      ${editorFields('page')}
      <div class="row wrap"><button id="agendaSave6B13" class="btn" type="button">Save Day</button><button id="agendaClear6B13" class="btn ghost" type="button">Clear Editor</button></div>
      <div id="agendaSaveStatus6B13" class="status">Ready.</div>
    </article>
  </div>`;
}
function editorFields(prefix){
  return `<div class="agenda-fields-6b13">
    <label>Date<input id="${prefix}Date6B13" class="input" type="date"></label>
    <label>Headline<input id="${prefix}Subject6B13" class="input" placeholder="Day headline"></label>
    <label>Events<textarea id="${prefix}Events6B13" rows="3" placeholder="One event per line"></textarea></label>
    <label>Tasks<textarea id="${prefix}Tasks6B13" rows="3" placeholder="One task per line"></textarea></label>
    <label>Birthdays<textarea id="${prefix}Birthdays6B13" rows="2" placeholder="One birthday per line"></textarea></label>
    <label>Personal holidays<textarea id="${prefix}Holidays6B13" rows="2" placeholder="Your own holidays or observances"></textarea></label>
    <label class="span-2">Notes<textarea id="${prefix}Notes6B13" rows="3" placeholder="Notes"></textarea></label>
  </div>`;
}
export function patchPagesSprint6B13(pages){pages.calendar=agendaPage}

function holidayCache(){
  try{return JSON.parse(localStorage.getItem(HOLIDAY_CACHE_KEY)||'null')}catch{return null}
}
function saveHolidayCache(data){
  localStorage.setItem(HOLIDAY_CACHE_KEY,JSON.stringify({savedAt:Date.now(),years:data}));
}
async function loadHolidays(){
  const cached=holidayCache();
  const valid=cached?.years&&Date.now()-Number(cached.savedAt||0)<HOLIDAY_CACHE_TTL;
  let years=valid?cached.years:{};
  if(!valid){
    for(let year=2026;year<=2030;year++){
      try{
        const response=await fetch(`https://date.nager.at/api/v4/Holidays/US/${year}`,{headers:{Accept:'application/json'}});
        if(!response.ok)throw new Error(`HTTP ${response.status}`);
        const rows=await response.json();
        years[year]=rows.filter(x=>x.nationalHoliday!==false&&(x.holidayTypes||[]).includes('Public')).map(x=>({date:x.date,name:x.name,source:'Nager.Date'}));
      }catch(error){
        years[year]=FALLBACK_HOLIDAYS[year]||[];
        console.warn('Holiday fallback used',year,error);
      }
    }
    saveHolidayCache(years);
  }
  holidayMap={};
  Object.values(years).flat().forEach(h=>{(holidayMap[h.date]??=[]).push(h.name)});
  const status=$('#holidayStatus6B13');
  if(status)status.textContent=valid?'U.S. national holidays loaded from local cache.':'U.S. national holidays synchronized and cached for offline use.';
  renderCalendar();
}

function calendarValue(date){return store.get().calendar?.[date]||{}}
function recurringFor(date,field){
  const md=date.slice(5),out=[];
  Object.entries(store.get().calendar||{}).forEach(([saved,v])=>{if(saved.slice(5)===md)lines(v[field]).forEach(x=>out.push(x))});
  return [...new Set(out)];
}
function dateData(date){
  const v=calendarValue(date);
  const bills=(store.get().bills||[]).filter(b=>b.due===date);
  const birthdays=[...new Set([...lines(v.birthdays),...recurringFor(date,'birthdays')])];
  const personalHolidays=[...new Set([...lines(v.holidays),...recurringFor(date,'holidays')])];
  const national=holidayMap[date]||[];
  return {
    subject:v.subject||'',events:lines(v.events),tasks:lines(v.tasks),birthdays,
    personalHolidays,national,bills,notes:v.notes||''
  };
}
function dotTypes(date){
  const d=dateData(date),types=[];
  if(d.events.length)types.push('event');
  if(d.tasks.length)types.push('task');
  if(d.birthdays.length)types.push('birthday');
  if(d.personalHolidays.length||d.national.length)types.push('holiday');
  if(d.bills.length)types.push('bill');
  return types;
}
function renderCalendar(){
  const grid=$('#agendaCalendar6B13');if(!grid)return;
  const year=agendaCursor.getFullYear(),month=agendaCursor.getMonth(),first=new Date(year,month,1),days=new Date(year,month+1,0).getDate();
  $('#agendaMonth6B13').textContent=first.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  $('#agendaPrev6B13').disabled=agendaCursor.getTime()<=MIN_MONTH.getTime();
  $('#agendaNext6B13').disabled=agendaCursor.getTime()>=MAX_MONTH.getTime();
  let html=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<div class="calendar-weekday-6b13">${x}</div>`).join('');
  html+='<div class="calendar-blank-6b13"></div>'.repeat(first.getDay());
  for(let day=1;day<=days;day++){
    const date=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`,data=dateData(date),labels=[...data.national,...data.birthdays,...data.events].slice(0,2);
    html+=`<button type="button" class="calendar-day-6b13 ${date===localKey()?'today':''}" data-agenda-date="${date}"><b>${day}</b><span class="calendar-dots">${dotTypes(date).map(t=>`<i class="dot ${t}"></i>`).join('')}</span><small>${labels.map(esc).join(' · ')}</small></button>`;
  }
  grid.innerHTML=html;
}
function readEditor(prefix){
  return {date:$(`#${prefix}Date6B13`)?.value||'',subject:$(`#${prefix}Subject6B13`)?.value.trim()||'',events:$(`#${prefix}Events6B13`)?.value||'',tasks:$(`#${prefix}Tasks6B13`)?.value||'',birthdays:$(`#${prefix}Birthdays6B13`)?.value||'',holidays:$(`#${prefix}Holidays6B13`)?.value||'',notes:$(`#${prefix}Notes6B13`)?.value||''};
}
function fillEditor(prefix,date){
  const v=calendarValue(date),map={Date:date,Subject:v.subject||'',Events:v.events||'',Tasks:v.tasks||'',Birthdays:v.birthdays||'',Holidays:v.holidays||'',Notes:v.notes||''};
  Object.entries(map).forEach(([key,value])=>{const el=$(`#${prefix}${key}6B13`);if(el)el.value=value});
}
function clearEditor(prefix){['Date','Subject','Events','Tasks','Birthdays','Holidays','Notes'].forEach(key=>{const el=$(`#${prefix}${key}6B13`);if(el)el.value=''})}
function saveDay(prefix){
  const value=readEditor(prefix);if(!value.date)return;
  store.mutate(state=>{state.calendar=state.calendar||{};state.calendar[value.date]={subject:value.subject,events:value.events,tasks:value.tasks,birthdays:value.birthdays,holidays:value.holidays,notes:value.notes}});
  fillEditor('page',value.date);renderCalendar();
  const status=$('#agendaSaveStatus6B13');if(status)status.textContent=`Saved ${value.date}.`;
  openDay(value.date);
}
function openDay(date){
  let dialog=$('#agendaDialog6B13');
  if(!dialog){
    document.body.insertAdjacentHTML('beforeend',`<dialog id="agendaDialog6B13" class="agenda-dialog agenda-dialog-6b13"><article class="card agenda-modal"><button class="icon-button reflection-close" data-close-agenda>×</button><div id="agendaDialogBody6B13"></div></article></dialog>`);
    dialog=$('#agendaDialog6B13');
  }
  const data=dateData(date);
  $('#agendaDialogBody6B13').innerHTML=`<div class="eyebrow">Edit this day</div><h2>${new Date(`${date}T12:00:00`).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</h2>
    <div class="agenda-summary-6b13">${[...data.national.map(x=>['holiday','National holiday',x]),...data.birthdays.map(x=>['birthday','Birthday',x]),...data.events.map(x=>['event','Event',x]),...data.tasks.map(x=>['task','Task',x]),...data.bills.map(x=>['bill',x.paid?'Paid bill':'Bill',`${x.name} · ${money(x.amount)}`])].map(([type,label,text])=>`<div class="agenda-quick-item ${type}"><span class="agenda-dot ${type}"></span><div><small>${esc(label)}</small><b>${esc(text)}</b></div></div>`).join('')||'<div class="status">This day is open.</div>'}</div>
    ${editorFields('modal')}
    <div class="row wrap"><button id="agendaDialogSave6B13" class="btn">Save Changes</button><button id="agendaDialogClear6B13" class="btn ghost">Clear Fields</button><button class="btn secondary" data-close-agenda>Close</button></div>`;
  fillEditor('modal',date);
  $('#agendaDialogSave6B13').onclick=()=>saveDay('modal');
  $('#agendaDialogClear6B13').onclick=()=>clearEditor('modal');
  all('[data-close-agenda]').forEach(b=>b.onclick=()=>dialog.close());
  if(dialog.open)dialog.close();dialog.showModal();
}
function enhanceAgenda(){
  agendaCursor=new Date(new Date().getFullYear(),new Date().getMonth(),1);
  renderCalendar();
  requestAnimationFrame(renderCalendar);
  loadHolidays();
  $('#agendaPrev6B13').onclick=()=>{if(agendaCursor>MIN_MONTH){agendaCursor=new Date(agendaCursor.getFullYear(),agendaCursor.getMonth()-1,1);renderCalendar()}};
  $('#agendaNext6B13').onclick=()=>{if(agendaCursor<MAX_MONTH){agendaCursor=new Date(agendaCursor.getFullYear(),agendaCursor.getMonth()+1,1);renderCalendar()}};
  $('#agendaCalendar6B13').onclick=event=>{const day=event.target.closest('[data-agenda-date]');if(day)openDay(day.dataset.agendaDate)};
  $('#agendaSave6B13').onclick=()=>saveDay('page');
  $('#agendaClear6B13').onclick=()=>{clearEditor('page');$('#agendaSaveStatus6B13').textContent='Editor cleared.'};
}

function billIdentity(b){return `${String(b.name||'').trim().toLowerCase()}|${Number(b.amount||0).toFixed(2)}|${String(b.due||'')}`;}
function consolidateBills(){
  const state=store.get(),map=new Map();
  (state.bills||[]).forEach(b=>{
    const key=billIdentity(b),existing=map.get(key);
    if(!existing)map.set(key,{...b});
    else map.set(key,{...existing,...b,id:existing.id||b.id,paid:Boolean(existing.paid||b.paid),paidDate:existing.paidDate||b.paidDate||''});
  });
  const unique=[...map.values()];
  if(unique.length!==(state.bills||[]).length)store.mutate(d=>{d.bills=unique});
}
function balancesCard(){
  const state=store.get();
  return `<article id="balances6B13" class="card balances-card-6b13"><div class="section-title"><div><div class="eyebrow">Available cash</div><h3>Account Balances</h3></div><span class="pill">Saved independently</span></div>
    <div class="balance-grid-6b13"><label>Checking<input id="checking6B13" type="number" step="0.01" value="${Number(state.checking||0)}"></label><label>Savings<input id="savings6B13" type="number" step="0.01" value="${Number(state.savings||0)}"></label><label>Other assets<input id="otherAssets6B13" type="number" step="0.01" value="${Number(state.otherAssets||0)}"></label></div>
    <button id="saveBalances6B13" class="btn" type="button">Save Account Balances</button><div id="balanceStatus6B13" class="status">Checking and savings are stored separately.</div></article>`;
}
function renderCanonicalBills(){
  const state=store.get(),bills=[...(state.bills||[])].sort((a,b)=>String(a.due||'').localeCompare(String(b.due||''))),paid=bills.filter(b=>b.paid),due=bills.filter(b=>!b.paid);
  let card=$('#canonicalBills6B13');
  if(!card)return;
  const filter=card.dataset.filter||'all',visible=bills.filter(b=>filter==='all'||(filter==='paid'?b.paid:!b.paid));
  card.innerHTML=`<div class="section-title"><div><div class="eyebrow">One canonical list</div><h3>Complete Bill Checklist</h3></div><span class="pill">${paid.length} / ${bills.length} paid</span></div>
    <div class="paid-metric-grid"><div><span>Paid</span><b>${money(paid.reduce((n,b)=>n+Number(b.amount||0),0))}</b></div><div><span>Still due</span><b>${money(due.reduce((n,b)=>n+Number(b.amount||0),0))}</b></div><div><span>Checking</span><b>${money(state.checking)}</b></div><div><span>Savings</span><b>${money(state.savings)}</b></div></div>
    <div class="segmented"><button data-filter="all">All</button><button data-filter="due">Due</button><button data-filter="paid">Paid</button></div>
    <div class="canonical-bill-list-6b13">${visible.map(b=>`<button type="button" class="canonical-bill-row-6b13 ${b.paid?'paid':''}" data-toggle-bill="${esc(b.id)}"><span class="bill-checkbox-6b12">${b.paid?'✓':''}</span><span><b>${esc(b.name)}</b><small>${money(b.amount)} · due ${esc(b.due||'not set')}${b.paid?` · paid ${esc(b.paidDate||localKey())}`:''}</small></span><strong>${b.paid?'Paid':'Still Due'}</strong></button>`).join('')||'<div class="status">No bills in this view.</div>'}</div>`;
  all('[data-filter]').forEach(button=>{button.classList.toggle('active',button.dataset.filter===filter);button.onclick=()=>{card.dataset.filter=button.dataset.filter;renderCanonicalBills()}});
  all('[data-toggle-bill]').forEach(button=>button.onclick=()=>{store.mutate(d=>{const bill=d.bills.find(x=>String(x.id)===String(button.dataset.toggleBill));if(bill){bill.paid=!bill.paid;bill.paidDate=bill.paid?localKey():''}});renderCanonicalBills();renderCalendar()});
}
function enhanceMoney(){
  consolidateBills();
  document.querySelectorAll('#paidCommand6B9,#billChecklistCard6B10,#billChecklist6B12').forEach(x=>x.remove());
  const page=$('.money-page')||$('#page');
  if(!page)return;
  const existingBalance=$('#balances6B13');if(!existingBalance)page.insertAdjacentHTML('afterbegin',balancesCard());
  let bills=$('#canonicalBills6B13');if(!bills){bills=document.createElement('article');bills.id='canonicalBills6B13';bills.className='card canonical-bills-6b13';page.append(bills)}
  const old=$('#billList')?.closest('.card');if(old)old.classList.add('hidden-legacy-bills-6b13');
  renderCanonicalBills();
  $('#saveBalances6B13').onclick=()=>{
    store.set({checking:Number($('#checking6B13').value)||0,savings:Number($('#savings6B13').value)||0,otherAssets:Number($('#otherAssets6B13').value)||0});
    $('#balanceStatus6B13').textContent='Checking, savings, and other assets saved separately.';
    renderCanonicalBills();
  };
}

let dashboardBinding=false;
function bindMorningBrief(router){
  if(dashboardBinding)return;dashboardBinding=true;
  document.addEventListener('click',event=>{
    const target=event.target.closest('button,a,[role="button"]');if(!target||!/Open Morning Brief/i.test(target.textContent))return;
    if(!target.closest('#page'))return;
    event.preventDefault();event.stopImmediatePropagation();router.go('intelligence');
  },true);
}
function updateBuild(){const badge=$('#kcBuildStatus b');if(badge)badge.textContent=BUILD}

export async function enhanceSprint6B13(id,router){
  updateBuild();bindMorningBrief(router);
  if(id==='calendar')enhanceAgenda();
  if(id==='money')requestAnimationFrame(()=>requestAnimationFrame(enhanceMoney));
}
