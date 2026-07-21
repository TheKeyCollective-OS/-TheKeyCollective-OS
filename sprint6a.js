import {store} from './store.js';
import {getPhotos} from './photo-db.js';
const $=s=>document.querySelector(s), all=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast=m=>{const t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2100)};
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function patchPagesSprint6A(pages){
  pages.goals=()=>{
    const x=store.get(),done=(x.goals||[]).filter(g=>Number(g.progress)>=100).length,view=x.hardView||'grid';
    return `<div class="pagehead hard-pagehead"><div><div class="eyebrow">The annual becoming list</div><h1>25 Hard</h1><p class="sub">Twenty-five meaningful milestones—compact, motivating, and easy to scan.</p></div><span id="hardCount" class="pill">${done}/25 complete</span></div>
    <section class="card hard-command"><div><div class="eyebrow">Your next brave move</div><h2>Choose the milestone that changes the story.</h2></div><div class="hard-add"><input id="hardGoalName" placeholder="Name a meaningful milestone"><select id="hardGoalCategory"><option>Personal</option><option>Financial</option><option>Career</option><option>Wellness</option><option>Family</option><option>Adventure</option></select><button id="addHardGoal" class="btn">Add milestone</button></div></section>
    <section class="hard-toolbar" aria-label="25 Hard view controls"><div class="view-switch" role="group" aria-label="Choose milestone layout"><button class="view-button ${view==='grid'?'active':''}" data-hard-view="grid" aria-pressed="${view==='grid'}">▦ <span>Grid</span></button><button class="view-button ${view==='list'?'active':''}" data-hard-view="list" aria-pressed="${view==='list'}">☷ <span>List</span></button></div><div class="hard-progress-summary"><span class="hard-progress-bar"><i style="width:${done/25*100}%"></i></span><small>${25-done} milestones still becoming</small></div></section>
    <div id="hardBoard" class="hard-board ${view==='list'?'list-view':'grid-view'}"></div>`;
  };

  const oldDashboard=pages.dashboard;
  pages.dashboard=()=>oldDashboard()
    .replace(`<article class="card luxe dashboard-panel"><h3>Top Three</h3><div class="priority-list">`, `<article class="card luxe dashboard-panel executive-focus-card"><div class="section-title"><div><div class="mini">Executive Focus</div><h3>Today’s Top Three</h3></div><span id="focusScore" class="pill">0/3</span></div><div class="focus-ring-wrap"><div id="focusRing" class="focus-ring"><strong>0%</strong></div><p>Three intentional choices. One clear day.</p></div><div class="priority-list">`)
    .replace(`<button class="btn ghost" id="editTop3">Edit priorities</button></article>`, `<button class="btn ghost" id="editTop3">Manage priorities</button></article>`)
    .replace(`<article class="card luxe dashboard-panel"><div class="mini">Executive Intelligence</div>`, `<article class="card luxe dashboard-panel executive-insight-preview"><div class="mini">Executive Intelligence</div>`)
    + `<dialog id="priorityDialog" class="priority-dialog"><div class="priority-dialog-shell"><div class="section-title"><div><div class="eyebrow">Executive Focus Board</div><h2>Choose what matters most today</h2></div><button id="closePriorityDialog" class="icon-button" aria-label="Close">×</button></div><div class="priority-rank-tabs" role="tablist">${[1,2,3].map(n=>`<button class="rank-tab ${n===1?'active':''}" data-priority-rank="${n}" role="tab">Priority ${n}</button>`).join('')}</div><div id="priorityEditor"></div><div class="priority-dialog-actions"><button id="clearPriority" class="btn ghost">Clear this priority</button><button id="savePriority" class="btn">Save priority</button></div></div></dialog>`;
}

export async function enhanceSprint6A(id,router){
  all('[data-jump]').forEach(b=>b.onclick=()=>router.go(b.dataset.jump));
  if(id==='dashboard')await dashboard(router);
  if(id==='goals')goals();
  if(id==='premium')premiumPreview();
}

async function dashboard(router){
  initFocusBoard();
  await renderDashboardPhotos(router);
}

