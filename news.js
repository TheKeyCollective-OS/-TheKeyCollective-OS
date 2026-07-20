import {config} from './config.js';

const topics={
  Business:'(business OR economy OR markets)',
  Payments:'(payments OR Visa OR Mastercard OR Stripe OR banking)',
  Fintech:'(fintech OR digital banking OR payment technology)',
  AI:'("artificial intelligence" OR OpenAI OR generative AI)',
  Arizona:'(Arizona OR Phoenix OR Scottsdale business)',
  'U.S.':'(United States economy OR US business)',
  World:'(world economy OR global business)'
};
const clean=v=>String(v||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
const normalize=(a,topic)=>({
  id:a.id||a.url||`${topic}-${a.title}`,
  topic,
  title:clean(a.title),
  url:a.url||a.link||'#',
  source:clean(a.source?.name||a.source||a.domain||'News source'),
  publishedAt:a.publishedAt||a.seendate||a.date||'',
  image:a.image||a.socialimage||'',
  description:clean(a.description||a.summary||a.snippet||'')
});
async function endpointFeed(){
  const r=await fetch(config.newsEndpoint,{headers:{Accept:'application/json'}});
  if(!r.ok)throw new Error(`News endpoint returned ${r.status}`);
  const data=await r.json();
  const groups=data.categories||data.topics||data;
  return Object.fromEntries(Object.entries(groups).map(([topic,items])=>[topic,(items||[]).map(a=>normalize(a,topic))]));
}
async function gdeltTopic(topic){
  const q=encodeURIComponent(topics[topic]||topic);
  const url=`https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=artlist&maxrecords=8&format=json&sort=HybridRel`;
  const r=await fetch(url,{headers:{Accept:'application/json'}});
  if(!r.ok)throw new Error(`Public news feed returned ${r.status}`);
  const data=await r.json();
  return (data.articles||[]).map(a=>normalize(a,topic)).filter(a=>a.title&&a.url);
}
export async function loadNews(){
  const source=config.newsEndpoint?'secure-endpoint':'gdelt-public';
  const entries=await Promise.allSettled(Object.keys(topics).map(async topic=>[topic,config.newsEndpoint?null:await gdeltTopic(topic)]));
  if(config.newsEndpoint){return {source,categories:await endpointFeed(),updatedAt:new Date().toISOString()}}
  const categories={};entries.forEach((r,i)=>{categories[Object.keys(topics)[i]]=r.status==='fulfilled'?r.value[1]:[]});
  if(!Object.values(categories).some(x=>x.length))throw new Error('No live headlines were available.');
  return {source,categories,updatedAt:new Date().toISOString()};
}
export function buildExecutiveSummary(categories){
  const picks=Object.entries(categories).flatMap(([topic,items])=>(items||[]).slice(0,1).map(x=>({...x,topic}))).slice(0,5);
  return picks.map(x=>({topic:x.topic,title:x.title,why:`Worth watching in ${x.topic.toLowerCase()}: this may shape decisions, conversations, or opportunities in the near term.`,url:x.url,source:x.source}));
}
