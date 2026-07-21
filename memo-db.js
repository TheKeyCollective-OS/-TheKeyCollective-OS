const DB='key-collective-media',STORE='voice-memos';
const open=()=>new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
const tx=async(mode,fn)=>{const db=await open();return new Promise((resolve,reject)=>{const t=db.transaction(STORE,mode),s=t.objectStore(STORE);const req=fn(s);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);t.oncomplete=()=>db.close()})};
export const putMemo=m=>tx('readwrite',s=>s.put(m));
export const getMemos=()=>tx('readonly',s=>s.getAll());
export const deleteMemo=id=>tx('readwrite',s=>s.delete(id));
