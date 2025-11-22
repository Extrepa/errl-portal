# Unified Component Inventory Registry

**Last Updated:** 2025-11-13  
**Total Components:** ~188 across 5 locations

## Overview

This registry tracks all components across the Errl Portal project, including normalized bundles, raw rips, Math Lab effects, projects, and component library items.

---

## 1. Normalized Component Rips (23)

**Location:** `packages/component-rips/`  
**Status:** Fully normalized with catalog, metadata, safety gates, and controls  
**Catalog:** `docs/catalog/component-rips/index.html`

### Backgrounds (4)
- `terrapin-whirl` - Canvas swirl with speed & trail controls
- `rainbow-tunnel` - Errl silhouette tunnel with speed/direction/mask controls
- `rainbow-string-particles` - Particle system with connections
- `rainbow-spinning-bg` - MIDI-reactive chromafog with spinning gradient

### Buttons (2)
- `gradient-box-button` - Animated rainbow gradient button
- `rainbow-spinning-button` - Circular button with spinning conic gradient

### Cursors (7)
- `bubbling-rainbow-rings` - Expanding rainbow rings with density/fade controls
- `rainbow-fluid-smoke` - Smoke trail with trail/glow controls
- `fast-rainbow-rings-cursor` - Temporal echo pool with forward/reverse toggle
- `holographic-cube-cursor` - 3D rotating cubes with perspective projection
- `rainbow-trailing-orbs-cursor` - Spring physics beads
- `simple-blue-bubble-trail-cursor` - Blue-to-cyan spring trail
- *(Note: `bubble-mouse-trail` and `mimic-kit-cursor-trail` exist but not yet normalized)*

### Modules (5)
- `terrapin-whirl-module` - Compact module variant
- `rainbow-neural-pathways` - Interactive particle network
- `webcam-effects` - Permission-gated webcam playground
- `live-gradient-mixer` - Gradient breeding lab
- `ribbon-topology` - Depth-sorted ribbon renderer

### Text (3)
- `gradient-waves-text` - CSS wave headline
- `liquid-text` - Liquid headline animation
- `taffy-typing` - SVG text path with draggable handles

### Props (2)
- `errl-tunnel` - Tunnel effect overlay
- `silhouette-inversion` - Visual illusion with color inversion

### Misc (1)
- `spectral-harp-membrane` - Interactive membrane with microphone input

---

## 2. Raw Component Rips (55)

**Location:** `archive/component-rips-20251112/Component_Rips/`  
**Status:** Raw HTML files awaiting normalization  
**Conversion Script:** `tools/portal/convert-component-rip.mjs`

### Backgrounds (15)
- `AnisotropicVelvet_BG.html`
- `BandWSquiggle_BG.html`
- `BasicShadowBubbles_BG.html`
- `BubbleBuster_BG.html`
- `ParallaxShootingStars_BG.html`
- `RainbowDotSuttleGradient_BG.html`
- `RainbowSpinning_BG.html` *(normalized)*
- `RainbowSquareGrid_BG.html`
- `RainbowStringParticles_BG.html` *(normalized)*
- `RainbowTunnel_BG.html` *(normalized)*
- `SideScrollingBWSquareWall_BG.html`
- `SuttleRainbowWisps_BG.html`
- `TerrapinWhirl_BG.html` *(normalized)*
- `TrippyBrokenTriangles_BG.html`
- `WireGrid_BG.html`

### Buttons (3)
- `Gradient_Box_Button.html` *(normalized)*
- `PurpleSmileHoverConfetti_Button.html`
- `RainbowSpinningBlackMiddle_Button_Box.html` *(normalized)*

### Cursors (9)
- `BubblingRainbowRings_Cursor.html` *(normalized)*
- `FastRainbowRings_Cursor.html` *(normalized)*
- `FluffyPixelTrail_Cursor.html`
- `HolographicCube_Cursor.html` *(normalized)*
- `PixelSquareRainbow_Cursor.html`
- `RainbowFluidSmoke_Cursor.html` *(normalized)*
- `RainbowTrailingOrbs_Cursor.html` *(normalized)*
- `SimpleBlueBubbleTrail_Cursor.html` *(normalized)*
- `WeirdMotionTrace_Cursor.html`

### Modules (18)
- `3in1MixItUp_Module.html`
- `AsciiDrawingTablet_Module.html`
- `BlackHoleRainbowBall_Module_Prop.html`
- `ChronoRainbowTripSlink_Module_Prop.html`
- `ErrlsSpinningRainbowString_Module_Prop.html`
- `KaleidoSpinTopString_Module.html`
- `LiveGradientMixer_Module.html` *(normalized)*
- `PaintSplatMix_Module.html`
- `ParticleFaceParallaxPush_Module.html`
- `ParticleShapes_Module.html`
- `rainbow_drawing_tablet_Module.html`
- `RainbowNeuralPathways_Module.html` *(normalized)*
- `RainbowPoofBalls_Module_LAG.html` *(research - performance testing)*
- `RainbowSpinningHair_Module.html`
- `RibbonTopology_Module_Prop.html` *(normalized)*
- `SpinningRainbowBlackHole_Module.html`
- `TerrapinWhirl_Module.html` *(normalized)*
- `WebCam_Effects_Module.html` *(normalized)*

