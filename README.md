# Errl Portal

A creative portal application featuring interactive visual effects, studio tools, and a component management system.

## What I'm Building

This project is an experimental web portal that combines visual design tools, interactive effects, and component management into a unified interface. It's a space for exploring creative web experiences, visual editing capabilities, and building a library of reusable components and effects.

The portal serves as both a showcase for interactive web experiences and a toolkit for creating and managing visual assets, with features like real-time effect controls, SVG editing, and a comprehensive component catalog.

## Technology

Built with modern web technologies:

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Monaco Editor** - Code editing
- **Fabric.js** - Canvas manipulation
- **Three.js / React Three Fiber** - 3D scene and gallery work
- **GSAP** - Animations and cinematic transitions
- **Lenis** - Smooth scroll
- **Playwright** - End-to-end testing

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
errl-portal/
├── src/
│   ├── apps/
│   │   ├── landing/     # Portal home — cinematic scene, Errl Phone, metaball nav
│   │   ├── studio/      # Studio application (separate Vite entry)
│   │   ├── designer/    # Design tool (separate Vite entry)
│   │   ├── chatbot/     # Chat UI
│   │   ├── gallery/     # Floating hall R3F spike
│   │   └── static/      # Static HTML pages (about, games, shape-madness lab, etc.)
│   └── shared/          # Shared utilities, assets, scripts
├── docs/                # Documentation (see docs/PROJECT_STATUS.md)
└── tests/               # Playwright specs
```

## Features

- **Interactive Portal**: Home page with customizable visual effects and controls
- **Studio Tools**: Visual editing and design capabilities
- **Component Management**: Catalog and management system for reusable components
- **Effect System**: Real-time control over visual effects (particles, goo, animations, etc.)
- **SVG Editing**: Tools for creating and editing vector graphics

## Documentation

Start here:

- **[docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md)** — live routes, active work, known gaps, doc index
- **[docs/cinematic-scene-master-plan.md](docs/cinematic-scene-master-plan.md)** — landing scene audit and roadmap
- **[docs/reference/errl-phone-capabilities.md](docs/reference/errl-phone-capabilities.md)** — Errl Phone tabs, layers, events, tests
- **[docs/reference/static-experiments.md](docs/reference/static-experiments.md)** — shape-madness and other non-core static pages

---

*This is a personal creative project exploring interactive web experiences and visual design tools.*
