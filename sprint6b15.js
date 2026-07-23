
import {store} from './store.js';

const BUILD='Sprint 6B.15 Corrective';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n)||0);
const ORIGINAL_BILLS=[{"name":"Credit One Bank – Card 2","amount":5.0,"due":"2026-07-21","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"kc-original-bill-01"},{"name":"Apple Music","amount":11.99,"due":"2026-07-21","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"kc-original-bill-02"},{"name":"Progressive Car Insurance","amount":218.75,"due":"2026-07-21","clearDate":"2026-07-24","category":"Insurance","frequency":"Monthly","paid":false,"id":"kc-original-bill-03"},{"name":"Amazon Kids+","amount":6.52,"due":"2026-07-22","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"kc-original-bill-04"},{"name":"Affirm – Balance $45.16 – Final Aug 23 2026","amount":22.59,"due":"2026-07-23","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"kc-original-bill-05"},{"name":"Klarna","amount":43.05,"due":"2026-07-24","clearDate":"","category":"Debt","frequency":"One-time","paid":false,"id":"kc-original-bill-06"},{"name":"Affirm – Balance $574.13 – Final Jun 28 2027","amount":47.87,"due":"2026-07-28","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"kc-original-bill-07"},{"name":"T-Mobile","amount":98.0,"due":"2026-07-29","clearDate":"","category":"Utilities","frequency":"Monthly","paid":false,"id":"kc-original-bill-08"},{"name":"Netflix","amount":11.99,"due":"2026-07-29","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"kc-original-bill-09"},{"name":"Amazon Prime","amount":16.31,"due":"2026-07-29","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"kc-original-bill-10"},{"name":"Gym","amount":52.98,"due":"2026-07-29","clearDate":"","category":"Other","frequency":"Monthly","paid":false,"id":"kc-original-bill-11"},{"name":"Apple Card","amount":140.5,"due":"2026-07-31","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"kc-original-bill-12"},{"name":"Klarna","amount":5.44,"due":"2026-07-31","clearDate":"","category":"Debt","frequency":"One-time","paid":false,"id":"kc-original-bill-13"},{"name":"Klarna","amount":77.46,"due":"2026-07-31","clearDate":"","category":"Debt","frequency":"One-time","paid":false,"id":"kc-original-bill-14"},{"name":"Klarna","amount":7.07,"due":"2026-07-31","clearDate":"","category":"Debt","frequency":"One-time","paid":false,"id":"kc-original-bill-15"},{"name":"Preschool","amount":570.0,"due":"2026-08-01","clearDate":"","category":"Family","frequency":"Monthly","paid":false,"id":"kc-original-bill-16"},{"name":"Disney+","amount":21.75,"due":"2026-08-02","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"kc-original-bill-17"},{"name":"Apple iCloud","amount":9.99,"due":"2026-08-05","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"kc-original-bill-18"},{"name":"AppleCare+","amount":9.99,"due":"2026-08-05","clearDate":"","category":"Insurance","frequency":"Monthly","paid":false,"id":"kc-original-bill-19"},{"name":"Affirm – Balance $135.52 – Final Jan 5 2027","amount":22.59,"due":"2026-08-05","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"kc-original-bill-20"},{"name":"Peacock","amount":15.12,"due":"2026-08-08","clearDate":"2026-08-13","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"kc-original-bill-21"},{"name":"Car Payment","amount":246.63,"due":"2026-08-10","clearDate":"","category":"Transportation","frequency":"Monthly","paid":false,"id":"kc-original-bill-22"},{"name":"Capital One Quicksilver – Balance $10005.37","amount":564.0,"due":"2026-08-11","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"kc-original-bill-23"},{"name":"Credit One Bank – Card 1","amount":8.25,"due":"2026-08-12","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"kc-original-bill-24"},{"name":"Premier Credit Card","amount":12.0,"due":"2026-08-20","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"kc-original-bill-25"},{"name":"Google Drive","amount":9.99,"due":"2026-08-20","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"kc-original-bill-26"},{"name":"ChatGPT","amount":20.0,"due":"2026-08-20","clearDate":"","category":"Subscriptions","frequency":"Monthly","paid":false,"id":"kc-original-bill-27"},{"name":"Affirm – Balance $210.65 – Final Nov 20 2026","amount":69.94,"due":"2026-08-20","clearDate":"","category":"Debt","frequency":"Monthly","paid":false,"id":"kc-original-bill-28"}];
const MIGRATION_KEY='keyCollectiveOS.billCanonicalMigration.6B15';

