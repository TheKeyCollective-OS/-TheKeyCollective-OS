const BUILD='Sprint 6B.47 Corrective Review';
const $=(selector,root=document)=>root.querySelector(selector);
const all=(selector,root=document)=>[...root.querySelectorAll(selector)];

const approvedBriefSections=new Set(['Morning Reset','Morning Routine','Today’s Top Three',"Today's Top Three",'Today’s Agenda',"Today's Agenda",'Agenda']);

function cardIdentity(card){
  return [card.querySelector('.mini')?.textContent,card.querySelector('.eyebrow')?.textContent,card.querySelector('h2,h3')?.textContent]
    .map(value=>(value||'').trim()).filter(Boolean);
}

function simplifyMorningBrief(){
  if((($('#page h1')?.textContent||'').trim())!=='Morning Brief')return;
  const subtitle=$('#page h1 + .sub, #page .page-hero .sub, #page header .sub');
  const calmSubtitle='Your routine, priorities, and next plans—gathered gently in one place.';
  if(subtitle&&subtitle.textContent!==calmSubtitle)subtitle.textContent=calmSubtitle;
  const glanceCopy=$('#page .brief-hero p');
  if(glanceCopy){
    const agendaCount=(glanceCopy.textContent.match(/^\s*(\d+)\s+agenda/i)||[])[1]||'0';
    const calmGlance=`${agendaCount} agenda item${agendaCount==='1'?'':'s'} in the next seven days. Your financial details are waiting in Financial Studio.`;
    if(glanceCopy.textContent!==calmGlance)glanceCopy.textContent=calmGlance;
  }

  const metrics=$('#page .brief-metric-grid');
  if(metrics)all(':scope > article.card',metrics).forEach(card=>{
    const identity=cardIdentity(card).join(' ').toLowerCase();
    if(!identity.includes('water')&&!identity.includes('movement'))card.remove();
  });

  all('#page article.card').forEach(card=>{
    if(card.closest('.brief-metric-grid'))return;
    const identity=cardIdentity(card);
    if(!identity.length)return;
    const keep=identity.some(label=>approvedBriefSections.has(label)||/top\s*(three|3)/i.test(label)||/agenda/i.test(label)||/morning (reset|routine)/i.test(label));
    if(!keep)card.remove();
  });

  const agendaCard=all('#page article.card').find(card=>cardIdentity(card).some(label=>/agenda/i.test(label)));
  if(agendaCard){
    const rows=all('.brief-line',agendaCard);
    rows.slice(5).forEach(row=>row.remove());
    if(rows.length>5&&!agendaCard.querySelector('[data-brief-agenda-note]')){
      const note=document.createElement('p');
      note.className='muted brief-agenda-note';
      note.dataset.briefAgendaNote='true';
      note.textContent=`Showing the next 5 of ${rows.length} items. Open Agenda for the full day.`;
      agendaCard.append(note);
    }
  }
}

function refineInstallGuidance(){
  const banner=$('#kcInstallGuidance');
  banner?.remove();
}

function updateBuildIdentity(){
  if(document.documentElement.dataset.kcBuild==='6b48')return;
  const badge=$('#kcBuildStatus b');
  if(badge)badge.textContent=BUILD;
  const diagnostics=$('#buildDiagnostics h2');
  if(diagnostics)diagnostics.textContent=BUILD;
}

function improveReflectionLabels(){
  const labels={
    '[data-kc44-field="reflection"]':'Reflection entry',
    '[data-kc44-field="journal-search"]':'Search reflection memories',
    '[data-kc44-month="memory"]':'Favorite memory this month',
    '[data-kc44-month="lesson"]':'Biggest lesson this month',
    '[data-kc44-month="proud"]':'Proudest moment this month',
    '[data-kc44-month="forward"]':'What to carry forward next month'
  };
  Object.entries(labels).forEach(([selector,label])=>{
    const field=$(selector);
    if(field&&!field.getAttribute('aria-label'))field.setAttribute('aria-label',label);
  });
}

function reconcile(){simplifyMorningBrief();refineInstallGuidance();updateBuildIdentity();improveReflectionLabels()}

let observing=false;
function observe(){
  if(observing)return;
  observing=true;
  const page=$('#page');
  if(page)new MutationObserver(reconcile).observe(page,{childList:true,subtree:true});
}

export async function enhanceSprint6B47(){
  observe();reconcile();requestAnimationFrame(reconcile);setTimeout(reconcile,400);setTimeout(reconcile,1500);
}
