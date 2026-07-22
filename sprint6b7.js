
import {store} from './store.js';

const BUILD='Sprint 6B.7';
const $=s=>document.querySelector(s);
const all=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const splitLines=v=>String(v||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);

let agendaCaptureInstalled=false;
let contrastObserver=null;
let contrastFrame=0;

function localDateKey(date=new Date()){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function dateAtNoon(key){return new Date(`${key}T12:00:00`)}

function migrateNoir(){
  if(store.get().theme==='noir')store.set({theme:'midnight'});
  if(document.documentElement.dataset.theme==='noir')document.documentElement.dataset.theme='midnight';
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

function agendaDialog(){
  let d=$('#agendaDayDetail6B7');
  if(d)return d;
  document.body.insertAdjacentHTML('beforeend',`
    <dialog id="agendaDayDetail6B7" class="agenda-dialog frosted-day-dialog agenda-day-6b7">
      <article class="card agenda-modal">
        <button type="button" class="icon-button reflection-close" data-close-agenda-6b7 aria-label="Close">×</button>
        <div id="agendaDayContent6B7"></div>
      </article>
    </dialog>`);
  d=$('#agendaDayDetail6B7');
  d.addEventListener('click',event=>{
    if(event.target===d||event.target.closest('[data-close-agenda-6b7]'))d.close();
  });
  return d;
}

function openAgendaDay(date){
  if(!date)return;
  const d=agendaDialog(),items=itemsFor(date),day=store.get().calendar?.[date]||{};
  $('#agendaDayContent6B7').innerHTML=`
    <div class="eyebrow">Agenda day details</div>
    <h2>${dateAtNoon(date).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</h2>
    <p class="muted">${items.length?`${items.length} item${items.length===1?'':'s'} scheduled`:'This day is open.'}</p>
    <div class="agenda-quick-list">
      ${items.map(([type,label,text])=>`<div class="agenda-quick-item ${type}"><span class="agenda-dot ${type}"></span><div><small>${esc(label)}</small><b>${esc(text)}</b></div></div>`).join('')||'<div class="status">No events, tasks, birthdays, holidays, notes, or bills are listed.</div>'}
    </div>
    <div class="row modal-actions">
      <button type="button" class="btn" id="editAgendaDay6B7">Edit this day</button>
      <button type="button" class="btn secondary" data-close-agenda-6b7>Close</button>
    </div>`;
  const selected=$('#selectedDayDetail');
  if(selected)selected.innerHTML=`<b>${esc(day.subject||dateAtNoon(date).toLocaleDateString('en-US',{month:'long',day:'numeric'}))}</b><p>${items.length?items.map(item=>esc(item[2])).join(' · '):'Nothing scheduled.'}</p>`;
  $('#editAgendaDay6B7').onclick=()=>{
    d.close();
    const value=store.get().calendar?.[date]||{};
    const fields=[['calSubject','subject'],['calEvents','events'],['calTasks','tasks'],['calBirthdays','birthdays'],['calHolidays','holidays'],['calNotes','notes']];
    if($('#calDate'))$('#calDate').value=date;
    fields.forEach(([id,key])=>{if($('#'+id))$('#'+id).value=value[key]||''});
    $('#calDate')?.scrollIntoView({behavior:'smooth',block:'center'});
  };
  if(d.open)d.close();
  try{d.showModal()}catch{d.setAttribute('open','')}
}

function installAgendaCapture(){
  if(agendaCaptureInstalled)return;
  agendaCaptureInstalled=true;
  document.addEventListener('click',event=>{
    const target=event.target.closest?.('[data-calendar-date]');
    if(!target)return;
    const pageTitle=document.querySelector('.topbar h1,.topbar-title,.pagehead h1')?.textContent||'';
    if(!document.querySelector('#calendarGrid')&&!/agenda/i.test(pageTitle))return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openAgendaDay(target.dataset.calendarDate);
  },true);
}

function parseColor(value){
  value=String(value||'').trim();
  let match=value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/i);
  if(match)return {r:+match[1],g:+match[2],b:+match[3],a:match[4]===undefined?1:+match[4]};
  match=value.match(/^#([\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i);
  if(!match)return null;
  let hex=match[1];
  if(hex.length===3)hex=hex.split('').map(c=>c+c).join('');
  const alpha=hex.length===8?parseInt(hex.slice(6,8),16)/255:1;
  return {r:parseInt(hex.slice(0,2),16),g:parseInt(hex.slice(2,4),16),b:parseInt(hex.slice(4,6),16),a:alpha};
}
function blend(fg,bg){
  const a=fg.a+(bg.a||1)*(1-fg.a);
  if(!a)return {r:255,g:255,b:255,a:1};
  return {
    r:(fg.r*fg.a+bg.r*(bg.a||1)*(1-fg.a))/a,
    g:(fg.g*fg.a+bg.g*(bg.a||1)*(1-fg.a))/a,
    b:(fg.b*fg.a+bg.b*(bg.a||1)*(1-fg.a))/a,
    a
  };
}
function gradientColor(image){
  if(!image||image==='none')return null;
  const matches=image.match(/rgba?\([^)]+\)|#[\da-f]{3,8}/gi)||[];
  const colors=matches.map(parseColor).filter(Boolean);
  if(!colors.length)return null;
  const sample=colors.slice(0,3);
  return {
    r:sample.reduce((n,c)=>n+c.r,0)/sample.length,
    g:sample.reduce((n,c)=>n+c.g,0)/sample.length,
    b:sample.reduce((n,c)=>n+c.b,0)/sample.length,
    a:sample.reduce((n,c)=>n+c.a,0)/sample.length
  };
}
function channel(value){
  value/=255;
  return value<=.04045?value/12.92:Math.pow((value+.055)/1.055,2.4);
}
function luminance(color){return .2126*channel(color.r)+.7152*channel(color.g)+.0722*channel(color.b)}

function effectiveBackground(element){
  const layers=[];
  let node=element;
  while(node&&node!==document.documentElement){
    const style=getComputedStyle(node);
    const gradient=gradientColor(style.backgroundImage);
    const solid=parseColor(style.backgroundColor);
    if(gradient&&gradient.a>.08)layers.push(gradient);
    if(solid&&solid.a>.08)layers.push(solid);
    node=node.parentElement;
  }
  let result=parseColor(getComputedStyle(document.body).backgroundColor)||{r:255,g:255,b:255,a:1};
  for(let i=layers.length-1;i>=0;i--)result=blend(layers[i],result);
  return result;
}
function classify(element){
  if(!element||element.matches('[data-contrast-ignore],.dot,.agenda-dot,.notice-mark,.kc-build-dot'))return;
  const tone=luminance(effectiveBackground(element))>.46?'light':'dark';
  element.dataset.surfaceTone=tone;
}
function contrastTargets(root=document){
  return [...root.querySelectorAll(`
    body,.page,.pagehead,.topbar,.sidebar,.card,.module,.theme-card,.theme-copy,
    .preview-room,.preview-mini,.design-pack,.studio-section,.studio-grid,.design-hero,
    .readability-card,.contrast-demo,.status,.prompt,.entry,.agenda-item,.brief-line,
    .hard-tile,.calendar-day,.agenda-modal,.pill,.btn,button,input,textarea,select,
    .dashboard-panel,.weather-card,.metric-card
  `)];
}
function applyContrast(root=document){
  cancelAnimationFrame(contrastFrame);
  contrastFrame=requestAnimationFrame(()=>{
    contrastTargets(root).forEach(classify);
    requestAnimationFrame(()=>contrastTargets(root).forEach(classify));
  });
}
function installContrastObserver(){
  if(contrastObserver)return;
  contrastObserver=new MutationObserver(()=>applyContrast());
  contrastObserver.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','data-theme','data-cards','data-texture']});
  addEventListener('kc:state',()=>applyContrast());
  addEventListener('resize',()=>applyContrast(),{passive:true});
}

function stabilizeThemeCards(){
  all('.theme-card').forEach(card=>{
    card.classList.add('theme-card-6b7');
    classify(card);
    const copy=card.querySelector('.theme-copy');
    if(copy)classify(copy);
  });
  requestAnimationFrame(()=>applyContrast(document));
}

async function ensureServiceWorkerControl(){
  if(!('serviceWorker' in navigator))return;
  try{
    const registration=await navigator.serviceWorker.ready;
    registration.waiting?.postMessage({type:'SKIP_WAITING'});
    if(navigator.serviceWorker.controller){
      sessionStorage.removeItem('kc-sw-control-reload');
      return;
    }
    if(registration.active&&!sessionStorage.getItem('kc-sw-control-reload')){
      sessionStorage.setItem('kc-sw-control-reload','1');
      setTimeout(()=>location.reload(),250);
    }
  }catch(error){
    console.warn('Service worker control check failed',error);
  }
}

function verify25HardSurface(){
  const board=$('#hardBoard');
  if(!board)return;
  board.dataset.verification='create-persist-complete-gold';
  all('.hard-tile.complete,.hard-tile.gold-flipped').forEach(tile=>{
    tile.dataset.surfaceTone='light';
    tile.setAttribute('data-completion-state','gold');
  });
}

function updateBuildIdentity(){
  const badge=$('#kcBuildStatus');
  if(badge){
    const title=badge.querySelector('b');
    if(title)title.textContent=BUILD;
  }
  const modal=$('#buildDiagnostics h2');
  if(modal)modal.textContent=BUILD;
}

export async function enhanceSprint6B7(id){
  migrateNoir();
  updateBuildIdentity();
  installAgendaCapture();
  installContrastObserver();
  if(id==='premium')stabilizeThemeCards();
  if(id==='goals')verify25HardSurface();
  applyContrast();
  ensureServiceWorkerControl();
}
