import {store} from './store.js';

const BUILD='Sprint 6B.21 Bill Actions Corrective';
const $=selector=>document.querySelector(selector);
const money=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(value)||0);
const normalized=value=>String(value||'').trim().toLowerCase().replace(/[–—]/g,'-').replace(/\s+/g,' ');
const billIdentity=bill=>`${normalized(bill?.name)}|${Number(bill?.amount||0).toFixed(2)}|${String(bill?.due||'')}`;
const todayKey=()=>{
  const date=new Date();
  return new Date(date-date.getTimezoneOffset()*60000).toISOString().slice(0,10);
};
const newId=index=>crypto.randomUUID?.()||`bill-${Date.now()}-${index}-${Math.random().toString(36).slice(2,8)}`;

let boundRoot=null;
let stateBound=false;
let syncing=false;

function orderedBills(){
  const seen=new Set();
  return [...(store.get().bills||[])]
    .filter(bill=>{
      const key=billIdentity(bill);
      if(seen.has(key))return false;
      seen.add(key);
      return true;
    })
    .sort((a,b)=>String(a.due||'').localeCompare(String(b.due||''))||String(a.name||'').localeCompare(String(b.name||'')));
}

function ensureStableIds(){
  const bills=store.get().bills||[];
  const used=new Set();
  let changed=false;
  const repaired=bills.map((bill,index)=>{
    let id=String(bill?.id||'').trim();
    if(!id||used.has(id)){
      id=newId(index);
      changed=true;
    }
    used.add(id);
    return id===bill.id?bill:{...bill,id};
  });
  if(changed)store.mutate(state=>{state.bills=repaired});
  return changed;
}

function setStatus(message){
  const node=$('#billStatus6B20');
  if(node)node.textContent=message;
}

function syncRowIds(){
  const rows=[...document.querySelectorAll('#billList6B20 .bill-row-6b20')];
  const bills=orderedBills();
  rows.forEach((row,index)=>{
    const bill=bills[index];
    if(bill)row.dataset.billId6b20=String(bill.id);
  });
}

function totals(){
  const list=orderedBills();
  const paid=list.filter(bill=>bill.paid);
  const due=list.filter(bill=>!bill.paid);
  const paidTotal=paid.reduce((sum,bill)=>sum+Number(bill.amount||0),0);
  const dueTotal=due.reduce((sum,bill)=>sum+Number(bill.amount||0),0);
  if($('#paidTotal6B20'))$('#paidTotal6B20').textContent=money(paidTotal);
  if($('#dueTotal6B20'))$('#dueTotal6B20').textContent=money(dueTotal);
  if($('#allBillTotal6B20'))$('#allBillTotal6B20').textContent=money(paidTotal+dueTotal);
  if($('#billCount6B20'))$('#billCount6B20').textContent=String(list.length);
  if($('#billCountPill6B20'))$('#billCountPill6B20').textContent=`${paid.length} of ${list.length} paid`;
}

function billById(id){
  return (store.get().bills||[]).find(bill=>String(bill.id)===String(id));
}

function valuesFromRow(row){
  const values={};
  row.querySelectorAll('[data-field-6b20]').forEach(input=>{values[input.dataset.field6b20]=input.value});
  return {
    name:String(values.name||'').trim(),
    amount:Math.max(0,Number(values.amount||0)),
    due:String(values.due||''),
    category:String(values.category||'').trim()||'Other',
    frequency:values.frequency||'Monthly'
  };
}

function updateRowStatus(row,bill){
  row.classList.toggle('is-paid',Boolean(bill.paid));
  const toggle=row.querySelector('[data-action-6b20="toggle-paid"]');
  if(toggle)toggle.checked=Boolean(bill.paid);
  const label=row.querySelector('.bill-status-6b20 span');
  if(label)label.textContent=bill.paid?'Paid':'Still Due';
  const small=row.querySelector('.bill-row-footer-6b20 small');
  if(small)small.textContent=bill.paid?`Paid ${bill.paidDate||todayKey()}`:'Payment still due';
}

function preserveScroll(action){
  const y=window.scrollY;
  action();
  requestAnimationFrame(()=>window.scrollTo(0,y));
}

