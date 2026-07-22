
import {store} from './store.js';

const BUILD='Sprint 6B.5';
const $=s=>document.querySelector(s);
const all=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const splitLines=v=>String(v||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);

function localDateKey(date=new Date()){
  const y=date.getFullYear();
  const m=String(date.getMonth()+1).padStart(2,'0');
  const d=String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
function dateAtNoon(key){return new Date(`${key}T12:00:00`)}

function agendaPage(){
  return `<div class="pagehead agenda-head"><div><div class="eyebrow">Your private daily planner</div><h1>Agenda</h1><p class="sub">Events, tasks, birthdays, holidays, and bills—kept together inside The Key Collective.</p></div>
  <div class="agenda-month-controls"><button class="btn ghost" id="prevMonth" aria-label="Previous month">←</button><span id="monthLabel" class="pill"></span><button class="btn ghost" id="nextMonth" aria-label="Next month">→</button></div></div>
  <section class="card agenda-actions-card"><div class="section-title"><div><div class="eyebrow">Calendar tools</div><h3>Bring in a calendar when you choose</h3></div><span class="pill">No account connection required</span></div>
    <div class="agenda-primary-actions"><button id="agendaImportOpen" class="btn">Import calendar</button><button id="agendaExportOpen" class="btn secondary">Export Agenda</button></div>
    <p class="muted">Import offers multiple choices first. The Files picker opens only after you select a file option.</p>
  </section>
  <article class="card"><div class="calendar-legend"><span><i class="dot event"></i>Event</span><span><i class="dot task"></i>Task</span><span><i class="dot birthday"></i>Birthday</span><span><i class="dot holiday"></i>Holiday</span><span><i class="dot bill"></i>Bill</span></div><div id="calendarGrid" class="calendar"></div></article>
  <div class="grid g2" style="margin-top:14px"><article class="card"><h3>Selected Day</h3><div id="selectedDayDetail" class="status">Tap any date to open its frosted detail view.</div></article><article class="card"><h3>Next 7 Days</h3><div id="next7"></div></article></div>
  <article class="card" style="margin-top:14px"><div class="section-title"><h3>Add or Edit Day</h3><span class="pill">One date · many layers</span></div>
    <input id="calDate" class="input" type="date"><input id="calSubject" class="input" placeholder="Day headline">
    <textarea id="calEvents" rows="3" placeholder="Events, one per line"></textarea><textarea id="calTasks" rows="3" placeholder="Tasks, one per line"></textarea>
    <textarea id="calBirthdays" rows="2" placeholder="Birthdays, one per line"></textarea><textarea id="calHolidays" rows="2" placeholder="Holidays or observances"></textarea>
    <textarea id="calNotes" rows="3" placeholder="Notes"></textarea><div class="row wrap"><button id="saveCalendarDay" class="btn">Save day</button><button id="clearCalendarEditor" class="btn ghost">Clear editor</button></div>
  </article>`;
}

function wellnessPage(){
  const state=store.get();
  return `<div class="pagehead"><div><div class="eyebrow">Simple, useful wellness</div><h1>Wellness Studio</h1><p class="sub">Track only the habits you actually use.</p></div></div>
  <div class="grid g2 wellness-essential-grid">
    <article class="card gradient-card wellness-water-card"><div class="section-title"><div><div class="eyebrow">Daily hydration</div><h3>Water</h3></div><span id="waterCountPill" class="pill">${state.water||0}/8 glasses</span></div>
      <div id="waterMetric" class="metric">${state.water||0}/8</div><div class="bar wellness-water-bar"><span id="waterBar" style="width:${Math.min(100,(state.water||0)/8*100)}%"></span></div>
      <div class="row wrap"><button id="waterPlus" type="button" class="btn">＋ Add water</button><button id="waterMinus" type="button" class="btn secondary">− Remove one</button><button id="waterReset" type="button" class="btn ghost">Reset</button></div>
      <div id="waterStatus" class="status">Updates here without leaving Wellness Studio.</div>
    </article>
    <article class="card gradient-card"><div class="section-title"><div><div class="eyebrow">Useful shortcuts</div><h3>Fitness tools</h3></div></div>
      <p>Open your external fitness services only when you choose.</p><div class="row wrap"><a class="btn" href="myfitnesspal://">MyFitnessPal</a><a class="btn secondary" target="_blank" rel="noopener" href="https://www.eosfitness.com/">EOS Fitness</a></div>
    </article>
  </div>
  <article class="card" style="margin-top:14px"><div class="section-title"><div><div class="eyebrow">A cleaner page</div><h3>Hydration consistency</h3></div><span class="pill">${(state.water||0)>=8?'Goal reached':'In progress'}</span></div>
    <div class="prompt">${(state.water||0)>=8?'Hydration goal complete for today. Nicely done.':'Add each glass as you go. No mood score, recovery score, movement minutes, or sleep logging required.'}</div>
  </article>`;
}

export function patchPagesSprint6B5(pages){
  pages.calendar=agendaPage;
  pages.wellness=wellnessPage;
}

function notify(title,message=''){
  let host=$('#interactionNotices');
  if(!host){host=document.createElement('div');host.id='interactionNotices';host.className='lux-notifications';host.setAttribute('aria-live','polite');document.body.append(host)}
  const n=document.createElement('div');n.className='lux-notice success show';n.innerHTML=`<span class="notice-mark">✓</span><div><b>${esc(title)}</b><small>${esc(message)}</small></div>`;
  host.append(n);setTimeout(()=>{n.classList.remove('show');setTimeout(()=>n.remove(),250)},2600);
}
function dialog(id,markup){
  let d=$('#'+id);
  if(!d){document.body.insertAdjacentHTML('beforeend',markup);d=$('#'+id)}
  return d;
}

function itemsFor(date){
  const state=store.get(),day=state.calendar?.[date]||{},items=[];
  splitLines(day.events).forEach(text=>items.push(['event','Event',text]));
  splitLines(day.tasks).forEach(text=>items.push(['task','Task',text]));
  splitLines(day.birthdays).forEach(text=>items.push(['birthday','Birthday',text]));
  splitLines(day.holidays).forEach(text=>items.push(['holiday','Holiday',text]));
  (state.bills||[]).filter(b=>b.due===date).forEach(b=>items.push(['bill','Bill',`${b.name} · $${Number(b.amount||0).toFixed(2)}`]));
  if(day.notes)items.push(['note','Notes',day.notes]);
  return items;
}

let cursor=new Date();
function calendarKey(y,m,d){return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
function renderCalendar(){
  const grid=$('#calendarGrid');if(!grid)return;
  const y=cursor.getFullYear(),m=cursor.getMonth(),first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),start=first.getDay();
  $('#monthLabel').textContent=first.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const cells=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day=>`<div class="calendar-weekday">${day}</div>`);
  for(let i=0;i<start;i++)cells.push('<div class="calendar-blank"></div>');
  const today=localDateKey();
  for(let day=1;day<=days;day++){
    const key=calendarKey(y,m,day),types=[...new Set(itemsFor(key).map(item=>item[0]))];
    cells.push(`<button type="button" class="calendar-day ${key===today?'today':''}" data-calendar-date="${key}" aria-label="Open details for ${first.toLocaleDateString('en-US',{month:'long'})} ${day}, ${y}"><b>${day}</b><span class="calendar-dots">${types.slice(0,5).map(type=>`<i class="dot ${type}"></i>`).join('')}</span></button>`);
  }
  grid.innerHTML=cells.join('');

  const end=new Date();end.setDate(end.getDate()+7);
  const from=localDateKey(),to=localDateKey(end),state=store.get(),upcoming=[];
  Object.entries(state.calendar||{}).forEach(([date,value])=>{
    if(date>=from&&date<=to)upcoming.push({date,label:value.subject||splitLines(value.events)[0]||'Planned day',type:'Calendar'});
  });
  (state.bills||[]).forEach(bill=>{
    if(bill.due>=from&&bill.due<=to)upcoming.push({date:bill.due,label:`${bill.name} · $${Number(bill.amount||0).toFixed(2)}`,type:'Bill'});
  });
  upcoming.sort((a,b)=>a.date.localeCompare(b.date)||a.label.localeCompare(b.label));
  $('#next7').innerHTML=upcoming.length?upcoming.map(item=>`<button type="button" class="brief-line agenda-upcoming" data-calendar-date="${item.date}"><span>${item.type==='Bill'?'$':'📅'}</span><div><b>${esc(item.label)}</b><small>${dateAtNoon(item.date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} · ${item.type}</small></div></button>`).join(''):'<div class="status">Nothing scheduled in the next seven days.</div>';
}

