
import {store} from './store.js';
import {getPhotos,putPhoto} from './photo-db.js';

const BUILD='Sprint 6B.4';
const BUILD_ID='6b4-v21';
const $=s=>document.querySelector(s);
const all=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let themeGuard=false;
let themeObserver=null;

function mode(){
  return window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true?'Home-screen app':'Safari / browser';
}

function applyTheme(){
  if(themeGuard)return;
  themeGuard=true;
  const state=store.get(),theme=state.theme||'champagne';
  const dark=new Set(['noir','sapphire','emerald','midnight']);
  const root=document.documentElement;
  root.dataset.theme=theme;
  root.dataset.paletteMode=dark.has(theme)?'dark':'light';
  root.dataset.cards=state.design?.cards||'glass';
  root.dataset.radius=state.design?.radius||'soft';
  root.dataset.texture=state.design?.texture||'clean';
  root.dataset.type=state.design?.pack||state.design?.type||'classic';
  root.dataset.motion=state.design?.motion||'standard';
  root.style.colorScheme=dark.has(theme)?'dark':'light';
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.content=dark.has(theme)?'#101214':'#b89242';
  requestAnimationFrame(()=>themeGuard=false);
}

function watchTheme(){
  if(themeObserver)return;
  themeObserver=new MutationObserver(mutations=>{
    if(themeGuard)return;
    if(mutations.some(m=>['data-theme','data-palette-mode','data-cards','data-radius','data-texture','data-type','data-motion'].includes(m.attributeName))){
      applyTheme();
    }
  });
  themeObserver.observe(document.documentElement,{attributes:true});
  addEventListener('kc:state',applyTheme);
}

