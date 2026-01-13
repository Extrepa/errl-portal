import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Badge } from '@/shared/components/ui/badge';
import { Download, Trash2, Sparkles, Play, Pause, RotateCcw, Copy, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import presetsData from './studioPresets.json';
import { SVGTab } from './svg/SVGTab';
import StudioShell from './layout/StudioShell';

const ASSET_BASE_URL = (() => {
  try {
    if (
      typeof import.meta !== 'undefined' &&
      typeof (import.meta as any).env !== 'undefined' &&
      (import.meta as any).env.BASE_URL
    ) {
      return String((import.meta as any).env.BASE_URL);
    }
  } catch {
    // ignore and fall back to default
  }
  return '/';
})();

type TopTab = 'code' | 'svg' | 'photos';

const TAB_METADATA: Record<TopTab, { label: string; description: string }> = {
  code: {
    label: 'Code Lab',
    description: 'Build HTML/CSS/JS experiments with an instant preview and mirrored console.',
  },
  svg: {
    label: 'SVG Lab',
    description: 'Craft vector assets, tweak paths, and stage quick animations for Errl shows.',
  },
  photos: {
    label: 'Photos Lab',
    description: 'Lay out stickers, photos, and textures with Fabric-powered editing tools.',
  },
};

export default function ErrlLiveStudio() {

  const [topTab, setTopTab] = useState<TopTab>(() => {
    if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
      const h = window.location.hash.replace('#', '');
      if (h === 'svg' || h === 'photos' || h === 'code') return h;
    }
    return 'code';
  });

  useEffect(() => {
    const onHash = () => {
      const h = location.hash.replace('#','');
      if (h === 'code' || h === 'svg' || h === 'photos') setTopTab(h as TopTab);
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
  const [collapsedSections, setCollapsedSections] = useState({
    editors: false,
    preview: false,
    assets: false,
    console: false,
  });
  type SectionKey = keyof typeof collapsedSections;
  const toggleSection = (key: SectionKey) =>
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const [tick, setTick] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const featuredAsset = assets[0];
  const featuredIsImage = featuredAsset?.dataUrl?.startsWith('data:image');
  const [editorTab, setEditorTab] = useState<'html' | 'css' | 'js'>('html');
  const editorRefs = useRef<{ html: any | null; css: any | null; js: any | null }>({
    html: null,
    css: null,
    js: null,
  });
  const syncEditors = useRef<{ html: boolean; css: boolean; js: boolean }>({
    html: false,
    css: false,
    js: false,
  });
  const presetDescriptions: Record<string, string> = {
    blank: 'Clean markup and minimal styling.',
    bubbles: 'Animated rising bubble background.',
    'errl-svg': 'SVG playground with Errl animation.',
  };
  const projectPresets: Array<{ id: string; name: string; html: string; css: string; js: string }> = (presetsData as any).presets;
  const scheduleHtmlSync = (next: string) => {
    syncEditors.current.html = true;
    setHtml(next);
  };
  const scheduleCssSync = (next: string) => {
    syncEditors.current.css = true;
    setCss(next);
  };
  const scheduleJsSync = (next: string) => {
    syncEditors.current.js = true;
    setJs(next);
  };
  const clearLogs = () => setLogs([]);
  const SectionCard = ({
    sectionKey,
    title,
    subtitle,
    className,
    actions,
    children,
  }: {
    sectionKey: SectionKey;
    title: string;
    subtitle?: string;
    className?: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
  }) => {
    const composedClass = className ? `border-white/10 bg-[#121222] ${className}` : 'border-white/10 bg-[#121222]';
    return (
      <Card className={composedClass}>
        <CardHeader className="flex items-center justify-between gap-2 py-2">
          <div>
            <CardTitle className="text-sm">{title}</CardTitle>
            {subtitle ? <p className="text-xs text-zinc-400">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleSection(sectionKey)}
              aria-label={`Toggle ${title}`}
            >
              {collapsedSections[sectionKey] ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!collapsedSections[sectionKey] ? (
          <CardContent className="space-y-3 pt-2">{children}</CardContent>
        ) : null}
      </Card>
    );
  };

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
    if (_html) scheduleHtmlSync(_html);
    if (_css) scheduleCssSync(_css);
    if (_js) scheduleJsSync(_js);
    if (_theme) setTheme(_theme);
    if (_live) setLive(_live === '1');
  }, []);

  useEffect(() => {
    if (!syncEditors.current.html) return;
    const editor = editorRefs.current.html;
  if (editor && editor.getValue) {
    if (editor.getValue() !== html) {
      editor.setValue(html);
    }
    syncEditors.current.html = false;
  }
  }, [html]);

  useEffect(() => {
    if (!syncEditors.current.css) return;
    const editor = editorRefs.current.css;
  if (editor && editor.getValue) {
    if (editor.getValue() !== css) {
      editor.setValue(css);
    }
    syncEditors.current.css = false;
  }
  }, [css]);

  useEffect(() => {
    if (!syncEditors.current.js) return;
    const editor = editorRefs.current.js;
  if (editor && editor.getValue) {
    if (editor.getValue() !== js) {
      editor.setValue(js);
    }
    syncEditors.current.js = false;
  }
  }, [js]);

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
    const source = editorRefs.current.css?.getValue?.() ?? css;
    const out = g.prettier.format(String(source), { parser: 'css', plugins: g.prettierPlugins });
    scheduleCssSync(out);
    } catch {}
  };

  const formatJS = async () => {
    try {
      await ensurePrettier();
      const g: any = window as any;
    const source = editorRefs.current.js?.getValue?.() ?? js;
    const out = g.prettier.format(String(source), { parser: 'babel', plugins: g.prettierPlugins });
    scheduleJsSync(out);
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
  const [previewExpanded, setPreviewExpanded] = useState(false);

  const tabMeta = TAB_METADATA[topTab];
  const breadcrumbs = [
    { label: 'Errl Hub', to: '/' },
    { label: 'Live Studio', to: '/' },
    { label: tabMeta.label },
  ];

  return (
    <StudioShell
      title="Live Studio"
      subtitle={tabMeta.description}
      breadcrumbs={breadcrumbs}
      navActiveKey="code-lab"
      status={
        <Badge className="border border-purple-400/30 bg-purple-600/20 text-purple-200">
          Autosave {autosave ? 'On' : 'Off'} • {live ? 'Live' : 'Paused'}
        </Badge>
      }
      actions={
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-200 hover:bg-white/10"
        >
          Back to Hub
        </Link>
      }
      className="space-y-6"
    >
      <Tabs value={topTab} onValueChange={(v) => setTopTab(v as TopTab)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#121222] px-4 py-3 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="flex rounded-lg border border-white/10 bg-black/40 p-1">
            <TabsTrigger value="code" className="px-4 py-2 text-sm font-medium data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-100">
              Code
            </TabsTrigger>
            <TabsTrigger value="svg" className="px-4 py-2 text-sm font-medium data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-100">
              SVG
            </TabsTrigger>
            <TabsTrigger value="photos" className="px-4 py-2 text-sm font-medium data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-100">
              Photos
            </TabsTrigger>
          </TabsList>

          {topTab === 'code' ? (
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const current = editorRefs.current.html?.getValue?.() ?? html;
                    scheduleHtmlSync(formatHTML(current));
                  }}
                >
                  <Sparkles className="mr-1 h-4 w-4" />
                  Format HTML
                </Button>
                <Button variant="outline" size="sm" onClick={formatCSS}>
                  <Sparkles className="mr-1 h-4 w-4" />
                  Format CSS
                </Button>
                <Button variant="outline" size="sm" onClick={formatJS}>
                  <Sparkles className="mr-1 h-4 w-4" />
                  Format JS
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportSingleHTML(html, css, js, assets)}>
                  <Download className="mr-1 h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportZip(html, css, js, assets)}>
                  <Download className="mr-1 h-4 w-4" />
                  Zip
                </Button>
                <Button variant="secondary" size="sm" onClick={() => window.open(makeStandalone(html, css, js, assets), '_blank')}>
                  <ExternalLink className="mr-1 h-4 w-4" />
                  Open Preview
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">Presets</span>
                {projectPresets.map((preset) => (
                  <Button
                    key={preset.id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      scheduleHtmlSync(preset.html);
                      scheduleCssSync(preset.css);
                      scheduleJsSync(preset.js);
                      setEditorTab('html');
                    }}
                    title={presetDescriptions[preset.id] || 'Load preset project'}
                  >
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          ) : topTab === 'svg' ? (
            <div className="flex w-full flex-wrap justify-end gap-2 text-xs text-zinc-400 sm:w-auto">
              <span className="uppercase tracking-[0.3em] text-zinc-500">SVG Lab</span>
              <span className="max-w-[22rem] text-left sm:text-right">
                Import vector art, optimise paths, and animate layers with the controls in the right-hand panel below.
              </span>
            </div>
          ) : (
            <div className="flex w-full flex-wrap justify-end gap-2 text-xs text-zinc-400 sm:w-auto">
              <span className="uppercase tracking-[0.3em] text-zinc-500">Photos Lab</span>
              <span className="max-w-[22rem] text-left sm:text-right">
                Build canvases, manage layers, and export web-ready art using the staging controls beside the editor surface.
              </span>
            </div>
          )}
        </div>

        <TabsContent value="code" className="flex-1">
          <div className="grid gap-4 xl:auto-rows-min xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="flex flex-col gap-4 xl:row-span-2">
              <SectionCard
                sectionKey="editors"
                title="Code Editor"
                subtitle="Write HTML, CSS, and JavaScript side-by-side. Changes update the preview automatically."
              >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setRunning((r) => !r)}>
                    {running ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
                    {running ? 'Pause Live' : 'Resume Live'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      scheduleHtmlSync(DEFAULT_HTML);
                      scheduleCssSync(DEFAULT_CSS);
                      scheduleJsSync(DEFAULT_JS);
                    }}
                  >
                    <RotateCcw className="mr-1 h-4 w-4" />
                    Reset Project
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-sm" value={theme} onChange={(e) => setTheme(e.target.value as any)}>
                    <option value="vs-dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="hc-black">High Contrast</option>
                  </select>
                  <label className="flex items-center gap-2 text-xs text-zinc-400">
                    <input type="checkbox" className="accent-purple-500" checked={autosave} onChange={(e) => setAutosave(e.target.checked)} /> Autosave
                  </label>
                  <label className="flex items-center gap-2 text-xs text-zinc-400">
                    <input type="checkbox" className="accent-purple-500" checked={live} onChange={(e) => setLive(e.target.checked)} /> Live updates
                  </label>
                </div>
              </div>
              <Tabs value={editorTab} onValueChange={(v) => setEditorTab(v as 'html' | 'css' | 'js')} className="flex flex-1 flex-col">
                <div className="px-3 pt-3">
                  <TabsList className="grid w-full grid-cols-3 rounded-lg border border-white/10 bg-black/30">
                    <TabsTrigger value="html">HTML</TabsTrigger>
                    <TabsTrigger value="css">CSS</TabsTrigger>
                    <TabsTrigger value="js">JS</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="html" className="flex-1">
                  <Editor
                    language="html"
                    theme={theme}
                    defaultValue={html}
                    value={undefined}
                    onMount={(editor) => {
                      editorRefs.current.html = editor;
                      if (editor.getValue() !== html) editor.setValue(html);
                      syncEditors.current.html = false;
                    }}
                    onChange={(v) => {
                      setHtml(v ?? '');
                      debouncedUpdate();
                    }}
                    options={{ fontSize: 16, wordWrap: 'on', minimap: { enabled: false }, automaticLayout: true }}
                    height="820px"
                  />
                </TabsContent>
                <TabsContent value="css" className="flex-1">
                  <Editor
                    language="css"
                    theme={theme}
                    defaultValue={css}
                    value={undefined}
                    onMount={(editor) => {
                      editorRefs.current.css = editor;
                      if (editor.getValue() !== css) editor.setValue(css);
                      syncEditors.current.css = false;
                    }}
                    onChange={(v) => {
                      setCss(v ?? '');
                      debouncedUpdate();
                    }}
                    options={{ fontSize: 16, wordWrap: 'on', minimap: { enabled: false }, automaticLayout: true }}
                    height="820px"
                  />
                </TabsContent>
                <TabsContent value="js" className="flex-1">
                  <Editor
                    language="javascript"
                    theme={theme}
                    defaultValue={js}
                    value={undefined}
                    onMount={(editor) => {
                      editorRefs.current.js = editor;
                      if (editor.getValue() !== js) editor.setValue(js);
                      syncEditors.current.js = false;
                    }}
                    onChange={(v) => {
                      setJs(v ?? '');
                      debouncedUpdate();
                    }}
                    options={{ fontSize: 16, wordWrap: 'on', minimap: { enabled: false }, automaticLayout: true }}
                    height="820px"
                  />
                </TabsContent>
              </Tabs>
              </SectionCard>
            </div>

            <div className="flex flex-col gap-4">
              <SectionCard
                sectionKey="preview"
                title="Live Preview"
                subtitle="Render the current project output without leaving the editor."
                className="bg-[#0f111f]"
                actions={
                  <Button variant="outline" size="sm" onClick={() => setPreviewExpanded((p) => !p)}>
                    {previewExpanded ? 'Shrink' : 'Expand'}
                  </Button>
                }
              >
                <div
                  className={[
                    'relative overflow-hidden rounded-lg border border-white/10 transition-[height]',
                    previewExpanded ? 'h-[540px]' : 'h-[360px]',
                  ].join(' ')}
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-purple-500/10 to-cyan-500/10" />
                  <iframe
                    className="h-full w-full bg-white"
                    title="Preview"
                    sandbox="allow-scripts allow-same-origin"
                    srcDoc={
                      running && live
                        ? srcDoc
                        : buildSrcDoc(
                            "<h1 style='font-family:system-ui'>Paused</h1>",
                            "body{background:#111;color:#eee;display:grid;place-items:center;height:100vh}",
                            '',
                            assets,
                          )
                    }
                  />
                </div>
                <p className="text-xs text-zinc-400">
                  Need a second window? Use <span className="text-purple-200">Open Preview</span> from the toolbar above or export a standalone HTML page.
                </p>
              </SectionCard>

              <SectionCard
                sectionKey="assets"
                title="Assets & Uploads"
                subtitle="Drag in images, SVGs, audio clips, or errl project files."
              >
                {assets.length > 0 ? (
                  <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                    <div className="grid h-16 w-16 place-items-center overflow-hidden rounded bg-black/40">
                      {featuredIsImage ? (
                        <img src={featuredAsset?.dataUrl} alt={featuredAsset?.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="px-2 text-[11px] text-zinc-300">{featuredAsset?.name ?? 'Asset'}</span>
                      )}
                    </div>
                    <div className="flex-1 text-xs text-zinc-300">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{featuredAsset?.name}</span>
                        <span className="opacity-70">({assets.length} total)</span>
                      </div>
                      <p className="opacity-75">Copy data URLs directly into your markup or JavaScript, or export the entire bundle below.</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">
                    No assets yet. Upload PNG/JPEG/SVG/audio files and we’ll convert them into ready-to-use Data URLs.
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="file"
                    multiple
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files) onAddAssets(e.target.files);
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportProjectJSON(html, css, js, assets)}
                    disabled={assets.length === 0}
                  >
                    Save Project
                  </Button>
                  <Input
                    type="file"
                    accept=".errlproj,.json"
                    onChange={(e) =>
                      e.target.files &&
                      importProjectFile(e.target.files[0], scheduleHtmlSync, scheduleCssSync, scheduleJsSync, setAssets)
                    }
                  />
                </div>
                <div>
<Button variant="secondary" size="sm">
                    <Link to="/assets">Open Asset Library</Link>
                  </Button>
                </div>

                {assets.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {assets.map((a) => (
                      <div key={a.id} className="group overflow-hidden rounded-lg border border-white/10 bg-white/5">
                        <div className="flex h-24 items-center justify-center bg-black/40">
                          {a.dataUrl.startsWith('data:image') ? (
                            <img src={a.dataUrl} className="max-h-24 object-contain" />
                          ) : (
                            <div className="p-2 text-xs text-zinc-300">{a.name}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 p-2 text-xs">
                          <span className="truncate" title={a.name}>
                            {a.name}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="ml-auto h-7 w-7"
                            onClick={() => {
                              navigator.clipboard.writeText(a.dataUrl);
                            }}
                            title="Copy data URL"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => removeAsset(a.id)} title="Remove asset">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>

            <div className="xl:col-span-2">
              <SectionCard
                sectionKey="console"
                title="Console & Logs"
                subtitle="Mirror of window.console output from the live preview."
                actions={
                  <Button variant="outline" size="sm" onClick={clearLogs} disabled={logs.length === 0}>
                    Clear
                  </Button>
                }
              >
                <ScrollArea ref={consoleRef} className="h-[220px] rounded border border-white/10 bg-black/20 px-3 py-2">
                  <div className="space-y-1">
                    {logs.length === 0 ? (
                      <p className="text-xs text-zinc-400">Console output will appear here. Try <code>console.log</code> inside your JS tab.</p>
                    ) : (
                      logs.map((l) => (
                        <div
                          key={l.t + Math.random()}
                          className={
                            {
                              log: 'text-fuchsia-300',
                              info: 'text-cyan-300',
                              warn: 'text-yellow-300',
                              error: 'text-red-400',
                            }[l.level] || 'text-fuchsia-200'
                          }
                        >
                          [{l.level.toUpperCase()}] {l.text}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </SectionCard>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="svg" className="flex-1">
          <div className="min-h-[720px] rounded-xl border border-white/10 bg-[#101223] p-4 shadow-lg">
            <SVGTab />
          </div>
        </TabsContent>

        <TabsContent value="photos" className="flex-1">
          <div className="min-h-[720px] rounded-xl border border-white/10 bg-[#101223] p-4 shadow-lg">
            <PhotosTab />
          </div>
        </TabsContent>
      </Tabs>
    </StudioShell>
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

function importProjectFile(
  file: File,
  applyHtml: (s: string) => void,
  applyCss: (s: string) => void,
  applyJs: (s: string) => void,
  setAssets: (a: any) => void,
) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      if (typeof data.html === 'string') applyHtml(data.html);
      if (typeof data.css === 'string') applyCss(data.css);
      if (typeof data.js === 'string') applyJs(data.js);
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
  const gridRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [transparentBG, setTransparentBG] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 960, height: 640 });
  const [pendingWidth, setPendingWidth] = useState('960');
  const [pendingHeight, setPendingHeight] = useState('640');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarFloating, setSidebarFloating] = useState(false);
  const [sidebarSide, setSidebarSide] = useState<'left' | 'right'>('right');
  useEffect(() => {
    setPendingWidth(String(Math.round(canvasSize.width)));
    setPendingHeight(String(Math.round(canvasSize.height)));
  }, [canvasSize]);
  function applyGrid() {
    const fabric = (window as any).fabric;
    const c = fabricRef.current;
    if (!fabric || !c) return;

    if (!showGrid) {
      if (gridRef.current) {
        c.remove(gridRef.current);
        gridRef.current = null;
        c.renderAll();
      }
      return;
    }

    const spacing = 32;
    const width = c.getWidth();
    const height = c.getHeight();
    const lines: any[] = [];
    for (let x = spacing; x < width; x += spacing) {
      lines.push(new fabric.Line([x, 0, x, height], { stroke: 'rgba(255,255,255,0.05)', selectable: false, evented: false }));
    }
    for (let y = spacing; y < height; y += spacing) {
      lines.push(new fabric.Line([0, y, width, y], { stroke: 'rgba(255,255,255,0.05)', selectable: false, evented: false }));
    }
    const gridGroup = new fabric.Group(lines, { selectable: false, evented: false });
    if (gridRef.current) {
      c.remove(gridRef.current);
    }
    gridRef.current = gridGroup;
    c.add(gridGroup);
    gridGroup.sendToBack();
    c.renderAll();
  }

  useEffect(() => {
    let disposed = false;
    const resizeCanvas = () => {
      const canvas = fabricRef.current;
      const parent = canvasEl.current?.parentElement;
      if (!canvas || !parent) return;
      const rect = parent.getBoundingClientRect();
      const width = rect.width || canvas.getWidth() || 960;
      const fallbackHeight = rect.height > 0 ? rect.height : Math.max(560, rect.width ? rect.width * 0.75 : 560);
      canvas.setWidth(width);
      canvas.setHeight(Math.max(520, fallbackHeight));
      canvas.renderAll();
      setCanvasSize({ width: canvas.getWidth(), height: canvas.getHeight() });
      applyGrid();
    };

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
      c.setBackgroundColor(transparentBG ? 'transparent' : '#111', () => c.renderAll());

      const parent = canvasEl.current?.parentElement;
      if (parent) {
        resizeCanvas();
        if (typeof ResizeObserver !== 'undefined') {
          if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
            resizeObserverRef.current = null;
          }
          resizeObserverRef.current = new ResizeObserver(resizeCanvas);
          resizeObserverRef.current.observe(parent);
        }
      }

      window.addEventListener('resize', resizeCanvas);
      applyGrid();
    }

    ensureFabric();

    return () => {
      disposed = true;
      window.removeEventListener('resize', resizeCanvas);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (fabricRef.current) {
        try {
          fabricRef.current.dispose();
        } catch {}
        fabricRef.current = null;
      }
      gridRef.current = null;
    };
  }, []);

  useEffect(() => {
    applyGrid();
  }, [showGrid, canvasSize.height, canvasSize.width]);

  function addText() {
    const fabric = (window as any).fabric; if (!fabric || !fabricRef.current) return;
    const c = fabricRef.current;
    const center = c.getCenter();
    const t = new fabric.Textbox('New Text', { left: center.left, top: center.top, fill: '#ffffff', originX: 'center', originY: 'center' });
    c.add(t);
    c.setActiveObject(t);
    c.renderAll();
  }

  async function addImageFromFile(file: File) {
    const fabric = (window as any).fabric; if (!fabric || !fabricRef.current) return;
    setIsUploading(true);
    try {
      const dataUrl = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onerror = () => rej(new Error('Failed to read file'));
        r.onload = () => res(String(r.result));
        r.readAsDataURL(file);
      });
      fabric.Image.fromURL(
        dataUrl,
        (img: any) => {
          if (!fabricRef.current) return;
          const c = fabricRef.current;
          img.set({ selectable: true, evented: true, crossOrigin: 'anonymous' });
          c.add(img);
          img.scaleToHeight(Math.min(420, c.getHeight() * 0.6));
          img.center();
          c.setActiveObject(img);
          c.renderAll();
        },
        { crossOrigin: 'anonymous' }
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  }

  function addSticker(type: 'star' | 'heart' | 'errl') {
    const fabric = (window as any).fabric; if (!fabric || !fabricRef.current) return;
    const c = fabricRef.current;
    const { left, top } = c.getCenter();
    if (type === 'star') {
      const points = 5, outer = 60, inner = 26; const pts: Array<{x:number;y:number}> = [];
      for (let i=0;i<points*2;i++){ const angle = (Math.PI*i)/points; const r = (i%2===0)?outer:inner; pts.push({x: Math.cos(angle)*r, y: Math.sin(angle)*r}); }
      const poly = new fabric.Polygon(pts, { left, top, fill: '#ffd34d', stroke: '#ffb300', strokeWidth: 3, originX: 'center', originY: 'center' });
      c.add(poly).setActiveObject(poly).requestRenderAll();
      return;
    }
    if (type === 'heart') {
      const path = new fabric.Path('M 0 -40 C -25 -70 -70 -60 -75 -20 C -75 20 -40 40 0 75 C 40 40 75 20 75 -20 C 70 -60 25 -70 0 -40 Z', {
        left,
        top,
        fill: '#ff5a7a',
        stroke: '#d94162',
        strokeWidth: 4,
        originX: 'center',
        originY: 'center',
      });
      c.add(path).setActiveObject(path).requestRenderAll();
      return;
    }
    if (type === 'errl') {
      const url = `${ASSET_BASE_URL}assets/portal/L4_Central/errl-face-2.svg`;
      fabric.loadSVGFromURL(url, (objects: any[], options: any) => {
        const group = fabric.util.groupSVGElements(objects, options);
        group.set({ left, top, scaleX: 0.4, scaleY: 0.4, originX: 'center', originY: 'center' });
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

  function exportSVG() {
    const c = fabricRef.current; if (!c) return;
    const svg = c.toSVG({ suppressPreamble: true });
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'photo.svg';
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportProjectJSONPhotos() {
    const c = fabricRef.current; if (!c) return;
    const payload = {
      version: 1,
      objects: c.toJSON(['selectable', 'evented']),
      transparentBG,
      showGrid,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'photo-project.json';
    a.click();
    URL.revokeObjectURL(url);
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
  function setCanvasDimensions(width: number, height: number) {
    const c = fabricRef.current; if (!c) return;
    c.setWidth(width);
    c.setHeight(height);
    c.renderAll();
    setCanvasSize({ width, height });
    applyGrid();
  }
  function applyPendingDimensions() {
    const width = parseInt(pendingWidth, 10);
    const height = parseInt(pendingHeight, 10);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
    setCanvasDimensions(width, height);
  }
  const canvasPresets = [
    { label: 'Square 1024', width: 1024, height: 1024 },
    { label: 'Banner 1920x1080', width: 1920, height: 1080 },
    { label: 'Story 1080x1920', width: 1080, height: 1920 },
    { label: 'Card 1200x630', width: 1200, height: 630 },
  ];
  function clearCanvas() {
    const c = fabricRef.current; if (!c) return;
    c.clear();
    gridRef.current = null;
    c.setBackgroundColor(transparentBG ? 'transparent' : '#111', () => c.renderAll());
    applyGrid();
  }
  function centerSelection() {
    const c = fabricRef.current; if (!c) return;
    const sel = getSelection();
    if (!sel.length) return;
    sel.forEach((o: any) => {
      c.centerObject(o);
      o.setCoords();
    });
    c.requestRenderAll();
  }
  function centerAllObjects() {
    const c = fabricRef.current; if (!c) return;
    c.getObjects().forEach((o: any) => {
      if (gridRef.current && o === gridRef.current) return;
      c.centerObject(o);
      o.setCoords();
    });
    c.requestRenderAll();
  }

  const sidebarContent = (
    <div className="space-y-3 rounded-2xl">
      <Card className="bg-black/30 border-white/10">
        <CardHeader className="py-2"><CardTitle className="text-sm">Canvas</CardTitle></CardHeader>
        <CardContent className="space-y-3 pt-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <label className="opacity-70">Size</label>
            <Input
              type="number"
              className="w-24 bg-black/20"
              min={128}
              value={pendingWidth}
              onChange={(e) => setPendingWidth(e.target.value)}
            />
            <span className="opacity-50">×</span>
            <Input
              type="number"
              className="w-24 bg-black/20"
              min={128}
              value={pendingHeight}
              onChange={(e) => setPendingHeight(e.target.value)}
            />
            <Button variant="outline" size="sm" onClick={applyPendingDimensions}>
              Resize
            </Button>
            <span className="opacity-60">
              ({Math.round(canvasSize.width)} × {Math.round(canvasSize.height)})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {canvasPresets.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => setCanvasDimensions(preset.width, preset.height)}
                title={`${preset.width} × ${preset.height}`}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={centerSelection}>
              Center Selection
            </Button>
            <Button variant="outline" size="sm" onClick={centerAllObjects}>
              Center All
            </Button>
            <Button variant="destructive" size="sm" onClick={clearCanvas}>
              Clear Canvas
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border-white/10">
        <CardHeader className="py-2"><CardTitle className="text-sm">Add</CardTitle></CardHeader>
        <CardContent className="pt-2 space-y-2">
          <Button variant="outline" size="sm" onClick={addText}>Add Text</Button>
          <div>
            <label className="text-sm">Upload Image</label>
            <Input type="file" accept="image/*" onChange={(e)=> e.target.files && addImageFromFile(e.target.files[0])} disabled={isUploading} />
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
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => doExport('png')}>PNG</Button>
            <Button variant="outline" size="sm" onClick={() => doExport('jpeg')}>JPEG</Button>
            <Button variant="outline" size="sm" onClick={exportSVG}>SVG</Button>
            <Button variant="outline" size="sm" onClick={exportProjectJSONPhotos}>Project JSON</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const floatingSidebar = sidebarVisible && sidebarFloating ? (
    <div
      className={[
        'pointer-events-auto fixed z-40 max-h-[70vh] overflow-y-auto backdrop-blur',
        sidebarSide === 'right' ? 'right-6' : 'left-6',
        'top-[calc(120px+1rem)] w-[320px] max-w-[90vw]',
      ].join(' ')}
    >
      <div className="rounded-2xl border border-white/10 bg-[#060815]/95 p-3 shadow-2xl">
        {sidebarContent}
      </div>
    </div>
  ) : null;

  return (
    <div className="relative grid h-full grid-cols-1 gap-4 p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <div className="relative min-h-[560px] overflow-hidden rounded-2xl border border-white/10 bg-[#090a14] lg:min-h-[640px]">
        <canvas ref={canvasEl} className="block h-full w-full" />
        <div className="pointer-events-auto absolute left-4 top-4 flex flex-wrap items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-2 text-xs">
          <Button variant="outline" size="sm" onClick={() => setSidebarVisible((v) => !v)}>
            {sidebarVisible ? 'Hide Panel' : 'Show Panel'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSidebarFloating((f) => !f)} disabled={!sidebarVisible}>
            {sidebarFloating ? 'Dock Panel' : 'Float Panel'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarSide((s) => (s === 'right' ? 'left' : 'right'))}
            disabled={!sidebarVisible || !sidebarFloating}
          >
            {sidebarSide === 'right' ? 'Move Left' : 'Move Right'}
          </Button>
        </div>
        {!isUploading ? null : (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-zinc-200">
            Loading image…
          </div>
        )}
      </div>
      {!sidebarFloating && sidebarVisible ? (
        <div className="space-y-3">{sidebarContent}</div>
      ) : (
        <div className="hidden lg:block" />
      )}
      {floatingSidebar}
    </div>
  );
}
