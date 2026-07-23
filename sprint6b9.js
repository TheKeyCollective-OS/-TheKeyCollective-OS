
import {store} from './store.js';

const BUILD='Sprint 6B.9';
const $=s=>document.querySelector(s);
const all=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n)||0);
const localKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const GLOSSARY=[{"term": "Acquiring bank", "category": "Participants", "definition": "The financial institution that enables a merchant to accept card payments and receives transaction information for settlement."}, {"term": "Issuing bank", "category": "Participants", "definition": "The cardholder’s bank or financial institution that issues the payment card and approves or declines transactions."}, {"term": "Merchant", "category": "Participants", "definition": "A business or organization that accepts payment in exchange for goods or services."}, {"term": "Cardholder", "category": "Participants", "definition": "The person or organization authorized to use a payment card or account."}, {"term": "Payment processor", "category": "Participants", "definition": "A provider that transmits transaction data among the merchant, acquirer, networks, and issuer."}, {"term": "Payment gateway", "category": "Participants", "definition": "Technology that securely captures and transmits payment information from a checkout to the processor."}, {"term": "Merchant acquirer", "category": "Participants", "definition": "An acquiring institution or provider responsible for merchant acceptance, settlement, and related risk."}, {"term": "Card network", "category": "Participants", "definition": "A network such as Visa or Mastercard that establishes operating rules and routes card transactions."}, {"term": "Authorization", "category": "Transaction Lifecycle", "definition": "The issuer’s decision to approve or decline a transaction and reserve available funds or credit."}, {"term": "Authentication", "category": "Transaction Lifecycle", "definition": "The process of confirming that a person, device, or credential is legitimate."}, {"term": "Clearing", "category": "Transaction Lifecycle", "definition": "The exchange and calculation of finalized transaction data before settlement."}, {"term": "Settlement", "category": "Transaction Lifecycle", "definition": "The transfer of funds among participating institutions after clearing."}, {"term": "Capture", "category": "Transaction Lifecycle", "definition": "The merchant’s instruction to finalize an authorized payment for clearing and settlement."}, {"term": "Void", "category": "Transaction Lifecycle", "definition": "A cancellation performed before a transaction completes settlement."}, {"term": "Refund", "category": "Transaction Lifecycle", "definition": "A merchant-initiated return of funds after a transaction has been completed."}, {"term": "Reversal", "category": "Transaction Lifecycle", "definition": "A message that releases or cancels an authorization, often after an error or abandoned transaction."}, {"term": "Chargeback", "category": "Disputes & Risk", "definition": "A transaction reversal initiated through the issuer after a cardholder dispute."}, {"term": "Representment", "category": "Disputes & Risk", "definition": "The merchant or acquirer’s response contesting a chargeback with supporting evidence."}, {"term": "Retrieval request", "category": "Disputes & Risk", "definition": "A request for transaction documentation or information, sometimes preceding a chargeback."}, {"term": "Interchange", "category": "Pricing", "definition": "A fee generally paid by the acquirer to the issuer for a card transaction."}, {"term": "Assessment fee", "category": "Pricing", "definition": "A fee charged by a card network for processing transactions on its network."}, {"term": "Merchant discount rate", "category": "Pricing", "definition": "The total percentage or amount deducted from merchant sales for payment acceptance services."}, {"term": "Basis points", "category": "Pricing", "definition": "A pricing unit equal to one one-hundredth of one percentage point; 100 basis points equals 1%."}, {"term": "Authorization rate", "category": "Performance", "definition": "The percentage of attempted authorizations that receive approval."}, {"term": "Approval rate", "category": "Performance", "definition": "The percentage of submitted transactions approved, often used interchangeably with authorization rate depending on context."}, {"term": "Decline code", "category": "Performance", "definition": "A response value explaining why an issuer or processor declined a transaction."}, {"term": "Soft decline", "category": "Performance", "definition": "A decline that may succeed after another attempt or additional authentication."}, {"term": "Hard decline", "category": "Performance", "definition": "A decline unlikely to succeed through retry, such as an invalid or closed account."}, {"term": "Fraud", "category": "Disputes & Risk", "definition": "Intentional deception designed to obtain money, goods, services, or account access."}, {"term": "Friendly fraud", "category": "Disputes & Risk", "definition": "A dispute involving a legitimate cardholder transaction that is later challenged as unauthorized or unsatisfactory."}, {"term": "Card-present", "category": "Acceptance", "definition": "A transaction where the card or payment device is physically used at the point of sale."}, {"term": "Card-not-present", "category": "Acceptance", "definition": "A transaction completed without the physical card being presented, such as online or phone payments."}, {"term": "Tokenization", "category": "Security", "definition": "Replacing sensitive payment data with a non-sensitive token that has limited usefulness if exposed."}, {"term": "Network token", "category": "Security", "definition": "A token provisioned and maintained through a card network, often with lifecycle updates and domain controls."}, {"term": "PAN", "category": "Security", "definition": "Primary Account Number—the identifying number associated with a card account."}, {"term": "BIN or IIN", "category": "Security", "definition": "The leading digits of a card number that identify the issuing institution and card program."}, {"term": "CVV", "category": "Security", "definition": "A card verification value used to help confirm possession of card details."}, {"term": "AVS", "category": "Security", "definition": "Address Verification Service, which compares billing-address information with issuer records."}, {"term": "3-D Secure", "category": "Security", "definition": "An authentication framework that allows issuers to verify cardholders during online purchases."}, {"term": "Recurring payment", "category": "Recurring Commerce", "definition": "A payment scheduled to occur repeatedly under an agreement."}, {"term": "Subscription billing", "category": "Recurring Commerce", "definition": "A model that charges customers on a repeating schedule for continued access to a product or service."}, {"term": "Credential-on-file", "category": "Recurring Commerce", "definition": "A payment credential stored with permission for future transactions."}, {"term": "Merchant-initiated transaction", "category": "Recurring Commerce", "definition": "A payment initiated by a merchant under a prior agreement without the cardholder actively participating at that moment."}, {"term": "Cardholder-initiated transaction", "category": "Recurring Commerce", "definition": "A payment initiated while the cardholder actively participates in the transaction."}, {"term": "Pass-through pricing", "category": "Pricing", "definition": "A model that passes underlying network and interchange costs through to the merchant with separate provider markup."}, {"term": "Merchant pass-through", "category": "Pricing", "definition": "A cost or fee charged through to the merchant rather than absorbed by the provider."}, {"term": "Absorb", "category": "Pricing", "definition": "To cover a fee or cost internally instead of passing it to the merchant or customer."}, {"term": "Blended pricing", "category": "Pricing", "definition": "A combined rate that bundles multiple payment costs into one price."}, {"term": "Interchange-plus", "category": "Pricing", "definition": "Pricing that charges actual interchange and network costs plus a separate processor markup."}, {"term": "Flat-rate pricing", "category": "Pricing", "definition": "A single consistent rate applied to eligible transactions regardless of the underlying interchange category."}, {"term": "ISO", "category": "Participants", "definition": "Independent Sales Organization—a company that markets payment services, often under sponsorship from an acquiring bank."}, {"term": "Independent sales organization", "category": "Participants", "definition": "A registered organization that sells or supports merchant acquiring services on behalf of payment partners."}, {"term": "Payment facilitator", "category": "Participants", "definition": "A provider that onboards sub-merchants under its master merchant relationship."}, {"term": "Sub-merchant", "category": "Participants", "definition": "A seller boarded under a payment facilitator rather than holding a direct traditional merchant account."}, {"term": "Sponsor bank", "category": "Participants", "definition": "A regulated bank that sponsors payment providers or programs into networks and provides oversight."}, {"term": "Reserve", "category": "Risk & Funding", "definition": "Funds held to cover potential losses, disputes, refunds, or other financial exposure."}, {"term": "Rolling reserve", "category": "Risk & Funding", "definition": "A percentage of merchant funds withheld for a defined period on an ongoing basis."}, {"term": "Funding delay", "category": "Risk & Funding", "definition": "The elapsed time between transaction processing and merchant receipt of settled funds."}, {"term": "Batch", "category": "Operations", "definition": "A group of transactions submitted together for processing, clearing, or settlement."}, {"term": "Reconciliation", "category": "Operations", "definition": "Matching transaction, fee, settlement, and bank records to identify and resolve differences."}, {"term": "Dispute", "category": "Disputes & Risk", "definition": "A cardholder or account-holder challenge to a transaction."}, {"term": "Compliance", "category": "Compliance", "definition": "Adherence to laws, regulations, network rules, contracts, and internal controls."}, {"term": "PCI DSS", "category": "Compliance", "definition": "Payment Card Industry Data Security Standard—requirements for protecting cardholder data."}, {"term": "KYC", "category": "Compliance", "definition": "Know Your Customer—processes used to verify and assess individual customers."}, {"term": "KYB", "category": "Compliance", "definition": "Know Your Business—processes used to verify and assess business entities and owners."}, {"term": "AML", "category": "Compliance", "definition": "Anti-Money Laundering controls intended to detect and prevent illicit financial activity."}, {"term": "ACH", "category": "Payment Rails", "definition": "Automated Clearing House—a U.S. network for batch electronic bank transfers."}, {"term": "RTP", "category": "Payment Rails", "definition": "Real-Time Payments, commonly referring to The Clearing House’s instant-payment network in the United States."}, {"term": "FedNow", "category": "Payment Rails", "definition": "The Federal Reserve’s instant-payment service for participating U.S. financial institutions."}, {"term": "Wire transfer", "category": "Payment Rails", "definition": "A bank-to-bank funds transfer generally designed for direct, final movement of money."}, {"term": "Push payment", "category": "Payment Rails", "definition": "A payment where the sender instructs funds to move to a recipient."}, {"term": "Pull payment", "category": "Payment Rails", "definition": "A payment where the recipient or merchant initiates collection from the payer’s account with authorization."}, {"term": "Debit", "category": "Products", "definition": "A payment product that generally draws from funds in a deposit account."}, {"term": "Credit", "category": "Products", "definition": "A payment product that uses a line of credit extended by an issuer."}, {"term": "Prepaid", "category": "Products", "definition": "A payment product funded in advance rather than linked directly to deposit funds or revolving credit."}, {"term": "Digital wallet", "category": "Acceptance", "definition": "A digital service that stores or represents payment credentials for convenient use."}, {"term": "Contactless", "category": "Acceptance", "definition": "A payment interaction completed by tapping or bringing a credential near a compatible reader."}, {"term": "NFC", "category": "Acceptance", "definition": "Near Field Communication—the short-range technology commonly used for contactless payments."}, {"term": "EMV", "category": "Acceptance", "definition": "Global chip-card specifications that support secure in-person payment transactions."}, {"term": "Fallback transaction", "category": "Acceptance", "definition": "A transaction processed using a less-preferred method because the primary chip method could not be completed."}, {"term": "Stand-in processing", "category": "Operations", "definition": "A network or processor making an authorization decision when the issuer is unavailable, using predefined rules."}, {"term": "Partial authorization", "category": "Authorization", "definition": "An approval for less than the full requested amount, often allowing another tender to cover the remainder."}, {"term": "Incremental authorization", "category": "Authorization", "definition": "An additional authorization used when the final amount increases after an initial approval."}, {"term": "Split tender", "category": "Acceptance", "definition": "Using more than one payment method to complete a purchase."}, {"term": "Account updater", "category": "Recurring Commerce", "definition": "A service that refreshes stored card credentials when accounts are reissued or changed."}, {"term": "Dunning", "category": "Recurring Commerce", "definition": "The communications and recovery process used after recurring payments fail."}, {"term": "Retry logic", "category": "Recurring Commerce", "definition": "Rules governing when and how failed payment attempts are submitted again."}, {"term": "Payment orchestration", "category": "Technology", "definition": "A layer that coordinates multiple processors, payment methods, routing rules, and related services."}, {"term": "Routing", "category": "Technology", "definition": "Directing a payment transaction to a selected processor, acquirer, network, or pathway."}, {"term": "Smart routing", "category": "Technology", "definition": "Using rules or data to dynamically choose a transaction path intended to improve cost, performance, or resilience."}, {"term": "Cross-border transaction", "category": "International", "definition": "A transaction where the merchant and payment account are associated with different countries or regions."}, {"term": "Dynamic currency conversion", "category": "International", "definition": "Offering a cardholder the choice to pay in their home currency at the point of sale."}, {"term": "Foreign-exchange markup", "category": "International", "definition": "An added cost or margin applied when converting one currency to another."}];

