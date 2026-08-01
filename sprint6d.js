import {store} from './store.js';

const LANI_THEMES={
  safari:{label:'Safari Storybook',description:'A curious expedition of fossils, footprints, and friendly discoveries.',badge:'Explore together',art:'assets/lani/safari-storybook-expedition.png',portraitArt:'assets/lani/safari-storybook-expedition-vertical.png'},
  monsters:{label:'Friendly Monster Neighborhood',description:'A soft, colorful little community where every creature is a friend.',badge:'Everyone belongs',art:'assets/lani/friendly-monster-neighborhood.png',portraitArt:'assets/lani/friendly-monster-neighborhood-vertical.png'},
  dollhouse:{label:'Dollhouse Dress-Up Atelier',description:'A luxe little beauty salon for dress-up, pretend play, and polished make-believe.',badge:'Dress-up atelier',art:'assets/lani/dollhouse-dressup-atelier.png',portraitArt:'assets/lani/dollhouse-dressup-atelier-vertical.png'}
};

const LANI_EXPERIENCES={
  storybook:{label:'Dreamy Storybook',description:'Soft serif lettering, sweet spacing, and a gentle chapter-book rhythm.',badge:'Soft · Sweet · Gentle',accent:'#b28b55'},
  wonder:{label:'Wonder Blocks Atelier',description:'Playful dimensional lettering with a warm, tactile atelier finish.',badge:'Playful · Luxurious · Warm',accent:'#d86f8f'},
  atelier:{label:'Modern Playhouse',description:'Clean, bright type with confident shapes and a polished playroom pulse.',badge:'Clean · Bright · Bold',accent:'#5c9ea2'}
};

const LANI_FRAMES={
  monsters:{label:'Friendly Monster',detail:'Playful · Cozy · Colorful'},
  safari:{label:'Safari Explorer',detail:'Adventurous · Wild · Earthy'},
  dollhouse:{label:'Dollhouse Chic',detail:'Stylish · Sweet · Sophisticated'}
};

let draftTheme=null;
let draftExperience=null;
let studioClosed=false;
let draftFrame=null;

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
    if(preview){
      preview.dataset.laniTheme=theme;
      preview.dataset.laniExperience=experience;
      preview.dataset.laniFrame=theme;
      preview.dataset.laniCompanion=theme;
      preview.style.backgroundImage=`url("${LANI_THEMES[theme].art}")`;
    }
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
  draftTheme=null;draftExperience=null;draftFrame=null;studioClosed=false;
}

function setStudioVisibility(){
  const studio=document.querySelector('#laniThemeStudio');
  const experiences=document.querySelector('#laniExperienceStudio');
  const opener=document.querySelector('#openLaniAtmosphere');
  [studio,experiences].forEach(node=>{if(node)node.hidden=studioClosed});
  if(opener)opener.hidden=!studioClosed;
}