function ensurePriorityDetails(){
  const st=store.get();
  if(Array.isArray(st.priorityDetails)&&st.priorityDetails.length===3)return;
  store.mutate(d=>{d.priorityDetails=[0,1,2].map(i=>({id:uid(),title:d.top3?.[i]||'',why:'',category:'Personal',due:'',progress:d.top3Done?.[i]?100:0,notes:'',estimated:'',source:'Manual'}))});
}
function initFocusBoard(){
  ensurePriorityDetails();
  const st=store.get(),done=(st.top3Done||[]).filter(Boolean).length,pct=Math.round(done/3*100);
  if($('#focusScore'))$('#focusScore').textContent=`${done}/3`;
  if($('#focusRing')){$('#focusRing').style.setProperty('--focus',`${pct}%`);$('#focusRing strong').textContent=`${pct}%`}
  all('[data-top3]').forEach(c=>c.onchange=()=>{const i=+c.dataset.top3;store.mutate(d=>{d.top3Done[i]=c.checked;d.priorityDetails=d.priorityDetails||[];if(d.priorityDetails[i])d.priorityDetails[i].progress=c.checked?100:Math.min(95,Number(d.priorityDetails[i].progress||0))});if(c.checked)celebrateFocus();});
  let rank=1;const dialog=$('#priorityDialog'),editor=$('#priorityEditor');
  const draw=()=>{const p=store.get().priorityDetails[rank-1]||{};editor.innerHTML=`<div class="priority-editor-grid"><label>Title<input id="priorityTitle" value="${esc(p.title)}" placeholder="What deserves your focus?"></label><label>Category<select id="priorityCategory">${['Personal','Family','Career','Financial','Wellness','Learning','Business'].map(v=>`<option ${p.category===v?'selected':''}>${v}</option>`).join('')}</select></label><label class="wide">Why it matters<textarea id="priorityWhy" rows="2" placeholder="The meaning behind this priority">${esc(p.why)}</textarea></label><label>Due date<span class="date-wrap"><input id="priorityDue" type="date" value="${esc(p.due)}"></span></label><label>Estimated time<input id="priorityEstimated" value="${esc(p.estimated)}" placeholder="30 minutes"></label><label class="wide">Notes<textarea id="priorityNotes" rows="3" placeholder="Steps, context, or a reminder to yourself">${esc(p.notes)}</textarea></label><label class="wide">Progress <output id="priorityProgressValue">${Number(p.progress||0)}%</output><input id="priorityProgress" type="range" min="0" max="100" value="${Number(p.progress||0)}"></label></div>`;$('#priorityProgress').oninput=e=>$('#priorityProgressValue').textContent=e.target.value+'%'};
  $('#editTop3').onclick=()=>{rank=1;all('.rank-tab').forEach((b,i)=>b.classList.toggle('active',i===0));draw();dialog.showModal()};
  $('#closePriorityDialog').onclick=()=>dialog.close();dialog.onclick=e=>{if(e.target===dialog)dialog.close()};
  all('[data-priority-rank]').forEach(b=>b.onclick=()=>{rank=+b.dataset.priorityRank;all('[data-priority-rank]').forEach(x=>x.classList.toggle('active',x===b));draw()});
  $('#savePriority').onclick=()=>{const p={id:store.get().priorityDetails[rank-1]?.id||uid(),title:$('#priorityTitle').value.trim(),category:$('#priorityCategory').value,why:$('#priorityWhy').value.trim(),due:$('#priorityDue').value,estimated:$('#priorityEstimated').value.trim(),notes:$('#priorityNotes').value.trim(),progress:+$('#priorityProgress').value,source:'Manual'};store.mutate(d=>{d.priorityDetails[rank-1]=p;d.top3[rank-1]=p.title;d.top3Done[rank-1]=p.progress===100});toast(`Priority ${rank} saved.`);dialog.close()};
  $('#clearPriority').onclick=()=>{store.mutate(d=>{d.priorityDetails[rank-1]={id:uid(),title:'',why:'',category:'Personal',due:'',progress:0,notes:'',estimated:'',source:'Manual'};d.top3[rank-1]='';d.top3Done[rank-1]=false});toast(`Priority ${rank} cleared.`);dialog.close()};
}
function celebrateFocus(){const st=store.get(),done=st.top3Done.filter(Boolean).length;if(done<3){toast(`${done}/3 priorities complete.`);return}const layer=document.createElement('div');layer.className='focus-celebration';layer.innerHTML='<span>✦</span><b>Today’s mission accomplished.</b><span>✦</span>';document.body.append(layer);setTimeout(()=>layer.remove(),1800)}

async function renderDashboardPhotos(router){
  const box=$('#dashboardLani');if(!box)return;
  try{
    const photos=await getPhotos();
    if(!photos.length){box.innerHTML='<button class="dashboard-photo-empty" type="button">♡<b>Add your first Lani memory</b><small>Photos uploaded in Lani’s Corner will appear here automatically.</small></button>';box.querySelector('button').onclick=()=>router.go('lani');return}
    let index=Math.max(0,photos.findIndex(p=>p.featured));if(index<0)index=photos.length-1;
    const urls=photos.map(p=>URL.createObjectURL(p.blob));
    box.innerHTML=`<button class="dashboard-photo-stage" type="button" aria-label="Open Lani’s Corner">${urls.map((url,i)=>`<img class="${i===index?'active':''}" src="${url}" alt="Lani memory ${i+1}">`).join('')}<span class="photo-count">${photos.length} memor${photos.length===1?'y':'ies'}</span></button>`;
    box.querySelector('button').onclick=()=>router.go('lani');
    if(photos.length>1){let current=index;setInterval(()=>{const imgs=[...box.querySelectorAll('img')];if(!imgs.length)return;imgs[current].classList.remove('active');current=(current+1)%imgs.length;imgs[current].classList.add('active')},6000)}
  }catch(err){console.warn('Dashboard photo sync failed',err);box.innerHTML='<div class="status">The shared photo library is temporarily unavailable.</div>'}
}

