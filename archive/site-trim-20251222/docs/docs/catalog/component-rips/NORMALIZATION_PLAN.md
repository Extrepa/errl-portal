# Component Normalization Plan

**Goal:** Normalize all remaining raw component rips from the archive into standardized bundles.

**Current Status:**
- ✅ **25 normalized components** (backgrounds: 4, buttons: 2, cursors: 8, modules: 5, text: 3, props: 2, misc: 1)
- ⏳ **~32 remaining raw components** in archive

---

## Remaining Components by Category

### Backgrounds (11 remaining)
1. `AnisotropicVelvet_BG.html` - Velvet texture background
2. `BandWSquiggle_BG.html` - Band with squiggle pattern
3. `BasicShadowBubbles_BG.html` - Shadow bubbles effect
4. `BubbleBuster_BG.html` - Bubble buster animation
5. `ParallaxShootingStars_BG.html` - Parallax shooting stars
6. `RainbowDotSuttleGradient_BG.html` - Subtle rainbow dot gradient
7. `RainbowSquareGrid_BG.html` - Rainbow square grid pattern
8. `SideScrollingBWSquareWall_BG.html` - Side-scrolling black/white square wall
9. `SuttleRainbowWisps_BG.html` - Subtle rainbow wisps
10. `TrippyBrokenTriangles_BG.html` - Broken triangles pattern
11. `WireGrid_BG.html` - Wire grid background

### Buttons (1 remaining)
1. `PurpleSmileHoverConfetti_Button.html` - Purple smile button with confetti on hover

### Cursors (3 remaining)
1. `FluffyPixelTrail_Cursor.html` - Fluffy pixel trail cursor
2. `PixelSquareRainbow_Cursor.html` - Pixel square rainbow cursor
3. `WeirdMotionTrace_Cursor.html` - Weird motion trace cursor

### Modules (13 remaining)
1. `3in1MixItUp_Module.html` - 3-in-1 mix it up module
2. `AsciiDrawingTablet_Module.html` - ASCII drawing tablet
3. `BlackHoleRainbowBall_Module_Prop.html` - Black hole rainbow ball
4. `ChronoRainbowTripSlink_Module_Prop.html` - Chrono rainbow trip slink
5. `ErrlsSpinningRainbowString_Module_Prop.html` - Errl's spinning rainbow string
6. `KaleidoSpinTopString_Module.html` - Kaleidoscope spin top string
7. `PaintSplatMix_Module.html` - Paint splat mix
8. `ParticleFaceParallaxPush_Module.html` - Particle face parallax push (needs camera gating)
9. `ParticleShapes_Module.html` - Particle shapes
10. `rainbow_drawing_tablet_Module.html` - Rainbow drawing tablet
11. `RainbowPoofBalls_Module_LAG.html` - Rainbow poof balls (needs performance testing)
12. `RainbowSpinningHair_Module.html` - Rainbow spinning hair
13. `SpinningRainbowBlackHole_Module.html` - Spinning rainbow black hole

### Props (4 remaining)
1. `3DEffect_3DObject_Prop.html` - 3D effect 3D object
2. `AfterimagePulse_Prop.html` - Afterimage pulse effect
3. `DrippyMirror_PropSwapSVG.html` - Drippy mirror (needs performance testing)
4. `MoireMeltProp_Meh.html` - Moire melt prop

---

## Normalization Priority

### Phase 1: Quick Wins (Cursors & Buttons) - 4 components
**Estimated Time:** 2-3 hours
- Cursors are typically simpler canvas-based effects
- Single button component
- **Target:** Complete in one session

### Phase 2: Backgrounds - 11 components
**Estimated Time:** 4-6 hours
- Backgrounds are usually full-window canvas effects
- Similar patterns to already normalized backgrounds
- **Target:** Complete in 2-3 sessions

### Phase 3: Props - 4 components
**Estimated Time:** 2-3 hours
- Props are typically overlay effects
- Some may need performance testing (DrippyMirror)
- **Target:** Complete in 1-2 sessions

### Phase 4: Modules - 13 components
**Estimated Time:** 6-8 hours
- Most complex category
- Some require special handling (camera gating, performance testing)
- **Target:** Complete in 3-4 sessions

---

## Normalization Checklist

For each component, ensure:

- [ ] Extract HTML structure to `index.html`
- [ ] Extract CSS to `styles.css`
- [ ] Extract JavaScript to `script.js`
- [ ] Create `meta.json` with:
  - Category, description, controls
  - Safety notes (autoplay, permissions, etc.)
  - Tags and keywords
- [ ] Remove Framer analytics and external scripts
- [ ] Disable autoplay media (audio/video start paused & muted)
- [ ] Gate permissions behind explicit user actions
- [ ] Add `prefers-reduced-motion` support
- [ ] Add preview mode script (`../../_shared/preview-mode.js`)
- [ ] Test in catalog preview
- [ ] Generate thumbnail (`npm run thumbnails:generate`)
- [ ] Update backlog status to `normalized`
- [ ] Update component inventory

---

## Batch Processing Strategy

1. **Start with cursors** - simplest, most consistent patterns
2. **Then buttons** - single component, quick win
3. **Backgrounds** - build on existing patterns
4. **Props** - overlay effects, usually simpler
5. **Modules** - most complex, save for last

---

## Tools & Commands

```bash
# Generate thumbnails for all components
npm run thumbnails:generate

# Update component inventory
npm run inventory:scan

# Generate catalog manifest
npm run catalog:component-rips
```

---

## Next Steps

1. Start with Phase 1: Normalize the 3 remaining cursors + 1 button
2. Update backlog and inventory after each batch
3. Generate thumbnails after each batch
4. Test catalog preview after each batch

