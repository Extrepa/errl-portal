# Portal Structure (2025-11-11)

This document captures what stays inside `src/portal/` after pruning unused artifacts. Use it as the source of truth when deciding where new assets should live.

## Active layout

| Path | Purpose | Notes |
| --- | --- | --- |
| `src/index.html` | Landing page shell | Loads the Errl hero, canvases, and portal controls. All runtime scripts/styles reference the folders below. |
| `src/portal/core/` | Runtime glue | `assets.js`, `bg-particles.js`, `rise-bubbles.js`, `webgl.js`, and `portal-app.js` bootstrap the layered canvases + PIXI scene. Anything that runs before React lives here now. |
| `src/portal/app/` | React Studio hub | Houses `App.tsx`, router, hub page, and React bridges to experiments (`Studio.tsx`, `StudioMathLab.tsx`). `/studio` and `/studio/*` routes are defined here. |
| `src/portal/dev/` | Debug tooling | `dev/debug.ts` injects feature flags, overlay toggles, and canvas inspectors. Included via `<script type="module">` in `index.html`; keep TypeScript here so we can ship lean JS. |
| `src/assets/portal/` | Art + layered textures | Organized by render layer (L0 background → L6 secret). Shared hero art, goo masks, and nav skins live here so every build references a single source of truth. |
| `src/assets/shared/` | Shared effects + experiments | Bubble sprite sheets, dev app icons, orb skins, and other reusable textures. |
| `src/legacy/portal/pages/` | Standalone HTML experiences | Each subdirectory (about, gallery, assets, games, events, merch, dev, studio, pin-designer, etc.) maps to a Vite multi-page entry declared inside `vite.config.ts`. Only ship assets that those pages import directly. |
| `src/portal/app-legacy.js` | Legacy DOM wiring | Still loaded by `index.html` to support older feature flags. Keep until we delete the legacy panel entirely. |
| `src/portal/index.html` | Redirect helper | Simple HTML redirect that catches anyone opening `/portal/` directly and routes them to the main landing page. |

## Archived items

Anything that is no longer referenced from the runtime tree is moved into `archive/portal-attic/` (see that README for per-file notes). This keeps the bundle lean while still preserving history.

## Adding new assets

1. **Hero / landing visuals** → drop into `src/assets/portal/L*/` using the existing layer convention so z-index math stays predictable.
2. **Portal-wide JS** → co-locate inside `src/portal/core/` and import it from `src/index.html`.
3. **Shared textures/experiments** → use `src/assets/shared/` so React/Vite imports can use `@assets/shared/...`.
4. **Standalone demo/page** → scaffold under `src/legacy/portal/pages/<name>/` and add an entry inside `vite.config.ts`.
4. **Experiments or large raw exports** → put them straight into `archive/portal-attic/` with a short note unless they are required at runtime.

Keeping this separation ensures the main portal stays fast while we still retain the prototypes for future reference.

### Link rewriting helper

- `src/index.html` sets every orbit bubble + legacy iframe with a `data-portal-link`/`data-portal-frame` pointing at `pages/...`.
- A tiny inline script rewrites those attributes to `/legacy/portal/...` at runtime. This keeps the legacy HTML tree online (dev + prod) without hard-coding the prefix multiple times.
- React wrappers use `src/portal/app/utils/portalPaths.ts` to do the same for Math Lab/Shape Madness/Pin Designer. Prefer the helper (or the `data-portal-link` pattern) whenever you add new links so we don’t reintroduce `legacy/portal/legacy/portal` style URLs.

## Portal pages overview

| Page | Linked from landing? | Status / Notes |
| --- | --- | --- |
| `legacy/portal/pages/about` | ✅ | Main “About Errl” bubble; part of primary nav. |
| `legacy/portal/pages/gallery` | ✅ | Gallery bubble + hero CTA. |
| `legacy/portal/pages/assets` | ✅ | Assets bubble; still referenced in nav orbit. |
| `legacy/portal/pages/pin-designer` | ✅ | Pin Designer bubble; hosts the enamel designer. |
| `legacy/portal/pages/studio` | 🔁 (via `/studio` hub) | Legacy HTML experiences (Math Lab, Shape Madness, SVG Colorer, Pin Widget). React hub wraps these via iframes/routes. |
| `legacy/portal/pages/dev` | ❌ | Only reachable via direct URL/debug link. Keep for now (dev controls) but consider gating behind query param or promoting if still useful. |
| `legacy/portal/pages/events` | ❌ | Legacy events listing; no nav link. Move to attic if unused after review. |
| `legacy/portal/pages/merch` | ❌ | Merch explorations; confirm before keeping in runtime. |
| `legacy/portal/pages/games` | ❌ | Hidden bubble triggered via keyboard. Decide if we still want it discoverable; otherwise archive. |
| `legacy/portal/pages/studio/math-lab` | ✅ (via Studio) | Loaded from Studio menu. |
| `legacy/portal/pages/studio/shape-madness` | ✅ (via Studio) | Linked from Studio. |
| `legacy/portal/pages/studio/pin-widget` | ✅ (via Studio) | Designer used by Studio; now cleaned up with only necessary assets. |
| `legacy/portal/pages/studio/svg-colorer` | ✅ (via Studio) | Linked from Studio experiments. |

### Detailed inventory

- **About / Gallery / Assets / Pin Designer / Studio hubs**  
  Each of these folders exposes an `index.html` (plus supporting CSS/JS inline) and only references shared art stored under `src/assets/portal/L*`. No extra local assets present except for the Gallery, which now loads thumbnails from `%BASE_URL%assets/legacy/gallery/recent/` so they don’t bloat the runtime bundle.  
  - Gallery manifest lives at `pages/gallery/manifest.json` for future pagination logic.
- **Assets microsites**  
  `pages/assets/` hosts the main index plus a series of subfolders for historical builds (`errl-head-coin*`, `errl-face-popout`, `walking-errl`, `errl-loader-original-parts`). These are still reachable from the Assets page cards. There is also a `new projects/` folder containing three HTML prototypes (Errl Loader + two shatter loaders) that are *not* linked anywhere; keep them for reference but consider moving them to `archive/portal-attic/projects-prototypes` if they remain unused.
- **Studio sub-pages**  
  - `studio/math-lab`, `studio/shape-madness`, `studio/svg-colorer`, and `studio/pin-widget` all ship their own assets (`studio/assets`, `svg-colorer/assets/errl.svg`, pin-widget SVGs).  
  - The new React hub surfaces Math Lab at `/studio/math-lab` and points to the other legacy experiments for now. Assets stay beside their pages until the React bridges land.
- **Dev / Events / Merch / Games**  
  Each folder only contains an `index.html` file and currently references shared portal art. Even though they’re unlinked from the orbit nav (except Games via hidden shortcut), we’re keeping them live per your guidance.
