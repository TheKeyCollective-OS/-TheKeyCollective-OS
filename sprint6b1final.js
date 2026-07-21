
import {store} from './store.js';
import {getPhotos} from './photo-db.js';

const $=s=>document.querySelector(s);
const all=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;
const toast=(title,message='')=>{
  let host=$('#luxNotifications');
  if(!host){host=document.createElement('div');host.id='luxNotifications';host.className='lux-notifications';host.setAttribute('aria-live','polite');document.body.append(host)}
  const n=document.createElement('div');n.className='lux-notice success';
  n.innerHTML=`<span class="notice-mark">✓</span><div><b>${esc(title)}</b><small>${esc(message)}</small></div>`;
  host.append(n);requestAnimationFrame(()=>n.classList.add('show'));
  setTimeout(()=>{n.classList.remove('show');setTimeout(()=>n.remove(),240)},2600);
};
const lines=v=>String(v||'').split(/\r?\n+/).map(x=>x.trim()).filter(Boolean);

function ensureDialog(id,html){
  let d=$('#'+id);
  if(!d){document.body.insertAdjacentHTML('beforeend',html);d=$('#'+id)}
  return d;
}

/* ---------- Calendar: honest provider choice + functional ICS ---------- */
function escapeICS(v){return String(v||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;')}
function nextDate(date){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+1);return d.toISOString().slice(0,10)}
function makeICS(){
  const st=store.get(), out=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//The Key Collective OS//Sprint 6B.1 Final//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
  Object.entries(st.calendar||{}).sort(([a],[b])=>a.localeCompare(b)).forEach(([date,v])=>{
    const summary=v.subject||lines(v.events)[0]||lines(v.tasks)[0]||'Key Collective Day';
    const description=[v.events,v.tasks,v.birthdays,v.holidays,v.notes].filter(Boolean).join('\n');
    out.push('BEGIN:VEVENT',`UID:${date}-${uid()}@thekeycollective.local`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART;VALUE=DATE:${date.replaceAll('-','')}`,`DTEND;VALUE=DATE:${nextDate(date).replaceAll('-','')}`,`SUMMARY:${escapeICS(summary)}`,`DESCRIPTION:${escapeICS(description)}`,'END:VEVENT');
  });
  out.push('END:VCALENDAR'); return out.join('\r\n');
}
function downloadICS(name='the-key-collective-agenda.ics'){
  const a=document.createElement('a'),url=URL.createObjectURL(new Blob([makeICS()],{type:'text/calendar;charset=utf-8'}));
  a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  toast('Calendar export created','The .ics file is ready for Google Calendar or Apple Calendar.');
}
function unfoldICS(text){return text.replace(/\r?\n[ \t]/g,'')}
function parseICS(text){
  const blocks=unfoldICS(text).split('BEGIN:VEVENT').slice(1).map(x=>x.split('END:VEVENT')[0]), events=[];
  for(const b of blocks){
    const get=k=>{const m=b.match(new RegExp('(?:^|\\r?\\n)'+k+'(?:;[^:]*)?:(.*)','i'));return m?.[1]?.trim()||''};
    const raw=get('DTSTART'), date=(raw.match(/\d{8}/)||[])[0];
    if(!date)continue;
    const iso=`${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`;
    const clean=v=>v.replace(/\\n/g,'\n').replace(/\\([,;\\])/g,'$1');
    events.push({date:iso,summary:clean(get('SUMMARY')||'Imported calendar event'),description:clean(get('DESCRIPTION'))});
  }
  return events;
}
async function importICSFile(file){
  const text=await file.text(),events=parseICS(text);
  if(!events.length)throw new Error('No calendar events were found in that .ics file.');
  store.mutate(d=>{
    d.calendar=d.calendar||{};
    for(const e of events){
      const old=d.calendar[e.date]||{};
      const existing=lines(old.events);
      if(!existing.includes(e.summary))existing.push(e.summary);
      d.calendar[e.date]={...old,subject:old.subject||e.summary,events:existing.join('\n'),notes:[old.notes,e.description].filter(Boolean).join('\n')};
    }
    d.calendarConnections={...(d.calendarConnections||{}),file:{connected:true,lastSync:new Date().toISOString(),count:events.length}};
  });
  toast('Calendar imported',`${events.length} event${events.length===1?'':'s'} added to Agenda.`);
  return events.length;
}
function selectedDayGoogleURL(){
  const date=$('#calDate')?.value||new Date().toISOString().slice(0,10),v=store.get().calendar?.[date]||{};
  const u=new URL('https://calendar.google.com/calendar/render');u.searchParams.set('action','TEMPLATE');
  u.searchParams.set('text',v.subject||lines(v.events)[0]||'Key Collective Day');
  u.searchParams.set('dates',`${date.replaceAll('-','')}/${nextDate(date).replaceAll('-','')}`);
  u.searchParams.set('details',[v.events,v.tasks,v.birthdays,v.holidays,v.notes].filter(Boolean).join('\n')||'Planned in The Key Collective OS');
  return u.toString();
}
function connectionState(provider){
  return store.get().calendarConnections?.[provider]||{};
}
function drawConnectionStatuses(){
  const g=connectionState('google'),a=connectionState('apple'),f=connectionState('file');
  all('[data-provider-status="google"]').forEach(x=>x.textContent=g.connected?'Configured':'Not connected');
  all('[data-provider-status="apple"]').forEach(x=>x.textContent=a.lastUsed?'Export used':'File bridge ready');
  all('[data-provider-status="file"]').forEach(x=>x.textContent=f.lastSync?`${f.count||0} imported`:'Ready');
}
function openProviderDialog(mode='import'){
  const d=ensureDialog('calendarProviderDialog',`<dialog id="calendarProviderDialog" class="agenda-dialog"><article class="card agenda-modal provider-choice-modal"><button class="icon-button reflection-close" data-close-provider aria-label="Close">×</button><div class="eyebrow">Connected calendars</div><h2 id="providerDialogTitle">Choose a calendar source</h2><p class="muted" id="providerDialogCopy"></p><div class="provider-choice-grid">
    <button class="provider-choice" data-calendar-provider="google"><span class="provider-logo google">G</span><div><b>Google Calendar</b><small data-provider-status="google">Not connected</small></div><span>›</span></button>
    <button class="provider-choice" data-calendar-provider="apple"><span class="provider-logo apple">●</span><div><b>Apple Calendar</b><small data-provider-status="apple">File bridge ready</small></div><span>›</span></button>
    <button class="provider-choice" data-calendar-provider="file"><span class="provider-logo file">ICS</span><div><b>Calendar file</b><small data-provider-status="file">Ready</small></div><span>›</span></button>
  </div><div id="providerDetail" class="provider-detail"></div><input id="providerICSFile" type="file" accept=".ics,text/calendar" hidden></article></dialog>`);
  d.dataset.mode=mode;$('#providerDialogTitle').textContent=mode==='import'?'Import a calendar':'Export your Agenda';
  $('#providerDialogCopy').textContent=mode==='import'?'Choose Google, Apple, or a calendar file. The Files picker opens only when you choose a file-based option.':'Choose where you want to send a standards-compatible calendar export.';
  drawConnectionStatuses();d.showModal();
}
function providerDetail(provider,mode){
  const detail=$('#providerDetail'),clientId=(window.KEY_COLLECTIVE_CONFIG?.googleCalendarClientId||'').trim();
  if(provider==='google'){
    detail.innerHTML=mode==='import'
      ?`<div class="connection-panel"><h3>Google Calendar</h3>${clientId?'<p>Authorize Google Calendar access, then choose which calendar to import.</p><button class="btn" id="googleAuthorize">Continue with Google</button>':'<div class="status warning"><b>Deployment setup required</b><p>Add a Google OAuth client ID to <code>config.js</code> and authorize your GitHub Pages domain. Until then, use Google’s .ics export below.</p></div><a class="btn secondary" target="_blank" rel="noopener" href="https://calendar.google.com/calendar/u/0/r/settings/export">Open Google export settings</a><button class="btn ghost" id="googleImportFile">Import downloaded .ics</button>'}</div>`
      :`<div class="connection-panel"><h3>Google Calendar</h3><p>Add the selected Agenda day directly to Google, or export the entire Agenda as an .ics file.</p><button class="btn" id="googleSelectedDay">Add selected day</button><button class="btn secondary" id="googleFullExport">Export full Agenda</button><a class="btn ghost" target="_blank" rel="noopener" href="https://calendar.google.com/calendar/u/0/r">Open Google Calendar</a></div>`;
  }else if(provider==='apple'){
    detail.innerHTML=mode==='import'
      ?`<div class="connection-panel"><h3>Apple Calendar</h3><div class="status"><b>Apple web authorization is not available</b><p>A GitHub Pages website cannot request direct Apple Calendar access. Export an .ics file from Calendar/iCloud, then choose it here.</p></div><button class="btn" id="appleImportFile">Choose Apple .ics file</button><a class="btn ghost" href="webcal://">Open Calendar app</a></div>`
      :`<div class="connection-panel"><h3>Apple Calendar</h3><p>Download the full Agenda, then open the file on iPhone, iPad, or Mac and choose Add All.</p><button class="btn" id="appleFullExport">Download for Apple Calendar</button><a class="btn ghost" href="webcal://">Open Calendar app</a></div>`;
  }else{
    detail.innerHTML=mode==='import'
      ?`<div class="connection-panel"><h3>Import .ics file</h3><p>Select a standard calendar file from Files. Events are merged into Agenda and preserved locally.</p><button class="btn" id="chooseICS">Choose file</button></div>`
      :`<div class="connection-panel"><h3>Export .ics file</h3><p>Create one portable calendar file containing every saved Agenda day.</p><button class="btn" id="downloadICS">Download .ics</button></div>`;
  }
  $('#googleSelectedDay')?.addEventListener('click',()=>{window.open(selectedDayGoogleURL(),'_blank','noopener');store.mutate(d=>d.calendarConnections={...(d.calendarConnections||{}),google:{...d.calendarConnections?.google,lastUsed:new Date().toISOString()}});toast('Google Calendar opened','Review the event and choose Save.');});
  $('#googleFullExport')?.addEventListener('click',()=>downloadICS('the-key-collective-google-calendar.ics'));
  $('#appleFullExport')?.addEventListener('click',()=>{downloadICS('the-key-collective-apple-calendar.ics');store.mutate(d=>d.calendarConnections={...(d.calendarConnections||{}),apple:{lastUsed:new Date().toISOString(),mode:'ics'}})});
  $('#downloadICS')?.addEventListener('click',()=>downloadICS());
  ['googleImportFile','appleImportFile','chooseICS'].forEach(id=>$('#'+id)?.addEventListener('click',()=>$('#providerICSFile').click()));
  $('#googleAuthorize')?.addEventListener('click',()=>startGoogleOAuth(clientId));
}
async function startGoogleOAuth(clientId){
  if(!clientId)return;
  try{
    if(!window.google?.accounts?.oauth2){
      await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.onload=resolve;s.onerror=reject;document.head.append(s)});
    }
    const tokenClient=google.accounts.oauth2.initTokenClient({client_id:clientId,scope:'https://www.googleapis.com/auth/calendar.readonly',callback:async r=>{
      if(r.error)return toast('Google authorization stopped',r.error);
      const calendars=await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList',{headers:{Authorization:`Bearer ${r.access_token}`}}).then(x=>x.json());
      const choices=(calendars.items||[]).map(c=>`<label class="calendar-choice"><input type="radio" name="googleCal" value="${esc(c.id)}" ${c.primary?'checked':''}><span><b>${esc(c.summary)}</b><small>${c.primary?'Primary calendar':'Google calendar'}</small></span></label>`).join('');
      $('#providerDetail').innerHTML=`<div class="connection-panel"><h3>Choose a Google calendar</h3>${choices||'<div class="status">No calendars were returned.</div>'}<button class="btn" id="importGoogleCalendar">Import selected calendar</button></div>`;
      $('#importGoogleCalendar').onclick=async()=>{
        const id=document.querySelector('input[name="googleCal"]:checked')?.value;if(!id)return;
        const timeMin=new Date();timeMin.setMonth(timeMin.getMonth()-6);const timeMax=new Date();timeMax.setFullYear(timeMax.getFullYear()+2);
        const u=new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(id)}/events`);u.searchParams.set('singleEvents','true');u.searchParams.set('maxResults','2500');u.searchParams.set('timeMin',timeMin.toISOString());u.searchParams.set('timeMax',timeMax.toISOString());
        const data=await fetch(u,{headers:{Authorization:`Bearer ${r.access_token}`}}).then(x=>x.json());
        const imported=(data.items||[]).map(e=>({date:(e.start?.date||e.start?.dateTime||'').slice(0,10),summary:e.summary||'Google Calendar event',description:e.description||''})).filter(e=>e.date);
        store.mutate(d=>{for(const e of imported){const old=d.calendar[e.date]||{},arr=lines(old.events);if(!arr.includes(e.summary))arr.push(e.summary);d.calendar[e.date]={...old,subject:old.subject||e.summary,events:arr.join('\n'),notes:[old.notes,e.description].filter(Boolean).join('\n')}};d.calendarConnections={...(d.calendarConnections||{}),google:{connected:true,lastSync:new Date().toISOString(),calendarId:id,count:imported.length}}});
        toast('Google Calendar imported',`${imported.length} events added to Agenda.`);$('#calendarProviderDialog').close();
      };
    }});
    tokenClient.requestAccessToken({prompt:'consent'});
  }catch(e){toast('Google connection unavailable','Check the OAuth client ID and authorized GitHub Pages origin.')}
}
function dayItems(date){
  const st=store.get(),v=st.calendar?.[date]||{},out=[];
  lines(v.events).forEach(t=>out.push(['event','Event',t]));lines(v.tasks).forEach(t=>out.push(['task','Task',t]));
  lines(v.birthdays).forEach(t=>out.push(['birthday','Birthday',t]));lines(v.holidays).forEach(t=>out.push(['holiday','Holiday',t]));
  (st.bills||[]).filter(b=>b.due===date).forEach(b=>out.push(['bill','Bill',`${b.name} · $${Number(b.amount||0).toFixed(2)}`]));
  if(v.notes)out.push(['note','Notes',v.notes]);return out;
}
function openDayQuickView(date){
  const d=ensureDialog('agendaQuickViewFinal',`<dialog id="agendaQuickViewFinal" class="agenda-dialog"><article class="card agenda-modal"><button class="icon-button reflection-close" data-close-day aria-label="Close">×</button><div id="agendaQuickFinalContent"></div></article></dialog>`);
  const items=dayItems(date),v=store.get().calendar?.[date]||{};
  $('#agendaQuickFinalContent').innerHTML=`<div class="eyebrow">Day quick view</div><h2>${new Date(date+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</h2><p class="muted">${items.length?`${items.length} connected item${items.length===1?'':'s'}.`:'Nothing is scheduled yet.'}</p><div class="agenda-quick-list">${items.map(([type,label,text])=>`<button class="agenda-quick-item ${type}" data-edit-date="${date}"><span class="agenda-dot ${type}"></span><div><small>${label}</small><b>${esc(text)}</b></div></button>`).join('')||'<div class="status">Add an event, task, birthday, holiday, bill, or note below.</div>'}</div><div class="row modal-actions"><button class="btn" data-edit-date="${date}">Edit this day</button><button class="btn secondary" id="quickAddGoogle">Add to Google</button></div>`;
  $('#quickAddGoogle').onclick=()=>window.open(selectedDayGoogleURL(),'_blank','noopener');d.showModal();
}
function calendarEnhance(){
  const importInput=$('#icsImport'),exportBtn=$('#icsExport');
  if(importInput){const label=importInput.closest('label');if(label){label.removeAttribute('for');label.onclick=e=>{e.preventDefault();openProviderDialog('import')}}}
  if(exportBtn)exportBtn.onclick=()=>openProviderDialog('export');
  const old=$('#calendarConnectionPanel');old?.remove();
  exportBtn?.closest('.row')?.insertAdjacentHTML('afterend',`<section id="calendarConnectionPanel" class="calendar-bridge"><div class="section-title"><div><div class="eyebrow">Connected accounts</div><h3>Calendar connections</h3></div><button class="btn ghost" id="manageCalendars">Manage</button></div><div class="connection-summary"><div><span class="provider-logo google">G</span><b>Google</b><small data-provider-status="google">Not connected</small></div><div><span class="provider-logo apple">●</span><b>Apple</b><small data-provider-status="apple">File bridge ready</small></div><div><span class="provider-logo file">ICS</span><b>Calendar file</b><small data-provider-status="file">Ready</small></div></div><p class="muted">Google account import becomes available after your OAuth client ID is configured. Apple Calendar uses honest .ics import/export because browser-based Apple calendar authorization is unavailable.</p></section>`);
  $('#manageCalendars')?.addEventListener('click',()=>openProviderDialog('import'));drawConnectionStatuses();
  document.addEventListener('click',e=>{
    const day=e.target.closest('#calendarGrid [data-day]');if(day){setTimeout(()=>openDayQuickView(day.dataset.day),0)}
    if(e.target.closest('[data-close-day]'))$('#agendaQuickViewFinal')?.close();
    if(e.target.closest('[data-close-provider]'))$('#calendarProviderDialog')?.close();
    const edit=e.target.closest('[data-edit-date]');if(edit){$('#agendaQuickViewFinal')?.close();const date=edit.dataset.editDate;$('#calDate').value=date;const v=store.get().calendar?.[date]||{};[['calSubject','subject'],['calEvents','events'],['calTasks','tasks'],['calBirthdays','birthdays'],['calHolidays','holidays'],['calNotes','notes']].forEach(([id,k])=>{if($('#'+id))$('#'+id).value=v[k]||''});$('#calSubject')?.scrollIntoView({behavior:'smooth',block:'center'});$('#calSubject')?.focus()}
    const provider=e.target.closest('[data-calendar-provider]');if(provider)providerDetail(provider.dataset.calendarProvider,$('#calendarProviderDialog').dataset.mode);
  },{capture:true});
  document.addEventListener('change',async e=>{if(e.target.id==='providerICSFile'&&e.target.files[0]){try{await importICSFile(e.target.files[0]);$('#calendarProviderDialog')?.close();setTimeout(()=>location.reload(),350)}catch(err){toast('Import could not be completed',err.message)}e.target.value=''}});
}