async function photoStats(){
  try{
    const photos=await getPhotos();
    return {count:photos.length,bytes:photos.reduce((sum,p)=>sum+(p.blob?.size||0),0)};
  }catch(error){
    return {count:0,bytes:0,error:String(error)};
  }
}
function size(n){
  if(n<1024)return `${n} B`;
  if(n<1048576)return `${(n/1024).toFixed(1)} KB`;
  return `${(n/1048576).toFixed(1)} MB`;
}
async function storageEstimate(){
  try{
    const estimate=await navigator.storage?.estimate?.();
    return estimate||{};
  }catch{return {}}
}
function getLocalBytes(){
  let total=0;
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    total+=(key?.length||0)+(localStorage.getItem(key)?.length||0);
  }
  return total*2;
}
function blobToDataURL(blob){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=()=>reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
function dataURLToBlob(dataURL){
  const [meta,data]=dataURL.split(',');
  const mime=meta.match(/data:([^;]+)/)?.[1]||'application/octet-stream';
  const bytes=atob(data),array=new Uint8Array(bytes.length);
  for(let i=0;i<bytes.length;i++)array[i]=bytes.charCodeAt(i);
  return new Blob([array],{type:mime});
}
async function createContinuityBackup(){
  const photos=await getPhotos();
  const encoded=[];
  for(const photo of photos){
    encoded.push({
      id:photo.id,
      name:photo.name,
      createdAt:photo.createdAt,
      featured:Boolean(photo.featured),
      data:await blobToDataURL(photo.blob)
    });
  }
  return JSON.stringify({
    app:'The Key Collective OS',
    build:BUILD,
    exportedAt:new Date().toISOString(),
    origin:location.origin,
    mode:mode(),
    state:store.get(),
    photos:encoded
  },null,2);
}
async function restoreContinuityBackup(text){
  const parsed=JSON.parse(text);
  if(!parsed||parsed.app!=='The Key Collective OS'||!parsed.state)throw new Error('This is not a valid Key Collective continuity backup.');
  store.set(parsed.state);
  for(const photo of parsed.photos||[]){
    await putPhoto({
      id:photo.id||crypto.randomUUID(),
      name:photo.name||'Restored Lani memory',
      createdAt:photo.createdAt||new Date().toISOString(),
      featured:Boolean(photo.featured),
      blob:dataURLToBlob(photo.data)
    });
  }
}
function download(name,text,type='application/json'){
  const a=document.createElement('a');
  const url=URL.createObjectURL(new Blob([text],{type}));
  a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}
async function clearAppCache(){
  const regs=await navigator.serviceWorker?.getRegistrations?.()||[];
  await Promise.all(regs.map(r=>r.unregister()));
  const keys=await caches.keys();
  await Promise.all(keys.map(k=>caches.delete(k)));
  sessionStorage.setItem('kc-cache-reset','1');
  location.reload();
}

async function renderDiagnostics(){
  const dialog=$('#buildDiagnostics');
  const photo=await photoStats(),estimate=await storageEstimate();
  const controller=navigator.serviceWorker?.controller?.scriptURL?.split('/').pop()||'Not controlling this page yet';
  $('#diagnosticContent').innerHTML=`
    <div class="diagnostic-grid">
      <div><small>Build</small><b>${BUILD}</b></div>
      <div><small>Opening mode</small><b>${mode()}</b></div>
      <div><small>Origin</small><b>${esc(location.origin)}</b></div>
      <div><small>Service worker</small><b>${esc(controller)}</b></div>
      <div><small>Saved OS data</small><b>${size(getLocalBytes())}</b></div>
      <div><small>Lani photo vault</small><b>${photo.count} photo${photo.count===1?'':'s'} · ${size(photo.bytes)}</b></div>
      <div><small>Storage used</small><b>${estimate.usage?size(estimate.usage):'Unavailable'}</b></div>
      <div><small>Storage quota</small><b>${estimate.quota?size(estimate.quota):'Unavailable'}</b></div>
    </div>
    <div class="diagnostic-note">
      <b>About Safari and the home-screen app</b>
      <p>On iPhone, Safari and an installed home-screen app can keep separate website storage. This build cannot force Apple to merge those storage containers. The continuity backup below moves your saved OS data and Lani photos safely between them.</p>
    </div>`;
  dialog.showModal();
}

function buildStatus(){
  let status=$('#kcBuildStatus');
  if(status)return status;
  const nav=document.querySelector('.sidebar')||document.body;
  status=document.createElement('button');
  status.id='kcBuildStatus';
  status.type='button';
  status.className='kc-build-status';
  status.innerHTML=`<span class="kc-build-dot"></span><span><b>${BUILD}</b><small>${mode()}</small></span>`;
  nav.append(status);
  document.body.insertAdjacentHTML('beforeend',`
    <dialog id="buildDiagnostics" class="agenda-dialog">
      <article class="card agenda-modal build-diagnostics-modal">
        <button type="button" class="icon-button reflection-close" data-close-diagnostics aria-label="Close">×</button>
        <div class="eyebrow">App identity and continuity</div>
        <h2>${BUILD}</h2>
        <div id="diagnosticContent"><div class="status">Checking this installation…</div></div>
        <div class="diagnostic-actions">
          <button type="button" class="btn" id="downloadContinuity">Download continuity backup</button>
          <button type="button" class="btn secondary" id="restoreContinuity">Restore continuity backup</button>
          <button type="button" class="btn ghost" id="refreshCurrentBuild">Refresh current build</button>
        </div>
        <input id="continuityFile" type="file" accept=".json,application/json" hidden>
      </article>
    </dialog>`);
  status.onclick=renderDiagnostics;
  all('[data-close-diagnostics]').forEach(b=>b.onclick=()=>$('#buildDiagnostics').close());
  $('#downloadContinuity').onclick=async()=>{
    const text=await createContinuityBackup();
    download(`KeyCollective_${BUILD.replaceAll(' ','_')}_continuity.json`,text);
  };
  $('#restoreContinuity').onclick=()=>$('#continuityFile').click();
  $('#continuityFile').onchange=async event=>{
    const file=event.target.files[0];
    if(!file)return;
    try{
      await restoreContinuityBackup(await file.text());
      $('#buildDiagnostics').close();
      location.reload();
    }catch(error){
      alert(error.message);
    }finally{event.target.value=''}
  };
  $('#refreshCurrentBuild').onclick=clearAppCache;
  return status;
}

function browserGuidance(){
  const standalone=mode()==='Home-screen app';
  document.documentElement.dataset.installMode=standalone?'standalone':'browser';
  const old=$('#kcInstallGuidance');
  if(standalone){old?.remove();return}
  if(sessionStorage.getItem('kc-install-guidance-dismissed')==='1')return;
  if(old)return;
  const banner=document.createElement('div');
  banner.id='kcInstallGuidance';
  banner.className='kc-install-guidance';
  banner.innerHTML=`<div><b>You are viewing the browser version.</b><small>For the full home-screen experience, use Safari’s Share menu → Add to Home Screen. Tap ${BUILD} in the sidebar anytime to verify which version is open.</small></div><button type="button" aria-label="Dismiss">×</button>`;
  banner.querySelector('button').onclick=()=>{
    sessionStorage.setItem('kc-install-guidance-dismissed','1');
    banner.remove();
  };
  document.body.append(banner);
}

export async function enhanceSprint6B4(){
  applyTheme();
  watchTheme();
  buildStatus();
  browserGuidance();
  const status=$('#kcBuildStatus');
  if(status)status.querySelector('small').textContent=mode();
}
