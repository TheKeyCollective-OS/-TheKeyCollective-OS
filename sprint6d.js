import {store} from './store.js';

const LANI_THEMES={
  safari:{label:'Safari Storybook',description:'A curious expedition of fossils, footprints, and friendly discoveries.',badge:'Explore together',art:'assets/lani/safari-storybook-approved-v2.png',portraitArt:'assets/lani/safari-storybook-approved-v2.png',desktopArt:'assets/lani/responsive/safari-desktop-v1.webp',tabletArt:'assets/lani/responsive/safari-tablet-v1.webp',phoneArt:'assets/lani/responsive/safari-phone-v1.webp',frameArt:'assets/lani/portrait-frame-footprint-clean.png',portraitPhoto:'assets/lani/lani-memory-01.jpeg',portraitAlt:'Lani outdoors in her blue dress',companionArt:'assets/lani/companion-safari-dinosaur-cutout-v2.png'},
  monsters:{label:'Friendly Monster Neighborhood',description:'A soft, colorful little community where every creature is a friend.',badge:'Everyone belongs',art:'assets/lani/friendly-monster-neighborhood-approved-v3.png',portraitArt:'assets/lani/friendly-monster-neighborhood-approved-v3.png',desktopArt:'assets/lani/responsive/monsters-desktop-v1.webp',tabletArt:'assets/lani/responsive/monsters-tablet-v1.webp',phoneArt:'assets/lani/responsive/monsters-phone-v1.webp',frameArt:'assets/lani/portrait-frame-cloud-complete-v3.png',portraitPhoto:'assets/lani/lani-preview-portrait.jpeg',portraitAlt:'Lani smiling in her yellow shirt',companionArt:'assets/lani/companion-friendly-monster-cutout-v2.png'},
  dollhouse:{label:'Dollhouse Dress-Up Atelier',description:'A luxe little beauty salon for dress-up, pretend play, and polished make-believe.',badge:'Dress-up atelier',art:'assets/lani/dollhouse-dressup-atelier-vertical-brown-mannequin.png',portraitArt:'assets/lani/dollhouse-dressup-atelier-vertical-brown-mannequin.png',desktopArt:'assets/lani/responsive/dollhouse-desktop-v1.webp',tabletArt:'assets/lani/responsive/dollhouse-tablet-v1.webp',phoneArt:'assets/lani/responsive/dollhouse-phone-v1.webp',frameArt:'assets/lani/portrait-frame-royal.png',portraitPhoto:'assets/lani/lani-memory-04.jpeg',portraitAlt:'Lani dressed up with her bright pink bow',companionArt:'assets/lani/companion-dollhouse-doll-cutout-v2.png'}
};

const LANI_EXPERIENCES={
  storybook:{label:'Dreamy Storybook',description:'Soft serif lettering, sweet spacing, and a gentle chapter-book rhythm.',badge:'Soft · Sweet · Gentle',accent:'#b28b55'},
  wonder:{label:'Wonder Blocks Atelier',description:'Playful dimensional lettering with a warm, tactile atelier finish.',badge:'Playful · Luxurious · Warm',accent:'#d86f8f'},
  atelier:{label:'Modern Playhouse',description:'Clean, bright type with confident shapes and a polished playroom pulse.',badge:'Clean · Bright · Bold',accent:'#5c9ea2'}
};

const LANI_THEME_EXPERIENCE={safari:'atelier',monsters:'wonder',dollhouse:'storybook'};

const LANI_THEME_COPY={
  monsters:{eyebrow:'Her wonderfully wild little world',subtitle:'A joyful memory neighborhood for big imagination, brave ideas, favorite moments, and every kind of friend.'},
  safari:{eyebrow:'Her storybook expedition',subtitle:'A living adventure book for discoveries, milestones, curious questions, and growing-up magic.'},
  dollhouse:{eyebrow:'Her beautiful little world',subtitle:'A living memory book for favorites, milestones, practical details, and growing-up magic.'}
};

const LANI_THEME_COMPANIONS={
  safari:{label:'a cardboard safari dinosaur'},
  monsters:{label:'a friendly neighborhood monster'},
  dollhouse:{label:'a beautiful Black doll'}
};

