import {store} from './store.js';

const BUILD='Sprint 6B.49 Luxury Compression';
const collectionNameOverrides={pearl:'Pearl Champagne Couture',blackberry:'Blackberry Deco',ruby:'Garnet Jewel Mosaic',rose:'Rose Tweed',amethyst:'Amethyst Cheetah',sapphire:'Sapphire Stardust',emerald:'Emerald Crocodile',teal:'Teal Glass',copper:'Copper Chainmail',espresso:'Espresso Houndstooth',onyx:'Onyx Bandana',silver:'Platinum Deco Brocade'};

const collectionGuides={
  pearl:{name:'Pearl Champagne',mood:'Quiet radiance',intro:'A luminous pearl foundation with champagne hardware and a soft editorial glow.',palette:['#fbf5ea','#e6d0a5','#6b4d35'],material:'Pearl wash · satin sheen',type:'Editorial serif',motion:'Slow light sweep',cards:'Pearl glass'},
  blackberry:{name:'Blackberry Stripe',mood:'Tailored after-hours',intro:'Velvet plum, a precise diagonal stripe, and warm gold for a polished evening desk.',palette:['#24142e','#542a60','#d6b16a'],material:'Velvet stripe · lacquer edge',type:'High-contrast editorial',motion:'Measured drift',cards:'Plum lacquer'},
  ruby:{name:'Ruby Lacquer',mood:'Jewel confidence',intro:'A high-gloss ruby room with reflected light and a darker garnet anchor—not sugary, never flat.',palette:['#5b0f1c','#a93245','#e2b57a'],material:'Lacquer · garnet reflection',type:'Confident display serif',motion:'Polished glint',cards:'Garnet glass'},
  rose:{name:'Rose Couture Tweed',mood:'Soft power',intro:'A grown-up rose built from woven texture, blush depth, and a restrained couture shimmer.',palette:['#6d273f','#c2758b','#f7e6e7'],material:'Couture tweed · blush silk',type:'Soft feminine editorial',motion:'Gentle fabric lift',cards:'Blush pearl'},
  amethyst:{name:'Amethyst Cheetah',mood:'Playful opulence',intro:'Violet depth, moving cheetah energy, and enough contrast for Kiki to bring the attitude.',palette:['#24102e','#6c2f86','#e0b3ff'],material:'Cheetah sheen · violet lacquer',type:'Expressive fashion serif',motion:'Cheetah shimmer',cards:'Amethyst glass'},
  sapphire:{name:'Sapphire Stardust',mood:'Midnight brilliance',intro:'A deep blue jewel sky with stardust highlights and a calm, cinematic sense of space.',palette:['#081b39','#1e5f9c','#f0d48e'],material:'Starfield · faceted glass',type:'Modern display serif',motion:'Orbiting sparkle',cards:'Midnight glass'},
  emerald:{name:'Emerald Crocodile',mood:'Heritage polish',intro:'A jewel-green lacquer inspired by heirloom leather goods, with sculpted tonal depth and quiet gold.',palette:['#0c392b','#167d5b','#e6c880'],material:'Crocodile lacquer · brushed gold',type:'Classic luxury serif',motion:'Lacquer ripple',cards:'Emerald leather'},
  teal:{name:'Teal Murano',mood:'Art-glass calm',intro:'Layered teal translucence with cool highlights and a gallery-like sense of movement.',palette:['#073c40','#1b8284','#d7c78b'],material:'Murano glass · translucent wave',type:'Clean modern serif',motion:'Glass refraction',cards:'Teal glass'},
  copper:{name:'Copper Chainmail',mood:'Sculptural warmth',intro:'Burnished copper woven through espresso shadow for an artful, tactile atmosphere.',palette:['#5d2b1b','#b66d43','#f1c18b'],material:'Copper chainmail · satin fold',type:'Modern editorial',motion:'Metallic sweep',cards:'Copper mesh'},
  espresso:{name:'Espresso Houndstooth',mood:'Executive tailoring',intro:'Deep coffee tailoring, cream typography, and a houndstooth rhythm that feels made for a private office.',palette:['#21140e','#6a4430','#f3e3c8'],material:'Leather grain · houndstooth',type:'Executive serif',motion:'Tailored parallax',cards:'Coffee leather'},
  onyx:{name:'Onyx Bandana',mood:'Graphic drama',intro:'Black-and-white bandana silk with a crisp rhythm, softened by one precise champagne accent.',palette:['#0b0b0c','#f7f2e9','#c8a768'],material:'Bandana silk · ink contrast',type:'Urban editorial',motion:'Silk shift',cards:'Onyx satin'},
  silver:{name:'Platinum Deco Brocade',mood:'Sculpted brilliance',intro:'Pearl silver, deco geometry, and key-shaped details for a cool couture finish.',palette:['#59616b','#d9dee3','#f2d59d'],material:'Deco brocade · liquid pearl',type:'Minimal modern',motion:'Art-deco glimmer',cards:'Platinum pearl'}
};

