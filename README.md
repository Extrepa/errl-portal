# Errl Portal

A multi-app epic webapp / website / landing page to showcase our friend group mascot with trippy, experimental visuals and experiences.

## Vision
- Central landing hub that links and embeds multiple webapps/experiences
- Emphasis on playful, "trippy" visuals featuring Errl, our mascot
- Interactive portal with WebGL effects, goo animations, and customizable parameters

## Structure

### Main Pages & Routes
- `src/index.html` — Main interactive portal
- `src/portal/app/pages/Studio.tsx` — React Studio hub at `/studio`
- `src/portal/app/pages/StudioPinDesigner.tsx` — Pin Designer bridge at `/studio/pin-designer`
- `src/portal/app/pages/StudioMathLab.tsx` — Math Lab bridge at `/studio/math-lab`
- `src/portal/app/pages/StudioShapeMadness.tsx` — Shape Madness bridge at `/studio/shape-madness`
- `src/studio/app/ErrlLiveStudio.tsx` — Code Lab at `/studio/code-lab`
- `src/legacy/portal/pages/about/index.html` → served at `/portal/pages/about/` — About Errl and the project
- `src/legacy/portal/pages/gallery/index.html` → `/portal/pages/gallery/` — Art gallery
- `src/legacy/portal/pages/assets/index.html` → `/portal/pages/assets/` — Assets showcase
- `src/legacy/portal/pages/events/index.html` → `/portal/pages/events/` — Events archive
- `src/legacy/portal/pages/merch/index.html` → `/portal/pages/merch/` — Merch concepts
- `src/legacy/portal/pages/games/index.html` → `/portal/pages/games/` — Games (keyboard shortcut bubble)

### Legacy Apps & Experiments
- `src/legacy/portal/pages/pin-designer/` → `/portal/pages/pin-designer/` — Enamel pin designer tool (now embedded at `/studio/pin-designer` via shared asset bridge)
- `src/legacy/portal/pages/studio/math-lab/` → `/studio/math-lab` — 100-effect Math Lab playground
- `src/legacy/portal/pages/studio/shape-madness/` → `/studio/shape-madness` — Shape Madness effect gallery
- `src/legacy/portal/pages/studio/pin-widget/` → `/portal/pages/studio/pin-widget/` — Pin widget designer + prefab assets
- `src/legacy/portal/pages/studio/svg-colorer/` → `/portal/pages/studio/svg-colorer/` — SVG color customizer
- `src/legacy/portal/pages/dev/` → `/portal/pages/dev/` — Dev panel + live controls

### Effects & Assets
- `src/fx/` — Visual effects system (TS + some JS): hue filters, bubbles, goo, background particles
- `src/assets/shared/` — General/shared assets (bubbles, dev icons, experiment art)
- `src/assets/portal/` — Layered Errl art + phone UI sprites used by the landing page
- `src/assets/legacy/` — Media referenced by the legacy HTML exports (e.g., gallery thumbnails)

### Project Docs
- `docs/` — planning, ADRs, journal, guides (no builds)
  - `docs/journal/` — dated updates, including `TEAM_UPDATE_*` and legacy `notes/`
  - `docs/team/` — onboarding + system guides (`GETTING_STARTED.md`, `DEV-SYSTEM-GUIDE.md`, `SAFETY_REFERENCE.md`, etc.)
  - See `docs/README.md` for structure and conventions

### Legacy Artifacts
- Archived kits and historical HTML exports now live under `archive/legacy/`
  - `archive/legacy/README.md` explains the contents
  - For the original layout with these files at repo root, see branch `archive/legacy-kits`

### Navigation Flow
(Source files live under `src/legacy/portal/pages` but routes build to `/portal/pages/...`.)
```
index.html (Main Portal)
  ├─→ /portal/pages/about/index.html
  ├─→ /portal/pages/gallery/index.html
  ├─→ /portal/pages/assets/index.html
  ├─→ /portal/pages/pin-designer/index.html
  ├─→ /studio (React hub)
  │      ├─→ /studio/code-lab (Errl Live Studio)
  │      ├─→ /studio/math-lab (legacy Math Lab iframe)
  │      ├─→ /studio/shape-madness (legacy Shape Madness iframe)
  │      ├─→ /studio/pin-designer (legacy Pin Designer iframe + asset bridge)
  │      └─→ /portal/pages/studio/svg-colorer/index.html (pending React bridge)
  ├─→ /portal/pages/events/index.html
  ├─→ /portal/pages/merch/index.html
  └─→ /portal/pages/games/index.html
```

## Development

### Build
```bash
npm run build
```

### Local Dev
Vite is configured with `src/` as root. Run a dev server to work on any HTML page:
```bash
npm run dev
```

### Tests
Playwright UI tests cover the portal and studio experiences:
```bash
npm run test
```

### Tooling Commands
- `npm run portal:doctor:structure` — sanity-check current folder layout
- `npm run portal:safety-check` — run safety automation (CLI wrapper)
- `npm run studio:dev` — start dedicated studio dev/preview processes (uses `vite.studio.config.ts`)
- `npm run studio:build` — build the standalone studio bundle

## Studio — Math Lab

A playground of **100 interactive mathematical effects** (Canvas, SVG, CSS) now reachable via the React hub at `/studio/math-lab`.

### Run It
```bash
npm run dev
# ➜ http://localhost:5173/studio/math-lab
```

### QA Checklist
- Confirm the dev server boots without errors and the Math Lab card opens the iframe inside the Studio hub.
- Tabs should swap between effects with live Canvas/SVG/CSS updates.
- Slider/toggle controls must re-render visuals without console errors.
- Basic responsive layout should hold on tablet/mobile widths.
- Watch CPU/GPU load at default presets; clamp any heavy settings if needed.

### Dev Testing
```bash
npm i -D @playwright/test
npx playwright install
npx playwright test
```

### Upcoming Enhancements
- PNG/SVG export buttons (per effect)
- Preset save/load + sharable URLs
- Category filters / search
- Dev-only FPS overlay toggle

## Recent Changes
- Reorganized pages under `src/portal/pages/*`; standardized Back to Portal links
- Ported About page to `src/portal/pages/about/index.html` with animated eyes/mouth
- Updated Vite base path for GitHub Pages; removed redundant workflow
- Switched page scripts to ES modules; added file:// fallback in `src/index.html`
- Centralized portal assets under `src/portal/assets/central` (Errl face/painted)