function fillEditor(date){
  const value=store.get().calendar?.[date]||{};
  $('#calDate').value=date;
  [['calSubject','subject'],['calEvents','events'],['calTasks','tasks'],['calBirthdays','birthdays'],['calHolidays','holidays'],['calNotes','notes']].forEach(([id,key])=>$('#'+id).value=value[key]||'');
}

function openDay(date){
  const items=itemsFor(date),day=store.get().calendar?.[date]||{};
  const d=dialog('agendaDayDetail6B5',`<dialog id="agendaDayDetail6B5" class="agenda-dialog frosted-day-dialog"><article class="card agenda-modal"><button type="button" class="icon-button reflection-close" data-close-agenda-day aria-label="Close">×</button><div id="agendaDayDetailContent"></div></article></dialog>`);
  $('#agendaDayDetailContent').innerHTML=`<div class="eyebrow">Agenda day details</div><h2>${dateAtNoon(date).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</h2>
    <p class="muted">${items.length?`${items.length} item${items.length===1?'':'s'} scheduled`:'This day is open.'}</p>
    <div class="agenda-quick-list">${items.map(([type,label,text])=>`<div class="agenda-quick-item ${type}"><span class="agenda-dot ${type}"></span><div><small>${esc(label)}</small><b>${esc(text)}</b></div></div>`).join('')||'<div class="status">No events, tasks, birthdays, holidays, notes, or bills are listed.</div>'}</div>
    <div class="row modal-actions"><button type="button" class="btn" id="editAgendaDay6B5">Edit this day</button><button type="button" class="btn secondary" data-close-agenda-day>Close</button></div>`;
  $('#selectedDayDetail').innerHTML=`<b>${esc(day.subject||dateAtNoon(date).toLocaleDateString('en-US',{month:'long',day:'numeric'}))}</b><p>${items.length?items.map(item=>esc(item[2])).join(' · '):'Nothing scheduled.'}</p>`;
  all('[data-close-agenda-day]').forEach(button=>button.onclick=()=>d.close());
  $('#editAgendaDay6B5').onclick=()=>{d.close();fillEditor(date);$('#calDate').scrollIntoView({behavior:'smooth',block:'center'})};
  if(d.open)d.close();
  d.showModal();
}

