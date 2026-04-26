# Errl Phone: capabilities and extension guide

**Status:** Current as of 2026-04-26  
**Audience:** Implementers extending the landing “Errl Phone” control panel, WebGL layer, or related tests.

This document describes behaviors added or hardened in the Errl Phone / portal UX work (reliability, copy, CTA, layers). It is the durable reference; session detail lives in `05-Logs/Daily/2026-04-22-cursor-notes.md`.

---

## What the Errl Phone is

- **UI:** `aside#errlPanel` — tabbed control surface (HUD, Nav, RB, GLB, BG, Pin, Hue, Dev, etc.).
- **Code:** Markup in [`src/index.html`](../../src/index.html), behavior in [`src/apps/landing/scripts/portal-app.js`](../../src/apps/landing/scripts/portal-app.js), layout in [`src/apps/landing/styles/styles.css`](../../src/apps/landing/styles/styles.css).

The phone can start **minimized** (bottom-right “bubble”); see CTA and discoverability below.

---

## Visual layer model (do not confuse these)

| Layer / tab | Canvas / system | Role |
|-------------|-----------------|------|
| **Rising Bubbles (RB)** | `#riseBubbles` (Three.js, [`rise-bubbles-three.js`](../../src/apps/landing/scripts/rise-bubbles-three.js)) | Foreground-y bubble field: grab, throw, flick, Pop mode, etc. |
| **GL Particles / GLB** | WebGL (Pixi / ErrlFX, [`webgl.js`](../../src/apps/landing/scripts/webgl.js)) | **Background** GPU bubble layers *behind* the scene; sliders `bgSpeed`, `bgDensity`, `glAlpha`. |
| **Background (BG tab)** | ErrlBG DOM + optional shimmer/vignette | **Static** page background system; toggles *mount* ErrlBG when needed. Shimmer and vignette are *not* the same as the GLB particle sliders. |
| **GL overlay (BG tab)** | WebGL gradient overlay in `webgl.js` | Screen-space gradient; **Alpha / DX / DY** — wobble/ripple; pointer-driven when active. |
| **Scene tint (HUD)** | `errlGLSetMood` | Subtle color grade on the **WebGL** stack (mood buttons). |

**Hue tab:** Use **Target** to pick which material layer to tint (e.g. `Particles` = GLB background bubbles, not RB).

When adding features, name which layer in UI copy to avoid “nothing happens” reports.

---

## WebGL init contract (`webgl.js`)

`init()` is synchronous up to the point it assigns `img.src`; the Errl **texture** finishes in `img.onload`. Anything that needed `particles`, `bubblesFXLayers`, `filter` (goo), `moodFilter`, or `overlay` used to run **before** onload and silently no-op.

**Current behavior**

- **Pending queues** flush in `runPostInitFlush()` after the texture loads and the stage is ready.
- Covered APIs: burst, `errlGLSetBubbles`, `errlGLSetGoo`, `errlGLSetMood`, `errlGLSetOverlay`, `errlGLShowOrbs`.
- **`window.errlGLLoaded`** is set `true` after a successful flush path.
- **`errl:webgl-ready`** — `window` event (bubbling) when the layer is ready for consumers.
- **`errl:webgl-unavailable`** — e.g. missing canvas or `PIXI` (burst path).
- **`errl:webgl-error`** — e.g. texture `onerror` (load failure).

**UI:** [`portal-app.js`](../../src/apps/landing/scripts/portal-app.js) can show a line in `#errlGlHint` (HUD) on unavailable/error. Burst tooltip in HTML references WebGL + Pixi.

**Call pattern for cold start:** `enableErrlGL()` is invoked from `setBubs`, rotate skins, `glbRandom` / `navRandom`, and Slow Gradient so slider-driven state merges into the queue instead of being dropped.

**Extension idea:** If you add new WebGL APIs that run before onload, either queue parameters the same way or require `errlGLLoaded` in your call site.

---

## localStorage keys (user-facing / migration)

