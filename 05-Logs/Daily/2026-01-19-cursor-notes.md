# Navigation Bubble Hover Pause - Implementation Review

**Date**: 2026-01-19  
**Feature**: Pause navigation bubble movement on hover  
**File**: `src/apps/landing/scripts/portal-app.js`

## Summary
Implemented functionality to freeze individual navigation bubbles when hovered, allowing users to interact with them without the bubble moving away.

## Changes Made

### 1. Added Hover State Tracking (Line 287)
```javascript
const hoveredBubbles = new Map(); // Map<bubble element, {x, y}>
```
- **Purpose**: Track which bubbles are currently hovered and their frozen positions
- **Scope**: Module-level constant, accessible throughout the bubble system
- **Data Structure**: Map with bubble DOM elements as keys, position objects `{x, y}` as values

### 2. Modified `placeBubble` Function (Lines 481-511)
- **Early Return Pattern**: Checks if bubble is hovered before calculating new position
- **Position Freezing**: Uses stored `{x, y}` from Map when hovered
- **Layering Preserved**: Still updates front/behind layering based on Y position relative to center
- **Validation**: Checks `Number.isFinite()` on stored coordinates before using

### 3. Updated `mouseenter` Handler (Lines 597-603)
- **Position Capture**: Reads current `style.left` and `style.top` on hover start
- **Validation**: Only stores position if both coordinates are finite numbers
- **Timing**: Captures position immediately when hover begins
- **Integration**: Works alongside existing hover effects (glow, audio, WebGL)

### 4. Updated `mouseleave` Handler (Lines 629-631)
- **Cleanup**: Removes bubble from Map when hover ends
- **Resume**: Bubble immediately resumes normal orbital movement
- **Integration**: Maintains existing hover effect cleanup

## Code Quality Assessment

### ✅ Strengths
1. **Non-invasive**: Doesn't break existing functionality
2. **Efficient**: Uses Map for O(1) lookup performance
3. **Safe**: Validates coordinates before use
4. **Preserves behavior**: Maintains layering logic even when frozen
5. **Clean separation**: Hover state management separate from animation logic

### ⚠️ Potential Edge Cases (Low Risk)

1. **Initial Position Capture**
   - **Issue**: If `mouseenter` fires before first `placeBubble` call, position might be `0,0` or invalid
   - **Mitigation**: `updateBubbles` runs continuously, so bubbles are positioned before user interaction
   - **Risk**: Very low - bubbles initialize before page is interactive

2. **Memory Leak (Theoretical)**
   - **Issue**: If bubble element removed from DOM, Map entry persists
   - **Mitigation**: Navigation bubbles are persistent UI elements, unlikely to be removed
   - **Risk**: Negligible - would require DOM manipulation outside normal flow

3. **Race Condition (Theoretical)**
   - **Issue**: Position read from `style.left/top` might be from previous frame
   - **Mitigation**: Inline styles are set synchronously in same frame
   - **Risk**: Very low - position is current when read

### 🔍 Code Review Checklist

- [x] No syntax errors
- [x] No linter errors
- [x] Proper validation (Number.isFinite checks)
- [x] Cleanup on mouseleave
- [x] Preserves existing functionality
- [x] Efficient data structure (Map)
- [x] Clear variable naming
- [x] Appropriate comments
- [x] No memory leaks in normal operation
- [x] Handles edge cases gracefully

## Testing Recommendations

1. **Basic Functionality**
   - Hover over bubble → should freeze in place
   - Move mouse away → should resume movement
   - Multiple bubbles → each freezes independently

2. **Edge Cases**
   - Rapid hover/unhover → should handle smoothly
   - Hover during high-speed orbit → should freeze at current position
   - Hover when bubble is transitioning front/behind → layering should update correctly

3. **Integration**
   - Existing hover effects (glow, audio) should still work
   - WebGL orb interactions should continue
   - Keyboard navigation should not be affected

## Performance Impact

- **Memory**: Minimal - Map stores one entry per hovered bubble (typically 0-1 entries)
- **CPU**: Negligible - Single Map lookup per bubble per frame (O(1))
- **Rendering**: No impact - same DOM updates, just using cached position

## Conclusion

