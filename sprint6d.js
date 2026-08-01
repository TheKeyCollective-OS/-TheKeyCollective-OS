import {store} from './store.js';

const LANI_THEMES={
  safari:{label:'Safari Storybook',description:'A curious expedition of fossils, footprints, and friendly discoveries.',badge:'Explore together',art:'assets/lani/safari-storybook-expedition.png',portraitArt:'assets/lani/safari-storybook-expedition-vertical.png'},
  monsters:{label:'Friendly Monster Neighborhood',description:'A soft, colorful little community where every creature is a friend.',badge:'Everyone belongs',art:'assets/lani/friendly-monster-neighborhood.png',portraitArt:'assets/lani/friendly-monster-neighborhood-vertical.png'},
  dollhouse:{label:'Dollhouse Dress-Up Atelier',description:'A luxe little beauty salon for dress-up, pretend play, and polished make-believe.',badge:'Dress-up atelier',art:'assets/lani/dollhouse-dressup-atelier.png',portraitArt:'assets/lani/dollhouse-dressup-atelier-vertical.png'}
};

const LANI_EXPERIENCES={
  storybook:{label:'Storybook Explorer',description:'Layered serif type, map-like rhythm, and a little chapter-book wonder.',badge:'Curious + warm',accent:'#b28b55'},
  wonder:{label:'Wonder Blocks',description:'Friendly rounded type, playful spacing, and a tactile building-block rhythm.',badge:'Playful + bright',accent:'#c66f9a'},
  atelier:{label:'Little Atelier',description:'Polished display type, ribbon-like dividers, and a curated dress-up finish.',badge:'Curated + sweet',accent:'#b88955'}
};

let draftTheme=null;
let draftExperience=null;
let studioClosed=false;

function savedTheme(){return store.get().laniTheme||'safari'}
function experienceMap(){return store.get().laniExperienceByTheme||{}}
function savedExperience(theme=savedTheme()){return experienceMap()[theme]||'storybook'}
function draftValues(){
  const theme=draftTheme||savedTheme();
  return {theme,experience:draftExperience||savedExperience(theme)};
}
function isDirty(){const d=draftValues();return d.theme!==savedTheme()||d.experience!==savedExperience(d.theme)}

function applyTheme(theme=draftValues().theme,experience=draftValues().experience){
  if(!LANI_THEMES[theme])theme='safari';
  if(!LANI_EXPERIENCES[experience])experience='storybook';
  document.documentElement.dataset.laniTheme=theme;
  document.documentElement.dataset.laniExperience=experience;
  document.documentElement.style.setProperty('--lani-art-portrait',`url("${LANI_THEMES[theme].portraitArt}")`);
  document.documentElement.style.setProperty('--lani-art-landscape',`url("${LANI_THEMES[theme].art}")`);
  document.body.classList.add('lani-independent-theme');
  const shell=document.querySelector('.sidebar'),topbar=document.querySelector('.topbar');
  shell?.style.setProperty('background','linear-gradient(160deg,var(--lani-shell-a),var(--lani-shell-b))','important');
  shell?.style.setProperty('color','var(--lani-shell-ink)','important');
  shell?.querySelectorAll('.nav-button,.brand strong,.brand small,blockquote').forEach(node=>node.style.setProperty('color','var(--lani-shell-ink)','important'));
  topbar?.style.setProperty('background','var(--lani-topbar)','important');
  topbar?.style.setProperty('color','var(--lani-shell-ink)','important');
  topbar?.querySelectorAll('.icon-button,#breadcrumb').forEach(node=>node.style.setProperty('color','var(--lani-shell-ink)','important'));
  const page=document.querySelector('.lani-page');
  if(page){
    page.dataset.laniTheme=theme;
    page.dataset.laniExperience=experience;
    page.querySelectorAll('[data-lani-theme-choice]').forEach(button=>{
      const active=button.dataset.laniThemeChoice===theme;
      button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));
    });
    page.querySelectorAll('[data-lani-experience-choice]').forEach(button=>{
      const active=button.dataset.laniExperienceChoice===experience;
      button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));
    });
    const saved=document.querySelector('#laniAtmosphereStatus');
    if(saved)saved.textContent=isDirty()?'Previewing — save when it feels right':'Saved for this little world';
    const save=document.querySelector('#saveLaniAtmosphere');
    if(save)save.disabled=!isDirty();
    const preview=document.querySelector('#laniExperiencePreview');
    if(preview){preview.dataset.laniTheme=theme;preview.dataset.laniExperience=experience;preview.style.backgroundImage=`url("${LANI_THEMES[theme].art}")`}
  }
}

