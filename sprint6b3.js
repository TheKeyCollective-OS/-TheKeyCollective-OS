
import {store} from './store.js';
import {getPhotos} from './photo-db.js';

const $=s=>document.querySelector(s);
const all=s=>[...document.querySelectorAll(s)];

let dashboardTimer=null;
let dashboardUrls=[];

function releaseDashboardPhotos(){
  if(dashboardTimer){clearInterval(dashboardTimer);dashboardTimer=null}
  dashboardUrls.forEach(url=>URL.revokeObjectURL(url));
  dashboardUrls=[];
}

function applyCanonicalTheme(){
  const state=store.get();
  const theme=state.theme||'champagne';
  const dark=new Set(['noir','sapphire','emerald','midnight']);
  const root=document.documentElement;
  root.dataset.theme=theme;
  root.dataset.cards=state.design?.cards||'glass';
  root.dataset.radius=state.design?.radius||'soft';
  root.dataset.texture=state.design?.texture||'clean';
  root.dataset.type=state.design?.pack||state.design?.type||'classic';
  root.dataset.motion=state.design?.motion||'standard';
  root.dataset.paletteMode=dark.has(theme)?'dark':'light';
  document.body?.classList.toggle('kc-dark-palette',dark.has(theme));
  document.body?.classList.toggle('kc-light-palette',!dark.has(theme));
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.content=dark.has(theme)?'#111315':'#b89242';
}

function bindRouteButtons(router){
  all('[data-jump]').forEach(button=>{button.onclick=()=>router.go(button.dataset.jump)});
}

async function renderCanonicalLani(router){
  const host=$('#dashboardLani');
  if(!host)return;
  releaseDashboardPhotos();
  try{
    const photos=await getPhotos();
    if(!photos.length){
      host.innerHTML=`<button type="button" class="dashboard-photo-empty" data-open-lani><span>♡</span><b>Add your first Lani memory</b><small>Photos uploaded in Lani’s Corner will appear here automatically.</small></button>`;
      host.querySelector('[data-open-lani]').onclick=()=>router.go('lani');
      const caption=$('#dashboardLaniCaption');
      if(caption)caption.textContent=store.get().laniMemories?.[0]?.text||'Her newest memory will appear here.';
      return;
    }
    dashboardUrls=photos.map(photo=>URL.createObjectURL(photo.blob));
    let current=photos.findIndex(photo=>photo.featured);
    if(current<0)current=dashboardUrls.length-1;
    host.innerHTML=`<div class="canonical-lani-carousel">
      <button type="button" class="canonical-lani-stage" aria-label="Open Lani's Corner">
        ${dashboardUrls.map((url,index)=>`<img src="${url}" alt="Lani memory ${index+1}" class="${index===current?'active':''}">`).join('')}
      </button>
      <button type="button" class="canonical-lani-arrow previous" aria-label="Previous Lani photo">‹</button>
      <button type="button" class="canonical-lani-arrow next" aria-label="Next Lani photo">›</button>
      <span class="canonical-lani-count">${dashboardUrls.length} memor${dashboardUrls.length===1?'y':'ies'}</span>
    </div>`;
    const images=all('#dashboardLani img');
    const show=index=>{
      if(!images.length)return;
      images[current]?.classList.remove('active');
      current=(index+images.length)%images.length;
      images[current]?.classList.add('active');
    };
    host.querySelector('.canonical-lani-stage').onclick=()=>router.go('lani');
    host.querySelector('.previous').onclick=e=>{e.stopPropagation();show(current-1)};
    host.querySelector('.next').onclick=e=>{e.stopPropagation();show(current+1)};
    if(images.length>1)dashboardTimer=setInterval(()=>show(current+1),5000);
    const caption=$('#dashboardLaniCaption');
    if(caption)caption.textContent=store.get().laniMemories?.[0]?.text||'A favorite memory from Lani’s Corner.';
  }catch(error){
    host.innerHTML='<div class="status">Lani’s shared photo library could not be opened on this device.</div>';
    console.error('Lani dashboard sync failed',error);
  }
}

function improveHomeScreenState(){
  const standalone=window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true;
  document.documentElement.dataset.installMode=standalone?'standalone':'browser';
}

function installGlobalGuards(){
  if(document.documentElement.dataset.sprint6b3Installed==='true')return;
  document.documentElement.dataset.sprint6b3Installed='true';
  applyCanonicalTheme();
  improveHomeScreenState();
  window.addEventListener('kc:state',applyCanonicalTheme);
  window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change',improveHomeScreenState);
  window.addEventListener('pagehide',releaseDashboardPhotos);
}

export async function enhanceSprint6B3(id,router){
  installGlobalGuards();
  applyCanonicalTheme();
  bindRouteButtons(router);
  if(id!=='dashboard')releaseDashboardPhotos();
  if(id==='dashboard')await renderCanonicalLani(router);
}
