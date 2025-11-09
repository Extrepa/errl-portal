# 🎮 Errl Dev Panel — Practical Guide

This guide documents the *actual* development overlay that now ships with the portal. It replaces the aspirational notes about a Pixi-era dev system.

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

1. Register more controls (nav orbit speed, rising bubble density, phone persistence toggles, ripple settings).
2. Add an **Import** button so QA can drag a preset JSON back onto the page.
3. Support grouped presets (e.g., Hue vs. WebGL) for faster comparisons.
4. Surface registry metadata in tests so Playwright can load official presets before running visual checks.

Until then, the current implementation already gives you reliable sliders for the highest-impact systems and provides the plumbing to grow into the fully fledged dev rig described in the earlier vision.
