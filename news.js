import {config} from './config.js';

export const PULSE_TOPICS={
  'U.S. News':'United States national news politics economy',
  'Arizona + Phoenix':'Arizona Phoenix Scottsdale Maricopa news',
  'Payments + Fintech':'payments Visa Mastercard Stripe PayPal fintech banking fraud',
  'AI + Technology':'artificial intelligence OpenAI Anthropic Microsoft Apple Nvidia technology',
  'Markets + Economy':'S&P 500 Nasdaq Federal Reserve inflation mortgage rates US economy',
  'Business':'United States business earnings companies economy'
};
const trusted=[
  ['Reuters',['reuters.com']],['Associated Press',['apnews.com']],['CNBC',['cnbc.com']],['NPR',['npr.org']],
  ['Axios',['axios.com']],['USA Today',['usatoday.com']],['ABC News',['abcnews.go.com']],['CBS News',['cbsnews.com']],
  ['NBC News',['nbcnews.com']],['CNN',['cnn.com']],['Fox Business',['foxbusiness.com']],['Bloomberg',['bloomberg.com']],
  ['The Wall Street Journal',['wsj.com']],['Fortune',['fortune.com']],['TechCrunch',['techcrunch.com']],
  ['The Verge',['theverge.com']],['WIRED',['wired.com']],['Arizona Republic',['azcentral.com']],
  ['ABC15 Arizona',['abc15.com']],['12News',['12news.com']],['Arizona’s Family',['azfamily.com']],
  ['Phoenix New Times',['phoenixnewtimes.com']]
];
const clean=v=>String(v||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
const mostlyEnglish=text=>{const s=clean(text);if(!s)return false;const latin=(s.match(/[A-Za-z]/g)||[]).length,letters=(s.match(/\p{L}/gu)||[]).length;return letters===0||latin/letters>.9};
const sourceName=(url,raw='')=>{const name=clean(raw);const match=trusted.find(([n,domains])=>name.toLowerCase().includes(n.toLowerCase())||domains.some(d=>String(url).toLowerCase().includes(d)));return match?.[0]||''};
const trustedStory=(url,raw)=>Boolean(sourceName(url,raw));
const normalize=(a,topic)=>{const url=a.url||a.link||'#',source=sourceName(url,a.source?.name||a.source||a.domain||a.author||'');return {id:a.id||url||`${topic}-${a.title}`,topic,title:clean(a.title).replace(/\s+-\s+[^-]{2,50}$/,''),url,source,publishedAt:a.publishedAt||a.pubDate||a.seendate||a.date||'',image:a.image||a.thumbnail||a.socialimage||'',description:clean(a.description||a.summary||a.snippet||'')}};
const dedupe=items=>{const seen=new Set();return items.filter(a=>{const k=a.title.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,90);if(!k||seen.has(k))return false;seen.add(k);return true})};
async function endpointFeed(){const r=await fetch(config.newsEndpoint,{headers:{Accept:'application/json'}});if(!r.ok)throw new Error(`News endpoint returned ${r.status}`);const data=await r.json(),groups=data.categories||data.topics||data;return Object.fromEntries(Object.entries(groups).map(([topic,items])=>[topic,dedupe((items||[]).map(a=>normalize(a,topic)).filter(a=>mostlyEnglish(a.title)&&trustedStory(a.url,a.source))).slice(0,8)]));}
async function googleTopic(topic){const query=encodeURIComponent(`${PULSE_TOPICS[topic]} when:2d`);const rss=encodeURIComponent(`https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`);const url=`https://api.rss2json.com/v1/api.json?rss_url=${rss}`;const r=await fetch(url,{headers:{Accept:'application/json'}});if(!r.ok)throw new Error(`Google News bridge returned ${r.status}`);const data=await r.json();return dedupe((data.items||[]).map(a=>normalize(a,topic)).filter(a=>a.title&&a.url&&mostlyEnglish(a.title)&&trustedStory(a.url,a.source||a.author))).slice(0,8);}
async function gdeltTopic(topic){const allowed=trusted.flatMap(x=>x[1]).map(d=>`domain:${d}`).join(' OR '),q=encodeURIComponent(`(${PULSE_TOPICS[topic]}) (${allowed}) sourcelang:english`),url=`https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=artlist&maxrecords=40&format=json&sort=HybridRel`;const r=await fetch(url,{headers:{Accept:'application/json'}});if(!r.ok)throw new Error(`Public news feed returned ${r.status}`);const data=await r.json();return dedupe((data.articles||[]).map(a=>normalize(a,topic)).filter(a=>a.title&&a.url&&mostlyEnglish(a.title)&&trustedStory(a.url,a.source))).slice(0,8);}
async function topicFeed(topic){try{const x=await googleTopic(topic);if(x.length)return x}catch{}return gdeltTopic(topic)}
export async function loadNews(){const source=config.newsEndpoint?'secure-endpoint':'trusted-us-sources';if(config.newsEndpoint)return {source,categories:await endpointFeed(),updatedAt:new Date().toISOString(),locale:'en-US'};const names=Object.keys(PULSE_TOPICS),entries=await Promise.allSettled(names.map(async topic=>[topic,await topicFeed(topic)])),categories={};entries.forEach((r,i)=>categories[names[i]]=r.status==='fulfilled'?r.value[1]:[]);if(!Object.values(categories).some(x=>x.length))throw new Error('No trusted U.S. English headlines were available.');return {source,categories,updatedAt:new Date().toISOString(),locale:'en-US'};}
export function buildExecutiveSummary(categories){const picks=Object.entries(categories).flatMap(([topic,items])=>(items||[]).slice(0,1).map(x=>({...x,topic}))).slice(0,6);return picks.map(x=>({topic:x.topic,title:x.title,why:({'U.S. News':'A major American development with potential policy, economic, or daily-life impact.','Arizona + Phoenix':'A local development that may affect life, work, or opportunity in Arizona.','Payments + Fintech':'Relevant to payments strategy, banking, fraud, risk, or financial technology.','AI + Technology':'A technology shift that may reshape tools, work, or competitive advantage.','Markets + Economy':'A signal affecting household finances, interest rates, markets, or the U.S. economy.','Business':'A business development worth carrying into the day.'}[x.topic]||'Worth watching today.'),url:x.url,source:x.source}));}
