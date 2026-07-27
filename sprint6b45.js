import {store} from './store.js';
import {connect,sync,saveEvent,state as googleState,fingerprint} from './google-calendar.js';

const $=(selector,root=document)=>root.querySelector(selector);
const all=(selector,root=document)=>[...root.querySelectorAll(selector)];
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const today=()=>{const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Phoenix',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const values=Object.fromEntries(parts.map(x=>[x.type,x.value]));return `${values.year}-${values.month}-${values.day}`};

function sectionIdentity(card){
  if(card.dataset.kc45Google!==undefined)return 'google-calendar';
  const heading=card.querySelector(':scope > .section-title h2,:scope > .section-title h3,:scope > h2,:scope > h3');
  return (heading?.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
}
function dedupePage(){
  const cards=all('#page > .card,#page > section > .card,#page > div > .card,#page > main > .card');
  const seen=new Map();
  cards.forEach(card=>{
    const key=sectionIdentity(card);if(!key)return;
    const prior=seen.get(key);if(!prior){seen.set(key,card);return}
    const keep=(prior.textContent||'').length>=(card.textContent||'').length?prior:card;
    (keep===prior?card:prior).remove();seen.set(key,keep);
  });
}
function localFingerprints(){
  const found=new Set();
  Object.entries(store.get().calendar||{}).forEach(([date,day])=>String(day?.events||'').split(/\n|,/).map(x=>x.trim()).filter(Boolean).forEach(title=>found.add(fingerprint({date,title}))));
  return found;
}
function panel(date){
  const google=googleState(),writable=(google.calendars||[]).filter(c=>['owner','writer'].includes(c.accessRole)),local=localFingerprints();
  const events=(google.events||[]).filter(e=>e.date>=today()&&!local.has(fingerprint(e))).sort((a,b)=>a.start.localeCompare(b.start));
  return `<section class="card kc45-google" data-kc45-google>
    <div class="section-title"><div><div class="eyebrow">Connected calendar</div><h2>Google Calendar</h2></div><span class="pill">${google.connected?'Connected':'Not connected'}</span></div>
    <p>Sync every Google calendar visible to this account. Repeated syncs update existing events instead of duplicating them.</p>
    <div class="row wrap"><button class="btn" data-kc45-action="${google.connected?'sync':'connect'}">${google.connected?'Sync all Google calendars':'Connect Google Calendar'}</button>${google.lastSync?`<small>Last synced ${new Date(google.lastSync).toLocaleString()}</small>`:''}</div>
    ${google.connected?`<div class="kc44-form-grid">
      <label>Edit an existing event<select data-kc45-field="googleId"><option value="">Create a new event</option>${events.map(e=>`<option value="${esc(e.googleId)}" data-calendar="${esc(e.calendarId)}">${esc(e.date)} · ${esc(e.title)} · ${esc(e.calendarName)}</option>`).join('')}</select></label>
      <label>Calendar<select data-kc45-field="calendarId">${writable.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></label>
      <label>Date<input type="date" data-kc45-field="date" value="${esc(date)}"></label>
      <label>Event title<input data-kc45-field="title" value=""></label>
      <label>Start<input type="time" data-kc45-field="startTime" value="09:00"></label>
      <label>End<input type="time" data-kc45-field="endTime" value="10:00"></label>
      <label>Location<input data-kc45-field="location" value=""></label>
    </div><label>Notes<textarea data-kc45-field="description" rows="3"></textarea></label><button class="btn secondary" data-kc45-action="save">Create Google event</button>`:''}
    <div class="status" data-kc45-status>${events.length?`${events.length} upcoming Google events loaded across ${google.calendars.length} calendars.`:'Ready.'}</div>
    <details><summary>Upcoming Google events</summary>${events.slice(0,30).map(e=>`<div class="brief-line"><span style="color:${esc(e.calendarColor)}">●</span><div><b>${esc(e.title)}</b><small>${esc(e.date)} · ${esc(e.calendarName)}${e.location?` · ${esc(e.location)}`:''}</small></div></div>`).join('')||'<div class="status">No upcoming Google events.</div>'}</details>
  </section>`;
}
function removeAppleAndLegacySetup(){
  all('#page [data-kc44-action="open-apple-directions"],#page [data-kc44-action="export-apple-day"],#page [data-kc44-action="google-calendar-setup"]').forEach(x=>x.remove());
  all('#page .calendar-connect .pill').filter(x=>/Apple Calendar|Google Calendar: setup required/i.test(x.textContent||'')).forEach(x=>x.remove());
}
function render(){
  if((($('#page h1')?.textContent||'').trim())!=='Agenda')return;
  $('#page [data-kc45-google]')?.remove();removeAppleAndLegacySetup();
  const date=$('#pageDate6B13')?.value||today(),anchor=$('#page [data-kc44-agenda-intel]')||$('#page .pagehead');
  anchor?.insertAdjacentHTML('afterend',panel(date));dedupePage();
}
function fillSelectedEvent(){
  const select=$('[data-kc45-field="googleId"]'),event=googleState().events?.find(x=>x.googleId===select?.value);if(!event)return;
  const set=(name,value)=>{const input=$(`[data-kc45-field="${name}"]`);if(input)input.value=value||''};
  set('calendarId',event.calendarId);set('date',event.date);set('title',event.title);set('startTime',event.start.slice(11,16));set('endTime',event.end.slice(11,16));set('location',event.location);set('description',event.description);
  $('[data-kc45-action="save"]').textContent='Update Google event';
}
let bound=false;
function bind(){
  if(bound)return;bound=true;
  document.addEventListener('change',event=>{if(event.target.matches('[data-kc45-field="googleId"]'))fillSelectedEvent()});
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-kc45-action]');if(!button)return;event.preventDefault();button.disabled=true;
    const status=$('[data-kc45-status]');
    try{
      if(button.dataset.kc45Action==='connect')await connect();
      if(button.dataset.kc45Action==='sync')await sync();
      if(button.dataset.kc45Action==='save'){
        const value=name=>$(`[data-kc45-field="${name}"]`)?.value||'';
        await saveEvent({googleId:value('googleId'),calendarId:value('calendarId'),date:value('date'),title:value('title'),startTime:value('startTime'),endTime:value('endTime'),location:value('location'),description:value('description')});
      }
      render();
    }catch(error){if(status)status.textContent=error.message;button.disabled=false}
  });
}
export async function enhanceSprint6B45(id){bind();if(id==='calendar'){render();requestAnimationFrame(()=>requestAnimationFrame(render));setTimeout(render,500)}requestAnimationFrame(dedupePage);setTimeout(dedupePage,650)}