| Key | Purpose |
|-----|--------|
| `errl_phone_cta_dismissed_v1` | First-visit “Customize” chip dismissed or cleared by opening the phone. |
| `errl_pin_tour_dismissed_v2` | Pin tab tour banner dismissed; **`v2`** re-shows the expanded copy once for users who only had `v1` stored. |
| `errl_phone_expanded_v1`, `errl_phone_expanded_pos_v1`, `errl_phone_min` | Phone expand/minimize/position (existing). |
| `errl_rb_score_state_v3` | Rising Bubbles scoring state (`session`, `lifetime`, `high`, mode meta). |
| `errl_rb_mode_scores_v2`, `errl_rb_mode_high_v2`, `errl_rb_collect_high_v1` | Legacy keys read once by migration into `v3`. |

When changing tour or CTA copy, bump a version in the key if you need a one-time re-show (same pattern as Pin v2).

---

## DOM and CSS hooks (new or notable)

| Id / class | Role |
|------------|------|
| `#errlGlHint` | Short WebGL status / error line under Burst (HUD). |
| `#errlPhoneCtaHint` | One-time CTA; **Got it**; hidden when the panel opens. |
| `#errlIdleStreak` + `.errl-idle-streak__line` | Rare horizontal streak; disabled for `reduced-motion` / `prefers-reduced-motion`. |
| `.sliderRow--a11y` | Accessibility rows: full text labels, no ellipsis. |
| `.panel-minimized-label` | “Customize” under the minimized fab (not centered *inside* the 52px circle). |
| `.pin-tour-show-btn` (`#pinTourShow`) | Re-opens the Pin tour. |

---

## Tests

- Primary spec: [`tests/errl-phone-controls.spec.ts`](../../tests/errl-phone-controls.spec.ts) — includes Burst (wait for GL readiness), a11y label not truncated, CTA node smoke, tabs, RB/Nav/Hue/GLB, etc.
- **Note:** Full Playwright runs need the Vite dev server stable; `ERR_CONNECTION_REFUSED` in long runs usually means the server stopped—re-run or narrow with `-g`.

---

## Rising Bubbles multi-mode scoring

- **Classic Throw:** scores off-screen throws and flick hits; combo multiplier increases when qualifying throws chain within a short window.
- **Pop:** scores each pop with a cadence multiplier based on recent pop speed (decays with idle gaps).
- **Collect:** scores overlap collection with streak multiplier; long inactivity resets streak.
- **Totals:** HUD shows mode score (session), mode high, and lifetime total.
- **HUD labeling:** top-left score label uses the active mode name (`Classic Throw`, `Pop`, `Collect`) instead of generic wording.
- **Architecture:** scoring reducer + storage adapter live in [`portal-app.js`](../../src/apps/landing/scripts/portal-app.js); engine emits scoreable interaction events from [`rise-bubbles-three.js`](../../src/apps/landing/scripts/rise-bubbles-three.js).

---

## Future work ( ideas to build on )

- **Bubbles / textures:** `bubbles-pixi` may log `BubblesFX texture load failed`; fallbacks exist—validate `BASE_URL` in production and asset paths if reports persist.
- **ErrlBG vs GL:** Consider an “Advanced” collapse for BG if the tab stays long; keep GL overlay help text next to Alpha/DX/DY.
- **Idle streak:** Tune interval/density or tie to a perf-safe / “trippy” preset; keep gated on reduced motion.
- **Events:** Listeners for `errl:webgl-ready` can drive enabling Burst styling or lazy features without polling `errlGLLoaded`.

---

## File checklist for changes in this area

- [`src/apps/landing/scripts/webgl.js`](../../src/apps/landing/scripts/webgl.js) — init, queues, public `window` APIs.
- [`src/apps/landing/scripts/portal-app.js`](../../src/apps/landing/scripts/portal-app.js) — phone UI, setBubs, Pin tour, CTA, streak, hints.
- [`src/index.html`](../../src/index.html) — panel markup, copy, `#errlGlHint`, CTA, streak container.
- [`src/apps/landing/styles/styles.css`](../../src/apps/landing/styles/styles.css) — panel, a11y rows, CTA, streak, minimized label.
- [`tests/errl-phone-controls.spec.ts`](../../tests/errl-phone-controls.spec.ts) — regressions for phone + GL readiness.

After deploying, confirm production matches this branch (cached bundles on `errl.wtf` can look like an “old” DEV tab layout in screenshots).