function normalizedName(v){return String(v||'').trim().toLowerCase().replace(/[–—]/g,'-').replace(/\s+/g,' ')}
function exactKey(b){return `${normalizedName(b.name)}|${Number(b.amount||0).toFixed(2)}|${String(b.due||'')}`}
function canonicalizeBills(){
  const current=Array.isArray(store.get().bills)?store.get().bills:[];
  const migrated=localStorage.getItem(MIGRATION_KEY)==='done';
  let source=current;
  if(!migrated){
    source=[...ORIGINAL_BILLS,...current];
  }
  const map=new Map();
  source.forEach((bill,index)=>{
    const key=exactKey(bill);
    if(!map.has(key)){
      map.set(key,{...bill,id:bill.id||`kc-bill-${index}`});
    }else{
      const existing=map.get(key);
      map.set(key,{...existing,...bill,id:existing.id,paid:Boolean(existing.paid||bill.paid),paidDate:existing.paidDate||bill.paidDate||''});
    }
  });
  const canonical=[...map.values()];
  const changed=!migrated||canonical.length!==current.length||canonical.some((b,i)=>exactKey(b)!==exactKey(current[i]||{}));
  if(changed)store.mutate(d=>{d.bills=canonical});
  localStorage.setItem(MIGRATION_KEY,'done');
  return canonical;
}

