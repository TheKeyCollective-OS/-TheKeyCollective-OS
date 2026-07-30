import {store} from './store.js';

const pageLines={
  dashboard:['Okay queen, what are we handling first?','Girl… this dashboard is looking very CEO.','Hey baby girl, what’s the move today?','Bestie, I’m here. Who are we impressing first?'],
  intelligence:['Bestie, what is the morning tea?','Girl, let me peek at the briefing too.','Okay queen, give me the important details.'],calendar:['Girl, where are we going? I need details.','Okay, whose business are we adding to this calendar?','Baby girl, let’s make room for something fun too.'],
  lani:['Awww, Lani’s Corner! Let me put on my gentle voice.','Hey baby girl, let’s see what our favorite little lady is up to.','This page is too cute. I’m staying.'],career:['Okay career queen! Teach me something expensive.','Bestie, professional and fabulous is a powerful combination.','Girl, look at you building that expertise.'],
  business:['Girl… are we building an empire again?','Okay boss, I brought ideas and absolutely no chill.','Bestie, this is giving future CEO.'],money:['Queen, I opened the money page. Should I be nervous?','Girl, I’m just here to mind the budget respectfully.','Okay baby girl, let’s make the numbers behave.'],
  wellness:['Water check! I am watching respectfully. 👀','Hey gorgeous, have we stretched those shoulders today?','Baby girl, tiny care still counts.','Bestie, that water bottle is not decorative.'],sanctuary:['Beautiful, take the breath before the next thing.','Hey baby girl, let’s soften the room for a minute.','Queen, you are allowed to pause.'],
  journal:['Sooo… are we gonna talk about it orrrr? 👀','Girl, I brought my listening ears and zero judgment.','Bestie, write the messy version. We can make sense of it later.'],goals:['Okay muscles! Tiny progress still counts.','Queen, one little step still moved us forward.','Baby girl, consistency can be cute and imperfect.'],
  progress:['Look at those wins! I knew you were that girl.','Bestie, I see the quiet wins too.','Okay queen, the progress is progressing.'],premium:['Ooh, we are redecorating? I have opinions.','Girl, luxury is in the details. Let me look.','Bestie, this is getting very polished.'],
  profile:['That is my gorgeous bestie right there.','Hey queen, looking good in your own little corner.','Baby girl, this profile is very much giving main character.']
};
const idleLines=['Girl… what are we doing over here? 👀','Bestie, I was just checking on you.','Queen, drink a little water with me?','Gorgeous, I am minding your business lovingly.','Hey baby girl, I came to see what you’re working on.','Bestie… I have questions, but I’ll behave.','Girl, don’t mind me. I’m just supervising.','Queen, should we celebrate something small real quick?'];
const luluLines={
  lani:['Hey, baby girl. Let’s see what made Lani smile today.','Love, these little moments are worth keeping.','Shug, you’re building her childhood with so much love.','Sweetheart, let’s save one beautiful little moment today.'],
  wellness:['Hey, Shug. Want to share a glass of water with me?','Baby girl, one small act of care is enough to begin.','Love, your body deserves tenderness today.','Sweetheart, we can take care of you without rushing.'],
  sanctuary:['Hey, baby girl. Come breathe with me for a moment.','Shug, you don’t have to solve everything right now.','Love, rest is allowed here.','Sweetheart, let’s make this moment a little softer.'],
  journal:['Hey, Shug. You can tell the page the truth.','Baby girl, you don’t have to make your feelings sound pretty.','Love, I’ll sit right here while you write.'],
  default:['Hey, Shug. We can take today one gentle step at a time.','Sweetheart, you do not have to carry everything at once.','Hey, baby girl. I’m right here with you.','Love, let’s choose the kindest next step.','Beautiful, you are allowed to move gently today.']
};
let route='dashboard',bubbleTimer,idleTimer,moveTimer,lastLine='';
const companionConfig=()=>({...{enabled:true,speech:true,frequency:'balanced',surprises:true,reducedMotion:false,mode:'auto'},...(store.get().companion||{})});
const activeMode=()=>{const chosen=companionConfig().mode;return chosen==='auto'?(route==='lani'?'lulu':'kiki'):chosen};
const pick=list=>{const pool=list.filter(line=>line!==lastLine),next=pool[Math.floor(Math.random()*pool.length)]||list[0];lastLine=next;return next};