Implementation is **solid and production-ready**. The code follows best practices, handles edge cases appropriately, and integrates cleanly with existing functionality. No critical issues identified.

**Status**: ✅ Ready for testing

---

## Errl Phone - Missing BG Controls + Nav Goo Animation Gate

**Date**: 2026-01-19  
**Scope**: Add missing Errl Phone BG controls; wire them; ensure nav goo doesn't animate unless Slow Gradient is running.

### Progress
- Added BG tab controls in `src/index.html`:
  - `#shimmerToggle`
  - `#vignetteToggle`
  - `#glOverlayAlpha`, `#glOverlayDX`, `#glOverlayDY`
- Began wiring shimmer toggle in `src/apps/landing/scripts/portal-app.js`:
  - Mounts `ErrlBG` lazily (only when enabling shimmer) and toggles `.errl-bg .shimmer` display.

### Completed
- Wired BG controls in `src/apps/landing/scripts/portal-app.js`:
  - `#shimmerToggle`: show/hide `.errl-bg .shimmer` (mounts `ErrlBG` once if needed)
  - `#vignetteToggle`: show/hide `.errl-bg .vignette` and any `.vignette-frame`
  - `#glOverlayAlpha/#glOverlayDX/#glOverlayDY`: calls `window.errlGLSetOverlay(...)` (waits briefly for GL to exist)
- Nav goo animation gate:
  - `Nav Goo+` now forces `speed: 0` unless `window.__errlNavGradientAnimating` is true
  - `Slow Gradient` sets/clears `window.__errlNavGradientAnimating` and forces speed 0 immediately on stop
  - Fixed `navDrip` slider sync for `drip: 0.1` (sets slider to -0.8)
- WebGL goo default speed:
  - `src/apps/landing/scripts/webgl.js`: `uSpeed` default set to `0` so goo is static unless explicitly animated
- `src/index.html` shimmer mount safety-net now avoids duplicate mounts (checks for existing `.errl-bg`)

### Double-check notes (post-implementation)
- **Nav goo truly static when not animating**:
  - Found shader baseline motion: `t = uTime * (0.4 + 1.6*uSpeed)` would still animate at `uSpeed=0`.
  - Fixed to `t = uTime * uSpeed` in `src/apps/landing/scripts/webgl.js` so `uSpeed=0` means no motion.
- **Slow Gradient stop safety**:
  - Hardened `stopGradientAnimation()` to avoid passing `undefined` keys into `errlGLSetGoo` (could yield NaNs via `Math.max`).
- **Persistence/reset**:
  - Confirmed `applyUiSnapshot()` dispatches `change` for checkboxes and `input` for ranges, so the new BG controls participate in the existing persistence flow.
  - Added baked defaults for `shimmerToggle`, `vignetteToggle`, `glOverlayAlpha/DX/DY` in the reset fallback defaults object.

### Follow-up
- Set **Shimmer** and **Vignette** to **OFF by default**:
  - `src/index.html`: removed `checked` from `#shimmerToggle` and `#vignetteToggle`
  - `public/apps/landing/config/errl-defaults.json`: added `shimmerToggle: false` and `vignetteToggle: false` (plus GL overlay defaults)
  - `src/apps/landing/scripts/portal-app.js` reset fallback defaults now set `shimmerToggle/vignetteToggle` to `false`

---

## Errl Phone RB Tab - Reorg + Full Wiring

**Date**: 2026-01-19  
**Scope**: Reorganized the RB tab and implemented all RB controls so they are *actually* wired to the Three.js Rising Bubbles layer with clear purpose.

### UI changes
- `src/index.html`
  - RB tab is now explicitly **Basic** + **Advanced** with short inline guidance text.
  - Added **`rbScale`** (Size Scale) to separate bubble sizing from bubble count.
  - `rbDensity` is now labeled and intended as **Count** (count multiplier), matching its UI copy.

### Wiring changes
- `src/apps/landing/scripts/portal-app.js`
  - Added `rbScale` bindings (`RB.setScale`) and persistence for `rbScale`.
  - Kept `rbDensity` wired through `RB.setDensity`, but semantics are now *count multiplier* (engine-side).
  - Reset Defaults fallback now includes `rbScale`.

