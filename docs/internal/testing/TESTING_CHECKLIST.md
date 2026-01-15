# Errl Portal Comprehensive Testing Checklist

## Pre-Testing Setup
- [ ] Start development server: `npm run portal:dev`
- [ ] Open browser to `http://localhost:5173`
- [ ] Open browser DevTools Console (to monitor errors)
- [ ] Clear browser cache if needed
- [ ] Test in multiple browsers (Chrome, Firefox, Safari, Edge)

---

## Phase 1: Panel Minimize/Maximize Functionality

### Initial State
- [ ] Panel starts minimized (44px circular bubble in top-right corner)
- [ ] Minimized panel shows HUD icon texture
- [ ] Panel is positioned correctly (top: 20px, right: 20px)

### Expand Panel
- [ ] Click the minimized bubble → panel expands smoothly
- [ ] Panel shows header, tabs, and content sections
- [ ] No visual glitches during expansion
- [ ] Panel dimensions are correct (not stuck at 44px)

### Minimize Panel
- [ ] Click minimize button (–) in header → panel minimizes
- [ ] Panel smoothly transitions to 44px bubble
- [ ] Content is hidden correctly
- [ ] Panel returns to top-right position

### Panel Drag
- [ ] Drag panel by header → panel moves smoothly
- [ ] Panel can be positioned anywhere on screen
- [ ] Panel position persists during minimize/maximize
- [ ] Dragging doesn't interfere with minimize/maximize

---

## Phase 2: Tab Switching

Test each tab to ensure it switches correctly and shows proper controls:

### HUD Tab
- [ ] Tab button shows as active when clicked
- [ ] HUD section content is visible
- [ ] Particles burst button is visible and clickable
- [ ] Audio controls section visible (Enabled, Master, Low End)
- [ ] Accessibility section visible (Reduced Motion, High Contrast, Invert)
- [ ] Mood section visible (buttons disabled, as expected)

### Errl Tab
- [ ] Tab switches correctly
- [ ] Errl Size slider visible and functional
- [ ] Errl Goo section visible with all controls:
  - [ ] Goo Enabled checkbox
  - [ ] Displacement slider with Auto checkbox
  - [ ] Wobble slider with Auto checkbox
  - [ ] Speed slider with Auto checkbox
  - [ ] Auto Speed slider
  - [ ] Mouse Reactive checkbox
  - [ ] Random button

### Nav Tab
- [ ] Tab switches correctly
- [ ] Nav Bubbles section visible:
  - [ ] Orbit slider
  - [ ] Radius slider
  - [ ] Size slider
  - [ ] GL Orbs toggle checkbox
  - [ ] Rotate Skins button
- [ ] Nav Goo+ section visible:
  - [ ] Wiggle slider
  - [ ] Flow Speed slider
  - [ ] Grip slider
  - [ ] Drip slider
  - [ ] Viscosity slider
  - [ ] Slow Gradient button
  - [ ] Randomize button

### RB (Rising Bubbles) Tab
- [ ] Tab switches correctly
- [ ] Basic controls visible:
  - [ ] Attract checkbox and Intensity slider
  - [ ] Ripples checkbox and Intensity slider
  - [ ] Speed slider
  - [ ] Density slider
  - [ ] Alpha slider
- [ ] Advanced controls visible:
  - [ ] Wobble slider
  - [ ] Frequency slider
  - [ ] Min size and Max size number inputs
  - [ ] Jumbo Percent slider
  - [ ] Jumbo Scale slider
  - [ ] Size Hertz slider
  - [ ] Animation controls (Loop, Ping-Pong buttons, Speed, Animate button)

### GLB (GL Bubbles) Tab
- [ ] Tab switches correctly
- [ ] GL Particles section visible:
  - [ ] Speed slider
  - [ ] Density slider
  - [ ] Alpha slider
  - [ ] Randomize button

### BG (Background) Tab
- [ ] Tab switches correctly
- [ ] Section label visible
- [ ] No controls (expected - controls removed)

### DEV (Developer) Tab
- [ ] Tab switches correctly
- [ ] Developer Tools section visible:
  - [ ] Open Customizer button
  - [ ] PNG snapshot button
  - [ ] HTML snapshot button
  - [ ] Save Defaults button
  - [ ] Reset Defaults button

### Hue Tab
- [ ] Tab switches correctly
- [ ] Hue controls visible:
  - [ ] Enabled toggle checkbox
  - [ ] Target dropdown (nav, riseBubbles, bgBubbles, background, glOverlay)
  - [ ] Hue slider (0-360)
  - [ ] Saturation slider
  - [ ] Intensity slider
  - [ ] Timeline slider
  - [ ] Play/Pause button

---

## Phase 3: Effects & Controls Testing

