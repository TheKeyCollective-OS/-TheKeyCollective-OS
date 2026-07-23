
import {store} from './store.js';

const BUILD='Sprint 6B.12';
const $=s=>document.querySelector(s);
const all=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n)||0);
const localKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

function allBills(){
  return [...(store.get().bills||[])].sort((a,b)=>String(a.due||'').localeCompare(String(b.due||''))||String(a.name||'').localeCompare(String(b.name||'')));
}
function billTotals(){
  const state=store.get(),bills=allBills(),paid=bills.filter(b=>Boolean(b.paid)),due=bills.filter(b=>!b.paid);
  const available=Number(state.checking||0)+Number(state.savings||0)+Number(state.otherAssets||0);
  return {
    bills,paid,due,available,
    paidAmount:paid.reduce((n,b)=>n+Number(b.amount||0),0),
    dueAmount:due.reduce((n,b)=>n+Number(b.amount||0),0)
  };
}
function ensureBillChecklist(){
  const host=$('.money-page')||$('#page');
  if(!host)return;
  document.querySelectorAll('#paidCommand6B9,#billChecklistCard6B10').forEach(x=>x.remove());
  let card=$('#billChecklist6B12');
  if(!card){
    card=document.createElement('article');
    card.id='billChecklist6B12';
    card.className='card bill-checklist-6b12';
    const manager=$('.bill-manager')||$('#billList')?.closest('.card');
    if(manager)manager.after(card);else host.append(card);
  }
  renderBillChecklist();
}
function renderBillChecklist(){
  const card=$('#billChecklist6B12');if(!card)return;
  const totals=billTotals(),filter=card.dataset.filter||'all';
  const visible=totals.bills.filter(b=>filter==='all'||(filter==='paid'?Boolean(b.paid):!b.paid));
  card.innerHTML=`<div class="section-title"><div><div class="eyebrow">Complete bill checklist</div><h3>Paid and Still Due</h3><p class="muted">Every imported and manually entered bill is listed below.</p></div><span class="pill">${totals.paid.length} / ${totals.bills.length} paid</span></div>
    <div class="paid-metric-grid">
      <div><span>Available cash</span><b>${money(totals.available)}</b></div>
      <div><span>Paid</span><b>${money(totals.paidAmount)}</b></div>
      <div><span>Still due</span><b>${money(totals.dueAmount)}</b></div>
      <div><span>Cash after unpaid</span><b>${money(totals.available-totals.dueAmount)}</b></div>
    </div>
    <div class="segmented bill-filters-6b12">
      <button type="button" data-bill-filter="all">All</button>
      <button type="button" data-bill-filter="due">Due</button>
      <button type="button" data-bill-filter="paid">Paid</button>
    </div>
    <div class="bill-list-6b12">${visible.map(b=>`<button type="button" class="bill-row-6b12 ${b.paid?'is-paid':''}" data-bill-toggle="${esc(b.id)}" role="checkbox" aria-checked="${b.paid?'true':'false'}">
      <span class="bill-checkbox-6b12" aria-hidden="true">${b.paid?'✓':''}</span>
      <span class="bill-copy-6b12"><b>${esc(b.name)}</b><small>${money(b.amount)} · due ${esc(b.due||'not set')} · ${esc(b.category||'Other')}</small>${b.paid?`<small>Paid ${esc(b.paidDate||localKey())}</small>`:''}</span>
      <strong>${b.paid?'Paid':'Still Due'}</strong>
    </button>`).join('')||'<div class="status">No bills in this view.</div>'}</div>`;
  all('[data-bill-filter]').forEach(button=>{
    button.classList.toggle('active',button.dataset.billFilter===filter);
    button.onclick=()=>{card.dataset.filter=button.dataset.billFilter;renderBillChecklist()};
  });
}
function toggleBill(id){
  store.mutate(state=>{
    const bill=(state.bills||[]).find(x=>String(x.id)===String(id));
    if(!bill)return;
    bill.paid=!Boolean(bill.paid);
    bill.paidDate=bill.paid?localKey():'';
  });
  renderBillChecklist();
}
let billCaptureBound=false;
function bindBillCapture(){
  if(billCaptureBound)return;
  billCaptureBound=true;
  document.addEventListener('click',event=>{
    const row=event.target.closest('[data-bill-toggle]');
    if(!row)return;
    const card=row.closest('#billChecklist6B12');
    if(!card)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    toggleBill(row.dataset.billToggle);
  },true);
}

