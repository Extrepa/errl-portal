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
- `src/portal/pages/projects/index.html` — Projects
- `src/portal/pages/tools/index.html` — Tools

### Apps & Tools
- `src/portal/pages/pin-designer/` — Enamel pin designer tool (embedded)
- `src/portal/pages/tools/` — Atlas Builder, Asset Builder, Pin Widget, etc. (embedded pages)
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
  └─→ portal/pages/tools/index.html
```

## Development

### Build
```bash
npm run build
```

### Local Dev
Vite is configured with `src/` as root. Open any HTML file directly or use a local server.

## Recent Changes
- Reorganized pages under `src/portal/pages/*`; standardized Back to Portal links
- Ported About page to `src/portal/pages/about/index.html` with animated eyes/mouth
- Updated Vite base path for GitHub Pages; removed redundant workflow
- Switched page scripts to ES modules; added file:// fallback in `src/index.html`
- Centralized portal assets under `src/portal/assets/central` (Errl face/painted)