const LANI_PREVIEW_PHOTOS=[
  'assets/lani/lani-preview-portrait.jpeg',
  'assets/lani/lani-memory-01.jpeg',
  'assets/lani/lani-memory-02.jpeg',
  'assets/lani/lani-memory-03.jpeg',
  'assets/lani/lani-memory-04.jpeg',
  'assets/lani/lani-memory-05.jpeg'
];

const LANI_FRAMES={
  monsters:{label:'Friendly Monster',detail:'Playful · Cozy · Colorful'},
  safari:{label:'Safari Explorer',detail:'Adventurous · Wild · Earthy'},
  dollhouse:{label:'Dollhouse Chic',detail:'Stylish · Sweet · Sophisticated'}
};

let draftTheme=null;
let draftExperience=null;
let studioClosed=false;
let experienceClosed=false;
let draftFrame=null;

function savedTheme(){return store.get().laniTheme||'safari'}
function experienceMap(){return store.get().laniExperienceByTheme||{}}
function savedExperience(theme=savedTheme()){return LANI_THEME_EXPERIENCE[theme]||'storybook'}
function ensureAtmosphereTypographyPairing(){
  const data=store.get();
  if(data.laniAtmosphereTypographyPairingVersion===2)return;
  store.mutate(next=>{
    next.laniExperienceByTheme={...(next.laniExperienceByTheme||{}),...LANI_THEME_EXPERIENCE};
    next.laniAtmosphereTypographyPairingVersion=2;
  });
}
function draftValues(){
  const theme=draftTheme||savedTheme();
  return {theme,experience:LANI_THEME_EXPERIENCE[theme]||'storybook'};
}
function isDirty(){return draftValues().theme!==savedTheme()}
function isExperienceDirty(){return false}