function mountHiddenKey(){
  const page=document.querySelector('.lani-page');
  if(!page||document.querySelector('#laniHiddenKey'))return;
  page.insertAdjacentHTML('beforeend','<button id="laniHiddenKey" class="lani-hidden-key" type="button" aria-label="Find the hidden key" title="A tiny secret is waiting"></button>');
  document.querySelector('#laniHiddenKey').addEventListener('click',()=>{
    const lines=[
      'Shug, you found my secret. I saved a little sweetness for you.',
      'Love, a tiny key for a very big imagination. Let’s make today magical.',
      'Sweetheart, you discovered my favorite hiding place. Come have a gentle moment with me.',
      'Hey baby girl, Lulu says this key unlocks one very special act of kindness.'
    ];
    const note=document.createElement('div');
    note.className='lani-lulu-surprise';
    note.setAttribute('role','status');
    note.setAttribute('aria-live','polite');
    note.innerHTML=`<span class="lani-lulu-surprise-kicker">Lulu found a secret</span><strong>${lines[Math.floor(Math.random()*lines.length)]}</strong><small>A rare little moment, just for you.</small>`;
    document.body.append(note);
    requestAnimationFrame(()=>note.classList.add('is-visible'));
    setTimeout(()=>{note.classList.remove('is-visible');setTimeout(()=>note.remove(),500)},8000);
    window.dispatchEvent(new CustomEvent('lani:hidden-key'));
  });
}

function mountLaniDisclosures(){
  const page=document.querySelector('.lani-page');
  if(!page||page.dataset.laniDisclosures)return;
  page.dataset.laniDisclosures='1';
  [...page.querySelectorAll('.card')].forEach((card,index)=>{
    if(card.classList.contains('lani-hero')||card.dataset.laniCollapsible)return;
    // Lani cards use a few different header wrappers. Keep the first direct
    // child that contains the heading visible, and collapse everything else.
    const header=card.querySelector('.section-title,.eyebrow,h2,h3');
    if(!header)return;
    const headerContainer=[...card.children].find(child=>child===header||child.contains(header))||header;
    const body=document.createElement('div');
    body.className='lani-card-body';
    [...card.children].filter(node=>node!==headerContainer).forEach(node=>body.append(node));
    if(!body.childElementCount)return;
    const bodyId=`laniCardBody${index}`;
    body.id=bodyId;
    const toggle=document.createElement('button');
    toggle.type='button';
    toggle.className='lani-card-toggle';
    toggle.setAttribute('aria-expanded','true');
    toggle.setAttribute('aria-controls',bodyId);
    toggle.innerHTML='<span>Collapse</span><b aria-hidden="true">⌃</b>';
    headerContainer.append(toggle);
    toggle.addEventListener('click',()=>{
      const open=toggle.getAttribute('aria-expanded')==='true';
      toggle.setAttribute('aria-expanded',String(!open));
      toggle.querySelector('span').textContent=open?'Expand':'Collapse';
      toggle.querySelector('b').textContent=open?'⌄':'⌃';
      body.hidden=open;
      card.classList.toggle('is-collapsed',open);
    });
    card.dataset.laniCollapsible='true';
    card.append(body);
  });
}

function leaveTheme(){
  document.body.classList.remove('lani-independent-theme');
  document.querySelector('.sidebar')?.removeAttribute('style');
  document.querySelector('.topbar')?.removeAttribute('style');
  delete document.documentElement.dataset.laniTheme;
  delete document.documentElement.dataset.laniExperience;
  draftTheme=null;draftExperience=null;studioClosed=false;
}

function setStudioVisibility(){
  const studio=document.querySelector('#laniThemeStudio');
  const experiences=document.querySelector('#laniExperienceStudio');
  const opener=document.querySelector('#openLaniAtmosphere');
  [studio,experiences].forEach(node=>{if(node)node.hidden=studioClosed});
  if(opener)opener.hidden=!studioClosed;
}

