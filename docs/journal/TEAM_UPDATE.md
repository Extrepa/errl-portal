# Team Update — Safari Layers Performance Audit (Kickoff)

Date: 2025-11-09
Branch: perf/layer-audit-portal-landing-2025-11-09
Owner: Extrepa (assist: AI agents)
Scope: Reduce composite layer count and GPU memory/jank on the portal landing (Safari focus). Preserve Errl hero visuals.

## Update — 2025-11-11 Studio Hub Split

- `/studio` now routes to a React hub (`src/portal/app/pages/Studio.tsx`) with cards for Code Lab, Math Lab, Shape Madness, and SVG Colorer.
- Code Lab lives at `/studio/code-lab` (same React app as before); Math Lab is wrapped by `StudioMathLab` so the legacy experiments stay accessible while we wire shared assets.
- Documentation refreshed (`README.md`, `docs/reorg/*`, `docs/roadmap.md`) to match the new layout and plan.
- Build + Playwright smoke suite both green after the move (one hue test hiccup on the first run, second pass clean).

## Update — 2025-11-11 Studio Hub Styling & Legacy Bridges

- New dedicated stylesheets (`src/portal/app/pages/studio.css` and `studio-detail.css`) restore the Errl look & feel for the hub and legacy wrappers. Cards, badges, and roadmap copy now match the design mockups.
- Math Lab and Shape Madness wrapper pages use the shared `resolvePortalPageUrl` helper plus `useLegacyAssetBridge` so cross-tool asset calls hit the IndexedDB store via `@/utils/assetStore.js`.
- Landing-page nav links/iframes now use `data-portal-link` + an inline rewrite script so every route resolves to `/legacy/portal/...` (no more chained `/legacy/portal/legacy/portal/...` URLs when navigating between legacy pages).
- `tests/ui.spec.ts` extended with iframe bridge checks (Playwright pass confirmed after raising resiliency on nav + frame detection).
- Reminder for Cursor/Warp: run `npm run portal:build`, `npm run studio:build`, and `npm test` before hand-off; all pass as of this update (2025-11-11 18:00 PT).
- Next: unify Pin Designer link via `resolvePortalPageUrl`, then start wiring shared toolbar/settings between the legacy iframes and Code Lab.

### Next Focus Areas
1. Bridge Shape Madness into a React view at `/studio/shape-madness` and hydrate it via shared asset APIs.
2. Expose the existing `@shared/utils/assetStore` + event bus inside the Math Lab iframe so exported assets flow into Code Lab.
3. Extend doctor/tests to cover the new hub routes once the additional bridges land.

## Repro
- npm run dev
- Open http://localhost:5173/ in Safari
- Open Web Inspector → Layers (3D), Graphics, Timelines

## Baseline (Safari 2025-11-09)
- Layer Count: 27
- Graphics Memory: ≈ 5.1 GB (seven ~544 MB surfaces, plus several 80–500 MB layers)
- Notable: multiple large backing layers for WebGL/DOM blending; highest paint count observed: 17 (4.66 MB surface)
- 3D view: long stacked ribbons → likely many stacking contexts across full-bleed nodes

## Target stack (back → front)
- L-1 DOM: `.errl-bg` ambient shell (base/shimmer/vignette) injected by `ErrlBG.mount()`
- L0 DOM canvas: `#bgParticles` (z-index 0) — starfield from `src/bg-particles.js`
- L1 DOM canvas: `#riseBubbles` (z-index 1, pointer-events:none) — rising bubbles from `src/rise-bubbles.js`
- L2 DOM overlay: `.vignette-frame` (z-index 2) — opacity/color bound to panel sliders
- L3 WebGL canvas: `#errlWebGL` (z-index 3) — Pixi stage (`window.enableErrlGL`)
  - `ParticleContainer` (GL bubbles)
  - `overlay` sprite (noise/displace)
  - Errl sprite (goo filter)
  - `orbContainer` (GL nav orbs)
- L4 DOM: `.scene-layer` (Errl DOM SVG, nav orbit, pool)
- L5 DOM: `#errlPanel`, dev panel (when mounted), other overlays (z-index ≥ 4000)

## Layer inventory (confirmed 2025-11-09)

