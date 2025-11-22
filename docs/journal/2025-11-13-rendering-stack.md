# Team Update - Errl Portal Rendering Stack

## 🎭 Portal Rendering Architecture

This update documents the critical rendering stack and layering system for the Errl Portal based on established project rules.

### Layer Order (Back → Front)

The portal uses a carefully orchestrated multi-layer rendering system:

**Layer 0: Background Particles (DOM Canvas)**
- Element: `#bgParticles` canvas
- Z-index: 0
- Purpose: Background particle effects

**Layer 1: WebGL Canvas (PIXI.js)**
- Element: `#errlWebGL` canvas
- Z-index: 1
- Stage config: `sortableChildren = true`
- Contains multiple sub-layers:
  - **A. ParticleContainer** (GL bubbles) — added before all else
  - **B. fxRoot** (filtered visuals)
    - Gradient/displacement overlay
    - Errl GL sprite with goo filter
    - Orb container (GL orbs)

**Layer 2: Rising Bubbles (DOM Canvas)**
- Element: `#riseBubbles` canvas
- Z-index: 2
- Purpose: Animated bubble effects

**Layer 3: Scene Layer (DOM)**
- Element: `.scene-layer`
- Z-index: 3
- Contains:
  - Errl DOM image/SVG (main mascot)
  - Navigation orbit
  - Pool elements

**Layer 4: Vignette Frame (DOM)**
- Element: `.vignette-frame`
- Z-index: 4
- Purpose: Visual framing overlay

**Layer 5: UI Overlays (DOM)**
- Element: Errl Phone and other overlays
- Z-index: 4000+
- Purpose: Interactive UI elements

---

## 🎨 Rendering Rules & Best Practices

### Critical Don'ts
- ❌ **Never apply filters to `app.stage`** when using ParticleContainer
- ❌ **ParticleContainer ignores zIndex** — draw order is `addChild` order only
- ❌ **Don't forget** `pointer-events: none` on canvases unless interaction needed

### Critical Do's
- ✅ **Filter `fxRoot` instead** of the main stage
- ✅ **Set `app.stage.sortableChildren = true`** for zIndex to work
- ✅ **Give canvases explicit z-index** for proper layering
- ✅ **Use `renderer.width/height`** for sizing; defer if 0
- ✅ **Rebuild on resize** to maintain proper dimensions

### Quick DevTools Checks

**List all canvases:**
```javascript
[...document.querySelectorAll('canvas')].map(c => ({
  id: c.id,
  z: getComputedStyle(c).zIndex
}))
```

**Toggle overlay visibility:**
```javascript
overlay && (overlay.visible = false)
```

**Bring particles to front/back:**
```javascript
// Front
app.stage.addChild(particles)

// Back
app.stage.addChildAt(particles, 0)
```

---

## 🎯 Asset Guidelines

### Primary Errl Assets

**Main Mascot:**
- Path: `/src/portal/assets/L4_Central/errl-body-face-eyes-mouth-with-limbs copy.svg`
- Usage: Star of the home page — display big and vibrant
- Animation: Wiggle and jiggle effects
- Priority: Use this whenever possible

**Errl Face (Coin/About):**
- Path: `/src/portal/assets/L4_Central/errl-face-2.svg`
- Usage: Coin decoration and about page face
- Note: Secondary to main body asset

### Asset Rules
- Prioritize the main Errl body asset for all primary displays
- Errl face is for accents and secondary pages
- Always use unique spelling: **"Errl"** (not "Earl" or other variants)
- References to "tools" should be "studio"

---

## 🚀 Performance Considerations

### PIXI.js Optimization
- Use **ParticleContainer** for large numbers of simple sprites
- Apply filters to child containers, not the root stage
- Enable `sortableChildren` only when zIndex needed
- Batch sprites with same texture for better performance

### Canvas Management
- Set explicit dimensions to avoid resize thrashing
- Use `pointer-events: none` for non-interactive canvases
- Clean up resources on unmount
- Monitor memory with Chrome DevTools

### Animation Performance
- Target 60fps for all animations
- Use GPU-accelerated properties (transform, opacity)
- Implement `prefers-reduced-motion` support
- Test on lower-end devices

---

## 🔗 Related Documentation

- **docs/team/MOTION_GRAPHICS_GUIDE.md** - Animation and motion design principles
- **Portal rendering stack rule** - Layer ordering and z-index management
- **Errl asset rules** - Primary mascot asset priorities

---

## 📝 Next Steps

1. Audit existing canvas elements for proper z-index ordering
2. Verify filter application on `fxRoot` instead of `app.stage`
3. Test rendering stack on different devices and browsers
4. Document any custom PIXI filters or effects
5. Create reusable PIXI components for common patterns

---

*For questions about the rendering stack or PIXI.js implementation, refer to the project rules or consult with the team lead.*
