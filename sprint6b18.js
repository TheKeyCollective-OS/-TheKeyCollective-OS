
import {store} from './store.js';
import {pages} from './pages.js';

const BUILD='Sprint 6B.18 Corrective';
const $=selector=>document.querySelector(selector);
const all=selector=>[...document.querySelectorAll(selector)];
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[char]));
const money=value=>new Intl.NumberFormat('en-US',{
  style:'currency',currency:'USD'
}).format(Number(value)||0);
const localDate=()=>new Date().toISOString().slice(0,10);
const ROUTE_LABELS={
  dashboard:'Executive Dashboard',
  intelligence:'Morning Brief',
  money:'Financial Studio',
  wellness:'Wellness Studio',
  sanctuary:'Sanctuary',
  career:'Payments Academy',
  business:'Executive Intelligence',
  journal:'Reflection Garden',
  goals:'25 Hard',
  progress:'Growth Studio',
  calendar:'Agenda',
  lani:"Lani's Corner",
  premium:'Design + Data',
  profile:'My Profile'
};

function normalizedName(value){
  return String(value||'').trim().toLowerCase()
    .replace(/[–—]/g,'-').replace(/\s+/g,' ');
}
function billKey(bill){
  return `${normalizedName(bill?.name)}|${Number(bill?.amount||0).toFixed(2)}|${String(bill?.due||'')}`;
}
function dedupeBills(){
  const state=store.get();
  const map=new Map();
  (state.bills||[]).forEach(bill=>{
    const key=billKey(bill);
    if(!map.has(key))map.set(key,bill);
  });
  const unique=[...map.values()];
  if(unique.length!==(state.bills||[]).length){
    store.mutate(data=>{data.bills=unique});
  }
  return unique.sort((a,b)=>String(a.due||'').localeCompare(String(b.due||'')));
}

function academyStats(){
  const state=store.get();
  const results=Array.isArray(state.academyQuizResults)?state.academyQuizResults:[];
  const reviewTerms=[...new Set(
    (Array.isArray(state.academyReviewTerms)?state.academyReviewTerms:[])
      .map(term=>String(term).trim()).filter(Boolean)
  )];
  const now=new Date();
  const start=new Date();
  start.setHours(0,0,0,0);
  start.setDate(start.getDate()-6);
  const week=results.filter(result=>{
    const date=new Date(result.date);
    return !Number.isNaN(date.getTime())&&date>=start&&date<=now;
  });
  const sorted=[...results].sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
  const latest=sorted[0]||null;
  const average=week.length
    ?Math.round(week.reduce((sum,result)=>sum+Number(result.score||0),0)/week.length)
    :0;
  const correct=new Map(),missed=new Map();
  week.forEach(result=>{
    (result.correctTerms||[]).forEach(term=>correct.set(term,(correct.get(term)||0)+1));
    (result.missed||[]).forEach(term=>missed.set(term,(missed.get(term)||0)+1));
  });
  return {
    total:results.length,
    week:week.length,
    latest,
    average,
    reviewTerms,
    strongest:[...correct.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([term])=>term),
    studyNext:[...missed.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([term])=>term)
  };
}

function renderDashboardAcademy(router){
  const grid=$('#page .dashboard-grid');
  if(!grid)return;
  let card=$('#academyDashboard6B18')
    ||$('#academyDashboard6B17')
    ||$('#academyDashboard6B14');

  if(!card){
    card=[...grid.children].find(element=>/Payments Academy/i.test(element.textContent||''));
  }
  if(!card){
    card=document.createElement('article');
    grid.append(card);
  }

  card.id='academyDashboard6B18';
  card.className='card luxe dashboard-panel academy-dashboard-final-6b18';
  const stats=academyStats();
  card.innerHTML=`
    <div class="mini">Payments Academy</div>
    <h3>Your current quiz progress</h3>
    <div class="academy-summary-lines academy-summary-6b14">
      <div><span>Quizzes completed</span><b>${stats.total}</b></div>
      <div><span>This week</span><b>${stats.week}</b></div>
      <div><span>Latest score</span><b>${stats.latest?`${Number(stats.latest.score||0)}%`:'—'}</b></div>
      <div><span>Weekly average</span><b>${stats.week?`${stats.average}%`:'—'}</b></div>
      <div><span>Words to review</span><b>${stats.reviewTerms.length}</b></div>
    </div>
    <p class="muted">${stats.strongest.length
      ?`Strongest: ${stats.strongest.map(esc).join(' · ')}`
      :'Complete a quiz to reveal your strongest terms.'}</p>
    <p class="muted">${stats.studyNext.length
      ?`Study next: ${stats.studyNext.map(esc).join(' · ')}`
      :stats.reviewTerms.length
        ?`Review list: ${stats.reviewTerms.slice(0,3).map(esc).join(' · ')}`
        :'No terms currently need review.'}</p>
    <button class="btn ghost" id="openAcademy6B18" type="button">Open Payments Academy</button>`;
  $('#openAcademy6B18').onclick=()=>router.go('career');

  all('#academyDashboard6B14,#academyDashboard6B17').forEach(old=>{
    if(old!==card)old.remove();
  });
}

