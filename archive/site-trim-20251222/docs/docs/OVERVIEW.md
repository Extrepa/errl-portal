# Errl Portal - Complete Overview

## Introduction

The Errl Portal is a multi-app web experience showcasing the Errl character through an interactive landing page, creative tools, and content pages. It combines modern React applications with legacy HTML pages, unified through a consistent navigation system and shared asset infrastructure.

## Architecture Overview

### Core Components

1. **Landing Page** (`src/index.html`)
   - Interactive portal with WebGL effects
   - Errl character as central hero
   - Navigation bubbles orbiting around Errl
   - Effects control panel (Errl Phone)
   - Particle systems and visual effects

2. **React Studio Hub** (`src/apps/studio/`)
   - Modern React application
   - Served at `/studio.html` and `/studio/*` routes
   - Bridges to legacy HTML tools via iframes
   - Shared asset store (IndexedDB)

3. **Portal Pages** (`src/apps/static/pages/`)
   - Standalone HTML content pages
   - About, Gallery, Assets, Events, Merch, Games
   - Consistent header and navigation
   - Legacy tools (Math Lab, Shape Madness, Pin Designer)

## Navigation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Landing Page (/)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  About   │  │ Gallery  │  │  Assets  │  │  Studio   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │             │              │              │         │
│       ▼             ▼              ▼              ▼         │
│  /portal/pages/  /portal/pages/ /portal/pages/ /studio.html│
│  /about/         /gallery/      /assets/                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Studio Hub      │
                    │  (React App)     │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
  /studio/code-lab   /studio/math-lab   /studio/pin-designer
  (React)            (Legacy HTML)      (Legacy HTML)
