import {store} from './store.js';

const families=[
  ['pearl','01','Pearl Champagne','Pearl wash · satin sheen'],['blackberry','02','Blackberry Stripe','Velvet stripe · lacquer edge'],
  ['ruby','03','Ruby Lacquer','Garnet reflection · jewel gloss'],['rose','04','Rose Couture Tweed','Woven rose · blush silk'],
  ['amethyst','05','Amethyst Cheetah','Violet lacquer · playful sheen'],['sapphire','06','Sapphire Stardust','Starfield · faceted glass'],
  ['emerald','07','Emerald Crocodile','Crocodile lacquer · brushed gold'],['teal','08','Teal Murano','Art glass · translucent wave'],
  ['copper','09','Copper Chainmail','Woven copper · satin fold'],['espresso','10','Espresso Houndstooth','Leather grain · tailored rhythm'],
  ['onyx','11','Onyx Bandana','Bandana silk · ink contrast'],['silver','12','Platinum Deco Brocade','Deco brocade · liquid pearl']
];
const packs=[
  ['executive','A a','Executive','Confident serif headlines, crisp body copy','Confident decisions shape extraordinary outcomes.'],
  ['modern','Aa','Modern','Clean geometry and generous space','Clear systems make room for better decisions.'],
  ['editorial','Aa','Editorial','Magazine scale and elegant rhythm','A considered point of view changes the room.'],
  ['classic','Aa','Classic','Traditional serif refinement and balance','A timeless voice, polished for the present.'],
  ['minimal','Aa','Minimal','Quiet hierarchy and reduced ornament','Less noise. More signal. More intention.'],
  ['feminine','Aa','Soft Feminine','Graceful forms and gentle emphasis','Softness can still hold the line.'],
  ['urban','Aa','Urban','Bold scale and contemporary edge','Make the message impossible to miss.']
];
const borders=[['none','—','Minimal','A clean edge with no added ornament'],['gold','✦','Gold line','A fine warm-metal outline'],['double','▣','Double bezel','A tailored double-line frame'],['pearl','◈','Pearl inlay','A soft inner glow with a jewel edge']];

