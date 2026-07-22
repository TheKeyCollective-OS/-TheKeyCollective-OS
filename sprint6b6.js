
import {store} from './store.js';

const BUILD='Sprint 6B.6';
const $=s=>document.querySelector(s);
const all=s=>[...document.querySelectorAll(s)];

let contrastObserver=null;
let contrastFrame=0;

function parseRGB(value){
  const match=String(value||'').match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/i);
  if(!match)return null;
  return {r:+match[1],g:+match[2],b:+match[3],a:match[4]===undefined?1:+match[4]};
}
function channel(value){
  value/=255;
  return value<=.04045?value/12.92:Math.pow((value+.055)/1.055,2.4);
}
function luminance(rgb){
  return .2126*channel(rgb.r)+.7152*channel(rgb.g)+.0722*channel(rgb.b);
}
function effectiveBackground(element){
  let node=element;
  while(node&&node!==document.documentElement){
    const style=getComputedStyle(node);
    const color=parseRGB(style.backgroundColor);
    if(color&&color.a>.12)return color;
    node=node.parentElement;
  }
  const body=parseRGB(getComputedStyle(document.body).backgroundColor);
  return body||{r:255,g:255,b:255,a:1};
}
function classify(element){
  if(!element||element.matches('[data-contrast-ignore],.dot,.agenda-dot,.notice-mark,.kc-build-dot'))return;
  const bg=effectiveBackground(element);
  element.dataset.surfaceTone=luminance(bg)>.48?'light':'dark';
}
function contrastTargets(root=document){
  return [
    ...root.querySelectorAll(`
      body,.page,.pagehead,.topbar,.sidebar,.card,.module,.theme-card,.theme-copy,
      .theme-preview,.preview-room,.preview-mini,.design-pack,.studio-section,
      .studio-grid,.design-hero,.readability-card,.contrast-demo,.quality-list,
      .status,.prompt,.entry,.agenda-item,.brief-line,.hard-tile,.hard-command,
      .calendar-day,.agenda-modal,.diagnostic-note,.diagnostic-grid>div,
      .kc-install-guidance,.kc-build-status,.pill,.btn,button,input,textarea,select,
      .profile-card,.metric-card,.dashboard-panel,.weather-card,.finance-strip article
    `)
  ];
}
function applyContrast(root=document){
  cancelAnimationFrame(contrastFrame);
  contrastFrame=requestAnimationFrame(()=>{
    contrastTargets(root).forEach(classify);
    document.documentElement.dataset.contrastEngine='component';
  });
}
function watchContrast(){
  if(contrastObserver)return;
  contrastObserver=new MutationObserver(mutations=>{
    if(mutations.some(m=>m.type==='childList'||m.attributeName==='class'||m.attributeName==='style'||m.attributeName==='data-theme')){
      applyContrast();
    }
  });
  contrastObserver.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','data-theme','data-cards','data-texture']});
  addEventListener('resize',()=>applyContrast(),{passive:true});
  addEventListener('kc:state',()=>applyContrast());
}

function repairDesignData(){
  const page=$('.page');
  if(!page)return;
  page.classList.add('design-data-6b6');
  const head=$('.design-head')||page.querySelector('.pagehead');
  head?.setAttribute('data-contrast-scope','design-head');
  all('.theme-card').forEach(card=>{
    card.setAttribute('data-contrast-scope','theme-card');
    const preview=card.querySelector('.theme-preview');
    preview?.setAttribute('data-contrast-ignore','true');
  });
  all('.design-pack').forEach(pack=>pack.setAttribute('data-contrast-scope','design-pack'));
  all('.studio-grid .card,.design-hero,.readability-card,.contrast-demo').forEach(card=>card.setAttribute('data-contrast-scope','design-panel'));
  all('label').forEach(label=>{
    if(label.closest('.design-data-6b6'))label.classList.add('design-control-label');
  });
  applyContrast(page);
}

function updateBuildIdentity(){
  const badge=$('#kcBuildStatus');
  if(badge){
    const title=badge.querySelector('b');
    if(title)title.textContent=BUILD;
  }
  const modal=$('#buildDiagnostics h2');
  if(modal)modal.textContent=BUILD;
}

export async function enhanceSprint6B6(id){
  updateBuildIdentity();
  watchContrast();
  if(id==='premium')repairDesignData();
  applyContrast();
}
