const DB='key-collective-evolution-vault',STORE='monthly-media',VERSION=1;
function openDB(){return new Promise((resolve,reject)=>{const request=indexedDB.open(DB,VERSION);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE,{keyPath:'id'})};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
function transact(mode,run){return openDB().then(db=>new Promise((resolve,reject)=>{const transaction=db.transaction(STORE,mode),request=run(transaction.objectStore(STORE));request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);transaction.oncomplete=()=>db.close()}))}
export const putEvolutionMedia=record=>transact('readwrite',store=>store.put(record));
export const getEvolutionMedia=()=>transact('readonly',store=>store.getAll());
export const deleteEvolutionMedia=id=>transact('readwrite',store=>store.delete(id));
