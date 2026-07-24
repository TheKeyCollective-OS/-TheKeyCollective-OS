import {store} from './store.js';

const BUILD='Sprint 6B.20 Financial + Dashboard Corrective';
const $=selector=>document.querySelector(selector);
const all=selector=>[...document.querySelectorAll(selector)];
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[char]));
const money=value=>new Intl.NumberFormat('en-US',{
  style:'currency',currency:'USD'
}).format(Number(value)||0);
const todayKey=()=>{
  const date=new Date();
  const offset=date.getTimezoneOffset()*60000;
  return new Date(date-offset).toISOString().slice(0,10);
};
const normalized=value=>String(value||'').trim().toLowerCase().replace(/[–—]/g,'-').replace(/\s+/g,' ');
const billIdentity=bill=>`${normalized(bill?.name)}|${Number(bill?.amount||0).toFixed(2)}|${String(bill?.due||'')}`;

function uniqueBills(source=store.get().bills||[]){
  const map=new Map();
  source.forEach(bill=>{
    const key=billIdentity(bill);
    if(!map.has(key))map.set(key,bill);
  });
  return [...map.values()].sort((a,b)=>
    String(a.due||'').localeCompare(String(b.due||'')) ||
    String(a.name||'').localeCompare(String(b.name||''))
  );
}

function dedupeStoredBills(){
  const current=store.get().bills||[];
  const unique=uniqueBills(current);
  if(unique.length===current.length)return;
  store.mutate(state=>{state.bills=unique});
}

function sobrietyDays(){
  const reset=store.get().sobriety?.lastReset;
  if(!reset)return 0;
  const start=new Date(`${reset}T00:00:00`);
  const today=new Date(`${todayKey()}T00:00:00`);
  if(Number.isNaN(start.getTime())||Number.isNaN(today.getTime()))return 0;
  return Math.max(0,Math.floor((today-start)/86400000));
}

function financialMarkup(){
  const state=store.get();
  const list=uniqueBills();
  const paid=list.filter(bill=>bill.paid);
  const due=list.filter(bill=>!bill.paid);
  const paidTotal=paid.reduce((sum,bill)=>sum+Number(bill.amount||0),0);
  const dueTotal=due.reduce((sum,bill)=>sum+Number(bill.amount||0),0);
  const checking=Number(state.checking||0);
  const savings=Number(state.savings||0);
  const available=checking+savings;

  return `<section id="financialControls6B20" class="financial-controls-6b20">
    <article class="card balance-control-6b20">
      <div class="section-title">
        <div><div class="eyebrow">Cash position</div><h3>Checking + Savings</h3></div>
        <span class="pill" id="availableCashPill6B20">${money(available)} available</span>
      </div>
      <p class="muted">Enter the current balance in each account. Available cash updates immediately and is shared across the app.</p>
      <div class="balance-grid-6b20">
        <label>Checking balance
          <input id="checkingBalance6B20" type="number" inputmode="decimal" min="0" step="0.01" value="${checking}">
        </label>
        <label>Savings balance
          <input id="savingsBalance6B20" type="number" inputmode="decimal" min="0" step="0.01" value="${savings}">
        </label>
        <div class="balance-total-6b20"><small>Available cash</small><strong id="availableCash6B20">${money(available)}</strong></div>
      </div>
      <div class="status" id="balanceStatus6B20">Balances save automatically.</div>
    </article>

    <article class="card full-bill-manager-6b20">
      <div class="section-title">
        <div><div class="eyebrow">Complete bill control</div><h3>Full Bill List</h3></div>
        <span class="pill" id="billCountPill6B20">${paid.length} of ${list.length} paid</span>
      </div>
      <p class="muted">This is the one shared bill list. Add, edit, remove, or mark bills Paid and Still Due. Exact duplicates are blocked.</p>
      <div class="paid-metric-grid bill-totals-6b20">
        <div><span>Paid</span><b id="paidTotal6B20">${money(paidTotal)}</b></div>
        <div><span>Still due</span><b id="dueTotal6B20">${money(dueTotal)}</b></div>
        <div><span>Total bills</span><b id="allBillTotal6B20">${money(paidTotal+dueTotal)}</b></div>
        <div><span>Unique bills</span><b id="billCount6B20">${list.length}</b></div>
      </div>

      <article class="bill-add-6b20">
        <h4>Add a bill</h4>
        <div class="bill-fields-6b20">
          <label>Bill name<input id="billNewName6B20" placeholder="Rent, internet, insurance…"></label>
          <label>Amount<input id="billNewAmount6B20" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00"></label>
          <label>Due date<input id="billNewDue6B20" type="date"></label>
          <label>Category<input id="billNewCategory6B20" placeholder="Housing, utilities…"></label>
          <label>Frequency<select id="billNewFrequency6B20"><option>One-time</option><option>Weekly</option><option>Biweekly</option><option selected>Monthly</option><option>Quarterly</option><option>Annual</option></select></label>
        </div>
        <button type="button" class="btn" id="billAdd6B20">Add Bill</button>
        <div class="status" id="billStatus6B20">Ready.</div>
      </article>

      <div class="bill-list-6b20" id="billList6B20">
        ${list.length?list.map(billRowMarkup).join(''):'<div class="status">No bills are listed yet.</div>'}
      </div>
    </article>
  </section>`;
}

