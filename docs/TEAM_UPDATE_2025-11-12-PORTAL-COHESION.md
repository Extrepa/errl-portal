# Team Update — Portal Cohesion & Studio Bridges (2025-11-12)

## Branch
`main`

## Summary
- Navigation rewrites now normalize every portal link and embedded iframe through `data-portal-link`/`data-portal-frame`, eliminating duplicate `/legacy/portal` prefixes across the legacy app.
- Legacy `src/legacy/portal/pages/studio/index.html` mirrors the new React `/studio` hub, keeping copy, cards, and roadmap content consistent no matter how the page is loaded.
- Pin Designer, Shape Madness, and Math Lab all run inside the React Studio hub via `useLegacyAssetBridge`, sharing the IndexedDB asset store with Code Lab without breaking legacy exports.
- Playwright coverage expanded to assert portal link targets, Studio hub navigation, and iframe bridge wiring; `npm test` and `npm run portal:build` both green.
- Brought the new Component Rips library into `archive/component-rips-20251112/Component_Rips`, catalogued its background/prop/button/cursor modules, and mapped the conversion plan for reuse.

## Highlights
### Navigation & Link Rewrites
- Root landing orbit bubbles and runtime SVG Colorizer iframe now rely on a single link resolution helper.
- Legacy static pages rewired to absolute `/legacy/portal/...` hrefs so cross-linking never nests paths.

### Studio Hub Refresh
- Legacy hub refreshed to match the React experience for copy, calls-to-action, and card styling.
- Router now uses `basename="/studio"` with Vite middleware to serve `studio.html` for direct deep links.

### Pin Designer Bridge
- Introduced `StudioPinDesigner.tsx` so the enamel designer operates inside the React hub.
- Shared `useLegacyAssetBridge` hook exposes the IndexedDB asset store to the legacy iframes.
- Updated documentation (`README.md`, `docs/dev/preview-qa-complete.md`) to reflect the shared routing model.

### Component Rips Intake
- Imported today's `Component_Rips` drop into `archive/component-rips-20251112/Component_Rips` (BG, Buttons, Cursors, Modules, Props, Text, and portable Framer bundles).
- Tagged high-value groups for triage: `BG/*` (shader-like canvases for landing scenes), `Modules/*` (interactive toys such as `WebCam_Effects_Module` and `ParticleFaceParallaxPush_Module`), `Props/*` (SVG overlays), `Cursors/*` (trail FX), and `Text/*` (heading treatments).
- Plan: normalize each component into `index.html` + `styles.css` + `script.js`, feed them into a `tools/portal/convert-component-rip.mjs` helper, and surface previews inside a new `docs/catalog/component-rips/index.html` playground.
- Drafted catalog/control scaffolding: conversion script scaffold (`tools/portal/convert-component-rip.mjs`), catalog landing (`docs/catalog/component-rips/index.html`), backlog tracker, and audit log to keep reviews and safety notes persistent.
- Extracted first five targets into fully normalized bundles (`packages/component-rips/{terrapin-whirl,rainbow-neural-pathways,webcam-effects,bubbling-rainbow-rings,gradient-waves-text}`) with safety gates (no auto audio/video), controls, and metadata.
- Completed the second conversion wave: `rainbow-tunnel`, `rainbow-fluid-smoke`, `live-gradient-mixer`, `liquid-text`, and `ribbon-topology` bundles now ship with controls, reduced-motion handling, and catalog manifest entries.
- Added manifest generator (`tools/portal/generate-component-rips-manifest.mjs` + `npm run catalog:component-rips`) feeding auto-discovery UI; catalog now filters by category/status, surfaces safety notes, and links to live previews.
- Target integrations: treat backgrounds and cursor trails as selectable themes for the portal landing, wrap webcam/particle modules as Studio tiles, and expose props as overlay toggles in the dev panel.