const DEFAULT_MORNING_LABELS=['Make the bed','Open curtains','Kitchen refresh','Review today’s Top Three'];
function morningData(){
  const state=store.get(),sanctuary=state.sanctuary||{},completed=Array.isArray(sanctuary.completed?.morning)?sanctuary.completed.morning:[];
  const custom=Array.isArray(sanctuary.routines?.morning)?sanctuary.routines.morning:[];
  const labels=custom.length?custom:DEFAULT_MORNING_LABELS;
  const savedTotal=Number(sanctuary.routineTotals?.morning||0);
  const total=Math.max(labels.length,completed.length,savedTotal,1);
  const done=Array.from({length:total},(_,i)=>Boolean(completed[i])).filter(Boolean).length;
  return {completed,labels,total,done};
}
function recordMorningTotal(){
  const boxes=all('[data-ritual="morning"]');
  if(!boxes.length)return;
  store.mutate(state=>{
    state.sanctuary=state.sanctuary||{completed:{},notes:{},routines:{}};
    state.sanctuary.routineTotals=state.sanctuary.routineTotals||{};
    state.sanctuary.routineTotals.morning=boxes.length;
  });
}
function updateMorningBrief(router){
  const card=$('.morning-routine-card'),data=morningData();
  if(!card)return;
  const score=card.querySelector('#routineScore');
  if(score)score.textContent=`${data.done} of ${data.total}`;
  const list=card.querySelector('#morningRoutine');
  if(list)list.innerHTML=`<div class="sanctuary-progress-6b12"><div class="bar"><span style="width:${data.total?Math.round(data.done/data.total*100):0}%"></span></div><p><b>${data.done} of ${data.total}</b> Sanctuary morning tasks completed.</p><button type="button" id="openSanctuaryBrief6B12" class="btn ghost">Open Sanctuary</button></div>`;
  $('#openSanctuaryBrief6B12')?.addEventListener('click',()=>router.go('sanctuary'));
}
function updateDashboard(router){
  const data=morningData();
  let card=$('#sanctuaryDashboard6B12');
  if(!card){
    const grid=$('.dashboard-grid');
    if(!grid)return;
    card=document.createElement('article');
    card.id='sanctuaryDashboard6B12';
    card.className='card dashboard-panel sanctuary-summary-6b12';
    grid.append(card);
  }
  card.innerHTML=`<div class="mini">Power on gently</div><h3>Morning Routine</h3><div class="routine-summary-number">${data.done} of ${data.total}</div><div class="bar"><span style="width:${data.total?Math.round(data.done/data.total*100):0}%"></span></div><p>${data.done===data.total?'Morning rhythm complete.':'Sanctuary progress is synchronized.'}</p><button type="button" id="openSanctuaryDashboard6B12" class="btn ghost">Open Sanctuary</button>`;
  $('#openSanctuaryDashboard6B12').onclick=()=>router.go('sanctuary');
}
function enhanceSanctuary(){
  recordMorningTotal();
  all('[data-ritual="morning"]').forEach(input=>{
    input.addEventListener('change',()=>{
      store.mutate(state=>{
        state.sanctuary=state.sanctuary||{completed:{},notes:{},routines:{}};
        state.sanctuary.completed=state.sanctuary.completed||{};
        state.sanctuary.completed.morning=state.sanctuary.completed.morning||[];
        state.sanctuary.completed.morning[Number(input.dataset.step)]=input.checked;
        state.sanctuary.routineTotals=state.sanctuary.routineTotals||{};
        state.sanctuary.routineTotals.morning=all('[data-ritual="morning"]').length;
      });
    },true);
  });
}
function updateThemeDescriptions(){
  all('.theme-card').forEach(card=>{
    const title=card.querySelector('strong')?.textContent||'';
    const description=card.querySelector('small');
    if(!description)return;
    if(title==='Coral Society')description.textContent='Coral-orange, refined teal and soft pearl';
    if(title==='Amber Studio')description.textContent='Bright luxury orange, ivory and graphite';
    if(title==='Sunlit Citron')description.textContent='Deep golden yellow, cream and dark charcoal';
  });
}
function updateBuild(){const badge=$('#kcBuildStatus b');if(badge)badge.textContent=BUILD}

export async function enhanceSprint6B12(id,router){
  updateBuild();
  bindBillCapture();
  if(id==='money')requestAnimationFrame(()=>requestAnimationFrame(ensureBillChecklist));
  if(id==='sanctuary')enhanceSanctuary();
  if(id==='intelligence')updateMorningBrief(router);
  if(id==='dashboard')updateDashboard(router);
  if(id==='premium')updateThemeDescriptions();
}