/* ---------- Lani: one shared IndexedDB source, 5-second dashboard carousel ---------- */
let dashTimer=0;
async function dashboardLaniEnhance(router){
  const box=$('#dashboardLani');if(!box)return;clearInterval(dashTimer);
  try{
    const photos=await getPhotos();
    if(!photos.length){box.innerHTML='<button class="dashboard-photo-empty" type="button">♡<b>Add your first Lani memory</b><small>Photos uploaded in Lani’s Corner appear here automatically.</small></button>';box.querySelector('button').onclick=()=>router.go('lani');return}
    let current=photos.findIndex(p=>p.featured);if(current<0)current=0;
    const urls=photos.map(p=>URL.createObjectURL(p.blob));
    box.innerHTML=`<div class="dashboard-lani-carousel"><button class="dashboard-photo-stage" type="button">${urls.map((u,i)=>`<img class="${i===current?'active':''}" src="${u}" alt="Lani memory ${i+1}">`).join('')}</button><button class="lani-arrow prev" id="dashLaniPrev" aria-label="Previous photo">‹</button><button class="lani-arrow next" id="dashLaniNext" aria-label="Next photo">›</button><span class="photo-count">${photos.length} memor${photos.length===1?'y':'ies'}</span></div>`;
    const show=i=>{const imgs=all('#dashboardLani img');if(!imgs.length)return;imgs[current]?.classList.remove('active');current=(i+imgs.length)%imgs.length;imgs[current].classList.add('active')};
    $('#dashLaniPrev').onclick=e=>{e.stopPropagation();show(current-1)};$('#dashLaniNext').onclick=e=>{e.stopPropagation();show(current+1)};
    box.querySelector('.dashboard-photo-stage').onclick=()=>router.go('lani');
    if(photos.length>1)dashTimer=setInterval(()=>show(current+1),5000);
  }catch(e){box.innerHTML='<div class="status">The shared Lani photo library could not be opened.</div>'}
}

