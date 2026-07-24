
import {store} from './store.js';

const BUILD='Sprint 6B.16 Corrective';
const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n)||0);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ORIGINAL_BILLS=[{"name":"Credit One Bank – Card 2","amount":5.0,"due":"2026-07-21","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"kc-original-bill-01"},{"name":"Apple Music","amount":11.99,"due":"2026-07-21","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"kc-original-bill-02"},{"name":"Progressive Car Insurance","amount":218.75,"due":"2026-07-21","clearDate":"2026-07-24","category":"Insurance","frequency":"Monthly","paid":false,"id":"kc-original-bill-03"},{"name":"Amazon Kids+","amount":6.52,"due":"2026-07-22","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"kc-original-bill-04"},{"name":"Affirm – Balance $45.16 – Final Aug 23 2026","amount":22.59,"due":"2026-07-23","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"kc-original-bill-05"},{"name":"Klarna","amount":43.05,"due":"2026-07-24","clearDate":"","category":"Debt","frequency":"One-time","paid":false,"id":"kc-original-bill-06"},{"name":"Affirm – Balance $574.13 – Final Jun 28 2027","amount":47.87,"due":"2026-07-28","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"kc-original-bill-07"},{"name":"T-Mobile","amount":98.0,"due":"2026-07-29","clearDate":"","category":"Utilities","frequency":"Monthly","paid":false,"id":"kc-original-bill-08"},{"name":"Netflix","amount":11.99,"due":"2026-07-29","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"kc-original-bill-09"},{"name":"Amazon Prime","amount":16.31,"due":"2026-07-29","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"kc-original-bill-10"},{"name":"Gym","amount":52.98,"due":"2026-07-29","clearDate":"","category":"Other","frequency":"Monthly","paid":false,"id":"kc-original-bill-11"},{"name":"Apple Card","amount":140.5,"due":"2026-07-31","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"kc-original-bill-12"},{"name":"Klarna","amount":5.44,"due":"2026-07-31","clearDate":"","category":"Debt","frequency":"One-time","paid":false,"id":"kc-original-bill-13"},{"name":"Klarna","amount":77.46,"due":"2026-07-31","clearDate":"","category":"Debt","frequency":"One-time","paid":false,"id":"kc-original-bill-14"},{"name":"Klarna","amount":7.07,"due":"2026-07-31","clearDate":"","category":"Debt","frequency":"One-time","paid":false,"id":"kc-original-bill-15"},{"name":"Preschool","amount":570.0,"due":"2026-08-01","clearDate":"","category":"Family","frequency":"Monthly","paid":false,"id":"kc-original-bill-16"},{"name":"Disney+","amount":21.75,"due":"2026-08-02","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"kc-original-bill-17"},{"name":"Apple iCloud","amount":9.99,"due":"2026-08-05","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"kc-original-bill-18"},{"name":"AppleCare+","amount":9.99,"due":"2026-08-05","clearDate":"","category":"Insurance","frequency":"Monthly","paid":false,"id":"kc-original-bill-19"},{"name":"Affirm – Balance $135.52 – Final Jan 5 2027","amount":22.59,"due":"2026-08-05","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"kc-original-bill-20"},{"name":"Peacock","amount":15.12,"due":"2026-08-08","clearDate":"2026-08-13","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"kc-original-bill-21"},{"name":"Car Payment","amount":246.63,"due":"2026-08-10","clearDate":"","category":"Transportation","frequency":"Monthly","paid":false,"id":"kc-original-bill-22"},{"name":"Capital One Quicksilver – Balance $10005.37","amount":564.0,"due":"2026-08-11","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"kc-original-bill-23"},{"name":"Credit One Bank – Card 1","amount":8.25,"due":"2026-08-12","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"kc-original-bill-24"},{"name":"Premier Credit Card","amount":12.0,"due":"2026-08-20","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"kc-original-bill-25"},{"name":"Google Drive","amount":9.99,"due":"2026-08-20","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"kc-original-bill-26"},{"name":"ChatGPT","amount":20.0,"due":"2026-08-20","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"kc-original-bill-27"},{"name":"Affirm – Balance $210.65 – Final Nov 20 2026","amount":69.94,"due":"2026-08-20","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"kc-original-bill-28"}];
const MIGRATION_KEY='keyCollectiveOS.billCanonicalMigration.6B16';