function sanctuaryMorningData(){
  const state=store.get();
  const sanctuary=state.sanctuary||{};
  const completed=Array.isArray(sanctuary.completed?.morning)
    ?sanctuary.completed.morning:[];
  const custom=Array.isArray(sanctuary.routines?.morning)
    ?sanctuary.routines.morning:[];
  const fallback=['Make the bed','Open curtains','Kitchen refresh',"Review today’s Top Three"];
  const labels=custom.length?custom:fallback;
  const savedTotal=Number(sanctuary.routineTotals?.morning||0);
  const total=Math.max(labels.length,completed.length,savedTotal,1);
  const done=Array.from({length:total},(_,index)=>Boolean(completed[index]))
    .filter(Boolean).length;
  return {done,total,labels,completed};
}

function renderMorningRoutine(router){
  const data=sanctuaryMorningData();
  let card=$('.morning-routine-card');
  if(!card){
    card=[...document.querySelectorAll('#page .card')].find(element=>
      /Morning Routine/i.test(element.textContent||'')
    );
  }
  if(!card)return;

  card.classList.add('morning-routine-card');
  const score=card.querySelector('#routineScore');
  if(score)score.textContent=`${data.done} of ${data.total}`;

  let list=card.querySelector('#morningRoutine');
  if(!list){
    list=document.createElement('div');
    list.id='morningRoutine';
    card.append(list);
  }
  list.innerHTML=`
    <div class="sanctuary-progress-6b18">
      <div class="bar"><span style="width:${data.total?Math.round(data.done/data.total*100):0}%"></span></div>
      <p><b>${data.done} of ${data.total} complete</b></p>
      <p class="muted">This count comes directly from your Sanctuary morning checklist.</p>
      <button type="button" id="openSanctuaryBrief6B18" class="btn ghost">Open Sanctuary</button>
    </div>`;
  $('#openSanctuaryBrief6B18').onclick=()=>router.go('sanctuary');
}

function stripHTML(html){
  const template=document.createElement('template');
  template.innerHTML=String(html||'');
  return (template.content.textContent||'').replace(/\s+/g,' ').trim();
}

function staticPageIndex(){
  const results=[];
  Object.entries(pages).forEach(([route,render])=>{
    if(typeof render!=='function')return;
    try{
      const text=stripHTML(render());
      if(text)results.push({
        type:'App Page',
        route,
        title:ROUTE_LABELS[route]||route,
        detail:text
      });
    }catch(error){
      console.warn('Search index skipped route',route,error);
    }
  });
  return results;
}

const ACADEMY_GLOSSARY=[
  ['Authorization','Issuer approval or decline before a card transaction proceeds.'],
  ['Capture','Submission of an authorized transaction for clearing and settlement.'],
  ['Clearing','Exchange of transaction details and calculation of obligations.'],
  ['Settlement','Movement of funds between participating financial institutions.'],
  ['Reconciliation','Proof that internal and external financial records agree.'],
  ['Pay-Ins','Money entering a platform through acceptance, retries, fraud controls, capture and settlement.'],
  ['Pay-Outs','Money leaving a platform through validation, funding, release, returns and exceptions.'],
  ['Chargebacks','Disputed card transactions involving reason codes, evidence and deadlines.'],
  ['ACH','Automated Clearing House payments with distinct return and timing rules.'],
  ['RTP','Real-time payment rail with rapid movement and strong finality characteristics.'],
  ['FedNow','Federal Reserve instant payment service.'],
  ['PCI DSS','Security framework protecting cardholder data.'],
  ['Issuer','Financial institution that approves or declines a card authorization.'],
  ['Acquirer','Institution or processor serving the merchant side of card acceptance.'],
  ['Card Network','Network carrying authorization, clearing and settlement messages.'],
  ['Interchange','Fee and rule structure between participants in card payments.'],
  ['Fraud & Risk','Identity, velocity, rules, models and manual review used to limit losses.']
];

