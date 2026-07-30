import {store} from './store.js';

const pageLines={
  dashboard:['Okay queen, what are we handling first?','Girl… this dashboard is looking very CEO.'],
  intelligence:['Bestie, what is the morning tea?'],calendar:['Girl, where are we going? I need details.'],
  lani:['Awww, Lani’s Corner! Let me put on my gentle voice.'],career:['Okay career queen! Teach me something expensive.'],
  business:['Girl… are we building an empire again?'],money:['Queen, I opened the money page. Should I be nervous?'],
  wellness:['Water check! I am watching respectfully. 👀'],sanctuary:['Beautiful, take the breath before the next thing.'],
  journal:['Sooo… are we gonna talk about it orrrr? 👀'],goals:['Okay muscles! Tiny progress still counts.'],
  progress:['Look at those wins! I knew you were that girl.'],premium:['Ooh, we are redecorating? I have opinions.'],
  profile:['That is my gorgeous bestie right there.']
};
const idleLines=['Girl… what are we doing over here? 👀','Bestie, I was just checking on you.','Queen, drink a little water with me?','Gorgeous, I am minding your business lovingly.'];
let route='dashboard',bubbleTimer,idleTimer,lastLine='';
const companionConfig=()=>({...{enabled:true,speech:true,frequency:'balanced',surprises:true,reducedMotion:false},...(store.get().companion||{})});
const pick=list=>{const pool=list.filter(line=>line!==lastLine),next=pool[Math.floor(Math.random()*pool.length)]||list[0];lastLine=next;return next};

function say(message){
  const host=document.querySelector('#kikiCompanion'),cfg=companionConfig();
  if(!host||!cfg.enabled||!cfg.speech)return;
  const bubble=host.querySelector('.kiki-bubble');bubble.textContent=message;bubble.hidden=false;host.classList.add('is-talking');
  clearTimeout(bubbleTimer);bubbleTimer=setTimeout(()=>{bubble.hidden=true;host.classList.remove('is-talking')},5200);
}
function scheduleIdle(){
  clearTimeout(idleTimer);const cfg=companionConfig();if(!cfg.enabled||cfg.frequency==='quiet')return;
  idleTimer=setTimeout(()=>{if(!document.hidden)say(pick(idleLines));scheduleIdle()},(cfg.frequency==='lively'?24000:50000)+Math.random()*14000);
}
function saveSetting(patch){store.mutate(d=>{d.companion={...companionConfig(),...patch}})}
function applySettings(){
  const host=document.querySelector('#kikiCompanion'),cfg=companionConfig();if(!host)return;
  host.hidden=!cfg.enabled;document.documentElement.dataset.companionMotion=cfg.reducedMotion?'reduced':'standard';scheduleIdle();
}
function renderSettings(){
  const cfg=companionConfig(),panel=document.querySelector('#kikiSettings');
  panel.innerHTML=`<div class="kiki-settings-head"><div><span>Kiki Companion</span><b>Your nosy little homegirl</b></div><button type="button" data-kiki-close aria-label="Close Kiki settings">×</button></div><label><span>Show Kiki</span><input type="checkbox" data-kiki-setting="enabled" ${cfg.enabled?'checked':''}></label><label><span>Speech bubbles</span><input type="checkbox" data-kiki-setting="speech" ${cfg.speech?'checked':''}></label><label><span>Rare surprises</span><input type="checkbox" data-kiki-setting="surprises" ${cfg.surprises?'checked':''}></label><label><span>Activity</span><select data-kiki-setting="frequency"><option value="quiet" ${cfg.frequency==='quiet'?'selected':''}>Quiet</option><option value="balanced" ${cfg.frequency==='balanced'?'selected':''}>Balanced</option><option value="lively" ${cfg.frequency==='lively'?'selected':''}>Lively</option></select></label><label><span>Reduced motion</span><input type="checkbox" data-kiki-setting="reducedMotion" ${cfg.reducedMotion?'checked':''}></label>`;
  panel.querySelector('[data-kiki-close]').onclick=()=>panel.hidePopover();
  panel.querySelectorAll('[data-kiki-setting]').forEach(control=>control.onchange=()=>{saveSetting({[control.dataset.kikiSetting]:control.type==='checkbox'?control.checked:control.value});applySettings();renderSettings()});
}
function mount(){
  if(document.querySelector('#kikiCompanion'))return;
  document.body.insertAdjacentHTML('beforeend',`<aside id="kikiCompanion" class="kiki-companion" aria-label="Kiki companion"><div class="kiki-bubble" role="status" aria-live="polite" hidden></div><button type="button" class="kiki-character" aria-label="Talk to Kiki"><img src="assets/companion/kiki.png" alt="Kiki, your tiny dinosaur companion"></button><button type="button" class="kiki-settings-button" aria-label="Kiki settings" popovertarget="kikiSettings">•••</button></aside><section id="kikiSettings" class="kiki-settings" aria-label="Kiki settings" popover></section>`);
  document.querySelector('.kiki-character').onclick=()=>say(pick(pageLines[route]||idleLines));renderSettings();applySettings();
}
export function enhanceSprint6C1(id){
  mount();route=id||'dashboard';const host=document.querySelector('#kikiCompanion');host.dataset.route=route;
  clearTimeout(host._greeting);host._greeting=setTimeout(()=>say(pick(pageLines[route]||idleLines)),700);
  const badge=document.querySelector('#kcBuildStatus b');if(badge)badge.textContent='Sprint 6C.1 · Kiki Foundation';
}