const normalizedName=v=>String(v||'').trim().toLowerCase().replace(/[–—]/g,'-').replace(/\s+/g,' ');
const exactKey=b=>`${normalizedName(b?.name)}|${Number(b?.amount||0).toFixed(2)}|${String(b?.due||'')}`;
const nameDateKey=b=>`${normalizedName(b?.name)}|${String(b?.due||'')}`;

function restoreCanonicalBills6B16(){
  if(localStorage.getItem(MIGRATION_KEY)==='done')return;
  const existing=Array.isArray(store.get().bills)?store.get().bills:[];
  const exact=new Map();
  existing.forEach(b=>{if(!exact.has(exactKey(b)))exact.set(exactKey(b),b)});
  const nameDateCounts={};
  ORIGINAL_BILLS.forEach(b=>nameDateCounts[nameDateKey(b)]=(nameDateCounts[nameDateKey(b)]||0)+1);
  const existingByNameDate=new Map();
  existing.forEach(b=>{
    const key=nameDateKey(b);
    if(!existingByNameDate.has(key))existingByNameDate.set(key,[]);
    existingByNameDate.get(key).push(b);
  });
  const canonical=ORIGINAL_BILLS.map(original=>{
    const exactMatch=exact.get(exactKey(original));
    let match=exactMatch;
    if(!match&&nameDateCounts[nameDateKey(original)]===1){
      const candidates=existingByNameDate.get(nameDateKey(original))||[];
      if(candidates.length)match=candidates[candidates.length-1];
    }
    return match?{...original,...match,id:original.id,paid:Boolean(match.paid),paidDate:match.paidDate||''}:{...original};
  });
  store.mutate(d=>{d.bills=canonical});
  localStorage.setItem(MIGRATION_KEY,'done');
}