function billRowMarkup(bill){
  return `<article class="bill-row-6b20 ${bill.paid?'is-paid':''}" data-bill-id-6b20="${esc(bill.id)}">
    <div class="bill-row-top-6b20">
      <label class="bill-status-6b20">
        <input type="checkbox" data-action-6b20="toggle-paid" ${bill.paid?'checked':''}>
        <span>${bill.paid?'Paid':'Still Due'}</span>
      </label>
      <button type="button" class="btn ghost danger" data-action-6b20="remove">Remove</button>
    </div>
    <div class="bill-fields-6b20">
      <label>Bill name<input data-field-6b20="name" value="${esc(bill.name)}"></label>
      <label>Amount<input data-field-6b20="amount" type="number" inputmode="decimal" min="0" step="0.01" value="${Number(bill.amount||0)}"></label>
      <label>Due date<input data-field-6b20="due" type="date" value="${esc(bill.due||'')}"></label>
      <label>Category<input data-field-6b20="category" value="${esc(bill.category||'')}"></label>
      <label>Frequency<select data-field-6b20="frequency">
        ${['One-time','Weekly','Biweekly','Monthly','Quarterly','Annual'].map(option=>
          `<option ${String(bill.frequency||'Monthly')===option?'selected':''}>${option}</option>`
        ).join('')}
      </select></label>
    </div>
    <div class="bill-row-footer-6b20">
      <small>${bill.paid?`Paid ${esc(bill.paidDate||todayKey())}`:'Payment still due'}</small>
      <button type="button" class="btn secondary" data-action-6b20="save">Save Changes</button>
    </div>
  </article>`;
}

function patchMoneyHTML(baseHTML){
  return `<div class="money-page money-page-6b20">${baseHTML}${financialMarkup()}</div>`;
}

function patchDashboardHTML(baseHTML){
  const template=document.createElement('template');
  template.innerHTML=baseHTML;
  const dashboard=template.content.querySelector('.dashboard-grid');
  if(dashboard){
    [...dashboard.children].forEach(card=>{
      const text=card.textContent||'';
      if(/Payments Academy/i.test(text)||/Executive Intelligence/i.test(text))card.remove();
    });
    const wellness=[...dashboard.children].find(card=>/Wellness today/i.test(card.textContent||''));
    if(wellness){
      const metricSpans=[...wellness.querySelectorAll('.metric-row > span')];
      const gym=metricSpans.find(span=>/Gym min/i.test(span.textContent||''));
      if(gym)gym.innerHTML=`<b data-sobriety-days-6b20>${sobrietyDays()}</b><small>Days sober</small>`;
    }
  }
  return template.innerHTML;
}

export function patchPagesSprint6B20(pages){
  const originalMoney=pages.money;
  const originalDashboard=pages.dashboard;
  pages.money=()=>patchMoneyHTML(originalMoney());
  pages.dashboard=()=>patchDashboardHTML(originalDashboard());
}