function applyTheme(theme=draftValues().theme,experience=draftValues().experience){
  if(!LANI_THEMES[theme])theme='safari';
  experience=LANI_THEME_EXPERIENCE[theme]||'storybook';
  document.documentElement.dataset.laniTheme=theme;
  document.documentElement.dataset.laniExperience=experience;
  document.documentElement.style.setProperty('--lani-art-portrait',`url("${LANI_THEMES[theme].portraitArt}")`);
  document.documentElement.style.setProperty('--lani-art-landscape',`url("${LANI_THEMES[theme].art}")`);
  // Each device class gets an art-directed composition of the same approved
  // world, rather than stretching or cropping one source across every screen.
  document.documentElement.style.setProperty('--lani-art-desktop',`url("${LANI_THEMES[theme].desktopArt}")`);
  document.documentElement.style.setProperty('--lani-art-tablet',`url("${LANI_THEMES[theme].tabletArt}")`);
  document.documentElement.style.setProperty('--lani-art-phone',`url("${LANI_THEMES[theme].phoneArt}")`);
  document.body.classList.add('lani-independent-theme');
  document.querySelector('.topbar')?.setAttribute('data-lani-shell-theme',theme);
  document.querySelector('.sidebar')?.setAttribute('data-lani-shell-theme',theme);
  const shellTop=document.querySelector('.topbar');
  if(shellTop){
    const shell={safari:['#2d4d43','#fff6df','#e6bd65'],monsters:['#703867','#fff7fb','#f3d37c'],dollhouse:['#6b364b','#fff4f5','#f1cf83']}[theme]||['#6b364b','#fff4f5','#f1cf83'];
    shellTop.style.setProperty('background',shell[0],'important');
    shellTop.style.setProperty('color',shell[1],'important');
    shellTop.style.setProperty('border-color',shell[2],'important');
  }
  const page=document.querySelector('.lani-page');
  if(page){
    page.dataset.laniTheme=theme;
    page.dataset.laniExperience=experience;
    const themeCopy=LANI_THEME_COPY[theme]||LANI_THEME_COPY.safari;
    const pageEyebrow=page.querySelector('.lani-head .eyebrow');
    const pageSubtitle=page.querySelector('.lani-head .sub');
    if(pageEyebrow)pageEyebrow.textContent=themeCopy.eyebrow;
    if(pageSubtitle)pageSubtitle.textContent=themeCopy.subtitle;
    page.querySelectorAll('[data-lani-theme-choice]').forEach(button=>{
      const active=button.dataset.laniThemeChoice===theme;
      button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));
      const art=button.querySelector('.lani-theme-art');
      if(art){
        const choice=LANI_THEMES[button.dataset.laniThemeChoice]||LANI_THEMES.safari;
        art.style.backgroundImage=`url("${choice.portraitArt}")`;
      }
    });
    page.querySelectorAll('[data-lani-experience-choice]').forEach(button=>{
      const active=button.dataset.laniExperienceChoice===experience;
      button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));
    });
    const saved=document.querySelector('#laniAtmosphereStatus');
    if(saved)saved.textContent=isDirty()?'Previewing — save when it feels right':'Saved for this little world';
     const save=document.querySelector('#saveLaniAtmosphere');
     if(save)save.disabled=!isDirty();
     const experienceStatus=document.querySelector('#laniExperienceStatus');
     if(experienceStatus)experienceStatus.textContent=isExperienceDirty()?'Previewing - save when it feels right':'Saved for this little world';
     const experienceSave=document.querySelector('#saveLaniExperience');
     if(experienceSave)experienceSave.disabled=!isExperienceDirty();
    const preview=document.querySelector('#laniExperiencePreview');
    if(preview){
      preview.dataset.laniTheme=theme;
      preview.dataset.laniExperience=experience;
      preview.dataset.laniFrame=theme;
       preview.dataset.laniCompanion=theme;
       preview.style.backgroundImage=`url("${LANI_THEMES[theme].portraitArt}")`;
       const companion=preview.querySelector('#laniPreviewCompanion');
       if(companion){
         const character=LANI_THEME_COMPANIONS[theme]||LANI_THEME_COMPANIONS.safari;
         companion.src=LANI_THEMES[theme].companionArt;
         companion.alt=`${character.label} preview`;
       }
       const frame=preview.querySelector('#laniPortraitFrame');
       if(frame){
         frame.src=LANI_THEMES[theme].frameArt;
         frame.alt=`${LANI_THEMES[theme].label} portrait frame`;
       }
       const portrait=preview.querySelector('#laniGalleryHero');
       if(portrait){
         portrait.src=LANI_THEMES[theme].portraitPhoto;
         portrait.alt=LANI_THEMES[theme].portraitAlt;
       }
       preview.classList.remove('is-transitioning');
       requestAnimationFrame(()=>preview.classList.add('is-transitioning'));
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
    // Give every card a stable art slot so each atmosphere can rotate several
    // purpose-built ornaments instead of repeating one character cluster.
    card.dataset.laniCardVariant=String((index%3)+1);
    if(card.classList.contains('lani-hero')||card.dataset.laniCollapsible)return;
    const header=card.querySelector('.section-title,.eyebrow,h2,h3');
    if(!header)return;
    let headerContainer=[...card.children].find(child=>child===header||child.contains(header))||header;
    if(headerContainer===header&&header.matches('.eyebrow')&&header.nextElementSibling?.matches('h2,h3')){
      const titleGroup=document.createElement('div');
      titleGroup.className='lani-card-heading';
      card.insertBefore(titleGroup,header);
      titleGroup.append(header,header.nextElementSibling);
      headerContainer=titleGroup;
    }
    const body=document.createElement('div');
    body.className='lani-card-body';
    [...card.children].filter(node=>node!==headerContainer).forEach(node=>body.append(node));
    if(!body.childElementCount)return;
    const bodyId=`laniCardBody${index}`;
    body.id=bodyId;
    const toggle=document.createElement('button');
    toggle.type='button';
    toggle.className='lani-card-toggle';
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-controls',bodyId);
    toggle.innerHTML='<span>Open</span><b aria-hidden="true">+</b>';
    toggle.addEventListener('click',()=>{
      const willOpen=toggle.getAttribute('aria-expanded')!=='true';
      toggle.setAttribute('aria-expanded',String(willOpen));
      toggle.querySelector('span').textContent=willOpen?'Close':'Open';
      toggle.querySelector('b').textContent=willOpen?'−':'+';
      body.hidden=!willOpen;
      card.classList.toggle('is-collapsed',!willOpen);
    });
    body.hidden=true;
    card.dataset.laniCollapsible='true';
    card.classList.add('is-collapsed');
    card.append(body);
    card.append(toggle);
  });
}

