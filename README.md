# Errl Portal

A multi-app epic webapp / website / landing page to showcase our friend group mascot with trippy, experimental visuals and experiences.

## Vision
- Central landing hub that links and embeds multiple webapps/experiences
- Emphasis on playful, "trippy" visuals featuring Errl, our mascot
- Interactive portal with WebGL effects, goo animations, and customizable parameters

## Structure

### Main Pages
- `src/index.html` — Main interactive portal
- `src/portal/pages/about/index.html` — About Errl and the project
- `src/portal/pages/gallery/index.html` — Art gallery
- `src/portal/pages/projects/index.html` — Projects showcase
- `src/portal/pages/studio/index.html` — Studio hub for interactive labs
- `src/portal/pages/events/index.html` — Events archive
- `src/portal/pages/merch/index.html` — Merch concepts
- `src/portal/pages/games/index.html` — Games (keyboard shortcut bubble)

### Apps & Tools (Studio)
- `src/portal/pages/pin-designer/` — Enamel pin designer tool
- `src/portal/pages/studio/math-lab/` — 100-effect Math Lab playground
- `src/portal/pages/studio/shape-madness/` — Shape Madness effect gallery
- `src/portal/pages/studio/pin-widget/` — Pin widget designer + prefab assets
- `src/portal/pages/studio/svg-colorer/` — SVG color customizer
- `src/portal/pages/dev/` — Dev panel + live controls

### Effects & Assets
- `src/fx/` — Visual effects system (TS + some JS): hue filters, bubbles, goo, background particles
- `src/assets/` — General/shared assets (bubbles, artwork)
- `src/portal/assets/` — Portal-specific assets (e.g., `central/errl-painted-2.svg`, textures)

### Project Docs
- `docs/` — planning, ADRs, journal, and design notes (no builds)
  - See `docs/README.md` for structure and conventions

### Navigation Flow
```
index.html (Main Portal)
  ├─→ portal/pages/about/index.html
  ├─→ portal/pages/gallery/index.html
  ├─→ portal/pages/projects/index.html
  ├─→ portal/pages/pin-designer/index.html
  ├─→ portal/pages/studio/index.html
  │      ├─→ studio/math-lab/index.html
  │      ├─→ studio/shape-madness/index.html
  │      ├─→ studio/svg-colorer/index.html
  │      └─→ studio/pin-widget/ErrlPin.Widget/designer.html
  ├─→ portal/pages/events/index.html
  ├─→ portal/pages/merch/index.html
  └─→ portal/pages/games/index.html
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

## Studio — Math Lab

A playground of **100 interactive mathematical effects** (Canvas, SVG, CSS) living at `/studio/math-lab/`.

### Run It
```bash
npm run dev
# ➜ http://localhost:5173/studio/math-lab/
```

### QA Checklist
- Confirm the dev server boots without errors and the Math Lab route loads.
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