function academyState(){
  const s=store.get();
  return {
    results:Array.isArray(s.academyQuizResults)?s.academyQuizResults:[],
    review:Array.isArray(s.academyReviewTerms)?s.academyReviewTerms:[],
    index:Number(s.academyGlossaryIndex||0)
  };
}
function academyPage(){
  const cats=[...new Set(GLOSSARY.map(x=>x.category))];
  return `<div class="academy-luxe">
    <div class="pagehead academy-head"><div><div class="eyebrow">Payments mastery, beautifully organized</div><h1>Payments Academy</h1><p class="sub">A private luxury glossary and knowledge studio for the language of modern payments.</p></div><span class="pill">${GLOSSARY.length} essential terms</span></div>
    <section class="card academy-hero"><div><div class="eyebrow">Your professional vocabulary</div><h2>Learn the industry one polished card at a time.</h2><p>Swipe, search, mark terms for review, and turn your study activity into measurable weekly progress.</p></div><div class="academy-orb"><strong id="academyWeeklyCount">0</strong><span>quizzes this week</span></div></section>
    <div class="academy-grid">
      <article class="card academy-study-card">
        <div class="section-title"><div><div class="eyebrow">Glossary deck</div><h3>Swipe to study</h3></div><span id="academyPosition" class="pill">1 / ${GLOSSARY.length}</span></div>
        <div class="academy-search-row"><input id="academySearch" class="input" type="search" placeholder="Search acquiring bank, pass-through, settlement…"><select id="academyCategory"><option value="">All categories</option>${cats.map(c=>`<option>${c}</option>`).join('')}</select></div>
        <div id="academyDeck" class="academy-deck" tabindex="0"></div>
        <div class="academy-controls"><button id="academyPrevious" class="btn ghost">← Previous</button><button id="academyReview" class="btn secondary">◇ Mark for review</button><button id="academyNext" class="btn">Next →</button></div>
      </article>
      <article class="card academy-progress-card"><div class="eyebrow">Weekly intelligence</div><h3>Study Progress</h3><div id="academyProgress"></div><button id="startAcademyQuiz" class="btn">Begin Knowledge Check</button><button id="reviewAcademyTerms" class="btn ghost">Study Review List</button></article>
    </div>
    <article class="card academy-library"><div class="section-title"><div><div class="eyebrow">Complete reference</div><h3>Glossary Library</h3></div><span class="pill">Searchable · private</span></div><div id="academyLibrary"></div></article>
    <dialog id="academyQuizDialog" class="academy-dialog"><article class="card academy-quiz-modal"><button class="icon-button reflection-close" data-close-quiz>×</button><div id="academyQuizBody"></div></article></dialog>
  </div>`;
}
export function patchPagesSprint6B9(pages){pages.career=academyPage}

