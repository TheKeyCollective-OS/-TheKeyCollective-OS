const CURRENT_KEY='keyCollectiveOS.core.v1';
const LEGACY_KEYS=['theKeyCollectiveOS_v4','theKeyCollectiveOS_v4_1'];
const defaults={theme:'light',checking:0,savings:0,bills:[],calendar:{},top3:['','',''],top3Done:[false,false,false],water:0,gymMinutes:0,goals:[],journalEntries:[],journalPromptHistory:{},laniPhotos:[],laniFacts:{height:'',medications:'',foods:'',toys:'',shows:'',sizes:'',giftIdeas:'',allergies:''},laniMemories:[],newsTopics:['Business','Fintech','AI','Arizona','U.S.','World'],careerNotes:[],savingsGoals:[],wins:[]};
function merge(v){return {...defaults,...v,laniFacts:{...defaults.laniFacts,...(v?.laniFacts||{})}}}
function migrate(){for(const key of LEGACY_KEYS){const raw=localStorage.getItem(key);if(raw){try{const old=JSON.parse(raw);const next=merge(old);localStorage.setItem(CURRENT_KEY,JSON.stringify(next));return next}catch{}}}return merge({})}
let state=(()=>{try{const raw=localStorage.getItem(CURRENT_KEY);return raw?merge(JSON.parse(raw)):migrate()}catch{return merge({})}})();
export const store={get:()=>state,set(patch){state=merge({...state,...patch});localStorage.setItem(CURRENT_KEY,JSON.stringify(state));window.dispatchEvent(new CustomEvent('kc:state',{detail:state}))},mutate(fn){const draft=structuredClone(state);fn(draft);this.set(draft)},export(){return JSON.stringify(state,null,2)},import(text){this.set(JSON.parse(text))},key:CURRENT_KEY};
