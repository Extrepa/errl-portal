# Component Rips Integration Blueprint (2025-11-12)

## Goals
- Catalogue every asset in `archive/component-rips-20251112/Component_Rips`.
- Normalize portable demos into self-contained bundles (`index.html`, `styles.css`, `script.js`, assets).
- Ensure no component auto-plays audio/video during previews; anything with media starts muted/paused.
- Keep a living backlog of portal/studio integration ideas by category.

## Catalogue & Categories

| Category | Folder | Description | Initial Use Ideas |
| --- | --- | --- | --- |
| Backgrounds | `BG/` | Shader-like animated canvases and gradients (`TerrapinWhirl_BG`, `RainbowTunnel_BG`, `WireGrid_BG`, etc.) | Landing page themes; dynamic Studio page backdrops; debug panel theme selector |
| Buttons | `Buttons/` | Micro-interactions for CTAs (`Gradient_Box_Button`, `RainbowSpinningBlackMiddle_Button_Box`) | Hero CTA variants; portal nav experiments; design system inspiration |
| Cursors | `Cursors/` | Cursor trails and particle effects (`BubblingRainbowRings_Cursor`, `RainbowFluidSmoke_Cursor`) | Portal dev panel toggle; Studio experiment settings; teacher view accessibility toggle |
| Modules | `Modules/` | Full interactive mini-apps (webcam, particle toys, drawing tablets, kaleidoscopes) | Studio tiles; classroom activity prototypes; overlay effects for events |
| Props | `Props/` | SVG overlays and shader props (`Errl_Tunnel_PropSwapSVG`, `SilouetteInversion_PropSwapSVG`) | Scene props in landing pages; Errl avatar customization; AR-style filters |
| Text | `Text/` | Typography animations (`GradientWaves_Text`, `LiquidText_Text`, `TaffyTyping_Text`) | Hero headings; momentary transitions; documentation callouts |
| Misc | root assets (`SpectralHarpMembrane_Opening.html`, `errl.png`, `thumb.png`) | Unique sequences and reference art | Motion studies; overlay intros |
| Portable bundles | `Newer/`, `Clean_Components_v2_Portable/`, `Bubble_Mouse_Trail/`, `Holographic Cursor Trail/`, `Mimic_Kit_v1/` | Framer exports with their own scaffolds | Source material for conversion pipeline; catalog seed content |

## Process
1. **Weekly Sweep** (set recurring reminder): run `npm run catalog:component-rips` (to be built) that:
   - Scans archive source folders.
   - Validates metadata (category, tags, media usage).
   - Flags new or updated assets.
2. **Manual Review Checklist** for each asset:
   - Verify no audio/video auto-play (mute or remove inline playback).
   - Document controls, dependencies, and potential integration fits.
   - Capture thumbnail or gif preview for catalog.
3. **Normalization Pipeline** (tooling to implement):
   - `tools/portal/convert-component-rip.mjs <source>` → `packages/component-rips/<slug>/`.
   - Strip Framer badges, external analytics, and third-party network calls.
   - Replace inline `MiniMotion` hooks with local utility wrappers.
4. **Catalog Preview App**:
   - Create `docs/catalog/component-rips/index.html` that auto-discovers converted components.
   - Filter by category; show metadata, required inputs, and integration notes.
   - Include toggles for audio/mic/camera—default to safe defaults (`off`).
5. **Integration Queue**:
   - Maintain `docs/catalog/component-rips/backlog.md` grouped by target (Landing, Studio, Dev Tools).
   - Track conversion status (`raw`, `normalized`, `demo-ready`, `integrated`).

## Immediate Next Steps
1. ✅ Build conversion script scaffolding (`tools/portal/convert-component-rip.mjs`) with metadata JSON output.
2. ✅ Normalize five flagship components:
   - `BG/TerrapinWhirl_BG.html`
   - `Modules/RainbowNeuralPathways_Module.html`
   - `Modules/WebCam_Effects_Module.html` (permission-gated)
   - `Cursors/BubblingRainbowRings_Cursor.html`
   - `Text/GradientWaves_Text.html`
3. ✅ Draft catalog layout + auto-discovery in `docs/catalog/component-rips/` (`manifest.json`, filters, preview links).
4. ✅ Create `docs/catalog/component-rips/audit-log.md` to log each review (date, reviewer, findings).
5. ✅ Define metadata conventions (expanded `meta.json` per bundle with safety + controls).
6. ✅ Normalize second-wave components (`RainbowTunnel_BG`, `RainbowFluidSmoke_Cursor`, `LiveGradientMixer_Module`, `LiquidText_Text`, `RibbonTopology_Module_Prop`) with reduced-motion guards and catalog metadata.
7. Next: Extend pipeline to the remaining queue (`RainbowStringParticles_BG`, `RainbowPoofBalls_Module_LAG`, `ParticleFaceParallaxPush_Module`, `TaffyTyping_Text`) and build automated catalog preview checks (Playwright screenshots + reduced-motion assertions).

## Ongoing Ideas
- Convert cursor trails into toggleable dev panel themes (map to keyboard shortcuts).
- Use props (SVG swaps) as overlays for Pin Designer previews.
- Combine backgrounds + text animations for portal hero variations; rotate nightly with feature flags.
- Adapt webcam modules into Studio collaborative experiments (tie into upcoming teacher tools).
- Evaluate performance impact of particle-heavy modules; plan sprite-sheet fallbacks.
- Investigate audio-reactive enhancements (but keep audio muted until explicitly enabled).
- Explore packaging as downloadable `.zip` bundles via the catalog for classroom sharing.