| Order | Selector / Element | Module / Source | Dev hooks & globals | Notes |
|-------|--------------------|-----------------|---------------------|-------|
| L-1   | `.errl-bg` (`.layer.base`, `.layer.shimmer`, `.layer.vignette`, optional `.errl-hud`) | `src/fx/errl-bg.ts` (`ErrlBG.mount`) | none | Injected when Shimmer toggle enabled; pointer parallax + HUD art |
| L0    | `#bgParticles` `<canvas>` | `src/bg-particles.js` | none | Starfield; resizes with DPR ≤2; additive blend |
| L1    | `#riseBubbles` `<canvas>` | `src/rise-bubbles.js` | `window.errlRisingBubbles.{getState,setSpeed,setDensity,setAlpha}` | Particle sim with pointer attraction & ripple rings; reads/writes `localStorage.errl_rb_settings` |
| L2    | `.vignette-frame` `<div>` | Static DOM + `portal-app.js` bindings | none | Opacity/color driven by `#vignette*` inputs |
| L3    | `#errlWebGL` `<canvas>` | `src/webgl.js` (PixiJS) | `window.enableErrlGL`, `window.errlGLSetGoo`, `errlGLSetOverlay`, `errlGLSetBubbles`, `errlGLShowOrbs`, `errlGLSyncOrbs`, `errlGLBurst`, etc. | Registers `window.__ErrlWebGL` for hue filters; mirrors nav orbits with Pixi sprites |
| L4    | `.scene-layer` (errl DOM, nav orbit, pool) | `src/index.html` / `portal-app.js` | `window.errlNavControls` (speed/radius/scale/games), `window.ErrlHueController` (CSS filters) | Shift +B toggles hidden games bubble; audio pings, goo toggles, etc. |
| L5    | `#errlPanel`, dev overlay | `portal-app.js`, `src/devpanel/runtime.ts` | Dev panel registry (`window.errl_devpanel_*`) | Dev panel only loads with `?devpanel` or auto flag; classic panel always present |

Hue controller (`src/fx/hue-controller.ts`) spans the entire stack: applies CSS filters to DOM selectors and registers Pixi hue filters once `window.__ErrlWebGL` is populated.

## Hypotheses to validate
- Multiple canvases/contexts alive (HMR/unmount cleanup missing)
- Filters applied too high in the tree while using ParticleContainer (forces extra composites)
- Heavy CSS filters/mix-blend on full-bleed nodes creating offscreen layers
- Renderer resolution too high on Retina (excessive GPU memory)
- Resize thrash or zero-dimension resizes

## Plan of action (17 items)
- [ ] 1) Create branch for the audit: perf/layer-audit-portal-landing-2025-11-09
- [ ] 2) Set up audit workspace and import latest Safari screenshots under docs/perf/2025-11-09-safari-layers
- [ ] 3) Publish quick team update (this file) so other AI/devs can assist
- [x] 4) Run the app and capture a strict baseline in Safari (layer count, memory, top offenders, reasons for compositing)
- [x] 5) Inventory canvases and DOM layers with quick checks (see Layer inventory / DEV-SYSTEM-GUIDE.md update)
- [x] 6) Map observed stack vs canonical layer order; list deltas (confirmed above)
- [x] 7) Add a lightweight debug harness with hard toggles (overlay/orbs/riseBubbles/vignette; renderer resolution)
- [x] 8) Enforce canonical canvas CSS and z-order (pointer-events:none; fixed sizing; z-index 0/1/2/3/4)
  - Rising bubbles default restored (`#riseBubbles` no longer boot-hidden; debug harness now re-enables by default unless explicitly toggled off)
  - Dev panel safety hotkeys wired (Alt+D to hide/show, Alt+P to enable click-through so the overlay never traps pointer events)
- [ ] 9) Audit PIXI stage structure and filter usage (ParticleContainer first; filters on fxRoot only)
  - Stage graph documented in `docs/perf/2025-11-09-results.md`; overlay render texture + high-DPR surfaces flagged for follow-up
- [ ] 10) Eliminate duplicate canvases and fix HMR/unmount leaks (singleton init; robust destroy)
- [ ] 11) Reduce CSS compositing triggers on wide surfaces (filters/backdrop-filter/mix-blend/will-change)
  - Removed `mix-blend-mode` from `.errl-goo`, `.errl-aura-mask`, `.errl-pool` and brightened gradients to keep the glow without extra Safari backing layers; dropped `backdrop-filter` from `.errl-panel` and the dev panel overlay to avoid blur composites
- [ ] 12) Clamp WebGL renderer resolution and texture memory (cap DPR to 1.0–1.5; debug override)
  - Safari-aware DPR policy + debug override flow documented under “DPR Clamp & Resize Guard Plan” and implemented in `src/webgl.js` (awaiting measurement)
- [ ] 13) Harden resize logic; avoid 0-size thrash (throttle, guards)
  - RAF throttling + min-size guards now live in `src/webgl.js` + `src/rise-bubbles.js`; re-test pending
- [ ] 14) Capture iterative measurements and annotate findings (docs/perf/2025-11-09-results.md)
- [ ] 15) Protect visual priorities (Errl hero) while optimizing
- [ ] 16) Push the branch and open a PR with checklist and before/after metrics
- [ ] 17) Assign concrete subtasks to AI teammates (docs/perf/tasks-queue.md)

## Artifacts / Logs
- `docs/perf/2025-11-09-safari-layers/` — drop Safari layer screenshots here.
- `docs/perf/2025-11-09-results.md` — metrics log template (baseline + iterations).
- `docs/perf/tasks-queue.md` — task assignments/status.