function goals(){
  const render=()=>{const st=store.get(),items=st.goals||[],view=st.hardView||'grid',done=items.filter(g=>Number(g.progress)>=100).length,board=$('#hardBoard');if(!board)return;$('#hardCount').textContent=`${done}/25 complete`;board.className=`hard-board ${view==='list'?'list-view':'grid-view'}`;
    board.innerHTML=Array.from({length:25},(_,i)=>{const g=items[i],p=Math.min(100,Number(g?.progress||0));if(!g)return `<article class="hard-tile empty"><div class="hard-index">${String(i+1).padStart(2,'0')}</div><button class="hard-empty-action" type="button" data-focus-add><span>＋</span><b>Open milestone</b></button></article>`;return `<article class="hard-tile ${p>=100?'complete':''}" style="--p:${p}%"><div class="hard-index">${String(i+1).padStart(2,'0')}</div><div class="hard-tile-main"><div class="hard-tile-heading"><span class="pill">${esc(g.category||'Intentional')}</span><h3>${esc(g.name)}</h3></div><div class="mini-ring"><strong>${p}%</strong></div><div class="hard-inline-progress"><i style="width:${p}%"></i></div><input aria-label="Progress for ${esc(g.name)}" type="range" min="0" max="100" value="${p}" data-hard-progress="${i}"><div class="hard-tile-actions"><button class="text-button" data-hard-complete="${i}">${p===100?'Completed':'Mark complete'}</button><button class="text-button" data-hard-remove="${i}">Remove</button></div></div></article>`}).join('');
    all('[data-hard-progress]').forEach(r=>r.onchange=()=>update(+r.dataset.hardProgress,+r.value));all('[data-hard-complete]').forEach(b=>b.onclick=()=>update(+b.dataset.hardComplete,100));all('[data-hard-remove]').forEach(b=>b.onclick=()=>{store.mutate(d=>d.goals.splice(+b.dataset.hardRemove,1));render()});all('[data-focus-add]').forEach(b=>b.onclick=()=>$('#hardGoalName')?.focus());};
  const update=(i,value)=>{const was=Number(store.get().goals[i]?.progress||0);store.mutate(d=>d.goals[i].progress=value);if(value===100&&was<100)milestoneCelebration(store.get().goals[i].name);render()};
  all('[data-hard-view]').forEach(b=>b.onclick=()=>{store.set({hardView:b.dataset.hardView});all('[data-hard-view]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b)});render()});
  $('#addHardGoal').onclick=()=>{const name=$('#hardGoalName').value.trim();if(!name)return toast('Name the milestone first.');if(store.get().goals.length>=25)return toast('Your 25 are already chosen.');store.mutate(d=>d.goals.push({id:uid(),name,category:$('#hardGoalCategory').value,progress:0,createdAt:new Date().toISOString()}));$('#hardGoalName').value='';toast('Milestone added.');render()};render();
}
function milestoneCelebration(name){toast('Milestone unlocked ✦');const layer=document.createElement('div');layer.className='milestone-unlock';layer.innerHTML=`<div><span>✦</span><small>Milestone unlocked</small><b>${esc(name)}</b></div>`;document.body.append(layer);setTimeout(()=>layer.remove(),1800)}

function premiumPreview(){
  const demo=$('.contrast-demo');if(!demo)return;const buttons=[...demo.querySelectorAll('.btn')];buttons.forEach((b,i)=>{b.type='button';b.dataset.previewAction=i?'secondary':'primary';b.onclick=e=>{const ripple=document.createElement('i');ripple.className='button-ripple';const r=b.getBoundingClientRect();ripple.style.left=`${e.clientX-r.left}px`;ripple.style.top=`${e.clientY-r.top}px`;b.append(ripple);b.classList.remove('preview-success');void b.offsetWidth;b.classList.add('preview-success');setTimeout(()=>ripple.remove(),650);setTimeout(()=>b.classList.remove('preview-success'),1100);toast(`${i?'Secondary':'Primary'} action preview complete.`)}});
}
