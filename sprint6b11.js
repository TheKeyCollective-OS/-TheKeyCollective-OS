
import {store} from './store.js';

const BUILD='Sprint 6B.11';
const $=s=>document.querySelector(s);
const all=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n)||0);
const localKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const lines=v=>String(v||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
let cursor=new Date(new Date().getFullYear(),new Date().getMonth(),1);
const MAX_MONTH=new Date(2030,11,1);
const MIN_MONTH=new Date(2020,0,1);

function agendaPage(){
  return `<div class="agenda-6b11">
    <div class="pagehead"><div><div class="eyebrow">Your private daily planner</div><h1>Agenda</h1><p class="sub">Editable dates, frosted details, and month navigation through December 2030.</p></div>
      <div class="agenda-month-controls"><button id="prevMonth6B11" type="button" class="btn ghost">←</button><span id="monthLabel6B11" class="pill">Loading calendar…</span><button id="nextMonth6B11" type="button" class="btn ghost">→</button></div></div>
    <article class="card"><div class="calendar-legend"><span><i class="dot event"></i>Event</span><span><i class="dot task"></i>Task</span><span><i class="dot birthday"></i>Birthday</span><span><i class="dot holiday"></i>Holiday</span><span><i class="dot bill"></i>Bill</span></div><div id="calendarGrid6B11" class="calendar"></div></article>
    <article class="card" style="margin-top:14px"><div class="section-title"><h3>Add or Edit Day</h3><span class="pill">Saved locally</span></div>${fields('page')}<div class="row wrap"><button id="saveDay6B11" class="btn">Save Day</button><button id="clearDay6B11" class="btn ghost">Clear Editor</button></div><div id="agendaStatus6B11" class="status">Ready.</div></article>
  </div>`;
}
function fields(prefix){
  return `<div class="agenda-field-grid"><label>Date<input id="${prefix}Date6B11" type="date" class="input"></label><label>Headline<input id="${prefix}Subject6B11" class="input"></label><label>Events<textarea id="${prefix}Events6B11" rows="3"></textarea></label><label>Tasks<textarea id="${prefix}Tasks6B11" rows="3"></textarea></label><label>Birthdays<textarea id="${prefix}Birthdays6B11" rows="2"></textarea></label><label>Holidays<textarea id="${prefix}Holidays6B11" rows="2"></textarea></label><label class="span-2">Notes<textarea id="${prefix}Notes6B11" rows="3"></textarea></label></div>`;
}
export function patchPagesSprint6B11(pages){pages.calendar=agendaPage}

function value(date){return store.get().calendar?.[date]||{}}
function types(date){
  const v=value(date),out=[];
  if(lines(v.events).length)out.push('event');
  if(lines(v.tasks).length)out.push('task');
  if(lines(v.birthdays).length)out.push('birthday');
  if(lines(v.holidays).length)out.push('holiday');
  if((store.get().bills||[]).some(b=>b.due===date))out.push('bill');
  return out;
}
function renderCalendar(){
  const grid=$('#calendarGrid6B11');if(!grid)return;
  const y=cursor.getFullYear(),m=cursor.getMonth(),first=new Date(y,m,1),count=new Date(y,m+1,0).getDate();
  $('#monthLabel6B11').textContent=first.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  $('#prevMonth6B11').disabled=cursor.getTime()<=MIN_MONTH.getTime();
  $('#nextMonth6B11').disabled=cursor.getTime()>=MAX_MONTH.getTime();
  let html=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<div class="calendar-weekday">${x}</div>`).join('');
  html+='<div class="calendar-blank"></div>'.repeat(first.getDay());
  for(let d=1;d<=count;d++){
    const key=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    html+=`<button type="button" class="calendar-day ${key===localKey()?'today':''}" data-date="${key}"><b>${d}</b><span class="calendar-dots">${types(key).map(t=>`<i class="dot ${t}"></i>`).join('')}</span></button>`;
  }
  grid.innerHTML=html;
}
function read(prefix){
  return {date:$(`#${prefix}Date6B11`)?.value||'',subject:$(`#${prefix}Subject6B11`)?.value.trim()||'',events:$(`#${prefix}Events6B11`)?.value||'',tasks:$(`#${prefix}Tasks6B11`)?.value||'',birthdays:$(`#${prefix}Birthdays6B11`)?.value||'',holidays:$(`#${prefix}Holidays6B11`)?.value||'',notes:$(`#${prefix}Notes6B11`)?.value||''};
}
function fill(prefix,date){
  const v=value(date);
  const map={Date:date,Subject:v.subject||'',Events:v.events||'',Tasks:v.tasks||'',Birthdays:v.birthdays||'',Holidays:v.holidays||'',Notes:v.notes||''};
  Object.entries(map).forEach(([k,val])=>{const el=$(`#${prefix}${k}6B11`);if(el)el.value=val});
}
function clear(prefix){['Date','Subject','Events','Tasks','Birthdays','Holidays','Notes'].forEach(k=>{const el=$(`#${prefix}${k}6B11`);if(el)el.value=''})}
function save(prefix){
  const v=read(prefix);if(!v.date)return;
  store.mutate(d=>{d.calendar=d.calendar||{};d.calendar[v.date]={subject:v.subject,events:v.events,tasks:v.tasks,birthdays:v.birthdays,holidays:v.holidays,notes:v.notes}});
  renderCalendar();fill('page',v.date);openDay(v.date);
  const s=$('#agendaStatus6B11');if(s)s.textContent=`Saved ${v.date}.`;
}
function openDay(date){
  let dialog=$('#agendaDialog6B11');
  if(!dialog){document.body.insertAdjacentHTML('beforeend',`<dialog id="agendaDialog6B11" class="agenda-dialog frosted-day-dialog"><article class="card agenda-modal"><button data-close-agenda class="icon-button reflection-close">×</button><div id="agendaBody6B11"></div></article></dialog>`);dialog=$('#agendaDialog6B11')}
  $('#agendaBody6B11').innerHTML=`<div class="eyebrow">Edit this day</div><h2>${new Date(`${date}T12:00:00`).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</h2>${fields('modal')}<div class="row wrap"><button id="saveModal6B11" class="btn">Save Changes</button><button id="clearModal6B11" class="btn ghost">Clear Fields</button><button data-close-agenda class="btn secondary">Close</button></div>`;
  fill('modal',date);
  $('#saveModal6B11').onclick=()=>save('modal');$('#clearModal6B11').onclick=()=>clear('modal');
  all('[data-close-agenda]').forEach(b=>b.onclick=()=>dialog.close());
  if(dialog.open)dialog.close();dialog.showModal();
}
function enhanceAgenda(){
  cursor=new Date(new Date().getFullYear(),new Date().getMonth(),1);
  requestAnimationFrame(()=>{renderCalendar();requestAnimationFrame(renderCalendar)});
  $('#prevMonth6B11').onclick=()=>{if(cursor>MIN_MONTH){cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1);renderCalendar()}};
  $('#nextMonth6B11').onclick=()=>{if(cursor<MAX_MONTH){cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);renderCalendar()}};
  $('#calendarGrid6B11').onclick=e=>{const b=e.target.closest('[data-date]');if(b)openDay(b.getAttribute('data-date'))};
  $('#saveDay6B11').onclick=()=>save('page');$('#clearDay6B11').onclick=()=>{clear('page');$('#agendaStatus6B11').textContent='Editor cleared.'};
}