function uniqueBills(){
  const map=new Map();
  (store.get().bills||[]).forEach(b=>{const key=exactKey(b);if(!map.has(key))map.set(key,b)});
  return [...map.values()];
}
function calendarLooksLikeBill(value,bills){
  const text=[value?.subject,value?.events,value?.tasks,value?.notes].join(' ').toLowerCase();
  return bills.some(b=>text.includes(normalizedName(b.name))&&(text.includes(String(Number(b.amount||0)))||text.includes('bill')));
}
function dashboardAgendaItems(){
  const st=store.get(),bills=uniqueBills(),items=[];
  Object.entries(st.calendar||{}).forEach(([date,value])=>{
    if(!date||calendarLooksLikeBill(value,bills))return;
    const label=value.subject||String(value.events||'').split(/\r?\n/).find(Boolean)||String(value.tasks||'').split(/\r?\n/).find(Boolean);
    if(label)items.push({date,label,type:'Calendar'});
  });
  bills.forEach(b=>{if(b.due)items.push({date:b.due,label:`${b.name} · ${money(b.amount)}`,type:b.paid?'Paid bill':'Bill'})});
  const unique=new Map();
  items.forEach(item=>{const key=`${item.date}|${item.type}|${String(item.label).toLowerCase()}`;if(!unique.has(key))unique.set(key,item)});
  return [...unique.values()].sort((a,b)=>a.date.localeCompare(b.date));
}
function renderDashboardAgenda(){
  const host=$('#dashboardAgenda');if(!host)return;
  const today=new Date().toISOString().slice(0,10),end=new Date(Date.now()+7*864e5).toISOString().slice(0,10);
  const items=dashboardAgendaItems().filter(x=>x.date>=today&&x.date<=end);
  host.innerHTML=items.length?items.map(x=>`<div class="agenda-item"><b>${esc(x.label)}</b><div class="mini">${esc(x.date)} · ${esc(x.type)}</div></div>`).join(''):'<p class="muted">Nothing scheduled in the next seven days.</p>';
}
function renderDashboardFinancial(){
  const section=[...document.querySelectorAll('.dashboard-section')].find(x=>/Financial command|Cash position/i.test(x.textContent));
  if(!section)return;
  const st=store.get(),bills=uniqueBills(),total=bills.reduce((n,b)=>n+Number(b.amount||0),0),due=bills.filter(b=>!b.paid).reduce((n,b)=>n+Number(b.amount||0),0);
  const cash=Number(st.checking||0)+Number(st.savings||0)+Number(st.otherAssets||0),projected=cash-due;
  const strip=section.querySelector('.finance-strip');if(!strip)return;
  strip.innerHTML=`<article class="card metric-card"><div class="mini">Available cash</div><div class="metric">${money(cash)}</div><p>Checking ${money(st.checking)} · Savings ${money(st.savings)} · Other ${money(st.otherAssets)}</p></article><article class="card metric-card"><div class="mini">Upcoming bills</div><div class="metric">${money(total)}</div><p>${bills.length} unique scheduled bill${bills.length===1?'':'s'}</p></article><article class="card metric-card ${projected<0?'warning-card':''}"><div class="mini">Projected balance</div><div class="metric">${money(projected)}</div><p>After unpaid canonical bills</p></article>`;
}
function morningBriefSummary(){
  const st=store.get(),done=(st.top3Done||[]).filter(Boolean).length,routine=Object.values(st.morningRoutine||{}),routineDone=routine.filter(Boolean).length;
  const today=new Date().toISOString().slice(0,10),end=new Date(Date.now()+7*864e5).toISOString().slice(0,10);
  const agenda=dashboardAgendaItems().filter(x=>x.date>=today&&x.date<=end),unpaid=uniqueBills().filter(b=>!b.paid);
  return {done,routineDone,routineTotal:routine.length,agenda:agenda.length,unpaid:unpaid.length,next:agenda[0]};
}
function renderDashboardMorningBrief(router){
  let card=$('#dashboardMorningBrief6B15');
  if(!card){
    card=document.createElement('article');card.id='dashboardMorningBrief6B15';card.className='card luxe dashboard-panel';
    const grid=$('#page .dashboard-grid');if(grid)grid.prepend(card);else return;
  }
  const s=morningBriefSummary();
  card.innerHTML=`<div class="mini">Morning Brief</div><h3>${s.done}/3 priorities · ${s.routineDone}/${s.routineTotal} routine complete</h3><p>${s.agenda} agenda item${s.agenda===1?'':'s'} in the next seven days · ${s.unpaid} unpaid bill${s.unpaid===1?'':'s'}.</p>${s.next?`<div class="status"><b>Next:</b> ${esc(s.next.label)} · ${esc(s.next.date)}</div>`:''}<button class="btn ghost" id="openMorningBrief6B15">Open Morning Brief</button>`;
  $('#openMorningBrief6B15').onclick=()=>router.go('intelligence');
}
function cleanFinancialPanels(){
  document.querySelectorAll('#paidCommand6B9,#billChecklistCard6B10,#billChecklist6B12').forEach(x=>x.remove());
  const canonical=$('#canonicalBills6B13');
  if(canonical){
    document.querySelectorAll('#canonicalBills6B13').forEach((el,i)=>{if(i>0)el.remove()});
  }
}
function renderCanonicalFinancial(){
  cleanFinancialPanels();
  const bills=uniqueBills();
  const card=$('#canonicalBills6B13');
  if(!card)return;
  const paid=bills.filter(b=>b.paid),due=bills.filter(b=>!b.paid),filter=card.dataset.filter||'all';
  const visible=bills.filter(b=>filter==='all'||(filter==='paid'?b.paid:!b.paid));
  card.innerHTML=`<div class="section-title"><div><div class="eyebrow">Canonical bill source</div><h3>Complete Bill Checklist</h3></div><span class="pill">${paid.length} / ${bills.length} paid</span></div>
  <div class="paid-metric-grid"><div><span>Paid</span><b>${money(paid.reduce((n,b)=>n+Number(b.amount||0),0))}</b></div><div><span>Still due</span><b>${money(due.reduce((n,b)=>n+Number(b.amount||0),0))}</b></div><div><span>Unique bills</span><b>${bills.length}</b></div></div>
  <div class="segmented"><button data-filter="all">All</button><button data-filter="due">Due</button><button data-filter="paid">Paid</button></div>
  <div class="canonical-bill-list-6b13">${visible.map(b=>`<button type="button" class="canonical-bill-row-6b13 ${b.paid?'paid':''}" data-toggle-bill-6b15="${esc(b.id)}"><span class="bill-checkbox-6b12">${b.paid?'✓':''}</span><span><b>${esc(b.name)}</b><small>${money(b.amount)} · due ${esc(b.due||'not set')}</small></span><strong>${b.paid?'Paid':'Still Due'}</strong></button>`).join('')}</div>`;
  card.querySelectorAll('[data-filter]').forEach(button=>{button.classList.toggle('active',button.dataset.filter===filter);button.onclick=()=>{card.dataset.filter=button.dataset.filter;renderCanonicalFinancial()}});
  card.querySelectorAll('[data-toggle-bill-6b15]').forEach(button=>button.onclick=()=>{store.mutate(d=>{const bill=d.bills.find(x=>String(x.id)===String(button.dataset.toggleBill6b15));if(bill){bill.paid=!bill.paid;bill.paidDate=bill.paid?new Date().toISOString().slice(0,10):''}});renderCanonicalFinancial()});
}
let stateBound=false;
function bindSharedRefresh(router){
  if(stateBound)return;stateBound=true;
  window.addEventListener('kc:state',()=>{
    const route=location.hash.replace(/^#\/?/,'')||'dashboard';
    if(route==='dashboard'){renderDashboardAgenda();renderDashboardFinancial();renderDashboardMorningBrief(router)}
    if(route==='money')renderCanonicalFinancial();
  });
}
function enhanceLaniContrast(){document.body.classList.toggle('sapphire-lani-6b15',document.documentElement.dataset.theme==='sapphire')}
export async function enhanceSprint6B15(id,router){
  const badge=$('#kcBuildStatus b');if(badge)badge.textContent=BUILD;
  canonicalizeBills();bindSharedRefresh(router);enhanceLaniContrast();
  if(id==='dashboard'){renderDashboardAgenda();renderDashboardFinancial();renderDashboardMorningBrief(router)}
  if(id==='money')requestAnimationFrame(()=>requestAnimationFrame(renderCanonicalFinancial));
}