### Navigation Bubbles
- [ ] All 8 bubbles orbit around Errl smoothly
- [ ] Orbit speed control affects bubble movement
- [ ] Radius control changes bubble distance from Errl
- [ ] Size control changes bubble size
- [ ] Hovering over bubbles triggers audio ping
- [ ] GL Orbs toggle shows/hides WebGL rendered orbs
- [ ] Rotate Skins button cycles through orb textures
- [ ] Nav Goo controls affect bubble visual appearance:
  - [ ] Wiggle creates elastic movement
  - [ ] Flow changes animation speed
  - [ ] Grip affects stickiness
  - [ ] Drip creates downward bias
  - [ ] Viscosity affects blob merging
- [ ] Slow Gradient button works
- [ ] Randomize button changes all nav goo values

### Rising Bubbles (Three.js Canvas)
- [ ] Canvas `#riseBubbles` exists and renders
- [ ] Bubbles rise from bottom to top
- [ ] Speed control affects rise speed
- [ ] Density control affects number of bubbles
- [ ] Alpha control affects bubble opacity
- [ ] Attraction/repulsion works when mouse moves
- [ ] Ripples appear on canvas click
- [ ] Advanced controls work:
  - [ ] Wobble creates side-to-side movement
  - [ ] Frequency affects wobble speed
  - [ ] Min/Max size controls work
  - [ ] Jumbo bubbles appear based on percentage
  - [ ] Size pulsing works when Size Hz > 0
  - [ ] Animation controls work (Loop, Ping-Pong, Animate)

### WebGL Effects
- [ ] WebGL canvas `#errlWebGL` exists and renders
- [ ] Errl texture appears in WebGL layer
- [ ] GL Bubbles (particles) render and move
- [ ] Speed control affects particle movement
- [ ] Density control affects particle count
- [ ] Alpha control affects particle opacity
- [ ] Randomize button changes particle settings

### Errl Goo Effects
- [ ] Classic goo creates wobble/distortion on Errl
- [ ] Enabled toggle shows/hides goo effect
- [ ] Displacement slider changes wobble strength
- [ ] Wobble slider changes oscillation amplitude
- [ ] Speed slider changes animation rate
- [ ] Auto checkboxes enable fade animations
- [ ] Auto Speed slider controls fade speed
- [ ] Mouse Reactive mode enhances goo near cursor
- [ ] Random button randomizes all goo values

### Hue System
- [ ] All 5 targets are selectable in dropdown
- [ ] Selecting different targets switches hue application
- [ ] Enabled toggle enables/disables hue effect
- [ ] Hue slider (0-360) rotates colors
- [ ] Saturation slider affects color richness
- [ ] Intensity slider affects effect strength
- [ ] Timeline slider manually sets hue position
- [ ] Play button animates hue timeline
- [ ] Pause button stops animation
- [ ] Hue effect applies correctly to selected target

### Audio Controls
- [ ] Master enable toggle enables/disables all audio
- [ ] Master volume slider affects overall volume
- [ ] Bass (Low End) slider affects low frequency gain
- [ ] Hovering nav bubbles plays audio ping (when enabled)
- [ ] Audio settings persist

### Accessibility Controls
- [ ] Reduced Motion toggle slows animations
- [ ] High Contrast toggle increases contrast
- [ ] Invert toggle inverts colors
- [ ] Settings persist when toggled

### Developer Tools
- [ ] Open Customizer button opens colorizer phone overlay
- [ ] Colorizer phone can be closed
- [ ] PNG snapshot button triggers download/copy
- [ ] HTML snapshot button exports HTML/CSS/JS
- [ ] Save Defaults button saves current settings to localStorage
- [ ] Reset Defaults button clears saved defaults
- [ ] Settings restore correctly after save/reset

---

## Phase 4: Navigation Links

**Note**: Paths differ between dev and production:
- **Dev mode**: Links point to `/apps/static/pages/...`
- **Production**: Links point to `/errl-portal/portal/pages/...` (or `/portal/pages/...` depending on base URL)

### Portal Navigation Bubbles
Test each nav bubble link:

- [ ] **About** → Navigates to `/portal/pages/about/index.html` (production) or `/apps/static/pages/about/index.html` (dev)
- [ ] **Gallery** → Navigates to `/portal/pages/gallery/index.html` (production) or `/apps/static/pages/gallery/index.html` (dev)
- [ ] **Assets** → Navigates to `/portal/pages/assets/index.html` (production) or `/apps/static/pages/assets/index.html` (dev)
- [ ] **Studio** → Navigates to `/studio.html`
- [ ] **Design (Pin Designer)** → Navigates to `/studio/pin-designer`
- [ ] **Events** → Navigates to `/portal/pages/events/index.html` (production) or `/apps/static/pages/events/index.html` (dev)
- [ ] **Merch** → Navigates to `/portal/pages/merch/index.html` (production) or `/apps/static/pages/merch/index.html` (dev)
- [ ] **Games** (if visible) → Navigates to `/portal/pages/games/index.html` (production) or `/apps/static/pages/games/index.html` (dev)

### Studio Hub Navigation
- [ ] Studio hub loads at `/studio`
- [ ] All tool cards render correctly
- [ ] Code Lab card navigates to `/studio/code-lab`
- [ ] Math Lab card loads iframe correctly
- [ ] Shape Madness card loads iframe correctly
- [ ] Pin Designer card navigates to `/studio/pin-designer`
- [ ] Projects card navigates to `/studio/projects`