function leaveTheme(){
  document.body.classList.remove('lani-independent-theme');
  const topbar=document.querySelector('.topbar');
  const sidebar=document.querySelector('.sidebar');
  topbar?.removeAttribute('data-lani-shell-theme');
  sidebar?.removeAttribute('data-lani-shell-theme');
  topbar?.style.removeProperty('background');
  topbar?.style.removeProperty('color');
  topbar?.style.removeProperty('border-color');
  delete document.documentElement.dataset.laniTheme;
  delete document.documentElement.dataset.laniExperience;
  document.documentElement.style.removeProperty('--lani-art-portrait');
  document.documentElement.style.removeProperty('--lani-art-landscape');
  document.documentElement.style.removeProperty('--lani-art-desktop');
  document.documentElement.style.removeProperty('--lani-art-tablet');
  document.documentElement.style.removeProperty('--lani-art-phone');
  draftTheme=null;draftExperience=null;draftFrame=null;studioClosed=false;experienceClosed=false;
}

function setStudioVisibility(){
  const studio=document.querySelector('#laniThemeStudio');
  const experiences=document.querySelector('#laniExperienceStudio');
  const atmosphereOpener=document.querySelector('#openLaniAtmosphere');
  const experienceOpener=document.querySelector('#openLaniExperience');
  if(studio)studio.hidden=studioClosed;
  if(experiences)experiences.hidden=experienceClosed;
  if(atmosphereOpener)atmosphereOpener.hidden=!studioClosed;
  if(experienceOpener)experienceOpener.hidden=!experienceClosed;
}

