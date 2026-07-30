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
const luluLines={lani:['Hi, baby girl. Let’s see what made Lani smile today.','Love, these little moments are worth keeping.'],default:['Hi, Shug. We can take today one gentle step at a time.','Sweetheart, you do not have to carry everything at once.']};
let route='dashboard',bubbleTimer,idleTimer,moveTimer,lastLine='';
const companionConfig=()=>({...{enabled:true,speech:true,frequency:'balanced',surprises:true,reducedMotion:false,mode:'auto'},...(store.get().companion||{})});
const activeMode=()=>{const chosen=companionConfig().mode;return chosen==='auto'?(route==='lani'?'lulu':'kiki'):chosen};
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
function moveCompanion(immediate=false){
  const host=document.querySelector('#kikiCompanion'),cfg=companionConfig();if(!host)return;
  const width=host.getBoundingClientRect().width||140,min=window.innerWidth>760?280:10,max=Math.max(min,window.innerWidth-width-18);
  host.style.setProperty('--companion-x',`${Math.round(min+Math.random()*(max-min))}px`);host.classList.toggle('is-walking',!immediate&&!cfg.reducedMotion);
  clearTimeout(moveTimer);moveTimer=setTimeout(()=>{host.classList.remove('is-walking');moveCompanion()},cfg.frequency==='lively'?15000:26000);
}
function saveSetting(patch){store.mutate(d=>{d.companion={...companionConfig(),...patch}})}
function applySettings(){
  const host=document.querySelector('#kikiCompanion'),cfg=companionConfig();if(!host)return;
  const mode=activeMode(),image=host.querySelector('img');host.hidden=!cfg.enabled;host.dataset.mode=mode;
  image.src=mode==='lulu'?'assets/companion/lulu.png':'assets/companion/kiki.png';image.alt=mode==='lulu'?'Lulu, your gentle dinosaur companion':'Kiki, your tiny dinosaur companion';
  document.documentElement.dataset.companionMotion=cfg.reducedMotion?'reduced':'standard';scheduleIdle();
}
function renderSettings(){
  const cfg=companionConfig(),panel=document.querySelector('#kikiSettings');
  panel.innerHTML=`<div class="kiki-settings-head"><div><span>Kiki + Lulu</span><b>Your companion, your choice</b></div><button type="button" data-kiki-close aria-label="Close companion settings">×</button></div><label><span>Companion mode</span><select data-kiki-setting="mode"><option value="auto" ${cfg.mode==='auto'?'selected':''}>Automatic</option><option value="kiki" ${cfg.mode==='kiki'?'selected':''}>Kiki</option><option value="lulu" ${cfg.mode==='lulu'?'selected':''}>Lulu</option></select></label><label><span>Show companion</span><input type="checkbox" data-kiki-setting="enabled" ${cfg.enabled?'checked':''}></label><label><span>Speech bubbles</span><input type="checkbox" data-kiki-setting="speech" ${cfg.speech?'checked':''}></label><label><span>Rare surprises</span><input type="checkbox" data-kiki-setting="surprises" ${cfg.surprises?'checked':''}></label><label><span>Activity</span><select data-kiki-setting="frequency"><option value="quiet" ${cfg.frequency==='quiet'?'selected':''}>Quiet</option><option value="balanced" ${cfg.frequency==='balanced'?'selected':''}>Balanced</option><option value="lively" ${cfg.frequency==='lively'?'selected':''}>Lively</option></select></label><label><span>Reduced motion</span><input type="checkbox" data-kiki-setting="reducedMotion" ${cfg.reducedMotion?'checked':''}></label>`;
  panel.querySelector('[data-kiki-close]').onclick=()=>panel.hidePopover();
  panel.querySelectorAll('[data-kiki-setting]').forEach(control=>control.onchange=()=>{saveSetting({[control.dataset.kikiSetting]:control.type==='checkbox'?control.checked:control.value});applySettings();renderSettings()});
}
function mount(){
  if(document.querySelector('#kikiCompanion'))return;
  document.body.insertAdjacentHTML('beforeend',`<aside id="kikiCompanion" class="kiki-companion" aria-label="Kiki companion"><div class="kiki-bubble" role="status" aria-live="polite" hidden></div><button type="button" class="kiki-character" aria-label="Talk to Kiki"><img src="assets/companion/kiki.png" alt="Kiki, your tiny dinosaur companion"></button></aside><button type="button" class="kiki-settings-button" aria-label="Kiki and Lulu settings" popovertarget="kikiSettings">•••</button><section id="kikiSettings" class="kiki-settings" aria-label="Kiki and Lulu settings" popover></section>`);
  const character=document.querySelector('.kiki-character'),speak=()=>say(pick(activeMode()==='lulu'?(luluLines[route]||luluLines.default):(pageLines[route]||idleLines)));
  character.onclick=speak;character.onmouseenter=()=>{if(character.dataset.moving)return;const moves=['hover-twirl','hover-shimmy','hover-hop','hover-sass'],move=moves[Math.floor(Math.random()*moves.length)];character.dataset.moving='1';character.classList.add(move);setTimeout(()=>{character.classList.remove(move);delete character.dataset.moving},1300)};
  renderSettings();applySettings();moveCompanion(true);
}
export function enhanceSprint6C1(id){
  mount();route=id||'dashboard';const host=document.querySelector('#kikiCompanion');host.dataset.route=route;applySettings();moveCompanion();
  clearTimeout(host._greeting);host._greeting=setTimeout(()=>say(pick(activeMode()==='lulu'?(luluLines[route]||luluLines.default):(pageLines[route]||idleLines))),700);
  const badge=document.querySelector('#kcBuildStatus b');if(badge)badge.textContent='Sprint 6C.1 · Kiki Foundation';
}
