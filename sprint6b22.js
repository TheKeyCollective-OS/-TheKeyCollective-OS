import {store} from './store.js';

const BUILD='Sprint 6B.22 Clean Financial Rebuild';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(v)||0);
const today=()=>new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
const uid=()=>crypto.randomUUID?.()||`bill-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const norm=v=>String(v||'').trim().toLowerCase().replace(/[–—]/g,'-').replace(/\s+/g,' ');
const identity=b=>`${norm(b.name)}|${Number(b.amount||0).toFixed(2)}|${String(b.due||'')}`;

function migrateBills(){
  const source=store.get().bills||[];
  let changed=false;
  const seen=new Set();
  const next=[];
  for(const raw of source){
    const bill={...raw};
    if(!bill.id){bill.id=uid();changed=true;}
    const key=identity(bill);
    if(seen.has(key)){changed=true;continue;}
    seen.add(key);next.push(bill);
  }
  if(changed)store.mutate(s=>{s.bills=next});
}
function bills(){return [...(store.get().bills||[])].sort((a,b)=>String(a.due||'').localeCompare(String(b.due||''))||String(a.name||'').localeCompare(String(b.name||'')));}
function soberDays(){const r=store.get().sobriety?.lastReset;if(!r)return 0;const a=new Date(`${r}T00:00:00`),b=new Date(`${today()}T00:00:00`);return Number.isNaN(a)||Number.isNaN(b)?0:Math.max(0,Math.floor((b-a)/86400000));}

function row(b){return `<article class="bill-row-6b20 ${b.paid?'is-paid':''}" data-bill-id="${esc(b.id)}">
  <div class="bill-row-top-6b20"><label class="bill-status-6b20"><input type="checkbox" data-act="paid" ${b.paid?'checked':''}><span>${b.paid?'Paid':'Still Due'}</span></label><button type="button" class="btn ghost danger" data-act="remove">Remove</button></div>
  <div class="bill-fields-6b20">
    <label>Bill name<input data-field="name" value="${esc(b.name)}"></label>
    <label>Amount<input data-field="amount" type="number" inputmode="decimal" min="0" step="0.01" value="${Number(b.amount||0)}"></label>
    <label>Due date<input data-field="due" type="date" value="${esc(b.due||'')}"></label>
    <label>Category<input data-field="category" value="${esc(b.category||'')}"></label>
    <label>Frequency<select data-field="frequency">${['One-time','Weekly','Biweekly','Monthly','Quarterly','Annual'].map(x=>`<option ${String(b.frequency||'Monthly')===x?'selected':''}>${x}</option>`).join('')}</select></label>
  </div>
  <div class="bill-row-footer-6b20"><small>${b.paid?`Paid ${esc(b.paidDate||today())}`:'Payment still due'}</small><button type="button" class="btn secondary" data-act="save">Save Changes</button></div>