function collectionGuideMarkup(theme){
  const source=collectionGuides[theme]||collectionGuides.pearl;
  const guide={...source,name:collectionNameOverrides[theme]||source.name};
  return `<div class="collection-guide-6b49" data-collection-guide="${theme}"><div class="collection-guide-head-6b49"><div><div class="eyebrow">Collection guide</div><h3>${guide.name}<span>${guide.mood}</span></h3><p>${guide.intro}</p></div><div class="collection-guide-swatch-row-6b49">${guide.palette.map((color,index)=>`<span style="--guide-swatch:${color}" aria-label="Palette swatch ${index+1}"></span>`).join('')}<button type="button" class="btn collection-save-6b49" data-save-collection aria-label="Save ${guide.name} background">Save background</button><button type="button" class="atelier-close-6c collection-guide-close-6b49" data-close-atelier="collection" aria-label="Close color collection">×</button></div></div><div class="collection-guide-scroll-6b49"><div class="collection-guide-grid-6b49"><div><small>Material direction</small><strong>${guide.material}</strong></div><div><small>Typography voice</small><strong>${guide.type}</strong></div><div><small>Motion language</small><strong>${guide.motion}</strong></div><div><small>Card finish</small><strong>${guide.cards}</strong></div><div><small>Atelier note</small><p>Let this collection lead the room. Keep the supporting controls quiet, let the selected type carry the hierarchy, and give the texture enough space to read as intentional.</p></div><div><small>Built for every page</small><p>Card surfaces, controls, borders, navigation, and companion dialogue follow the same collection voice while the page canvas stays calm.</p></div></div></div><div class="collection-guide-foot-6b49"><span>Gold rail · scroll for the full direction</span><b>Background only · Global Card Collection stays separate</b></div></div>`;
}

function normalizeCollectionNames(){
  document.querySelectorAll('[data-s5-theme]').forEach(card=>{
    const label=collectionNameOverrides[card.dataset.s5Theme];
    const title=card.querySelector('.theme-copy strong');
    if(label&&title)title.textContent=label;
  });
  const guide=document.querySelector('.collection-guide-6b49');
  const guideTitle=guide?.querySelector('h3');
  const guideName=collectionNameOverrides[guide?.dataset.collectionGuide];
  if(guideTitle&&guideName&&guideTitle.firstChild)guideTitle.firstChild.nodeValue=guideName;
}

function findCardByHeading(title){
  return [...document.querySelectorAll('#page article,#page section')]
    .find(element=>element.querySelector('h2,h3')?.textContent.trim()===title);
}

