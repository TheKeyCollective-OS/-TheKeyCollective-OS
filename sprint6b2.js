
import {store} from './store.js';
import {getPhotos} from './photo-db.js';

const $=s=>document.querySelector(s);
const all=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;
const splitLines=v=>String(v||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const notify=(title,message='')=>{
  let host=$('#interactionNotices');
  if(!host){host=document.createElement('div');host.id='interactionNotices';host.className='lux-notifications';host.setAttribute('aria-live','polite');document.body.append(host)}
  const n=document.createElement('div');n.className='lux-notice success show';n.innerHTML=`<span class="notice-mark">✓</span><div><b>${esc(title)}</b><small>${esc(message)}</small></div>`;
  host.append(n);setTimeout(()=>{n.classList.remove('show');setTimeout(()=>n.remove(),250)},2600);
};
const dialog=(id,markup)=>{
  let d=$('#'+id);
  if(!d){document.body.insertAdjacentHTML('beforeend',markup);d=$('#'+id)}
  return d;
};

function goalsPage(){
  const x=store.get(),view=x.hardView||'grid',done=(x.goals||[]).filter(g=>Number(g.progress)>=100).length;
  return `<div class="pagehead"><div><div class="eyebrow">Your annual challenge</div><h1>25 Hard</h1><p class="sub">Twenty-five meaningful milestones—saved, visible, and celebrated.</p></div><span id="hardCount" class="pill">${done}/25 complete</span></div>
  <section class="card hard-command">
    <div class="section-title"><div><div class="eyebrow">Choose the life you are building</div><h3>Add a meaningful milestone</h3></div><span class="pill">Saved on this device</span></div>
    <div class="hard-create-grid">
      <label>Category<select id="hardGoalCategory"><option>Personal</option><option>Financial</option><option>Career</option><option>Wellness</option><option>Family</option><option>Adventure</option></select></label>
      <label class="hard-name-field">Milestone name<input id="hardGoalName" class="input" placeholder="Name a meaningful milestone"></label>
      <button id="addHardGoal" class="btn">Add milestone</button>
    </div>
    <div class="hard-toolbar"><div class="segmented" role="group" aria-label="Milestone view"><button type="button" data-hard-view="grid" class="${view==='grid'?'active':''}">Grid</button><button type="button" data-hard-view="list" class="${view==='list'?'active':''}">List</button></div><div class="hard-progress-summary"><span><i style="width:${done/25*100}%"></i></span><small>${25-done} milestones still becoming</small></div></div>
  </section>
  <section id="hardBoard" class="hard-board ${view==='list'?'list-view':'grid-view'}" aria-live="polite"></section>`;
}

function calendarPage(){
  return `<div class="pagehead agenda-head"><div><div class="eyebrow">Connected daily planner</div><h1>Agenda</h1><p class="sub">Events, tasks, birthdays, holidays, and bills—visible at a glance.</p></div>
  <div class="agenda-month-controls"><button class="btn ghost" id="prevMonth" aria-label="Previous month">←</button><span id="monthLabel" class="pill"></span><button class="btn ghost" id="nextMonth" aria-label="Next month">→</button></div></div>
  <section class="card agenda-actions-card"><div class="section-title"><div><div class="eyebrow">Calendar connections</div><h3>Bring your calendars together</h3></div><span class="pill">You choose the source</span></div>
    <div class="agenda-primary-actions"><button id="agendaImportOpen" class="btn">Import or connect</button><button id="agendaExportOpen" class="btn secondary">Export Agenda</button></div>
    <p class="muted">Import asks whether you want Google Calendar, Apple Calendar, or an .ics file. It will not open Files until you choose a file-based option.</p>
  </section>
  <article class="card"><div class="calendar-legend"><span><i class="dot event"></i>Event</span><span><i class="dot task"></i>Task</span><span><i class="dot birthday"></i>Birthday</span><span><i class="dot holiday"></i>Holiday</span><span><i class="dot bill"></i>Bill</span></div><div id="calendarGrid" class="calendar"></div></article>
  <div class="grid g2" style="margin-top:14px"><article class="card"><h3>Selected Day</h3><div id="selectedDayDetail" class="status">Tap any date to open its frosted quick view.</div></article><article class="card"><h3>Next 7 Days</h3><div id="next7"></div></article></div>
  <article class="card" style="margin-top:14px"><div class="section-title"><h3>Add or Edit Day</h3><span class="pill">One date · many layers</span></div>
    <input id="calDate" class="input" type="date"><input id="calSubject" class="input" placeholder="Day headline">
    <textarea id="calEvents" rows="3" placeholder="Events, one per line"></textarea><textarea id="calTasks" rows="3" placeholder="Tasks, one per line"></textarea>
    <textarea id="calBirthdays" rows="2" placeholder="Birthdays, one per line"></textarea><textarea id="calHolidays" rows="2" placeholder="Holidays or observances"></textarea>
    <textarea id="calNotes" rows="3" placeholder="Notes"></textarea><div class="row wrap"><button id="saveCalendarDay" class="btn">Save day</button><button id="clearCalendarEditor" class="btn ghost">Clear editor</button></div>
  </article>`;
}

export function patchPagesSprint6B2(pages){
  pages.goals=goalsPage;
  pages.calendar=calendarPage;
}

function renderHard(){
  const board=$('#hardBoard');if(!board)return;
  const st=store.get(),items=st.goals||[],view=st.hardView||'grid',done=items.filter(g=>Number(g.progress)>=100).length;
  board.className=`hard-board ${view==='list'?'list-view':'grid-view'}`;
  $('#hardCount').textContent=`${done}/25 complete`;
  const p=$('.hard-progress-summary i');if(p)p.style.width=`${done/25*100}%`;
  const s=$('.hard-progress-summary small');if(s)s.textContent=`${25-done} milestones still becoming`;
  board.innerHTML=Array.from({length:25},(_,i)=>{
    const g=items[i];
    if(!g)return `<article class="hard-tile empty"><div class="hard-index">${String(i+1).padStart(2,'0')}</div><button type="button" class="hard-empty-action" data-empty-hard><span>＋</span><b>Milestone waiting</b><small>Tap to add one.</small></button></article>`;
    const progress=Math.max(0,Math.min(100,Number(g.progress||0))),complete=progress===100;
    return `<article class="hard-tile ${complete?'complete gold-flipped':''}" data-goal-id="${esc(g.id||i)}"><div class="hard-index">${String(i+1).padStart(2,'0')}</div><div class="hard-tile-main"><div class="hard-tile-heading"><span class="pill">${esc(g.category||'Personal')}</span><h3>${esc(g.name)}</h3></div><div class="hard-inline-progress"><i style="width:${progress}%"></i></div><label class="hard-range-label"><span>Progress</span><strong>${progress}%</strong><input data-hard-progress="${i}" type="range" min="0" max="100" value="${progress}"></label><div class="hard-tile-actions"><button type="button" class="text-button" data-hard-complete="${i}">${complete?'Completed ✓':'Mark complete'}</button><button type="button" class="text-button" data-hard-remove="${i}">Remove</button></div></div></article>`;
  }).join('');
}
function enhanceGoals(){
  renderHard();
  $('#addHardGoal').onclick=()=>{
    const name=$('#hardGoalName').value.trim(),category=$('#hardGoalCategory').value;
    if(!name)return notify('Milestone needs a name','Enter the milestone before saving.');
    if((store.get().goals||[]).length>=25)return notify('Your 25 are already filled');
    store.mutate(d=>{d.goals=d.goals||[];d.goals.push({id:uid(),name,category,progress:0,createdAt:new Date().toISOString()})});
    $('#hardGoalName').value='';renderHard();notify('Milestone saved','It now appears in both grid and list views.');
  };
  all('[data-hard-view]').forEach(b=>b.onclick=()=>{
    store.set({hardView:b.dataset.hardView});all('[data-hard-view]').forEach(x=>x.classList.toggle('active',x===b));renderHard();
  });
  $('#hardBoard').onclick=e=>{
    const empty=e.target.closest('[data-empty-hard]');if(empty){$('#hardGoalName').scrollIntoView({behavior:'smooth',block:'center'});return $('#hardGoalName').focus()}
    const complete=e.target.closest('[data-hard-complete]');if(complete){const i=+complete.dataset.hardComplete;store.mutate(d=>d.goals[i].progress=100);renderHard();const tile=$('#hardBoard').children[i];tile?.classList.add('just-completed');return notify('Milestone completed','Your achievement turned gold.')}
    const remove=e.target.closest('[data-hard-remove]');if(remove){store.mutate(d=>d.goals.splice(+remove.dataset.hardRemove,1));renderHard();notify('Milestone removed')}
  };
  $('#hardBoard').oninput=e=>{
    const r=e.target.closest('[data-hard-progress]');if(!r)return;
    const i=+r.dataset.hardProgress;store.mutate(d=>d.goals[i].progress=+r.value);renderHard();
  };
}

let calendarCursor=new Date();
function dateKey(y,m,d){return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
function itemsFor(date){
  const st=store.get(),v=st.calendar?.[date]||{},out=[];
  splitLines(v.events).forEach(t=>out.push(['event','Event',t]));splitLines(v.tasks).forEach(t=>out.push(['task','Task',t]));
  splitLines(v.birthdays).forEach(t=>out.push(['birthday','Birthday',t]));splitLines(v.holidays).forEach(t=>out.push(['holiday','Holiday',t]));
  (st.bills||[]).filter(b=>b.due===date).forEach(b=>out.push(['bill','Bill',`${b.name} · $${Number(b.amount||0).toFixed(2)}`]));
  if(v.notes)out.push(['note','Notes',v.notes]);return out;
}
function fillEditor(date){
  const v=store.get().calendar?.[date]||{};$('#calDate').value=date;
  [['calSubject','subject'],['calEvents','events'],['calTasks','tasks'],['calBirthdays','birthdays'],['calHolidays','holidays'],['calNotes','notes']].forEach(([id,k])=>$('#'+id).value=v[k]||'');
}
function renderCalendar(){
  const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth(),first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),start=first.getDay();
  $('#monthLabel').textContent=first.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const cells=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<div class="calendar-weekday">${x}</div>`);
  for(let i=0;i<start;i++)cells.push('<div class="calendar-blank"></div>');
  for(let d=1;d<=days;d++){
    const key=dateKey(y,m,d),items=itemsFor(key),types=[...new Set(items.map(x=>x[0]))],today=key===new Date().toISOString().slice(0,10);
    cells.push(`<button type="button" class="calendar-day ${today?'today':''}" data-calendar-date="${key}" aria-label="${first.toLocaleDateString('en-US',{month:'long'})} ${d}, ${y}"><b>${d}</b><span class="calendar-dots">${types.slice(0,5).map(t=>`<i class="dot ${t}"></i>`).join('')}</span></button>`);
  }
  $('#calendarGrid').innerHTML=cells.join('');
  const today=new Date(),end=new Date();end.setDate(today.getDate()+7),st=store.get();
  const upcoming=Object.entries(st.calendar||{}).filter(([d])=>d>=today.toISOString().slice(0,10)&&d<=end.toISOString().slice(0,10)).sort(([a],[b])=>a.localeCompare(b));
  $('#next7').innerHTML=upcoming.length?upcoming.map(([d,v])=>`<button type="button" class="brief-line agenda-upcoming" data-calendar-date="${d}"><span>📅</span><div><b>${esc(v.subject||splitLines(v.events)[0]||'Planned day')}</b><small>${new Date(d+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</small></div></button>`).join(''):'<div class="status">Nothing scheduled in the next seven days.</div>';
}
function dayDialog(date){
  const items=itemsFor(date),v=store.get().calendar?.[date]||{};
  const d=dialog('agendaDayDialog',`<dialog id="agendaDayDialog" class="agenda-dialog"><article class="card agenda-modal interaction-day-modal"><button type="button" class="icon-button reflection-close" data-close-day>×</button><div id="interactionDayContent"></div></article></dialog>`);
  $('#interactionDayContent').innerHTML=`<div class="eyebrow">Day quick view</div><h2>${new Date(date+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</h2><p class="muted">${items.length?`${items.length} connected item${items.length===1?'':'s'}`:'Nothing scheduled yet.'}</p><div class="agenda-quick-list">${items.map(([type,label,text])=>`<div class="agenda-quick-item ${type}"><span class="agenda-dot ${type}"></span><div><small>${label}</small><b>${esc(text)}</b></div></div>`).join('')||'<div class="status">This day is open and ready.</div>'}</div><div class="row modal-actions"><button type="button" class="btn" id="editQuickDay">Edit this day</button><button type="button" class="btn secondary" id="closeQuickDay">Close</button></div>`;
  d.dataset.date=date;d.showModal();$('#selectedDayDetail').innerHTML=`<b>${esc(v.subject||'Selected day')}</b><p>${items.length?items.map(x=>esc(x[2])).join(' · '):'Nothing scheduled.'}</p>`;
  $('#editQuickDay').onclick=()=>{d.close();fillEditor(date);$('#calDate').scrollIntoView({behavior:'smooth',block:'center'})};
  $('#closeQuickDay').onclick=()=>d.close();
}
function icsText(){
  const rows=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//The Key Collective OS//Sprint 6B.2//EN'];
  Object.entries(store.get().calendar||{}).forEach(([date,v])=>{
    const end=new Date(date+'T12:00:00');end.setDate(end.getDate()+1);
    const clean=x=>String(x||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/[,;]/g,m=>'\\'+m);
    rows.push('BEGIN:VEVENT',`UID:${date}-${uid()}@keycollective.local`,`DTSTART;VALUE=DATE:${date.replaceAll('-','')}`,`DTEND;VALUE=DATE:${end.toISOString().slice(0,10).replaceAll('-','')}`,`SUMMARY:${clean(v.subject||splitLines(v.events)[0]||'Key Collective Day')}`,`DESCRIPTION:${clean([v.events,v.tasks,v.birthdays,v.holidays,v.notes].filter(Boolean).join('\n'))}`,'END:VEVENT');
  });rows.push('END:VCALENDAR');return rows.join('\r\n');
}
function downloadICS(name){
  const a=document.createElement('a'),url=URL.createObjectURL(new Blob([icsText()],{type:'text/calendar'}));a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function parseICS(text){
  return text.replace(/\r?\n[ \t]/g,'').split('BEGIN:VEVENT').slice(1).map(x=>x.split('END:VEVENT')[0]).map(block=>{
    const read=k=>block.match(new RegExp('(?:^|\\r?\\n)'+k+'(?:;[^:]*)?:(.*)','i'))?.[1]?.trim()||'';
    const raw=read('DTSTART').match(/\d{8}/)?.[0];if(!raw)return null;
    const clean=x=>x.replace(/\\n/g,'\n').replace(/\\([,;\\])/g,'$1');
    return {date:`${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`,summary:clean(read('SUMMARY')||'Imported event'),description:clean(read('DESCRIPTION'))};
  }).filter(Boolean);
}
function connectionDialog(mode){
  const d=dialog('calendarConnectionDialog',`<dialog id="calendarConnectionDialog" class="agenda-dialog"><article class="card agenda-modal provider-choice-modal"><button type="button" class="icon-button reflection-close" data-close-connection>×</button><div class="eyebrow">Calendar connections</div><h2 id="connectionTitle"></h2><p class="muted" id="connectionIntro"></p><div id="connectionChoices" class="provider-choice-grid"></div><div id="connectionDetail"></div><input id="interactionICSFile" type="file" accept=".ics,text/calendar" hidden></article></dialog>`);
  $('#connectionTitle').textContent=mode==='import'?'How would you like to import?':'Where will you use this calendar?';
  $('#connectionIntro').textContent=mode==='import'?'Choose a source first. Files opens only after you choose a file-based import.':'Choose a destination and the OS will prepare the correct handoff.';
  const choices=mode==='import'
    ?[['google','G','Google Calendar','Authorize or import Google’s .ics export'],['apple','●','Apple Calendar','Import an .ics file exported from Apple Calendar'],['file','ICS','Calendar file','Choose a standard .ics file from Files']]
    :[['google','G','Google Calendar','Add one day or export the full Agenda'],['apple','●','Apple Calendar','Download a file that Apple Calendar can add'],['file','ICS','Calendar file','Download the complete Agenda']];
  $('#connectionChoices').innerHTML=choices.map(([id,mark,title,copy])=>`<button type="button" class="provider-choice" data-connect-choice="${id}"><span class="provider-logo ${id}">${mark}</span><div><b>${title}</b><small>${copy}</small></div><span>›</span></button>`).join('');
  d.dataset.mode=mode;$('#connectionDetail').innerHTML='';d.showModal();
}
function connectionDetail(provider){
  const mode=$('#calendarConnectionDialog').dataset.mode,detail=$('#connectionDetail');
  if(mode==='import'){
    if(provider==='google')detail.innerHTML=`<div class="connection-panel"><h3>Google Calendar</h3><p>A live account import requires your Google OAuth client ID and authorized GitHub Pages origin. Until configured, export an .ics file from Google and import it here.</p><a class="btn secondary" target="_blank" rel="noopener" href="https://calendar.google.com/calendar/u/0/r/settings/export">Open Google export settings</a><button type="button" class="btn" data-pick-ics>Choose Google .ics file</button></div>`;
    else if(provider==='apple')detail.innerHTML=`<div class="connection-panel"><h3>Apple Calendar</h3><p>Apple does not offer browser calendar authorization to a static website. Export an .ics file from Apple Calendar or iCloud, then choose it here.</p><button type="button" class="btn" data-pick-ics>Choose Apple .ics file</button></div>`;
    else detail.innerHTML=`<div class="connection-panel"><h3>Calendar file</h3><p>Select an .ics file. Its events will be merged into Agenda and saved locally.</p><button type="button" class="btn" data-pick-ics>Choose .ics file</button></div>`;
  }else{
    if(provider==='google')detail.innerHTML=`<div class="connection-panel"><h3>Google Calendar</h3><button type="button" class="btn" id="exportGoogleAgenda">Export full Agenda</button><a class="btn ghost" target="_blank" rel="noopener" href="https://calendar.google.com/calendar/u/0/r">Open Google Calendar</a></div>`;
    else if(provider==='apple')detail.innerHTML=`<div class="connection-panel"><h3>Apple Calendar</h3><button type="button" class="btn" id="exportAppleAgenda">Download for Apple Calendar</button></div>`;
    else detail.innerHTML=`<div class="connection-panel"><h3>Calendar file</h3><button type="button" class="btn" id="exportGeneralAgenda">Download .ics</button></div>`;
  }
  all('[data-pick-ics]').forEach(b=>b.onclick=()=>$('#interactionICSFile').click());
  $('#exportGoogleAgenda')?.addEventListener('click',()=>{downloadICS('the-key-collective-google.ics');notify('Google calendar file created')});
  $('#exportAppleAgenda')?.addEventListener('click',()=>{downloadICS('the-key-collective-apple.ics');notify('Apple calendar file created')});
  $('#exportGeneralAgenda')?.addEventListener('click',()=>{downloadICS('the-key-collective-agenda.ics');notify('Calendar file created')});
}
function enhanceCalendar(){
  calendarCursor=new Date();renderCalendar();
  $('#prevMonth').onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()-1,1);renderCalendar()};
  $('#nextMonth').onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+1,1);renderCalendar()};
  $('#calendarGrid').onclick=e=>{const b=e.target.closest('[data-calendar-date]');if(b)dayDialog(b.dataset.calendarDate)};
  $('#next7').onclick=e=>{const b=e.target.closest('[data-calendar-date]');if(b)dayDialog(b.dataset.calendarDate)};
  $('#agendaImportOpen').onclick=()=>connectionDialog('import');$('#agendaExportOpen').onclick=()=>connectionDialog('export');
  $('#saveCalendarDay').onclick=()=>{const date=$('#calDate').value;if(!date)return notify('Choose a date first');store.mutate(d=>{d.calendar=d.calendar||{};d.calendar[date]={subject:$('#calSubject').value,events:$('#calEvents').value,tasks:$('#calTasks').value,birthdays:$('#calBirthdays').value,holidays:$('#calHolidays').value,notes:$('#calNotes').value}});renderCalendar();notify('Agenda day saved','The day is available from the calendar and dashboard.')};
  $('#clearCalendarEditor').onclick=()=>{['calDate','calSubject','calEvents','calTasks','calBirthdays','calHolidays','calNotes'].forEach(id=>$('#'+id).value='')};
  document.addEventListener('click',e=>{if(e.target.closest('[data-close-day]'))$('#agendaDayDialog')?.close();if(e.target.closest('[data-close-connection]'))$('#calendarConnectionDialog')?.close();const c=e.target.closest('[data-connect-choice]');if(c)connectionDetail(c.dataset.connectChoice)},{once:false});
  document.addEventListener('change',async e=>{
    if(e.target.id!=='interactionICSFile'||!e.target.files[0])return;
    try{const events=parseICS(await e.target.files[0].text());if(!events.length)throw new Error('No events found');
      store.mutate(d=>{d.calendar=d.calendar||{};events.forEach(v=>{const old=d.calendar[v.date]||{},lines=splitLines(old.events);if(!lines.includes(v.summary))lines.push(v.summary);d.calendar[v.date]={...old,subject:old.subject||v.summary,events:lines.join('\n'),notes:[old.notes,v.description].filter(Boolean).join('\n')}})});
      $('#calendarConnectionDialog')?.close();renderCalendar();notify('Calendar imported',`${events.length} event${events.length===1?'':'s'} added.`);
    }catch(err){notify('Import could not be completed',err.message)}finally{e.target.value=''}
  });
}

function enhanceMorningBrief(){
  const card=all('.card').find(c=>c.querySelector('h3')?.textContent.trim()==='Top Three');if(!card)return;
  const button=card.querySelector('.section-title button');if(!button)return;
  button.removeAttribute('data-jump');button.textContent='Edit';button.id='editBriefTopThree';
  button.onclick=()=>{
    const d=dialog('briefTopThreeDialog',`<dialog id="briefTopThreeDialog" class="priority-dialog"><div class="priority-dialog-shell"><button type="button" class="icon-button reflection-close" data-close-brief>×</button><div class="eyebrow">Morning Brief</div><h2>Edit today’s Top Three</h2><div id="briefThreeFields"></div><div class="row modal-actions"><button type="button" class="btn secondary" data-close-brief>Cancel</button><button type="button" class="btn" id="saveBriefThree">Save priorities</button></div></div></dialog>`);
    $('#briefThreeFields').innerHTML=(store.get().top3||['','','']).map((v,i)=>`<label>Priority ${i+1}<input class="input" data-brief-three="${i}" value="${esc(v)}" placeholder="Choose priority ${i+1}"></label>`).join('');
    d.showModal();
    all('[data-close-brief]').forEach(x=>x.onclick=()=>d.close());
    $('#saveBriefThree').onclick=()=>{const values=all('[data-brief-three]').map(x=>x.value.trim());store.set({top3:values});card.querySelectorAll('.brief-line b').forEach((b,i)=>b.textContent=values[i]||`Priority ${i+1} not chosen`);d.close();notify('Top Three updated','No redirect—your Morning Brief stayed open.')};
  };
}

function externalHandoff(){
  if(document.body.dataset.handoffReady)return;document.body.dataset.handoffReady='true';
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[target="_blank"],a[href^="myfitnesspal:"],a[href^="webcal:"]');if(!a||a.dataset.directExternal==='true')return;
    e.preventDefault();
    const d=dialog('externalHandoffDialog',`<dialog id="externalHandoffDialog" class="agenda-dialog"><article class="card agenda-modal"><button type="button" class="icon-button reflection-close" data-close-external>×</button><div class="eyebrow">External service</div><h2 id="externalHandoffTitle">Leave The Key Collective?</h2><p id="externalHandoffCopy"></p><div class="row modal-actions"><button type="button" class="btn secondary" data-close-external>Stay here</button><button type="button" class="btn" id="continueExternal">Continue</button></div></article></dialog>`);
    const label=a.textContent.trim()||'external service';$('#externalHandoffCopy').textContent=`This opens ${label} outside The Key Collective OS. Your saved OS data will remain here.`;
    d.showModal();all('[data-close-external]').forEach(x=>x.onclick=()=>d.close());$('#continueExternal').onclick=()=>{d.close();if(a.href.startsWith('http'))window.open(a.href,'_blank','noopener');else location.href=a.href};
  });
}

async function reinforceLaniDashboard(router){
  const box=$('#dashboardLani');if(!box)return;
  try{
    const photos=await getPhotos();if(!photos.length)return;
    let i=0;const urls=photos.map(p=>URL.createObjectURL(p.blob));
    box.innerHTML=`<div class="dashboard-lani-carousel interaction-lani"><button type="button" class="dashboard-photo-stage">${urls.map((u,n)=>`<img class="${n===0?'active':''}" src="${u}" alt="Lani memory ${n+1}">`).join('')}</button><button type="button" class="lani-arrow prev" aria-label="Previous photo">‹</button><button type="button" class="lani-arrow next" aria-label="Next photo">›</button></div>`;
    const show=n=>{const imgs=all('#dashboardLani img');imgs[i]?.classList.remove('active');i=(n+imgs.length)%imgs.length;imgs[i]?.classList.add('active')};
    box.querySelector('.prev').onclick=e=>{e.stopPropagation();show(i-1)};box.querySelector('.next').onclick=e=>{e.stopPropagation();show(i+1)};box.querySelector('.dashboard-photo-stage').onclick=()=>router.go('lani');
    if(photos.length>1)window.__kcLaniTimer=setInterval(()=>show(i+1),5000);
  }catch{}
}

function themeContrast(){
  const theme=document.documentElement.dataset.theme||'champagne';
  document.documentElement.dataset.interactionContrast=['noir','sapphire','emerald'].includes(theme)?'dark':'light';
}

export async function enhanceSprint6B2(id,router){
  themeContrast();externalHandoff();
  if(id==='goals')enhanceGoals();
  if(id==='calendar')enhanceCalendar();
  if(id==='intelligence')enhanceMorningBrief();
  if(id==='dashboard'){clearInterval(window.__kcLaniTimer);await reinforceLaniDashboard(router)}
}