function parseICS(text){
  const events=[];
  const blocks=text.replace(/\r?\n[ \t]/g,'').split('BEGIN:VEVENT').slice(1);
  for(const block of blocks){
    const rawDate=block.match(/DTSTART(?:;[^:]*)?:(\d{8})/)?.[1];
    if(!rawDate)continue;
    const date=`${rawDate.slice(0,4)}-${rawDate.slice(4,6)}-${rawDate.slice(6,8)}`;
    const summary=(block.match(/SUMMARY:(.*)/)?.[1]||'Imported event').replace(/\\([,;n\\])/g,(_,c)=>c==='n'?'\n':c);
    const description=(block.match(/DESCRIPTION:(.*)/)?.[1]||'').replace(/\\([,;n\\])/g,(_,c)=>c==='n'?'\n':c);
    events.push({date,summary,description});
  }
  return events;
}
function mergeImportedEvents(events){
  store.mutate(d=>{
    d.calendar=d.calendar||{};
    events.forEach(event=>{
      const old=d.calendar[event.date]||{},lines=splitLines(old.events);
      if(!lines.includes(event.summary))lines.push(event.summary);
      d.calendar[event.date]={...old,subject:old.subject||event.summary,events:lines.join('\n'),notes:[old.notes,event.description].filter(Boolean).join('\n')};
    });
  });
}
function importOptions(){
  const d=dialog('agendaImport6B5',`<dialog id="agendaImport6B5" class="agenda-dialog"><article class="card agenda-modal"><button type="button" class="icon-button reflection-close" data-close-import aria-label="Close">×</button><div class="eyebrow">Import calendar</div><h2>Choose what to import</h2><p class="muted">Nothing opens until you choose an option.</p>
    <div class="agenda-choice-grid"><button type="button" class="agenda-choice" id="chooseICS6B5"><span>📅</span><b>Calendar file</b><small>Import an .ics file from Files or iCloud Drive.</small></button>
    <button type="button" class="agenda-choice" id="chooseAgendaBackup6B5"><span>🔑</span><b>Agenda backup</b><small>Import a Key Collective calendar JSON file.</small></button>
    <button type="button" class="agenda-choice" id="chooseSample6B5"><span>✨</span><b>Sample calendar</b><small>Add three example entries to test Agenda.</small></button></div>
    <input id="icsFile6B5" hidden type="file" accept=".ics,text/calendar"><input id="agendaBackupFile6B5" hidden type="file" accept=".json,application/json"></article></dialog>`);
  all('[data-close-import]').forEach(button=>button.onclick=()=>d.close());
  $('#chooseICS6B5').onclick=()=>$('#icsFile6B5').click();
  $('#chooseAgendaBackup6B5').onclick=()=>$('#agendaBackupFile6B5').click();
  $('#chooseSample6B5').onclick=()=>{
    const today=new Date(),entries=[0,1,3].map((offset,index)=>{const date=new Date(today);date.setDate(today.getDate()+offset);return {date:localDateKey(date),summary:['Review today’s priorities','Family check-in','Plan next week'][index],description:'Sample Agenda entry'}});
    mergeImportedEvents(entries);d.close();renderCalendar();notify('Sample calendar added','Three sample entries are now visible.');
  };
  $('#icsFile6B5').onchange=async event=>{
    const file=event.target.files[0];if(!file)return;
    try{const events=parseICS(await file.text());if(!events.length)throw new Error('No calendar events were found.');mergeImportedEvents(events);d.close();renderCalendar();notify('Calendar imported',`${events.length} event${events.length===1?'':'s'} added.`)}
    catch(error){notify('Import failed',error.message)}finally{event.target.value=''}
  };
  $('#agendaBackupFile6B5').onchange=async event=>{
    const file=event.target.files[0];if(!file)return;
    try{
      const parsed=JSON.parse(await file.text()),calendar=parsed.calendar||parsed.data?.calendar;
      if(!calendar||typeof calendar!=='object')throw new Error('No Agenda calendar data was found.');
      store.mutate(draft=>{draft.calendar={...(draft.calendar||{}),...calendar}});
      d.close();renderCalendar();notify('Agenda backup imported',`${Object.keys(calendar).length} day${Object.keys(calendar).length===1?'':'s'} added.`);
    }catch(error){notify('Import failed',error.message)}finally{event.target.value=''}
  };
  d.showModal();
}
function exportOptions(){
  const d=dialog('agendaExport6B5',`<dialog id="agendaExport6B5" class="agenda-dialog"><article class="card agenda-modal"><button type="button" class="icon-button reflection-close" data-close-export aria-label="Close">×</button><div class="eyebrow">Export Agenda</div><h2>Choose a format</h2><div class="agenda-choice-grid"><button type="button" class="agenda-choice" id="exportICS6B5"><span>📅</span><b>Calendar file</b><small>Download an .ics file.</small></button><button type="button" class="agenda-choice" id="exportJSON6B5"><span>🔑</span><b>Agenda backup</b><small>Download calendar data as JSON.</small></button></div></article></dialog>`);
  all('[data-close-export]').forEach(button=>button.onclick=()=>d.close());
  const download=(name,text,type)=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([text],{type}));a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)};
  $('#exportJSON6B5').onclick=()=>{download(`key-collective-agenda-${localDateKey()}.json`,JSON.stringify({calendar:store.get().calendar},null,2),'application/json');d.close()};
  $('#exportICS6B5').onclick=()=>{
    const rows=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//The Key Collective OS//Sprint 6B.5//EN'];
    Object.entries(store.get().calendar||{}).forEach(([date,value])=>{
      const end=dateAtNoon(date);end.setDate(end.getDate()+1);
      const clean=x=>String(x||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/[,;]/g,m=>'\\'+m);
      rows.push('BEGIN:VEVENT',`UID:${date}-${Math.random().toString(16).slice(2)}@keycollective.local`,`DTSTART;VALUE=DATE:${date.replaceAll('-','')}`,`DTEND;VALUE=DATE:${localDateKey(end).replaceAll('-','')}`,`SUMMARY:${clean(value.subject||splitLines(value.events)[0]||'Key Collective Day')}`,`DESCRIPTION:${clean([value.events,value.tasks,value.birthdays,value.holidays,value.notes].filter(Boolean).join('\n'))}`,'END:VEVENT');
    });
    rows.push('END:VCALENDAR');download(`key-collective-agenda-${localDateKey()}.ics`,rows.join('\r\n'),'text/calendar');d.close();
  };
  d.showModal();
}