## Verification
- `npm run portal:build`
- `npm test`
- Manual nav checks across `/` and `/studio/**` (React hub + legacy bridges)

## Component Rips Progress (2025-11-13)

### Catalog Improvements
- Fixed catalog CORS handling: updated manifest loading to support both http/https and file:// protocols with XMLHttpRequest fallback. Added helpful error messages suggesting local server usage (`python3 -m http.server 8000`).
- Catalog now auto-discovers all normalized components via manifest-driven UI with category/status filtering.

### Normalization Wave 3 (23 Total Components)
- **Cursors (7 total)**: Added Fast Rainbow Rings (temporal echo pool with forward/reverse toggle), Holographic Cube (3D rotating cubes with perspective projection), Rainbow Trailing Orbs (spring physics beads), Simple Blue Bubble Trail (blue-to-cyan spring trail).
- **Backgrounds (4 total)**: Added Rainbow Spinning (MIDI-reactive chromafog with optional MIDI support gated behind explicit button, keyboard shortcuts H/B).
- **Misc (1 total)**: Added Spectral Harp Membrane (interactive membrane with spring physics, optional microphone input gated).

### Safety & Controls
- All components include explicit safety guards (no autoplay audio/video/camera).
- MIDI and microphone access only requested after explicit button presses.
- All animations respect `prefers-reduced-motion` (verified and fixed in all components).
- Interactive controls standardized across all components.

### Current Status
- **46 normalized components** across 7 categories (backgrounds: 15, buttons: 3, cursors: 11, modules: 9, text: 3, props: 4, misc: 1).
- All components include metadata, safety notes, and control definitions in `meta.json`.
- Catalog manifest auto-generates via `npm run catalog:component-rips`.
- Backlog and audit log track all conversion progress.
- Thumbnail generation system in place with 46 component thumbnails generated.

### Unified Component Inventory (2025-11-13)
- Created comprehensive component inventory registry (`docs/catalog/component-inventory.md`) tracking all ~205 components across 5 locations:
  - 46 normalized component rips (`packages/component-rips/`)
  - 55 raw component rips (`archive/component-rips-20251112/Component_Rips/`)
  - 100 Math Lab effects (embedded in single file)
  - 5 projects components (`public/apps/projects/`)
  - 5 component library items (`src/components/component-library/`)
- Added inventory scanning script (`tools/portal/update-component-inventory.mjs`) with `npm run inventory:scan` command.
- Inventory provides unified view of all components for consolidation planning and broken component identification.

### Component Catalog Enhancements (2025-11-13)
- **Thumbnail Generation System**: Added automated thumbnail generation tool (`tools/portal/generate-component-thumbnails.mjs`) with `npm run thumbnails:generate` command. Thumbnails stored in `packages/component-rips/_thumbnails/` for catalog previews.
- **Preview Mode**: Implemented shared preview mode script (`packages/component-rips/_shared/preview-mode.js`) that automatically hides controls when components are loaded with `?preview=1` parameter, enabling clean catalog previews.
- **Component Fixes & Improvements**:
  - Added speed control to Rainbow Trailing Orbs Cursor
  - Enhanced Spectral Harp Membrane with "Trigger Wave" and "Reset Grid" buttons
  - Improved Terrapin Whirl visual effects (glow rings, enhanced gradients)
  - Fixed Gradient Waves Text to use SVG-based wave animation
  - Updated Rainbow Fluid Smoke with enhanced visual effects
  - Improved Liquid Text layout and styling
  - Enhanced Rainbow Spinning Button with proper panel structure
  - Added new components: Bubble Mouse Trail and Holographic Cursor Trail
  - Fixed display modes for full-window components (Rainbow Tunnel, Rainbow Fluid Smoke, Bubbling Rainbow Rings)
- **Component Fixes Plan**: Created `docs/catalog/component-rips/COMPONENT_FIXES_PLAN.md` documenting display mode system, preview popup feature, and component-specific fixes.
- **Catalog UI Updates**: Enhanced catalog with improved component display, better filtering, and preview integration.