function stateSearchIndex(){
  const state=store.get();
  const found=[];

  Object.entries(state.calendar||{}).forEach(([date,value])=>{
    found.push({
      type:'Agenda',route:'calendar',
      title:value.subject||date,
      detail:[date,value.subject,value.events,value.tasks,value.birthdays,value.holidays,value.notes]
        .filter(Boolean).join(' · ')
    });
  });
  (state.journalEntries||[]).forEach(entry=>found.push({
    type:'Reflection',route:'journal',
    title:entry.category||'Reflection',
    detail:[entry.prompt,entry.text,entry.mood,entry.date].filter(Boolean).join(' · ')
  }));
  (state.goals||[]).forEach(goal=>found.push({
    type:'25 Hard',route:'goals',
    title:goal.name||'Goal',
    detail:[goal.category,`${Number(goal.progress||0)}% complete`].filter(Boolean).join(' · ')
  }));
  dedupeBills().forEach(bill=>found.push({
    type:'Bill',route:'money',
    title:bill.name,
    detail:`${money(bill.amount)} · ${bill.due||'No due date'} · ${bill.category||'Uncategorized'} · ${bill.frequency||'No frequency'} · ${bill.paid?'Paid':'Still Due'}`
  }));
  (state.laniMemories||[]).forEach(memory=>found.push({
    type:'Lani Memory',route:'lani',
    title:memory.title||"Lani's memory",
    detail:[memory.text,memory.date].filter(Boolean).join(' · ')
  }));
  (state.careerNotes||[]).forEach(note=>found.push({
    type:'Academy Note',route:'career',
    title:'Payments Academy case note',
    detail:[note.text,note.date].filter(Boolean).join(' · ')
  }));
  (state.academyReviewTerms||[]).forEach(term=>found.push({
    type:'Academy Review',route:'career',
    title:String(term),
    detail:'This term is currently on your Payments Academy review list.'
  }));
  (state.academyQuizResults||[]).forEach((result,index)=>found.push({
    type:'Academy Quiz',route:'career',
    title:`Quiz result ${index+1}`,
    detail:[
      `${Number(result.score||0)}%`,
      ...(result.correctTerms||[]),
      ...(result.missed||[]),
      result.date
    ].filter(Boolean).join(' · ')
  }));
  ACADEMY_GLOSSARY.forEach(([term,definition])=>found.push({
    type:'Academy Term',route:'career',title:term,detail:definition
  }));
  (state.savingsGoals||[]).forEach(goal=>found.push({
    type:'Savings Goal',route:'money',
    title:goal.name||'Savings goal',
    detail:`${money(goal.current)} of ${money(goal.target)}`
  }));
  (state.sinkingFunds||[]).forEach(fund=>found.push({
    type:'Sinking Fund',route:'money',
    title:fund.name||'Sinking fund',
    detail:`${money(fund.current)} of ${money(fund.target)}`
  }));
  (state.wins||[]).forEach(win=>found.push({
    type:'Win',route:'progress',
    title:win.title||win.name||'Saved win',
    detail:typeof win==='string'?win:JSON.stringify(win)
  }));

  return found;
}

function bindGlobalSearch(router){
  const input=$('#globalSearch'),results=$('#globalSearchResults');
  if(!input||!results)return;
  const render=()=>{
    const query=input.value.trim().toLowerCase();
    if(query.length<2){
      results.innerHTML='<div class="status">Type at least two characters.</div>';
      return;
    }
    const index=[...stateSearchIndex(),...staticPageIndex()];
    const matches=index.filter(item=>
      `${item.type} ${item.title} ${item.detail}`.toLowerCase().includes(query)
    ).slice(0,50);

    results.innerHTML=matches.length?matches.map((item,index)=>`
      <button type="button" class="search-result global-result-6b18" data-search-route="${esc(item.route||'')}">
        <span class="pill">${esc(item.type)}</span>
        <div>
          <b>${esc(item.title)}</b>
          <small>${esc(ROUTE_LABELS[item.route]||item.route||'The Key Collective OS')}</small>
          <p>${esc(item.detail).slice(0,280)}</p>
        </div>
      </button>`).join('')
      :'<div class="status">No app content matched that search.</div>';

    results.querySelectorAll('[data-search-route]').forEach(button=>{
      button.onclick=()=>{
        const route=button.dataset.searchRoute;
        if(route)router.go(route);
      };
    });
  };
  input.oninput=render;
}

let billMutationInProgress=false;
function mutateBillData(mutator){
  billMutationInProgress=true;
  try{store.mutate(mutator)}finally{billMutationInProgress=false}
}

function removeExistingBillPanels(){
  all(
    '#paidCommand6B9,#billChecklistCard6B10,#billChecklist6B12,'+
    '#canonicalBills6B13,#billChecklist6B17,#billManager6B18'
  ).forEach(element=>element.remove());
}

