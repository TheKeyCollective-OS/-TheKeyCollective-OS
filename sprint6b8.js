
import {store} from './store.js';

const BUILD='Sprint 6B.8';
const $=s=>document.querySelector(s);
const all=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lines=v=>String(v||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n)||0);
const localKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const atNoon=k=>new Date(`${k}T12:00:00`);

function migrateNoir(){
  if(store.get().theme==='noir')store.set({theme:'midnight'});
  document.documentElement.dataset.theme=document.documentElement.dataset.theme==='noir'?'midnight':document.documentElement.dataset.theme;
  all('[data-theme-choice="noir"],[data-family="noir"],.theme-noir').forEach(el=>el.remove());
  all('.theme-card').forEach(card=>{if(/Noir Gala/i.test(card.textContent))card.remove()});
}

function agendaPage(){
  return `<div class="pagehead agenda-head"><div><div class="eyebrow">Your private daily planner</div><h1>Agenda</h1><p class="sub">Events, tasks, birthdays, holidays, notes, and bills—kept together on this device.</p></div><div class="agenda-month-controls"><button id="prevMonth" class="btn ghost">←</button><span id="monthLabel" class="pill"></span><button id="nextMonth" class="btn ghost">→</button></div></div>
  <article class="card"><div class="calendar-legend"><span><i class="dot event"></i>Event</span><span><i class="dot task"></i>Task</span><span><i class="dot birthday"></i>Birthday</span><span><i class="dot holiday"></i>Holiday</span><span><i class="dot bill"></i>Bill</span></div><div id="calendarGrid" class="calendar"></div></article>
  <div class="grid g2" style="margin-top:14px"><article class="card"><h3>Selected Day</h3><div id="selectedDayDetail" class="status">Tap any date to open its frosted detail window.</div></article><article class="card"><h3>Next 7 Days</h3><div id="next7"></div></article></div>
  <article class="card" style="margin-top:14px"><div class="section-title"><h3>Add or Edit Day</h3><span class="pill">Saved on this device</span></div>
    <input id="calDate" class="input" type="date"><input id="calSubject" class="input" placeholder="Day headline">
    <textarea id="calEvents" rows="3" placeholder="Events, one per line"></textarea><textarea id="calTasks" rows="3" placeholder="Tasks, one per line"></textarea>
    <textarea id="calBirthdays" rows="2" placeholder="Birthdays, one per line"></textarea><textarea id="calHolidays" rows="2" placeholder="Holidays, one per line"></textarea>
    <textarea id="calNotes" rows="3" placeholder="Notes"></textarea>
    <div class="row wrap"><button id="saveCalendarDay" type="button" class="btn">Save day</button><button id="clearCalendarEditor" type="button" class="btn ghost">Clear editor</button></div>
    <div id="agendaSaveStatus" class="status">Nothing has been changed yet.</div>
  </article>`;
}
export function patchPagesSprint6B8(pages){pages.calendar=agendaPage}

