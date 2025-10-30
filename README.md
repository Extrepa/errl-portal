# Errl Portal

A multi-app epic webapp / website / landing page to showcase our friend group mascot with trippy, experimental visuals and experiences.

## Vision
- Central landing hub that links and embeds multiple webapps/experiences
- Emphasis on playful, "trippy" visuals featuring Errl, our mascot
- Interactive portal with WebGL effects, goo animations, and customizable parameters

## Structure

### Main Pages
- `src/index.html` - Main interactive portal (new unified version)
- `src/about.html` - About Errl and the project
- `src/apps/index.html` - Apps gallery/launcher

### Apps & Tools
- `src/apps/pin-designer/` - Enamel pin designer tool
- `src/apps/tools/` - Various dev tools (Atlas Builder, Asset Builder, etc.)
- `src/apps/dev/` - Development panel for live parameter tuning

### Effects & Assets
- `src/fx/` - Visual effects system (TypeScript)
  - Hue filters, bubble effects, goo animations
  - Background particle systems
- `src/assets/` - General assets (bubbles, backgrounds, generated art)
- `src/portal/assets/` - Layered portal assets (L0-L6)

### Navigation Flow
```
index.html (Main Portal)
  ├─→ about.html (About Errl)
  ├─→ apps/index.html (Gallery/Apps)
  ├─→ apps/pin-designer/index.html
  └─→ apps/tools/index.html
```

## Development

### Build
```bash
npm run build
```

### Local Dev
Vite is configured with `src/` as root. Open any HTML file directly or use a local server.

## Recent Changes
- Merged `public/` into `src/` for unified structure
- Archived old portal version to `archive/portal-pixi-gl-20251030/`
- Consolidated TypeScript sources (removed duplicate .js files)
- Updated all navigation links to point to new main portal