## Console snippets (for baseline and quick inventory)
```js
// Canvases overview
[...document.querySelectorAll('canvas')].map(c => ({
  id: c.id,
  z: getComputedStyle(c).zIndex,
  pe: getComputedStyle(c).pointerEvents,
  sz: `${c.width}x${c.height}`,
  cssSz: `${c.clientWidth}x${c.clientHeight}`
}));

// WebGL context counts (best-effort)
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

## Immediate toggles (via `window.errlDebug`)
- `window.errlDebug.toggle('risingBubbles')` — hides/shows the DOM canvas (`#riseBubbles`)
- `window.errlDebug.toggle('vignette')` — toggles `.vignette-frame`
- `window.errlDebug.toggle('overlay')` — zeroes Pixi overlay alpha without losing the previous state
- `window.errlDebug.toggle('orbs')` — hides Pixi nav orbs
- `window.errlDebug.setDprCap(1.25)` — clamp WebGL DPR (pass `null` to restore default); use `{ reload: true }` if you want a hard reload
- `window.errlDebug.log()` — quick sanity check before handing off to Warp

*(Manual fallbacks remain available if needed: `document.getElementById('riseBubbles').style.display='none'`, etc.)*

## Done when
- Safari Layers shows ≤10 layers, ≤250 MB at 1920×1080 with stable paints
- 60fps on Safari (M1) with hero animation active; visuals preserved

## Hand-off notes
- Focus on canonical layer order and moving filters off app.stage when ParticleContainer is used
- Prefer a single WebGL overlay and a single DOM vignette; prune duplicates
- Cap renderer resolution; add a persistent debug override in localStorage

## Update — 2025-11-12 Pin Designer Bridge & Routing

- Added `StudioPinDesigner.tsx` so the legacy enamel Pin Designer runs inside the React hub at `/studio/pin-designer`, sharing the IndexedDB asset store through `useLegacyAssetBridge`.
- Hub cards now navigate to `/studio/pin-designer`, `/studio/math-lab`, and `/studio/shape-madness` without full page reloads thanks to the BrowserRouter basename and Vite dev/preview middleware rewrite.
- Legacy Pin Designer page adopts `data-portal-link` anchors and a runtime base-url fixer, keeping the portal nav consistent across static exports.
- Playwright suite expanded with Studio hub checks (card visibility, navigation, iframe bridge assertions); `npm test`, `npm run portal:build` both green as of 2025-11-12 19:30 PT.
- Updated README + team docs to reference the new route structure and daily build status; Warp instructions now highlight the middleware behaviour and shared asset bridge.

## Update — 2025-11-11 Complete Studio Hub Commit (7d2124e)

**Branch**: `main` (ahead 1 commit from origin)
**Commit**: `feat(studio): complete Studio hub integration with Pin Designer bridge`
**Status**: ✅ All automated checks passing, manual browser QA pending

### What Shipped
- **40 files changed**: +2376 insertions, -543 deletions
- **New components**:
  - `src/portal/app/pages/StudioPinDesigner.tsx` — Pin Designer iframe wrapper
  - `src/portal/app/pages/StudioShapeMadness.tsx` — Shape Madness iframe wrapper
  - `src/portal/app/hooks/useLegacyAssetBridge.ts` — IndexedDB asset sharing hook
  - `src/portal/app/utils/portalPaths.ts` — Route resolution helper
  - `src/portal/app/pages/studio.css` + `studio-detail.css` — Errl theming
- **Router updates**:
  - `BrowserRouter` with `basename="/studio"` in `App.tsx`
  - Vite middleware enhanced to rewrite `/studio/**` → `studio.html`
  - All legacy pages use `data-portal-link` for base URL resolution
- **Tests**: Extended Playwright with Studio hub navigation and iframe bridge assertions
- **Documentation**:
  - `docs/dev/local-preview-notes.md` — Architecture and dev setup guide
  - `docs/dev/preview-qa-complete.md` — QA checklist and commands
  - Team updates: `TEAM_UPDATE_2025-11-12-LINKS.md`, `TEAM_UPDATE_2025-11-12-STUDIO-ALIGN.md`

### Verification Complete
- ✅ TypeScript: All types resolve correctly
- ✅ Routes: `/` and `/studio` return 200
- ✅ Assets: Main Errl body + updated face (errl-face-2.svg) verified
- ✅ Naming: "Studio" consistent, "tools/" correctly identified as shell scripts
- ✅ Architecture: Single Vite dev server confirmed (not multi-app)
- ✅ Backup: `.local/wip-20251111-0516.patch` (123KB)

### Manual QA Remaining
1. **Visual**: Layer order, canvas z-index, PIXI filters on fxRoot
2. **Functional**: Navigation flow, HMR, console errors
3. **Studio Hub**: Test each card (Code Lab, Math Lab, Shape Madness, Pin Designer)
4. **Asset Bridge**: Save/load/delete designs via IndexedDB

**Command to start**: `npm run dev` → http://localhost:5173/

### Next Focus Areas
1. **Manual browser QA**: Complete visual/functional checks documented in `docs/dev/preview-qa-complete.md`
2. **Stress-test asset bridge**: Large Pin Designer exports (5-10MB) → Code Lab imports
3. **SVG Colorizer bridge**: Add `StudioSvgColorer.tsx` using same pattern as Pin Designer
4. **Extend Playwright**: Add `/studio/pin-designer` screenshots to nightly CI
5. **Deploy preview**: Verify GitHub Pages build with `/errl-portal/` base path
6. **Performance audit**: Complete Safari layer optimization (target: ≤10 layers, ≤250MB)