function enhanceAgenda(){
  cursor=new Date();renderCalendar();
  $('#prevMonth').onclick=()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1);renderCalendar()};
  $('#nextMonth').onclick=()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);renderCalendar()};
  const openFromEvent=event=>{const button=event.target.closest('[data-calendar-date]');if(button){event.preventDefault();event.stopPropagation();openDay(button.dataset.calendarDate)}};
  $('#calendarGrid').onclick=openFromEvent;
  $('#next7').onclick=openFromEvent;
  $('#agendaImportOpen').onclick=importOptions;
  $('#agendaExportOpen').onclick=exportOptions;
  $('#saveCalendarDay').onclick=()=>{
    const date=$('#calDate').value;if(!date)return notify('Choose a date first');
    store.mutate(d=>{d.calendar=d.calendar||{};d.calendar[date]={subject:$('#calSubject').value,events:$('#calEvents').value,tasks:$('#calTasks').value,birthdays:$('#calBirthdays').value,holidays:$('#calHolidays').value,notes:$('#calNotes').value}});
    renderCalendar();notify('Agenda day saved','Tap the date to open its frosted details.');
  };
  $('#clearCalendarEditor').onclick=()=>['calDate','calSubject','calEvents','calTasks','calBirthdays','calHolidays','calNotes'].forEach(id=>$('#'+id).value='');
}