function billEditorRow(bill){
  return `
    <article class="bill-manager-row-6b18" data-bill-row-6b18="${esc(bill.id)}">
      <div class="bill-manager-head-6b18">
        <label class="bill-paid-toggle-6b18">
          <input type="checkbox" data-bill-field="paid" ${bill.paid?'checked':''}>
          <span>${bill.paid?'Paid':'Still Due'}</span>
        </label>
        <button type="button" class="btn ghost danger" data-delete-bill-6b18>Remove</button>
      </div>
      <div class="bill-manager-fields-6b18">
        <label>Name<input data-bill-field="name" value="${esc(bill.name)}"></label>
        <label>Amount<input data-bill-field="amount" type="number" min="0" step="0.01" value="${Number(bill.amount||0)}"></label>
        <label>Due date<input data-bill-field="due" type="date" value="${esc(bill.due||'')}"></label>
        <label>Category<input data-bill-field="category" value="${esc(bill.category||'')}"></label>
        <label>Frequency
          <select data-bill-field="frequency">
            ${['One time','Weekly','Biweekly','Monthly','Quarterly','Yearly'].map(value=>
              `<option ${String(bill.frequency||'Monthly')===value?'selected':''}>${value}</option>`
            ).join('')}
          </select>
        </label>
      </div>
      <div class="mini">Changes save automatically.</div>
    </article>`;
}

function renderBillManager(){
  const page=$('.money-page')||$('#page');
  if(!page)return;
  removeExistingBillPanels();
  const bills=dedupeBills();
  const paid=bills.filter(b=>b.paid);
  const due=bills.filter(b=>!b.paid);

  const card=document.createElement('article');
  card.id='billManager6B18';
  card.className='card bill-manager-final-6b18';
  card.innerHTML=`
    <div class="section-title">
      <div>
        <div class="eyebrow">Canonical financial source</div>
        <h3>Full Bill List</h3>
      </div>
      <span class="pill">${paid.length} / ${bills.length} paid</span>
    </div>
    <p class="muted">Add, edit, remove, or mark bills Paid and Still Due. Every change is saved and shared across the app.</p>
    <div class="paid-metric-grid">
      <div><span>Paid</span><b>${money(paid.reduce((sum,b)=>sum+Number(b.amount||0),0))}</b></div>
      <div><span>Still due</span><b>${money(due.reduce((sum,b)=>sum+Number(b.amount||0),0))}</b></div>
      <div><span>Total bills</span><b>${money(bills.reduce((sum,b)=>sum+Number(b.amount||0),0))}</b></div>
      <div><span>Unique bills</span><b>${bills.length}</b></div>
    </div>
    <article class="bill-add-card-6b18">
      <h4>Add a bill</h4>
      <div class="bill-manager-fields-6b18">
        <label>Name<input id="newBillName6B18" placeholder="Bill name"></label>
        <label>Amount<input id="newBillAmount6B18" type="number" min="0" step="0.01" placeholder="0.00"></label>
        <label>Due date<input id="newBillDue6B18" type="date"></label>
        <label>Category<input id="newBillCategory6B18" placeholder="Category"></label>
        <label>Frequency
          <select id="newBillFrequency6B18">
            <option>One time</option><option>Weekly</option><option>Biweekly</option>
            <option selected>Monthly</option><option>Quarterly</option><option>Yearly</option>
          </select>
        </label>
      </div>
      <button type="button" id="addBill6B18" class="btn">Add Bill</button>
    </article>
    <div class="bill-manager-list-6b18">
      ${bills.length?bills.map(billEditorRow).join(''):'<div class="status">No bills are listed yet.</div>'}
    </div>`;
  page.append(card);

  $('#addBill6B18').onclick=()=>{
    const name=$('#newBillName6B18').value.trim();
    const amount=Number($('#newBillAmount6B18').value||0);
    const dueDate=$('#newBillDue6B18').value;
    if(!name||!dueDate||amount<0){
      alert('Add a bill name, amount, and due date.');
      return;
    }
    const next={
      id:crypto.randomUUID?.()||`bill-${Date.now()}`,
      name,amount,due:dueDate,
      category:$('#newBillCategory6B18').value.trim()||'Other',
      frequency:$('#newBillFrequency6B18').value,
      paid:false,paidDate:''
    };
    const key=billKey(next);
    if(dedupeBills().some(bill=>billKey(bill)===key)){
      alert('That exact bill already exists.');
      return;
    }
    mutateBillData(data=>{data.bills=[...(data.bills||[]),next]});
    renderBillManager();
  };

  card.querySelectorAll('[data-bill-row-6b18]').forEach(row=>{
    const id=row.dataset.billRow6b18;
    row.querySelectorAll('[data-bill-field]').forEach(input=>{
      const event=input.type==='checkbox'||input.tagName==='SELECT'?'change':'input';
      input.addEventListener(event,()=>{
        const field=input.dataset.billField;
        mutateBillData(data=>{
          const bill=(data.bills||[]).find(item=>String(item.id)===String(id));
          if(!bill)return;
          if(field==='amount')bill.amount=Math.max(0,Number(input.value||0));
          else if(field==='paid'){
            bill.paid=input.checked;
            bill.paidDate=input.checked?localDate():'';
          }else bill[field]=input.value;
        });
        if(field==='paid'){
          renderBillManager();
        }
      });
      if(event==='input'){
        input.addEventListener('change',renderBillManager);
      }
    });
    row.querySelector('[data-delete-bill-6b18]').onclick=()=>{
      const bill=dedupeBills().find(item=>String(item.id)===String(id));
      if(!bill)return;
      if(!confirm(`Remove ${bill.name}? This cannot be undone.`))return;
      mutateBillData(data=>{
        data.bills=(data.bills||[]).filter(item=>String(item.id)!==String(id));
      });
      renderBillManager();
    };
  });
}

