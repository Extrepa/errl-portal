# Errl Portal Architecture

This document provides a comprehensive overview of the Errl Portal architecture, structure, and organization.

## Overview

The Errl Portal is a multi-app web experience featuring:
- Interactive landing page with WebGL effects, particle systems, and customizable parameters
- React Studio hub for accessing various creative tools
- Legacy HTML pages for content (About, Gallery, Assets, Events, Merch, Games)
- Multiple experimental tools (Math Lab, Shape Madness, Pin Designer, SVG Colorer)

## Directory Structure

### Source Code (`src/`)

#### Landing Page
- `src/index.html` - Main interactive portal landing page
  - Loads Errl hero, canvases, and portal controls
  - Contains navigation bubbles and effects panel (Errl Phone)
  - All runtime scripts/styles reference folders below

#### Apps
- `src/apps/landing/` - Landing page scripts and effects
  - `fx/` - Visual effects system (TypeScript): hue filters, bubbles, goo, background particles
  - `scripts/` - Core runtime scripts (bg-particles, rise-bubbles, webgl, portal-app)
  - `styles/` - Landing page styles

- `src/apps/static/pages/` - Standalone HTML content pages
  - `about/` - About Errl page
  - `gallery/` - Art gallery
  - `assets/` - Assets showcase with sub-pages
  - `events/` - Events archive
  - `merch/` - Merchandise concepts
  - `games/` - Games (hidden by default)
  - `studio/` - Studio hub HTML (legacy version)
  - `studio/math-lab/` - Math Lab playground (100 effects)
  - `studio/shape-madness/` - Shape Madness effect gallery
  - `studio/pin-widget/` - Pin widget designer
  - `studio/svg-colorer/` - SVG color customizer
  - `pin-designer/` - Enamel pin designer tool

- `src/apps/studio/` - React Studio application
  - `src/app/` - React app structure (router, pages, components)
  - `index.html` - Studio entry point (served at `/studio.html`)

#### Shared Resources
- `src/shared/assets/portal/` - Layered Errl art + phone UI sprites
  - Organized by render layer (L0 background → L6 secret)
  - Shared hero art, goo masks, nav skins
- `src/shared/assets/shared/` - Shared effects + experiments
  - Bubble sprite sheets, dev app icons, orb skins, reusable textures
- `src/shared/assets/legacy/` - Media for legacy HTML exports
  - Gallery thumbnails, historical assets
- `src/shared/styles/` - Shared stylesheets (errlDesignSystem.css)
- `src/shared/utils/` - Shared utilities (assetStore, settings, cookies)

#### Components
- `src/components/ui/` - Reusable UI components (React)

### Build Configuration

- `vite.config.ts` - Main Vite configuration
  - Multi-page build with entries for all portal pages
  - Base path: `/errl-portal/` for production, `/` for dev
  - Studio rewrite plugin for `/studio/*` routes
- `vite.studio.config.ts` - Studio-specific build config
- `tsconfig.json` - TypeScript configuration

### Archive

- `archive/legacy-portal-pages-backup/` - Backup of duplicate legacy pages
- `archive/portal-attic/` - Historical artifacts and experiments
- `archive/snapshots/` - Build snapshots
- `archive/legacy/` - Legacy standalone pages and kits

## Routing & Navigation

### Route Structure

```
/ (index.html)
  ├─→ /portal/pages/about/index.html
  ├─→ /portal/pages/gallery/index.html
  ├─→ /portal/pages/assets/index.html
  ├─→ /portal/pages/events/index.html
  ├─→ /portal/pages/merch/index.html
  ├─→ /portal/pages/games/index.html
  ├─→ /studio.html (React Studio hub)
  │      ├─→ /studio/code-lab (Errl Live Studio)
  │      ├─→ /studio/math-lab (Math Lab iframe)
  │      ├─→ /studio/shape-madness (Shape Madness iframe)
  │      ├─→ /studio/pin-designer (Pin Designer iframe)
  │      └─→ /studio/svg-colorer (SVG Colorer iframe)
  └─→ /portal/pages/pin-designer/index.html
```

### Navigation System

**Link Rewriting:**
- Portal pages use `data-portal-link` attributes pointing to `pages/...`
- Inline script in `index.html` rewrites these to correct paths based on dev/prod mode
- React components use `portalPaths.ts` utility for path resolution

**Standard Navigation Menu:**
All portal pages include:
- About Errl
- Gallery
- Assets
- Studio (link to `/studio.html`)
- Design (link to `/studio/pin-designer`)
- Events
- Merch
- Games (optional, hidden by default)

## Effects System

### Layers

1. **L0 Background** - Base background layer
2. **L1 Subsurface** - Subsurface effects
3. **L2 Motes** - Particle motes
4. **L3 Frame** - Frame decorations
5. **L4 Central** - Errl hero character
6. **L5 UI** - User interface elements
7. **L6 Secret** - Hidden/secret elements

### Effects Components

- **Background Particles** - WebGL particle system (`bg-particles.js`)
- **Rising Bubbles** - Three.js bubble animation (`rise-bubbles-three.js`)
- **Errl Goo** - SVG displacement filters for character animation
- **Nav Bubbles** - Orbiting navigation bubbles with goo effects
- **Hue Filters** - Color adjustment system for different layers
- **Errl Phone** - Control panel for adjusting all effects

## Asset Management

### Asset Store

Shared IndexedDB-based asset store used by:
- Code Lab (React)
- Math Lab (legacy HTML)
- Shape Madness (legacy HTML)
- Pin Designer (legacy HTML)

### Asset Organization

- **Portal Assets** (`src/shared/assets/portal/`) - Core portal visuals
- **Shared Assets** (`src/shared/assets/shared/`) - Reusable textures and effects
- **Legacy Assets** (`src/shared/assets/legacy/`) - Historical assets for legacy pages

## Development Workflow

### Local Development

```bash
npm run dev
# Portal: http://localhost:5173/
# Studio: http://localhost:5173/studio
```

### Build

```bash
npm run build
# Output: dist/
```

### Testing

```bash
npm test
# Playwright tests for portal and studio
```

## Key Design Decisions

1. **Multi-page Vite build** - Each portal page is a separate entry point
2. **React + Legacy hybrid** - React Studio hub bridges to legacy HTML tools
3. **Shared asset store** - IndexedDB-based storage shared across all tools
4. **Effect layering** - Clear layer system for visual effects
5. **Navigation consistency** - Standardized header and navigation across all pages

## Future Considerations

- Migrate remaining legacy HTML pages to React
- Unify asset pipeline across all tools
- Improve accessibility across all pages
- Add more comprehensive testing coverage
- Consider deployment optimization strategies

