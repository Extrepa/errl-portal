# Update — Errl Studio integration (Nov 2025)

This doc summarizes the Studio work shipped into this repo so another assistant can quickly pick up where we left off.

## Overview
- New Studio experience lives under `/studio` (Vite multi-page: `src/studio.html`).
- App entry renders `src/apps/ErrlLiveStudio.tsx`, a multi-tab workspace: Code, SVG, Photos.
- URL deep-links: `#code`, `#svg`, `#photos` (hash updates on tab change and restores on load).

## Code tab (live HTML/CSS/JS)
- Monaco editors for HTML, CSS, JS; debounced live preview in a sandboxed iframe.
- Console bridge mirrors `console.log/info/warn/error` to an in-app console pane.
- Assets drawer: upload files → stored as Data URLs; copy/remove; included in exports.
- Export options:
  - Single-file HTML (`errl_project.html`).
  - Open Preview (blob URL).
  - Zip export (`errl_project.zip`) with `index.html` + `/assets/*` (JSZip via CDN).
- Formatting:
  - Format HTML (DOMParser/XMLSerializer best-effort).
  - Format CSS and JS (Prettier via CDN: standalone + babel + postcss plugins).
- Presets (`src/apps/studioPresets.json`): Blank, Rising Bubbles, Errl SVG Playground.

## Photos tab (Fabric.js mini editor)
- Loads Fabric via CDN on demand.
- Canvas tools:
  - Add Text; Upload Image; Stickers: Star, Heart, Errl Face (uses `/src/portal/assets/L4_Central/errl-face-2.svg`).
  - Arrange: Select All, Bring Forward/Back, Bring To Front/Back, Crop to Selection, Delete.
  - Alignment/Distribution: align left/center/right/top/middle/bottom; distribute H/V across selection.
  - Layer list: Select, Show/Hide, Lock/Unlock per object.
  - Toggles: Grid, Transparent BG.
- Export: PNG and JPEG.

## SVG tab (path tooling)
- Import SVG; converts shapes to paths (supports: path, rect, circle, ellipse, line, polyline, polygon).
- Path list: visibility toggle, per-path fill/stroke/stroke-width/opacity, copy `d`, remove.
- Optimize: precision-based rounding of numeric tokens in `d` (and strokeWidth/opacity), with before→after char count and % reduction.
- Animate: live CSS-based controls (rotate deg/s, pulse scale, dashed stroke speed/length) applied to a wrapping `<g>`; export includes embedded animation `<style>`.
- Compare: load A (current) vs B (secondary SVG) side-by-side for visual diff.
- Export: SVG and HTML; Quick Action to load the preferred Errl face SVG.

## UI kit and infrastructure
- Minimal UI primitives added under `src/components/ui/`: `button`, `card`, `input` (forwardRef), `scroll-area`, `badge`, `tabs` (supports controlled `value` and `onValueChange`).
- Router points `/studio` to the new page; default route also points to Studio.
- Vite alias and TS config:
  - `vite.config.ts`: alias `@` → `src` (already wired), multi-page input includes `src/studio.html`.
  - `tsconfig.json`: `jsx: react-jsx`, alias path mapping, and excluded heavy `src/fx/**/*` from typecheck.
- Typecheck passes with `npm run typecheck`.

## Files touched/added (high level)
- `src/apps/ErrlLiveStudio.tsx` — main Studio app.
- `src/apps/svg/SVGTab.tsx` — SVG tools (Edit, Optimize, Animate, Compare).
- `src/apps/studioPresets.json` — Code tab presets.
- `src/components/ui/*` — minimal UI components.
- `src/pages/Studio.tsx`, `src/router.tsx`, `src/studio.html` — route + page wiring (Studio default).
- Config: `vite.config.ts`, `tsconfig.json` updated for alias/JSX.

## External CDNs used (no build-time deps)
- Prettier: `https://cdn.jsdelivr.net/npm/prettier@3.3.3/...` (standalone, babel, postcss, estree).
- JSZip: `https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js`.
- Fabric.js: `https://cdn.jsdelivr.net/npm/fabric@5.3.0/dist/fabric.min.js`.

## Notes and conventions
- Hash deep-links: `#code`, `#svg`, `#photos` are the canonical top-level tabs.
- Preferred Errl face SVG: `/src/portal/assets/L4_Central/errl-face-2.svg`.
- All references use the “Errl” spelling and “Studio” naming.

## How to run
- `npm install`
- `npm run dev`
- Open `http://localhost:5173/studio.html` (or the served Studio page) and use the top tabs.

## Next up (queued items)
- SVG: boolean path ops, group/ungroup, path reordering with drag, per-path transforms.
- Code: workerized formatters and lint hints; embed Prettier locally if desired.
- Photos: shape tools, filters, align/distribute to canvas edges, sticker packs.
- PWA/offline: service worker and manifest.
- Presets management: save current project as a new preset.