function disclose(element,title,description,{open=false,className=''}={}){
  if(!element||element.closest('.luxury-disclosure-6b49'))return;
  const details=document.createElement('details');
  details.className=`luxury-disclosure-6b49 ${className}`.trim();
  details.open=open;
  const summary=document.createElement('summary');
  summary.innerHTML=`<span><strong>${title}</strong><small>${description}</small></span><span class="disclosure-action-6b49" aria-hidden="true">Open</span>`;
  element.before(details);
  details.append(summary,element);
}

function cleanupEmptyDisclosures(){
  document.querySelectorAll('#page .luxury-disclosure-6b49').forEach(details=>{
    if(![...details.children].some(child=>child.tagName!=='SUMMARY'))details.remove();
  });
}

function condenseDashboard(){
  disclose(document.querySelector('#page .module-grid'),'Open a studio','All spaces remain one tap away.',{className:'dashboard-studios-6b49'});
}

function condenseAgenda(){
  disclose(document.querySelector('#page .kc45-google'),'Calendar connection & events','Sync calendars or create and edit Google events when you need them.',{className:'agenda-tools-6b49'});
  disclose(document.querySelector('#page .agenda-editor-card-6b13'),'Selected-day details','Add plans, preparation notes, and directions for one date.',{className:'agenda-tools-6b49'});
}

function condenseMoney(){
  disclose(findCardByHeading('Forecast assumptions'),'Forecast setup','Adjust income and flexible spending assumptions.',{className:'money-tools-6b49'});
  disclose(document.querySelector('#page .bill-import-card'),'Import bills','Paste a prepared list when you want to add several bills at once.',{className:'money-tools-6b49'});
}

function condenseWellness(){
  disclose(findCardByHeading('Fitness tools'),'Fitness shortcuts','Open your connected fitness services.',{className:'wellness-tools-6b49'});
  disclose(findCardByHeading('Sobriety Tracker'),'Sobriety tracker','View or manage this private wellness milestone.',{className:'wellness-tools-6b49'});
}

function condenseIntelligence(){
  disclose(document.querySelector('#page .kc44-intel'),'Intelligence workspace','Open watchlists, saved research, decision journals, and briefings.',{className:'intelligence-tools-6b49'});
}

function atelierDraft(studio){try{return studio.dataset.pendingDesign?JSON.parse(studio.dataset.pendingDesign):{}}catch{return {}}}
function setAtelierDraft(studio,changes){studio.dataset.pendingDesign=JSON.stringify({...atelierDraft(studio),...changes})}
function syncTypographyAtelier(){
  const studio=document.querySelector('.typography-experience-6c');
  if(!studio)return;
  const saved=store.get().design||{},design={...saved,...atelierDraft(studio)},packMeta={executive:['A a','Executive','Confident decisions shape extraordinary outcomes.'],modern:['Aa','Modern','Clear systems make room for better decisions.'],editorial:['Aa','Editorial','A considered point of view changes the room.'],classic:['Aa','Classic','A timeless voice, polished for the present.'],minimal:['Aa','Minimal','Less noise. More signal. More intention.'],feminine:['Aa','Soft Feminine','Softness can still hold the line.'],urban:['Aa','Urban','Make the message impossible to miss.']},meta=packMeta[design.pack||'executive']||packMeta.executive;
  studio.dataset.pack=design.pack||'executive';studio.dataset.motion=design.motion||'standard';studio.dataset.cards=design.cards||'glass';studio.dataset.radius=design.radius||'classic';studio.dataset.textureChoice=design.texture||'clean';studio.dataset.tone=design.tone||'light';
  const setText=(selector,value)=>{const node=studio.querySelector(selector);if(node)node.textContent=value};
  setText('[data-experience-featured]',meta[1]);setText('[data-experience-glyph]',meta[0]);setText('[data-experience-title]',meta[1]);setText('[data-experience-line]',meta[2]);
  studio.querySelectorAll('[data-design-pack]').forEach(button=>button.classList.toggle('selected',button.dataset.designPack===(design.pack||'executive')));
  studio.querySelectorAll('[data-preview-choice]').forEach(button=>button.classList.toggle('selected',button.dataset.previewValue===(design[button.dataset.previewChoice]||button.dataset.previewValue)));
  studio.querySelectorAll('[data-tone-choice]').forEach(button=>button.classList.toggle('selected',button.dataset.toneChoice===(design.tone||'light')));
  [['s5Motion','motion'],['s5Cards','cards'],['s5Radius','radius'],['s5Texture','texture']].forEach(([id,key])=>{const select=studio.querySelector(`#${id}`);if(select)select.value=design[key]||select.value});
}

