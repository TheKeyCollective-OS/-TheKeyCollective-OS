const BUILD='Sprint 6B.49 Luxury Compression';

function findCardByHeading(title){
  return [...document.querySelectorAll('#page article,#page section')]
    .find(element=>element.querySelector('h2,h3')?.textContent.trim()===title);
}

function disclose(element,title,description,{open=false,className=''}={}){
  if(!element||element.closest('.luxury-disclosure-6b49'))return;
  const details=document.createElement('details');
  details.className=`luxury-disclosure-6b49 ${className}`.trim();
  details.open=open;
  const summary=document.createElement('summary');
  summary.innerHTML=`<span><strong>${title}</strong><small>${description}</small></span><span class="disclosure-action-6b49" aria-hidden="true">Open</span>`;
  element.before(details);
  details.append(summary,element);
}

function cleanupEmptyDisclosures(){
  document.querySelectorAll('#page .luxury-disclosure-6b49').forEach(details=>{
    if(![...details.children].some(child=>child.tagName!=='SUMMARY'))details.remove();
  });
}

function condenseDashboard(){
  disclose(document.querySelector('#page .module-grid'),'Open a studio','All spaces remain one tap away.',{className:'dashboard-studios-6b49'});
}

function condenseAgenda(){
  disclose(document.querySelector('#page .kc45-google'),'Calendar connection & events','Sync calendars or create and edit Google events when you need them.',{className:'agenda-tools-6b49'});
  disclose(document.querySelector('#page .agenda-editor-card-6b13'),'Selected-day details','Add plans, preparation notes, and directions for one date.',{className:'agenda-tools-6b49'});
}

function condenseMoney(){
  disclose(findCardByHeading('Forecast assumptions'),'Forecast setup','Adjust income and flexible spending assumptions.',{className:'money-tools-6b49'});
  disclose(document.querySelector('#page .bill-import-card'),'Import bills','Paste a prepared list when you want to add several bills at once.',{className:'money-tools-6b49'});
}

function condenseWellness(){
  disclose(findCardByHeading('Fitness tools'),'Fitness shortcuts','Open your connected fitness services.',{className:'wellness-tools-6b49'});
  disclose(findCardByHeading('Sobriety Tracker'),'Sobriety tracker','View or manage this private wellness milestone.',{className:'wellness-tools-6b49'});
}

function condenseIntelligence(){
  disclose(document.querySelector('#page .kc44-intel'),'Intelligence workspace','Open watchlists, saved research, decision journals, and briefings.',{className:'intelligence-tools-6b49'});
}

function condenseDesign(){
  disclose(document.querySelector('#page .studio-section'),'Color collection','Browse and apply the full palette library.',{className:'settings-tools-6b49'});
  disclose(findCardByHeading('Choose a complete visual voice'),'Typography & experience','Choose an optional visual personality for the OS.',{className:'settings-tools-6b49'});
  disclose(findCardByHeading('Data Vault'),'Data vault','Export, import, or restore a protected copy of your information.',{className:'settings-tools-6b49'});
  disclose(findCardByHeading('Autosave Protection'),'Autosave protection','Review how your local changes are protected.',{className:'settings-tools-6b49'});
}

function condenseProfile(){
  disclose(document.querySelector('#page .blueprint-card'),'My blueprint','Edit your name, title, mission, and direction.',{className:'settings-tools-6b49'});
  disclose(findCardByHeading('The principles in the room'),'Core values','Review and edit the principles guiding your OS.',{className:'settings-tools-6b49'});
  disclose(findCardByHeading('My Quick Info'),'Personal details','Open your private, editable reference information.',{className:'settings-tools-6b49'});
  disclose(findCardByHeading('Evidence of becoming'),'Achievements','Review milestones and evidence of your growth.',{className:'settings-tools-6b49'});
}

export async function enhanceSprint6B49(route){
  document.documentElement.dataset.kcBuild='6b49';
  const page=document.querySelector('#page');
  const renderToken=`${route}-${Date.now()}-${Math.random()}`;
  if(page){page.dataset.compressionRender6b49=renderToken;page.classList.add('luxury-compression-6b49')}
  const refinements={dashboard:condenseDashboard,calendar:condenseAgenda,money:condenseMoney,wellness:condenseWellness,business:condenseIntelligence,premium:condenseDesign,profile:condenseProfile};
  const refine=()=>{
    if(document.documentElement.dataset.kcBuild!=='6b49'||page?.dataset.compressionRender6b49!==renderToken)return;
    page?.classList.add('luxury-compression-6b49');
    cleanupEmptyDisclosures();
    refinements[route]?.();
  };
  refine();
  setTimeout(refine,300);
  setTimeout(refine,1400);
  const updateBadge=()=>{const badge=document.querySelector('#kcBuildStatus b');if(badge)badge.textContent=BUILD};
  updateBadge();
  setTimeout(updateBadge,150);
  setTimeout(updateBadge,1700);
}