### Engine behavior (all RB controls now do something real)
- `src/apps/landing/scripts/rise-bubbles-three.js`
  - Bubble pool + visibility: `rbDensity` now changes active bubble **count** (uses `.visible` for pool culling).
  - Pixel sizing: `rbMin/rbMax` now drive per-bubble base size in **pixels** (converted to world scale using camera FOV/depth).
  - `rbScale` multiplies overall bubble size (separate from count).
  - `rbJumboPct/rbJumboScale` affect spawn sizing (re-roll on change for immediate feedback).
  - `rbSizeHz` pulses bubble size over time.
  - `rbWobble/rbFreq` apply lateral oscillation (non-accumulating offset) to motion.
  - `rbAttract/rbAttractIntensity` attracts bubbles toward pointer ray intersection.
  - `rbRipples/rbRippleIntensity` emits click/tap ripple impulses that push bubbles outward.
  - Added debug surface: `getActiveCount()` and `getPoolSize()` plus `getControls()` now includes `count` alias.

### Tests updated
- Added `rbScale` to RB control lists and updated RB wiring assertions:
  - `tests/integration-controls-effects.test.ts` now asserts `getControls()` and `getActiveCount()` respond to RB controls.
  - Updated RB control presence lists in `tests/home-page-verification.test.ts` and `tests/errl-phone-controls.spec.ts`.
  - Fixed older tests that referenced `#rbAdvAnimate` to use `#rbAdvPlayPause` instead.

### Double-check (RB)
- Fixed two engine edge cases in `src/apps/landing/scripts/rise-bubbles-three.js`:
  - **Jumbo sizing**: `rbJumboScale` now truly allows sizes above `rbMax` (clamps to \(rbMax * rbJumboScale\), capped at 512px).
  - **Count changes**: when `rbDensity` increases, newly-visible bubbles are reset/re-rolled so they don’t “pop” mid-field with stale positions.

---

## Nav Slow Gradient - Slider Baseline Fix

**Date**: 2026-01-19  
**Issue**: While Slow Gradient animation was running, the animation loop wrote hardcoded goo params each frame, overriding user slider changes (e.g. `navFlow` speed).

**Fix**: Updated `startGradientAnimation()` in `src/apps/landing/scripts/portal-app.js` so the animation loop **reads current slider values each frame** and animates gently around them (sliders become the baseline). The Slow Gradient button now just sets a good baseline and starts the loop.

### Double-check (Nav Slow Gradient)
- Verified `animate()` reads `navFlow/navWiggle/navGrip/navDrip` each frame, so moving sliders while the animation is running changes the animation immediately (no more hardcoded overwrite).
- Fixed persistence gap: Slow Gradient now dispatches `input` events after setting slider baselines, so the normal bundle/localStorage persistence captures the change.
  - Verified in code: Slow Gradient click sets `.value` and then calls `dispatchEvent(new Event('input', { bubbles: true }))` for each slider.
- Fixed defensive consistency: `stopGradientAnimation()` now uses `$("navGrip") || $("navVisc")` (same as `readBaseParams()`), so viscosity is restored correctly even if the DOM changes.

---

## Phone tab help text + RB mouse tuning

**Date**: 2026-01-19  
**Scope**: Add concise helper text/tooltips to non-RB tabs; reduce Rising Bubbles pointer reactivity so bubbles still complete bottom-to-top travel.

### UI help text / tooltips
- `src/index.html`
  - Added short inline helper rows for: **BG**, **Pin**, **GLB**, **Errl**, **Nav**, **Hue**, **DEV**
  - Refined key tooltips in **HUD** (Burst + Audio + Accessibility) without adding extra layout clutter

### Rising Bubbles pointer tuning
- `src/apps/landing/scripts/rise-bubbles-three.js`
  - Made pointer attract **mostly lateral (X-dominant)** and reduced Y influence via a small, clamped Y add.
  - Added an **upward minimum** when composing velocity (when speed > 0) so attraction/impulses can’t stall or reverse the rise.

### Quick verification (manual)
- Confirm helper text rows appear in the intended tabs and titles show on hover.
- With `rbAttract` enabled and `rbAttractIntensity` high, bubbles should still rise and reset at the top (no “stuck downward pull”).

