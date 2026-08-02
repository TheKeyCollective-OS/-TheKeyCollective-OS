const corrections={
  accomodate:'accommodate',accomodated:'accommodated',acheive:'achieve',acheived:'achieved',adress:'address',alot:'a lot',apparant:'apparent',arguement:'argument',becuase:'because',beleive:'believe',beleived:'believed',buisness:'business',calender:'calendar',comming:'coming',definately:'definitely',embarass:'embarrass',embarassed:'embarrassed',enviroment:'environment',existance:'existence',experiance:'experience',freind:'friend',freinds:'friends',goverment:'government',happend:'happened',immediatly:'immediately',independant:'independent',knowlege:'knowledge',maintainance:'maintenance',neccessary:'necessary',occured:'occurred',oppurtunity:'opportunity',persistant:'persistent',posession:'possession',prefered:'preferred',priviledge:'privilege',publically:'publicly',realise:'realize',recieve:'receive',recieved:'received',recomend:'recommend',recomendation:'recommendation',refered:'referred',remeber:'remember',responsability:'responsibility',seperate:'separate',seperated:'separated',succesful:'successful',succesfully:'successfully',teh:'the',thier:'their',tommorow:'tomorrow',truely:'truly',untill:'until',wierd:'weird',wich:'which',writting:'writing',
  arent:"aren't",cant:"can't",couldnt:"couldn't",didnt:"didn't",doesnt:"doesn't",dont:"don't",hadnt:"hadn't",hasnt:"hasn't",havent:"haven't",isnt:"isn't",shouldnt:"shouldn't",wasnt:"wasn't",werent:"weren't",wont:"won't",wouldnt:"wouldn't",im:"I'm",ive:"I've"
};
const textSelector='textarea,input:not([type]),input[type="text"]';
function preserveToken(token){return /^[A-Z][A-Z0-9&.-]{1,9}$/.test(token)||/https?:|www\.|@/.test(token)||/[A-Z].*[A-Z]/.test(token)}
function matchCase(source,replacement){if(source===source.toUpperCase())return replacement.toUpperCase();if(source[0]===source[0]?.toUpperCase())return replacement[0].toUpperCase()+replacement.slice(1);return replacement}
export function autocorrectText(value){
  const source=String(value??'');if(!source.trim())return source;
  let corrected=source.replace(/[A-Za-z]+(?:['’][A-Za-z]+)?/g,word=>{if(preserveToken(word))return word;const replacement=corrections[word.toLowerCase().replace('’',"'")];return replacement?matchCase(word,replacement):word});
  corrected=corrected.replace(/[ \t]+([,.;!?])/g,'$1').replace(/([,.;!?])(?=[A-Za-z])/g,'$1 ').replace(/[ \t]{2,}/g,' ');
  corrected=corrected.replace(/(^|[.!?]\s+)([a-z])/g,(_,lead,letter)=>lead+letter.toUpperCase());
  return corrected;
}
function eligible(field){return field?.matches?.(textSelector)&&!field.matches('[data-no-autocorrect],[readonly],[disabled]')&&!/search|url|email|password/i.test(field.type||'')}
function correctField(field){if(!eligible(field))return false;const next=autocorrectText(field.value);if(next===field.value)return false;field.value=next;field.dispatchEvent(new Event('input',{bubbles:true}));return true}
function prepare(root=document){root.querySelectorAll?.(textSelector).forEach(field=>{if(!eligible(field))return;field.spellcheck=true;field.setAttribute('autocorrect','on');field.setAttribute('autocapitalize','sentences')})}
let installed=false;
export function installAutocorrect(){
  if(installed)return;installed=true;prepare();
  new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1){if(eligible(node))prepare(node.parentElement||document);else prepare(node)}}))).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('blur',event=>correctField(event.target),true);
  document.addEventListener('click',event=>{const button=event.target.closest('button,[role="button"]');if(!button)return;const signal=`${button.id||''} ${button.dataset.action||''} ${button.dataset.act||''} ${button.dataset.kc44Action||''} ${button.textContent||''}`;if(!/save|add|create|record|update|submit|log|seal/i.test(signal))return;const scope=button.closest('form,dialog,[role="dialog"],.modal,.card')||document;scope.querySelectorAll(textSelector).forEach(correctField)},true);
}
