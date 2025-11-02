import React, { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, Eye, EyeOff, Trash2 } from 'lucide-react';

export type ExtractedPath = {
  id: string;
  name: string;
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  opacity?: string;
  visible?: boolean;
  // optional transform controls
  tX?: number; // translate X
  tY?: number; // translate Y
  rot?: number; // degrees
  scl?: number; // uniform scale
  groupId?: string; // optional grouping key
};

export function SVGTab() {
  const [fileName, setFileName] = useState<string>('');
  const [viewBox, setViewBox] = useState<string>('0 0 512 512');
  const [paths, setPaths] = useState<ExtractedPath[]>([]);
  const [bg, setBg] = useState<string>('#111111');
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selId, setSelId] = useState<string | null>(null);
  const [precision, setPrecision] = useState<number>(2);
  const [optStats, setOptStats] = useState<{before:number; after:number} | null>(null);
  const [anim, setAnim] = useState<{ rotate:number; pulse:number; dash:number; dashLen:number }>({ rotate: 0, pulse: 0, dash: 0, dashLen: 8 });
  const [bPaths, setBPaths] = useState<ExtractedPath[] | null>(null);
  const [bViewBox, setBViewBox] = useState<string>('0 0 512 512');
  const [hideA, setHideA] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const dragIndexRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function onUpload(files: FileList) {
    const f = files[0]; if (!f) return;
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = () => parseSVG(String(reader.result || ''));
    reader.readAsText(f);
  }

  function num(v: string | null | undefined, fallback = 0) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }
  function pointsArray(s: string | null): Array<{x:number;y:number}> {
    if (!s) return [];
    const pts: Array<{x:number;y:number}> = [];
    const parts = s.trim().split(/\s+|,/).filter(Boolean);
    for (let i = 0; i < parts.length - 1; i += 2) pts.push({ x: Number(parts[i]), y: Number(parts[i+1]) });
    return pts;
  }
  function elToPath(el: Element): string | null {
    const tag = el.tagName.toLowerCase();
    if (tag === 'path') return (el.getAttribute('d') || '').trim() || null;
    if (tag === 'rect') {
      const x = num(el.getAttribute('x')); const y = num(el.getAttribute('y'));
      const w = num(el.getAttribute('width')); const h = num(el.getAttribute('height'));
      const rx = num(el.getAttribute('rx')); const ry = num(el.getAttribute('ry')) || rx;
      if (w <= 0 || h <= 0) return null;
      if (!rx && !ry) return `M ${x} ${y} H ${x+w} V ${y+h} H ${x} Z`;
      const rrx = Math.min(rx, w/2); const rry = Math.min(ry, h/2);
      return [`M ${x+rrx} ${y}`,`H ${x+w-rrx}`,`A ${rrx} ${rry} 0 0 1 ${x+w} ${y+rry}`,`V ${y+h-rry}`,`A ${rrx} ${rry} 0 0 1 ${x+w-rrx} ${y+h}`,`H ${x+rrx}`,`A ${rrx} ${rry} 0 0 1 ${x} ${y+h-rry}`,`V ${y+rry}`,`A ${rrx} ${rry} 0 0 1 ${x+rrx} ${y}`,'Z'].join(' ');
    }
    if (tag === 'circle') {
      const cx = num(el.getAttribute('cx')); const cy = num(el.getAttribute('cy')); const r = num(el.getAttribute('r'));
      if (!r) return null;
      return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2*r} 0 a ${r} ${r} 0 1 0 ${-2*r} 0`;
    }
    if (tag === 'ellipse') {
      const cx = num(el.getAttribute('cx')); const cy = num(el.getAttribute('cy')); const rx = num(el.getAttribute('rx')); const ry = num(el.getAttribute('ry'));
      if (!rx || !ry) return null;
      return `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${2*rx} 0 a ${rx} ${ry} 0 1 0 ${-2*rx} 0`;
    }
    if (tag === 'line') {
      const x1 = num(el.getAttribute('x1')); const y1 = num(el.getAttribute('y1')); const x2 = num(el.getAttribute('x2')); const y2 = num(el.getAttribute('y2'));
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }
    if (tag === 'polyline' || tag === 'polygon') {
      const pts = pointsArray(el.getAttribute('points')); if (pts.length < 2) return null;
      const head = `M ${pts[0].x} ${pts[0].y}`; const lines = pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' '); const close = tag === 'polygon' ? ' Z' : '';
      return `${head} ${lines}${close}`;
    }
    return null;
  }

  async function parseSVG(svgContent: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    if (!svgEl) return;
    const vb = svgEl.getAttribute('viewBox') || `${svgEl.getAttribute('x')||0} ${svgEl.getAttribute('y')||0} ${svgEl.getAttribute('width')||512} ${svgEl.getAttribute('height')||512}`;
    setViewBox(vb);
    const list: ExtractedPath[] = [];
    const els = svgEl.querySelectorAll('path,rect,circle,ellipse,line,polyline,polygon');
    els.forEach((el, idx) => {
      const d = elToPath(el); if (!d) return;
      list.push({
        id: (el.getAttribute('id') || `${el.tagName.toLowerCase()}_${idx}`),
        name: el.getAttribute('data-name') || el.getAttribute('id') || `${el.tagName.toLowerCase()} ${idx+1}`,
        d,
        fill: el.getAttribute('fill') || undefined,
        stroke: el.getAttribute('stroke') || undefined,
        strokeWidth: el.getAttribute('stroke-width') || undefined,
        opacity: el.getAttribute('opacity') || undefined,
        visible: true,
      });
    });
    setPaths(list);
  }

  function animStyle(_anim: typeof anim) {
    const rotDur = _anim.rotate > 0 ? (360 / _anim.rotate) : 0; // seconds to complete 360
    const pulseDur = _anim.pulse > 0 ? 2 : 0;
    const dashDur = _anim.dash > 0 ? (20 / _anim.dash) : 0;
    const dashLen = Math.max(1, _anim.dashLen || 8);
    return `\n<style>\n@keyframes a_rot{to{transform:rotate(360deg)}}\n@keyframes a_pulse{0%,100%{transform:scale(1)}50%{transform:scale(${1+_anim.pulse})}}\n@keyframes a_dash{to{stroke-dashoffset:-${dashLen*2}}}\n.a-rot{transform-origin:center;animation:a_rot ${rotDur||1}s linear infinite}\n.a-pulse{transform-origin:center;animation:a_pulse ${pulseDur||2}s ease-in-out infinite}\n.a-dash path{stroke-dasharray:${dashLen};animation:a_dash ${dashDur||2}s linear infinite}\n</style>`;
  }
  function svgMarkup(_paths: ExtractedPath[], _viewBox: string, withAnim = true) {
    const classes = [anim.rotate>0?'a-rot':'', anim.pulse>0?'a-pulse':'', anim.dash>0?'a-dash':''].filter(Boolean).join(' ');
    // Group by groupId
    const grouped: Record<string, ExtractedPath[]> = {};
    const ungrouped: ExtractedPath[] = [];
    _paths.filter(p => p.visible !== false).forEach((p) => {
      if (p.groupId) {
        (grouped[p.groupId] ||= []).push(p);
      } else {
        ungrouped.push(p);
      }
    });
    const pathTag = (p: ExtractedPath) => {
      const tr: string[] = [];
      if (typeof p.tX === 'number' || typeof p.tY === 'number') tr.push(`translate(${p.tX||0} ${p.tY||0})`);
      if (typeof p.rot === 'number' && p.rot) tr.push(`rotate(${p.rot})`);
      if (typeof p.scl === 'number' && p.scl && p.scl !== 1) tr.push(`scale(${p.scl})`);
      const attrs = [
        `d=\"${p.d}\"`,
        p.fill ? `fill=\"${p.fill}\"` : '',
        p.stroke ? `stroke=\"${p.stroke}\"` : '',
        p.strokeWidth ? `stroke-width=\"${p.strokeWidth}\"` : '',
        p.opacity ? `opacity=\"${p.opacity}\"` : '',
        tr.length ? `transform=\"${tr.join(' ')}\"` : '',
      ].filter(Boolean).join(' ');
      return `<path ${attrs}/>`;
    };
    const groupBlocks = Object.entries(grouped).map(([gid, arr]) => {
      const body = arr.map(pathTag).join('\\n');
      return `<g id=\"${gid}\">\n${body}\n</g>`;
    }).join('\\n');
    const items = ungrouped.map(pathTag).join('\\n');
    return `<svg viewBox=\"${_viewBox}\" xmlns=\"http://www.w3.org/2000/svg\">${withAnim?animStyle(anim):''}\n<g class=\"${classes}\">\n${groupBlocks}\n${items}\n</g>\n</svg>`;
  }
  function recomputeSVGContent(_paths: ExtractedPath[], _viewBox: string) {
    return `<!doctype html>\\n<html>\\n<head><meta charset=\"utf-8\"/></head>\\n<body style=\"margin:0;background:${bg}\">\\n${svgMarkup(_paths, _viewBox)}\\n</body>\\n</html>`;
  }

  const previewInner = useMemo(() => {
    const classes = [anim.rotate>0?'a-rot':'', anim.pulse>0?'a-pulse':'', anim.dash>0?'a-dash':''].filter(Boolean).join(' ');
    return (
      <svg viewBox={viewBox} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display:'block' }}>
        <g dangerouslySetInnerHTML={{ __html: animStyle(anim) }} />
        <g className={classes}>
          {paths.filter(p => p.visible !== false).map(p => {
            const tr: string[] = [];
            if (typeof p.tX === 'number' || typeof p.tY === 'number') tr.push(`translate(${p.tX||0} ${p.tY||0})`);
            if (typeof p.rot === 'number' && p.rot) tr.push(`rotate(${p.rot})`);
            if (typeof p.scl === 'number' && p.scl && p.scl !== 1) tr.push(`scale(${p.scl})`);
            return (
              <path key={p.id}
                    d={p.d}
                    transform={tr.join(' ')}
                    fill={p.fill || 'currentColor'}
                    stroke={p.stroke}
                    strokeWidth={p.strokeWidth}
                    opacity={p.opacity}
                    style={{
                      transition:'fill .12s, opacity .12s',
                      outline: selId === p.id ? '2px solid #29f0ff' : undefined,
                      filter: hoverId === p.id ? 'drop-shadow(0 0 6px rgba(41,240,255,.6))' : undefined,
                    }}
              />
            );
          })}
        </g>
      </svg>
    );
  }, [paths, viewBox, hoverId, selId, anim]);

  function exportHTML() {
    const blob = new Blob([recomputeSVGContent(paths, viewBox)], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (fileName || 'svg_export') + '.html'; a.click(); URL.revokeObjectURL(a.href);
  }

  function optimizeNumber(n: string, p: number): string {
    const x = Number(n);
    if (!Number.isFinite(x)) return n;
    const r = Number(x.toFixed(p));
    // Remove trailing zeros and leading zeros for decimals
    let s = String(r);
    if (s.indexOf('.') >= 0) {
      s = s.replace(/\.0+$/, '').replace(/(\.[0-9]*?)0+$/, '$1');
    }
    s = s.replace(/^-0$/, '0');
    return s;
  }
  function optimizeD(d: string, p: number): string {
    // Round all numeric tokens, condense whitespace
    const rounded = d.replace(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi, (m) => optimizeNumber(m, p));
    return rounded.replace(/\s+/g, ' ').replace(/\s?,\s?/g, ',').trim();
  }
  function optimizeAll() {
    const before = paths.reduce((s, p) => s + (p.d?.length || 0), 0);
    const next = paths.map((p) => ({ ...p, d: optimizeD(p.d, precision), strokeWidth: p.strokeWidth ? optimizeNumber(p.strokeWidth, precision) : p.strokeWidth, opacity: p.opacity ? optimizeNumber(p.opacity, Math.min(2, precision)) : p.opacity }));
    const after = next.reduce((s, p) => s + (p.d?.length || 0), 0);
    setPaths(next);
    setOptStats({ before, after });
  }
  function exportSVG() {
    const blob = new Blob([svgMarkup(paths, viewBox)], { type: 'image/svg+xml;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (fileName || 'image') + '.svg'; a.click(); URL.revokeObjectURL(a.href);
  }
  async function loadErrlFace() {
    try {
      const res = await fetch('/portal/assets/L4_Central/errl-face-2.svg');
      if (!res.ok) return;
      const txt = await res.text();
      await parseSVG(txt);
      setFileName('errl-face-2.svg');
    } catch {}
  }

  async function ensurePaper(): Promise<void> {
    const g: any = window as any;
    if (g.paper && g.paper.Path) return;
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/paper@0.12.17/dist/paper-full.min.js';
      s.onload = () => resolve();
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function performBoolean(op: 'unite'|'intersect'|'subtract') {
    if (selectedIds.length < 2) return;
    await ensurePaper();
    const g: any = window as any;
    const paper: any = g.paper;
    const scope = new paper.PaperScope();
    const canvas = document.createElement('canvas');
    scope.setup(canvas);

    const selected = paths.filter(p => selectedIds.includes(p.id));
    const indices = selectedIds.map(id => paths.findIndex(p => p.id === id)).filter(i => i >= 0);
    if (selected.length < 2) return;

    function toItem(p: ExtractedPath) {
      const item = new scope.CompoundPath({ pathData: p.d });
      if (typeof p.tX === 'number' || typeof p.tY === 'number') item.translate(new scope.Point(p.tX||0, p.tY||0));
      if (typeof p.rot === 'number' && p.rot) item.rotate(p.rot);
      if (typeof p.scl === 'number' && p.scl && p.scl !== 1) item.scale(p.scl);
      return item;
    }

    let acc = toItem(selected[0]);
    for (let i = 1; i < selected.length; i++) {
      const b = toItem(selected[i]);
      let res;
      if (op === 'unite') res = acc.unite(b);
      else if (op === 'intersect') res = acc.intersect(b);
      else res = acc.subtract(b);
      acc.remove(); b.remove();
      acc = res;
    }
    acc.reduce && acc.reduce();
    const svgStr: string = acc.exportSVG({ asString: true });
    const m = svgStr.match(/d=\"([^\"]+)\"/);
    const d = m ? m[1] : '';
    acc.remove();

    if (!d) return;
    const base = selected[0];
    const firstIndex = Math.min(...indices);
    const newPath: ExtractedPath = {
      id: `bool_${Date.now()}`,
      name: `${op}_result`,
      d,
      fill: base.fill,
      stroke: base.stroke,
      strokeWidth: base.strokeWidth,
      opacity: base.opacity,
      visible: true,
    };

    setPaths(ps => {
      const next = ps.slice();
      // remove all selected
      for (const id of selectedIds) {
        const idx = next.findIndex(x => x.id === id);
        if (idx >= 0) next.splice(idx, 1);
      }
      next.splice(firstIndex, 0, newPath);
      return next;
    });
    setSelectedIds([]);
  }

  function toggleVisible(id: string) { setPaths(ps => ps.map(p => p.id === id ? { ...p, visible: p.visible === false ? true : false } : p)); }
  function removePath(id: string) { setPaths(ps => ps.filter(p => p.id !== id)); }
  function copyD(d: string) { navigator.clipboard.writeText(d); }
  function resetSelection() { setSelectedIds([]); setSelId(null); setHoverId(null); }
  function clearCompareB() { setBPaths(null); setBViewBox('0 0 512 512'); }

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-3 p-3">
      <div className="relative border border-white/10 rounded-md bg-black/20" style={{background:bg}}>
        <div className="absolute top-2 left-2 flex items-center gap-2">
          <label className="text-xs opacity-80">BG</label>
          <input type="color" value={bg} onChange={(e)=> setBg(e.target.value)} />
        </div>
        <div className="w-full h-full min-h-[360px]">{previewInner}</div>
      </div>

      <div className="space-y-3">
        <Tabs defaultValue="edit">
          <div className="px-1">
            <TabsList className="bg-black/30 border border-white/10">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="animate">Animate</TabsTrigger>
              <TabsTrigger value="compare">Compare</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="edit">
            <Card className="bg-black/30 border-white/10">
              <CardHeader className="py-2"><CardTitle className="text-sm">Import</CardTitle></CardHeader>
              <CardContent className="pt-2 space-y-2">
                <Input ref={fileInputRef as any} type="file" accept=".svg,image/svg+xml" onChange={(e) => e.target.files && onUpload(e.target.files)} />
                <div className="text-xs text-zinc-400">Upload an SVG; we’ll extract path elements for editing.</div>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-white/10">
              <CardHeader className="py-2"><CardTitle className="text-sm">Paths ({paths.length})</CardTitle></CardHeader>
              <CardContent className="pt-2">
            {paths.length === 0 ? (
              <div className="text-xs text-zinc-400">No paths yet.</div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2 text-xs">
                  <label>Precision</label>
                  <input type="number" className="w-16 bg-black/20 border border-white/10 rounded px-1" min={0} max={6} step={1} value={precision} onChange={(e)=> setPrecision(Math.max(0, Math.min(6, Number(e.target.value))))} />
                  <Button size="sm" variant="outline" onClick={optimizeAll}>Optimize</Button>
                  <Button size="sm" variant="outline" onClick={() => performBoolean('unite')}>Unite</Button>
                  <Button size="sm" variant="outline" onClick={() => performBoolean('intersect')}>Intersect</Button>
                  <Button size="sm" variant="outline" onClick={() => performBoolean('subtract')}>Subtract</Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    if (selectedIds.length < 2) return;
                    const gid = `group_${Date.now()}`;
                    setPaths(ps => ps.map(x => selectedIds.includes(x.id) ? { ...x, groupId: gid } : x));
                  }}>Group</Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    if (selectedIds.length === 0) return;
                    setPaths(ps => ps.map(x => selectedIds.includes(x.id) ? { ...x, groupId: undefined } : x));
                  }}>Ungroup</Button>
                  <Button size="sm" variant="outline" onClick={resetSelection}>Reset Selection</Button>
                  {optStats && (
                    <span className="opacity-80">{optStats.before} → {optStats.after} chars ({Math.round((1 - optStats.after/Math.max(1,optStats.before))*100)}%)</span>
                  )}
                </div>
                <ScrollArea className="max-h-72 pr-1">
                  <div className="space-y-1">
                  {paths.map((p, idx) => (
                    <div key={p.id}
                         draggable
                         onDragStart={() => { dragIndexRef.current = idx; }}
                         onDragOver={(e) => { e.preventDefault(); }}
                         onDrop={(e) => {
                           e.preventDefault();
                           const from = dragIndexRef.current; const to = idx;
                           if (from == null || to == null || from === to) return;
                           const next = paths.slice();
                           const [m] = next.splice(from, 1);
                           next.splice(to, 0, m);
                           dragIndexRef.current = null;
                           setPaths(next);
                         }}
                         onMouseEnter={() => setHoverId(p.id)}
                         onMouseLeave={() => setHoverId(null)}
                         onClick={() => setSelId(p.id)}
                         className={"flex items-center gap-2 border rounded px-2 py-1 text-xs cursor-move " + (selId===p.id? 'border-cyan-400/50 bg-cyan-400/10' : 'border-white/10 bg-white/5')}
                    >
                      <input type="checkbox" className="h-4 w-4" checked={selectedIds.includes(p.id)} onChange={(e)=> {
                        setSelectedIds((prev) => e.target.checked ? [...new Set([...prev, p.id])] : prev.filter(id => id !== p.id));
                      }} title="Select"/>
                      <button className="h-6 w-6 inline-flex items-center justify-center border border-white/20 rounded"
                              onClick={(e)=> { e.stopPropagation(); toggleVisible(p.id); }}
                              title="Toggle visibility"
                      >
                        {p.visible === false ? <EyeOff className="h-3.5 w-3.5"/> : <Eye className="h-3.5 w-3.5"/>}
                      </button>
                      <div className="flex-1 truncate" title={p.name}>{p.name}</div>
                      <input type="color" value={p.fill || '#ffffff'} onChange={(e)=> setPaths(ps => ps.map(x => x.id===p.id ? { ...x, fill: e.target.value } : x))} title="Fill"/>
                      <input type="color" value={p.stroke || '#000000'} onChange={(e)=> setPaths(ps => ps.map(x => x.id===p.id ? { ...x, stroke: e.target.value } : x))} title="Stroke"/>
                      <input type="number" step="0.5" min="0" value={Number(p.strokeWidth || 0)} onChange={(e)=> setPaths(ps => ps.map(x => x.id===p.id ? { ...x, strokeWidth: String(e.target.value) } : x))} title="Stroke width" className="w-14 bg-black/20 border border-white/10 rounded px-1"/>
                      <input type="range" min="0" max="1" step="0.05" value={Number(p.opacity || 1)} onChange={(e)=> setPaths(ps => ps.map(x => x.id===p.id ? { ...x, opacity: String(e.target.value) } : x))} title="Opacity"/>
                      <input type="number" step="1" className="w-16 bg-black/20 border border-white/10 rounded px-1" value={p.tX ?? 0} onChange={(e)=> setPaths(ps => ps.map(x => x.id===p.id ? { ...x, tX: Number(e.target.value) } : x))} title="Translate X"/>
                      <input type="number" step="1" className="w-16 bg-black/20 border border-white/10 rounded px-1" value={p.tY ?? 0} onChange={(e)=> setPaths(ps => ps.map(x => x.id===p.id ? { ...x, tY: Number(e.target.value) } : x))} title="Translate Y"/>
                      <input type="number" step="1" className="w-16 bg-black/20 border border-white/10 rounded px-1" value={p.rot ?? 0} onChange={(e)=> setPaths(ps => ps.map(x => x.id===p.id ? { ...x, rot: Number(e.target.value) } : x))} title="Rotate (deg)"/>
                      <input type="number" step="0.05" className="w-16 bg-black/20 border border-white/10 rounded px-1" value={p.scl ?? 1} onChange={(e)=> setPaths(ps => ps.map(x => x.id===p.id ? { ...x, scl: Number(e.target.value) } : x))} title="Scale"/>
                      <Button variant="outline" size="icon" title="Copy d" onClick={(e)=> { e.stopPropagation(); copyD(p.d); }}><Copy className="h-3.5 w-3.5"/></Button>
                      <Button variant="destructive" size="icon" title="Remove" onClick={(e)=> { e.stopPropagation(); removePath(p.id); }}><Trash2 className="h-3.5 w-3.5"/></Button>
                    </div>
                  ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </CardContent>
            </Card>

            <Card className="bg-black/30 border-white/10">
              <CardHeader className="py-2"><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
              <CardContent className="pt-2 space-y-2">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadErrlFace}>Load Errl Face</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-white/10">
              <CardHeader className="py-2"><CardTitle className="text-sm">Export</CardTitle></CardHeader>
              <CardContent className="pt-2 space-y-2">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportSVG}><Download className="h-4 w-4 mr-1"/>Export SVG</Button>
                  <Button variant="outline" size="sm" onClick={exportHTML}><Download className="h-4 w-4 mr-1"/>Export HTML</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="animate">
            <Card className="bg-black/30 border-white/10">
              <CardHeader className="py-2"><CardTitle className="text-sm">Animation</CardTitle></CardHeader>
              <CardContent className="pt-2 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <label className="w-24">Rotate (deg/s)</label>
                  <input type="number" className="w-20 bg-black/20 border border-white/10 rounded px-1" value={anim.rotate} onChange={(e)=> setAnim(a => ({...a, rotate: Math.max(0, Number(e.target.value))}))} />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-24">Pulse (scale)</label>
                  <input type="range" min={0} max={0.5} step={0.01} value={anim.pulse} onChange={(e)=> setAnim(a => ({...a, pulse: Number(e.target.value)}))} />
                  <span>{anim.pulse.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-24">Dash speed</label>
                  <input type="range" min={0} max={20} step={0.5} value={anim.dash} onChange={(e)=> setAnim(a => ({...a, dash: Number(e.target.value)}))} />
                  <span>{anim.dash.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-24">Dash length</label>
                  <input type="number" className="w-20 bg-black/20 border border-white/10 rounded px-1" min={1} max={64} step={1} value={anim.dashLen} onChange={(e)=> setAnim(a => ({...a, dashLen: Math.max(1, Number(e.target.value))}))} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compare">
            <Card className="bg-black/30 border-white/10">
              <CardHeader className="py-2"><CardTitle className="text-sm">Compare A/B</CardTitle></CardHeader>
              <CardContent className="pt-2 space-y-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <Input type="file" accept=".svg,image/svg+xml" onChange={(e)=> e.target.files && onUpload(e.target.files)} />
                  <span>vs</span>
                  <Input type="file" accept=".svg,image/svg+xml" onChange={(e)=> {
                    if (!e.target.files) return; const f = e.target.files[0]; const r = new FileReader();
                    r.onload = () => { const txt = String(r.result||''); (async()=>{ const parser = new DOMParser(); const doc = parser.parseFromString(txt, 'image/svg+xml'); const svgEl = doc.querySelector('svg'); if (!svgEl) return; const vb = svgEl.getAttribute('viewBox') || `${svgEl.getAttribute('x')||0} ${svgEl.getAttribute('y')||0} ${svgEl.getAttribute('width')||512} ${svgEl.getAttribute('height')||512}`; setBViewBox(vb); const list: ExtractedPath[] = []; svgEl.querySelectorAll('path,rect,circle,ellipse,line,polyline,polygon').forEach((el, idx)=>{ const d = elToPath(el); if (!d) return; list.push({ id: el.getAttribute('id') || `${el.tagName.toLowerCase()}_${idx}`, name: el.getAttribute('id') || `${el.tagName.toLowerCase()} ${idx+1}`, d, fill: el.getAttribute('fill') || undefined, stroke: el.getAttribute('stroke') || undefined, strokeWidth: el.getAttribute('stroke-width') || undefined, opacity: el.getAttribute('opacity') || undefined, visible: true }); }); setBPaths(list); })(); };
                    r.readAsText(f);
                  }} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setHideA(true)} disabled={hideA}>Clear A</Button>
                  <Button variant="outline" size="sm" onClick={() => setHideA(false)} disabled={!hideA}>Restore A</Button>
                  <Button variant="outline" size="sm" onClick={clearCompareB} disabled={!bPaths || (bPaths?.length||0)===0}>Clear B</Button>
                  <Button variant="outline" size="sm" onClick={() => { setHideA(true); clearCompareB(); }}>Clear Both</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="border border-white/10 rounded overflow-hidden">
                    <div className="px-2 py-1 border-b border-white/10">A</div>
                    <div className="min-h-[220px]" style={{background:bg}}>
                      {hideA ? (
                        <div className="h-full min-h-[220px] grid place-items-center text-zinc-400">A cleared</div>
                      ) : (
                        <svg viewBox={viewBox} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display:'block' }}>
                          {paths.filter(p => p.visible !== false).map(p => (
                            <path key={p.id} d={p.d} fill={p.fill || 'currentColor'} stroke={p.stroke} strokeWidth={p.strokeWidth} opacity={p.opacity} />
                          ))}
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="border border-white/10 rounded overflow-hidden">
                    <div className="px-2 py-1 border-b border-white/10">B</div>
                    <div className="min-h-[220px]" style={{background:bg}}>
                      <svg viewBox={bViewBox} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display:'block' }}>
                        {(bPaths||[]).filter(p => p.visible !== false).map(p => (
                          <path key={p.id} d={p.d} fill={p.fill || 'currentColor'} stroke={p.stroke} strokeWidth={p.strokeWidth} opacity={p.opacity} />
                        ))}
                      </svg>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
