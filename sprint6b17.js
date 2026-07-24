
import {store} from './store.js';

const BUILD='Sprint 6B.17 Corrective';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n)||0);
const localDate=()=>new Date().toISOString().slice(0,10);

function normalizedName(value){
  return String(value||'').trim().toLowerCase().replace(/[–—]/g,'-').replace(/\s+/g,' ');
}
function billKey(bill){
  return `${normalizedName(bill?.name)}|${Number(bill?.amount||0).toFixed(2)}|${String(bill?.due||'')}`;
}
function uniqueBills(){
  const map=new Map();
  (store.get().bills||[]).forEach(bill=>{
    const key=billKey(bill);
    if(!map.has(key))map.set(key,bill);
  });
  return [...map.values()].sort((a,b)=>String(a.due||'').localeCompare(String(b.due||'')));
}

function removeCompetingBillLists(){
  document.querySelectorAll(
    '#paidCommand6B9,#billChecklistCard6B10,#billChecklist6B12,#canonicalBills6B13,#billChecklist6B17'
  ).forEach(element=>element.remove());
}

function renderBillChecklist6B17(){
  const page=$('.money-page')||$('#page');
  if(!page)return;

  const rememberedFilter=sessionStorage.getItem('kc.billChecklistFilter6B17')||'all';
  removeCompetingBillLists();

  const state=store.get();
  const bills=uniqueBills();
  const paid=bills.filter(b=>b.paid);
  const due=bills.filter(b=>!b.paid);
  const visible=bills.filter(b=>rememberedFilter==='all'||(rememberedFilter==='paid'?b.paid:!b.paid));

  const card=document.createElement('article');
  card.id='billChecklist6B17';
  card.className='card canonical-bills-6b13 bill-checklist-final-6b17';
  card.innerHTML=`
    <div class="section-title">
      <div>
        <div class="eyebrow">Bill payment tracker</div>
        <h3>Paid & Still Due</h3>
      </div>
      <span class="pill">${paid.length} / ${bills.length} paid</span>
    </div>
    <p class="muted">Tap any bill to move it between Paid and Still Due. Your selection is saved automatically.</p>
    <div class="paid-metric-grid">
      <div><span>Paid</span><b>${money(paid.reduce((sum,b)=>sum+Number(b.amount||0),0))}</b></div>
      <div><span>Still due</span><b>${money(due.reduce((sum,b)=>sum+Number(b.amount||0),0))}</b></div>
      <div><span>Total bills</span><b>${money(bills.reduce((sum,b)=>sum+Number(b.amount||0),0))}</b></div>
      <div><span>Unique bills</span><b>${bills.length}</b></div>
    </div>
    <div class="segmented bill-filter-6b17">
      <button type="button" data-bill-filter-6b17="all">All</button>
      <button type="button" data-bill-filter-6b17="due">Still Due</button>
      <button type="button" data-bill-filter-6b17="paid">Paid</button>
    </div>
    <div class="canonical-bill-list-6b13">
      ${visible.length?visible.map(bill=>`
        <button type="button"
          class="canonical-bill-row-6b13 ${bill.paid?'paid':''}"
          data-toggle-bill-6b17="${esc(bill.id)}">
          <span class="bill-checkbox-6b12">${bill.paid?'✓':''}</span>
          <span>
            <b>${esc(bill.name)}</b>
            <small>${money(bill.amount)} · due ${esc(bill.due||'not set')}${bill.paid?` · paid ${esc(bill.paidDate||localDate())}`:''}</small>
          </span>
          <strong>${bill.paid?'Paid':'Still Due'}</strong>
        </button>
      `).join(''):'<div class="status">No bills in this view.</div>'}
    </div>`;

  page.append(card);

  card.querySelectorAll('[data-bill-filter-6b17]').forEach(button=>{
    button.classList.toggle('active',button.dataset.billFilter6b17===rememberedFilter);
    button.onclick=()=>{
      sessionStorage.setItem('kc.billChecklistFilter6B17',button.dataset.billFilter6b17);
      renderBillChecklist6B17();
    };
  });

  card.querySelectorAll('[data-toggle-bill-6b17]').forEach(button=>{
    button.onclick=()=>{
      const id=button.dataset.toggleBill6b17;
      store.mutate(data=>{
        const bill=(data.bills||[]).find(item=>String(item.id)===String(id));
        if(!bill)return;
        bill.paid=!bill.paid;
        bill.paidDate=bill.paid?localDate():'';
      });
      renderBillChecklist6B17();
    };
  });
}