function say(message){
  const host=document.querySelector('#kikiCompanion'),cfg=companionConfig();
  if(!host||!cfg.enabled||!cfg.speech)return;
  const bubble=document.querySelector('#kikiBubble');bubble.textContent=message;bubble.hidden=false;host.classList.add('is-talking');
  clearTimeout(bubbleTimer);bubbleTimer=setTimeout(()=>{bubble.hidden=true;host.classList.remove('is-talking')},5200);
}
function scheduleIdle(){
  clearTimeout(idleTimer);const cfg=companionConfig();if(!cfg.enabled||cfg.frequency==='quiet')return;
  idleTimer=setTimeout(()=>{if(!document.hidden)say(pick(idleLines));scheduleIdle()},(cfg.frequency==='lively'?24000:50000)+Math.random()*14000);
}
function moveCompanion(immediate=false){
  const host=document.querySelector('#kikiCompanion'),cfg=companionConfig();if(!host)return;
  const width=host.getBoundingClientRect().width||140,min=window.innerWidth>760?280:10,max=Math.max(min,window.innerWidth-width-18);
  const x=Math.round(min+Math.random()*(max-min)),bubble=document.querySelector('#kikiBubble'),bubbleWidth=window.innerWidth<=720?230:260;
  host.style.setProperty('--companion-x',`${x}px`);if(bubble)bubble.style.left=`${Math.max(12,Math.min(window.innerWidth-bubbleWidth-12,x-55))}px`;host.classList.toggle('is-walking',!immediate&&!cfg.reducedMotion);
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
  const name=activeMode()==='lulu'?'Lulu':'Kiki';
  panel.querySelector('.kiki-settings-head').insertAdjacentHTML('afterend',`<button type="button" class="kiki-talk-button" data-kiki-talk>Hear from ${name}</button>`);
  panel.querySelector('[data-kiki-close]').onclick=()=>panel.hidePopover();
  panel.querySelector('[data-kiki-talk]').onclick=()=>{panel.hidePopover();say(pick(activeMode()==='lulu'?(luluLines[route]||luluLines.default):(pageLines[route]||idleLines)))};
  panel.querySelectorAll('[data-kiki-setting]').forEach(control=>control.onchange=()=>{saveSetting({[control.dataset.kikiSetting]:control.type==='checkbox'?control.checked:control.value});applySettings();renderSettings()});
}
function mount(){
  if(document.querySelector('#kikiCompanion'))return;
  document.body.insertAdjacentHTML('beforeend',`<div id="kikiBubble" class="kiki-bubble" role="status" aria-live="polite" hidden></div><aside id="kikiCompanion" class="kiki-companion" aria-label="Kiki companion"><button type="button" class="kiki-character" aria-label="Talk to Kiki"><img src="assets/companion/kiki.png" alt="Kiki, your tiny dinosaur companion"></button></aside><section id="kikiSettings" class="kiki-settings" aria-label="Kiki and Lulu settings" popover></section>`);
  const character=document.querySelector('.kiki-character');
  character.setAttribute('aria-label','Open Kiki and Lulu options');
  character.setAttribute('popovertarget','kikiSettings');
  character.onmouseenter=()=>{if(character.dataset.moving)return;const moves=['hover-twirl','hover-shimmy','hover-hop','hover-sass'],move=moves[Math.floor(Math.random()*moves.length)];character.dataset.moving='1';character.classList.add(move);setTimeout(()=>{character.classList.remove(move);delete character.dataset.moving},1300)};
  renderSettings();applySettings();moveCompanion(true);
}
export function enhanceSprint6C1(id){
  mount();route=id||'dashboard';const host=document.querySelector('#kikiCompanion');host.dataset.route=route;applySettings();moveCompanion();
  clearTimeout(host._greeting);host._greeting=setTimeout(()=>say(pick(activeMode()==='lulu'?(luluLines[route]||luluLines.default):(pageLines[route]||idleLines))),700);
  const badge=document.querySelector('#kcBuildStatus b');if(badge)badge.textContent='Sprint 6C.1 · Kiki Foundation';
}