function setStatus(id,message){
  const node=$(id);
  if(node)node.textContent=message;
}

function saveBalances(){
  const checking=Math.max(0,Number($('#checkingBalance6B20')?.value||0));
  const savings=Math.max(0,Number($('#savingsBalance6B20')?.value||0));
  store.mutate(state=>{
    state.checking=checking;
    state.savings=savings;
    state.financial={...(state.financial||{}),availableCash:checking+savings};
  });
  const total=checking+savings;
  if($('#availableCash6B20'))$('#availableCash6B20').textContent=money(total);
  if($('#availableCashPill6B20'))$('#availableCashPill6B20').textContent=`${money(total)} available`;
  setStatus('#balanceStatus6B20','Balances saved. Available cash updated across the app.');
}

function renderBillListOnly(){
  const list=uniqueBills();
  const paid=list.filter(bill=>bill.paid);
  const due=list.filter(bill=>!bill.paid);
  const paidTotal=paid.reduce((sum,bill)=>sum+Number(bill.amount||0),0);
  const dueTotal=due.reduce((sum,bill)=>sum+Number(bill.amount||0),0);
  if($('#billList6B20'))$('#billList6B20').innerHTML=list.length?list.map(billRowMarkup).join(''):'<div class="status">No bills are listed yet.</div>';
  if($('#paidTotal6B20'))$('#paidTotal6B20').textContent=money(paidTotal);
  if($('#dueTotal6B20'))$('#dueTotal6B20').textContent=money(dueTotal);
  if($('#allBillTotal6B20'))$('#allBillTotal6B20').textContent=money(paidTotal+dueTotal);
  if($('#billCount6B20'))$('#billCount6B20').textContent=String(list.length);
  if($('#billCountPill6B20'))$('#billCountPill6B20').textContent=`${paid.length} of ${list.length} paid`;
  bindBillRows();
}

function bindBillRows(){
  all('[data-bill-id-6b20]').forEach(row=>{
    const id=row.dataset.billId6b20;
    const paidToggle=row.querySelector('[data-action-6b20="toggle-paid"]');
    const saveButton=row.querySelector('[data-action-6b20="save"]');
    const removeButton=row.querySelector('[data-action-6b20="remove"]');

    paidToggle.onchange=event=>{
      store.mutate(state=>{
        const bill=(state.bills||[]).find(item=>String(item.id)===String(id));
        if(!bill)return;
        bill.paid=event.target.checked;
        bill.paidDate=bill.paid?todayKey():'';
      });
      renderBillListOnly();
      setStatus('#billStatus6B20','Payment status saved and totals updated.');
    };

    saveButton.onclick=()=>{
      const values={};
      row.querySelectorAll('[data-field-6b20]').forEach(input=>values[input.dataset.field6b20]=input.value);
      const name=String(values.name||'').trim();
      const due=String(values.due||'');
      const amount=Math.max(0,Number(values.amount||0));
      if(!name||!due){
        setStatus('#billStatus6B20','Bill name and due date are required.');
        return;
      }
      const proposed={name,amount,due};
      const duplicate=uniqueBills().some(item=>String(item.id)!==String(id)&&billIdentity(item)===billIdentity(proposed));
      if(duplicate){
        setStatus('#billStatus6B20','That exact bill already exists. No duplicate was created.');
        return;
      }
      store.mutate(state=>{
        const bill=(state.bills||[]).find(item=>String(item.id)===String(id));
        if(!bill)return;
        bill.name=name;
        bill.amount=amount;
        bill.due=due;
        bill.category=String(values.category||'').trim()||'Other';
        bill.frequency=values.frequency||'Monthly';
      });
      renderBillListOnly();
      setStatus('#billStatus6B20','Bill changes saved and totals updated.');
    };

    removeButton.onclick=()=>{
      const bill=uniqueBills().find(item=>String(item.id)===String(id));
      if(!bill||!confirm(`Remove ${bill.name}? This cannot be undone.`))return;
      store.mutate(state=>{
        state.bills=(state.bills||[]).filter(item=>String(item.id)!==String(id));
      });
      renderBillListOnly();
      setStatus('#billStatus6B20','Bill removed and totals updated.');
    };
  });
}

