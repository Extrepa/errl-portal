// ZIP bundler using JSZip CDN at runtime
import { getAssetBlob, getAssetMeta } from "./assetStore.js";

async function ensureJSZip(){
  if (window.JSZip) return window.JSZip;
  await new Promise((resolve, reject)=>{
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";
    s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
  });
  return window.JSZip;
}

export async function bundleProject(project){
  const JSZip = await ensureJSZip();
  const zip = new JSZip();

  const doc = buildSrcDoc(project.html||"", project.css||"", project.js||"");
  zip.file("index.html", doc);

  const manifest = [];
  const folder = zip.folder("assets");
  for (const id of (project.assetIds||[])){
    const meta = await getAssetMeta(id);
    const blob = await getAssetBlob(id);
    if (!meta || !blob) continue;
    const safeName = meta.name.replace(/[^a-z0-9._-]/gi, "_");
    folder.file(safeName, blob);
    manifest.push({ id, name: safeName, type: meta.type||"application/octet-stream", size: meta.size||0 });
  }
  zip.file("assets.manifest.json", JSON.stringify(manifest, null, 2));
  return await zip.generateAsync({ type:"blob" });
}

function buildSrcDoc(html, css, js){
  const bridge = `
<script>(function(){
  const parentWindow = window.parent || window.opener || null;
  ["log","info","warn","error"].forEach(fn=>{
    try{
      const orig = console[fn].bind(console);
      console[fn] = function(...args){
        try{ parentWindow && parentWindow.postMessage({__ERRL_CONSOLE__:true, level:fn, args: args.map(a=>String(a)).join(" ")}, "*"); }catch(e){}
        orig(...args);
      };
    }catch(_){}
  });
  window.addEventListener("error", function(e){
    try{ parentWindow && parentWindow.postMessage({__ERRL_CONSOLE__:true, level:"error", args:e.message+" @ "+(e.filename||"")+":"+(e.lineno||"")}, "*"); }catch(_){}
  });
})();</script>`;
  const safeHtml = (html||"").replace(/<\/body\s*>/i, `${bridge}\n</body>`);
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
${css||""}
</style>
</head>
<body>
${safeHtml||""}
<script>
${js||""}
</script>
</body>
</html>`;
}