function premiumCardAtelier(){
  const state=store.get(),design=state.design||{},pack=design.pack||'executive',chosen=packs.find(item=>item[0]===pack)||packs[0],cardCollection=design.cardCollection||'pearl',tone=design.tone||'light',radius=['classic','square','circle'].includes(design.radius)?design.radius:'classic',border=['none','gold','double','pearl'].includes(design.border)?design.border:'none';
  return `<div class="pagehead"><div><div class="eyebrow">Your private atelier</div><h1>Design + Data</h1><p class="sub">Choose your atmosphere separately from the global card collection that carries across the OS.</p></div><span class="pill">Live preview</span></div>
  <section class="card preview-room"><div><div class="eyebrow">Preview room</div><h2>Your OS, dressed in real time.</h2><p>Keep the visual identity above independent, then choose the card collection, tone, and corner profile that shape shared surfaces everywhere.</p></div><div class="preview-mini"><span class="preview-top"></span><i></i><i></i><i></i></div></section>
  <section class="studio-section"><div class="section-title"><div><div class="eyebrow">Monochromatic collection</div><h2>Twelve complete visual identities</h2><p class="sub">This is the atmosphere and canvas. It does not change your global card collection.</p></div></div><div class="theme-gallery">${families.map(item=>`<button class="theme-card ${state.theme===item[0]?'selected':''}" data-s5-theme="${item[0]}"><div class="theme-preview theme-${item[0]}"><span></span><b></b><i></i></div><div class="theme-copy"><span>${item[1]}</span><div><strong>${item[2]}</strong><small>${item[3]}</small></div></div></button>`).join('')}</div></section>
  <section class="card typography-experience-6c" data-pack="${pack}" data-radius="${radius}" data-card-collection="${cardCollection}" data-tone="${tone}" data-border="${border}">
    <div class="experience-heading-6c"><div><div class="eyebrow">Typography + global card collection</div><h2>Shape the shared surfaces</h2><p>Choose your type voice, then independently dress every shared card, control, border, and navigation surface.</p></div><div class="experience-heading-actions-6c"><span class="experience-badge-6c">Independent selection</span><button type="button" class="btn atelier-save-6c" data-save-atelier>Save visual voice</button><button type="button" class="atelier-close-6c" data-close-atelier="type" aria-label="Close typography and global card collection">×</button></div></div>
    <div class="experience-layout-6c"><div class="experience-featured-6c"><div class="experience-kicker-6c">Featured <span data-experience-featured>${chosen[2]}</span></div><div class="experience-glyph-6c" data-experience-glyph>${chosen[1]}</div><h3 data-experience-title>${chosen[2]}</h3><p class="experience-hero-line-6c" data-experience-line>${chosen[4]}</p><div class="experience-rule-6c"></div><p class="experience-hero-copy-6c">${chosen[3]}. The card collection remains independent, so the atmosphere can change without rewriting your shared surfaces.</p><img class="experience-kiki-6c" src="assets/companion/kiki-option1.png" alt="Kiki styling the experience preview"></div><div class="experience-pack-grid-6c">${packs.map(item=>`<button class="experience-pack-6c ${pack===item[0]?'selected':''}" data-design-pack="${item[0]}"><span class="pack-glyph-6c">${item[1]}</span><strong>${item[2]}</strong><small>${item[3]}</small><em>${item[4]}</em></button>`).join('')}</div></div>
    <div class="experience-controls-6c"><div class="experience-control-6c global-card-collection-control-6c"><label>Global card collection</label><p class="control-help-6c">Independent from the atmosphere above. Pick one identity for every shared card surface.</p><div class="card-collection-grid-6c" role="group" aria-label="Global card collection">${families.map(item=>`<button type="button" class="card-collection-choice-6c ${cardCollection===item[0]?'selected':''}" data-preview-choice="cardCollection" data-preview-value="${item[0]}" aria-label="${item[2]} card collection"><div class="theme-preview theme-${item[0]}"></div><strong>${item[2]}</strong><small>${item[3]}</small></button>`).join('')}</div></div><div class="experience-control-6c"><label>Card collection tone</label><div class="surface-demo-6c" data-surface-demo role="group" aria-label="Card collection tone"><button type="button" data-tone-choice="light" class="surface-tone-choice-6c ${tone==='dark'?'':'selected'}" aria-label="Light card collection"><span></span><small>Light</small></button><button type="button" data-tone-choice="dark" class="surface-tone-choice-6c ${tone==='dark'?'selected':''}" aria-label="Dark card collection"><i></i><small>Dark</small></button></div></div><div class="experience-control-6c"><label>Special border</label><p class="control-help-6c">An independent frame finish. It does not change the corner profile.</p><div class="profile-choices-6c border-choices-6c" role="group" aria-label="Special border">${borders.map(item=>`<button type="button" class="profile-choice-6c border-choice-6c ${border===item[0]?'selected':''}" data-preview-choice="border" data-preview-value="${item[0]}" aria-label="${item[2]} border"><span>${item[1]}</span><small>${item[2]}</small></button>`).join('')}</div></div><div class="experience-control-6c"><label>Corner profile</label><div class="profile-choices-6c" role="group" aria-label="Corner profile preview">${[['classic','⌜','Classic'],['square','□','Square'],['circle','○','Circular']].map(item=>`<button type="button" class="profile-choice-6c ${radius===item[0]?'selected':''}" data-preview-choice="radius" data-preview-value="${item[0]}" aria-label="${item[2]}"><span>${item[1]}</span><small>${item[2]}</small></button>`).join('')}</div></div></div>
  </section><div class="grid g2"><article class="card"><h3>Data Vault</h3><button id="exportData" class="btn">Export Verified Backup</button><label class="btn secondary">Import Backup<input id="importData" hidden type="file" accept=".json"></label><button id="recoverData" class="btn ghost">Restore Previous Save</button></article><article class="card"><h3>Autosave Protection</h3><div class="integrity-badge healthy">✓ Saving continuously</div><p>Edits, checklists, drafts and preferences are written locally as you work.</p><small>Last saved: ${state.lastSaved?new Date(state.lastSaved).toLocaleString():'Ready'}</small></article></div>`;
}