function bindForecast(){
  const button=$('#saveForecast');
  if(!button)return;
  button.onclick=()=>{
    const income=Math.max(0,Number($('#forecastIncome')?.value||0));
    const spending=Math.max(0,Number($('#forecastSpending')?.value||0));
    store.mutate(state=>{
      state.monthlyIncome=income;
      state.financial={...(state.financial||{}),monthlySpending:spending};
    });
    const status=$('#financialControls6B20 .balance-control-6b20 .status');
    if(status)status.textContent='Forecast assumptions saved. Reopen Financial Studio to refresh projections.';
  };
}

function bindMoney(){
  dedupeStoredBills();
  bindForecast();
  const checking=$('#checkingBalance6B20');
  const savings=$('#savingsBalance6B20');
  if(checking){checking.onchange=saveBalances;checking.onblur=saveBalances;}
  if(savings){savings.onchange=saveBalances;savings.onblur=saveBalances;}

  const add=$('#billAdd6B20');
  if(add)add.onclick=()=>{
    const name=$('#billNewName6B20').value.trim();
    const amount=Math.max(0,Number($('#billNewAmount6B20').value||0));
    const due=$('#billNewDue6B20').value;
    const next={
      id:crypto.randomUUID?.()||`bill-${Date.now()}`,
      name,amount,due,
      category:$('#billNewCategory6B20').value.trim()||'Other',
      frequency:$('#billNewFrequency6B20').value,
      paid:false,paidDate:''
    };
    if(!name||!due){
      setStatus('#billStatus6B20','Add a bill name, amount, and due date.');
      return;
    }
    if(uniqueBills().some(bill=>billIdentity(bill)===billIdentity(next))){
      setStatus('#billStatus6B20','That exact bill already exists. No duplicate was added.');
      return;
    }
    store.mutate(state=>{state.bills=[...(state.bills||[]),next]});
    ['#billNewName6B20','#billNewAmount6B20','#billNewDue6B20','#billNewCategory6B20'].forEach(selector=>{if($(selector))$(selector).value=''});
    renderBillListOnly();
    setStatus('#billStatus6B20','Bill added and totals updated.');
  };
  bindBillRows();
}

let dashboardObserver6B20=null;
let stateListenerBound6B20=false;
function cleanDashboard(){
  const dashboard=$('#page .dashboard-grid');
  if(!dashboard)return;
  [...dashboard.children].forEach(card=>{
    const text=card.textContent||'';
    if(/Payments Academy/i.test(text)||/Executive Intelligence/i.test(text))card.remove();
  });
  const wellness=[...dashboard.children].find(card=>/Wellness today/i.test(card.textContent||''));
  if(wellness){
    const spans=[...wellness.querySelectorAll('.metric-row > span')];
    const gym=spans.find(span=>/Gym min|Days sober/i.test(span.textContent||''));
    if(gym)gym.innerHTML=`<b data-sobriety-days-6b20>${sobrietyDays()}</b><small>Days sober</small>`;
  }
}

export async function enhanceSprint6B20(id){
  const badge=$('#kcBuildStatus b');
  if(badge)badge.textContent=BUILD;
  if(id==='money')bindMoney();
  if(id==='dashboard'){
    cleanDashboard();
    requestAnimationFrame(cleanDashboard);
    setTimeout(cleanDashboard,120);
    setTimeout(cleanDashboard,500);
    const dashboard=$('#page .dashboard-grid');
    if(dashboard){
      dashboardObserver6B20?.disconnect();
      dashboardObserver6B20=new MutationObserver(()=>cleanDashboard());
      dashboardObserver6B20.observe(dashboard,{childList:true,subtree:true});
    }
    if(!stateListenerBound6B20){
      stateListenerBound6B20=true;
      window.addEventListener('kc:state',()=>{
        if(location.hash.replace(/^#/,'')==='dashboard')queueMicrotask(cleanDashboard);
      });
    }
  }else{
    dashboardObserver6B20?.disconnect();
    dashboardObserver6B20=null;
  }
}
