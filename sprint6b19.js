import {store} from './store.js';

const BUILD='Sprint 6B.19 Financial Studio Corrective';
const $=selector=>document.querySelector(selector);
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[char]));
const money=value=>new Intl.NumberFormat('en-US',{
  style:'currency',currency:'USD'
}).format(Number(value)||0);
const localDate=()=>new Date().toISOString().slice(0,10);

function bills(){
  return [...(store.get().bills||[])].sort((a,b)=>
    String(a.due||'').localeCompare(String(b.due||'')) ||
    String(a.name||'').localeCompare(String(b.name||''))
  );
}

function removeCompetingBottomLists(){
  document.querySelectorAll(
    '#paidCommand6B9,#billChecklistCard6B10,#billChecklist6B12,'+
    '#canonicalBills6B13,#billChecklist6B17,#billManager6B18'
  ).forEach(element=>element.remove());
}

function rowHTML(bill){
  return `<article class="bill-row-6b19 ${bill.paid?'is-paid':''}" data-bill-id-6b19="${esc(bill.id)}">
    <div class="bill-row-top-6b19">
      <label class="bill-status-6b19">
        <input type="checkbox" data-action-6b19="toggle-paid" ${bill.paid?'checked':''}>
        <span>${bill.paid?'Paid':'Still Due'}</span>
      </label>
      <button type="button" class="btn ghost danger" data-action-6b19="remove">Remove</button>
    </div>
    <div class="bill-fields-6b19">
      <label>Bill name<input data-field-6b19="name" value="${esc(bill.name)}"></label>
      <label>Amount<input data-field-6b19="amount" type="number" min="0" step="0.01" value="${Number(bill.amount||0)}"></label>
      <label>Due date<input data-field-6b19="due" type="date" value="${esc(bill.due||'')}"></label>
      <label>Category<input data-field-6b19="category" value="${esc(bill.category||'')}"></label>
      <label>Frequency<select data-field-6b19="frequency">
        ${['One-time','Weekly','Biweekly','Monthly','Quarterly','Annual'].map(option=>
          `<option ${String(bill.frequency||'Monthly')===option?'selected':''}>${option}</option>`
        ).join('')}
      </select></label>
    </div>
    <div class="bill-row-footer-6b19">
      <small>${bill.paid?`Paid ${esc(bill.paidDate||localDate())}`:'Payment still due'}</small>
      <button type="button" class="btn secondary" data-action-6b19="save">Save Changes</button>
    </div>
  </article>`;
}

function render(){
  removeCompetingBottomLists();
  let mount=$('#billControlMount6B19');
  const page=$('.money-page');
  if(!page)return;
  if(!mount){
    mount=document.createElement('section');
    mount.id='billControlMount6B19';
    mount.className='bill-control-mount-6b19';
    page.append(mount);
  }

  const list=bills();
  const paid=list.filter(bill=>bill.paid);
  const due=list.filter(bill=>!bill.paid);
  const paidTotal=paid.reduce((sum,bill)=>sum+Number(bill.amount||0),0);
  const dueTotal=due.reduce((sum,bill)=>sum+Number(bill.amount||0),0);

  mount.innerHTML=`<article class="card full-bill-manager-6b19">
    <div class="section-title">
      <div><div class="eyebrow">Complete bill control</div><h3>Full Bill List</h3></div>
      <span class="pill">${paid.length} of ${list.length} paid</span>
    </div>
    <p class="muted">This is the complete editable list. Add, edit, remove, or mark any bill Paid or Still Due.</p>
    <div class="paid-metric-grid bill-totals-6b19">
      <div><span>Paid</span><b>${money(paidTotal)}</b></div>
      <div><span>Still due</span><b>${money(dueTotal)}</b></div>
      <div><span>Total</span><b>${money(paidTotal+dueTotal)}</b></div>
      <div><span>Bills</span><b>${list.length}</b></div>
    </div>
    <article class="bill-add-6b19">
      <h4>Add a bill</h4>
      <div class="bill-fields-6b19">
        <label>Bill name<input id="billNewName6B19" placeholder="Rent, internet, insurance…"></label>
        <label>Amount<input id="billNewAmount6B19" type="number" min="0" step="0.01" placeholder="0.00"></label>
        <label>Due date<input id="billNewDue6B19" type="date"></label>
        <label>Category<input id="billNewCategory6B19" placeholder="Housing, utilities…"></label>
        <label>Frequency<select id="billNewFrequency6B19"><option>One-time</option><option>Weekly</option><option>Biweekly</option><option selected>Monthly</option><option>Quarterly</option><option>Annual</option></select></label>
      </div>
      <button type="button" class="btn" id="billAdd6B19">Add Bill</button>
    </article>
    <div class="bill-list-final-6b19">
      ${list.length?list.map(rowHTML).join(''):'<div class="status">No bills are listed yet.</div>'}
    </div>
  </article>`;

  $('#billAdd6B19').onclick=()=>{
    const name=$('#billNewName6B19').value.trim();
    const amount=Number($('#billNewAmount6B19').value||0);
    const dueDate=$('#billNewDue6B19').value;
    if(!name||!dueDate||amount<0){
      alert('Add a bill name, amount, and due date.');
      return;
    }
    store.mutate(state=>{
      state.bills=state.bills||[];
      state.bills.push({
        id:crypto.randomUUID?.()||`bill-${Date.now()}`,
        name,amount,due:dueDate,
        category:$('#billNewCategory6B19').value.trim()||'Other',
        frequency:$('#billNewFrequency6B19').value,
        paid:false,paidDate:''
      });
    });
    render();
  };

  mount.querySelectorAll('[data-bill-id-6b19]').forEach(row=>{
    const id=row.dataset.billId6b19;
    row.querySelector('[data-action-6b19="toggle-paid"]').onchange=event=>{
      store.mutate(state=>{
        const bill=(state.bills||[]).find(item=>String(item.id)===String(id));
        if(!bill)return;
        bill.paid=event.target.checked;
        bill.paidDate=bill.paid?localDate():'';
      });
      render();
    };
    row.querySelector('[data-action-6b19="save"]').onclick=()=>{
      const values={};
      row.querySelectorAll('[data-field-6b19]').forEach(input=>values[input.dataset.field6b19]=input.value);
      if(!String(values.name||'').trim()||!values.due){
        alert('Bill name and due date are required.');
        return;
      }
      store.mutate(state=>{
        const bill=(state.bills||[]).find(item=>String(item.id)===String(id));
        if(!bill)return;
        bill.name=String(values.name).trim();
        bill.amount=Math.max(0,Number(values.amount||0));
        bill.due=values.due;
        bill.category=String(values.category||'').trim()||'Other';
        bill.frequency=values.frequency||'Monthly';
      });
      render();
    };
    row.querySelector('[data-action-6b19="remove"]').onclick=()=>{
      const bill=bills().find(item=>String(item.id)===String(id));
      if(!bill||!confirm(`Remove ${bill.name}?`))return;
      store.mutate(state=>{
        state.bills=(state.bills||[]).filter(item=>String(item.id)!==String(id));
      });
      render();
    };
  });
}

export async function enhanceSprint6B19(id){
  const badge=$('#kcBuildStatus b');
  if(badge)badge.textContent=BUILD;
  if(id!=='money')return;
  render();
  requestAnimationFrame(render);
  setTimeout(render,100);
  setTimeout(render,400);
}