function bindTypographyAtelier(){
  const studio=document.querySelector('.typography-experience-6c');
  if(!studio||studio.dataset.atelierBound==='true')return;
  studio.dataset.atelierBound='true';
  studio.querySelectorAll('[data-design-pack]').forEach(button=>button.addEventListener('click',()=>{setAtelierDraft(studio,{pack:button.dataset.designPack,type:button.dataset.designPack});syncTypographyAtelier()}));
  studio.querySelectorAll('[data-preview-choice]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.previewChoice,value=button.dataset.previewValue;const select=studio.querySelector(`#s5${key==='radius'?'Radius':'Texture'}`);if(select)select.value=value;setAtelierDraft(studio,{[key]:value});syncTypographyAtelier()}));
  studio.querySelectorAll('[data-tone-choice]').forEach(button=>button.addEventListener('click',()=>{setAtelierDraft(studio,{tone:button.dataset.toneChoice});syncTypographyAtelier()}));
  [['s5Motion','motion'],['s5Cards','cards'],['s5Radius','radius'],['s5Texture','texture']].forEach(([id,key])=>studio.querySelector(`#${id}`)?.addEventListener('change',event=>{setAtelierDraft(studio,{[key]:event.target.value});syncTypographyAtelier()}));
  studio.querySelector('[data-save-atelier]')?.addEventListener('click',()=>{const draft=atelierDraft(studio),save=studio.querySelector('[data-save-atelier]');store.mutate(d=>{d.design={...(d.design||{}),...draft}});delete studio.dataset.pendingDesign;syncTypographyAtelier();if(save){const label=save.textContent;save.textContent='Saved';save.classList.add('is-saved');setTimeout(()=>{save.textContent=label;save.classList.remove('is-saved')},1600)}});
  window.addEventListener('kc:state',syncTypographyAtelier);
  syncTypographyAtelier();
}

function bindAtelierCloseControls(){
  const targets=[
    {selector:'#page .studio-section',key:'collection',label:'Open color collection'},
    {selector:'#page .typography-experience-6c',key:'type',label:'Open typography and experience packs'}
  ];
  targets.forEach(({selector,key,label})=>{
    const section=document.querySelector(selector);
    if(!section||section.dataset.atelierCloseBound==='true')return;
    section.dataset.atelierCloseBound='true';
    const close=section.querySelector(`[data-close-atelier="${key}"]`);
    if(!close)return;
    let reopen=document.querySelector(`[data-reopen-atelier="${key}"]`);
    if(!reopen){
      reopen=document.createElement('button');
      reopen.type='button';
      reopen.className='atelier-reopen-6c';
      reopen.dataset.reopenAtelier=key;
      reopen.textContent=label;
      section.before(reopen);
    }
    /* Delegate from the section so a refreshed collection guide keeps its close action. */
    section.addEventListener('click',event=>{
      const closeButton=event.target.closest(`[data-close-atelier="${key}"]`);
      if(!closeButton)return;
      section.hidden=true;
      reopen.hidden=false;
      reopen.focus();
    });
    reopen.addEventListener('click',()=>{section.hidden=false;reopen.hidden=true});
    reopen.hidden=!section.hidden;
  });
}

function condenseDesign(){
  normalizeCollectionNames();
  const collectionSection=document.querySelector('#page .studio-section');
  if(collectionSection&&!collectionSection.querySelector('.collection-guide-6b49')){
    const guideHost=collectionSection.querySelector('.section-title');
    guideHost?.insertAdjacentHTML('afterend',collectionGuideMarkup(storeTheme()));
  }
  normalizeCollectionNames();
  const renderGuide=theme=>{
    const guideHost=collectionSection?.querySelector('.collection-guide-6b49');
    if(!guideHost)return;
    guideHost.outerHTML=collectionGuideMarkup(theme);
  };
  if(collectionSection&&!collectionSection.dataset.collectionGuideStateBound){
    collectionSection.dataset.collectionGuideStateBound='true';
    window.addEventListener('kc:state',()=>{
      renderGuide(document.documentElement.dataset.theme||'pearl');
      normalizeCollectionNames();
    });
  }
  if(collectionSection&&!collectionSection.dataset.collectionSaveBound){
    collectionSection.dataset.collectionSaveBound='true';
    collectionSection.addEventListener('click',event=>{
      const button=event.target.closest('[data-save-collection]');
      if(!button)return;
      const theme=button.closest('[data-collection-guide]')?.dataset.collectionGuide;
      if(!theme)return;
      /* This action intentionally persists only the Monochromatic Collection. */
      store.set({theme});
      setTimeout(()=>{button.textContent='Saved';button.classList.add('is-saved')},0);
    });
  }
  [...document.querySelectorAll('[data-s5-theme]')].forEach(button=>{
    if(button.dataset.collectionGuideBound==='true')return;
    button.dataset.collectionGuideBound='true';
    button.addEventListener('click',()=>renderGuide(button.dataset.s5Theme));
  });
  disclose(findCardByHeading('Data Vault'),'Data vault','Export, import, or restore a protected copy of your information.',{className:'settings-tools-6b49'});
  disclose(findCardByHeading('Autosave Protection'),'Autosave protection','Review how your local changes are protected.',{className:'settings-tools-6b49'});
  bindTypographyAtelier();
  bindAtelierCloseControls();
}

function storeTheme(){
  const card=document.querySelector('.theme-card[data-s5-theme].selected');
  return card?.dataset.s5Theme||document.documentElement.dataset.theme||'pearl';
}

function condenseProfile(){
  disclose(document.querySelector('#page .blueprint-card'),'My blueprint','Edit your name, title, mission, and direction.',{className:'settings-tools-6b49'});
  disclose(findCardByHeading('The principles in the room'),'Core values','Review and edit the principles guiding your OS.',{className:'settings-tools-6b49'});
  disclose(findCardByHeading('My Quick Info'),'Personal details','Open your private, editable reference information.',{className:'settings-tools-6b49'});
  disclose(findCardByHeading('Evidence of becoming'),'Achievements','Review milestones and evidence of your growth.',{className:'settings-tools-6b49'});
}

export async function enhanceSprint6B49(route){
  document.documentElement.dataset.kcBuild='6b49';
  const page=document.querySelector('#page');
  const renderToken=`${route}-${Date.now()}-${Math.random()}`;
  if(page){page.dataset.compressionRender6b49=renderToken;page.classList.add('luxury-compression-6b49')}
  const refinements={dashboard:condenseDashboard,calendar:condenseAgenda,money:condenseMoney,wellness:condenseWellness,business:condenseIntelligence,premium:condenseDesign,profile:condenseProfile};
  const refine=()=>{
    if(document.documentElement.dataset.kcBuild!=='6b49'||page?.dataset.compressionRender6b49!==renderToken)return;
    page?.classList.add('luxury-compression-6b49');
    cleanupEmptyDisclosures();
    refinements[route]?.();
  };
  refine();
  setTimeout(refine,300);
  setTimeout(refine,1400);
  const updateBadge=()=>{const badge=document.querySelector('#kcBuildStatus b');if(badge)badge.textContent=BUILD};
  updateBadge();
  setTimeout(updateBadge,150);
  setTimeout(updateBadge,1700);
}
