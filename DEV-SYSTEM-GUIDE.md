# 🎮 Errl Dev Panel — Practical Guide

This guide documents the *actual* development overlay that now ships with the portal. It replaces the aspirational notes about a Pixi-era dev system.

---

## 0. Architecture Snapshot (Nov 2025)

| Layer | Selector / Hook | Notes |
|-------|-----------------|-------|
| **Ambient background** | `.errl-bg .base`, `.errl-bg .shimmer`, `.errl-bg .vignette` | Injected by `ErrlBG.mount()` (`src/fx/errl-bg.ts`) when the Shimmer toggle is on. Provides the static gradient + shimmer + HUD drip shell. |
| **Background canvases** | `#bgParticles`, `#riseBubbles` | `src/bg-particles.js` paints a starfield (no globals). `src/rise-bubbles.js` drives the rising bubbles canvas and publishes `window.errlRisingBubbles` (speed/density/alpha setters). |
| **Vignette frame** | `.vignette-frame` | DOM overlay whose opacity/color are bound to the panel sliders in `portal-app.js`. |
| **WebGL overlay** | `#errlWebGL` + PIXI runtime (`window.enableErrlGL`, `window.errlGL*`) | Lazily initialised. Exposes `errlGLSetGoo`, `errlGLSetOverlay`, `errlGLSetBubbles`, `errlGLSyncOrbs`, `errlGLBurst`, etc. Registers `window.__ErrlWebGL` for hue filter registration. |
| **Scene DOM** | `.scene-layer`, `.errl-wrapper`, `.nav-orbit .bubble` | Main DOM presentation layer. `portal-app.js` handles orbit math, audio, goo toggles, Shift +B games bubble toggle, and publishes `window.errlNavControls`. |
| **Hue system** | `window.ErrlHueController` (`src/fx/hue-controller.ts`) | One controller per logical layer (`background`, `riseBubbles`, `errl`, `nav`, `glOverlay`, `bgBubbles`). Applies CSS filters and registers WebGL hue filters when available. |
| **Portal phone UI** | `#errlPanel` | Classic panel (non-React) wired by `portal-app.js`; acts as the default control surface and shares the same globals as the dev panel. |
| **Dev panel bootloader** | `src/devpanel/runtime.ts` + `registry.ts` | Only imported when `?devpanel=true` or `localStorage.errl_devpanel_auto === '1'`. Uses the registry to render controls on demand. |

## 0.1 Debug Harness (Nov 2025)

`portal-app.js` now installs a light-weight harness that exposes profiling toggles under `window.errlDebug` for Safari/perf work:

| Method | Description |
|--------|-------------|
| `config()` | Returns a shallow copy of the current flag state. |
| `set(name, value)` / `toggle(name)` | Supports `overlay`, `orbs`, `risingBubbles`, `vignette`. Flags persist to `localStorage.errl_debug_flags_v1`. |
| `setDprCap(value, { reload })` | Caps the Pixi renderer DPR between `0.5`–`4`, or pass `null` to restore defaults (`min(devicePixelRatio, 2)`). Persists to `localStorage.errl_debug_dpr` and calls `window.errlGLSetDprCap`. Optional `{ reload: true }` forces a page reload after storing. |
| `reset({ reload })` | Restores all flags to defaults and clears persisted overrides. |
| `log()` | Console summary (helpful when handing off to Warp). |

Plumbing added in `webgl.js` ensures `window.errlGLSetDprCap(cap)` applies the new resolution immediately and triggers a resize cycle so textures regenerate.

### Layer drill-down

- **Ambient background (`ErrlBG`)**  
  - Mount: `ErrlBG.mount({ shimmer, parallax, hud, basePath })`. Default call happens at portal load when the Shimmer toggle is checked.  
  - Structure: `.errl-bg` root with `.layer.base`, `.layer.shimmer`, `.layer.vignette`; optional `.errl-hud` drip banner.  
  - Motion: pointer parallax loop (requestAnimationFrame) lives inside `ErrlBG.mount`.  

- **`#bgParticles` (L0)**  
  - Module: `src/bg-particles.js`.  
  - Behaviour: paints lighter “star” speckles with additive blending; automatically resizes to viewport.  
  - External API: none; reads no globals.  

- **`#riseBubbles` (L1)**  
  - Module: `src/rise-bubbles.js`.  
  - Behaviour: canvas particle simulation with pointer attraction, ripple rings, jumbo bubbles.  
  - Dev hooks: publishes `window.errlRisingBubbles` (`getState`, `setSpeed`, `setDensity`, `setAlpha`) used by the dev panel registry.  
  - Persists: reads/writes `localStorage.errl_rb_settings`.  

- **`.vignette-frame` (L2)**  
  - Controlled exclusively by `portal-app.js`. Vignette opacity and color respond to `#vignette*` inputs; stored in-line (not persisted).  

