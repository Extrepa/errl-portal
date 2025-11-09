# Team Update: Layer Cleanup & Optimization (2025-11-09)

## Branch
`perf/layer-audit-portal-landing-2025-11-09`

## Summary
Completed major cleanup of rendering layers and debug infrastructure for the Errl Portal landing page, significantly simplifying the codebase while maintaining visual quality.

## Changes Made

### Code Cleanup (-134 lines, +105 insertions)
- **portal-app.js**: Removed legacy mode gates and duplicate canvas logic; streamlined initialization
- **webgl.js**: Enhanced debug exposure (`__ErrlWebGL`) with fxRoot, mood, and filter access
- **rise-bubbles.js**: Added resize guard to prevent 0-dimension canvas crashes
- **styles.css**: Updated vignette frame styling for proper layering
- **index.html**: Cleaned up redundant canvas elements
- **docs/ERRL_PHONE.md**: Updated layer documentation

### Debug Infrastructure
Extended `errlDebug` harness with:
- `toggleOverlayNode()` - Toggle PIXI overlay visibility
- `toggleOverlayFilter()` - Toggle overlay displacement filter
- `toggleFXFilter()` - Toggle fxRoot filters (goo effect)
- Direct access to `__ErrlWebGL.fxRoot`, `.mood`, `.overlayFilter`

### Performance Artifacts
Safari performance audit exports previously lived in `docs/perf/2025-11-09-safari-layers/`; the folder was cleared on 2025-11-11 to reduce noise. Capture fresh assets as needed.

## Key Learnings

### Layer Stack (Back → Front)
1. **L0**: `#bgParticles` (DOM canvas, z:0)
2. **L1**: `#errlWebGL` (PIXI, z:1) - ParticleContainer → fxRoot (overlay, Errl sprite, orbs)
3. **L2**: `#riseBubbles` (DOM canvas, z:2)
4. **L3**: `.scene-layer` (DOM Errl image/SVG, nav-orbit, z:3)
5. **L4**: `.vignette-frame` (z:4)
6. **L5**: Errl Phone overlays (z:4000+)

### Best Practices Confirmed
- ✅ Do not apply filters to `app.stage` when using ParticleContainer
- ✅ Filter `fxRoot` instead for proper visual effects
- ✅ Set `app.stage.sortableChildren=true` for zIndex support
- ✅ Guard canvas operations against 0-dimensions
- ✅ Cap WebGL DPR (≤1.5) for Safari performance

## Testing
- ✅ Dev server running on http://localhost:5173/
- ✅ All visual effects working (bubbles, goo, displacement)
- ✅ Debug harness functional
- ✅ No console errors

## Next Steps
1. Merge to main after team review
2. Monitor performance metrics in production
3. Consider further ParticleContainer optimizations if needed

## Files Changed
- Modified: 6 files
- New: 17 performance audit artifacts
- Net: -29 lines (improved code clarity)

---
**Author**: Extrepa  
**Date**: 2025-11-09  
**Ticket**: Layer audit and optimization