function filteredTerms(){
  const q=($('#academySearch')?.value||'').trim().toLowerCase();
  const cat=$('#academyCategory')?.value||'';
  return GLOSSARY.filter(x=>(!cat||x.category===cat)&&(!q||`${x.term} ${x.definition} ${x.category}`.toLowerCase().includes(q)));
}
let deckIndex=0;
function renderDeck(){
  const terms=filteredTerms(),host=$('#academyDeck');if(!host)return;
  if(!terms.length){host.innerHTML='<div class="status">No glossary terms match this search.</div>';$('#academyPosition').textContent='0 / 0';return}
  deckIndex=Math.max(0,Math.min(deckIndex,terms.length-1));
  const term=terms[deckIndex],review=academyState().review.includes(term.term);
  host.innerHTML=`<article class="glossary-card"><div class="glossary-shine"></div><div class="mini">${esc(term.category)}</div><h2>${esc(term.term)}</h2><p>${esc(term.definition)}</p><div class="glossary-footer"><span>Swipe or use the arrows</span><b>${review?'◇ Review list':'Key term'}</b></div></article>`;
  $('#academyPosition').textContent=`${deckIndex+1} / ${terms.length}`;
  $('#academyReview').textContent=review?'◆ Remove from review':'◇ Mark for review';
}
function weeklyResults(){
  const now=new Date(),start=new Date(now);start.setDate(now.getDate()-6);const from=localKey(start),to=localKey(now);
  return academyState().results.filter(x=>String(x.date).slice(0,10)>=from&&String(x.date).slice(0,10)<=to);
}
function progressStats(){
  const week=weeklyResults(),latest=academyState().results[0],avg=week.length?Math.round(week.reduce((n,x)=>n+Number(x.score||0),0)/week.length):0;
  const missed={},correct={},categoryCorrect={},categoryMissed={};
  week.forEach(r=>{
    (r.missed||[]).forEach(t=>{missed[t]=(missed[t]||0)+1;const g=GLOSSARY.find(x=>x.term===t);if(g)categoryMissed[g.category]=(categoryMissed[g.category]||0)+1});
    (r.correctTerms||[]).forEach(t=>{correct[t]=(correct[t]||0)+1;const g=GLOSSARY.find(x=>x.term===t);if(g)categoryCorrect[g.category]=(categoryCorrect[g.category]||0)+1});
  });
  const weak=Object.entries(missed).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);
  const strong=Object.entries(correct).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);
  const strongAreas=Object.entries(categoryCorrect).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);
  const weakAreas=Object.entries(categoryMissed).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);
  return {week,latest,avg,weak,strong,strongAreas,weakAreas};
}
function renderProgress(){
  const host=$('#academyProgress');if(!host)return;
  const s=progressStats();$('#academyWeeklyCount').textContent=s.week.length;
  host.innerHTML=`<div class="academy-stat-grid"><div><span>Quizzes</span><strong>${s.week.length}</strong></div><div><span>Latest</span><strong>${s.latest?`${s.latest.score}%`:'—'}</strong></div><div><span>Weekly average</span><strong>${s.week.length?`${s.avg}%`:'—'}</strong></div><div><span>Review list</span><strong>${academyState().review.length}</strong></div></div>
  <div class="academy-signal"><b>Strongest glossary areas</b><p>${s.strongAreas.length?s.strongAreas.map(esc).join(' · '):'Complete a quiz to reveal your strengths.'}</p></div>
  <div class="academy-signal"><b>Strongest terms</b><p>${s.strong.length?s.strong.map(esc).join(' · '):'No term-level pattern yet.'}</p></div>
  <div class="academy-signal"><b>Terms needing review</b><p>${s.weak.length?s.weak.map(esc).join(' · '):'No repeated misses yet.'}</p></div>`;
}
function renderLibrary(){
  const host=$('#academyLibrary');if(!host)return;
  const groups={};filteredTerms().forEach(x=>(groups[x.category]??=[]).push(x));
  host.innerHTML=Object.entries(groups).map(([cat,terms])=>`<section class="glossary-category"><h4>${esc(cat)}</h4>${terms.map(x=>`<button class="glossary-row" data-open-term="${esc(x.term)}"><span>${esc(x.term)}</span><small>${esc(x.definition)}</small></button>`).join('')}</section>`).join('')||'<div class="status">No matching definitions.</div>';
  all('[data-open-term]').forEach(b=>b.onclick=()=>{const terms=filteredTerms(),i=terms.findIndex(x=>x.term===b.dataset.openTerm);if(i>=0){deckIndex=i;renderDeck();$('#academyDeck').scrollIntoView({behavior:'smooth',block:'center'})}});
}
function moveDeck(delta){
  const terms=filteredTerms();if(!terms.length)return;deckIndex=(deckIndex+delta+terms.length)%terms.length;renderDeck();
}
function toggleReview(){
  const terms=filteredTerms();if(!terms.length)return;const term=terms[deckIndex].term;
  store.mutate(d=>{d.academyReviewTerms=Array.isArray(d.academyReviewTerms)?d.academyReviewTerms:[];d.academyReviewTerms=d.academyReviewTerms.includes(term)?d.academyReviewTerms.filter(x=>x!==term):[...d.academyReviewTerms,term]});
  renderDeck();renderProgress();
}
function questionSet(){
  const pool=[...GLOSSARY].sort(()=>Math.random()-.5).slice(0,10);
  return pool.map((term,i)=>{
    const reverse=i%2===1;
    const wrong=GLOSSARY.filter(x=>x.term!==term.term).sort(()=>Math.random()-.5).slice(0,3);
    const options=[term,...wrong].sort(()=>Math.random()-.5);
    return reverse?{prompt:term.definition,answer:term.term,term:term.term,category:term.category,options:options.map(x=>x.term)}:{prompt:term.term,answer:term.definition,term:term.term,category:term.category,options:options.map(x=>x.definition)};
  });
}
let quiz=null;
function startQuiz(){
  quiz={questions:questionSet(),index:0,answers:[]};renderQuestion();$('#academyQuizDialog').showModal();
}
function renderQuestion(){
  const q=quiz.questions[quiz.index],host=$('#academyQuizBody');
  host.innerHTML=`<div class="eyebrow">Knowledge Check · ${quiz.index+1} of ${quiz.questions.length}</div><h2>${quiz.index%2?'Which term matches this definition?':'What does this term mean?'}</h2><div class="quiz-prompt">${esc(q.prompt)}</div><div class="quiz-options">${q.options.map((x,i)=>`<button data-quiz-option="${i}" class="quiz-option">${esc(x)}</button>`).join('')}</div><div id="quizFeedback"></div>`;
  all('[data-quiz-option]').forEach(b=>b.onclick=()=>answerQuestion(q.options[Number(b.dataset.quizOption)]));
}
function answerQuestion(answer){
  const q=quiz.questions[quiz.index],correct=answer===q.answer;
  quiz.answers.push({term:q.term,category:q.category,correct});
  all('[data-quiz-option]').forEach(b=>{b.disabled=true;if(q.options[Number(b.dataset.quizOption)]===q.answer)b.classList.add('correct');else if(q.options[Number(b.dataset.quizOption)]===answer)b.classList.add('incorrect')});
  $('#quizFeedback').innerHTML=`<div class="quiz-feedback ${correct?'success':'needs-review'}"><b>${correct?'Correct':'Not quite'}</b><p>${correct?'Beautifully done.':`Correct answer: ${esc(q.answer)}`}</p><button id="nextQuizQuestion" class="btn">${quiz.index===quiz.questions.length-1?'See Results':'Next Question'}</button></div>`;
  $('#nextQuizQuestion').onclick=()=>{quiz.index++;if(quiz.index<quiz.questions.length)renderQuestion();else finishQuiz()};
}
function finishQuiz(){
  const correct=quiz.answers.filter(x=>x.correct),missed=quiz.answers.filter(x=>!x.correct),score=Math.round(correct.length/quiz.answers.length*100);
  const result={id:Date.now(),date:new Date().toISOString(),score,questionCount:quiz.questions.length,missed:missed.map(x=>x.term),correctTerms:correct.map(x=>x.term),categories:quiz.answers.map(x=>x.category)};
  store.mutate(d=>{d.academyQuizResults=Array.isArray(d.academyQuizResults)?d.academyQuizResults:[];d.academyQuizResults.unshift(result);d.academyReviewTerms=[...new Set([...(d.academyReviewTerms||[]),...result.missed])] });
  $('#academyQuizBody').innerHTML=`<div class="eyebrow">Knowledge Check Complete</div><h2>${score}%</h2><div class="academy-result-orb">${correct.length} / ${quiz.questions.length}</div><p>${score>=80?'Strong work. Your payments vocabulary is becoming executive-level.':'Your review list has been updated with every missed term.'}</p>${missed.length?`<div class="status"><b>Review next:</b> ${missed.map(x=>esc(x.term)).join(' · ')}</div>`:''}<button data-close-quiz class="btn">Return to Academy</button>`;
  all('[data-close-quiz]').forEach(b=>b.onclick=()=>{$('#academyQuizDialog').close();renderProgress();renderDeck()});
}
function enhanceAcademy(){
  deckIndex=academyState().index;renderDeck();renderLibrary();renderProgress();
  $('#academyPrevious').onclick=()=>moveDeck(-1);$('#academyNext').onclick=()=>moveDeck(1);$('#academyReview').onclick=toggleReview;
  $('#academySearch').oninput=()=>{deckIndex=0;renderDeck();renderLibrary()};$('#academyCategory').onchange=()=>{deckIndex=0;renderDeck();renderLibrary()};
  $('#startAcademyQuiz').onclick=startQuiz;$('#reviewAcademyTerms').onclick=()=>{const r=academyState().review;if(!r.length)return;$('#academySearch').value=r[0];deckIndex=0;renderDeck();renderLibrary()};
  $('#academyDeck').addEventListener('keydown',e=>{if(e.key==='ArrowLeft')moveDeck(-1);if(e.key==='ArrowRight')moveDeck(1)});
  let startX=0;$('#academyDeck').addEventListener('touchstart',e=>startX=e.changedTouches[0].clientX,{passive:true});$('#academyDeck').addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>45)moveDeck(dx<0?1:-1)},{passive:true});
  all('[data-close-quiz]').forEach(b=>b.onclick=()=>$('#academyQuizDialog').close());
}


