// IndexedDB-backed blob store + metadata
const DB_NAME = "errl-studio";
const DB_VER = 1;
const META = "meta";
const FILES = "files";

function openDB(){
  return new Promise((resolve, reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if(!db.objectStoreNames.contains(META)) db.createObjectStore(META, { keyPath: "id" });
      if(!db.objectStoreNames.contains(FILES)) db.createObjectStore(FILES, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAsset({ id, name, type, size, blob }){
  const db = await openDB();
  await txPut(db, FILES, { id, blob });
  await txPut(db, META, { id, name, type, size, updatedAt: Date.now() });
  db.close();
  return { id, name, type, size };
}

export async function getAssetMeta(id){
  const db = await openDB();
  const meta = await txGet(db, META, id);
  db.close();
  return meta;
}

export async function getAssetBlob(id){
  const db = await openDB();
  const file = await txGet(db, FILES, id);
  db.close();
  return file?.blob || null;
}

export async function listAssets(){
  const db = await openDB();
  const metas = await txAll(db, META);
  db.close();
  return metas.sort((a,b)=> (b.updatedAt||0)-(a.updatedAt||0));
}

export async function removeAsset(id){
  const db = await openDB();
  await txDel(db, META, id);
  await txDel(db, FILES, id);
  db.close();
}

function txPut(db, store, value){
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
function txGet(db, store, key){
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function txDel(db, store, key){
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
function txAll(db, store){
  return new Promise((resolve, reject)=>{
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
