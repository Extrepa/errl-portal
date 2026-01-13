import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, Eye, EyeOff, Trash2, Lock, Unlock, Files, ChevronDown, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

// === Errl Anatomy 9-pack IDs (template-based mode B) ===
const ANATOMY_IDS = [
  'region-body',
  'region-face',
  'region-eyeL',
  'region-eyeR',
  'region-mouth',
  'leftArm',
  'leftLeg',
  'rightArm',
  'rightLeg',
];
const HOLE_IDS = ['region-eyeL', 'region-eyeR', 'region-mouth'];

export type ExtractedPath = {
  id: string;
  name: string;
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  opacity?: string;
  visible?: boolean;
  locked?: boolean;
  tX?: number;
  tY?: number;
  rot?: number;
  scl?: number;
  groupId?: string;
  parentChainIds?: string[]; // ancestor group ids for anatomy mapping
};

export function SVGTab() {
  const baseUrl = ((import.meta as any)?.env?.BASE_URL as string | undefined) ?? '/';
  const [fileName, setFileName] = useState<string>('');
  const [viewBox, setViewBox] = useState<string>('0 0 512 512');
  const [paths, setPaths] = useState<ExtractedPath[]>([]);
  const [bg, setBg] = useState<string>('#111111');
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selId, setSelId] = useState<string | null>(null);
  const [precision, setPrecision] = useState<number>(2);
  const [optStats, setOptStats] = useState<{ before: number; after: number } | null>(null);

  // === Phase 1: State additions ===
  // Snapshots for Reset to Upload
  const initialPathsRef = useRef<ExtractedPath[] | null>(null);
  const initialViewBoxRef = useRef<string | null>(null);
  const initialFileNameRef = useRef<string | null>(null);

  // Preview zoom and pan state
  const [previewScale, setPreviewScale] = useState<number>(1);
  const [previewOffsetX, setPreviewOffsetX] = useState<number>(0);
  const [previewOffsetY, setPreviewOffsetY] = useState<number>(0);
  const isPanningRef = useRef<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  // === Phase 2: Path list enhancements state ===
  const [listMode, setListMode] = useState<'layers' | 'colorGroups'>('layers');
  const [groupByStroke, setGroupByStroke] = useState<boolean>(false);
  const [expandedColorKeys, setExpandedColorKeys] = useState<Set<string>>(new Set());
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());
  const [hoveredGroupKey, setHoveredGroupKey] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // === Phase 3: Export options state ===
  const [exportIncludeHidden, setExportIncludeHidden] = useState<boolean>(false);
  const [exportPrefix, setExportPrefix] = useState<string>('errl');
  const [outlineStrokeWidth, setOutlineStrokeWidth] = useState<number>(2);
  const [outlineStrokeColor, setOutlineStrokeColor] = useState<string>('inherit');

  // === Phase 4: Export options state ===
  const [silhouetteFillHoles, setSilhouetteFillHoles] = useState<boolean>(false);
  const defaultAnim = {
    rotate: 0,
    pulse: 0,
    dash: 0,
    dashLen: 8,
    sway: 0,
    yoyo: 0,
    flash: 0,
    hue: 0,
    glow: 0,
  };
  const [anim, setAnim] = useState<
    typeof defaultAnim & {
      label?: string;
    }
  >({
    ...defaultAnim,
    label: 'Custom',
  });
  const [bPaths, setBPaths] = useState<ExtractedPath[] | null>(null);
  const [bViewBox, setBViewBox] = useState<string>('0 0 512 512');
  const [hideA, setHideA] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const dragIndexRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  type QuickAction = {
    id: string;
    label: string;
    description: string;
    run: () => void;
    disabled?: () => boolean;
  };

  const activeSelectionIds = selectedIds.length ? selectedIds : paths.map((p) => p.id);
  const selectedPaths = paths.filter((p) => activeSelectionIds.includes(p.id));

  const quickActions: QuickAction[] = [
    {
      id: 'outline',
      label: 'Stroke → Fill',
      description: 'Convert stroke colour into fill and clear the stroke on the current selection.',
      run: () => {
        if (!selectedPaths.length) return;
        setPaths((ps) =>
          ps.map((p) => {
            if (!activeSelectionIds.includes(p.id) || !p.stroke) return p;
            return { ...p, fill: p.stroke, stroke: undefined };
          }),
        );
      },
      disabled: () => selectedPaths.length === 0 || !selectedPaths.some((p) => p.stroke),
    },
    {
      id: 'dup_mirror',
      label: 'Duplicate + Mirror',
      description: 'Duplicate the selected paths and mirror them across the origin.',
      run: () => {
        if (!selectedPaths.length) return;
        const timestamp = Date.now();
        const dupes = selectedPaths.map((p, idx) => ({
          ...p,
          id: `mirror_${timestamp}_${idx}`,
          name: `${p.name} mirror`,
          scl: typeof p.scl === 'number' ? p.scl * -1 : -1,
        }));
        setPaths((ps) => [...ps, ...dupes]);
      },
      disabled: () => selectedPaths.length === 0,
    },
    {
      id: 'reset_transforms',
      label: 'Reset Transforms',
      description: 'Clear translate/rotate/scale transforms on the current selection.',
      run: () => {
        if (!selectedPaths.length) return;
        setPaths((ps) =>
          ps.map((p) =>
            activeSelectionIds.includes(p.id)
              ? { ...p, tX: 0, tY: 0, rot: 0, scl: 1 }
              : p,
          ),
        );
      },
      disabled: () =>
        selectedPaths.length === 0 ||
        !selectedPaths.some((p) => (p.tX || p.tY || p.rot || (p.scl ?? 1) !== 1)),
    },
    {
      id: 'copy_viewbox',
      label: 'Copy ViewBox',
      description: 'Copy the current viewBox value to your clipboard.',
      run: () => navigator.clipboard.writeText(viewBox),
    },
  ];

  const builtinAssets: Array<{ id: string; label: string; path: string; description: string }> = [
    { id: 'errl-face', label: 'Errl Face', path: 'assets/portal/L4_Central/errl-face-2.svg', description: 'Iconic Errl lineup portrait.' },
    { id: 'errl-body', label: 'Errl Body', path: 'assets/portal/L4_Central/errl-body-with-limbs.svg', description: 'Full Errl silhouette with limbs.' },
    { id: 'errl-all-limbs', label: 'Errl Limbs', path: 'assets/portal/L4_Central/errl_all_limbs.svg', description: 'Bundle of vector limbs for assembly.' },
  ];

  type AnimationPreset = {
    label: string;
    description: string;
    values: Partial<typeof defaultAnim>;
  };

  const animationPresets: AnimationPreset[] = [
    { label: 'Idle', description: 'Static artwork with no animation.', values: {} },
    { label: 'Orbit', description: 'Slow rotation loop (45° per second).', values: { rotate: 45 } },
    { label: 'Glow Pulse', description: 'Gentle scale pulse with a light glow.', values: { pulse: 0.08, glow: 10 } },
    { label: 'Dash Runner', description: 'Animated stroke dashes for outlines.', values: { dash: 12, dashLen: 6 } },
    { label: 'Orbit + Pulse', description: 'Combined rotation with a breathing pulse.', values: { rotate: 60, pulse: 0.12 } },
    { label: 'Heartbeat', description: 'Punchy pulse with opacity flash.', values: { pulse: 0.22, flash: 0.4 } },
    { label: 'Neon Drift', description: 'Slow sway, hue rotation, and glow.', values: { sway: 8, hue: 160, glow: 14 } },
    { label: 'Float', description: 'Vertical bobbing with micro pulse.', values: { yoyo: 24, pulse: 0.05 } },
    { label: 'Scanner', description: 'Rapid dash scan with hue flicker.', values: { dash: 18, dashLen: 4, hue: 240 } },
    { label: 'Spark Orbit', description: 'Fast spin with flicker and glow.', values: { rotate: 120, flash: 0.25, glow: 18 } },
  ];

  const sliderHelp: Record<string, string> = {
    precision: 'Rounding precision for path coordinates when optimizing.',
    rotate: 'Rotation speed in degrees per second. Set to 0 to disable.',
    pulse: 'Scale multiplier for a breathing pulse animation. 0 disables the effect.',
    dashSpeed: 'Controls how quickly the stroke dash offset animates. 0 disables dash animation.',
    dashLength: 'The length of stroke dash segments when dash animation is active.',
    sway: 'Oscillating tilt in degrees, layered on top of rotation.',
    yoyo: 'Vertical drift amount in pixels for floating effects.',
    flash: 'Amount of opacity flicker (1.0 fully invisible at midpoint).',
    hue: 'Hue rotation in degrees for colour cycling.',
    glow: 'Drop-shadow glow strength (pixels).',
  };

  function applyAnimationPreset(preset: AnimationPreset) {
    setAnim({
      ...defaultAnim,
      ...preset.values,
      dashLen: preset.values.dashLen ?? defaultAnim.dashLen,
      label: preset.label,
    });
  }

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
    
    // Helper to collect parent group ids for anatomy mapping
    function getParentChainIds(el: Element): string[] {
      const chain: string[] = [];
      let current: Element | null = el.parentElement;
      while (current && current !== svgEl) {
        const id = current.getAttribute('id');
        if (id) chain.push(id);
        current = current.parentElement;
      }
      return chain;
    }

    const list: ExtractedPath[] = [];
    const els = svgEl.querySelectorAll('path,rect,circle,ellipse,line,polyline,polygon');
    els.forEach((el, idx) => {
      const d = elToPath(el); if (!d) return;
      list.push({
        id: (el.getAttribute('id') || `${el.tagName.toLowerCase()}_${idx}`),
        name:
          el.getAttribute('data-name') ||
          el.getAttribute('name') ||
          el.getAttribute('id') ||
          `${el.tagName.toLowerCase()} ${idx + 1}`,
        d,
        fill: el.getAttribute('fill') || undefined,
        stroke: el.getAttribute('stroke') || undefined,
        strokeWidth: el.getAttribute('stroke-width') || undefined,
        opacity: el.getAttribute('opacity') || undefined,
        visible: true,
        locked: false,
        parentChainIds: getParentChainIds(el),
      });
    });
    setPaths(list);

    // Phase 1: Snapshot initial state for Reset
    initialPathsRef.current = JSON.parse(JSON.stringify(list));
    initialViewBoxRef.current = vb;
    initialFileNameRef.current = fileName || 'untitled.svg';

    // Compute initial fit-to-view
    computeFitToView(list, vb);
  }

  function animStyle(_anim: typeof anim) {
    const dashLen = Math.max(1, _anim.dashLen || 8);
    return `
<style>
@keyframes a_rot{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes a_pulse{0%,100%{transform:scale(1)}50%{transform:scale(var(--errl-pulse-scale,1.08))}}
@keyframes a_sway{0%,100%{transform:rotate(calc(var(--errl-sway-angle,0deg)*-1))}50%{transform:rotate(var(--errl-sway-angle,0deg))}}
@keyframes a_yoyo{0%,100%{transform:translateY(calc(var(--errl-yoyo-distance,0px)*-1))}50%{transform:translateY(var(--errl-yoyo-distance,0px))}}
@keyframes a_dash{to{stroke-dashoffset:calc(-2*var(--errl-dash-length,${dashLen}))}}
@keyframes a_flash{0%,100%{opacity:1}50%{opacity:var(--errl-flash-opacity,0.55)}}
@keyframes a_filter{
  0%,100%{filter:hue-rotate(0deg) drop-shadow(0 0 var(--errl-glow-min,0px) rgba(255,255,255,0))}
  50%{filter:hue-rotate(var(--errl-hue-range,0deg)) drop-shadow(0 0 var(--errl-glow-max,0px) rgba(255,255,255,0.75))}
}
.a-rot{transform-box:fill-box;transform-origin:center;animation:a_rot var(--errl-rot-duration,4s) linear infinite;}
.a-pulse{transform-box:fill-box;transform-origin:center;animation:a_pulse var(--errl-pulse-duration,2s) ease-in-out infinite;}
.a-sway{transform-box:fill-box;transform-origin:center;animation:a_sway var(--errl-sway-duration,2.8s) ease-in-out infinite;}
.a-yoyo{transform-box:fill-box;transform-origin:center;animation:a_yoyo var(--errl-yoyo-duration,3s) ease-in-out infinite;}
.a-flash{animation:a_flash var(--errl-flash-duration,1.2s) ease-in-out infinite;}
.a-filter{animation:a_filter var(--errl-filter-duration,3.2s) ease-in-out infinite;}
.a-dash path{stroke-dasharray:var(--errl-dash-length,${dashLen});animation:a_dash var(--errl-dash-duration,2.4s) linear infinite;}
</style>`;
  }
  function svgMarkup(_paths: ExtractedPath[], _viewBox: string, withAnim = true) {
    const dashLen = Math.max(1, anim.dashLen || 8);
    const rotDur = anim.rotate > 0 ? 360 / anim.rotate : 0;
    const dashDur = anim.dash > 0 ? 20 / anim.dash : 0;
    const wrappers: Array<{ className: string; style: Record<string, string> }> = [];
    if (anim.rotate > 0) {
      wrappers.push({ className: 'a-rot', style: { '--errl-rot-duration': `${rotDur || 4}s` } });
    }
    if (anim.sway > 0) {
      wrappers.push({
        className: 'a-sway',
        style: {
          '--errl-sway-duration': '2.8s',
          '--errl-sway-angle': `${anim.sway}deg`,
        },
      });
    }
    if (anim.pulse > 0) {
      wrappers.push({
        className: 'a-pulse',
        style: {
          '--errl-pulse-duration': '2s',
          '--errl-pulse-scale': `${1 + anim.pulse}`,
        },
      });
    }
    if (anim.yoyo > 0) {
      wrappers.push({
        className: 'a-yoyo',
        style: {
          '--errl-yoyo-duration': '3s',
          '--errl-yoyo-distance': `${anim.yoyo}px`,
        },
      });
    }
    if (anim.flash > 0) {
      wrappers.push({
        className: 'a-flash',
        style: {
          '--errl-flash-duration': '1.2s',
          '--errl-flash-opacity': `${Math.max(0, 1 - anim.flash)}`,
        },
      });
    }
    if (anim.hue > 0 || anim.glow > 0) {
      wrappers.push({
        className: 'a-filter',
        style: {
          '--errl-filter-duration': '3.2s',
          '--errl-hue-range': `${anim.hue}deg`,
          '--errl-glow-max': `${anim.glow}px`,
          '--errl-glow-min': '0px',
        },
      });
    }
    if (anim.dash > 0) {
      wrappers.push({
        className: 'a-dash',
        style: {
          '--errl-dash-duration': `${dashDur || 2.4}s`,
          '--errl-dash-length': `${dashLen}`,
        },
      });
    }
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
    let inner = `<g>\n${groupBlocks}\n${items}\n</g>`;
    if (withAnim) {
      wrappers.forEach(({ className, style }) => {
        const styleAttr = Object.entries(style)
          .map(([k, v]) => `${k}:${v}`)
          .join(';');
        inner = `<g class=\"${className}\" style=\"${styleAttr}\">\n${inner}\n</g>`;
      });
    }
    return `<svg viewBox=\"${_viewBox}\" xmlns=\"http://www.w3.org/2000/svg\">${withAnim ? animStyle(anim) : ''}\n${inner}\n</svg>`;
  }
  function recomputeSVGContent(_paths: ExtractedPath[], _viewBox: string) {
    return `<!doctype html>\\n<html>\\n<head><meta charset=\"utf-8\"/></head>\\n<body style=\"margin:0;background:${bg}\">\\n${svgMarkup(_paths, _viewBox)}\\n</body>\\n</html>`;
  }

  // === Phase 2: Color normalization and grouping (must come before previewInner) ===
  function normalizeColor(c: string | undefined): string {
    if (!c || c === 'none' || c === 'transparent') return 'none';
    // Simple hex normalization (basic implementation)
    const lc = c.toLowerCase().trim();
    if (lc.startsWith('#')) return lc;
    // Handle rgb/rgba (basic parse)
    const rgbMatch = lc.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10);
      const g = parseInt(rgbMatch[2], 10);
      const b = parseInt(rgbMatch[3], 10);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    return lc;
  }

  const colorGroups = useMemo(() => {
    const groups: Record<string, ExtractedPath[]> = {};
    paths.forEach((p) => {
      const key = normalizeColor(groupByStroke ? p.stroke : p.fill);
      (groups[key] ||= []).push(p);
    });
    return groups;
  }, [paths, groupByStroke]);

  const previewInner = useMemo(() => {
    const dashLen = Math.max(1, anim.dashLen || 8);
    const rotDur = anim.rotate > 0 ? 360 / anim.rotate : 0;
    const dashDur = anim.dash > 0 ? 20 / anim.dash : 0;

    const wrappers: Array<{ className: string; style: React.CSSProperties }> = [];
    const withVars = (vars: Record<string, string>): React.CSSProperties =>
      vars as unknown as React.CSSProperties;

    // Phase 1: Apply preview transform (scale and pan)
    const transformStyle = `translate(${previewOffsetX}px, ${previewOffsetY}px) scale(${previewScale})`;

    if (anim.rotate > 0) {
      wrappers.push({ className: 'a-rot', style: withVars({ '--errl-rot-duration': `${rotDur || 4}s` }) });
    }
    if (anim.sway > 0) {
      wrappers.push({
        className: 'a-sway',
        style: withVars({
          '--errl-sway-duration': '2.8s',
          '--errl-sway-angle': `${anim.sway}deg`,
        }),
      });
    }
    if (anim.pulse > 0) {
      wrappers.push({
        className: 'a-pulse',
        style: withVars({
          '--errl-pulse-duration': '2s',
          '--errl-pulse-scale': `${1 + anim.pulse}`,
        }),
      });
    }
    if (anim.yoyo > 0) {
      wrappers.push({
        className: 'a-yoyo',
        style: withVars({
          '--errl-yoyo-duration': '3s',
          '--errl-yoyo-distance': `${anim.yoyo}px`,
        }),
      });
    }
    if (anim.flash > 0) {
      wrappers.push({
        className: 'a-flash',
        style: withVars({
          '--errl-flash-duration': '1.2s',
          '--errl-flash-opacity': `${Math.max(0, 1 - anim.flash)}`,
        }),
      });
    }
    if (anim.hue > 0 || anim.glow > 0) {
      wrappers.push({
        className: 'a-filter',
        style: withVars({
          '--errl-filter-duration': '3.2s',
          '--errl-hue-range': `${anim.hue}deg`,
          '--errl-glow-max': `${anim.glow}px`,
          '--errl-glow-min': '0px',
        }),
      });
    }
    if (anim.dash > 0) {
      wrappers.push({
        className: 'a-dash',
        style: withVars({
          '--errl-dash-duration': `${dashDur || 2.4}s`,
          '--errl-dash-length': `${dashLen}`,
        }),
      });
    }

    const grouped: Record<string, ExtractedPath[]> = {};
    const ungrouped: ExtractedPath[] = [];
    paths
      .filter((p) => p.visible !== false)
      .forEach((p) => {
        if (p.groupId) {
          (grouped[p.groupId] ||= []).push(p);
        } else {
          ungrouped.push(p);
        }
      });

    const renderPath = (p: ExtractedPath) => {
      const tr: string[] = [];
      if (typeof p.tX === 'number' || typeof p.tY === 'number') tr.push(`translate(${p.tX || 0} ${p.tY || 0})`);
      if (typeof p.rot === 'number' && p.rot) tr.push(`rotate(${p.rot})`);
      if (typeof p.scl === 'number' && p.scl && p.scl !== 1) tr.push(`scale(${p.scl})`);
      return (
        <path
          key={p.id}
          d={p.d}
          transform={tr.join(' ')}
          fill={p.fill || 'currentColor'}
          stroke={p.stroke}
          strokeWidth={p.strokeWidth}
          opacity={p.opacity}
          style={{
            transition: 'fill .12s, opacity .12s',
            outline: selId === p.id ? '2px solid #29f0ff' : undefined,
            filter: hoverId === p.id ? 'drop-shadow(0 0 6px rgba(41,240,255,.6))' : undefined,
          }}
        />
      );
    };

    const baseContent = (
      <g>
        {Object.entries(grouped).map(([gid, arr]) => (
          <g key={gid} id={gid}>
            {arr.map(renderPath)}
          </g>
        ))}
        {ungrouped.map(renderPath)}
      </g>
    );

    const animatedContent = wrappers.reduceRight(
      (child, wrapper, idx) => (
        <g key={`${wrapper.className}-${idx}`} className={wrapper.className} style={wrapper.style}>
          {child}
        </g>
      ),
      baseContent,
    );

    // Phase 2: Render hover overlay for color groups
    const groupHoverOverlay = hoveredGroupKey && colorGroups[hoveredGroupKey] ? (
      <g>
        {colorGroups[hoveredGroupKey].filter((p) => p.visible !== false).map((p) => {
          const tr: string[] = [];
          if (typeof p.tX === 'number' || typeof p.tY === 'number') tr.push(`translate(${p.tX || 0} ${p.tY || 0})`);
          if (typeof p.rot === 'number' && p.rot) tr.push(`rotate(${p.rot})`);
          if (typeof p.scl === 'number' && p.scl && p.scl !== 1) tr.push(`scale(${p.scl})`);
          return (
            <path
              key={`hover-${p.id}`}
              d={p.d}
              transform={tr.join(' ')}
              fill="none"
              stroke="#29f0ff"
              strokeWidth="2"
              opacity="0.6"
              style={{ pointerEvents: 'none' }}
            />
          );
        })}
      </g>
    ) : null;

    return (
      <svg viewBox={viewBox} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <g dangerouslySetInnerHTML={{ __html: animStyle(anim) }} />
        <g style={{ transform: transformStyle, transformOrigin: 'center center' }}>
          {animatedContent}
          {groupHoverOverlay}
        </g>
        {/* Phase 2: Hover tooltip */}
        {hoverId && (
          <text
            x="10"
            y="20"
            fill="#29f0ff"
            fontSize="12"
            fontFamily="system-ui"
            style={{ pointerEvents: 'none' }}
          >
            {paths.find((p) => p.id === hoverId)?.name || hoverId}
          </text>
        )}
      </svg>
    );
  }, [paths, viewBox, hoverId, selId, anim, previewScale, previewOffsetX, previewOffsetY, hoveredGroupKey, colorGroups]);

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
  async function loadBuiltinAsset(asset: { id: string; label: string; path: string }) {
    try {
      const res = await fetch(`${baseUrl}${asset.path}`);
      if (!res.ok) return;
      const txt = await res.text();
      await parseSVG(txt);
      setFileName(`${asset.id}.svg`);
    } catch (error) {
      console.error('Failed to load builtin asset', error);
    }
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
  function duplicatePath(id: string) {
    const now = Date.now();
    setPaths((ps) => {
      const idx = ps.findIndex((p) => p.id === id);
      if (idx < 0) return ps;
      const base = ps[idx];
      const copy: ExtractedPath = {
        ...base,
        id: `dup_${now}`,
        name: `${base.name} copy`,
        locked: false,
      };
      const next = ps.slice();
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }
  function toggleLock(id: string) {
    setPaths((ps) =>
      ps.map((p) => (p.id === id ? { ...p, locked: p.locked ? false : true } : p)),
    );
  }
  function copyD(d: string) { navigator.clipboard.writeText(d); }

  // === Phase 2: Copy utilities with feedback ===
  function copyText(text: string, label?: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(label || 'Copied!');
      setTimeout(() => setCopyFeedback(null), 1500);
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopyFeedback(label || 'Copied!');
      setTimeout(() => setCopyFeedback(null), 1500);
    });
  }
  function resetSelection() { setSelectedIds([]); setSelId(null); setHoverId(null); }
  function clearCompareB() { setBPaths(null); setBViewBox('0 0 512 512'); }

  // === Phase 1: Reset and Clear flows ===
  function resetToUpload() {
    if (!initialPathsRef.current || !initialViewBoxRef.current) return;
    setPaths(JSON.parse(JSON.stringify(initialPathsRef.current)));
    setViewBox(initialViewBoxRef.current);
    setFileName(initialFileNameRef.current || '');
    setSelectedIds([]);
    setSelId(null);
    setHoverId(null);
    computeFitToView(initialPathsRef.current, initialViewBoxRef.current);
  }

  function clearAll() {
    setPaths([]);
    setViewBox('0 0 512 512');
    setFileName('');
    setSelectedIds([]);
    setSelId(null);
    setHoverId(null);
    initialPathsRef.current = null;
    initialViewBoxRef.current = null;
    initialFileNameRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
    setPreviewScale(1);
    setPreviewOffsetX(0);
    setPreviewOffsetY(0);
  }

  // === Phase 1: Preview zoom and pan ===
  function computeFitToView(pathList: ExtractedPath[], vb: string) {
    const visiblePaths = pathList.filter((p) => p.visible !== false);
    if (!visiblePaths.length) {
      setPreviewScale(1);
      setPreviewOffsetX(0);
      setPreviewOffsetY(0);
      return;
    }

    // Parse viewBox
    const [vbX, vbY, vbW, vbH] = vb.split(/\s+/).map(Number);
    if (!vbW || !vbH) {
      setPreviewScale(1);
      setPreviewOffsetX(0);
      setPreviewOffsetY(0);
      return;
    }

    // Simple fit: scale to 90% of container, center
    const containerW = previewContainerRef.current?.clientWidth || 800;
    const containerH = previewContainerRef.current?.clientHeight || 600;
    const scaleX = (containerW * 0.9) / vbW;
    const scaleY = (containerH * 0.9) / vbH;
    const scale = Math.min(scaleX, scaleY, 4); // clamp to max 400%
    setPreviewScale(Math.max(0.25, scale));
    setPreviewOffsetX(0);
    setPreviewOffsetY(0);
  }

  function fitToView() {
    computeFitToView(paths, viewBox);
  }

  function zoomTo100() {
    setPreviewScale(1);
    setPreviewOffsetX(0);
    setPreviewOffsetY(0);
  }

  function adjustZoom(delta: number) {
    setPreviewScale((s) => Math.max(0.25, Math.min(4, s + delta)));
  }

  function handlePreviewPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    isPanningRef.current = true;
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: previewOffsetX,
      offsetY: previewOffsetY,
    };
    e.currentTarget.style.cursor = 'grabbing';
    e.preventDefault();
  }

  function handlePreviewPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isPanningRef.current || !panStartRef.current) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setPreviewOffsetX(panStartRef.current.offsetX + dx);
    setPreviewOffsetY(panStartRef.current.offsetY + dy);
  }

  function handlePreviewPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    isPanningRef.current = false;
    panStartRef.current = null;
    e.currentTarget.style.cursor = 'grab';
  }

  // === Phase 1: Keyboard shortcuts ===
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Only handle if not in an input
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        fitToView();
      } else if (e.key === '1') {
        e.preventDefault();
        zoomTo100();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        adjustZoom(0.1);
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        adjustZoom(-0.1);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [paths, viewBox, previewOffsetX, previewOffsetY]);

  // === Phase 2: Stats computation ===
  const pathStats = useMemo(() => {
    const visible = paths.filter((p) => p.visible !== false);
    const totalDChars = visible.reduce((sum, p) => sum + (p.d?.length || 0), 0);
    return {
      total: paths.length,
      visible: visible.length,
      totalDChars,
    };
  }, [paths]);

  function toggleColorGroup(key: string) {
    setExpandedColorKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleDetails(id: string) {
    setExpandedDetails((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // === Phase 3: Utility functions for exports ===
  function safeFileName(s: string): string {
    return s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) || 'unnamed';
  }

  function svgHeader(vb: string): string {
    return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">`;
  }

  function svgFooter(): string {
    return '</svg>';
  }

  function buildPathElement(p: ExtractedPath): string {
    const attrs: string[] = [`d="${p.d}"`];
    if (p.fill) attrs.push(`fill="${p.fill}"`);
    if (p.stroke) attrs.push(`stroke="${p.stroke}"`);
    if (p.strokeWidth) attrs.push(`stroke-width="${p.strokeWidth}"`);
    if (p.opacity) attrs.push(`opacity="${p.opacity}"`);
    const tr: string[] = [];
    if (typeof p.tX === 'number' || typeof p.tY === 'number') tr.push(`translate(${p.tX || 0} ${p.tY || 0})`);
    if (typeof p.rot === 'number' && p.rot) tr.push(`rotate(${p.rot})`);
    if (typeof p.scl === 'number' && p.scl && p.scl !== 1) tr.push(`scale(${p.scl})`);
    if (tr.length) attrs.push(`transform="${tr.join(' ')}"`);
    return `<path ${attrs.join(' ')} />`;
  }

  function buildSvg(pathsSubset: ExtractedPath[], vb: string): string {
    const pathElements = pathsSubset.map(buildPathElement).join('\n  ');
    return `${svgHeader(vb)}\n  ${pathElements}\n${svgFooter()}`;
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

  async function toZip(files: Array<{ path: string; content: string }>): Promise<Blob> {
    await ensureJSZip();
    const g: any = window as any;
    const zip = new g.JSZip();
    files.forEach((f) => zip.file(f.path, f.content));
    return await zip.generateAsync({ type: 'blob' });
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // === Phase 3: Export functions ===
  async function exportPerPath() {
    const sourcePaths = exportIncludeHidden ? paths : paths.filter((p) => p.visible !== false);
    if (sourcePaths.length === 0) {
      alert('No paths to export');
      return;
    }

    const files: Array<{ path: string; content: string }> = [];
    const manifest: any[] = [];

    sourcePaths.forEach((p, idx) => {
      const safeName = safeFileName(p.name || p.id);
      const filename = `${exportPrefix}_${String(idx + 1).padStart(3, '0')}_${safeName}.svg`;
      const svg = buildSvg([p], viewBox);
      files.push({ path: filename, content: svg });
      manifest.push({
        index: idx + 1,
        id: p.id,
        name: p.name,
        dLength: p.d.length,
        fill: p.fill || 'none',
        stroke: p.stroke || 'none',
      });
    });

    files.push({ path: 'manifest.json', content: JSON.stringify(manifest, null, 2) });

    const blob = await toZip(files);
    downloadBlob(blob, `${exportPrefix}_per_path.zip`);
  }

  async function exportPerColor() {
    const sourcePaths = exportIncludeHidden ? paths : paths.filter((p) => p.visible !== false);
    if (sourcePaths.length === 0) {
      alert('No paths to export');
      return;
    }

    const groups: Record<string, ExtractedPath[]> = {};
    sourcePaths.forEach((p) => {
      const key = normalizeColor(groupByStroke ? p.stroke : p.fill);
      (groups[key] ||= []).push(p);
    });

    const files: Array<{ path: string; content: string }> = [];
    const manifest: any[] = [];

    Object.entries(groups).forEach(([colorKey, groupPaths]) => {
      const safeColor = safeFileName(colorKey);
      const prefix = groupByStroke ? 'stroke' : 'color';
      const filename = `${exportPrefix}_${prefix}_${safeColor}.svg`;
      const svg = buildSvg(groupPaths, viewBox);
      files.push({ path: filename, content: svg });
      manifest.push({
        key: colorKey,
        count: groupPaths.length,
        ids: groupPaths.map((p) => p.id),
      });
    });

    files.push({ path: 'manifest.json', content: JSON.stringify(manifest, null, 2) });

    const blob = await toZip(files);
    downloadBlob(blob, `${exportPrefix}_per_color.zip`);
  }

  function exportOutline() {
    const sourcePaths = exportIncludeHidden ? paths : paths.filter((p) => p.visible !== false);
    if (sourcePaths.length === 0) {
      alert('No paths to export');
      return;
    }

    // Convert fills to strokes
    const outlinePaths = sourcePaths.map((p) => {
      const strokeColor = outlineStrokeColor === 'inherit' ? (p.fill || '#000000') : outlineStrokeColor;
      return {
        ...p,
        fill: undefined,
        stroke: strokeColor,
        strokeWidth: String(outlineStrokeWidth),
      } as ExtractedPath;
    });

    const svg = buildSvg(outlinePaths, viewBox);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, `${exportPrefix}_outline.svg`);
  }

  // === Phase 4: Paper.js loader and silhouette export ===
  async function ensurePaperJS(): Promise<boolean> {
    const g: any = window as any;
    if (g.paper) return true;
    try {
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.17/paper-full.min.js';
        s.onload = () => resolve();
        s.onerror = reject;
        document.head.appendChild(s);
      });
      return true;
    } catch {
      return false;
    }
  }

  async function exportSilhouette() {
    const sourcePaths = exportIncludeHidden ? paths : paths.filter((p) => p.visible !== false);
    if (sourcePaths.length === 0) {
      alert('No paths to export');
      return;
    }

    const paperLoaded = await ensurePaperJS();
    if (!paperLoaded) {
      alert('Failed to load Paper.js library');
      return;
    }

    try {
      const g: any = window as any;
      const canvas = document.createElement('canvas');
      const scope = new g.paper.PaperScope();
      scope.setup(canvas);

      // Import all visible paths into Paper.js
      const paperPaths: any[] = [];
      sourcePaths.forEach((p) => {
        const pp = scope.project.importSVG(`<svg><path d="${p.d}" /></svg>`);
        if (pp) paperPaths.push(pp);
      });

      if (paperPaths.length === 0) {
        alert('No valid paths to union');
        return;
      }

      // Union all paths into a single silhouette
      let result = paperPaths[0];
      for (let i = 1; i < paperPaths.length; i++) {
        result = result.unite(paperPaths[i]);
      }

      // If we want to preserve holes (default), subtract hole paths
      if (!silhouetteFillHoles) {
        const holePaths = paths.filter((p) => HOLE_IDS.includes(p.id) && (exportIncludeHidden || p.visible !== false));
        for (const holePath of holePaths) {
          const holeImport = scope.project.importSVG(`<svg><path d="${holePath.d}" /></svg>`);
          if (holeImport) {
            result = result.subtract(holeImport);
          }
        }
      }

      // Export result back to SVG path data
      const exportedSvg = result.exportSVG({ asString: true }) as string;
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(exportedSvg, 'image/svg+xml');
      const pathEl = svgDoc.querySelector('path');
      const dData = pathEl?.getAttribute('d') || '';

      if (!dData) {
        alert('Failed to generate silhouette path');
        return;
      }

      // Build final SVG
      const silhouettePath: ExtractedPath = {
        id: 'silhouette',
        name: 'silhouette',
        d: dData,
        fill: '#000000',
      };

      const svg = buildSvg([silhouettePath], viewBox);
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      downloadBlob(blob, `${exportPrefix}_silhouette.svg`);
    } catch (err) {
      console.error('Silhouette export error:', err);
      alert('Silhouette export failed. See console for details.');
    }
  }

  // === Phase 4: Anatomy 9-pack export ===
  async function exportAnatomy9Pack() {
    if (paths.length === 0) {
      alert('No paths to export');
      return;
    }

    const files: Array<{ path: string; content: string }> = [];
    const manifest: any[] = [];

    ANATOMY_IDS.forEach((anatomyId) => {
      // Collect paths matching this anatomy id (either the path itself or its parent chain)
      const matchingPaths = paths.filter((p) => {
        if (p.id === anatomyId) return true;
        if (p.parentChainIds?.includes(anatomyId)) return true;
        return false;
      });

      if (matchingPaths.length === 0) return; // Skip if no matches

      const svg = buildSvg(matchingPaths, viewBox);
      const filename = `${exportPrefix}_${anatomyId}.svg`;
      files.push({ path: filename, content: svg });
      manifest.push({
        anatomyId,
        count: matchingPaths.length,
        ids: matchingPaths.map((p) => p.id),
      });
    });

    if (files.length === 0) {
      alert('No anatomy parts found. Make sure paths have matching IDs or parent groups.');
      return;
    }

    files.push({ path: 'manifest.json', content: JSON.stringify(manifest, null, 2) });

    const blob = await toZip(files);
    downloadBlob(blob, `${exportPrefix}_anatomy_9pack.zip`);
  }

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <div className="flex flex-col gap-4">
        <Card className="border-white/10 bg-black/20">
          <CardHeader className="py-2">
            <CardTitle className="text-sm">SVG Layer Lab</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-2 text-xs text-zinc-300">
            <p>
              Upload or paste SVG artwork to remix individual paths. Rename layers, batch optimise path
              data, and stage quick animation loops before exporting SVG or self-contained HTML.
            </p>
            <p>
              Combine the outputs with the Photos tab for mixed-media canvases, or pipe the cleaned SVG back
              into Code Lab for interactive shader mashups.
            </p>
          </CardContent>
        </Card>

        <div className="relative min-h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-black/20 lg:min-h-[600px]" style={{ background: bg }}>
          {/* Phase 1: Preview zoom controls */}
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
            <div className="flex items-center gap-2 rounded-md border border-white/20 bg-black/40 px-2 py-1 text-xs">
              <label className="opacity-80">BG</label>
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 rounded-md border border-white/20 bg-black/40 px-2 py-1 text-xs">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => adjustZoom(-0.1)} title="Zoom out (-)">
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <input
                type="range"
                min="0.25"
                max="4"
                step="0.05"
                value={previewScale}
                onChange={(e) => setPreviewScale(Number(e.target.value))}
                className="w-24"
                title="Zoom"
              />
              <span className="w-12 text-center opacity-80">{Math.round(previewScale * 100)}%</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => adjustZoom(0.1)} title="Zoom in (+)">
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fitToView} title="Fit to view (f)">
                Fit
              </Button>
              <Button variant="outline" size="sm" onClick={zoomTo100} title="100% zoom (1)">
                100%
              </Button>
            </div>
          </div>

          <div
            ref={previewContainerRef}
            className="h-full w-full"
            style={{ cursor: isPanningRef.current ? 'grabbing' : 'grab' }}
            onPointerDown={handlePreviewPointerDown}
            onPointerMove={handlePreviewPointerMove}
            onPointerUp={handlePreviewPointerUp}
            onPointerLeave={handlePreviewPointerUp}
          >
            {previewInner}
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-260px)] min-h-[420px] rounded-2xl border border-white/10 bg-black/10 pr-2">
        <div className="space-y-3 p-3">
          <Tabs defaultValue="edit">
            <TabsList className="grid w-full grid-cols-3 border border-white/10 bg-black/30">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="animate">Animate</TabsTrigger>
              <TabsTrigger value="compare">Compare</TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-3 pt-3">
              <Card className="border-white/10 bg-black/30">
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Import</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-2">
                  <Input
                    ref={fileInputRef as any}
                    type="file"
                    accept=".svg,image/svg+xml"
                    onChange={(e) => e.target.files && onUpload(e.target.files)}
                  />
                  <div className="text-xs text-zinc-400">
                    Upload an SVG or start from one of Errl's house assets. We'll extract every vector path for you.
                  </div>
                  {/* Phase 1: Reset and Clear buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetToUpload}
                      disabled={!initialPathsRef.current}
                      title="Return to the initial state of the last upload"
                    >
                      Reset to Upload
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={clearAll}
                      title="Clear all paths and start fresh"
                    >
                      Clear All
                    </Button>
                  </div>
                  {fileName && (
                    <div className="text-xs text-zinc-400">
                      Current: <span className="text-zinc-200">{fileName}</span>
                      {initialViewBoxRef.current && (
                        <span className="ml-2 opacity-70">ViewBox: {viewBox}</span>
                      )}
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">Built-in assets</div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {builtinAssets.map((asset) => (
                        <Button
                          key={asset.id}
                          variant="outline"
                          size="sm"
                          onClick={() => loadBuiltinAsset(asset)}
                          title={asset.description}
                        >
                          {asset.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-black/30">
                <CardHeader className="py-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Paths ({paths.length})</CardTitle>
                    {/* Phase 2: Copy feedback */}
                    {copyFeedback && (
                      <span className="text-xs text-green-400 animate-pulse">{copyFeedback}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
            {/* Phase 2: Stats header */}
            {paths.length > 0 && (
              <div className="mb-3 rounded border border-white/10 bg-white/5 px-3 py-2 text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <span className="opacity-70">Total:</span> <span className="font-semibold">{pathStats.total}</span>
                  </div>
                  <div>
                    <span className="opacity-70">Visible:</span> <span className="font-semibold">{pathStats.visible}</span>
                  </div>
                  <div>
                    <span className="opacity-70">d chars:</span> <span className="font-semibold">{pathStats.totalDChars.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
            {/* Phase 2: List mode selector */}
            {paths.length > 0 && (
              <div className="mb-2 flex items-center gap-2 text-xs">
                <label className="opacity-70">View:</label>
                <Button
                  variant={listMode === 'layers' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setListMode('layers')}
                >
                  Layers
                </Button>
                <Button
                  variant={listMode === 'colorGroups' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setListMode('colorGroups')}
                >
                  Group by Color
                </Button>
                {listMode === 'colorGroups' && (
                  <label className="ml-2 flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={groupByStroke}
                      onChange={(e) => setGroupByStroke(e.target.checked)}
                      className="h-3.5 w-3.5"
                    />
                    <span className="opacity-70">By stroke</span>
                  </label>
                )}
              </div>
            )
            }
            {paths.length === 0 ? (
              <div className="text-xs text-zinc-400">No paths yet.</div>
            ) : listMode === 'colorGroups' ? (
              <>
                {/* Phase 2: Color groups view */}
                <ScrollArea className="max-h-96 pr-1">
                  <div className="space-y-2">
                    {Object.entries(colorGroups).map(([colorKey, groupPaths]) => {
                      const isExpanded = expandedColorKeys.has(colorKey);
                      return (
                        <div key={colorKey} className="rounded border border-white/10 bg-white/5">
                          <div
                            className="flex cursor-pointer items-center gap-2 px-2 py-2 text-xs hover:bg-white/10"
                            onClick={() => toggleColorGroup(colorKey)}
                            onMouseEnter={() => setHoveredGroupKey(colorKey)}
                            onMouseLeave={() => setHoveredGroupKey(null)}
                          >
                            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                            <div
                              className="h-5 w-5 rounded border border-white/20"
                              style={{ background: colorKey === 'none' ? 'transparent' : colorKey }}
                              title={colorKey}
                            />
                            <span className="flex-1 font-mono">{colorKey}</span>
                            <span className="opacity-70">{groupPaths.length} path{groupPaths.length !== 1 ? 's' : ''}</span>
                          </div>
                          {isExpanded && (
                            <div className="space-y-1 border-t border-white/10 p-2">
                              {groupPaths.map((p) => {
                                const detailsOpen = expandedDetails.has(p.id);
                                return (
                                  <div key={p.id} className="rounded border border-white/10 bg-black/20 p-2">
                                    <div
                                      className="flex items-center gap-2"
                                      onMouseEnter={() => setHoverId(p.id)}
                                      onMouseLeave={() => setHoverId(null)}
                                    >
                                      <button
                                        className="h-6 w-6 inline-flex items-center justify-center border border-white/20 rounded"
                                        onClick={(e) => { e.stopPropagation(); toggleVisible(p.id); }}
                                        title="Toggle visibility"
                                      >
                                        {p.visible === false ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                      </button>
                                      <span className="flex-1 truncate text-xs">{p.name}</span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => toggleDetails(p.id)}
                                        title="Toggle details"
                                      >
                                        {detailsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                      </Button>
                                    </div>
                                    {detailsOpen && (
                                      <div className="mt-2 space-y-1 border-t border-white/10 pt-2 text-xs">
                                        <div className="flex items-center gap-2">
                                          <span className="opacity-70">ID:</span>
                                          <code className="flex-1 rounded bg-black/30 px-1">{p.id}</code>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5"
                                            onClick={() => copyText(p.id, 'ID copied')}
                                            title="Copy ID"
                                          >
                                            <Copy className="h-3 w-3" />
                                          </Button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="opacity-70">d:</span>
                                          <code className="flex-1 overflow-x-auto rounded bg-black/30 px-1 text-[10px]">
                                            {p.d.slice(0, 60)}…
                                          </code>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5"
                                            onClick={() => copyText(p.d, 'd copied')}
                                            title="Copy d"
                                          >
                                            <Copy className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2 text-xs">
                  <label title={sliderHelp.precision}>Precision</label>
                  <input type="number" className="w-16 bg-black/20 border border-white/10 rounded px-1" min={0} max={6} step={1} value={precision} onChange={(e)=> setPrecision(Math.max(0, Math.min(6, Number(e.target.value))))} />
                  <Button size="sm" variant="outline" onClick={optimizeAll} title="Round path coordinates using the precision above">Optimize</Button>
                  <Button size="sm" variant="outline" onClick={() => performBoolean('unite')} title="Merge the selected layers into a single shape">Unite</Button>
                  <Button size="sm" variant="outline" onClick={() => performBoolean('intersect')} title="Keep only the intersection of the selected layers">Intersect</Button>
                  <Button size="sm" variant="outline" onClick={() => performBoolean('subtract')} title="Subtract later layers from the first layer in the selection">Subtract</Button>
                  <Button size="sm" variant="outline" title="Wrap the selected layers in a &lt;g&gt; so you can animate them together" onClick={() => {
                    if (selectedIds.length < 2) return;
                    const gid = `group_${Date.now()}`;
                    setPaths(ps => ps.map(x => selectedIds.includes(x.id) ? { ...x, groupId: gid } : x));
                  }}>Group</Button>
                  <Button size="sm" variant="outline" title="Remove any existing group so each layer exports separately" onClick={() => {
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
                  {paths.map((p, idx) => {
                    const detailsOpen = expandedDetails.has(p.id);
                    return (
                    <div key={p.id} className="space-y-1">
                      <div
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
                      <button
                        className="h-6 w-6 inline-flex items-center justify-center border border-white/20 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLock(p.id);
                        }}
                        title={p.locked ? 'Unlock layer for edits' : 'Lock layer to prevent changes'}
                      >
                        {p.locked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                      </button>
                      <Input
                        type="text"
                        value={p.name}
                        onChange={(e) => {
                          const nextName = e.target.value;
                          setPaths((ps) =>
                            ps.map((x) => (x.id === p.id ? { ...x, name: nextName } : x)),
                          );
                        }}
                        title="Layer name"
                        className="h-7 bg-black/20 border border-white/10 rounded px-1 text-xs"
                        disabled={p.locked}
                      />
                      <input type="color" value={p.fill || '#ffffff'} disabled={p.locked} onChange={(e)=> setPaths(ps => ps.map(x => x.id===p.id ? { ...x, fill: e.target.value } : x))} title="Fill"/>
                      <input type="color" value={p.stroke || '#000000'} disabled={p.locked} onChange={(e)=> setPaths(ps => ps.map(x => x.id===p.id ? { ...x, stroke: e.target.value } : x))} title="Stroke"/>
                      <input type="number" step="0.5" min="0" value={Number(p.strokeWidth || 0)} disabled={p.locked} onChange={(e)=> setPaths(ps => ps.map(x => x.id===p.id ? { ...x, strokeWidth: String(e.target.value) } : x))} title="Stroke width" className="w-14 bg-black/20 border border-white/10 rounded px-1"/>
                      <input type="range" min="0" max="1" step="0.05" value={Number(p.opacity || 1)} disabled={p.locked} onChange={(e)=> setPaths(ps => ps.map(x => x.id===p.id ? { ...x, opacity: String(e.target.value) } : x))} title="Opacity"/>
                      <input type="number" step="1" className="w-16 bg-black/20 border border-white/10 rounded px-1" value={p.tX ?? 0} disabled={p.locked} onChange={(e)=> setPaths(ps => ps.map(x => x.id===p.id ? { ...x, tX: Number(e.target.value) } : x))} title="Translate X"/>
                      <input type="number" step="1" className="w-16 bg-black/20 border border-white/10 rounded px-1" value={p.tY ?? 0} disabled={p.locked} onChange={(e)=> setPaths(ps => ps.map(x => x.id===p.id ? { ...x, tY: Number(e.target.value) } : x))} title="Translate Y"/>
                      <input type="number" step="1" className="w-16 bg-black/20 border border-white/10 rounded px-1" value={p.rot ?? 0} disabled={p.locked} onChange={(e)=> setPaths(ps => ps.map(x => x.id===p.id ? { ...x, rot: Number(e.target.value) } : x))} title="Rotate (deg)"/>
                      <input type="number" step="0.05" className="w-16 bg-black/20 border border-white/10 rounded px-1" value={p.scl ?? 1} disabled={p.locked} onChange={(e)=> setPaths(ps => ps.map(x => x.id===p.id ? { ...x, scl: Number(e.target.value) } : x))} title="Scale"/>
                      <Button variant="outline" size="icon" title="Duplicate layer" onClick={(e)=> { e.stopPropagation(); duplicatePath(p.id); }}><Files className="h-3.5 w-3.5" /></Button>
                      <Button variant="outline" size="icon" title="Copy d attribute" onClick={(e)=> { e.stopPropagation(); copyD(p.d); }}><Copy className="h-3.5 w-3.5" /></Button>
                      <Button variant="destructive" size="icon" title="Remove" disabled={p.locked} onClick={(e)=> { e.stopPropagation(); removePath(p.id); }}><Trash2 className="h-3.5 w-3.5"/></Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Show details"
                        onClick={(e) => { e.stopPropagation(); toggleDetails(p.id); }}
                      >
                        {detailsOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </Button>
                      </div>
                      {/* Phase 2: Details panel */}
                      {detailsOpen && (
                        <div className="ml-8 space-y-2 rounded border border-white/10 bg-black/20 p-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="opacity-70">ID:</span>
                            <code className="flex-1 rounded bg-black/30 px-1">{p.id}</code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => copyText(p.id, 'ID copied')}
                              title="Copy ID"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          {p.name && p.name !== p.id && (
                            <div className="flex items-center gap-2">
                              <span className="opacity-70">Name:</span>
                              <code className="flex-1 rounded bg-black/30 px-1">{p.name}</code>
                            </div>
                          )}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="opacity-70">d:</span>
                              <span className="opacity-60">({p.d.length} chars)</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto h-5 w-5"
                                onClick={() => copyText(p.d, 'd copied')}
                                title="Copy d"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <ScrollArea className="h-16 rounded bg-black/30 p-1">
                              <code className="block whitespace-pre-wrap break-all text-[10px] leading-tight">
                                {p.d}
                              </code>
                            </ScrollArea>
                          </div>
                        </div>
                      )}
                    </div>
                    );
                  })}
                  </div>
                </ScrollArea>
              </>
            )}
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-black/30">
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-2">
                <div className="grid gap-2 text-xs">
                  {quickActions.map((action) => (
                    <div key={action.id} className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={action.disabled ? action.disabled() : false}
                        onClick={action.run}
                      >
                        {action.label}
                      </Button>
                      <span className="opacity-75">{action.description}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-zinc-400">
                  Grouped layers export inside a shared <code>&lt;g&gt;</code> element. This keeps multi-part assets aligned when you animate or reuse them elsewhere in Studio.
                </p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-black/30">
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={exportSVG}><Download className="h-4 w-4 mr-1"/>Export SVG</Button>
                  <Button variant="outline" size="sm" onClick={exportHTML}><Download className="h-4 w-4 mr-1"/>Export HTML</Button>
                </div>

                {/* Phase 3: Options */}
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4" checked={exportIncludeHidden} onChange={(e)=> setExportIncludeHidden(e.target.checked)} />
                    Include hidden
                  </label>
                  <label className="flex items-center gap-2">
                    Prefix
                    <Input value={exportPrefix} onChange={(e)=> setExportPrefix(e.target.value)} className="h-7 w-28 bg-black/20" />
                  </label>
                </div>

                {/* Phase 3: Export groups */}
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded border border-white/10 bg-white/5 p-2">
                    <div className="mb-1 font-semibold">Per Path</div>
                    <Button variant="outline" size="sm" onClick={exportPerPath}><Download className="mr-1 h-4 w-4"/>ZIP: one SVG per path</Button>
                  </div>
                  <div className="rounded border border-white/10 bg-white/5 p-2">
                    <div className="mb-1 font-semibold">Per Color</div>
                    <div className="mb-1 flex items-center gap-2">
                      <label className="flex items-center gap-1">
                        <input type="checkbox" className="h-4 w-4" checked={groupByStroke} onChange={(e)=> setGroupByStroke(e.target.checked)} /> By stroke
                      </label>
                    </div>
                    <Button variant="outline" size="sm" onClick={exportPerColor}><Download className="mr-1 h-4 w-4"/>ZIP: one SVG per color</Button>
                  </div>
                  <div className="rounded border border-white/10 bg-white/5 p-2 sm:col-span-2">
                    <div className="mb-1 font-semibold">Outline-only</div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <label className="flex items-center gap-2">Stroke width <Input type="number" step="0.5" min="0.5" value={outlineStrokeWidth} onChange={(e)=> setOutlineStrokeWidth(Math.max(0.5, Number(e.target.value)))} className="h-7 w-20 bg-black/20" /></label>
                      <label className="flex items-center gap-2">Stroke color
                        <select className="h-7 rounded border border-white/10 bg-black/20 px-2" value={outlineStrokeColor} onChange={(e)=> setOutlineStrokeColor(e.target.value)}>
                          <option value="inherit">inherit fill</option>
                          <option value="#000000">#000000</option>
                          <option value="#ffffff">#ffffff</option>
                          <option value="#29f0ff">#29f0ff</option>
                          <option value="#ff00aa">#ff00aa</option>
                        </select>
                      </label>
                    </div>
                    <Button variant="outline" size="sm" onClick={exportOutline}><Download className="mr-1 h-4 w-4"/>Export outline-only</Button>
                  </div>
                  {/* Phase 4: Silhouette Export */}
                  <div className="rounded border border-white/10 bg-white/5 p-2">
                    <div className="mb-1 font-semibold">Silhouette</div>
                    <div className="mb-1 flex items-center gap-2">
                      <label className="flex items-center gap-1 text-[11px]">
                        <input type="checkbox" className="h-4 w-4" checked={silhouetteFillHoles} onChange={(e)=> setSilhouetteFillHoles(e.target.checked)} /> Fill holes
                      </label>
                      <span className="text-[10px] opacity-60">(eyes, mouth)</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={exportSilhouette}><Download className="mr-1 h-4 w-4"/>Union + subtract holes</Button>
                  </div>
                  {/* Phase 4: Anatomy 9-Pack Export */}
                  <div className="rounded border border-white/10 bg-white/5 p-2">
                    <div className="mb-1 font-semibold">Errl Anatomy 9-Pack</div>
                    <div className="mb-1 text-[10px] opacity-60">Template-based ID grouping</div>
                    <Button variant="outline" size="sm" onClick={exportAnatomy9Pack}><Download className="mr-1 h-4 w-4"/>ZIP: 9 body parts</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="animate" className="space-y-3 pt-3">
              <Card className="border-white/10 bg-black/30">
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Animation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-2 text-xs">
                <div className="border border-white/10 rounded px-3 py-2 space-y-2">
                  <div className="text-[11px] uppercase tracking-[0.2em] opacity-70">Presets</div>
                  <div className="flex flex-wrap gap-2">
                    {animationPresets.map((preset) => (
                      <Button
                        key={preset.label}
                        variant={anim.label === preset.label ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => applyAnimationPreset(preset)}
                        title={preset.description}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-24" title={sliderHelp.rotate}>Rotate (deg/s)</label>
                  <input type="number" className="w-20 bg-black/20 border border-white/10 rounded px-1" value={anim.rotate} onChange={(e)=> setAnim(a => ({...a, rotate: Math.max(0, Number(e.target.value)), label: 'Custom'}))} />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-24" title={sliderHelp.pulse}>Pulse (scale)</label>
                  <input type="range" min={0} max={0.5} step={0.01} value={anim.pulse} onChange={(e)=> setAnim(a => ({...a, pulse: Number(e.target.value), label: 'Custom'}))} />
                  <span>{anim.pulse.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-24" title={sliderHelp.dashSpeed}>Dash speed</label>
                  <input type="range" min={0} max={20} step={0.5} value={anim.dash} onChange={(e)=> setAnim(a => ({...a, dash: Number(e.target.value), label: 'Custom'}))} />
                  <span>{anim.dash.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-24" title={sliderHelp.dashLength}>Dash length</label>
                  <input type="number" className="w-20 bg-black/20 border border-white/10 rounded px-1" min={1} max={64} step={1} value={anim.dashLen} onChange={(e)=> setAnim(a => ({...a, dashLen: Math.max(1, Number(e.target.value)), label: 'Custom'}))} />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-24" title={sliderHelp.sway}>Sway (deg)</label>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    step={0.5}
                    value={anim.sway}
                    onChange={(e) => setAnim((a) => ({ ...a, sway: Number(e.target.value), label: 'Custom' }))}
                  />
                  <span>{anim.sway.toFixed(1)}°</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-24" title={sliderHelp.yoyo}>Float (px)</label>
                  <input
                    type="range"
                    min={0}
                    max={120}
                    step={2}
                    value={anim.yoyo}
                    onChange={(e) => setAnim((a) => ({ ...a, yoyo: Number(e.target.value), label: 'Custom' }))}
                  />
                  <span>{anim.yoyo.toFixed(0)}px</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-24" title={sliderHelp.flash}>Flash</label>
                  <input
                    type="range"
                    min={0}
                    max={0.9}
                    step={0.05}
                    value={anim.flash}
                    onChange={(e) => setAnim((a) => ({ ...a, flash: Number(e.target.value), label: 'Custom' }))}
                  />
                  <span>{anim.flash.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-24" title={sliderHelp.hue}>Hue shift</label>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={5}
                    value={anim.hue}
                    onChange={(e) => setAnim((a) => ({ ...a, hue: Number(e.target.value), label: 'Custom' }))}
                  />
                  <span>{anim.hue.toFixed(0)}°</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-24" title={sliderHelp.glow}>Glow</label>
                  <input
                    type="range"
                    min={0}
                    max={40}
                    step={1}
                    value={anim.glow}
                    onChange={(e) => setAnim((a) => ({ ...a, glow: Number(e.target.value), label: 'Custom' }))}
                  />
                  <span>{anim.glow.toFixed(0)}px</span>
                </div>
                <div className="text-[11px] uppercase tracking-[0.2em] opacity-70">Active preset</div>
                <div className="opacity-80">{anim.label || 'Custom'} animation</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compare" className="space-y-3 pt-3">
              <Card className="border-white/10 bg-black/30">
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Compare A/B</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-2 text-xs">
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
      </ScrollArea>
    </div>
  );
}