### Props (6)
- `3DEffect_3DObject_Prop.html`
- `AfterimagePulse_Prop.html`
- `DrippyMirror_PropSwapSVG.html` *(research - performance)*
- `Errl_Tunnel_PropSwapSVG.html` *(normalized)*
- `MoireMeltProp_Meh.html`
- `SilouetteInversion_PropSwapSVG.html` *(normalized)*

### Text (3)
- `GradientWaves_Text.html` *(normalized)*
- `LiquidText_Text.html` *(normalized)*
- `TaffyTyping_Text.html` *(normalized)*

### Misc (1)
- `SpectralHarpMembrane_Opening.html` *(normalized)*

---

## 3. Math Lab Effects (100)

**Location:** `src/legacy/portal/pages/studio/math-lab/index.html`  
**Status:** Single-file embedded effects  
**Access:** `/studio/math-lab`  
**Categories:**
- Fractals & Chaos (newton, fern, koch, dragon, hilbert, lorenz, ikeda, flames, lichtenberg)
- Noise & Procedural (perlin, fbm, marble, worley, quasicrystal, interference, contours, nebula)
- Geometry & Curves (supershape, lissajous, superellipse, conics, polar-roses, spirograph, phase-carpets)
- Grids & Tilings (conformal-grid, iso-cubes, bitmask, primes, quilt, warp-grid, escher, penrose)
- Fields & Particles (curl, circle-pack, magnetic, nbody, voronoi, delaunay, voronoi-pulse)
- Cellular Automata (rule110, automaton)
- SDF & Raymarch (sdf, raymarch, shadow, polar-zipper)
- SVG/CSS FX (chromaburst, soap, conic, mask, moire, sinewarp, radial-weave, impossible, svg-mesh)
- Complex Analysis (domain-coloring, roots, logo-melt)
- Misc

**Note:** Effects are embedded in a single HTML file with a registry system. Individual effect extraction would require parsing the file.

---

## 4. Projects Components (5)

**Location:** `archive/legacy/standalone-pages/apps/projects/`  
**Status:** Standalone project components with React wrappers  
**React Wrappers:** `src/apps/projects/`

### Components
- `bubble-mouse-trail` - Mouse trail with bubbles
  - Files: `index.html`, `script.js`, `style.css`, `README.md`
  - React: `BubbleMouseTrail.tsx`
  - Single-file: `_single-file/bubble-mouse-trail.html`

- `gravity-sticker-field` - Gravity-based sticker field
  - Files: `index.html`, `script.js`, `style.css`, `README.md`, `assets/sticker.png`
  - React: `GravityStickerField.tsx`
  - Single-file: `_single-file/gravity-sticker-field.html`

- `holographic-cursor-trail` - Holographic cursor trail
  - Files: `index.html`, `script.js`, `style.css`, `README.md`
  - React: `HolographicCursorTrail.tsx`
  - Single-file: `_single-file/holographic-cursor-trail.html`

- `ripple-face` - Ripple effect on Errl face
  - Files: `index.html`, `script.js`, `style.css`, `README.md`, `assets/errl-face.svg`
  - React: `RippleFace.tsx`
  - Single-file: `_single-file/ripple-face.html`

- `sparkle-worklet-pin` - Sparkle worklet pin effect
  - Files: `index.html`, `script.js`, `sparkle.js`, `style.css`, `README.md`
  - React: `SparkleWorkletPin.tsx`
  - Single-file: `_single-file/sparkle-worklet-pin.html`

**Shared Utilities:** `_shared/utils.js`  
**Standalone Index:** `standalone-index.html`

---

## 5. Component Library (5)

**Location:** `src/components/component-library/Errl_Component_Catalog/`  
**Status:** Catalog components  
**Catalog:** `catalog/index.html`

### Components
- `ascii-orb` - ASCII orb visualization
- `control-dock` - Control dock UI
- `kaleido-bg` - Kaleidoscope background
- `optical-grid` - Optical grid effect
- `ripple` - Ripple effect

**Shared:** `shared/theme.css`, `shared/util.js`

---

## Summary Statistics

| Location | Count | Status |
|----------|-------|--------|
| Normalized Component Rips | 23 | ✅ Production-ready |
| Raw Component Rips | 55 | ⏳ Awaiting normalization |
| Math Lab Effects | 100 | ✅ Embedded in single file |
| Projects Components | 5 | ✅ Standalone with React wrappers |
| Component Library | 5 | ✅ Catalog components |
| **Total** | **188** | |

---

## Next Steps

1. **Continue Normalization:** Convert remaining 32 raw component rips (55 total - 23 normalized)
2. **Extract Math Lab Effects:** Consider extracting individual effects for catalog integration
3. **Unify Locations:** Consolidate all components into a single discoverable location
4. **Fix Broken Components:** Identify and repair components that don't function as expected
5. **Create Master Catalog:** Build unified catalog that includes all component types

---

## Related Files

- `docs/catalog/component-rips/backlog.md` - Component Rips backlog
- `docs/catalog/component-rips/audit-log.md` - Component Rips audit log
- `docs/catalog/component-rips/manifest.json` - Auto-generated manifest
- `docs/catalog/component-rips/index.html` - Component Rips catalog UI
- `tools/portal/convert-component-rip.mjs` - Normalization script
- `tools/portal/generate-component-rips-manifest.mjs` - Manifest generator