function reviewTerms(){
  const raw=Array.isArray(store.get().academyReviewTerms)?store.get().academyReviewTerms:[];
  return [...new Set(raw.map(x=>String(x).trim()).filter(Boolean))];
}
function enhanceReviewList(){
  const button=$('#reviewAcademyTerms'),search=$('#academySearch'),category=$('#academyCategory');if(!button)return;
  button.textContent=`Study Review List (${reviewTerms().length})`;
  button.onclick=()=>{
    const terms=reviewTerms();
    let panel=$('#academyReviewPanel6B11');
    if(!panel){panel=document.createElement('article');panel.id='academyReviewPanel6B11';panel.className='card academy-review-panel-6b11';document.querySelector('.academy-library')?.before(panel)}
    panel.innerHTML=`<div class="section-title"><div><div class="eyebrow">Complete review deck</div><h3>${terms.length} unique terms</h3></div><button id="closeReview6B11" class="btn ghost">Close</button></div><div class="review-chip-grid">${terms.map(t=>`<button class="btn ghost" data-review-term="${esc(t)}">${esc(t)}</button>`).join('')||'<div class="status">No terms are waiting for review.</div>'}</div>`;
    panel.scrollIntoView({behavior:'smooth',block:'start'});
    $('#closeReview6B11').onclick=()=>panel.remove();
    all('[data-review-term]').forEach(b=>b.onclick=()=>{if(search)search.value=b.getAttribute('data-review-term');if(category)category.value='';search?.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('#academyDeck')?.scrollIntoView({behavior:'smooth',block:'center'})});
  };
}

function bindDashboard(router){
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(!button||!/Open Morning Brief/i.test(button.textContent))return;
    const dashboard=document.querySelector('.dashboard-grid');if(!dashboard||!dashboard.contains(button))return;
    event.preventDefault();event.stopImmediatePropagation();router.go('intelligence');
  },true);
}
function updateBuild(){const b=$('#kcBuildStatus b');if(b)b.textContent=BUILD}

export async function enhanceSprint6B11(id,router){
  updateBuild();
  if(id==='calendar')enhanceAgenda();
  if(id==='career')enhanceReviewList();
  if(id==='dashboard')bindDashboard(router);
}
