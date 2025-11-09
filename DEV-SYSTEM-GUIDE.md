# 🎮 Errl Dev Panel — Practical Guide

This guide documents the *actual* development overlay that now ships with the portal. It replaces the aspirational notes about a Pixi-era dev system.

---

## 0. Architecture Snapshot (Nov 2025)

| Layer | Selector / Hook | Notes |
|-------|-----------------|-------|
| **Background canvases** | `#bgParticles`, `#riseBubbles` | Plain 2D canvas effects (`src/bg-particles.js`, `src/rise-bubbles.js`). Controlled via panel sliders (`rb*`, `bg*` inputs). |
| **WebGL overlay** | `#errlWebGL` + PIXI runtime (`window.errlGL*`, `window.enableErrlGL`) | Lazily initialised; exposes setters for goo, overlay, orbit scale, burst, etc. |
| **Scene DOM** | `.scene-layer`, `.errl-wrapper`, `.nav-orbit .bubble` | Positions nav bubbles, toggles hidden Games orb on Shift +B, applies audio + glow via `portal-app.js`. |
| **Hue system** | `window.ErrlHueController` (`src/fx/hue-controller.ts`) | Manages global hue timeline and per-layer hue targets. Dev panel scrubs `master.baseHue`. |
| **React overlay** | `#errlPanel` (portal phone UI) | Driven by `portal-app.js` DOM bindings; not part of dev panel but shares sliders and toggles the same globals. |
| **Dev panel bootloader** | `src/devpanel/runtime.ts` + `registry.ts` | Loaded only when `?devpanel=true` or `localStorage.errl_devpanel_auto === '1'`. Renders controls from registry. |

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
