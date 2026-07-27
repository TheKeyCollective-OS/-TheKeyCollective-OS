
const ROUTE_KEY='keyCollectiveOS.currentRoute';
const HISTORY_KEY='keyCollectiveOS.routeHistory';
export function createRouter({routes,onRender}){
  const valid=new Set(routes.map(r=>r.id));
  const initialHash=location.hash.replace(/^#/,'');
  const saved=localStorage.getItem(ROUTE_KEY);
  const initial=valid.has(initialHash)?initialHash:valid.has(saved)?saved:'dashboard';
  let stack=(()=>{try{const savedStack=JSON.parse(sessionStorage.getItem(HISTORY_KEY)||'[]');return Array.isArray(savedStack)?savedStack.filter(id=>valid.has(id)):[]}catch{return []}})();
  if(!stack.length)stack=[initial];else if(stack.at(-1)!==initial)stack.push(initial);
  const nav=document.querySelector('#nav'),page=document.querySelector('#page'),crumb=document.querySelector('#breadcrumb');

  nav.innerHTML=routes.map(r=>`<button class="nav-button" data-route="${r.id}">${r.icon} ${r.label}</button>`).join('');

  function persistStack(){sessionStorage.setItem(HISTORY_KEY,JSON.stringify(stack.slice(-50)))}

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
    persistStack();
    if(options.remember!==false)remember(route.id,options.replace===true);
    page.innerHTML=route.render();
    Promise.resolve(onRender?.(route.id))
      .catch(error=>console.error('Route enhancement failed',route.id,error))
      .finally(()=>window.dispatchEvent(new CustomEvent('kc:route-rendered',{detail:{route:route.id}})));
    document.querySelector('#appShell').classList.remove('menu-open');
    page.focus();
    scrollTo(0,0);
  }

  nav.addEventListener('click',event=>{const button=event.target.closest('[data-route]');if(button)go(button.dataset.route)});
  document.querySelector('#homeButton').onclick=()=>go('dashboard');
  document.querySelector('#backButton').onclick=()=>{if(stack.length>1){stack.pop();persistStack();go(stack.at(-1),false,{replace:true})}else go('dashboard',false,{replace:true})};

  addEventListener('popstate',()=>{
    const id=location.hash.replace(/^#/,'');
    if(valid.has(id)){const index=stack.lastIndexOf(id);stack=index>=0?stack.slice(0,index+1):[...stack,id];persistStack();go(id,false,{remember:true,replace:true})}
  });
  addEventListener('hashchange',()=>{
    const id=location.hash.replace(/^#/,'');
    if(valid.has(id)&&id!==stack.at(-1)){stack.push(id);persistStack();go(id,false,{remember:true,replace:true})}
  });

  return {
    go,
    back(){document.querySelector('#backButton').click()},
    refresh(){go(stack.at(-1)||'dashboard',false,{replace:true})},
    current:()=>stack.at(-1),
    initial
  };
}