function mountThemeStudio(){
  const page=document.querySelector('.lani-page');
  if(!page||document.querySelector('#laniThemeStudio'))return;
  const current=draftValues();
  page.querySelector('.lani-head')?.insertAdjacentHTML('beforeend','<div class="lani-head-actions"><button id="openLaniAtmosphere" class="btn ghost" type="button" hidden>Edit atmosphere</button></div>');
  mountHiddenKey();
  page.querySelector('.lani-head')?.insertAdjacentHTML('afterend',`<section id="laniThemeStudio" class="lani-theme-studio" aria-labelledby="laniThemeTitle"><div class="lani-theme-studio-head"><div class="lani-theme-intro"><div class="eyebrow">Lani’s own little world</div><h2 id="laniThemeTitle">Choose her atmosphere</h2><p>Preview an original high-resolution world for Lani’s Corner. Her cards sit directly on the selected artwork.</p></div><div class="lani-studio-tools"><span id="laniAtmosphereStatus" class="lani-save-status">${isDirty()?'Previewing — save when it feels right':'Saved for this little world'}</span><button id="saveLaniAtmosphere" class="btn" type="button" ${isDirty()?'':'disabled'}>Save</button><button id="closeLaniAtmosphere" class="icon-button" type="button" aria-label="Close atmosphere chooser">×</button></div></div><div class="lani-theme-options">${Object.entries(LANI_THEMES).map(([id,t])=>`<button class="lani-theme-option ${id===current.theme?'selected':''}" data-lani-theme-choice="${id}" aria-pressed="${id===current.theme}"><span class="lani-theme-art lani-art-${id}" style="background-image:url('${t.art}')" aria-hidden="true"><span></span></span><span class="lani-theme-option-copy"><strong>${t.label}</strong><small>${t.description}</small><span class="lani-theme-badge">${t.badge}</span></span></button>`).join('')}</div></section><section id="laniExperienceStudio" class="lani-experience-studio" aria-labelledby="laniExperienceTitle"><div class="lani-experience-head"><div><div class="eyebrow">Her kid-friendly visual voice</div><h2 id="laniExperienceTitle">Choose her typography + experience</h2><p>Every Lani theme can use any of these three options. The choice is saved independently for each world.</p></div><div id="laniExperiencePreview" class="lani-experience-preview" data-lani-theme="${current.theme}" data-lani-experience="${current.experience}" style="background-image:url('${LANI_THEMES[current.theme].art}')"><div class="lani-experience-preview-card"><span class="eyebrow">Lulu’s little atelier</span><strong>Lani’s big imagination</strong><small>Cards, memories, recipes, and play ideas in one joyful place.</small><i>Kiki is supervising.</i></div></div></div><div class="lani-experience-options">${Object.entries(LANI_EXPERIENCES).map(([id,t])=>`<button class="lani-experience-option ${id===current.experience?'selected':''}" data-lani-experience-choice="${id}" aria-pressed="${id===current.experience}"><span class="lani-experience-sample lani-experience-${id}">Aa</span><span><strong>${t.label}</strong><small>${t.description}</small><em>${t.badge}</em></span></button>`).join('')}</div></section>`);

  page.querySelectorAll('[data-lani-theme-choice]').forEach(button=>button.onclick=()=>{
    draftTheme=button.dataset.laniThemeChoice;
    draftExperience=savedExperience(draftTheme);
    applyTheme(draftTheme,draftExperience);
  });
  page.querySelectorAll('[data-lani-experience-choice]').forEach(button=>button.onclick=()=>{
    draftExperience=button.dataset.laniExperienceChoice;
    applyTheme(draftValues().theme,draftExperience);
  });
  document.querySelector('#saveLaniAtmosphere')?.addEventListener('click',()=>{
    const d=draftValues();
    store.mutate(data=>{
      data.laniTheme=d.theme;
      data.laniExperienceByTheme={...(data.laniExperienceByTheme||{}),[d.theme]:d.experience};
    });
    draftTheme=d.theme;draftExperience=d.experience;applyTheme(d.theme,d.experience);
  });
  document.querySelector('#closeLaniAtmosphere')?.addEventListener('click',()=>{
    draftTheme=null;draftExperience=null;applyTheme(savedTheme(),savedExperience());studioClosed=true;setStudioVisibility();
  });
  document.querySelector('#openLaniAtmosphere')?.addEventListener('click',()=>{studioClosed=false;draftTheme=savedTheme();draftExperience=savedExperience();setStudioVisibility();applyTheme(draftTheme,draftExperience)});
  setStudioVisibility();
}

export function enhanceSprint6D(id){
  if(id!=='lani'){leaveTheme();return}
  if(draftTheme===null)draftTheme=savedTheme();
  if(draftExperience===null)draftExperience=savedExperience(draftTheme);
  mountThemeStudio();
  mountLaniDisclosures();
  applyTheme(draftTheme,draftExperience);
  const badge=document.querySelector('#kcBuildStatus b');
  if(badge)badge.textContent='Sprint 6D · Lani’s Corner Atelier';
}
