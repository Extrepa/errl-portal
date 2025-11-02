import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Download, Play, Pause, RotateCcw, ExternalLink, PlusCircle, X, CloudUpload, Cloud } from "lucide-react";
const LazyMonaco = React.lazy(() => import("@monaco-editor/react").then(m => ({ default: m.Editor })));

import { bus } from "@/utils/bus";
import { saveAsset, listAssets, getAssetBlob, removeAsset } from "@/utils/assetStore";
import { syncUpAll } from "@/utils/cloudAdapter";
import { bundleProject } from "@/utils/zipBundler";

export default function ErrlLiveStudioPro(){
  // Projects
  const [projects, setProjects] = useState(()=>{ try{ return JSON.parse(localStorage.getItem("errl_projects")||"[]"); }catch{ return []; }});
  const [activeId, setActiveId] = useState(()=> localStorage.getItem("errl_active") || "");
  useEffect(()=>{ localStorage.setItem("errl_projects", JSON.stringify(projects)); }, [projects]);
  useEffect(()=>{ localStorage.setItem("errl_active", activeId); }, [activeId]);
  function createProject(){
    const id = crypto.randomUUID();
    const p = { id, name: "Untitled", html: DEFAULT_HTML, css: DEFAULT_CSS, js: DEFAULT_JS, assetIds: [] };
    setProjects(prev => [...prev, p]); setActiveId(id);
  }
  function closeProject(id){ setProjects(prev => prev.filter(p=>p.id!==id)); if (activeId===id){ const next = projects.find(p=>p.id!==id); setActiveId(next?.id||""); } }
  function renameProject(id, name){ setProjects(prev => prev.map(p=> p.id===id ? {...p, name} : p)); }
  const active = projects.find(p=>p.id===activeId) || null;

  useEffect(()=>{ if (projects.length===0){ createProject(); } else if (!activeId){ setActiveId(projects[0].id); } }, []);

  // Editor + preview
  const [theme, setTheme] = useState("vs-dark");
  const [live, setLive] = useState(true);
  const [running, setRunning] = useState(true);
  const [logs, setLogs] = useState([]);
  const consoleRef = useRef(null);
  const timeoutRef = useRef(null);
  const [tick, setTick] = useState(0);
  function debouncedUpdate(){ if (!live) return; clearTimeout(timeoutRef.current); timeoutRef.current = setTimeout(()=> setTick(t=>t+1), 150); }

  useEffect(() => {
    function onMessage(e) {
      const d = e.data; if (!d || !d.__ERRL_CONSOLE__) return;
      setLogs((prev) => [...prev, { level: d.level, text: d.args, t: Date.now() }]);
      if (consoleRef.current) requestAnimationFrame(() => (consoleRef.current.scrollTop = consoleRef.current.scrollHeight));
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const srcDoc = useMemo(()=>{
    if (!active) return BLANK_DOC;
    return buildSrcDoc(active.html, active.css, active.js);
  }, [active?.html, active?.css, active?.js, tick, activeId]);

  // Assets
  const [assets, setAssets] = useState([]);
  async function refreshAssets(){ setAssets(await listAssets()); }
  useEffect(()=>{ refreshAssets(); }, []);
  useEffect(()=> bus.on((msg)=>{ if (msg?.type === "asset-added" || msg?.type === "asset-removed"){ refreshAssets(); }}), []);

  // DnD to add assets + attach to current project
  const [dragOver, setDragOver] = useState(false);
  useEffect(()=>{
    function over(e){ e.preventDefault(); setDragOver(true); }
    function leave(e){ e.preventDefault(); setDragOver(false); }
    async function drop(e){
      e.preventDefault(); setDragOver(false);
      const files = [...(e.dataTransfer?.files || [])];
      if (!files.length || !active) return;
      for (const f of files){
        const id = crypto.randomUUID();
        await saveAsset({ id, name: f.name, type: f.type||"application/octet-stream", size: f.size||0, blob: f });
        bus.post({ type:"asset-added", id });
        setProjects(prev => prev.map(p=> p.id===active.id ? {...p, assetIds: Array.from(new Set([...(p.assetIds||[]), id]))} : p));
      }
      await refreshAssets();
    }
    window.addEventListener("dragover", over);
    window.addEventListener("dragleave", leave);
    window.addEventListener("drop", drop);
    return ()=>{ window.removeEventListener("dragover", over); window.removeEventListener("dragleave", leave); window.removeEventListener("drop", drop); };
  }, [activeId, active?.id]);

  function editHtml(v){ if(!active) return; setProjects(prev => prev.map(p=> p.id===active.id ? {...p, html: v??""} : p)); debouncedUpdate(); }
  function editCss(v){ if(!active) return; setProjects(prev => prev.map(p=> p.id===active.id ? {...p, css: v??""} : p)); debouncedUpdate(); }
  function editJs(v){ if(!active) return; setProjects(prev => prev.map(p=> p.id===active.id ? {...p, js: v??""} : p)); debouncedUpdate(); }

  async function exportZip(){
    if (!active) return;
    const zipBlob = await bundleProject({ html: active.html, css: active.css, js: active.js, assetIds: active.assetIds||[] });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(zipBlob);
    a.download = (active.name||"errl_project") + ".zip";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="h-[calc(100vh-0px)] w-full grid grid-rows-[56px_40px_1fr] bg-[#0b0b12] text-zinc-100">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-3 border-b border-white/10 bg-gradient-to-r from-[#0d0d19] to-[#0b0b16]">
        <span className="font-bold tracking-wide">Errl Studio Pro</span>
        <Badge variant="secondary" className="bg-purple-600/20 text-purple-200 border border-purple-400/30">v3.4</Badge>
        <span className="text-xs text-zinc-400 hidden md:inline">Projects • ZIP export • Blob assets • Lazy editor</span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportZip}><Download className="h-4 w-4 mr-1"/>Export ZIP</Button>
          <Button variant="secondary" size="sm" onClick={() => window.open(makeStandalone(active?.html||DEFAULT_HTML, active?.css||DEFAULT_CSS, active?.js||DEFAULT_JS), "_blank") }><ExternalLink className="h-4 w-4 mr-1"/>Open Preview</Button>
          <Button variant="outline" size="sm" onClick={async()=>{ const r = await syncUpAll(); alert("Cloud sync: "+ r.filter(x=>x.ok).length +"/"+ r.length); }}><CloudUpload className="h-4 w-4 mr-1"/>Sync</Button>
        </div>
      </div>

      {/* Project chips */}
      <div className="flex items-center gap-2 px-3 border-b border-white/10 overflow-x-auto no-scrollbar">
        <Button size="sm" variant="outline" onClick={createProject}><PlusCircle className="h-4 w-4 mr-1"/>New</Button>
        <div className="flex gap-2 py-1">
          {projects.map(p=>(
            <div key={p.id} className={`flex items-center gap-2 px-2 py-1 rounded-full border ${p.id===activeId? 'bg-white/10 border-white/30' : 'bg-black/20 border-white/10'}`}>
              <input className="bg-transparent text-xs w-28 outline-none" value={p.name||""} onChange={e=>renameProject(p.id, e.target.value)} />
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={()=>closeProject(p.id)}><X className="h-3.5 w-3.5"/></Button>
              <Button size="sm" variant={p.id===activeId? "secondary":"outline"} onClick={()=>setActiveId(p.id)}>Open</Button>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 h-full ${dragOver ? "outline outline-2 outline-cyan-400/60" : ""}`}>
        {/* Left: editors */}
        <div className="flex flex-col border-r border-white/10 bg-[#121222]">
          <div className="flex items-center gap-2 p-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setRunning((r) => !r)}>{running ? <Pause className="h-4 w-4 mr-1"/> : <Play className="h-4 w-4 mr-1"/>}{running ? "Live" : "Paused"}</Button>
              <Button variant="outline" size="sm" onClick={() => { if (!active) return; setProjects(prev => prev.map(p=> p.id===active.id ? {...p, html:DEFAULT_HTML, css:DEFAULT_CSS, js:DEFAULT_JS} : p)); }}><RotateCcw className="h-4 w-4 mr-1"/>Reset</Button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <select className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-sm" value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="vs-dark">Dark</option><option value="light">Light</option><option value="hc-black">High Contrast</option>
              </select>
              <label className="text-xs text-zinc-400 hidden sm:flex items-center gap-2"><input type="checkbox" className="accent-purple-500" checked={live} onChange={(e) => setLive(e.target.checked)} /> Live</label>
            </div>
          </div>

          <Tabs defaultValue="html" className="flex-1 flex flex-col min-h-0">
            <div className="px-2 pt-2">
              <TabsList className="grid w-full grid-cols-3 bg-black/30 border border-white/10">
                <TabsTrigger value="html">HTML</TabsTrigger><TabsTrigger value="css">CSS</TabsTrigger><TabsTrigger value="js">JS</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="html" className="flex-1 min-h-0">
              <Suspense fallback={<div className='p-4 text-sm text-zinc-400'>Loading editor…</div>}>
                <LazyMonaco language="html" theme={theme} value={active?.html||""} onChange={(v)=> editHtml(v)} options={{ fontSize:14, wordWrap:"on", minimap:{enabled:false} }} height="calc(100% - 0px)" />
              </Suspense>
            </TabsContent>
            <TabsContent value="css" className="flex-1 min-h-0">
              <Suspense fallback={<div className='p-4 text-sm text-zinc-400'>Loading editor…</div>}>
                <LazyMonaco language="css" theme={theme} value={active?.css||""} onChange={(v)=> editCss(v)} options={{ fontSize:14, wordWrap:"on", minimap:{enabled:false} }} height="calc(100% - 0px)" />
              </Suspense>
            </TabsContent>
            <TabsContent value="js" className="flex-1 min-h-0">
              <Suspense fallback={<div className='p-4 text-sm text-zinc-400'>Loading editor…</div>}>
                <LazyMonaco language="javascript" theme={theme} value={active?.js||""} onChange={(v)=> editJs(v)} options={{ fontSize:14, wordWrap:"on", minimap:{enabled:false} }} height="calc(100% - 0px)" />
              </Suspense>
            </TabsContent>
          </Tabs>

          <div className="h-40 border-t border-white/10 bg-[#0c0c16]">
            <div className="text-xs text-zinc-400 px-2 py-1 border-b border-white/10">Console</div>
            <ScrollArea ref={consoleRef} className="h-[calc(100%-24px)] p-2">
              <div className="space-y-1">{logs.map((l) => (<div key={l.t + Math.random()} className={{ log:"text-fuchsia-300", info:"text-cyan-300", warn:"text-yellow-300", error:"text-red-400" }[l.level] || "text-fuchsia-200"}>[{l.level.toUpperCase()}] {l.text}</div>))}</div>
            </ScrollArea>
          </div>
        </div>

        {/* Right: preview + assets */}
        <div className="grid grid-rows-[1fr_260px] h-full">
          <div className="relative">
            <iframe className="w-full h-full bg-white" title="Preview" sandbox="allow-scripts allow-same-origin" srcDoc={running && live ? srcDoc : buildSrcDoc("<h1 style='font-family:system-ui'>Paused</h1>", "body{background:#111;color:#eee;display:grid;place-items:center;height:100vh}", "")} />
            <div className="absolute bottom-2 right-2 pointer-events-none text-xs text-zinc-400">Drop files anywhere</div>
          </div>

          <div className="border-t border-white/10 bg-[#0e0e17] p-3 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
            <Card className="bg-black/30 border-white/10">
              <CardHeader className="py-2"><CardTitle className="text-sm">Assets</CardTitle></CardHeader>
              <CardContent className="pt-2">
                {assets.length === 0 ? (
                  <p className="text-sm text-zinc-400">Drag files here or use the uploader. Blobs go to IndexedDB and can be linked to this project.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {assets.map((a) => (<AssetRow key={a.id} meta={a} active={!!(active?.assetIds||[]).includes(a.id)} onToggle={(checked)=>{
                      if (!active) return;
                      setProjects(prev => prev.map(p=>{
                        if (p.id!==active.id) return p;
                        const set = new Set(p.assetIds||[]);
                        if (checked) set.add(a.id); else set.delete(a.id);
                        return {...p, assetIds: Array.from(set)};
                      }));
                    }} onOpen={async()=>{
                      const blob = await getAssetBlob(a.id);
                      if(!blob) return; const url = URL.createObjectURL(blob);
                      window.open(url, "_blank"); setTimeout(()=> URL.revokeObjectURL(url), 15000);
                    }} onRemove={async()=>{
                      await removeAsset(a.id); bus.post({ type:"asset-removed", id:a.id }); await refreshAssets();
                      setProjects(prev => prev.map(p=> ({...p, assetIds:(p.assetIds||[]).filter(x=>x!==a.id)})));
                    }}/>))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-white/10">
              <CardHeader className="py-2"><CardTitle className="text-sm">Add / Sync</CardTitle></CardHeader>
              <CardContent className="pt-2 space-y-2">
                <label className="text-sm">Upload assets</label>
                <Input type="file" multiple onChange={(e) => e.target.files && (async()=>{
                  const files = [...e.target.files];
                  if (!files.length || !active) return;
                  for (const f of files){
                    const id = crypto.randomUUID();
                    await saveAsset({ id, name: f.name, type: f.type||"application/octet-stream", size: f.size||0, blob: f });
                    bus.post({ type:"asset-added", id });
                    setProjects(prev => prev.map(p=> p.id===active.id ? {...p, assetIds: Array.from(new Set([...(p.assetIds||[]), id]))} : p));
                  }
                  await refreshAssets();
                })()} />
                <div className="flex gap-2">
                  <Button className="w-full" variant="outline" onClick={async()=>{ const res = await syncUpAll(); alert("Synced " + res.filter(r=>r.ok).length + " items"); }}><Cloud className="h-4 w-4 mr-1"/>Sync All</Button>
                </div>
                <div className="text-xs text-zinc-400">ZIP export includes only assets toggled ON for the current project.</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssetRow({ meta, active, onToggle, onOpen, onRemove }){
  const [thumb, setThumb] = React.useState(null);
  useEffect(()=>{
    let alive = true;
    (async()=>{
      try{
        const blob = await getAssetBlob(meta.id);
        if (!blob) return;
        if (alive){ const url = URL.createObjectURL(blob); setThumb(url); }
      }catch{}
    })();
    return ()=>{ alive=false; if (thumb) URL.revokeObjectURL(thumb); };
  }, [meta.id]);
  const isImage = /\.png$|\.jpe?g$|\.gif$|\.webp$|\.svg$/i.test(meta.name||"");
  return (
    <div className={`group border border-white/10 rounded-lg overflow-hidden bg-white/5 ${active? 'ring-2 ring-purple-400/50' : ''}`}>
      <div className="h-24 bg-black/40 flex items-center justify-center">
        {isImage && thumb ? <img src={thumb} className="max-h-24 object-contain" /> : <div className="text-xs text-zinc-300 p-2">{meta.name}</div>}
      </div>
      <div className="p-2 flex items-center gap-2 text-xs">
        <label className="inline-flex items-center gap-1"><input type="checkbox" checked={active} onChange={e=>onToggle(e.target.checked)} /> include</label>
        <span className="truncate" title={meta.name}>{meta.name}</span>
        <Button variant="outline" size="icon" className="ml-auto h-7 w-7" onClick={onOpen} title="Open">⤴</Button>
        <Button variant="destructive" size="icon" className="h-7 w-7" onClick={onRemove} title="Delete">✕</Button>
      </div>
    </div>
  );
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
function makeStandalone(html, css, js) {
  return URL.createObjectURL(new Blob([buildSrcDoc(html, css, js)], { type: "text/html" }));
}
const BLANK_DOC = buildSrcDoc("<div/>", "", "");

// defaults
const DEFAULT_HTML = `
<div class="wrap">
  <h1 class="title">Errl Studio Pro <span>v3.4</span> ✨</h1>
  <p>Multiple projects, ZIP export with assets, blob-backed library. Drag files in and toggle which assets belong to this project.</p>
  <p>After export, your files are in <code>./assets/</code> and listed in <code>assets.manifest.json</code>.</p>
</div>`;
const DEFAULT_CSS = `
html,body{height:100%;margin:0;background:#0b0b12;color:#f4f5ff;font:16px/1.5 system-ui,Segoe UI,Inter,Roboto,Arial}
.wrap{max-width:920px;margin:8vh auto;padding:24px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.35)}
.title{font-size:clamp(28px,3.6vw,42px);margin:0 0 8px}
.title span{color:#29f0ff}
a{color:#8a5cff}
`;
const DEFAULT_JS = `console.log('Project booted. Include assets you need, then Export ZIP.');`;