### Final completion check
- Plan todos confirmed complete:
  - `help-text-tabs`
  - `rb-attract-lateral`
  - `notes`

---

## Touch interactions + RB grab/throw

**Date**: 2026-01-19  
**Scope**: Ensure key interactions work on touch; add grab/throw + flick impulse for Rising Bubbles.

### Touch support updates
- `src/apps/landing/scripts/portal-app.js`
  - Nav bubble hover effects now support **press-and-hold on touch/pen** via pointer events + pointer capture.
  - Desktop mouse hover remains unchanged (`mouseenter`/`mouseleave`).
- `src/apps/landing/styles/styles.css`
  - Added `touch-action: manipulation` to `.bubble` to keep taps responsive on mobile.

### Rising Bubbles grab/throw
- `src/apps/landing/scripts/rise-bubbles-three.js`
  - Added canvas (`#riseBubbles`) pointer interactions:
    - **Grab + drag** a bubble (raycast pick), then **release to throw** using estimated release velocity.
    - **Flick impulse**: fast swipe near a bubble applies an impulse without sticky dragging.
  - Added “thrown” window that bypasses the upward-min clamp briefly so downward/side throws feel natural.
  - Added off-screen bounds reset (x/y) so flung bubbles respawn cleanly.
- `src/apps/landing/styles/styles.css`
  - Enabled pointer input for `#riseBubbles` and set `touch-action: none` so drags don’t trigger browser gestures.

### Quick verification (manual)
- On mobile/touch:
  - Press-and-hold a nav bubble: glow + freeze while held; releasing clears.
  - Drag a Rising Bubble: it follows finger; release throws; bubble respawns after leaving bounds.
  - Flick near a Rising Bubble: it should kick off-screen with a noticeable impulse.

### Follow-up (RB tab tips)
- `src/index.html`
  - Added RB tab inline tips describing **grab/throw** and **flick** interactions (touch + mouse).

### Double-check notes (touch + throw)
- Verified RB tab tips are placed in **RB Basic**: one helper line under the section label and one helper line above Attract/Ripples.
- Verified nav bubble press-and-hold uses pointer capture and clears on `pointerup`/`pointercancel`/`lostpointercapture`.
- Verified Rising Bubbles interaction design avoids conflicts:
  - Canvas handlers use `preventDefault` only for touch/pen and only during interaction.
  - Ripple clicks still work when not interacting (ripple handler bails if `defaultPrevented`).
  - Thrown bubbles bypass the upward-min clamp briefly so downward throws are possible.
- Lints checked: no diagnostics for the modified files.

---

## Errl phone expanded + desktop drag

**Date**: 2026-01-19  
**Scope**: Add a UI control to expand the Errl phone and allow dragging it around on desktop.

### Changes
- `src/index.html`
  - Added `#phone-expand-button` next to `#phone-close-button`.
- `src/apps/landing/styles/styles.css`
  - Styled the expand button and added `.errl-panel.expanded` scaling.
- `src/apps/landing/scripts/portal-app.js`
  - Added expanded mode toggle + persistence (`errl_phone_expanded_v1`).
  - Added desktop drag via the vibe bar (pointer capture), with viewport clamping and persisted position (`errl_phone_expanded_pos_v1`).

### Quick verification (manual)
- Desktop: click expand ⤢ → phone grows; drag via the vibe bar; reload should restore position while expanded.
- Click again (⤡) → collapses back to bottom-right docked behavior.

### Follow-up (expand button placement)
- Moved `#phone-expand-button` to the opposite corner (top-left) so it doesn't cover the top-right tab area (Pin).

---

## RB throw velocity estimation - fix (history fallback)

**Date**: 2026-01-19  
**Issue**: When no history sample exceeded the 16ms threshold, the fallback velocity estimate used `arr[arr.length - 2]`, which can overestimate velocity on fast pointer movements.

**Fix**: Updated `estimateVelocityWorldPerSec()` fallback to use the oldest sample (`arr[0]`) to maximize time delta and stabilize throw strength.

### Double-check (expand button placement)
- Verified `#phone-expand-button` is pinned to **top-left** and hidden in minimized state (`.errl-panel.minimized #phone-expand-button { display:none }`), reducing overlap risk with the top-right tabs.