function renderSobrietyTracker(){
  const page=$('#page');
  if(!page)return;
  let target=[...page.querySelectorAll('.card')].find(card=>
    /Hydration consistency/i.test(card.textContent||'')
  );
  if(!target){
    target=$('#sobrietyTracker6B18');
  }
  if(!target)return;

  const state=store.get();
  if(!state.sobriety?.lastReset){
    store.mutate(data=>{
      data.sobriety={...(data.sobriety||{}),lastReset:localDate()};
    });
    return renderSobrietyTracker();
  }

  const resetDate=state.sobriety.lastReset;
  const resetAt=new Date(`${resetDate}T00:00:00`);
  const todayAt=new Date(`${localDate()}T00:00:00`);
  const streak=Math.max(0,Math.floor((todayAt-resetAt)/86400000));

  target.id='sobrietyTracker6B18';
  target.innerHTML=`
    <div class="section-title">
      <div>
        <div class="eyebrow">One day at a time</div>
        <h3>Sobriety Tracker</h3>
      </div>
      <span class="pill">${streak} day${streak===1?'':'s'}</span>
    </div>
    <div class="sobriety-streak-6b18">
      <div class="metric">${streak}</div>
      <p>Current sober-day streak</p>
    </div>
    <div class="status"><b>Last reset:</b> ${new Date(`${resetDate}T12:00:00`).toLocaleDateString('en-US',{
      month:'long',day:'numeric',year:'numeric'
    })}</div>
    <button type="button" id="resetSobriety6B18" class="btn ghost danger">Reset Sobriety Streak</button>`;
  $('#resetSobriety6B18').onclick=()=>{
    if(!confirm('Reset your sobriety streak to day 0?'))return;
    store.mutate(data=>{
      data.sobriety={...(data.sobriety||{}),lastReset:localDate()};
    });
    renderSobrietyTracker();
  };
}

function refreshCurrentRoute(id,router){
  if(id==='dashboard'){
    renderDashboardAcademy(router);
    requestAnimationFrame(()=>renderDashboardAcademy(router));
    setTimeout(()=>renderDashboardAcademy(router),150);
  }
  if(id==='intelligence'){
    renderMorningRoutine(router);
    bindGlobalSearch(router);
    requestAnimationFrame(()=>{
      renderMorningRoutine(router);
      bindGlobalSearch(router);
    });
  }
  if(id==='money'){
    requestAnimationFrame(()=>requestAnimationFrame(renderBillManager));
  }
  if(id==='wellness'){
    requestAnimationFrame(()=>requestAnimationFrame(renderSobrietyTracker));
  }
}

let stateBound=false;
function bindStateRefresh(router){
  if(stateBound)return;
  stateBound=true;
  window.addEventListener('kc:state',()=>{
    const route=location.hash.replace(/^#\/?/,'')||'dashboard';
    if(route==='money'&&billMutationInProgress)return;
    if(['dashboard','intelligence','money','wellness'].includes(route)){
      refreshCurrentRoute(route,router);
    }
  });
}

export async function enhanceSprint6B18(id,router){
  const badge=$('#kcBuildStatus b');
  if(badge)badge.textContent=BUILD;
  bindStateRefresh(router);
  refreshCurrentRoute(id,router);
}