function agendaItems6B9(date){
  const st=store.get(),v=st.calendar?.[date]||{},items=[];
  String(v.events||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).forEach(x=>items.push(['event','Event',x]));
  String(v.tasks||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).forEach(x=>items.push(['task','Task',x]));
  String(v.birthdays||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).forEach(x=>items.push(['birthday','Birthday',x]));
  String(v.holidays||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).forEach(x=>items.push(['holiday','Holiday',x]));
  (st.bills||[]).filter(b=>b.due===date).forEach(b=>items.push(['bill',b.paid?'Paid bill':'Bill',`${b.name} · ${money(b.amount)}`]));
  if(v.notes)items.push(['note','Notes',v.notes]);
  return items;
}
function openAgendaDay6B9(date){
  let d=$('#agendaDay6B9');
  if(!d){
    document.body.insertAdjacentHTML('beforeend',`<dialog id="agendaDay6B9" class="agenda-dialog frosted-day-dialog agenda-final-dialog"><article class="card agenda-modal"><button type="button" class="icon-button reflection-close" data-close-agenda-final>×</button><div id="agendaDayBody6B9"></div></article></dialog>`);
    d=$('#agendaDay6B9');
  }
  const items=agendaItems6B9(date),value=store.get().calendar?.[date]||{};
  $('#agendaDayBody6B9').innerHTML=`<div class="eyebrow">Agenda day details</div><h2>${new Date(`${date}T12:00:00`).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</h2><div class="agenda-quick-list">${items.map(([type,label,text])=>`<div class="agenda-quick-item ${type}"><span class="agenda-dot ${type}"></span><div><small>${esc(label)}</small><b>${esc(text)}</b></div></div>`).join('')||'<div class="status">This day is open.</div>'}</div><div class="row wrap"><button id="editAgendaFinal6B9" type="button" class="btn">Edit This Day</button><button type="button" class="btn secondary" data-close-agenda-final>Close</button></div>`;
  all('[data-close-agenda-final]').forEach(b=>b.onclick=()=>d.close());
  $('#editAgendaFinal6B9').onclick=()=>{
    d.close();
    const fields=[['calSubject','subject'],['calEvents','events'],['calTasks','tasks'],['calBirthdays','birthdays'],['calHolidays','holidays'],['calNotes','notes']];
    if($('#calDate'))$('#calDate').value=date;
    fields.forEach(([id,key])=>{if($('#'+id))$('#'+id).value=value[key]||''});
    $('#calDate')?.scrollIntoView({behavior:'smooth',block:'center'});
  };
  const selected=$('#selectedDayDetail');
  if(selected)selected.innerHTML=`<b>${esc(value.subject||date)}</b><p>${items.length?items.map(x=>esc(x[2])).join(' · '):'Nothing scheduled.'}</p>`;
  if(d.open)d.close();
  d.showModal();
}
function saveAgendaFinal6B9(event){
  event.preventDefault();event.stopImmediatePropagation();
  const date=$('#calDate')?.value,status=$('#agendaSaveStatus');
  if(!date){if(status)status.textContent='Choose a date first.';return}
  const entry={
    subject:$('#calSubject')?.value.trim()||'',
    events:$('#calEvents')?.value||'',
    tasks:$('#calTasks')?.value||'',
    birthdays:$('#calBirthdays')?.value||'',
    holidays:$('#calHolidays')?.value||'',
    notes:$('#calNotes')?.value||''
  };
  try{
    store.mutate(d=>{d.calendar=d.calendar||{};d.calendar[date]=entry});
    if(status){status.textContent=`Saved ${date}. Your Agenda is up to date.`;status.classList.add('saved-confirmation')}
    openAgendaDay6B9(date);
  }catch(error){
    if(status)status.textContent=`Save failed: ${error.message}`;
  }
}
function clearAgendaFinal6B9(event){
  event.preventDefault();event.stopImmediatePropagation();
  ['calDate','calSubject','calEvents','calTasks','calBirthdays','calHolidays','calNotes'].forEach(id=>{const el=$('#'+id);if(el)el.value=''});
  const status=$('#agendaSaveStatus');if(status){status.textContent='Editor cleared.';status.classList.remove('saved-confirmation')}
}
function enhanceAgendaFinal(){
  const save=$('#saveCalendarDay'),clear=$('#clearCalendarEditor');
  if(save&&!save.dataset.finalOwner){save.dataset.finalOwner='6b9';save.addEventListener('click',saveAgendaFinal6B9,true)}
  if(clear&&!clear.dataset.finalOwner){clear.dataset.finalOwner='6b9';clear.addEventListener('click',clearAgendaFinal6B9,true)}
  const bindHost=host=>{if(host&&!host.dataset.finalOwner){host.dataset.finalOwner='6b9';host.addEventListener('click',event=>{const day=event.target.closest('[data-day],[data-calendar-date]');if(!day)return;event.preventDefault();event.stopImmediatePropagation();openAgendaDay6B9(day.dataset.day||day.dataset.calendarDate)},true)}};
  bindHost($('#calendarGrid'));bindHost($('#next7'));
}

