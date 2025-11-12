# Team Update — Safari Layers Performance Audit (Kickoff)

Date: 2025-11-09
Branch: perf/layer-audit-portal-landing-2025-11-09
Owner: Extrepa (assist: AI agents)
Scope: Reduce composite layer count and GPU memory/jank on the portal landing (Safari focus). Preserve Errl hero visuals.

## Repro
- npm run dev
- Open http://localhost:5173/ in Safari
- Open Web Inspector → Layers (3D), Graphics, Timelines

## Baseline (from current screenshots)
- Layer Count: ~27
- Graphics Memory: ~418.4 MB (older audit export shows up to ~5.1 GB total backing layers)
- Notable: multiple “Unknown node” layers with high paints (10–16) and 2.0–13.6 MB each
- 3D view: long stacked ribbons → likely many stacking contexts across full-bleed nodes

Artifacts:
- Screenshots: docs/perf/2025-11-09-safari-layers/
- Baseline notes: docs/perf/2025-11-09-baseline.md
- Results log: docs/perf/2025-11-09-results.md
- Layer map (expected vs observed): docs/perf/2025-11-09-layer-map.md

## Target stack (back → front)
- L0 DOM canvas: #bgParticles (z:0)
- L1 WebGL canvas: #errlWebGL (z:1), PIXI stage (sortableChildren=true)
  - ParticleContainer (GL bubbles) — added before all else
  - fxRoot (filtered visuals; filters OK)
    - overlay (gradient/displace)
    - Errl GL sprite (goo filter)
    - orbContainer (GL orbs)
- L2 DOM canvas: #riseBubbles (z:2)
- L3 DOM: .scene-layer (Errl DOM image/SVG, nav-orbit, pool) (z:3)
- L4 DOM: .vignette-frame (z:4)
- L5 DOM: Errl Phone/overlays (z:4000+)

## Hypotheses
- Multiple canvases/contexts alive (HMR/unmount cleanup missing)
- Filters applied too high in the tree while using ParticleContainer (forces extra composites)
- Heavy CSS filters/mix-blend on full-bleed nodes creating offscreen layers
- Renderer resolution too high on Retina (excessive GPU memory)
- Resize thrash or zero-dimension resizes

## Plan of action (17 items)
- [ ] 1) Create branch for the audit: perf/layer-audit-portal-landing-2025-11-09
- [ ] 2) Set up audit workspace and import latest Safari screenshots under docs/perf/2025-11-09-safari-layers
- [ ] 3) Publish quick team update (this file) so other AI/devs can assist
- [ ] 4) Run the app and capture a strict baseline in Safari (layer count, memory, top offenders, reasons for compositing)
- [ ] 5) Inventory canvases and DOM layers with quick checks (see Console snippets)
- [ ] 6) Map observed stack vs canonical layer order; list deltas
- [ ] 7) Add a lightweight debug harness with hard toggles (overlay/orbs/riseBubbles/vignette; renderer resolution)
- [ ] 8) Enforce canonical canvas CSS and z-order (pointer-events:none; fixed sizing; z-index 0/1/2/3/4)
- [ ] 9) Audit PIXI stage structure and filter usage (ParticleContainer first; filters on fxRoot only)
- [ ] 10) Eliminate duplicate canvases and fix HMR/unmount leaks (singleton init; robust destroy)
- [ ] 11) Reduce CSS compositing triggers on wide surfaces (filters/backdrop-filter/mix-blend/will-change)
- [ ] 12) Clamp WebGL renderer resolution and texture memory (cap DPR to 1.0–1.5; debug override)
- [ ] 13) Harden resize logic; avoid 0-size thrash (throttle, guards)
- [ ] 14) Capture iterative measurements and annotate findings (docs/perf/2025-11-09-results.md)
- [ ] 15) Protect visual priorities (Errl hero) while optimizing
- [ ] 16) Push the branch and open a PR with checklist and before/after metrics
- [ ] 17) Assign concrete subtasks to AI teammates (docs/perf/tasks-queue.md)

## Console snippets
```js
// Canvases overview
[...document.querySelectorAll('canvas')].map(c => ({
  id: c.id,
  z: getComputedStyle(c).zIndex,
  pe: getComputedStyle(c).pointerEvents,
  sz: `${c.width}x${c.height}`,
  cssSz: `${c.clientWidth}x${c.clientHeight}`
}));

// WebGL context counts
(() => {
  const cs = [...document.querySelectorAll('canvas')];
  const tryCtx = (c, kind) => { try { return !!c.getContext(kind, {preserveDrawingBuffer:false}); } catch(e){ return false; } };
  return {
    canvases: cs.length,
    webgl2: cs.filter(c => tryCtx(c,'webgl2')).length,
    webgl:  cs.filter(c => tryCtx(c,'webgl')).length,
  };
})();

// Key layer nodes
[...document.querySelectorAll('#bgParticles,#errlWebGL,#riseBubbles,.scene-layer,.vignette-frame')]
  .map(n => ({ node: n.id || n.className, z: getComputedStyle(n).zIndex, pos: getComputedStyle(n).position, filt: getComputedStyle(n).filter, mix: getComputedStyle(n).mixBlendMode }));
```