/* ---------- 25 Hard: persistence, view switching, completion flip ---------- */
function goalsEnhance(){
  const board=$('#hardBoard');if(!board)return;
  const render=()=>{
    const st=store.get(),items=st.goals||[],view=st.hardView||'grid',done=items.filter(g=>Number(g.progress)>=100).length;
    board.className=`hard-board ${view==='list'?'list-view':'grid-view'}`;$('#hardCount').textContent=`${done}/25 complete`;
    const bar=$('.hard-progress-summary i');if(bar)bar.style.width=`${done/25*100}%`;const summary=$('.hard-progress-summary small');if(summary)summary.textContent=`${25-done} milestones still becoming`;
    board.innerHTML=Array.from({length:25},(_,i)=>{const g=items[i],p=Math.min(100,Number(g?.progress||0));if(!g)return `<article class="hard-tile empty"><div class="hard-index">${String(i+1).padStart(2,'0')}</div><button class="hard-empty-action" data-focus-hard><span>＋</span><b>Open milestone</b></button></article>`;return `<article class="hard-tile ${p===100?'complete gold-flipped':''}" style="--p:${p}%"><div class="hard-index">${String(i+1).padStart(2,'0')}</div><div class="hard-tile-main"><div class="hard-tile-heading"><span class="pill">${esc(g.category)}</span><h3>${esc(g.name)}</h3></div><div class="mini-ring"><strong>${p}%</strong></div><div class="hard-inline-progress"><i style="width:${p}%"></i></div><input data-final-progress="${i}" aria-label="Progress for ${esc(g.name)}" type="range" min="0" max="100" value="${p}"><div class="hard-tile-actions"><button class="text-button" data-final-complete="${i}">${p===100?'Completed ✓':'Mark complete'}</button><button class="text-button" data-final-remove="${i}">Remove</button></div></div></article>`}).join('');
  };
  all('[data-hard-view]').forEach(b=>b.onclick=()=>{const v=b.dataset.hardView;store.set({hardView:v});all('[data-hard-view]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});render();toast(`${v==='grid'?'Grid':'List'} view applied`)});
  $('#addHardGoal').onclick=()=>{const input=$('#hardGoalName'),name=input.value.trim();if(!name)return toast('Name the milestone first');if(store.get().goals.length>=25)return toast('All 25 milestones are filled');store.mutate(d=>d.goals.push({id:uid(),name,category:$('#hardGoalCategory').value,progress:0,createdAt:new Date().toISOString()}));input.value='';render();toast('Milestone added','It is saved in both grid and list views.')};
  board.onclick=e=>{const complete=e.target.closest('[data-final-complete]'),remove=e.target.closest('[data-final-remove]'),focus=e.target.closest('[data-focus-hard]');
    if(focus)return $('#hardGoalName')?.focus();
    if(remove){store.mutate(d=>d.goals.splice(+remove.dataset.finalRemove,1));render();return toast('Milestone removed')}
    if(complete){const i=+complete.dataset.finalComplete,name=store.get().goals[i].name;store.mutate(d=>d.goals[i].progress=100);render();const tile=board.children[i];tile?.classList.add('just-completed');toast('Milestone completed',`${name} turned gold.`)}
  };
  board.onchange=e=>{const r=e.target.closest('[data-final-progress]');if(!r)return;const i=+r.dataset.finalProgress,was=Number(store.get().goals[i].progress||0);store.mutate(d=>d.goals[i].progress=+r.value);render();if(+r.value===100&&was<100)toast('Milestone completed','Your achievement has turned gold.')};
  render();
}

/* ---------- Morning Brief: in-place Top Three editor ---------- */
function morningBriefEnhance(){
  const topCard=all('.card').find(c=>c.querySelector('h3')?.textContent.trim()==='Top Three');if(!topCard)return;
  const btn=topCard.querySelector('.section-title button');if(!btn)return;btn.removeAttribute('data-jump');btn.id='editBriefTop3';btn.textContent='Edit';
  const d=ensureDialog('briefPriorityDialog',`<dialog id="briefPriorityDialog" class="priority-dialog"><div class="priority-dialog-shell"><button class="icon-button reflection-close" data-close-brief>×</button><div class="eyebrow">Morning Brief</div><h2>Edit today’s Top Three</h2><div id="briefPriorityFields"></div><div class="row modal-actions"><button class="btn secondary" data-close-brief>Cancel</button><button class="btn" id="saveBriefTop3">Save priorities</button></div></div></dialog>`);
  const draw=()=>{$('#briefPriorityFields').innerHTML=(store.get().top3||[]).map((x,i)=>`<label class="brief-priority-field">Priority ${i+1}<input data-brief-priority="${i}" value="${esc(x)}" placeholder="Choose priority ${i+1}"></label>`).join('')};
  btn.onclick=()=>{draw();d.showModal()};all('[data-close-brief]').forEach(x=>x.onclick=()=>d.close());
  $('#saveBriefTop3').onclick=()=>{const vals=all('[data-brief-priority]').map(x=>x.value.trim());store.mutate(s=>{s.top3=vals;s.priorityDetails=s.priorityDetails||[];vals.forEach((v,i)=>{if(s.priorityDetails[i])s.priorityDetails[i].title=v})});d.close();toast('Top Three updated','Your priorities are saved across the OS.');setTimeout(()=>location.reload(),250)};
}

/* ---------- Connected wellness accounts ---------- */
function wellnessAccounts(){
  const target=$('.pagehead')?.nextElementSibling||$('#page');if(!target||$('#wellnessConnections'))return;
  const st=store.get(),connections=st.wellnessConnections||{};
  target.insertAdjacentHTML('beforebegin',`<section id="wellnessConnections" class="card connected-accounts-card"><div class="section-title"><div><div class="eyebrow">Connected accounts</div><h3>Wellness connections</h3></div><span class="pill">Reference hub</span></div><div class="wellness-provider-grid"><article><span class="wellness-provider-icon">E</span><div><b>EOS Mobile</b><small>${connections.eos?'Available':'Not opened yet'}</small></div><a class="btn ghost" href="https://www.eosfitness.com/" target="_blank" rel="noopener" data-wellness-open="eos">Open EOS</a></article><article><span class="wellness-provider-icon">M</span><div><b>MyFitnessPal</b><small>${connections.myfitnesspal?'Available':'Not opened yet'}</small></div><a class="btn ghost" href="https://www.myfitnesspal.com/" target="_blank" rel="noopener" data-wellness-open="myfitnesspal">Open MyFitnessPal</a></article></div><p class="muted">These cards open the official services for reference. They do not claim private health-data synchronization.</p></section>`);
  all('[data-wellness-open]').forEach(a=>a.onclick=()=>store.mutate(d=>{d.wellnessConnections={...(d.wellnessConnections||{}),[a.dataset.wellnessOpen]:{lastOpened:new Date().toISOString()}}}));
}

/* ---------- Financial visual enhancement only ---------- */
function moneyEnhance(){
  $('#page')?.classList.add('financial-luxury-page');
  const names=['Projected Monthly Margin','Executive Insight','Fast Setup',"Today's Money Command"];
  all('.card').forEach(c=>{const t=c.querySelector('h2,h3')?.textContent.trim();const i=names.indexOf(t);if(i>=0)c.classList.add('financial-depth-card',`financial-card-${i+1}`)});
}

/* ---------- Adaptive typography release gate ---------- */
function contrastEnhance(){
  document.documentElement.classList.add('sprint-6b1-final');
  const theme=document.documentElement.dataset.theme;
  if(theme==='noir'||theme==='sapphire'||theme==='emerald')document.documentElement.dataset.contrast='dark';
  else document.documentElement.dataset.contrast='light';
}

export async function enhanceSprint6B1Final(id,router){
  contrastEnhance();
  if(id==='calendar')calendarEnhance();
  if(id==='dashboard')await dashboardLaniEnhance(router);
  if(id==='goals')goalsEnhance();
  if(id==='intelligence')morningBriefEnhance();
  if(id==='wellness')wellnessAccounts();
  if(id==='money')moneyEnhance();
}