function bindPremiumAtelier(){
  const studio=document.querySelector('.typography-experience-6c');
  if(!studio||studio.dataset.atelierBound==='true')return;
  studio.dataset.atelierBound='true';
  const draft=()=>{try{return studio.dataset.pendingDesign?JSON.parse(studio.dataset.pendingDesign):{}}catch{return {}}};
  const setDraft=changes=>{studio.dataset.pendingDesign=JSON.stringify({...draft(),...changes})};
  const sync=()=>{
    const design={...(store.get().design||{}),...draft()},pack=design.pack||'executive',tone=design.tone||'light',radius=design.radius||'classic',collection=design.cardCollection||'pearl',border=design.border||'none';
    studio.dataset.pack=pack;studio.dataset.tone=tone;studio.dataset.radius=radius;studio.dataset.cardCollection=collection;studio.dataset.border=border;
    const meta=packs.find(item=>item[0]===pack)||packs[0];
    [['[data-experience-featured]',meta[2]],['[data-experience-glyph]',meta[1]],['[data-experience-title]',meta[2]],['[data-experience-line]',meta[4]]].forEach(([selector,value])=>{const node=studio.querySelector(selector);if(node)node.textContent=value});
    studio.querySelectorAll('[data-design-pack]').forEach(button=>button.classList.toggle('selected',button.dataset.designPack===pack));
    studio.querySelectorAll('[data-preview-choice="cardCollection"]').forEach(button=>button.classList.toggle('selected',button.dataset.previewValue===collection));
    studio.querySelectorAll('[data-preview-choice="radius"]').forEach(button=>button.classList.toggle('selected',button.dataset.previewValue===radius));
    studio.querySelectorAll('[data-tone-choice]').forEach(button=>button.classList.toggle('selected',button.dataset.toneChoice===tone));
    studio.querySelectorAll('[data-preview-choice="border"]').forEach(button=>button.classList.toggle('selected',button.dataset.previewValue===border));
  };
  studio.querySelectorAll('[data-design-pack]').forEach(button=>button.addEventListener('click',()=>{setDraft({pack:button.dataset.designPack,type:button.dataset.designPack});sync()}));
  studio.querySelectorAll('[data-preview-choice]').forEach(button=>button.addEventListener('click',()=>{setDraft({[button.dataset.previewChoice]:button.dataset.previewValue});sync()}));
  studio.querySelectorAll('[data-tone-choice]').forEach(button=>button.addEventListener('click',()=>{setDraft({tone:button.dataset.toneChoice});sync()}));
  studio.querySelector('[data-save-atelier]')?.addEventListener('click',()=>{const save=studio.querySelector('[data-save-atelier]'),changes=draft();store.mutate(state=>{state.design={...(state.design||{}),...changes,cardCollection:changes.cardCollection||state.design?.cardCollection||'pearl',radius:changes.radius||state.design?.radius||'classic',tone:changes.tone||state.design?.tone||'light',border:changes.border||state.design?.border||'none'};delete state.design.motion;delete state.design.cards;delete state.design.texture});delete studio.dataset.pendingDesign;sync();if(save){const label=save.textContent;save.textContent='Saved';save.classList.add('is-saved');setTimeout(()=>{save.textContent=label;save.classList.remove('is-saved')},1600)}});
  window.addEventListener('kc:state',sync);sync();
}

export function enhanceSprint6E(route){
  if(route!=='premium')return;
  const page=document.querySelector('#page');
  if(!page)return;
  page.innerHTML=premiumCardAtelier();
  bindPremiumAtelier();
}
