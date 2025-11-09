# Portal Development Log - 2025-01-XX

## Summary
Fixed critical rendering issues with canvas layers, phone panel behavior, and goo effects initialization.

## Issues Fixed

### 1. Canvas Z-Index Layering & Rendering
**Problem:** Canvas elements were not properly layered, causing visual artifacts and the "weird light in the corner" issue.

**Solution:**
- Removed pink glow (`rgba(255,0,120,0.15)`) from vignette frame box-shadow
- Added `background: transparent` to all canvas elements (`#bgParticles`, `#riseBubbles`, `.errl-webgl-layer`)
- Added `pointer-events: none` to `#bgParticles` to prevent interaction issues
- Verified proper z-index layering:
  - `#bgParticles`: z-index: 0 (L0: stars)
  - `.errl-webgl-layer`: z-index: 1 (L1: behind rising canvas and scene)
  - `#riseBubbles`: z-index: 2 (L2: rising background bubbles)
  - `.scene-layer`: z-index: 3 (L3: above rising canvas)
  - `.vignette-frame`: z-index: 4 (L4: above scene)
  - `.errl-panel`: z-index: 10 (above everything)

**Files Modified:**
- `src/styles.css`: Removed vignette glow, added transparent backgrounds to canvases
- `src/bg-particles.js`: Ensured proper canvas clearing

### 2. Phone Panel Default State
**Problem:** Phone panel was not starting minimized by default as intended.

**Solution:**
- Added initialization logic that checks `localStorage` for `errl_phone_min`
- Defaults to minimized (bubble icon) unless explicitly set to '0'
- Saves state to `localStorage` when toggled
- Improved click handler to properly expand when clicking the minimized bubble
- Prevents expansion when clicking child elements

**Files Modified:**
- `src/app.js`: Added default minimized state initialization and improved click handlers

### 3. Goo Effects Initialization
**Problem:** Goo effects (Nav Goo+ controls) were not working because WebGL wasn't initialized when sliders were adjusted.

**Solution:**
- Added auto-initialization for WebGL when goo controls are used
- If `errlGLSetGoo` isn't available, attempts to initialize WebGL automatically
- Added delay on initial apply to ensure WebGL is ready
- Goo effects now work when sliders are adjusted

**Files Modified:**
- `src/app.js`: Enhanced `navGooPlus` function with WebGL auto-initialization

## Technical Details

### Canvas Rendering
- All canvas elements now have transparent backgrounds to prevent rendering artifacts
- Proper clearing of canvas buffers each frame
- Pointer events disabled on background canvases to prevent interaction issues

### Phone Panel Behavior
- Starts minimized by default (small bubble icon in top-right)
- Expands when clicked
- Remembers state across page reloads via `localStorage`
- Can be minimized again using the minimize button

### Goo Effects
- WebGL-based effects that require WebGL to be enabled
- Auto-initializes WebGL when controls are used
- Parameters: wiggle, flow speed, grip (viscosity), drip, viscosity
- Effects apply to the Errl sprite filter in WebGL mode

## Testing Notes
- Verify phone panel starts minimized on fresh page load
- Verify phone panel expands when clicking the bubble
- Verify goo effects work when adjusting sliders (may require WebGL mode)
- Verify no weird lights/glows in corners
- Verify canvas layers render correctly

## Next Steps
- User mentioned wanting to add more customization options later
- Consider adding visual feedback when goo effects are applied
- May need to add WebGL mode toggle or auto-enable for goo effects