```

## File Structure

```
errl-portal/
├── src/
│   ├── index.html                    # Main landing page
│   ├── apps/
│   │   ├── landing/                  # Landing page scripts & effects
│   │   │   ├── fx/                   # Visual effects (TypeScript)
│   │   │   ├── scripts/              # Core runtime scripts
│   │   │   └── styles/               # Landing styles
│   │   ├── static/pages/             # Portal content pages
│   │   │   ├── about/                # About Errl
│   │   │   ├── gallery/              # Art gallery
│   │   │   ├── assets/               # Assets showcase
│   │   │   ├── events/               # Events archive
│   │   │   ├── merch/                # Merchandise
│   │   │   ├── games/                # Games (hidden)
│   │   │   ├── studio/               # Studio hub & tools
│   │   │   └── pin-designer/         # Pin designer tool
│   │   └── studio/                   # React Studio app
│   │       ├── src/app/               # React components
│   │       └── index.html             # Studio entry point
│   ├── shared/
│   │   ├── assets/
│   │   │   ├── portal/               # Portal-specific assets
│   │   │   ├── shared/               # Shared textures
│   │   │   └── legacy/               # Legacy assets
│   │   ├── styles/                   # Shared stylesheets
│   │   └── utils/                    # Shared utilities
│   └── components/                   # Reusable React components
├── docs/                             # Documentation
│   ├── ARCHITECTURE.md               # Architecture details
│   ├── OVERVIEW.md                   # This file
│   ├── STATUS.md                     # Current status
│   ├── guides/                       # Developer guides
│   ├── journal/                      # Development journal
│   └── team/                         # Team documentation
├── archive/                          # Historical artifacts
│   ├── legacy-portal-pages-backup/  # Backup of duplicate pages
│   └── portal-attic/                 # Historical experiments
├── dist/                             # Build output
├── vite.config.ts                    # Main build config
└── package.json                      # Dependencies & scripts
```

## Build System

### Vite Configuration

- **Multi-page build**: Each portal page is a separate entry point
- **Base path**: `/errl-portal/` for production, `/` for dev
- **Studio routing**: Middleware rewrites `/studio/*` to `/studio.html`
- **Path aliases**: `@assets`, `@shared`, `@studio`, `@legacy`

### Build Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run studio:build     # Studio-only build
npm test                 # Run tests
```

## Navigation System

### Link Rewriting

Portal pages use `data-portal-link` attributes that get rewritten at runtime:

```html
<a href="/portal/pages/about/index.html" 
   data-portal-link="pages/about/index.html">
  About Errl
</a>
```

The script in `index.html` rewrites these based on dev/prod mode:
- **Dev**: `/apps/static/pages/about/index.html`
- **Prod**: `/portal/pages/about/index.html`

### Standard Navigation

All portal pages include:
- About Errl → `/portal/pages/about/index.html`
- Gallery → `/portal/pages/gallery/index.html`
- Assets → `/portal/pages/assets/index.html`
- Studio → `/studio.html`
- Design → `/studio/pin-designer`
- Events → `/portal/pages/events/index.html`
- Merch → `/portal/pages/merch/index.html`
- Games → `/portal/pages/games/index.html` (hidden by default)

### Header Structure

All pages use consistent header:

```html
<header class="errl-header">
  <div class="errl-header-content">
    <a class="errl-home-btn" href="/">← Back to Portal</a>
    <nav class="errl-nav">
      <!-- Navigation links -->
    </nav>
  </div>
</header>
```

## Effects System

### Visual Layers

1. **L0 Background** - Base background
2. **L1 Subsurface** - Subsurface effects
3. **L2 Motes** - Particle motes
4. **L3 Frame** - Frame decorations
5. **L4 Central** - Errl hero character
6. **L5 UI** - User interface
7. **L6 Secret** - Hidden elements

### Effects Components

- **Background Particles** - WebGL particle system
- **Rising Bubbles** - Three.js animated bubbles
- **Errl Goo** - SVG displacement filters
- **Nav Bubbles** - Orbiting navigation with goo effects
- **Hue Filters** - Color adjustment system
- **Errl Phone** - Control panel for all effects

## Asset Management

### Shared Asset Store

IndexedDB-based storage shared across:
- Code Lab (React)
- Math Lab (legacy HTML)
- Shape Madness (legacy HTML)
- Pin Designer (legacy HTML)

### Asset Organization

- **Portal Assets** (`src/shared/assets/portal/`) - Core visuals
- **Shared Assets** (`src/shared/assets/shared/`) - Reusable textures
- **Legacy Assets** (`src/shared/assets/legacy/`) - Historical assets

## Development Workflow

### Local Development

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Access portal: http://localhost:5173/
4. Access studio: http://localhost:5173/studio

### Adding New Pages

1. Create directory: `src/apps/static/pages/your-page/`
2. Create `index.html` with standard header
3. Add entry to `vite.config.ts`
4. Add navigation links to other pages

### Testing

- Run tests: `npm test`
- UI tests: `npm run test:ui`
- Type checking: `npm run typecheck`

## Deployment

### Production Build

```bash
npm run build
```

Output in `dist/` directory with:
- All portal pages
- React Studio app
- Optimized assets
- Proper base path for GitHub Pages

### Deployment Targets

- **GitHub Pages**: Base path `/errl-portal/`
- **Custom domain**: Update base path in `vite.config.ts`

## Key Features

1. **Interactive Landing Page**
   - WebGL effects and particle systems
   - Customizable parameters via Errl Phone
   - Responsive design

2. **React Studio Hub**
   - Modern React application
   - Bridges to legacy tools
   - Shared asset infrastructure

3. **Consistent Navigation**
   - Standardized header across all pages
   - Link rewriting for dev/prod compatibility
   - Complete navigation menu

4. **Legacy Tool Integration**
   - Math Lab (100 effects)
   - Shape Madness (effect gallery)
   - Pin Designer (enamel pin tool)
   - SVG Colorer (color customization)

## Future Roadmap

- Migrate remaining legacy pages to React
- Unify asset pipeline across all tools
- Improve accessibility
- Enhanced testing coverage
- Performance optimizations

## Resources

- **Architecture**: `docs/ARCHITECTURE.md`
- **Status**: `docs/STATUS.md`
- **Getting Started**: `docs/guides/getting-started.md`
- **Development**: `docs/guides/development.md`
- **Team Guides**: `docs/team/`

