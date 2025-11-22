// Pluggable cloud sync adapter (simple multipart POST)
import { getAssetBlob, getAssetMeta, listAssets } from "./assetStore.js";

export async function syncUpSelected(ids){
  const out = [];
  for(const id of ids){
    const meta = await getAssetMeta(id);
    const blob = await getAssetBlob(id);
    if(!meta || !blob){ out.push({ id, ok:false, reason:"missing" }); continue; }
    out.push({ id, ...(await upload(meta, blob)) });
  }
  return out;
}
export async function syncUpAll(){
  const metas = await listAssets();
  return syncUpSelected(metas.map(m=>m.id));
}

async function upload(meta, blob){
  if (!window.ERRL_CLOUD_ENDPOINT) return { ok:true, local:true };
  try{
    const fd = new FormData();
    fd.append("file", blob, meta.name);
    fd.append("id", meta.id);
    fd.append("type", meta.type||"application/octet-stream");
    fd.append("size", String(meta.size||0));
    const res = await fetch(window.ERRL_CLOUD_ENDPOINT, { method:"POST", body: fd });
    if(!res.ok) return { ok:false, status:res.status };
    const payload = await res.json().catch(()=>({}));
    return { ok:true, payload };
  }catch(e){ return { ok:false, error:String(e) }; }
}