function academyStats(){
  const state=store.get();
  const results=Array.isArray(state.academyQuizResults)?state.academyQuizResults:[];
  const reviewTerms=Array.isArray(state.academyReviewTerms)?state.academyReviewTerms:[];
  const now=new Date();
  const start=new Date();
  start.setHours(0,0,0,0);
  start.setDate(start.getDate()-6);

  const week=results.filter(result=>{
    const date=new Date(result.date);
    return !Number.isNaN(date.getTime())&&date>=start&&date<=now;
  });
  const latest=[...results].sort((a,b)=>new Date(b.date||0)-new Date(a.date||0))[0]||null;
  const average=week.length
    ?Math.round(week.reduce((sum,result)=>sum+Number(result.score||0),0)/week.length)
    :0;

  const correct=new Map();
  const missed=new Map();
  week.forEach(result=>{
    (result.correctTerms||[]).forEach(term=>correct.set(term,(correct.get(term)||0)+1));
    (result.missed||[]).forEach(term=>missed.set(term,(missed.get(term)||0)+1));
  });

  return {
    total:results.length,
    week:week.length,
    latest,
    average,
    reviewCount:reviewTerms.length,
    strongest:[...correct.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([term])=>term),
    review:[...missed.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([term])=>term)
  };
}

function renderAcademyDashboard6B17(router){
  const grid=$('#page .dashboard-grid');
  if(!grid)return;

  let card=$('#academyDashboard6B14');
  if(!card){
    card=[...grid.querySelectorAll('.dashboard-panel,.card')].find(element=>/Payments Academy/i.test(element.textContent));
  }
  if(!card){
    card=document.createElement('article');
    grid.append(card);
  }
  card.id='academyDashboard6B17';
  card.className='card luxe dashboard-panel academy-dashboard-final-6b17';

  const stats=academyStats();
  card.innerHTML=`
    <div class="mini">Payments Academy</div>
    <h3>Your current quiz progress</h3>
    <div class="academy-summary-lines academy-summary-6b14">
      <div><span>Quizzes completed</span><b>${stats.total}</b></div>
      <div><span>Latest score</span><b>${stats.latest?`${Number(stats.latest.score||0)}%`:'—'}</b></div>
      <div><span>Weekly average</span><b>${stats.week?`${stats.average}%`:'—'}</b></div>
      <div><span>Words to study</span><b>${stats.reviewCount}</b></div>
    </div>
    <p class="muted">${stats.strongest.length?`Strongest: ${stats.strongest.map(esc).join(' · ')}`:'Complete a quiz to reveal your strongest terms.'}</p>
    <p class="muted">${stats.review.length?`Study next: ${stats.review.map(esc).join(' · ')}`:stats.reviewCount?'Open the Academy to continue your review list.':'No terms currently need review.'}</p>
    <button class="btn ghost" id="openAcademy6B17" type="button">Open Payments Academy</button>`;
  $('#openAcademy6B17').onclick=()=>router.go('career');
}

function removeBottomExecutiveIntelligence(){
  const grid=$('#page .dashboard-grid');
  if(!grid)return;
  const matches=[...grid.querySelectorAll(':scope > .dashboard-panel,:scope > .card')]
    .filter(element=>/Executive Intelligence/i.test(element.textContent));
  matches.forEach(element=>element.remove());
}

function cleanDashboard(router){
  document.querySelectorAll('#dashboardMorningBrief6B15').forEach(element=>element.remove());
  removeBottomExecutiveIntelligence();
  renderAcademyDashboard6B17(router);
}

let refreshBound=false;
function bindRefresh(router){
  if(refreshBound)return;
  refreshBound=true;
  window.addEventListener('kc:state',()=>{
    const route=location.hash.replace(/^#\/?/,'')||'dashboard';
    if(route==='dashboard')cleanDashboard(router);
    if(route==='money')requestAnimationFrame(()=>requestAnimationFrame(renderBillChecklist6B17));
  });
}

export async function enhanceSprint6B17(id,router){
  const badge=$('#kcBuildStatus b');
  if(badge)badge.textContent=BUILD;
  bindRefresh(router);

  if(id==='dashboard'){
    cleanDashboard(router);
    requestAnimationFrame(()=>cleanDashboard(router));
  }
  if(id==='money'){
    requestAnimationFrame(()=>requestAnimationFrame(renderBillChecklist6B17));
  }
}