function saveRow(row){
  const id=row.dataset.billId6b20;
  const next=valuesFromRow(row);
  if(!next.name||!next.due){
    setStatus('Bill name and due date are required.');
    return;
  }
  const duplicate=(store.get().bills||[]).some(bill=>String(bill.id)!==String(id)&&billIdentity(bill)===billIdentity(next));
  if(duplicate){
    setStatus('That exact bill already exists. No duplicate was created.');
    return;
  }
  let saved=false;
  store.mutate(state=>{
    const bill=(state.bills||[]).find(item=>String(item.id)===String(id));
    if(!bill)return;
    Object.assign(bill,next);
    saved=true;
  });
  if(!saved){
    setStatus('This bill could not be located. Reopen Financial Studio and try again.');
    return;
  }
  row.classList.remove('is-dirty-6b21');
  totals();
  setStatus('All bill changes saved. Totals updated in real time.');
}

function removeRow(row){
  const id=row.dataset.billId6b20;
  const bill=billById(id);
  if(!bill){
    setStatus('This bill could not be located. Reopen Financial Studio and try again.');
    return;
  }
  if(!confirm(`Remove ${bill.name}? This cannot be undone.`))return;
  store.mutate(state=>{state.bills=(state.bills||[]).filter(item=>String(item.id)!==String(id))});
  preserveScroll(()=>row.remove());
  totals();
  setStatus('Bill removed permanently. Totals updated in real time.');
}

function toggleRow(row,checked){
  const id=row.dataset.billId6b20;
  let updated=null;
  store.mutate(state=>{
    const bill=(state.bills||[]).find(item=>String(item.id)===String(id));
    if(!bill)return;
    bill.paid=Boolean(checked);
    bill.paidDate=bill.paid?todayKey():'';
    updated={...bill};
  });
  if(!updated){
    setStatus('This bill could not be located. Reopen Financial Studio and try again.');
    return;
  }
  updateRowStatus(row,updated);
  totals();
  setStatus(`${updated.name} is now ${updated.paid?'Paid':'Still Due'}. Totals updated in real time.`);
}

function bindDelegatedActions(){
  const root=$('#financialControls6B20');
  if(!root||root===boundRoot)return;
  boundRoot=root;

  root.addEventListener('click',event=>{
    const action=event.target.closest('[data-action-6b20]');
    if(!action)return;
    const row=action.closest('.bill-row-6b20');
    if(!row)return;
    const type=action.dataset.action6b20;
    if(type!=='save'&&type!=='remove')return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(type==='save')saveRow(row);
    if(type==='remove')removeRow(row);
  },true);

  root.addEventListener('change',event=>{
    const toggle=event.target.closest('[data-action-6b20="toggle-paid"]');
    if(toggle){
      const row=toggle.closest('.bill-row-6b20');
      if(!row)return;
      event.preventDefault();
      event.stopImmediatePropagation();
      toggleRow(row,toggle.checked);
      return;
    }
    const field=event.target.closest('[data-field-6b20]');
    if(field)field.closest('.bill-row-6b20')?.classList.add('is-dirty-6b21');
  },true);

  root.addEventListener('input',event=>{
    const field=event.target.closest('[data-field-6b20]');
    if(field)field.closest('.bill-row-6b20')?.classList.add('is-dirty-6b21');
  },true);
}

function sync(){
  if(syncing)return;
  syncing=true;
  try{
    ensureStableIds();
    syncRowIds();
    totals();
    bindDelegatedActions();
  }finally{
    syncing=false;
  }
}

export async function enhanceSprint6B21(id){
  const badge=$('#kcBuildStatus b');
  if(badge)badge.textContent=BUILD;
  if(id!=='money')return;
  sync();
  requestAnimationFrame(sync);
  setTimeout(sync,120);
  setTimeout(sync,500);
  if(!stateBound){
    stateBound=true;
    window.addEventListener('kc:state',()=>{
      const route=location.hash.replace(/^#\/?/,'')||'dashboard';
      if(route==='money')queueMicrotask(sync);
    });
  }
}
