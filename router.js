
const ROUTE_KEY='keyCollectiveOS.currentRoute';
export function createRouter({routes,onRender}){
  const valid=new Set(routes.map(r=>r.id));
  const initialHash=location.hash.replace(/^#/,'');
  const saved=localStorage.getItem(ROUTE_KEY);
  const initial=valid.has(initialHash)?initialHash:valid.has(saved)?saved:'dashboard';
  let stack=[initial];
  const nav=document.querySelector('#nav'),page=document.querySelector('#page'),crumb=document.querySelector('#breadcrumb');

  nav.innerHTML=routes.map(r=>`<button class="nav-button" data-route="${r.id}">${r.icon} ${r.label}</button>`).join('');

  function remember(id,replace=false){
    localStorage.setItem(ROUTE_KEY,id);
    const hash=`#${id}`;
    if(location.hash===hash)return;
    if(replace)history.replaceState({route:id},'',hash);
    else history.pushState({route:id},'',hash);
  }
  function go(id,push=true,options={}){
    const route=routes.find(r=>r.id===id)||routes[0];
    document.querySelectorAll('.nav-button').forEach(b=>b.classList.toggle('active',b.dataset.route===route.id));
    crumb.textContent=route.label;
    if(push&&stack.at(-1)!==route.id)stack.push(route.id);
    if(options.remember!==false)remember(route.id,options.replace===true);
    page.innerHTML=route.render();
    Promise.resolve(onRender?.(route.id)).catch(error=>console.error('Route enhancement failed',route.id,error));
    document.querySelector('#appShell').classList.remove('menu-open');
    page.focus();
    scrollTo(0,0);
  }

  nav.addEventListener('click',event=>{const button=event.target.closest('[data-route]');if(button)go(button.dataset.route)});
  document.querySelector('#homeButton').onclick=()=>{stack=['dashboard'];go('dashboard',false)};
  document.querySelector('#backButton').onclick=()=>{if(stack.length>1)stack.pop();go(stack.at(-1)||'dashboard',false)};

  addEventListener('popstate',()=>{
    const id=location.hash.replace(/^#/,'');
    if(valid.has(id)){stack=[id];go(id,false,{remember:true,replace:true})}
  });
  addEventListener('hashchange',()=>{
    const id=location.hash.replace(/^#/,'');
    if(valid.has(id)&&id!==stack.at(-1)){stack=[id];go(id,false,{remember:true,replace:true})}
  });

  return {
    go,
    back(){document.querySelector('#backButton').click()},
    current:()=>stack.at(-1),
    initial
  };
}
