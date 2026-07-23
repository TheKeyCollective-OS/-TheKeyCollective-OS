
import {store} from './store.js';

const BUILD='Sprint 6B.14 Corrective';
const $=s=>document.querySelector(s);
const all=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n)||0);
const localKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const lines=v=>String(v||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const FALLBACK_HOLIDAYS={"2026": [{"date": "2026-01-01", "name": "New Year's Day", "source": "fallback"}, {"date": "2026-01-19", "name": "Martin Luther King Jr. Day", "source": "fallback"}, {"date": "2026-02-16", "name": "Washington's Birthday", "source": "fallback"}, {"date": "2026-05-25", "name": "Memorial Day", "source": "fallback"}, {"date": "2026-06-19", "name": "Juneteenth National Independence Day", "source": "fallback"}, {"date": "2026-07-04", "name": "Independence Day", "source": "fallback"}, {"date": "2026-09-07", "name": "Labor Day", "source": "fallback"}, {"date": "2026-10-12", "name": "Columbus Day", "source": "fallback"}, {"date": "2026-11-11", "name": "Veterans Day", "source": "fallback"}, {"date": "2026-11-26", "name": "Thanksgiving Day", "source": "fallback"}, {"date": "2026-12-25", "name": "Christmas Day", "source": "fallback"}], "2027": [{"date": "2027-01-01", "name": "New Year's Day", "source": "fallback"}, {"date": "2027-01-18", "name": "Martin Luther King Jr. Day", "source": "fallback"}, {"date": "2027-02-15", "name": "Washington's Birthday", "source": "fallback"}, {"date": "2027-05-31", "name": "Memorial Day", "source": "fallback"}, {"date": "2027-06-19", "name": "Juneteenth National Independence Day", "source": "fallback"}, {"date": "2027-07-04", "name": "Independence Day", "source": "fallback"}, {"date": "2027-09-06", "name": "Labor Day", "source": "fallback"}, {"date": "2027-10-11", "name": "Columbus Day", "source": "fallback"}, {"date": "2027-11-11", "name": "Veterans Day", "source": "fallback"}, {"date": "2027-11-25", "name": "Thanksgiving Day", "source": "fallback"}, {"date": "2027-12-25", "name": "Christmas Day", "source": "fallback"}], "2028": [{"date": "2028-01-01", "name": "New Year's Day", "source": "fallback"}, {"date": "2028-01-17", "name": "Martin Luther King Jr. Day", "source": "fallback"}, {"date": "2028-02-21", "name": "Washington's Birthday", "source": "fallback"}, {"date": "2028-05-29", "name": "Memorial Day", "source": "fallback"}, {"date": "2028-06-19", "name": "Juneteenth National Independence Day", "source": "fallback"}, {"date": "2028-07-04", "name": "Independence Day", "source": "fallback"}, {"date": "2028-09-04", "name": "Labor Day", "source": "fallback"}, {"date": "2028-10-09", "name": "Columbus Day", "source": "fallback"}, {"date": "2028-11-11", "name": "Veterans Day", "source": "fallback"}, {"date": "2028-11-23", "name": "Thanksgiving Day", "source": "fallback"}, {"date": "2028-12-25", "name": "Christmas Day", "source": "fallback"}], "2029": [{"date": "2029-01-01", "name": "New Year's Day", "source": "fallback"}, {"date": "2029-01-15", "name": "Martin Luther King Jr. Day", "source": "fallback"}, {"date": "2029-02-19", "name": "Washington's Birthday", "source": "fallback"}, {"date": "2029-05-28", "name": "Memorial Day", "source": "fallback"}, {"date": "2029-06-19", "name": "Juneteenth National Independence Day", "source": "fallback"}, {"date": "2029-07-04", "name": "Independence Day", "source": "fallback"}, {"date": "2029-09-03", "name": "Labor Day", "source": "fallback"}, {"date": "2029-10-08", "name": "Columbus Day", "source": "fallback"}, {"date": "2029-11-11", "name": "Veterans Day", "source": "fallback"}, {"date": "2029-11-22", "name": "Thanksgiving Day", "source": "fallback"}, {"date": "2029-12-25", "name": "Christmas Day", "source": "fallback"}], "2030": [{"date": "2030-01-01", "name": "New Year's Day", "source": "fallback"}, {"date": "2030-01-21", "name": "Martin Luther King Jr. Day", "source": "fallback"}, {"date": "2030-02-18", "name": "Washington's Birthday", "source": "fallback"}, {"date": "2030-05-27", "name": "Memorial Day", "source": "fallback"}, {"date": "2030-06-19", "name": "Juneteenth National Independence Day", "source": "fallback"}, {"date": "2030-07-04", "name": "Independence Day", "source": "fallback"}, {"date": "2030-09-02", "name": "Labor Day", "source": "fallback"}, {"date": "2030-10-14", "name": "Columbus Day", "source": "fallback"}, {"date": "2030-11-11", "name": "Veterans Day", "source": "fallback"}, {"date": "2030-11-28", "name": "Thanksgiving Day", "source": "fallback"}, {"date": "2030-12-25", "name": "Christmas Day", "source": "fallback"}]};
const HOLIDAY_CACHE_KEY='keyCollectiveOS.usHolidays.v4';
const HOLIDAY_CACHE_TTL=1000*60*60*24*30;
const ORIGINAL_BILLS=[{"name":"Credit One Bank – Card 2","amount":5.0,"due":"2026-07-21","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"imported-bill-01"},{"name":"Apple Music","amount":11.99,"due":"2026-07-21","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"imported-bill-02"},{"name":"Progressive Car Insurance","amount":218.75,"due":"2026-07-21","clearDate":"2026-07-24","category":"Insurance","frequency":"Monthly","paid":false,"id":"imported-bill-03"},{"name":"Amazon Kids+","amount":6.52,"due":"2026-07-22","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"imported-bill-04"},{"name":"Affirm – Balance $45.16 – Final Aug 23 2026","amount":22.59,"due":"2026-07-23","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"imported-bill-05"},{"name":"Klarna","amount":43.05,"due":"2026-07-24","clearDate":"","category":"Debt","frequency":"One-time","paid":false,"id":"imported-bill-06"},{"name":"Affirm – Balance $574.13 – Final Jun 28 2027","amount":47.87,"due":"2026-07-28","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"imported-bill-07"},{"name":"T-Mobile","amount":98.0,"due":"2026-07-29","clearDate":"","category":"Utilities","frequency":"Monthly","paid":false,"id":"imported-bill-08"},{"name":"Netflix","amount":11.99,"due":"2026-07-29","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"imported-bill-09"},{"name":"Amazon Prime","amount":16.31,"due":"2026-07-29","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"imported-bill-10"},{"name":"Gym","amount":52.98,"due":"2026-07-29","clearDate":"","category":"Other","frequency":"Monthly","paid":false,"id":"imported-bill-11"},{"name":"Apple Card","amount":140.5,"due":"2026-07-31","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"imported-bill-12"},{"name":"Klarna","amount":5.44,"due":"2026-07-31","clearDate":"","category":"Debt","frequency":"One-time","paid":false,"id":"imported-bill-13"},{"name":"Klarna","amount":77.46,"due":"2026-07-31","clearDate":"","category":"Debt","frequency":"One-time","paid":false,"id":"imported-bill-14"},{"name":"Klarna","amount":7.07,"due":"2026-07-31","clearDate":"","category":"Debt","frequency":"One-time","paid":false,"id":"imported-bill-15"},{"name":"Preschool","amount":570.0,"due":"2026-08-01","clearDate":"","category":"Family","frequency":"Monthly","paid":false,"id":"imported-bill-16"},{"name":"Disney+","amount":21.75,"due":"2026-08-02","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"imported-bill-17"},{"name":"Apple iCloud","amount":9.99,"due":"2026-08-05","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"imported-bill-18"},{"name":"AppleCare+","amount":9.99,"due":"2026-08-05","clearDate":"","category":"Insurance","frequency":"Monthly","paid":false,"id":"imported-bill-19"},{"name":"Affirm – Balance $135.52 – Final Jan 5 2027","amount":22.59,"due":"2026-08-05","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"imported-bill-20"},{"name":"Peacock","amount":15.12,"due":"2026-08-08","clearDate":"2026-08-13","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"imported-bill-21"},{"name":"Car Payment","amount":246.63,"due":"2026-08-10","clearDate":"","category":"Transportation","frequency":"Monthly","paid":false,"id":"imported-bill-22"},{"name":"Capital One Quicksilver – Balance $10005.37","amount":564.0,"due":"2026-08-11","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"imported-bill-23"},{"name":"Credit One Bank – Card 1","amount":8.25,"due":"2026-08-12","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"imported-bill-24"},{"name":"Premier Credit Card","amount":12.0,"due":"2026-08-20","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"imported-bill-25"},{"name":"Google Drive","amount":9.99,"due":"2026-08-20","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"imported-bill-26"},{"name":"ChatGPT","amount":20.0,"due":"2026-08-20","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"imported-bill-27"},{"name":"Affirm – Balance $210.65 – Final Nov 20 2026","amount":69.94,"due":"2026-08-20","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"imported-bill-28"}];

let agendaCursor=(()=>{try{const raw=localStorage.getItem('keyCollectiveOS.agendaMonth');if(raw&&/^\d{4}-\d{2}$/.test(raw)){const [y,m]=raw.split('-').map(Number);return new Date(y,m-1,1)}}catch{}return new Date(new Date().getFullYear(),new Date().getMonth(),1)})();
const MIN_MONTH=new Date(2020,0,1);
const MAX_MONTH=new Date(2030,11,1);
let holidayMap={};

function agendaPage(){
  return `<div class="agenda-final-6b13">
    <header class="pagehead"><div><div class="eyebrow">Your private daily planner</div><h1>Agenda</h1><p class="sub">National holidays, birthdays, bills, and personal plans in one editable calendar.</p></div>
      <div class="agenda-nav-6b13"><button id="agendaPrev6B13" class="btn ghost" type="button" aria-label="Previous month">←</button><button id="agendaMonth6B13" class="pill agenda-month-picker-6b14" type="button" aria-label="Jump to month and year">Calendar</button><input id="agendaMonthJump6B14" class="agenda-month-native-6b14" type="date" min="2020-01-01" max="2030-12-31" aria-label="Choose a date to jump to its month"><button id="agendaNext6B13" class="btn ghost" type="button" aria-label="Next month">→</button></div></header>
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
  $('#agendaMonth6B13').textContent=first.toLocaleDateString('en-US',{month:'long',year:'numeric'});localStorage.setItem('keyCollectiveOS.agendaMonth',`${year}-${String(month+1).padStart(2,'0')}`);
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
  renderCalendar();
  requestAnimationFrame(renderCalendar);
  loadHolidays();
  $('#agendaPrev6B13').onclick=()=>{if(agendaCursor>MIN_MONTH){agendaCursor=new Date(agendaCursor.getFullYear(),agendaCursor.getMonth()-1,1);renderCalendar()}};
  const jump=$('#agendaMonthJump6B14');const monthButton=$('#agendaMonth6B13');if(jump&&monthButton){monthButton.onclick=()=>{jump.value=`${agendaCursor.getFullYear()}-${String(agendaCursor.getMonth()+1).padStart(2,'0')}-01`;if(typeof jump.showPicker==='function')jump.showPicker();else jump.click()};jump.onchange=()=>{if(!jump.value)return;const chosen=new Date(`${jump.value}T12:00:00`);agendaCursor=new Date(chosen.getFullYear(),chosen.getMonth(),1);renderCalendar()}};
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
function enhanceMoneyLegacy6B14(){
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


function billStableKey(b){
  const id=String(b?.id||'');
  if(/^imported-bill-\d+$/i.test(id))return id.toLowerCase();
  return `${String(b?.name||'').trim().toLowerCase()}|${Number(b?.amount||0).toFixed(2)}|${String(b?.due||'')}`;
}
function restoreBillsIfNeeded(){
  const state=store.get();
  if(Array.isArray(state.bills)&&state.bills.length)return false;
  store.mutate(d=>{d.bills=ORIGINAL_BILLS.map(b=>({...b}))});
  return true;
}
function dedupeBillsByStableIdentity(){
  store.mutate(d=>{
    const map=new Map();
    (d.bills||[]).forEach((bill,index)=>{
      const stable=billStableKey(bill)||`bill-${index}`;
      if(!map.has(stable))map.set(stable,{...bill,id:bill.id||stable});
      else{
        const old=map.get(stable);
        map.set(stable,{...old,...bill,id:old.id,paid:Boolean(old.paid||bill.paid),paidDate:old.paidDate||bill.paidDate||''});
      }
    });
    d.bills=[...map.values()];
  });
}
function liveFinancialTotals(){
  const st=store.get(),bills=st.bills||[],due=bills.filter(b=>!b.paid),total=bills.reduce((n,b)=>n+Number(b.amount||0),0),stillDue=due.reduce((n,b)=>n+Number(b.amount||0),0);
  const cash=Number(st.checking||0)+Number(st.savings||0)+Number(st.otherAssets||0);
  const projected=cash-stillDue,surplus=Number(st.monthlyIncome||0)-stillDue;
  const set=(sel,value)=>{const el=$(sel);if(el)el.textContent=value};
  set('#moneyAvailable',money(cash));set('#moneyBillsTotal',money(total));set('#moneyProjected',money(projected));set('#moneySurplus',money(surplus));
}
function importedEditorHTML(){
  const bills=store.get().bills||[];
  return `<article id="billImportEditor6B14" class="card bill-import-editor-6b14"><div class="section-title"><div><div class="eyebrow">Imported bills</div><h3>Live Bill Editor</h3></div><span class="pill">${bills.length} bills</span></div>
  <p class="muted">Edit any amount, name, due date, category, or frequency. Changes update the canonical list and totals immediately.</p>
  <div class="bill-import-preview-6b14">${bills.map((b,i)=>`<div class="bill-import-row-6b14" data-bill-editor="${esc(b.id)}"><span class="bill-import-index">${i+1}</span><input data-bill-field="name" value="${esc(b.name)}" aria-label="Bill name"><input data-bill-field="amount" type="number" step="0.01" min="0" value="${Number(b.amount||0)}" aria-label="Amount"><input data-bill-field="due" type="date" value="${esc(b.due||'')}" aria-label="Due date"><input data-bill-field="category" value="${esc(b.category||'Other')}" aria-label="Category"><select data-bill-field="frequency" aria-label="Frequency">${['Monthly','One-time','Weekly','Biweekly','Quarterly','Annual'].map(x=>`<option ${x===(b.frequency||'Monthly')?'selected':''}>${x}</option>`).join('')}</select></div>`).join('')}</div>
  <div id="billImportPreviewStatus6B14" class="status">${bills.length} existing · 0 duplicates · 0 replacements</div></article>`;
}
function updateBillField(id,field,value){
  store.mutate(d=>{const bill=(d.bills||[]).find(x=>String(x.id)===String(id));if(!bill)return;bill[field]=field==='amount'?Math.max(0,Number(value)||0):value});
  renderCanonicalBills();liveFinancialTotals();renderCalendar();
  const status=$('#billImportPreviewStatus6B14');if(status)status.textContent='Saved instantly · canonical list and totals updated';
}
function bindImportedEditor(){
  const host=$('#billImportEditor6B14');if(!host)return;
  host.addEventListener('input',e=>{const field=e.target.dataset.billField,row=e.target.closest('[data-bill-editor]');if(!field||!row)return;updateBillField(row.dataset.billEditor,field,e.target.value)});
  host.addEventListener('change',e=>{const field=e.target.dataset.billField,row=e.target.closest('[data-bill-editor]');if(!field||!row)return;updateBillField(row.dataset.billEditor,field,e.target.value)});
}
function enhanceMoney6B14(){
  const restored=restoreBillsIfNeeded();dedupeBillsByStableIdentity();
  enhanceMoneyLegacy6B14();
  const page=$('.money-page')||$('#page');if(!page)return;
  if(!$('#billImportEditor6B14')){
    const balance=$('#balances6B13');
    if(balance)balance.insertAdjacentHTML('afterend',importedEditorHTML());
    else page.insertAdjacentHTML('afterbegin',importedEditorHTML());
  }
  bindImportedEditor();renderCanonicalBills();liveFinancialTotals();
  if(restored){const status=$('#billImportPreviewStatus6B14');if(status)status.textContent='Original 28-bill list restored safely · 0 duplicates';}
}
function academyStats6B14(){
  const state=store.get(),results=Array.isArray(state.academyQuizResults)?state.academyQuizResults:[];
  const end=new Date(),start=new Date();start.setHours(0,0,0,0);start.setDate(start.getDate()-6);
  const week=results.filter(r=>{const d=new Date(r.date);return !Number.isNaN(d.getTime())&&d>=start&&d<=end});
  const avg=week.length?Math.round(week.reduce((n,r)=>n+Number(r.score||0),0)/week.length):0;
  const latest=results[0]||null,missed={},correct={};
  week.forEach(r=>{(r.missed||[]).forEach(t=>missed[t]=(missed[t]||0)+1);(r.correctTerms||[]).forEach(t=>correct[t]=(correct[t]||0)+1)});
  return {week,avg,latest,review:(state.academyReviewTerms||[]).length,strong:Object.entries(correct).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]),weak:Object.entries(missed).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0])};
}
function academySummary6B14(){
  const s=academyStats6B14();
  return `<div class="academy-summary-lines academy-summary-6b14"><div><span>Quizzes this week</span><b>${s.week.length}</b></div><div><span>Latest score</span><b>${s.latest?`${s.latest.score}%`:'—'}</b></div><div><span>Weekly average</span><b>${s.week.length?`${s.avg}%`:'—'}</b></div><div><span>Review list</span><b>${s.review}</b></div></div><p class="muted">${s.strong.length?`Strongest: ${s.strong.map(esc).join(' · ')}`:'Complete a quiz to reveal your strengths.'}</p><p class="muted">${s.weak.length?`Review: ${s.weak.map(esc).join(' · ')}`:'No repeated misses this week.'}</p>`;
}
let academySyncBound6B14=false;
function syncAcademySurfaces6B14(id,router){
  if(id==='dashboard'){
    let panel=$('#academyDashboard6B14');
    if(!panel){panel=document.createElement('article');panel.id='academyDashboard6B14';panel.className='card dashboard-panel';const target=[...document.querySelectorAll('.dashboard-panel,.card')].find(x=>/Payments Academy/i.test(x.textContent));if(target)target.replaceWith(panel);else ($('#page .dashboard-grid')||$('#page')).append(panel)}
    panel.innerHTML=`<div class="mini">Payments Academy</div><h3>Your weekly learning signal</h3>${academySummary6B14()}<button class="btn ghost" id="openAcademy6B14">Open Payments Academy</button>`;
    $('#openAcademy6B14').onclick=()=>router.go('career');
  }
  if(id==='intelligence'){
    let card=$('#academyBrief6B14');
    if(!card){card=document.createElement('article');card.id='academyBrief6B14';card.className='card';const grid=$('#page .intelligence-grid')||$('#page');grid.append(card)}
    card.innerHTML=`<div class="section-title"><h3>Payments Academy</h3><button class="btn ghost" id="briefAcademyOpen6B14">Open Academy</button></div>${academySummary6B14()}`;
    $('#briefAcademyOpen6B14').onclick=()=>router.go('career');
  }
}

export async function enhanceSprint6B13(id,router){
  updateBuild();bindMorningBrief(router);syncAcademySurfaces6B14(id,router);
  if(!academySyncBound6B14){academySyncBound6B14=true;window.addEventListener('kc:state',()=>{const route=location.hash.replace(/^#\/?/,'')||'dashboard';if(route==='dashboard'||route==='intelligence')syncAcademySurfaces6B14(route,router)})}
  if(id==='calendar')enhanceAgenda();
  if(id==='money')requestAnimationFrame(()=>requestAnimationFrame(enhanceMoney6B14));
}