let cursor=new Date();
function dayItems(date){
  const st=store.get(),v=st.calendar?.[date]||{},items=[];
  lines(v.events).forEach(x=>items.push(['event','Event',x]));
  lines(v.tasks).forEach(x=>items.push(['task','Task',x]));
  lines(v.birthdays).forEach(x=>items.push(['birthday','Birthday',x]));
  lines(v.holidays).forEach(x=>items.push(['holiday','Holiday',x]));
  (st.bills||[]).filter(b=>b.due===date).forEach(b=>items.push(['bill',b.paid?'Paid bill':'Bill',`${b.name} · ${money(b.amount)}`]));
  if(v.notes)items.push(['note','Notes',v.notes]);
  return items;
}
function renderAgenda(){
  const grid=$('#calendarGrid');if(!grid)return;
  const y=cursor.getFullYear(),m=cursor.getMonth(),first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),start=first.getDay();
  $('#monthLabel').textContent=first.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  let html=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<div class="calendar-weekday">${x}</div>`).join('');
  html+='<div class="calendar-blank"></div>'.repeat(start);
  for(let d=1;d<=days;d++){
    const key=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`,types=[...new Set(dayItems(key).map(x=>x[0]))];
    html+=`<button type="button" class="calendar-day ${key===localKey()?'today':''}" data-day="${key}"><b>${d}</b><span class="calendar-dots">${types.map(t=>`<i class="dot ${t}"></i>`).join('')}</span></button>`;
  }
  grid.innerHTML=html;
  const end=new Date();end.setDate(end.getDate()+7);const from=localKey(),to=localKey(end),up=[];
  Object.entries(store.get().calendar||{}).forEach(([date,v])=>{if(date>=from&&date<=to)up.push({date,label:v.subject||lines(v.events)[0]||'Planned day'})});
  (store.get().bills||[]).forEach(b=>{if(b.due>=from&&b.due<=to)up.push({date:b.due,label:`${b.paid?'✓ ':''}${b.name} · ${money(b.amount)}`})});
  up.sort((a,b)=>a.date.localeCompare(b.date)||a.label.localeCompare(b.label));
  $('#next7').innerHTML=up.length?up.map(x=>`<button type="button" class="brief-line" data-day="${x.date}"><span>📅</span><div><b>${esc(x.label)}</b><small>${atNoon(x.date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</small></div></button>`).join(''):'<div class="status">Nothing scheduled in the next seven days.</div>';
}
function fill(date){
  const v=store.get().calendar?.[date]||{};
  $('#calDate').value=date;
  for(const [id,key] of [['calSubject','subject'],['calEvents','events'],['calTasks','tasks'],['calBirthdays','birthdays'],['calHolidays','holidays'],['calNotes','notes']])$('#'+id).value=v[key]||'';
}
function openDay(date){
  let d=$('#agendaDay6B8');
  if(!d){document.body.insertAdjacentHTML('beforeend',`<dialog id="agendaDay6B8" class="agenda-dialog frosted-day-dialog"><article class="card agenda-modal"><button type="button" class="icon-button reflection-close" data-close-day>×</button><div id="agendaDayBody6B8"></div></article></dialog>`);d=$('#agendaDay6B8')}
  const items=dayItems(date);
  $('#agendaDayBody6B8').innerHTML=`<div class="eyebrow">Agenda day details</div><h2>${atNoon(date).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</h2><div class="agenda-quick-list">${items.map(([type,label,text])=>`<div class="agenda-quick-item ${type}"><span class="agenda-dot ${type}"></span><div><small>${esc(label)}</small><b>${esc(text)}</b></div></div>`).join('')||'<div class="status">This day is open.</div>'}</div><div class="row"><button id="editDay6B8" class="btn">Edit this day</button><button data-close-day class="btn secondary">Close</button></div>`;
  all('[data-close-day]').forEach(b=>b.onclick=()=>d.close());
  $('#editDay6B8').onclick=()=>{d.close();fill(date);$('#calDate').scrollIntoView({behavior:'smooth'})};
  $('#selectedDayDetail').innerHTML=`<b>${date}</b><p>${items.length?items.map(x=>esc(x[2])).join(' · '):'Nothing scheduled.'}</p>`;
  if(d.open)d.close();d.showModal();
}
function enhanceAgenda(){
  cursor=new Date();renderAgenda();
  $('#prevMonth').onclick=()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1);renderAgenda()};
  $('#nextMonth').onclick=()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);renderAgenda()};
  const handler=e=>{const b=e.target.closest('[data-day]');if(!b)return;e.preventDefault();e.stopPropagation();openDay(b.dataset.day)};
  $('#calendarGrid').onclick=handler;$('#next7').onclick=handler;
  $('#saveCalendarDay').onclick=()=>{
    const date=$('#calDate').value;if(!date){$('#agendaSaveStatus').textContent='Choose a date first.';return}
    store.mutate(d=>{d.calendar=d.calendar||{};d.calendar[date]={subject:$('#calSubject').value.trim(),events:$('#calEvents').value,tasks:$('#calTasks').value,birthdays:$('#calBirthdays').value,holidays:$('#calHolidays').value,notes:$('#calNotes').value}});
    $('#agendaSaveStatus').textContent=`Saved ${date}.`;renderAgenda();openDay(date);
  };
  $('#clearCalendarEditor').onclick=()=>{for(const id of ['calDate','calSubject','calEvents','calTasks','calBirthdays','calHolidays','calNotes'])$('#'+id).value='';$('#agendaSaveStatus').textContent='Editor cleared.'};
}