function enhanceLaniExperiencePanel(){
  const studio=document.querySelector('#laniExperienceStudio');
  if(!studio||studio.dataset.atelierEnhanced)return;
  studio.dataset.atelierEnhanced='1';
  if(!studio.querySelector('.lani-experience-actions')){
    studio.insertAdjacentHTML('afterbegin','<div class="lani-experience-actions"><span id="laniExperienceStatus" class="lani-save-status">Saved for this little world</span><button id="saveLaniExperience" class="btn" type="button" disabled>Save</button><button id="closeLaniExperience" class="icon-button" type="button" aria-label="Close typography and experience chooser">&#215;</button></div>');
  }
  const headActions=document.querySelector('.lani-head-actions');
  if(headActions&&!headActions.querySelector('#openLaniExperience'))headActions.insertAdjacentHTML('beforeend','<button id="openLaniExperience" class="btn ghost" type="button" hidden>Edit typography</button>');
  const head=studio.querySelector('.lani-experience-head');
  const eyebrow=head?.querySelector('.eyebrow');
  const title=head?.querySelector('h2');
  const intro=head?.querySelector('p');
  if(eyebrow)eyebrow.textContent='Little moments, beautifully kept';
  if(title)title.textContent='LANI’S PHOTO GALLERY';
  if(intro)intro.textContent='Her favorite smiles, stories, and growing-up magic in one joyful place.';
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
    if(sample)sample.innerHTML='<span>A</span><span>B</span><span>C</span>';
    if(strong)strong.textContent=optionCopy[id]?.[0]||strong.textContent;
    if(small)small.textContent=optionCopy[id]?.[1]||small.textContent;
  });
  studio.querySelector('.lani-experience-options')?.remove();
  studio.querySelector('#saveLaniExperience')?.remove();
  studio.querySelector('#laniExperienceStatus')?.remove();
  const galleryOpener=document.querySelector('#openLaniExperience');
  if(galleryOpener)galleryOpener.textContent='Open photo gallery';
  const preview=studio.querySelector('#laniExperiencePreview');
  if(preview){
    preview.classList.add('lani-live-preview');
    preview.innerHTML='<div class="lani-live-preview-kicker">FEATURED MEMORY</div><div class="lani-preview-stage"><figure class="lani-preview-photo" aria-label="Lani portrait preview"><img id="laniGalleryHero" src="assets/lani/lani-preview-portrait.jpeg" alt="Lani smiling in a yellow shirt"></figure><div class="lani-preview-copy"><div class="lani-preview-wordmark" aria-label="Lani">Lani</div><p><span aria-hidden="true">⚿</span> My mommy is my forever adventure. <span aria-hidden="true">♥</span></p><div class="lani-preview-rule"></div><h3>Today’s Little Memory</h3><small>We baked monster cookies, built the tallest tower, and laughed until the sun went to bed.</small><button class="btn lani-preview-memory" type="button">＋ Add a new memory</button></div><figure class="lani-preview-companion"><img id="laniPreviewCompanion" src="assets/lani/companion-safari-dinosaur.png" alt="A cardboard safari dinosaur preview"></figure></div><div class="lani-preview-filmstrip" aria-label="Lani memory snapshots">'+LANI_PREVIEW_PHOTOS.map((src,index)=>`<button class="lani-gallery-thumb ${index===0?'selected':''}" type="button" aria-label="Show Lani memory ${index+1}" aria-pressed="${index===0}"><img src="${src}" alt="Lani memory preview ${index+1}"></button>`).join('')+'</div>';
    const hero=preview.querySelector('#laniGalleryHero');
    if(hero){
      hero.classList.add('lani-preview-portrait');
      hero.insertAdjacentHTML('afterend','<img id="laniPortraitFrame" class="lani-portrait-frame" src="assets/lani/portrait-frame-footprint.png" alt="Safari Storybook portrait frame">');
    }
    preview.querySelectorAll('.lani-gallery-thumb').forEach(button=>button.addEventListener('click',()=>{
      const image=button.querySelector('img');
      if(hero&&image){hero.src=image.src;hero.alt=image.alt.replace('preview','featured memory')}
      preview.querySelectorAll('.lani-gallery-thumb').forEach(item=>{const active=item===button;item.classList.toggle('selected',active);item.setAttribute('aria-pressed',String(active))});
    }));
    const originalGallery=document.querySelector('.lani-collage-card');
    if(originalGallery){
      preview.querySelector('.lani-preview-filmstrip')?.remove();
      const vault=document.createElement('section');
      vault.className='lani-gallery-vault';
      vault.setAttribute('aria-label','Lani photo gallery and dashboard feature controls');
      const galleryTitle=originalGallery.querySelector('.section-title h3');
      if(galleryTitle)galleryTitle.textContent='Lani’s Living Photo Gallery';
      [...originalGallery.children].forEach(node=>vault.append(node));
      preview.append(vault);
      originalGallery.remove();
    }
  }
  const select=studio.querySelector('#laniExperienceSelect');
  if(select){
    select.value=draftExperience||savedExperience();
    select.addEventListener('change',()=>{
      draftExperience=select.value;
      applyTheme(draftValues().theme,draftExperience);
    });
  }
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
       const character=LANI_THEME_COMPANIONS[theme]||LANI_THEME_COMPANIONS.safari;
       companion.innerHTML='<img id="laniPreviewCompanion" class="lani-preview-character" alt="">';
       const characterNode=companion.querySelector('#laniPreviewCompanion');
       characterNode.src=LANI_THEMES[theme].companionArt;
       characterNode.alt=`${character.label} preview`;
    }
  }
  document.querySelector('#saveLaniExperience')?.addEventListener('click',()=>{
    const d=draftValues();
    store.mutate(data=>{data.laniExperienceByTheme={...(data.laniExperienceByTheme||{}),[d.theme]:d.experience}});
    draftTheme=d.theme;draftExperience=d.experience;applyTheme(d.theme,d.experience);
  });
  document.querySelector('#closeLaniExperience')?.addEventListener('click',()=>{
    const theme=draftValues().theme;
    draftExperience=savedExperience(theme);
    applyTheme(theme,draftExperience);
    experienceClosed=true;
    setStudioVisibility();
  });
  document.querySelector('#openLaniExperience')?.addEventListener('click',()=>{
    experienceClosed=false;
    draftTheme=draftTheme||savedTheme();
    draftExperience=draftExperience||savedExperience(draftTheme);
    setStudioVisibility();
    applyTheme(draftTheme,draftExperience);
  });
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
    draftExperience=LANI_THEME_EXPERIENCE[draftTheme]||'storybook';
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
      data.laniExperienceByTheme={...(data.laniExperienceByTheme||{}),...LANI_THEME_EXPERIENCE};
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
  // A slow Lani render may finish after navigation. Never allow that stale
  // enhancement to apply Lani's theme to the page that replaced it.
  if(!document.querySelector('.lani-page')){leaveTheme();return}
  ensureAtmosphereTypographyPairing();
  if(draftTheme===null)draftTheme=savedTheme();
  if(draftExperience===null)draftExperience=savedExperience(draftTheme);
  mountThemeStudio();
  enhanceLaniExperiencePanel();
  mountLaniDisclosures();
  applyTheme(draftTheme,draftExperience);
  const badge=document.querySelector('#kcBuildStatus b');
  if(badge)badge.textContent='Sprint 6D · Lani’s Corner Atelier';
}