function academySummaryHTML(){
  const s=progressStats();
  return `<div class="academy-summary-lines"><div><span>Quizzes this week</span><b>${s.week.length}</b></div><div><span>Latest score</span><b>${s.latest?`${s.latest.score}%`:'—'}</b></div><div><span>Weekly average</span><b>${s.week.length?`${s.avg}%`:'—'}</b></div></div><p class="muted">${s.strongAreas.length?`Strongest: ${s.strongAreas.map(esc).join(' · ')}`:'Complete a knowledge check to reveal your strongest areas.'}</p><p class="muted">${s.weak.length?`Review: ${s.weak.map(esc).join(' · ')}`:'No repeated misses yet.'}</p>`;
}
function enhanceMorningBrief(){
  const weekly=[...document.querySelectorAll('h3')].find(x=>/Weekly Review/i.test(x.textContent))?.closest('.card');
  if(!weekly)return;
  let card=$('#academyBrief6B9');if(!card){card=document.createElement('article');card.id='academyBrief6B9';card.className='card';weekly.after(card)}
  card.innerHTML=`<div class="section-title"><h3>Payments Academy</h3><button class="btn ghost" data-jump="career">Open Academy</button></div>${academySummaryHTML()}`;
}
function enhanceDashboard(router){
  const panel=[...document.querySelectorAll('.dashboard-panel')].find(x=>/Payments Academy|Payments mastery|private case note/i.test(x.textContent));
  if(panel)panel.innerHTML=`<div class="mini">Payments Academy</div><h3>Your weekly learning signal</h3>${academySummaryHTML()}<button class="btn ghost" id="openAcademy6B9">Open Payments Academy</button>`;
  $('#openAcademy6B9')?.addEventListener('click',()=>router.go('career'));
  const briefButtons=all('button').filter(x=>/Open Morning Brief/i.test(x.textContent));
  briefButtons.forEach(b=>b.onclick=()=>router.go('intelligence'));
}
function ensurePaidCommand(){
  const list=$('#billList');if(!list)return;
  let box=$('#paidCommand6B9');if(!box){box=document.createElement('section');box.id='paidCommand6B9';box.className='paid-command card';list.before(box)}
  const st=store.get(),month=localKey().slice(0,7),monthBills=st.bills.filter(b=>String(b.due||'').startsWith(month)),paid=monthBills.filter(b=>b.paid),due=monthBills.filter(b=>!b.paid),paidTotal=paid.reduce((n,b)=>n+Number(b.amount||0),0),dueTotal=due.reduce((n,b)=>n+Number(b.amount||0),0),cash=Number(st.checking||0)+Number(st.savings||0)+Number(st.otherAssets||0);
  box.innerHTML=`<div class="section-title"><div><div class="eyebrow">Monthly payment command</div><h3>${new Date().toLocaleDateString('en-US',{month:'long'})} Bills</h3></div><span class="pill">${paid.length} / ${monthBills.length} paid</span></div><div class="paid-metric-grid"><div><span>Available cash</span><b>${money(cash)}</b></div><div><span>Paid</span><b>${money(paidTotal)}</b></div><div><span>Still due</span><b>${money(dueTotal)}</b></div><div><span>Cash after unpaid</span><b>${money(cash-dueTotal)}</b></div></div><div class="segmented"><button data-paid-filter="all">All</button><button data-paid-filter="unpaid">Unpaid</button><button data-paid-filter="paid">Paid</button></div><div id="paidBillRows6B9"></div>`;
  renderPaidRows();
}
function renderPaidRows(){
  const host=$('#paidBillRows6B9');if(!host)return;
  const filter=host.dataset.filter||'all',bills=[...store.get().bills].filter(b=>filter==='all'||(filter==='paid'?b.paid:!b.paid)).sort((a,b)=>String(a.due).localeCompare(String(b.due)));
  host.innerHTML=bills.map(b=>`<label class="paid-bill-row"><input type="checkbox" data-paid-toggle="${b.id}" ${b.paid?'checked':''}><div><b>${esc(b.name)}</b><small>${money(b.amount)} · due ${b.due||'not set'}${b.paid?` · paid ${b.paidDate||'this month'}`:''}</small></div><span>${b.paid?'Paid':'Due'}</span></label>`).join('')||'<div class="status">No bills in this view.</div>';
  all('[data-paid-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.paidFilter===filter);b.onclick=()=>{host.dataset.filter=b.dataset.paidFilter;renderPaidRows()}});
  all('[data-paid-toggle]').forEach(c=>c.onchange=()=>{store.mutate(d=>{const b=d.bills.find(x=>String(x.id)===String(c.dataset.paidToggle));if(b){b.paid=c.checked;b.paidDate=c.checked?localKey():''}});ensurePaidCommand()});
}
function sapphireLaniContrast(){
  if(document.documentElement.dataset.theme!=='sapphire')return;
  document.querySelector('.lani-page')?.classList.add('sapphire-readable-6b9');
}
function removeNoirEverywhere(){
  if(store.get().theme==='noir')store.set({theme:'midnight'});
  all('[data-theme-choice="noir"],.theme-noir').forEach(x=>x.remove());
  all('.theme-card').forEach(x=>{if(/retired legacy theme/i.test(x.textContent))x.remove()});
}
function updateBuild(){const b=$('#kcBuildStatus b');if(b)b.textContent=BUILD}

export async function enhanceSprint6B9(id,router){
  removeNoirEverywhere();updateBuild();
  if(id==='calendar')enhanceAgendaFinal();
  if(id==='career')enhanceAcademy();
  if(id==='intelligence')enhanceMorningBrief();
  if(id==='dashboard')enhanceDashboard(router);
  if(id==='money')setTimeout(ensurePaidCommand,0);
  if(id==='lani')sapphireLaniContrast();
}
