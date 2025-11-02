import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Trash2, Sparkles, Play, Pause, RotateCcw, Copy, ExternalLink } from 'lucide-react';
import presetsData from '@/apps/studioPresets.json';
import { SVGTab } from '@/apps/svg/SVGTab';

export default function ErrlLiveStudio() {
  const [topTab, setTopTab] = useState<'code' | 'svg' | 'photos'>(() => {
    const h = (typeof location !== 'undefined' && location.hash.replace('#','')) || '';
    return (h === 'svg' || h === 'photos' || h === 'code') ? (h as any) : 'code';
  });
  useEffect(() => {
    const onHash = () => {
      const h = location.hash.replace('#','');
      if (h === 'code' || h === 'svg' || h === 'photos') setTopTab(h as any);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    if (location.hash.replace('#','') !== topTab) location.hash = topTab;
  }, [topTab]);

  const [html, setHtml] = useState(DEFAULT_HTML);
  const [css, setCss] = useState(DEFAULT_CSS);
  const [js, setJs] = useState(DEFAULT_JS);

  const [theme, setTheme] = useState<'vs-dark' | 'light' | 'hc-black'>('vs-dark');
  const [live, setLive] = useState(true);
  const [autosave, setAutosave] = useState(true);

  const [assets, setAssets] = useState<Array<{ id: string; name: string; dataUrl: string; size: number }>>([]);

  const [logs, setLogs] = useState<Array<{ level: string; text: string; t: number }>>([]);
  const consoleRef = useRef<HTMLDivElement | null>(null);

  const [tick, setTick] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!autosave) return;
    localStorage.setItem('errl_ls_html', html);
    localStorage.setItem('errl_ls_css', css);
    localStorage.setItem('errl_ls_js', js);
    localStorage.setItem('errl_ls_theme', theme);
    localStorage.setItem('errl_ls_live', live ? '1' : '0');
  }, [html, css, js, theme, live, autosave]);

  useEffect(() => {
    const _html = localStorage.getItem('errl_ls_html');
    const _css = localStorage.getItem('errl_ls_css');
    const _js = localStorage.getItem('errl_ls_js');
    const _theme = localStorage.getItem('errl_ls_theme') as typeof theme | null;
    const _live = localStorage.getItem('errl_ls_live');
    if (_html) setHtml(_html);
    if (_css) setCss(_css);
    if (_js) setJs(_js);
    if (_theme) setTheme(_theme);
    if (_live) setLive(_live === '1');
  }, []);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const d = (e as any).data;
      if (!d || !d.__ERRL_CONSOLE__) return;
      setLogs((prev) => [...prev, { level: d.level, text: d.args, t: Date.now() }]);
      if (consoleRef.current) {
        const el = consoleRef.current as HTMLDivElement;
        requestAnimationFrame(() => (el.scrollTop = el.scrollHeight));
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  function debouncedUpdate() {
    if (!live) return;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setTick((t) => t + 1), 160);
  }

  const srcDoc = useMemo(() => buildSrcDoc(html, css, js, assets), [html, css, js, assets, tick]);

  const formatCSS = async () => {
    try {
      await ensurePrettier();
      const g: any = window as any;
      const out = g.prettier.format(String(css), { parser: 'css', plugins: g.prettierPlugins });
      setCss(out);
    } catch {}
  };

  const formatJS = async () => {
    try {
      await ensurePrettier();
      const g: any = window as any;
      const out = g.prettier.format(String(js), { parser: 'babel', plugins: g.prettierPlugins });
      setJs(out);
    } catch {}
  };

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMod = (e.metaKey || e.ctrlKey);
      if (isMod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        exportSingleHTML(html, css, js, assets);
      }
      if (isMod && e.key === 'Enter') {
        e.preventDefault();
        try {
          const formatted = formatHTML(html);
          setHtml(formatted);
        } catch {}
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [html, css, js, assets]);

  async function onAddAssets(files: FileList) {
    const list = await Promise.all(
      [...Array.from(files)].map((f) =>
        new Promise<{ id: string; name: string; size: number; dataUrl: string }>((res) => {
          const reader = new FileReader();
          reader.onload = () => res({ id: crypto.randomUUID(), name: f.name, size: f.size, dataUrl: String(reader.result) });
          reader.readAsDataURL(f);
        })
      )
    );
    setAssets((a) => [...a, ...list]);
  }

  function removeAsset(id: string) {
    setAssets((a) => a.filter((x) => x.id !== id));
  }

  const [running, setRunning] = useState(true);

  return (
    <div className="h-[calc(100vh-0px)] w-full grid grid-rows-[56px_1fr] bg-[#0b0b12] text-zinc-100">
      <div className="flex items-center gap-3 px-3 border-b border-white/10 bg-gradient-to-r from-[#0d0d19] to-[#0b0b16]">
        <span className="font-bold tracking-wide">Errl Live Studio</span>
        <Badge variant="secondary" className="bg-purple-600/20 text-purple-200 border border-purple-400/30">{autosave ? 'Autosave ON' : 'Autosave OFF'}</Badge>
        <span className="text-xs text-zinc-400 hidden md:inline">Split editor • Live sandbox • Assets drawer • <kbd className="px-2 py-0.5 rounded border border-white/10 bg-black/40">Ctrl/Cmd+S</kbd> Export</span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setHtml(formatHTML(html)); }}><Sparkles className="h-4 w-4 mr-1"/>Format HTML</Button>
          <Button variant="outline" size="sm" onClick={formatCSS}><Sparkles className="h-4 w-4 mr-1"/>Format CSS</Button>
          <Button variant="outline" size="sm" onClick={formatJS}><Sparkles className="h-4 w-4 mr-1"/>Format JS</Button>
          <Button variant="outline" size="sm" onClick={() => exportSingleHTML(html, css, js, assets)}><Download className="h-4 w-4 mr-1"/>Export</Button>
          <Button variant="outline" size="sm" onClick={() => exportZip(html, css, js, assets)}><Download className="h-4 w-4 mr-1"/>Zip</Button>
          <Button variant="secondary" size="sm" onClick={() => window.open(makeStandalone(html, css, js, assets), '_blank') }><ExternalLink className="h-4 w-4 mr-1"/>Open Preview</Button>
        </div>
      </div>

      <Tabs value={topTab} onValueChange={(v) => setTopTab(v as any)} className="h-full flex flex-col min-h-0">
        <div className="px-2 pt-2">
          <TabsList className="inline-flex bg-black/30 border border-white/10">
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="svg">SVG</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="code" className="flex-1 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            <div className="flex flex-col border-r border-white/10 bg-[#121222]">
              <div className="flex items-center gap-2 p-2 border-b border-white/10 bg-white/5/10">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setRunning((r) => !r)}>
                    {running ? <Pause className="h-4 w-4 mr-1"/> : <Play className="h-4 w-4 mr-1"/>}
                    {running ? 'Live' : 'Paused'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setHtml(DEFAULT_HTML); setCss(DEFAULT_CSS); setJs(DEFAULT_JS); }}>
                    <RotateCcw className="h-4 w-4 mr-1"/>Reset
                  </Button>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <select className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-sm" value={theme} onChange={(e) => setTheme(e.target.value as any)}>
                    <option value="vs-dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="hc-black">High Contrast</option>
                  </select>
                  <label className="text-xs text-zinc-400 flex items-center gap-2">
                    <input type="checkbox" className="accent-purple-500" checked={autosave} onChange={(e) => setAutosave(e.target.checked)} /> Autosave
                  </label>
                  <label className="text-xs text-zinc-400 hidden sm:flex items-center gap-2">
                    <input type="checkbox" className="accent-purple-500" checked={live} onChange={(e) => setLive(e.target.checked)} /> Live
                  </label>
                </div>
              </div>

              <Tabs defaultValue="html" className="flex-1 flex flex-col min-h-0">
                <div className="px-2 pt-2">
                  <TabsList className="grid w-full grid-cols-3 bg-black/30 border border-white/10">
                    <TabsTrigger value="html">HTML</TabsTrigger>
                    <TabsTrigger value="css">CSS</TabsTrigger>
                    <TabsTrigger value="js">JS</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="html" className="flex-1 min-h-0">
                  <Editor language="html" theme={theme} value={html} onChange={(v)=>{ setHtml(v ?? ''); debouncedUpdate(); }} options={{ fontSize:14, wordWrap:'on', minimap:{enabled:false} }} height="calc(100% - 0px)" />
                </TabsContent>
                <TabsContent value="css" className="flex-1 min-h-0">
                  <Editor language="css" theme={theme} value={css} onChange={(v)=>{ setCss(v ?? ''); debouncedUpdate(); }} options={{ fontSize:14, wordWrap:'on', minimap:{enabled:false} }} height="calc(100% - 0px)" />
                </TabsContent>
                <TabsContent value="js" className="flex-1 min-h-0">
                  <Editor language="javascript" theme={theme} value={js} onChange={(v)=>{ setJs(v ?? ''); debouncedUpdate(); }} options={{ fontSize:14, wordWrap:'on', minimap:{enabled:false} }} height="calc(100% - 0px)" />
                </TabsContent>
              </Tabs>

              <div className="h-40 border-t border-white/10 bg-[#0c0c16]">
                <div className="text-xs text-zinc-400 px-2 py-1 border-b border-white/10">Console</div>
                <ScrollArea ref={consoleRef} className="h-[calc(100%-24px)] p-2">
                  <div className="space-y-1">
                    {logs.map((l) => (
                      <div key={l.t + Math.random()} className={{
                        log: 'text-fuchsia-300',
                        info: 'text-cyan-300',
                        warn: 'text-yellow-300',
                        error: 'text-red-400',
                      }[l.level] || 'text-fuchsia-200'}>
                        [{l.level.toUpperCase()}] {l.text}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div className="grid grid-rows-[1fr_240px] h-full">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-cyan-500/10 pointer-events-none" />
                <iframe
                  className="w-full h-full bg-white"
                  title="Preview"
                  sandbox="allow-scripts allow-same-origin"
                  srcDoc={running && live ? srcDoc : buildSrcDoc("<h1 style='font-family:system-ui'>Paused</h1>", "body{background:#111;color:#eee;display:grid;place-items:center;height:100vh}", "", assets)}
                />
              </div>

              <div className="border-t border-white/10 bg-[#0e0e17] p-3 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3">
                <Card className="bg-black/30 border-white/10">
                  <CardHeader className="py-2"><CardTitle className="text-sm">Assets</CardTitle></CardHeader>
                  <CardContent className="pt-2">
                    {assets.length === 0 ? (
                      <p className="text-sm text-zinc-400">Drop images/SVGs/audio here or use the uploader. We'll turn them into Data URLs you can reference directly.</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {assets.map((a) => (
                          <div key={a.id} className="group border border-white/10 rounded-lg overflow-hidden bg-white/5">
                            <div className="h-24 bg-black/40 flex items-center justify-center">
                              {a.dataUrl.startsWith('data:image') ? (
                                <img src={a.dataUrl} className="max-h-24 object-contain" />
                              ) : (
                                <div className="text-xs text-zinc-300 p-2">{a.name}</div>
                              )}
                            </div>
                            <div className="p-2 flex items-center gap-2 text-xs">
                              <span className="truncate" title={a.name}>{a.name}</span>
                              <Button variant="outline" size="icon" className="ml-auto h-7 w-7" onClick={() => { navigator.clipboard.writeText(a.dataUrl); }} title="Copy data URL"><Copy className="h-3.5 w-3.5"/></Button>
                              <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => removeAsset(a.id)} title="Remove"><Trash2 className="h-3.5 w-3.5"/></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-black/30 border-white/10">
                  <CardHeader className="py-2"><CardTitle className="text-sm">Add / Import</CardTitle></CardHeader>
                  <CardContent className="pt-2 space-y-2">
                    <label className="text-sm">Upload assets</label>
                    <Input type="file" multiple onChange={(e) => e.target.files && onAddAssets(e.target.files)} />
                    <div className="text-xs text-zinc-400">Hint: paste asset Data URLs directly into HTML/CSS/JS or click copy on an item.</div>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => exportProjectJSON(html, css, js, assets)}>Save Project</Button>
                      <Input type="file" accept=".errlproj,.json" onChange={(e) => e.target.files && importProjectFile(e.target.files[0], setHtml, setCss, setJs, setAssets)} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/30 border-white/10">
                  <CardHeader className="py-2"><CardTitle className="text-sm">Presets</CardTitle></CardHeader>
                  <CardContent className="pt-2 space-y-2">
                    <div className="grid grid-cols-1 gap-2">
                      {(presetsData as any).presets.map((p: any) => (
                        <Button key={p.id} variant="outline" size="sm" onClick={() => { setHtml(p.html); setCss(p.css); setJs(p.js); }}>
                          <Sparkles className="h-3.5 w-3.5 mr-2" /> {p.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="svg" className="flex-1 min-h-0">
          <SVGTab />
        </TabsContent>

        <TabsContent value="photos" className="flex-1 min-h-0">
          <PhotosTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function buildSrcDoc(html: string, css: string, js: string, assets: Array<{name: string}>) {
  const bridge = `\n<script>(function(){\n  const parentWindow = window.parent;\n  ["log","info","warn","error"].forEach(fn=>{\n    const orig = console[fn].bind(console);\n    console[fn] = function(...args){\n      try{ parentWindow.postMessage({__ERRL_CONSOLE__:true, level:fn, args: args.map(a=>String(a)).join(" ")}, "*"); }catch(e){}\n      orig(...args);\n    };\n  });\n  window.addEventListener("error", function(e){\n    try{ parent.postMessage({__ERRL_CONSOLE__:true, level:"error", args:e.message+" @ "+(e.filename||"")+":"+(e.lineno||"")}, "*"); }catch(_){}\n  });\n})();<\/script>`;

  const assetsComment = assets.length ? `<!-- Embedded assets: ${assets.map(a=>a.name).join(', ')} -->` : '';
  const safeHtml = html.replace(/<\/body\s*>/i, `${bridge}\n</body>`);
  return `<!doctype html>\n<html>\n<head>\n<meta charset=\"utf-8\"/>\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/>\n<style>\n${css}\n</style>\n${assetsComment}\n</head>\n<body>\n${safeHtml}\n<script>\n${js}\n<\/script>\n</body>\n</html>`;
}

function exportSingleHTML(html: string, css: string, js: string, assets: Array<{name: string}>) {
  const blob = new Blob([buildSrcDoc(html, css, js, assets)], { type: 'text/html;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'errl_project.html';
  a.click();
  URL.revokeObjectURL(a.href);
}

function makeStandalone(html: string, css: string, js: string, assets: Array<{name: string}>) {
  return URL.createObjectURL(new Blob([buildSrcDoc(html, css, js, assets)], { type: 'text/html' }));
}

async function ensureJSZip(): Promise<void> {
  const g: any = window as any;
  if (g.JSZip) return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function dataURLToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(',');
  const mimeMatch = /data:(.*?);base64/.exec(meta || '');
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const bin = atob(b64 || '');
  const len = bin.length;
  const arr = new Uint8Array(len);
  for (let i=0;i<len;i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function exportZip(html: string, css: string, js: string, assets: Array<{ id: string; name: string; dataUrl: string }>) {
  await ensureJSZip();
  const g: any = window as any;
  const zip = new g.JSZip();
  const indexHtml = buildSrcDoc(html, css, js, assets as any);
  zip.file('index.html', indexHtml);
  if (assets && assets.length) {
    const folder = zip.folder('assets');
    const usedNames = new Set<string>();
    assets.forEach((a, idx) => {
      let name = a.name || `asset_${idx}`;
      if (usedNames.has(name)) name = `${idx}_${name}`;
      usedNames.add(name);
      try {
        const blob = dataURLToBlob(a.dataUrl);
        folder.file(name, blob);
      } catch {}
    });
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'errl_project.zip';
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportProjectJSON(html: string, css: string, js: string, assets: Array<{ id: string; name: string; size: number; dataUrl: string }>) {
  const data = { version: 1, html, css, js, assets };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'project.errlproj';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProjectFile(file: File, setHtml: (s: string)=>void, setCss: (s: string)=>void, setJs: (s: string)=>void, setAssets: (a: any)=>void) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      if (typeof data.html === 'string') setHtml(data.html);
      if (typeof data.css === 'string') setCss(data.css);
      if (typeof data.js === 'string') setJs(data.js);
      if (Array.isArray(data.assets)) setAssets(data.assets);
    } catch (e) { console.error('Invalid project file'); }
  };
  reader.readAsText(file);
}

function formatHTML(source: string) {
  try {
    const doc = new DOMParser().parseFromString(source, 'text/html');
    const serializer = new XMLSerializer();
    let out = serializer.serializeToString(doc);
    out = out.replace(/></g, '><\n<');
    return out;
  } catch {
    return source;
  }
}

async function ensurePrettier(): Promise<void> {
  const g: any = window as any;
  if (g.prettier && Array.isArray(g.prettierPlugins) && g.prettierPlugins.length >= 2) return;
  const add = (src: string) => new Promise<void>((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = () => res(); s.onerror = rej; document.head.appendChild(s); });
  g.prettierPlugins = g.prettierPlugins || [];
  await add('https://cdn.jsdelivr.net/npm/prettier@3.3.3/standalone.js');
  await add('https://cdn.jsdelivr.net/npm/prettier@3.3.3/plugins/estree.js');
  await add('https://cdn.jsdelivr.net/npm/prettier@3.3.3/plugins/babel.js');
  await add('https://cdn.jsdelivr.net/npm/prettier@3.3.3/plugins/postcss.js');
}


const DEFAULT_HTML = `\n<div class="wrap">\n  <h1 class="title">Errl Live Studio <span>online</span> ✨</h1>\n  <p>Edit HTML/CSS/JS in the tabs and watch the right pane update instantly. Try <code>console.log</code> to see the mirrored output below the editors.</p>\n  <button class="btn" onclick="console.info('Hello from preview!')">Ping Console</button>\n</div>`;

const DEFAULT_CSS = `\n:root { --bg:#0b0b12; --ink:#f4f5ff; --accent:#8a5cff; --glow:#29f0ff; }\nhtml,body{height:100%;margin:0;background:radial-gradient(1200px 400px at 20% 10%, rgba(42,255,255,.08), transparent 40%),radial-gradient(900px 300px at 80% 0%, rgba(138,92,255,.1), transparent 40%), #0b0b12; color:var(--ink); font:16px/1.6 system-ui,Segoe UI,Inter,Roboto,Arial}\n.wrap{max-width:900px;margin:8vh auto;padding:24px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.35), inset 0 0 40px rgba(41,240,255,.06)}\n.title{font-size:clamp(28px,3.6vw,42px);margin:0 0 8px}\n.title span{color:var(--glow)}\n.btn{display:inline-block;padding:10px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.12);text-decoration:none;color:var(--ink);margin-top:12px;background:transparent}\n.btn:hover{border-color:var(--glow);box-shadow:0 0 12px rgba(41,240,255,.2)}\n`;

const DEFAULT_JS = `\nconsole.log('Try editing JS — updates are live!');\n`;

function PhotosTab() {
  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<any>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [transparentBG, setTransparentBG] = useState(true);

  useEffect(() => {
    let disposed = false;
    async function ensureFabric() {
      const w = window as any;
      if (!w.fabric) {
        await new Promise<void>((resolve) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/fabric@5.3.0/dist/fabric.min.js';
          s.onload = () => resolve();
          document.head.appendChild(s);
        });
      }
      if (disposed) return;
      const fabric = (window as any).fabric;
      const c = new fabric.Canvas(canvasEl.current, { preserveObjectStacking: true, backgroundColor: 'transparent' });
      fabricRef.current = c;
      // Resize to fit container
      const parent = canvasEl.current?.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        c.setWidth(rect.width);
        c.setHeight(Math.max(420, rect.height - 0));
        c.renderAll();
      }
      window.addEventListener('resize', () => {
        const parent = canvasEl.current?.parentElement; if (!parent) return;
        const rect = parent.getBoundingClientRect();
        c.setWidth(rect.width); c.setHeight(Math.max(420, rect.height - 0)); c.renderAll();
      });
    }
    ensureFabric();
    return () => {
      disposed = true;
      if (fabricRef.current) {
        try { fabricRef.current.dispose(); } catch {}
        fabricRef.current = null;
      }
    };
  }, []);

  function addText() {
    const fabric = (window as any).fabric; if (!fabric || !fabricRef.current) return;
    const t = new fabric.Textbox('New Text', { left: 80, top: 80, fill: '#ffffff' });
    fabricRef.current.add(t).setActiveObject(t);
  }

  async function addImageFromFile(file: File) {
    const fabric = (window as any).fabric; if (!fabric || !fabricRef.current) return;
    const dataUrl = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(file); });
    fabric.Image.fromURL(dataUrl).then((img: any) => {
      img.set({ left: 40, top: 40, selectable: true });
      const c = fabricRef.current; c.add(img).setActiveObject(img).requestRenderAll();
    });
  }

  function addSticker(type: 'star' | 'heart' | 'errl') {
    const fabric = (window as any).fabric; if (!fabric || !fabricRef.current) return;
    const c = fabricRef.current;
    if (type === 'star') {
      const points = 5, outer = 60, inner = 26; const pts: Array<{x:number;y:number}> = [];
      for (let i=0;i<points*2;i++){ const angle = (Math.PI*i)/points; const r = (i%2===0)?outer:inner; pts.push({x: Math.cos(angle)*r, y: Math.sin(angle)*r}); }
      const poly = new fabric.Polygon(pts, { left: 120, top: 120, fill: '#ffd34d', stroke: '#ffb300', strokeWidth: 3, originX: 'center', originY: 'center' });
      c.add(poly).setActiveObject(poly).requestRenderAll();
      return;
    }
    if (type === 'heart') {
      const path = new fabric.Path('M 75 30 C 75 12 60 0 45 0 C 30 0 15 12 15 30 C 15 60 45 75 45 90 C 45 75 75 60 75 30 Z', { left: 140, top: 140, fill: '#ff5a7a', stroke: '#d94162', strokeWidth: 3, scaleX: 2, scaleY: 2, originX: 'center', originY: 'center' });
      c.add(path).setActiveObject(path).requestRenderAll();
      return;
    }
    if (type === 'errl') {
      const url = '/portal/assets/L4_Central/errl-face-2.svg';
      fabric.loadSVGFromURL(url, (objects: any[], options: any) => {
        const group = fabric.util.groupSVGElements(objects, options);
        group.set({ left: 160, top: 120, scaleX: 0.4, scaleY: 0.4 });
        c.add(group).setActiveObject(group).requestRenderAll();
      });
      return;
    }
  }

  function cropToSelection() {
    const c = fabricRef.current; if (!c) return;
    const obj = c.getActiveObject(); if (!obj) return;
    const br = obj.getBoundingRect(true, true);
    const left = Math.max(0, Math.floor(br.left));
    const top = Math.max(0, Math.floor(br.top));
    const width = Math.floor(br.width);
    const height = Math.floor(br.height);
    const data = c.toDataURL({ format: 'png', left, top, width, height, enableRetinaScaling: true });
    const fabric = (window as any).fabric;
    fabric.Image.fromURL(data).then((img: any) => {
      c.clear();
      c.setWidth(width); c.setHeight(height);
      img.set({ left: 0, top: 0, selectable: true });
      c.add(img).setActiveObject(img).requestRenderAll();
    });
  }

  function doExport(fmt: 'png' | 'jpeg') {
    const c = fabricRef.current; if (!c) return;
    const data = c.toDataURL({ format: fmt, quality: 0.95 });
    const a = document.createElement('a'); a.href = data; a.download = `photo.${fmt}`; a.click();
  }

  function doDelete() {
    const c = fabricRef.current; if (!c) return; const obj = c.getActiveObject(); if (obj) { c.remove(obj); c.discardActiveObject(); c.requestRenderAll(); }
  }
  function bringForward() { const c = fabricRef.current; if (!c) return; const o = c.getActiveObject(); if (o) { c.bringForward(o); c.requestRenderAll(); } }
  function sendBackwards() { const c = fabricRef.current; if (!c) return; const o = c.getActiveObject(); if (o) { c.sendBackwards(o); c.requestRenderAll(); } }

  useEffect(() => {
    const c = fabricRef.current; if (!c) return;
    c.setBackgroundColor(transparentBG ? 'transparent' : '#111', () => c.requestRenderAll());
  }, [transparentBG]);

  // track changes to re-render layer list
  const [, force] = useState(0);
  useEffect(() => {
    const c = fabricRef.current; if (!c) return;
    const bump = () => force((v) => v + 1);
    const evts = ['object:added','object:removed','object:modified','selection:created','selection:updated','selection:cleared'];
    evts.forEach((e) => c.on(e as any, bump));
    return () => { evts.forEach((e) => c.off(e as any, bump)); };
  }, []);

  function getSelection(): any[] {
    const c = fabricRef.current; if (!c) return [];
    return c.getActiveObjects ? c.getActiveObjects() : (c.getActiveObject() ? [c.getActiveObject()] : []);
  }

  function alignHoriz(mode: 'left'|'center'|'right') {
    const c = fabricRef.current; if (!c) return; const w = c.getWidth();
    const sel = getSelection(); if (sel.length === 0) return;
    sel.forEach((o:any) => {
      const br = o.getBoundingRect(true, true);
      if (mode === 'left') { const dx = 0 - br.left; o.set({ left: o.left + dx }); }
      if (mode === 'center') { const dx = (w - br.width)/2 - br.left; o.set({ left: o.left + dx }); }
      if (mode === 'right') { const dx = w - br.right; o.set({ left: o.left + dx }); }
      o.setCoords();
    });
    c.requestRenderAll();
  }
  function alignVert(mode: 'top'|'middle'|'bottom') {
    const c = fabricRef.current; if (!c) return; const h = c.getHeight();
    const sel = getSelection(); if (sel.length === 0) return;
    sel.forEach((o:any) => {
      const br = o.getBoundingRect(true, true);
      if (mode === 'top') { const dy = 0 - br.top; o.set({ top: o.top + dy }); }
      if (mode === 'middle') { const dy = (h - br.height)/2 - br.top; o.set({ top: o.top + dy }); }
      if (mode === 'bottom') { const dy = h - br.bottom; o.set({ top: o.top + dy }); }
      o.setCoords();
    });
    c.requestRenderAll();
  }

  function distribute(mode: 'h'|'v') {
    const c = fabricRef.current; if (!c) return;
    const sel = getSelection(); if (sel.length < 3) return; // need at least 3
    const items = sel.map((o:any) => ({ o, br: o.getBoundingRect(true, true) }));
    if (mode === 'h') {
      items.sort((a,b) => a.br.left - b.br.left);
      const left = items[0].br.left; const right = items[items.length-1].br.right;
      const span = right - left;
      const sumW = items.reduce((s, x) => s + x.br.width, 0);
      const gaps = items.length - 1; const gapSize = (span - sumW) / gaps;
      let cursor = left;
      items.forEach((it, idx) => {
        if (idx === 0) { cursor = it.br.right + gapSize; return; }
        const targetLeft = cursor;
        const dx = targetLeft - it.br.left;
        it.o.set({ left: it.o.left + dx }); it.o.setCoords();
        cursor = targetLeft + it.br.width + gapSize;
      });
    } else {
      items.sort((a,b) => a.br.top - b.br.top);
      const top = items[0].br.top; const bottom = items[items.length-1].br.bottom;
      const span = bottom - top;
      const sumH = items.reduce((s, x) => s + x.br.height, 0);
      const gaps = items.length - 1; const gapSize = (span - sumH) / gaps;
      let cursor = top;
      items.forEach((it, idx) => {
        if (idx === 0) { cursor = it.br.bottom + gapSize; return; }
        const targetTop = cursor;
        const dy = targetTop - it.br.top;
        it.o.set({ top: it.o.top + dy }); it.o.setCoords();
        cursor = targetTop + it.br.height + gapSize;
      });
    }
    c.requestRenderAll();
  }

  function selectAll() {
    const c = fabricRef.current; if (!c) return;
    c.discardActiveObject();
    const sel = new (window as any).fabric.ActiveSelection(c.getObjects(), { canvas: c });
    c.setActiveObject(sel); c.requestRenderAll();
  }

  function layers(): any[] {
    const c = fabricRef.current; if (!c) return [];
    return c.getObjects();
  }
  function setActive(obj: any) { const c = fabricRef.current; if (!c) return; c.setActiveObject(obj); c.requestRenderAll(); }
  function toggleVisible(obj: any) { obj.set({ visible: !obj.visible }); obj.canvas?.requestRenderAll(); force((v)=>v+1); }
  function toggleLock(obj: any) { obj.set({ selectable: !obj.selectable, evented: !obj.evented }); obj.canvas?.requestRenderAll(); force((v)=>v+1); }
  function sendToBack() { const c = fabricRef.current; if (!c) return; const o = c.getActiveObject(); if (o) { c.sendToBack(o); c.requestRenderAll(); } }
  function bringToFront() { const c = fabricRef.current; if (!c) return; const o = c.getActiveObject(); if (o) { c.bringToFront(o); c.requestRenderAll(); } }

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-3 p-3">
      <div className={"relative border border-white/10 rounded-md " + (showGrid ? 'bg-[radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:16px_16px]' : '')}>
        <canvas ref={canvasEl} className="w-full h-full"/>
      </div>
      <div className="space-y-3">
        <Card className="bg-black/30 border-white/10">
          <CardHeader className="py-2"><CardTitle className="text-sm">Add</CardTitle></CardHeader>
          <CardContent className="pt-2 space-y-2">
            <Button variant="outline" size="sm" onClick={addText}>Add Text</Button>
            <div>
              <label className="text-sm">Upload Image</label>
              <Input type="file" accept="image/*" onChange={(e)=> e.target.files && addImageFromFile(e.target.files[0])} />
            </div>
            <div>
              <div className="text-sm opacity-80">Stickers</div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => addSticker('star')}>Star</Button>
                <Button variant="outline" size="sm" onClick={() => addSticker('heart')}>Heart</Button>
                <Button variant="outline" size="sm" onClick={() => addSticker('errl')}>Errl Face</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border-white/10">
          <CardHeader className="py-2"><CardTitle className="text-sm">Arrange</CardTitle></CardHeader>
          <CardContent className="pt-2 space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
              <Button variant="outline" size="sm" onClick={bringForward}>Bring Forward</Button>
              <Button variant="outline" size="sm" onClick={sendBackwards}>Send Back</Button>
              <Button variant="outline" size="sm" onClick={bringToFront}>Bring To Front</Button>
              <Button variant="outline" size="sm" onClick={sendToBack}>Send To Back</Button>
              <Button variant="outline" size="sm" onClick={cropToSelection}>Crop to Selection</Button>
              <Button variant="destructive" size="sm" onClick={doDelete}>Delete</Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => alignHoriz('left')}>Align Left</Button>
              <Button variant="outline" size="sm" onClick={() => alignHoriz('center')}>Align Center</Button>
              <Button variant="outline" size="sm" onClick={() => alignHoriz('right')}>Align Right</Button>
              <Button variant="outline" size="sm" onClick={() => alignVert('top')}>Align Top</Button>
              <Button variant="outline" size="sm" onClick={() => alignVert('middle')}>Align Middle</Button>
              <Button variant="outline" size="sm" onClick={() => alignVert('bottom')}>Align Bottom</Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => distribute('h')}>Distribute H</Button>
              <Button variant="outline" size="sm" onClick={() => distribute('v')}>Distribute V</Button>
            </div>
            <label className="text-xs text-zinc-400 flex items-center gap-2">
              <input type="checkbox" className="accent-purple-500" checked={showGrid} onChange={(e)=> setShowGrid(e.target.checked)} /> Grid
            </label>
            <label className="text-xs text-zinc-400 flex items-center gap-2">
              <input type="checkbox" className="accent-purple-500" checked={transparentBG} onChange={(e)=> setTransparentBG(e.target.checked)} /> Transparent BG
            </label>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border-white/10">
          <CardHeader className="py-2"><CardTitle className="text-sm">Layers</CardTitle></CardHeader>
          <CardContent className="pt-2 space-y-2">
            <div className="max-h-64 overflow-auto divide-y divide-white/10 border border-white/10 rounded-md">
              {layers().map((obj:any, idx:number) => {
                const active = obj === (fabricRef.current?.getActiveObject?.() || null);
                const name = (obj.type || 'object') + (obj.text ? ': ' + obj.text : '');
                return (
                  <div key={idx} className={"flex items-center gap-2 px-2 py-1 text-sm " + (active ? 'bg-white/10' : '')}>
                    <button className="px-2 py-0.5 border border-white/20 rounded" onClick={() => setActive(obj)}>Select</button>
                    <div className="flex-1 truncate" title={name}>{name}</div>
                    <button className="px-2 py-0.5 border border-white/20 rounded" onClick={() => toggleVisible(obj)}>{obj.visible === false ? 'Show' : 'Hide'}</button>
                    <button className="px-2 py-0.5 border border-white/20 rounded" onClick={() => toggleLock(obj)}>{obj.selectable === false ? 'Unlock' : 'Lock'}</button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border-white/10">
          <CardHeader className="py-2"><CardTitle className="text-sm">Export</CardTitle></CardHeader>
          <CardContent className="pt-2 space-y-2">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => doExport('png')}>PNG</Button>
              <Button variant="outline" size="sm" onClick={() => doExport('jpeg')}>JPEG</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