### Page Navigation
- [ ] All portal pages have "Back to Portal" link
- [ ] Back links work correctly
- [ ] Pages load without console errors
- [ ] Pages display content correctly

---

## Phase 5: Responsive Design

### Mobile Viewport (375x667 - iPhone SE)
- [ ] No horizontal scroll
- [ ] Panel is accessible and usable
- [ ] Navigation bubbles visible and clickable
- [ ] All controls are accessible
- [ ] Text is readable
- [ ] Touch interactions work

### Tablet Viewport (768x1024 - iPad)
- [ ] Layout adapts correctly
- [ ] No overflow issues
- [ ] All controls accessible
- [ ] Navigation works
- [ ] Panel is usable

### Desktop Viewport (1920x1080)
- [ ] Full layout renders correctly
- [ ] All effects visible
- [ ] Performance is acceptable (60fps)
- [ ] No visual glitches

### Large Desktop (2560x1440)
- [ ] Layout scales appropriately
- [ ] No excessive spacing
- [ ] All elements properly sized

---

## Phase 6: Console Error Checks

### Critical Errors (Should NOT appear)
- [ ] No uncaught exceptions
- [ ] No failed module imports
- [ ] No WebGL context creation failures
- [ ] No Three.js initialization failures
- [ ] No missing asset errors (blocking)
- [ ] No undefined function calls

### Non-Critical Warnings (Expected, OK to ignore)
- [ ] AudioContext unavailable warnings (fallback handled)
- [ ] Missing element retries (handled gracefully)
- [ ] Texture load failures (handled gracefully)
- [ ] Favicon 404 errors

### Console Logs (Expected)
- [ ] `[portal-app] Nav bubbles initialized: X bubbles found`
- [ ] `[errlGL] init renderer resolution: X.XX`
- [ ] Any debug logs from dev system

---

## Phase 7: Performance & Edge Cases

### Performance
- [ ] Page loads within 5 seconds
- [ ] Initial render completes quickly
- [ ] Animations run smoothly (60fps target)
- [ ] No memory leaks (check over extended session)
- [ ] Reduced motion improves performance

### Edge Cases
- [ ] Rapid tab switching doesn't break UI
- [ ] Rapid slider changes handled gracefully
- [ ] Multiple rapid clicks on nav bubbles handled correctly
- [ ] Slider values outside range clamp correctly
- [ ] Invalid text input handled gracefully (e.g., NaN, undefined)
- [ ] Missing elements don't cause crashes
- [ ] Panel state persists across tab switches
- [ ] Settings persist across page reloads
- [ ] WebGL support detection works
- [ ] AudioContext support detection works
- [ ] Failed asset loading handled gracefully
- [ ] Extended session stability (test for 10+ minutes)

---

## Phase 8: Visual/UI Polish

### Visual Checks
- [ ] All icons/textures load correctly
- [ ] Colors match design system
- [ ] Shadows and glows render correctly
- [ ] Animations are smooth
- [ ] No flickering or flashing
- [ ] No z-index layering issues
- [ ] Panel backdrop blur works
- [ ] Borders and outlines visible
- [ ] Focus indicators visible for keyboard navigation

### UI Consistency
- [ ] All sliders have consistent styling
- [ ] All buttons have consistent styling
- [ ] All inputs have consistent styling
- [ ] Labels are readable and properly positioned
- [ ] Spacing is consistent
- [ ] Typography is consistent

---

## Phase 9: Cross-Browser Testing

### Chrome/Chromium
- [ ] All features work
- [ ] Performance acceptable
- [ ] Visual appearance correct

### Firefox
- [ ] All features work
- [ ] Performance acceptable
- [ ] Visual appearance correct

### Safari
- [ ] All features work
- [ ] Performance acceptable
- [ ] Visual appearance correct
- [ ] WebGL works (known to have stricter DPR caps)

### Edge
- [ ] All features work
- [ ] Performance acceptable
- [ ] Visual appearance correct

---

## Testing Notes

### Known Issues
- Mood buttons are intentionally disabled (marked as "Not Currently Working")
- Some browsers may have WebGL limitations (Safari caps DPR at 1.5)

### Testing Environment
- Development: `npm run portal:dev` → `http://localhost:5173`
- Production: Build and test from `dist/` folder

### Reporting Issues
When reporting issues, include:
1. Browser and version
2. Viewport size
3. Console errors/warnings
4. Steps to reproduce
5. Expected vs actual behavior
6. Screenshots if visual issue

---

## Quick Smoke Test (5 minutes)

If short on time, at minimum verify:
- [ ] Panel minimizes/expands correctly
- [ ] All 8 tabs switch correctly
- [ ] Navigation bubbles orbit and links work
- [ ] Rising bubbles render
- [ ] WebGL canvas renders
- [ ] No critical console errors
- [ ] Responsive on mobile viewport