function paidThisWeek(){
  const now=new Date(),start=new Date(now);start.setDate(now.getDate()-6);const a=localKey(start),b=localKey(now);
  return (store.get().bills||[]).filter(x=>x.paid&&(x.paidDate||x.due)>=a&&(x.paidDate||x.due)<=b);
}
function personalHighlights(){
  const st=store.get(),today=localKey(),end=new Date();end.setDate(end.getDate()+7),to=localKey(end);
  const paid=paidThisWeek();
  const due=(st.bills||[]).filter(x=>!x.paid&&x.due>=today&&x.due<=to).sort((a,b)=>a.due.localeCompare(b.due));
  const wins=(st.wins||[]).slice(0,3);
  const goals=(st.goals||[]).filter(g=>Number(g.progress)>=100).slice(0,3);
  return [
    ...paid.map(x=>({icon:'✓',title:`${x.name} was paid`,detail:`${money(x.amount)} paid this week`})),
    ...wins.map(x=>({icon:'🏆',title:x.text||'Personal win',detail:'Saved in Growth Studio'})),
    ...goals.map(x=>({icon:'✨',title:`Completed: ${x.name}`,detail:'25 Hard milestone'})),
    ...due.slice(0,3).map(x=>({icon:'📅',title:`${x.name} is coming up`,detail:`${money(x.amount)} due ${x.due}`}))
  ].slice(0,6);
}
function renderPersonalHighlights(host){
  const items=personalHighlights();
  host.innerHTML=items.length?items.map(x=>`<div class="brief-line"><span>${x.icon}</span><div><b>${esc(x.title)}</b><small>${esc(x.detail)}</small></div></div>`).join(''):'<div class="status">Your paid bills, completed goals, and saved wins will appear here.</div>';
}
function enhanceMorningBrief(){
  const heading=[...document.querySelectorAll('h3')].find(x=>/Memory Highlights/i.test(x.textContent));
  const card=heading?.closest('.card');if(card){heading.textContent='Personal Highlights';const body=[...card.children].filter(x=>!x.classList.contains('section-title'));body.forEach(x=>x.remove());const host=document.createElement('div');host.id='personalHighlights6B8';card.append(host);renderPersonalHighlights(host)}
}
function enhanceDashboard(){
  const cards=[...document.querySelectorAll('.dashboard-panel')];
  const card=cards.find(c=>/Executive Intelligence/i.test(c.textContent));if(!card)return;
  card.innerHTML=`<div class="mini">Executive Intelligence</div><h3>Your personal highlights are ready</h3><div id="dashboardInsights6B8"></div><button class="btn ghost" data-jump="intelligence">Open Morning Brief</button>`;
  renderPersonalHighlights($('#dashboardInsights6B8'));
}
function renderBillControls(){
  const list=$('#billList');if(!list)return;
  let controls=$('#billTracking6B8');
  if(!controls){controls=document.createElement('div');controls.id='billTracking6B8';controls.className='bill-tracking-toolbar';list.before(controls)}
  const st=store.get(),paid=st.bills.filter(b=>b.paid),total=paid.reduce((n,b)=>n+Number(b.amount||0),0);
  controls.innerHTML=`<div><b>${paid.length} paid</b><small>${money(total)} marked paid</small></div><div class="segmented"><button data-bill-filter="all">All</button><button data-bill-filter="unpaid">Unpaid</button><button data-bill-filter="paid">Paid</button></div>`;
  const current=controls.dataset.filter||'all';
  all('[data-bill-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.billFilter===current);b.onclick=()=>{controls.dataset.filter=b.dataset.billFilter;renderBillList()}});
  renderBillList();
}
function renderBillList(){
  const list=$('#billList'),controls=$('#billTracking6B8');if(!list||!controls)return;
  const filter=controls.dataset.filter||'all';
  const bills=[...store.get().bills].filter(b=>filter==='all'||(filter==='paid'?b.paid:!b.paid)).sort((a,b)=>String(a.due).localeCompare(String(b.due)));
  list.innerHTML=bills.length?bills.map(b=>`<article class="bill-row ${b.paid?'paid':''}"><label class="bill-paid-check"><input type="checkbox" data-toggle-paid="${b.id}" ${b.paid?'checked':''}><span>${b.paid?'Paid':'Mark paid'}</span></label><div class="bill-info"><strong>${esc(b.name)}</strong><small>${money(b.amount)} · due ${b.due}</small>${b.paid?`<small>Paid ${b.paidDate||localKey()}</small>`:''}</div><div class="bill-actions"><button class="text-button" data-edit-bill="${b.id}">Edit</button></div></article>`).join(''):'<div class="status">No bills in this view.</div>';
  all('[data-toggle-paid]').forEach(c=>c.onchange=()=>{store.mutate(d=>{const b=d.bills.find(x=>String(x.id)===String(c.dataset.togglePaid));if(b){b.paid=c.checked;b.paidDate=c.checked?localKey():''}});renderBillControls()});
  all('[data-edit-bill]').forEach(button=>button.onclick=()=>{
    const bill=store.get().bills.find(x=>String(x.id)===String(button.dataset.editBill));if(!bill)return;
    if($('#billEditId'))$('#billEditId').value=bill.id;
    if($('#billName'))$('#billName').value=bill.name;
    if($('#billAmount'))$('#billAmount').value=bill.amount;
    if($('#billDue'))$('#billDue').value=bill.due;
    if($('#billCategory'))$('#billCategory').value=bill.category||'Other';
    if($('#billFrequency'))$('#billFrequency').value=bill.frequency||'Monthly';
    if($('#billPaid'))$('#billPaid').checked=!!bill.paid;
    if($('#addBill'))$('#addBill').textContent='Update Bill';
    $('#billName')?.scrollIntoView({behavior:'smooth',block:'center'});
  });
}
function enhanceMoney(){setTimeout(renderBillControls,0)}

function updateBuild(){const b=$('#kcBuildStatus b');if(b)b.textContent=BUILD}

export async function enhanceSprint6B8(id,router){
  migrateNoir();updateBuild();
  if(id==='calendar')enhanceAgenda();
  if(id==='intelligence')enhanceMorningBrief();
  if(id==='dashboard'){enhanceDashboard();all('[data-jump]').forEach(b=>b.onclick=()=>router.go(b.dataset.jump))}
  if(id==='money')enhanceMoney();
}