- **`#errlWebGL` (L3)**  
  - Module: `src/webgl.js` (PixiJS).  
  - Entry: `window.enableErrlGL()` lazily initialises Pixi. Subsequent helpers (`window.errlGLSetGoo`, `errlGLSetOverlay`, `errlGLSetBubbles`, `errlGLShowOrbs`, `errlGLSyncOrbs`, `errlGLBurst`, etc.) mutate uniforms and containers.  
  - Hue integration: registers hue filters via `window.__ErrlWebGL = { overlay, bubbles }`, which `ErrlHueController` consumes.  
  - Orbs: maintains a Pixi container that mirrors the DOM nav orbit; `portal-app.js` keeps the positions in sync.  

- **Scene DOM / phone panel (L4)**  
  - `portal-app.js` wires:  
    - Nav orbit math (`updateBubbles`) and publishes `window.errlNavControls` (speed/radius/scale + games toggle).  
    - Rising bubbles + WebGL slider bindings, burst button, randomisers, accessibility toggles, snapshot/export helpers.  
    - Background toggles (`shimmerToggle`, `vignette*`).  
  - Persists settings through various `localStorage` keys (`errl_gl_overlay`, `errl_gl_bubbles`, `errl_nav_goo_cfg`, `errl_rb_settings`, `errl_goo_cfg`, `errl_a11y`).  

- **Hue controller (cross-cutting)**  
  - Module: `src/fx/hue-controller.ts`.  
  - Manages CSS filters for DOM selectors and optional PIXI hue filters for overlay/background bubbles.  
  - Global API: `window.ErrlHueController` (timeline scrub, per-layer enable/hue/sat/intensity).  
  - Dev panel: registry polls `ErrlHueController.master.baseHue` and exposes `Hue Timeline`.  

- **Dev panel (`src/devpanel/runtime.ts`)**  
  - Boot gating: only imports when `?devpanel=true` query or `errl_devpanel_auto === '1'`.  
  - Registry: built-ins for hue timeline, WebGL goo intensity, nav orbit (`window.errlNavControls`), and rising bubbles (`window.errlRisingBubbles`).  
  - Snapshot: saves to `localStorage.errl_devpanel_snapshot`; exposes download/export.  

- **Hue-aware WebGL filters (`src/fx/hue-filter.ts`)**  
  - Waits for `window.PIXI` before registering `PIXI.filters.HueRotationFilter`.  
  - Applied by `ErrlHueController` once WebGL refs are registered.  


**Gating:** `src/portal-app.js` checks for the query/localStorage flags and dynamic-imports `devpanel/runtime`. Production bundles stay lean because the module is tree-shaken unless the flag is present.

**Global contracts we must keep stable:**

- `window.ErrlHueController.setTimeline(hue)` — adjusts hue master.
- `window.errlGLSetGoo(params)` / `window.errlGLSetOverlay(params)` / `window.errlGLSetBubbles(params)` — WebGL knobs.
- `window.errlGLSyncOrbs()`, `window.errlGLOrbHover(index, on)` — keep nav orbs aligned with WebGL replicas.
- DOM sliders (`#navOrbitSpeed`, `#navRadius`, `#navOrbSize`, etc.) that currently own state inside `portal-app.js`.

> Any new dev controls should reuse these setters instead of duplicating DOM mutations.

---

## 1. What Just Landed

- A lightweight registry (`src/devpanel/registry.ts`) that every effect module can use to expose tweakable parameters.
- A new overlay (`src/devpanel/runtime.ts`) that lazy-loads when you visit the portal with `?devpanel=true` or when `localStorage.errl_devpanel_auto === '1'`.
- Built-in controls for:
  - **Hue Timeline** – scrubs the global hue master timeline wired into `window.ErrlHueController`.
  - **WebGL Goo Intensity** – adjusts `errlGLSetGoo({ intensity })` for the Pixi displacement shader.
- Preset management: the overlay can **Save** the current values to `localStorage`, **Auto-open** itself on every visit, and **Export** the registry snapshot as JSON.

---

## 2. Enabling the Overlay

| Mode | How | Notes |
|------|-----|-------|
| One-off | Append `?devpanel=true` to any portal URL | Loads immediately but does **not** auto-open next time. |
| Persistent | Toggle **Auto-open** in the overlay header (or run `localStorage.setItem('errl_devpanel_auto','1')`) | The bootstrap code in `src/portal-app.js` detects this flag and lazy-loads the overlay on every visit. |
| Disable | Toggle **Auto-open** off or run `localStorage.removeItem('errl_devpanel_auto')` | Refresh to confirm it stays hidden. |

If neither signal is present, the dev code is never imported, so production bundles stay lean.

---

## 3. Working With Controls

Each control registered with the registry supplies:

```ts
registerControl({
  id: 'webgl.gooIntensity',
  label: 'Goo Intensity',
  group: 'WebGL',
  kind: 'slider',
  min: 0,
  max: 1,
  step: 0.01,
  getValue: () => currentValue,
  setValue: (next) => applyToEffect(next),
});
```