### Normalization Wave 4 (2025-11-13) - 15 Components Added
- **Cursors (3 new)**: Fluffy Pixel Trail (pixelated particle bursts), Pixel Square Rainbow (pixelated squares with rainbow cycling), Weird Motion Trace (distorted trail with sine/cosine effects).
- **Backgrounds (7 new)**: Anisotropic Velvet (interactive velvet texture), Basic Shadow Bubbles (caustic sparkles), Band W Squiggle (time-crystal trails), Wire Grid (interactive warping grid), Parallax Shooting Stars (depth-based starfield), Suttle Rainbow Wisps (glowing script-veins), Trippy Broken Triangles (interactive Voronoi).
- **Props (2 new)**: Afterimage Pulse (color inversion pulsing), Moire Melt (moire pattern with blend modes).
- **Modules (3 new)**: Paint Splat Mix (interactive paint splats), Kaleido Spin Top String (kaleidoscope drawing tool), Spinning Rainbow Black Hole (prism refraction lens).
- **Framer Export Extraction**: Successfully extracted and normalized 2 Framer export cursors by recreating functionality based on component names and patterns.

### Normalization Wave 5 (2025-11-13) - 6 Additional Components Added
- **Button (1 new)**: Purple Smile Hover Confetti Button (rainbow confetti particles on hover with continuous stream).
- **Backgrounds (4 new)**: Rainbow Dot Suttle Gradient (hexagonal dot pattern with animated rainbow gradients), Side Scrolling BW Square Wall (infinite scrolling checkerboard), Rainbow Square Grid (animated rainbow grid pattern), Bubble Buster (floating rainbow bubbles with drift).
- **Module (1 new)**: 3in1 Mix It Up (three-mode interactive module: Ripple water simulation, Kaleido pattern generator, Moiré rotating pattern).
- **Accessibility Fixes**: Fixed `prefers-reduced-motion` handling in 3 components:
  - `bubble-buster-bg`: Animation loop now stops when reduced motion is enabled.
  - `fluffy-pixel-trail-cursor`: Particle spawning and animation loop respect reduced motion preference.
  - `3in1-mix-it-up-module`: All three modes (Ripple, Kaleido, Moiré) properly stop animation loops when reduced motion is enabled.

## Next Steps
1. Stress-test the shared asset store with large Pin Designer exports and Code Lab imports.
2. Add nightly Playwright coverage for the legacy studio page to catch link regressions automatically.
3. Continue normalizing remaining queue (e.g. `RainbowPoofBalls_Module_LAG`, `ParticleFaceParallaxPush_Module`, additional backgrounds/cursors).
4. Wire Playwright smoke test that opens catalog manifest entries without triggering audio/video/grant requirements.
5. Implement the preview QA automation scripts (`stage-preview-qa.sh`, `run-preview-verifications.sh`, `draft-preview-announcement.sh`) outlined in `plans/2025-11-11-preview-qa-automation.md`.
6. Test catalog with local server to verify full functionality.

## Timeline References
- `docs/journal/TEAM_UPDATE_2025-11-12-LINKS.md`
- `docs/journal/TEAM_UPDATE_2025-11-12-STUDIO-ALIGN.md`
- `docs/TEAM_UPDATE_2025-11-09-LAYER-CLEANUP.md`
- `docs/TEAM_UPDATE_Component_Rips_2025-11-12_18-16.md`
- `plans/component-rips-integration.md`
- `docs/catalog/component-rips/backlog.md`
- `docs/catalog/component-rips/audit-log.md`
- `docs/catalog/component-rips/COMPONENT_FIXES_PLAN.md` — Component fixes and display mode system
- `docs/catalog/component-inventory.md` — Unified component inventory registry
- `docs/team/WARP.md` — Warp.dev guidance for Studio development