function renderWater(){
  const count=Math.max(0,Math.min(8,Number(store.get().water||0)));
  if($('#waterMetric'))$('#waterMetric').textContent=`${count}/8`;
  if($('#waterCountPill'))$('#waterCountPill').textContent=`${count}/8 glasses`;
  if($('#waterBar'))$('#waterBar').style.width=`${count/8*100}%`;
  if($('#waterStatus'))$('#waterStatus').textContent=count>=8?'Hydration goal reached for today.':'Updated here—still inside Wellness Studio.';
}
function enhanceWellness(){
  const change=delta=>{
    store.mutate(d=>{d.water=Math.max(0,Math.min(8,Number(d.water||0)+delta))});
    renderWater();
  };
  $('#waterPlus').onclick=event=>{event.preventDefault();event.stopPropagation();change(1);notify('Water added','Wellness Studio stayed open.')};
  $('#waterMinus').onclick=event=>{event.preventDefault();event.stopPropagation();change(-1)};
  $('#waterReset').onclick=event=>{event.preventDefault();event.stopPropagation();store.set({water:0});renderWater();notify('Water reset')};
  renderWater();
}

function renderDashboardLocalAgenda(){
  const host=$('#dashboardAgenda');if(!host)return;
  const today=localDateKey(),endDate=new Date();endDate.setDate(endDate.getDate()+7);const end=localDateKey(endDate),state=store.get(),items=[];
  Object.entries(state.calendar||{}).forEach(([date,value])=>{if(date>=today&&date<=end)items.push({date,label:value.subject||splitLines(value.events)[0]||'Calendar item',type:'Calendar'})});
  (state.bills||[]).forEach(bill=>{if(bill.due>=today&&bill.due<=end)items.push({date:bill.due,label:`${bill.name} · $${Number(bill.amount||0).toFixed(2)}`,type:'Bill'})});
  items.sort((a,b)=>a.date.localeCompare(b.date)||a.label.localeCompare(b.label));
  host.innerHTML=items.length?items.map(item=>`<div class="agenda-item"><b>${esc(item.label)}</b><div class="mini">${item.date} · ${item.type}</div></div>`).join(''):'<p class="muted">Nothing scheduled in the next seven days.</p>';
}

function enforceAdaptiveText(){
  const theme=document.documentElement.dataset.theme||'champagne';
  const dark=['noir','sapphire','emerald','midnight'].includes(theme);
  document.documentElement.dataset.foregroundMode=dark?'light-on-dark':'dark-on-light';
}

function updateBuildBadge(){
  const badge=$('#kcBuildStatus');
  if(badge){const strong=badge.querySelector('b');if(strong)strong.textContent=BUILD}
}

export async function enhanceSprint6B5(id){
  enforceAdaptiveText();updateBuildBadge();
  if(id==='calendar')enhanceAgenda();
  if(id==='wellness')enhanceWellness();
  if(id==='dashboard')renderDashboardLocalAgenda();
}
