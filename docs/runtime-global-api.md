# Errl Portal — runtime global API

**Last updated:** 2026-06-06  
**Audience:** Agents, phone panel scripts, Playwright tests

Landing exposes several `window.*` globals. Prefer `errlSceneControls` and `errlSceneScroll` for new work.

---

## Nav mode resolution

Boot order (`src/apps/landing/scripts/boot-shell.js`):

1. URL `?dom=1` or `?scene3d=0` → **DOM** nav
2. URL `?scene3d=1` → **metaball** nav
3. Else `localStorage` `errl_portal_settings_v1` → `bundle.scene.navRenderMode`
4. Default → **metaball**

Body classes: `errl-nav-mode-metaball` + `errl-scene-3d-nav` (metaball) or `errl-nav-mode-dom` (legacy).

**Migration:** Users who saved `navRenderMode: "dom"` keep DOM until they change preset or use `?scene3d=1`. DOM nav remains a permanent escape hatch (`?dom=1`).

---

## `window.errlSceneControls`

Defined in `src/apps/landing/scene/bridge/sceneControls.ts`, mounted by `scene-controls-init.ts`.

| Method | Purpose |
|--------|---------|
| `getSceneSettings()` | Full `bundle.scene` snapshot |
| `getNavRenderMode()` | `'dom' \| 'metaball'` (URL overrides storage) |
| `getMetaball()` / `getSculpture()` | Slider groups |
| `setMetaball(partial)` / `setSculpture(partial)` | Patch + persist |
| `patchSceneSettings(partial)` | Presets, nav mode |
| `buildSceneQuery()` | Shareable `?scene3d=1&scenePreset=` fragment |
| `subscribe(fn)` | Live updates |
| `reloadFromStorage()` | Re-read after `portal-app` `setBundle` |

**Event:** `errl:scene-controls-changed` — `{ detail: { settings } }`

**Storage key:** `errl_portal_settings_v1` → `bundle.scene`

---

## `window.errlSceneScroll`

Defined in `src/apps/landing/scene/scroll/scrollBridge.ts`, mounted by `ScrollNavDrive` in main phase.

| Method | Purpose |
|--------|---------|
| `getState()` | `{ progress, velocity, angleOffsetDeg, radiusOffset, centerOffsetY }` |
| `setInfluence(n)` | Sculpture scroll pull (0–2) |
| `setEnabled(bool)` | Master toggle; `?scrollNav=0` disables at boot |

**Event:** `errl:scroll-nav` — same shape as `getState()`

**Consumers:** `portal-app.js` `placeBubble`, `useNavPhysics.ts`, `orbitLayout.ts` (center offset), ambient RB `setScrollDrift`.

When Lenis runway is active, wheel listeners are skipped; Lenis feeds `setScrollProgress()` directly.

---

## `window.errlRisingBubblesThree`

Defined in `src/apps/landing/scripts/rise-bubbles-three.js` (bundled Three).

| Method | Purpose |
|--------|---------|
| `setScrollDrift(progress)` | Subtle vertical drift from scroll bus (ambient mode) |
| `setCollectScore(n)` | Classic/collect modes only |

Default mode: **ambient** (no score HUD).

---

## Pixi / WebGL layer (`webgl.js`)

| Global | Purpose |
|--------|---------|
| `errlGLShowOrbs(bool)` | Toggle GL nav mirror orbs |
| `errlGLSyncOrbs()` | Sync GL positions to DOM bubbles |
| `errlGLRebuildNavOrbs()` | Rebuild after skin change |
| `errlGLSetBubbles(opts)` | Background particle layer |
| `errlGLSetOverlay(opts)` | GL overlay alpha/offset |
| `errlGLBurst(x, y, count)` | Particle burst |
| `errlGLOrbHover(index, on)` | Hover highlight |

Guarded when `body.errl-nav-mode-metaball` — GL nav orbs hidden.

---

## Hue bus

| Global | Purpose |
|--------|---------|
| `ErrlHueController` | Layer tinting (nav, particles, overlay, etc.) |
| Event `hueUpdate` | `{ detail: { layer, hue, sat, inten } }` |

---

## Boot shell

| Global | Purpose |
|--------|---------|
| `window.__errlBootShell` | `{ dev, scene3d, domOverride, skipIntro, unlocked, navMode }` |

---

## Test URLs

| URL | Expect |
|-----|--------|
| `/?skipIntro=1` | Metaball nav, 4 `.errl-metaball-link` |
| `/?skipIntro=1&dom=1` | DOM `#navOrbit` bubbles visible |
| `/?dev=1&skipIntro=1` | Phone unlocked |
| `/?scrollNav=0` | Scroll does not shift orbit |
| `/gallery/` | Floating Hall + room sections |
| `/fx/metaball-lab/` | WebGL SDF lab only |

**Tier A:** `npm run test:tier-a` (local), `npm run test:prod:tier-a` (production)