function uniqueBills(){
  const map=new Map();
  (store.get().bills||[]).forEach(b=>{const key=exactKey(b);if(!map.has(key))map.set(key,b)});
  return [...map.values()];
}
function removeDashboardMorningBrief(){
  document.querySelectorAll('#dashboardMorningBrief6B15').forEach(el=>el.remove());
}
function ensureOneFinancialChecklist(){
  document.querySelectorAll('#paidCommand6B9,#billChecklistCard6B10,#billChecklist6B12').forEach(el=>el.remove());
  const duplicates=[...document.querySelectorAll('#canonicalBills6B13')];
  duplicates.slice(1).forEach(el=>el.remove());
  let card=duplicates[0];
  const page=$('.money-page')||$('#page');
  if(!card&&page){
    card=document.createElement('article');
    card.id='canonicalBills6B13';
    card.className='card canonical-bills-6b13';
    page.append(card);
  }
  if(!card)return;
  const bills=uniqueBills(),paid=bills.filter(b=>b.paid),due=bills.filter(b=>!b.paid);
  const filter=card.dataset.filter||'all';
  const visible=bills.filter(b=>filter==='all'||(filter==='paid'?b.paid:!b.paid));
  card.innerHTML=`<div class="section-title"><div><div class="eyebrow">Canonical bill source</div><h3>Complete Bill Checklist</h3></div><span class="pill">${paid.length} / ${bills.length} paid</span></div>
  <div class="paid-metric-grid"><div><span>Paid</span><b>${money(paid.reduce((n,b)=>n+Number(b.amount||0),0))}</b></div><div><span>Still due</span><b>${money(due.reduce((n,b)=>n+Number(b.amount||0),0))}</b></div><div><span>Unique bills</span><b>${bills.length}</b></div></div>
  <div class="segmented"><button data-filter="all">All</button><button data-filter="due">Due</button><button data-filter="paid">Paid</button></div>
  <div class="canonical-bill-list-6b13">${visible.map(b=>`<button type="button" class="canonical-bill-row-6b13 ${b.paid?'paid':''}" data-toggle-bill-6b16="${esc(b.id)}"><span class="bill-checkbox-6b12">${b.paid?'✓':''}</span><span><b>${esc(b.name)}</b><small>${money(b.amount)} · due ${esc(b.due||'not set')}</small></span><strong>${b.paid?'Paid':'Still Due'}</strong></button>`).join('')}</div>`;
  card.querySelectorAll('[data-filter]').forEach(button=>{
    button.classList.toggle('active',button.dataset.filter===filter);
    button.onclick=()=>{card.dataset.filter=button.dataset.filter;ensureOneFinancialChecklist()};
  });
  card.querySelectorAll('[data-toggle-bill-6b16]').forEach(button=>button.onclick=()=>{
    store.mutate(d=>{const bill=d.bills.find(x=>String(x.id)===String(button.dataset.toggleBill6b16));if(bill){bill.paid=!bill.paid;bill.paidDate=bill.paid?new Date().toISOString().slice(0,10):''}});
    ensureOneFinancialChecklist();
  });
}
function installNativeMonthPickerOverlay(){
  const button=$('#agendaMonth6B13'),input=$('#agendaMonthJump6B14'),nav=button?.parentElement;
  if(!button||!input||!nav)return;
  nav.style.position='relative';
  const align=()=>{
    input.style.position='absolute';
    input.style.left=`${button.offsetLeft}px`;
    input.style.top=`${button.offsetTop}px`;
    input.style.width=`${button.offsetWidth}px`;
    input.style.height=`${button.offsetHeight}px`;
    input.style.opacity='0.01';
    input.style.pointerEvents='auto';
    input.style.zIndex='20';
    input.style.border='0';
    input.style.padding='0';
    input.style.margin='0';
    input.style.background='transparent';
  };
  align();
  requestAnimationFrame(align);
  setTimeout(align,120);
  window.addEventListener('resize',align,{once:true});
}
function removeStaleDashboardDuplicates(){
  const host=$('#dashboardAgenda');if(!host)return;
  const seen=new Set();
  [...host.querySelectorAll('.agenda-item')].forEach(row=>{
    const key=row.textContent.trim().toLowerCase().replace(/\s+/g,' ');
    if(seen.has(key))row.remove();else seen.add(key);
  });
}
function refreshDashboardFinancialText(){
  const section=[...document.querySelectorAll('.dashboard-section')].find(x=>/Financial command|Cash position/i.test(x.textContent));
  if(!section)return;
  const bills=uniqueBills(),st=store.get(),total=bills.reduce((n,b)=>n+Number(b.amount||0),0),unpaid=bills.filter(b=>!b.paid).reduce((n,b)=>n+Number(b.amount||0),0);
  const cash=Number(st.checking||0)+Number(st.savings||0)+Number(st.otherAssets||0);
  const cards=section.querySelectorAll('.metric-card');
  if(cards[0])cards[0].innerHTML=`<div class="mini">Available cash</div><div class="metric">${money(cash)}</div><p>Checking ${money(st.checking)} · Savings ${money(st.savings)} · Other ${money(st.otherAssets)}</p>`;
  if(cards[1])cards[1].innerHTML=`<div class="mini">Upcoming bills</div><div class="metric">${money(total)}</div><p>${bills.length} unique scheduled bills</p>`;
  if(cards[2])cards[2].innerHTML=`<div class="mini">Projected balance</div><div class="metric">${money(cash-unpaid)}</div><p>After unpaid canonical bills</p>`;
}
let stateBound=false;
function bindRefresh(){
  if(stateBound)return;stateBound=true;
  window.addEventListener('kc:state',()=>{
    const route=location.hash.replace(/^#\/?/,'')||'dashboard';
    if(route==='dashboard'){removeDashboardMorningBrief();removeStaleDashboardDuplicates();refreshDashboardFinancialText()}
    if(route==='money')requestAnimationFrame(ensureOneFinancialChecklist);
  });
}
export async function enhanceSprint6B16(id){
  const badge=$('#kcBuildStatus b');if(badge)badge.textContent=BUILD;
  restoreCanonicalBills6B16();bindRefresh();
  if(id==='calendar')installNativeMonthPickerOverlay();
  if(id==='dashboard'){removeDashboardMorningBrief();removeStaleDashboardDuplicates();refreshDashboardFinancialText()}
  if(id==='money')requestAnimationFrame(()=>requestAnimationFrame(ensureOneFinancialChecklist));
}