function enhanceLaniExperiencePanel(){
  const studio=document.querySelector('#laniExperienceStudio');
  if(!studio||studio.dataset.atelierEnhanced)return;
  studio.dataset.atelierEnhanced='1';
  const head=studio.querySelector('.lani-experience-head');
  const eyebrow=head?.querySelector('.eyebrow');
  const title=head?.querySelector('h2');
  const intro=head?.querySelector('p');
  if(eyebrow)eyebrow.textContent='Lani’s typography & experience';
  if(title)title.textContent='LANI’S TYPOGRAPHY & EXPERIENCE';
  if(intro)intro.textContent='Choose a complete visual experience for Lani’s Corner.';
  head?.querySelector('.lani-experience-picker')?.remove();
  const optionCopy={
    storybook:['Dreamy Storybook','Soft · Sweet · Gentle'],
    wonder:['Wonder Blocks Atelier','Playful · Luxurious · Warm'],
    atelier:['Modern Playhouse','Clean · Bright · Bold']
  };
  studio.querySelectorAll('[data-lani-experience-choice]').forEach(button=>{
    const id=button.dataset.laniExperienceChoice;
    const sample=button.querySelector('.lani-experience-sample');
    const strong=button.querySelector('strong');
    const small=button.querySelector('small');
    if(sample)sample.textContent='ABC';
    if(strong)strong.textContent=optionCopy[id]?.[0]||strong.textContent;
    if(small)small.textContent=optionCopy[id]?.[1]||small.textContent;
  });
  const preview=studio.querySelector('#laniExperiencePreview');
  if(preview){
    preview.classList.add('lani-live-preview');
    preview.innerHTML='<div class="lani-live-preview-kicker">LIVE PREVIEW</div><div class="lani-preview-stage"><div class="lani-preview-photo" aria-label="Lani portrait preview"><span>Lani</span></div><div class="lani-preview-copy"><div class="lani-preview-wordmark">Lani</div><p>My mommy is my forever adventure. <span aria-hidden="true">♥</span></p><div class="lani-preview-rule"></div><h3>Today’s Little Memory</h3><small>We baked monster cookies, built the tallest tower, and laughed until the sun went to bed.</small><button class="btn lani-preview-memory" type="button">＋ Add a new memory</button></div><div class="lani-preview-companion" aria-hidden="true">✦</div></div><div class="lani-frame-options" role="group" aria-label="Companion and portrait frame"><div class="lani-frame-label">COMPANION &amp; PORTRAIT FRAME</div><div class="lani-frame-grid">'+Object.entries(LANI_FRAMES).map(([id,frame])=>`<button class="lani-frame-option" type="button" data-lani-frame-choice="${id}"><span class="lani-frame-swatch lani-frame-${id}">${id==='monsters'?'♥':id==='safari'?'✦':'✿'}</span><span><strong>${frame.label}</strong><small>${frame.detail}</small></span></button>`).join('')+'</div></div>';
  }
  const select=studio.querySelector('#laniExperienceSelect');
  if(select){
    select.value=draftExperience||savedExperience();
    select.addEventListener('change',()=>{
      draftExperience=select.value;
      applyTheme(draftValues().theme,draftExperience);
    });
  }
  studio.querySelectorAll('[data-lani-frame-choice]').forEach(button=>button.addEventListener('click',()=>{
    draftFrame=button.dataset.laniFrameChoice;
    studio.querySelectorAll('[data-lani-frame-choice]').forEach(item=>item.classList.toggle('selected',item===button));
    if(preview)preview.dataset.laniFrame=draftFrame;
  }));
  const active=studio.querySelector(`[data-lani-frame-choice="${draftFrame||'monsters'}"]`)||studio.querySelector('[data-lani-frame-choice="monsters"]');
  if(active){draftFrame=active.dataset.laniFrameChoice;active.classList.add('selected');if(preview)preview.dataset.laniFrame=draftFrame}
  // The portrait frame is intentionally atmospheric, not a separate choice.
  // Keep the three typography cards as the only experience controls.
  studio.querySelector('.lani-frame-options')?.remove();
  studio.querySelector('.lani-experience-picker')?.remove();
  if(preview){
    const theme=preview.dataset.laniTheme||savedTheme();
    preview.dataset.laniFrame=theme;
    preview.dataset.laniCompanion=theme;
    const companion=preview.querySelector('.lani-preview-companion');
    if(companion){
      companion.setAttribute('role','img');
      companion.setAttribute('aria-label',`${LANI_THEMES[theme]?.label||'Lani'} companion`);
      companion.innerHTML='<span aria-hidden="true"></span>';
    }
  }
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
    const select=document.querySelector('#laniExperienceSelect');
    if(select)select.value=draftExperience;
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
  enhanceLaniExperiencePanel();
}

export function enhanceSprint6D(id){
  if(id!=='lani'){leaveTheme();return}
  if(draftTheme===null)draftTheme=savedTheme();
  if(draftExperience===null)draftExperience=savedExperience(draftTheme);
  mountThemeStudio();
  enhanceLaniExperiencePanel();
  mountLaniDisclosures();
  applyTheme(draftTheme,draftExperience);
  const badge=document.querySelector('#kcBuildStatus b');
  if(badge)badge.textContent='Sprint 6D · Lani’s Corner Atelier';
}