</article>`}

function manager(){const s=store.get(),list=bills(),paid=list.filter(x=>x.paid),due=list.filter(x=>!x.paid),pt=paid.reduce((n,x)=>n+Number(x.amount||0),0),dt=due.reduce((n,x)=>n+Number(x.amount||0),0),available=Number(s.checking||0)+Number(s.savings||0);return `<section id="financialControls6B22" class="financial-controls-6b20">
<article class="card balance-control-6b20"><div class="section-title"><div><div class="eyebrow">Cash position</div><h3>Checking + Savings</h3></div><span class="pill" id="cashPill">${money(available)} available</span></div><p class="muted">Enter the current balance in each account. Available cash updates immediately and is shared across the app.</p><div class="balance-grid-6b20"><label>Checking balance<input id="checking22" type="number" inputmode="decimal" min="0" step="0.01" value="${Number(s.checking||0)}"></label><label>Savings balance<input id="savings22" type="number" inputmode="decimal" min="0" step="0.01" value="${Number(s.savings||0)}"></label><div class="balance-total-6b20"><small>Available cash</small><strong id="cashTotal">${money(available)}</strong></div></div><div class="status" id="cashStatus">Balances save automatically.</div></article>
<article class="card full-bill-manager-6b20"><div class="section-title"><div><div class="eyebrow">Complete bill control</div><h3>Full Bill List</h3></div><span class="pill" id="countPill">${paid.length} of ${list.length} paid</span></div><p class="muted">This is the one shared bill list. Add, edit, remove, or mark bills Paid and Still Due. Exact duplicates are blocked.</p><div class="paid-metric-grid bill-totals-6b20"><div><span>Paid</span><b id="paidTotal">${money(pt)}</b></div><div><span>Still due</span><b id="dueTotal">${money(dt)}</b></div><div><span>Total bills</span><b id="allTotal">${money(pt+dt)}</b></div><div><span>Unique bills</span><b id="billCount">${list.length}</b></div></div>
<article class="bill-add-6b20"><h4>Add a bill</h4><div class="bill-fields-6b20"><label>Bill name<input id="newName" placeholder="Rent, internet, insurance…"></label><label>Amount<input id="newAmount" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00"></label><label>Due date<input id="newDue" type="date"></label><label>Category<input id="newCategory" placeholder="Housing, utilities…"></label><label>Frequency<select id="newFrequency"><option>One-time</option><option>Weekly</option><option>Biweekly</option><option selected>Monthly</option><option>Quarterly</option><option>Annual</option></select></label></div><button type="button" class="btn" id="addBill22">Add Bill</button><div class="status" id="billStatus22">Ready.</div></article>
<div class="bill-list-6b20" id="billList22">${list.length?list.map(row).join(''):'<div class="status">No bills are listed yet.</div>'}</div></article></section>`}

function patchMoney(base){return `<div class="money-page money-page-6b20">${base}${manager()}</div>`}
function patchDash(base){const t=document.createElement('template');t.innerHTML=base;const g=t.content.querySelector('.dashboard-grid');if(g){[...g.children].forEach(c=>{const x=c.textContent||'';if(/Payments Academy|Executive Intelligence/i.test(x))c.remove()});const w=[...g.children].find(c=>/Wellness today/i.test(c.textContent||''));if(w){const span=[...w.querySelectorAll('.metric-row > span')].find(x=>/Gym min|Days sober/i.test(x.textContent||''));if(span)span.innerHTML=`<b>${soberDays()}</b><small>Days sober</small>`;}}return t.innerHTML}
export function patchPagesSprint6B22(pages){const m=pages.money,d=pages.dashboard;pages.money=()=>patchMoney(m());pages.dashboard=()=>patchDash(d());}

function setStatus(msg){const n=$('#billStatus22');if(n)n.textContent=msg}
function refresh(){const list=bills(),paid=list.filter(x=>x.paid),due=list.filter(x=>!x.paid),pt=paid.reduce((n,x)=>n+Number(x.amount||0),0),dt=due.reduce((n,x)=>n+Number(x.amount||0),0);$('#billList22').innerHTML=list.length?list.map(row).join(''):'<div class="status">No bills are listed yet.</div>';$('#paidTotal').textContent=money(pt);$('#dueTotal').textContent=money(dt);$('#allTotal').textContent=money(pt+dt);$('#billCount').textContent=String(list.length);$('#countPill').textContent=`${paid.length} of ${list.length} paid`;}
function saveCash(){const checking=Math.max(0,Number($('#checking22')?.value||0)),savings=Math.max(0,Number($('#savings22')?.value||0));store.mutate(s=>{s.checking=checking;s.savings=savings;s.financial={...(s.financial||{}),availableCash:checking+savings}});const total=checking+savings;$('#cashTotal').textContent=money(total);$('#cashPill').textContent=`${money(total)} available`;$('#cashStatus').textContent='Balances saved.';}
function bind(){migrateBills();
  $('#checking22')?.addEventListener('change',saveCash);$('#savings22')?.addEventListener('change',saveCash);
  $('#addBill22')?.addEventListener('click',()=>{const next={id:uid(),name:$('#newName').value.trim(),amount:Math.max(0,Number($('#newAmount').value||0)),due:$('#newDue').value,category:$('#newCategory').value.trim()||'Other',frequency:$('#newFrequency').value,paid:false,paidDate:''};if(!next.name||!next.due){setStatus('Bill name and due date are required.');return}if(bills().some(x=>identity(x)===identity(next))){setStatus('That exact bill already exists.');return}store.mutate(s=>{s.bills=[...(s.bills||[]),next]});refresh();setStatus('Bill added and totals updated.');});
  $('#billList22')?.addEventListener('click',e=>{const btn=e.target.closest('[data-act]');if(!btn)return;const card=btn.closest('[data-bill-id]'),id=card?.dataset.billId;if(!id)return;
    if(btn.dataset.act==='remove'){const bill=bills().find(x=>String(x.id)===id);if(!bill||!confirm(`Remove ${bill.name}? This cannot be undone.`))return;store.mutate(s=>{s.bills=(s.bills||[]).filter(x=>String(x.id)!==id)});refresh();setStatus('Bill removed and totals updated.');}
    if(btn.dataset.act==='save'){const vals={};card.querySelectorAll('[data-field]').forEach(i=>vals[i.dataset.field]=i.value);const proposal={name:String(vals.name||'').trim(),amount:Math.max(0,Number(vals.amount||0)),due:String(vals.due||'')};if(!proposal.name||!proposal.due){setStatus('Bill name and due date are required.');return}if(bills().some(x=>String(x.id)!==id&&identity(x)===identity(proposal))){setStatus('That exact bill already exists.');return}store.mutate(s=>{const b=(s.bills||[]).find(x=>String(x.id)===id);if(!b)return;Object.assign(b,proposal,{category:String(vals.category||'').trim()||'Other',frequency:vals.frequency||'Monthly'})});refresh();setStatus('Bill changes saved and totals updated.');}
  });
  $('#billList22')?.addEventListener('change',e=>{const box=e.target.closest('[data-act="paid"]');if(!box)return;const card=box.closest('[data-bill-id]'),id=card?.dataset.billId;store.mutate(s=>{const b=(s.bills||[]).find(x=>String(x.id)===id);if(!b)return;b.paid=box.checked;b.paidDate=box.checked?today():''});refresh();setStatus(box.checked?'Bill marked paid.':'Bill marked still due.');});
}
export async function enhanceSprint6B22(id){const badge=$('#kcBuildStatus b');if(badge)badge.textContent=BUILD;if(id==='money')bind();}