The overlay groups controls by `group`, renders the right input (slider/toggle), shows the current value, and calls `setValue` whenever you drag the UI.

> **Tip:** use descriptive IDs (`system.category.param`) so presets remain readable.

### Built-in Groups (as of now)

| Group | Control | Source |
|-------|---------|--------|
| `Hue` | `Hue Timeline` (0–360° scrub) | `window.ErrlHueController.setTimeline` |
| `WebGL` | `Goo Intensity` (0–1) | `window.errlGLSetGoo({ intensity })` |

Use this table as the checklist when you add more registrations (nav orbit speed, rising bubble density, etc.).

---

## 4. Presets, Exporting & Storage

- **Save** button → stores the current registry snapshot in `localStorage.errl_devpanel_snapshot`.
- **Export** button → downloads the same object as `errl-devpanel-preset.json`.
- The overlay auto-applies the saved snapshot once every registered control is available (useful when WebGL initializes later).
- Nothing writes to `.reports/` or git by default; presets are local to your browser unless you export the JSON.

Snapshot schema example:

```json
{
  "hue.timeline": 120,
  "webgl.gooIntensity": 0.62
}
```

To restore manually, import the JSON in DevTools and call:

```js
localStorage.setItem('errl_devpanel_snapshot', JSON.stringify(snapshot));
location.reload();
```

---

## 5. Extending the Panel

1. **Pick a system** you want to expose (Hue, WebGL, Rising Bubbles, Nav Goo, etc.).
2. **Ensure setters exist.** If the system only listens to DOM inputs, extract its logic into a function that can be called directly (e.g. `window.setNavOrbitSpeed(value)`).
3. **Register controls** inside the dev overlay bootstrap or, ideally, inside the module that owns the effect (so it self-registers when loaded).
4. **Document the control** (label, units, safe ranges) so people understand what they’re editing.
5. **Optional:** add `format(value)` to prettify the display (degrees, percentages, etc.).

> Keep controls cheap. The overlay polls registered controls every ~800 ms to keep the displayed value in sync, so avoid expensive getters.

---

## 6. Security / Shipping Guidelines

- Dev panel only loads in development or when a user deliberately enables it; it’s safe to ship because the bootstrap is gated and the UI floats at a high z-index without touching production UX.
- When adding controls, ensure setters validate/clamp inputs before mutating rendering code. The overlay doesn’t enforce limits beyond simple min/max/step.
- **Never** rely on the overlay for production-critical behavior; it’s intentionally hidden behind the query/localStorage gate.

---

## 7. Roadmap / Next Steps

### 7.1 Immediate (Design Pass)
- **Surface map → controls:** Finish cataloguing which sliders/toggles in `portal-app.js` map to globals vs. raw DOM updates. Document in this file so future controls hook the right source of truth.
- **Registry strategy:** Decide whether controls register next to their owning code (`portal-app.js`, `fx/hue-controller.ts`, WebGL modules) or inside a central `devpanel/register-builtins.ts` with clear imports.
- **Delivery model:** Keep the current lazy-load (`?devpanel=true`) but evaluate building a separate chunk (e.g., `devpanel.[hash].js`) to keep React entry untouched. Document the pros/cons here.

### 7.2 MVP Vertical Slice
- Add registry helpers for **Nav Orbit** (speed, radius, orb scale) and **Rising Bubbles** (speed, density, alpha) by extracting their setter logic in `portal-app.js`.
- Mirror the Shift +B “Games” toggle so the dev panel can flip it without key combos.
- Expose a read-only status block (are WebGL + Hue active? hidden bubble visible?).
- Write Playwright smoke that loads `?devpanel=true` and asserts the panel lists the new groups.

### 7.3 Stretch
- Import JSON presets (drag/drop or file picker).
- Allow grouping presets (Hue vs. WebGL vs. Orbit).
- Pipe registry snapshots into visual regression tooling (`npm run visual-test`).
- Consider optional React mount so we can reuse component library styling, but only if bundle impact stays small.

---

## Appendix A — Audit Checklist (living)

- [x] Confirm portal DOM IDs/classes still match historical selectors (`.scene-layer`, `.nav-orbit`, etc.).
- [x] Verify `window.ErrlHueController` attaches before dev panel retry limit.
- [x] Ensure WebGL setters no-op gracefully when PIXI not yet enabled (handled via retries).
- [ ] Extract reusable setter for nav orbit speed (currently local variable + RAF loop).
- [ ] Extract reusable setter for rising bubbles (today reads sliders directly).
- [ ] Document global events (e.g., custom `hueUpdate`) and how the panel should mirror them.

Keep this list in sync as we migrate more controls into the registry.

Until then, the current implementation already gives you reliable sliders for the highest-impact systems and provides the plumbing to grow into the fully fledged dev rig described in the earlier vision.
