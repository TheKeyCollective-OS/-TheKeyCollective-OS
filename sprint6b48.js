const BUILD='Sprint 6B.48 Fintech Academy';

function replaceAcademyLanguage(root){
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{
    node.nodeValue=node.nodeValue
      .replaceAll('Payments Academy','Payments & Fintech Academy')
      .replaceAll('Payments mastery','Payments & fintech mastery')
      .replaceAll('payments mastery','payments & fintech mastery');
  });
  root.querySelectorAll('[aria-label],[title],[placeholder]').forEach(element=>{
    for(const attribute of ['aria-label','title','placeholder']){
      const value=element.getAttribute(attribute);
      if(value?.includes('Payments Academy'))element.setAttribute(attribute,value.replaceAll('Payments Academy','Payments & Fintech Academy'));
    }
  });
}

export async function enhanceSprint6B48(){
  document.documentElement.dataset.kcBuild='6b48';
  replaceAcademyLanguage(document.querySelector('#nav'));
  replaceAcademyLanguage(document.querySelector('#page'));
  replaceAcademyLanguage(document.querySelector('#breadcrumb'));
  const updateBadge=()=>{const badge=document.querySelector('#kcBuildStatus b');if(badge)badge.textContent=BUILD};
  updateBadge();
  setTimeout(updateBadge,150);
  setTimeout(updateBadge,1700);
}
