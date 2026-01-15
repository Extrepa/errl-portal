# Errl Portal - Master Effects Reference

**Created**: 2026-01-15  
**Purpose**: Comprehensive reference for all visual effects, controls, technical implementation, and enhancement opportunities  
**Status**: Complete Reference

---

## Table of Contents

1. [Introduction & Overview](#introduction--overview)
2. [Quick Reference Tables](#quick-reference-tables)
3. [User Guide](#user-guide)
   - [Background Layer Effects](#background-layer-effects)
   - [WebGL Effects](#webgl-effects)
   - [Navigation Effects](#navigation-effects)
   - [Errl Effects](#errl-effects)
   - [Color & Hue Effects](#color--hue-effects)
   - [Audio Effects](#audio-effects)
4. [Developer/Technical Guide](#developertechnical-guide)
   - [Background Layer Effects](#background-layer-effects-1)
   - [WebGL Effects](#webgl-effects-1)
   - [Navigation Effects](#navigation-effects-1)
   - [Errl Effects](#errl-effects-1)
   - [Color & Hue Effects](#color--hue-effects-1)
   - [Audio Effects](#audio-effects-1)
5. [Settings & Persistence](#settings--persistence)
6. [Improvement & Enhancement](#improvement--enhancement)
7. [Code Reference Index](#code-reference-index)

---

## Introduction & Overview

This document serves as the definitive reference for all visual and audio effects in the Errl Portal. It is organized into two main sections:

- **User Guide**: For users who want to understand and control effects through the phone panel interface
- **Developer/Technical Guide**: For developers who need to understand implementation, modify effects, or integrate programmatically

### Effect Categories

Effects are organized into the following categories:

1. **Background Layer Effects**: Deep background elements (particles, bubbles, DOM layers)
2. **WebGL Effects**: GPU-accelerated effects (goo distortion, GL particles, overlay)
3. **Navigation Effects**: Interactive menu bubbles and their visual effects
4. **Errl Effects**: Character-specific effects (size, goo, filters)
5. **Color & Hue Effects**: Color manipulation across layers
6. **Audio Effects**: Sound feedback for interactions

### How to Use This Reference

- **Finding Controls**: Use the [Quick Reference Tables](#quick-reference-tables) to locate which phone panel tab contains controls for a specific effect
- **Understanding Parameters**: Each effect section includes parameter ranges, defaults, and descriptions
- **Programmatic Access**: The Developer/Technical sections include JavaScript API references
- **Enhancement Ideas**: See the [Improvement & Enhancement](#improvement--enhancement) section for each effect

### Phone Panel Tabs

The Errl Phone control panel contains the following tabs (in order):

- **HUD**: Heads-up display controls (particles burst, audio)
- **Errl**: Errl character controls (size, classic goo)
- **Pin**: Pin widget controls (SVG colorizer)
- **Nav**: Navigation bubble controls (orbit, goo effects)
- **RB**: Rising Bubbles controls (Three.js canvas bubbles)
- **GLB**: GL Background Bubbles controls (WebGL particles)
- **BG**: Background controls (currently empty)
- **DEV**: Developer controls
- **Hue**: Hue/color adjustment controls

---

## Quick Reference Tables

### Effect → Tab Location

| Effect | Tab | Section Name |
|--------|-----|--------------|
| Background Particles | (Auto-running, no controls) | - |
| Errl Background | BG | Background (empty) |
| Rising Bubbles | RB | Rising Bubbles (Canvas) |
| GL Background Bubbles | GLB | GL Particles (BG Bubbles) |
| Navigation Orbit | Nav | Nav Bubbles |
| Navigation Goo | Nav | Nav Goo+ |
| Errl Size | Errl | Errl Size |
| Classic Goo | Errl | Errl Goo (wobble) |
| Hue Controller | Hue | Hue |
| Audio System | HUD | Audio |

### Control ID → Effect → Parameter Range

| Control ID | Effect | Parameter | Range | Default |
|------------|--------|-----------|-------|---------|
| `rbSpeed` | Rising Bubbles | Speed | 0-3 | 1.0 |
| `rbDensity` | Rising Bubbles | Density | 0-2 | 1.0 |
| `rbAlpha` | Rising Bubbles | Alpha | 0-1 | 0.95 |
| `rbWobble` | Rising Bubbles | Wobble | 0-2 | 1.0 |
| `rbFreq` | Rising Bubbles | Frequency | 0-2 | 1.0 |
| `rbMin` | Rising Bubbles | Min Size | 6-256 | 14 |
| `rbMax` | Rising Bubbles | Max Size | 6-256 | 36 |
| `rbJumboPct` | Rising Bubbles | Jumbo Percent | 0-0.6 | 0.1 |
| `rbJumboScale` | Rising Bubbles | Jumbo Scale | 1.0-2.5 | 1.6 |
| `rbSizeHz` | Rising Bubbles | Size Hertz | 0-1 | 0.0 |
| `rbAttract` | Rising Bubbles | Attract | boolean | true |
| `rbAttractIntensity` | Rising Bubbles | Attract Intensity | 0-2 | 1.0 |
| `rbRipples` | Rising Bubbles | Ripples | boolean | false |
| `rbRippleIntensity` | Rising Bubbles | Ripple Intensity | 0-2 | 1.2 |
| `bgSpeed` | GL Background Bubbles | Speed | 0-3 | 0.9 |
| `bgDensity` | GL Background Bubbles | Density | 0-1.5 | 1.2 |
| `glAlpha` | GL Background Bubbles | Alpha | 0-1 | 0.85 |
| `navOrbitSpeed` | Navigation Orbit | Orbit Speed | 0-2 | 1.0 |
| `navRadius` | Navigation Orbit | Radius | 0.6-1.6 | 1.2 |
| `navOrbSize` | Navigation Orbit | Size | 0.6-1.6 | 1.05 |
| `glOrbsToggle` | Navigation Orbit | GL Orbs | boolean | true |
| `navWiggle` | Navigation Goo | Wiggle | 0-1 | 0.4 |
| `navFlow` | Navigation Goo | Flow Speed | 0-2 | 0.8 |
| `navGrip` | Navigation Goo | Grip | 0-1 | 0.5 |
| `navDrip` | Navigation Goo | Drip | -1-1 | -0.5 |
| `navVisc` | Navigation Goo | Viscosity | 0-1 | 0.9 |
| `errlSize` | Errl Size | Size | 0.8-1.6 | 1.0 |
| `classicGooEnabled` | Classic Goo | Enabled | boolean | true |
| `classicGooStrength` | Classic Goo | Displacement | 0-2 | 0.35 |
| `classicGooWobble` | Classic Goo | Wobble | 0-2 | 0.55 |
| `classicGooSpeed` | Classic Goo | Speed | 0-2 | 0.45 |
| `classicGooAutoSpeed` | Classic Goo | Auto Speed | 0.005-0.25 | 0.05 |
| `classicGooMouseReact` | Classic Goo | Mouse Reactive | boolean | true |
| `hueTarget` | Hue Controller | Target | select | nav |
| `hueShift` | Hue Controller | Hue | 0-360 | 0 |
| `hueSat` | Hue Controller | Saturation | 0-2 | 1.0 |
| `hueInt` | Hue Controller | Intensity | 0-1 | 1.0 |
| `hueTimeline` | Hue Controller | Timeline | 0-360 | 0 |
| `hueEnabled` | Hue Controller | Enabled | boolean | false |
| `audioEnabled` | Audio System | Enabled | boolean | true |
| `audioMaster` | Audio System | Master Volume | 0-1 | 0.4 |
| `audioBass` | Audio System | Bass EQ | 0-1 | 0.2 |

### File → Effect → Purpose

| File | Effect | Purpose |
|------|--------|---------|
| `src/apps/landing/scripts/bg-particles.js` | Background Particles | Canvas starfield animation |
| `src/apps/landing/fx/errl-bg.ts` | Errl Background | DOM background layers with parallax |
| `src/apps/landing/scripts/rise-bubbles-three.js` | Rising Bubbles | Three.js 3D iridescent bubbles |
| `src/apps/landing/scripts/webgl.js` | WebGL Layer | PixiJS effects (goo, particles, overlay, orbs) |
| `src/apps/landing/scripts/portal-app.js` | Navigation Orbit | Orbiting menu bubbles |
| `src/apps/landing/scripts/portal-app.js` | Classic Goo | SVG filter goo controls |
| `src/apps/landing/fx/hue-controller.ts` | Hue Controller | Color adjustments for layers |
| `src/index.html` | SVG Filters | Filter definitions (uiGoo, classicGoo, errlGooFX, poolRipple) |

---

## User Guide

This section provides user-friendly documentation for controlling effects through the Errl Phone panel interface.

---

### Background Layer Effects

#### 1. Background Particles

**What it is**: A subtle starfield animation rendered on a canvas element. Stars drift slowly across the screen with a soft glow effect.

**Where to find controls**: No controls available in phone panel (auto-running effect)

**Visual description**: Small colored dots (stars) move slowly across a black background. Stars have varying sizes (0.6-2.2px radius) and colors (hue range 200-320°). They use a soft glow effect with shadow blur.

**Parameters** (hardcoded, not adjustable):
- **Alpha**: 0.16 (opacity of stars)
- **Speed**: 0.12 (movement velocity multiplier)
- **Star count**: Automatically calculated based on viewport size (~1 star per 22,000 pixels)

**How it works**: Stars wrap around screen edges when they reach boundaries. Uses canvas 2D rendering with lighter composite operation for glow effects.

---

#### 2. Errl Background

**What it is**: DOM-based background layers that provide depth and parallax effects. Includes base gradient, optional shimmer layer, vignette frame, and HUD drip elements.

**Where to find controls**: **BG Tab** (currently empty - controls removed)

**Visual description**: 
- **Base layer**: Radial gradient background with parallax movement
- **Shimmer layer**: Optional animated shimmer effect (can be disabled)
- **Vignette frame**: Rounded monitor frame effect with inner shadows
- **HUD drip**: Optional header images that can be displayed

**Features**:
- **Parallax**: Background layers move slightly based on mouse/pointer position
- **Header variants**: Two different header image styles (variant 1 or 2)
- **Responsive**: Adapts to viewport size

**How to manipulate**: Currently no UI controls. Background is initialized automatically via `ErrlBG.mount()` function. Parallax responds to pointer movement automatically.

**Note**: The BG tab in the phone panel is intentionally empty. Shimmer and vignette controls were removed in a previous update.

---

#### 3. Rising Bubbles

**What it is**: Three.js-powered 3D iridescent bubbles that rise from the bottom of the screen. Bubbles have realistic lighting, fresnel effects, and rainbow color shifts based on viewing angle.

**Where to find controls**: **RB Tab** → "Rising Bubbles (Canvas)" and "RB Bubbles Advanced" sections

**Visual description**: Spherical 3D bubbles with iridescent shader materials. Colors shift based on viewing angle (fresnel effect) and time. Bubbles rise from bottom to top, positioned in layers behind and in front of navigation bubbles.

**All Controls**:

**Basic Controls**:
- **Attract** (`rbAttract`): Checkbox - Enable/disable pointer attraction/repulsion
  - **Intensity** (`rbAttractIntensity`): Range 0-2, default 1.0 - Strength of attraction effect
- **Ripples** (`rbRipples`): Checkbox - Enable water-like ripples on click
  - **Intensity** (`rbRippleIntensity`): Range 0-2, default 1.2 - Ripple visibility
- **Speed** (`rbSpeed`): Range 0-3, default 1.0 - How fast bubbles rise
- **Density** (`rbDensity`): Range 0-2, default 1.0 - How many bubbles appear
- **Alpha** (`rbAlpha`): Range 0-1, default 0.95 - Opacity of bubbles

**Advanced Controls**:
- **Wobble** (`rbWobble`): Range 0-2, default 1.0 - Side-to-side wiggle as bubbles rise
- **Frequency** (`rbFreq`): Range 0-2, default 1.0 - How quickly wobble oscillates
- **Min size** (`rbMin`): Number 6-256, default 14 - Smallest bubble size in pixels
- **Max size** (`rbMax`): Number 6-256, default 36 - Largest bubble size in pixels
- **Jumbo Percent** (`rbJumboPct`): Range 0-0.6, default 0.1 - Probability (0-60%) of spawning larger "jumbo" bubbles
- **Jumbo Scale** (`rbJumboScale`): Range 1.0-2.5, default 1.6 - Size multiplier for jumbo bubbles
- **Size Hertz** (`rbSizeHz`): Range 0-1, default 0.0 - Speed of bubble size pulsing animation (0 = disabled)

**Animation Controls**:
- **Loop** (`rbAdvModeLoop`): Button - Loop animation mode
- **Ping-Pong** (`rbAdvModePing`): Button - Ping-pong animation mode
- **Speed** (`rbAdvAnimSpeed`): Number 0.02-1.0, default 0.10 - Animation speed multiplier
- **Play/Pause** (`rbAdvPlayPause`): Button - Start/stop animation

**Parameter Ranges**:
- Speed: 0 (stopped) to 3 (very fast)
- Density: 0 (no bubbles) to 2 (very dense)
- Alpha: 0 (invisible) to 1 (fully opaque)
- Wobble: 0 (no wobble) to 2 (strong wobble)
- Frequency: 0 (slow oscillation) to 2 (fast oscillation)
- Sizes: 6px (tiny) to 256px (huge)
- Jumbo Percent: 0% (no jumbo bubbles) to 60% (mostly jumbo)
- Jumbo Scale: 1.0x (same as max) to 2.5x (very large)

**How to manipulate**:
1. Open Errl Phone panel (click Errl or press keyboard shortcut)
2. Navigate to **RB Tab**
3. Adjust sliders in "Rising Bubbles (Canvas)" section for basic controls
4. Scroll to "RB Bubbles Advanced" for detailed parameters
5. Use animation controls to create custom bubble behaviors

**Visual examples**:
- **High Speed + High Density**: Creates a dense "bubble storm" effect
- **Low Alpha + High Wobble**: Creates subtle, wobbly ghost bubbles
- **High Jumbo Percent + High Jumbo Scale**: Creates dramatic large bubbles
- **Attract Enabled + High Intensity**: Bubbles cluster around mouse cursor
- **Ripples Enabled**: Clicking creates expanding ripple waves

---

### WebGL Effects

#### 4. WebGL Layer

**What it is**: A PixiJS-powered WebGL rendering layer that provides GPU-accelerated effects including goo distortion on Errl, particle systems, overlay effects, and 3D orb rendering.

**Where to find controls**: Multiple tabs
- **GLB Tab**: GL Background Bubbles controls
- **Nav Tab**: GL Orbs toggle
- **Errl Tab**: WebGL mode (when enabled, replaces classic goo)

**Visual description**: 
- **Goo Distortion**: Errl's SVG texture is distorted with noise-based displacement
- **GL Particles**: GPU-accelerated bubble particles in background
- **Overlay**: Gradient overlay with displacement and ripple effects
- **GL Orbs**: 3D-rendered orbs that mirror navigation bubble positions

**Features**:
- High-performance GPU rendering
- Resolution scaling (auto-detects device capabilities)
- Safari-specific optimizations
- Multiple particle layers for depth

**Note**: WebGL layer must be explicitly enabled (not auto-started). Use "Burst" button in HUD tab or call `window.enableErrlGL()`.

---

#### 5. GL Background Bubbles

**What it is**: GPU-accelerated particle system that renders bubble-like particles in the background. Uses WebGL for high performance.

**Where to find controls**: **GLB Tab** → "GL Particles (BG Bubbles)" section

**Visual description**: Procedurally generated bubble particles that move and scale. Multiple layers create depth. Particles use additive blending for glow effects.

**All Controls**:
- **Speed** (`bgSpeed`): Range 0-3, default 0.9 - How fast particles move
- **Density** (`bgDensity`): Range 0-1.5, default 1.2 - How many particles are spawned
- **Alpha** (`glAlpha`): Range 0-1, default 0.85 - Opacity of particle layer
- **Randomize** (`glbRandom`): Button - Randomize all GLB parameters

**Parameter Ranges**:
- Speed: 0 (stopped) to 3 (very fast)
- Density: 0 (no particles) to 1.5 (very dense)
- Alpha: 0 (invisible) to 1 (fully opaque)

**How to manipulate**:
1. Open Errl Phone panel
2. Navigate to **GLB Tab**
3. Adjust sliders for Speed, Density, and Alpha
4. Click "Randomize" for random parameter combinations

**Visual examples**:
- **High Speed + High Density**: Creates fast-moving particle storm
- **Low Alpha**: Subtle background effect
- **Low Density + High Alpha**: Sparse but visible particles

---

#### 6. GL Overlay

**What it is**: WebGL overlay layer with gradient texture, displacement effects, and pointer-reactive ripples.

**Where to find controls**: **Hue Tab** → Target "glOverlay" (color adjustments only)

**Visual description**: Gradient overlay that can be color-adjusted via Hue Controller. Includes displacement animation and ripple effects that respond to pointer movement.

**Features**:
- Gradient texture generation
- Animated displacement (sin/cos waves)
- Pointer-reactive ripples
- Color adjustment via Hue Controller

**Note**: Overlay alpha and displacement are controlled programmatically. Only color adjustments are available via Hue tab.

---

### Navigation Effects

#### 7. Navigation Orbit/Bubbles

**What it is**: Interactive menu bubbles that orbit around Errl in a circular pattern. Bubbles are clickable links to different portal pages.

**Where to find controls**: **Nav Tab** → "Nav Bubbles" section

**Visual description**: Circular menu buttons with iridescent gradients, orbiting around Errl's center. Bubbles have hover effects (glow, audio), keyboard navigation support, and can be rendered in both DOM and WebGL.

**All Controls**:
- **Orbit** (`navOrbitSpeed`): Range 0-2, default 1.0 - How fast bubbles orbit around Errl
- **Radius** (`navRadius`): Range 0.6-1.6, default 1.2 - Distance of bubbles from Errl center
- **Size** (`navOrbSize`): Range 0.6-1.6, default 1.05 - Overall size of nav bubbles
- **GL Orbs** (`glOrbsToggle`): Checkbox, default true - Show WebGL 3D-rendered orbs that sync with DOM bubbles
- **Rotate Skins** (`rotateSkins`): Button - Cycle through fun orb textures (faces, patterns, etc.)

**Parameter Ranges**:
- Orbit Speed: 0 (stationary) to 2 (very fast)
- Radius: 0.6x (close to Errl) to 1.6x (far from Errl)
- Size: 0.6x (small) to 1.6x (large)

**How to manipulate**:
1. Open Errl Phone panel
2. Navigate to **Nav Tab**
3. Adjust "Orbit" slider for rotation speed
4. Adjust "Radius" slider for distance from Errl
5. Adjust "Size" slider for bubble scale
6. Toggle "GL Orbs" to show/hide WebGL-rendered orbs
7. Click "Rotate Skins" to cycle orb textures

**Visual examples**:
- **High Orbit + Large Radius**: Bubbles orbit quickly in wide circle
- **Low Orbit + Small Radius**: Slow, tight orbit close to Errl
- **Large Size**: Bigger, more prominent bubbles
- **GL Orbs Enabled**: Additional 3D-rendered orbs with iridescent shaders

**Keyboard Navigation**:
- **Cmd/Ctrl+K**: Activate keyboard navigation
- **Arrow Keys**: Navigate between bubbles
- **Enter/Space**: Activate selected bubble
- **Escape**: Deactivate keyboard navigation
- **Shift+B**: Toggle hidden Games bubble

---

#### 8. Navigation Goo

**What it is**: Gooey blending effect applied to the navigation bubble group. Creates elastic, viscous movement and merging effects between bubbles.

**Where to find controls**: **Nav Tab** → "Nav Goo+" section

**Visual description**: Bubbles appear to merge and stretch when close together, creating a liquid-like effect. Movement has elastic resistance and can include downward "drip" bias.

**All Controls**:
- **Wiggle** (`navWiggle`): Range 0-1, default 0.4 - Elastic movement blend (how much bubbles wiggle)
- **Flow Speed** (`navFlow`): Range 0-2, default 0.8 - Motion scaling (speed of flow animation)
- **Grip** (`navGrip`): Range 0-1, default 0.5 - Grip/Stickiness (resistance to movement, higher = more visible animation)
- **Drip** (`navDrip`): Range -1-1, default -0.5 - Downward bias (negative = upward, positive = downward sag)
- **Viscosity** (`navVisc`): Range 0-1, default 0.9 - How strongly blobs merge together
- **Slow Gradient** (`navSlowGradient`): Button - Apply slow color gradient animation
- **Gradient Play/Pause** (`navGradientPlayPause`): Button - Play/pause gradient animation
- **Randomize** (`navRandom`): Button - Randomize all Nav Goo+ parameters

**Parameter Ranges**:
- Wiggle: 0 (no wiggle) to 1 (maximum elastic movement)
- Flow Speed: 0 (no flow) to 2 (fast flow)
- Grip: 0 (no resistance) to 1 (strong resistance)
- Drip: -1 (strong upward bias) to 1 (strong downward bias)
- Viscosity: 0 (no merging) to 1 (strong merging)

**How to manipulate**:
1. Open Errl Phone panel
2. Navigate to **Nav Tab**
3. Scroll to "Nav Goo+" section
4. Adjust sliders for desired gooey effect
5. Use "Slow Gradient" for color animation
6. Click "Randomize" for random combinations

**Visual examples**:
- **High Wiggle + High Grip**: Bubbles stretch and resist movement dramatically
- **High Viscosity**: Bubbles merge together when close
- **Positive Drip**: Bubbles sag downward
- **Negative Drip**: Bubbles float upward
- **High Flow Speed**: Fast, fluid motion

**Note**: Nav Goo+ requires WebGL to be enabled. Effects are applied via `window.errlGLSetGoo()` function.

---

### Errl Effects

#### 9. Errl Size/Scale

**What it is**: Overall scaling control for the Errl character. Affects the entire Errl wrapper including SVG image and all associated effects.

**Where to find controls**: **Errl Tab** → "Errl Size" section

**Visual description**: Scales Errl up or down while maintaining aspect ratio. Uses CSS `zoom` property for crisp scaling (with Firefox fallback to `transform: scale()`).

**All Controls**:
- **Size** (`errlSize`): Range 0.8-1.6, default 1.0 - Overall scale multiplier

**Parameter Ranges**:
- Size: 0.8x (80% - smaller) to 1.6x (160% - larger)

**How to manipulate**:
1. Open Errl Phone panel
2. Navigate to **Errl Tab**
3. Adjust "Size" slider
4. Errl scales in real-time

**Visual examples**:
- **0.8x**: Smaller, more subtle Errl
- **1.0x**: Default size
- **1.6x**: Large, prominent Errl

**Note**: Scaling also affects WebGL orb positions (they sync to Errl's center).

---

#### 10. Classic Goo

**What it is**: SVG filter-based goo effect that creates wobble and displacement on Errl's body. Uses fractal noise for organic, liquid-like distortion.

**Where to find controls**: **Errl Tab** → "Errl Goo (wobble)" section

**Visual description**: Errl's edges appear to wobble and distort organically, like a liquid or gooey substance. The effect can pulse, respond to mouse proximity, and auto-animate.

**All Controls**:

**Basic Controls**:
- **Goo Enabled** (`classicGooEnabled`): Checkbox, default true - Enable/disable goo effect
- **Displacement** (`classicGooStrength`): Range 0-2, default 0.35 - Amount of displacement wobble
  - **Auto** (`classicGooStrengthAuto`): Checkbox - Enable auto-fade for displacement
- **Wobble** (`classicGooWobble`): Range 0-2, default 0.55 - Oscillation amplitude
  - **Auto** (`classicGooWobbleAuto`): Checkbox - Enable auto-fade for wobble
- **Speed** (`classicGooSpeed`): Range 0-2, default 0.45 - Rate of internal SVG noise animation
  - **Auto** (`classicGooSpeedAuto`): Checkbox, default true - Enable auto-fade for speed

**Advanced Controls**:
- **Auto Speed** (`classicGooAutoSpeed`): Range 0.005-0.25, default 0.05 - Speed of auto-fade sweep
- **Animation** (`classicGooAutoPlayPause`): Button - Play/pause auto-fade animation
- **Mouse Reactive** (`classicGooMouseReact`): Checkbox, default true - Let Errl goo respond to cursor proximity
- **Random** (`classicGooRandom`): Button - Randomize all goo parameters

**Parameter Ranges**:
- Displacement: 0 (no displacement) to 2 (strong displacement)
- Wobble: 0 (no wobble) to 2 (strong wobble)
- Speed: 0 (no animation) to 2 (fast animation)
- Auto Speed: 0.005 (very slow fade) to 0.25 (fast fade)

**How to manipulate**:
1. Open Errl Phone panel
2. Navigate to **Errl Tab**
3. Toggle "Goo Enabled" to turn effect on/off
4. Adjust "Displacement" for wobble amount
5. Adjust "Wobble" for oscillation strength
6. Adjust "Speed" for animation rate
7. Enable "Auto" checkboxes for automatic parameter fading
8. Adjust "Auto Speed" for fade rate
9. Click "Animation" button to play/pause auto-fade
10. Toggle "Mouse Reactive" for cursor proximity response
11. Click "Random" for random parameter combinations

**Visual examples**:
- **High Displacement + High Wobble**: Strong, dramatic goo effect
- **Low Displacement + Low Wobble**: Subtle, gentle distortion
- **Auto Enabled**: Parameters smoothly fade between values
- **Mouse Reactive Enabled**: Goo reduces when cursor is near Errl center (more "normal" appearance)

**Auto-Fade Behavior**: When auto is enabled for a parameter, it smoothly transitions between random target values. The "Auto Speed" control determines how quickly these transitions occur.

**Mouse Reactive Behavior**: When enabled, moving the cursor close to Errl's center reduces goo effects, making Errl appear more "normal". Moving away increases goo effects.

---

#### 11. Errl Goo FX

**What it is**: SVG filter used internally by the WebGL layer for displacement mapping. Not directly controllable via UI.

**Where to find controls**: No UI controls (used internally by WebGL layer)

**Visual description**: Provides fractal noise-based displacement for WebGL mask effects.

**Note**: This filter is applied automatically when WebGL mode is active. See [WebGL Layer](#4-webgl-layer) for related controls.

---

#### 12. Pool Ripple

**What it is**: SVG filter that creates a water-like ripple effect on Errl's pool element (reflection area).

**Where to find controls**: No UI controls (applied automatically)

**Visual description**: Subtle turbulence-based displacement that creates a rippling water effect.

**Note**: This effect is always active and cannot be disabled. It's part of Errl's base visual design.

---

### Color & Hue Effects

#### 13. Hue Controller

**What it is**: Comprehensive color adjustment system that can modify hue, saturation, and intensity for multiple visual layers. Supports animated timeline-based color shifts.

**Where to find controls**: **Hue Tab** → "Hue" section

**Visual description**: Applies color transformations to selected target layers. Can shift colors across the spectrum, adjust saturation (color richness), and control effect intensity. Includes timeline animation for automatic color cycling.

**All Controls**:
- **Enabled** (`hueEnabled`): Checkbox, default false - Toggle hue effect for selected target
- **Target** (`hueTarget`): Select dropdown - Which layer to affect
  - Options: Navigation, Rising Bubbles, Particles, Background, GL Overlay
- **Hue** (`hueShift`): Range 0-360, default 0 - Angle shift across color wheel (degrees)
- **Saturation** (`hueSat`): Range 0-2, default 1.0 - Color richness multiplier
- **Intensity** (`hueInt`): Range 0-1, default 1.0 - Mix amount of hue effect
- **Timeline** (`hueTimeline`): Range 0-360, default 0 - Global hue timeline position (degrees)
- **Play/Pause** (`huePlayPause`): Button - Play/pause hue animation

**Parameter Ranges**:
- Hue: 0° (red) to 360° (back to red, full spectrum)
- Saturation: 0 (grayscale) to 2 (very saturated)
- Intensity: 0 (no effect) to 1 (full effect)
- Timeline: 0° to 360° (full animation cycle)

**Target Layers**:
- **Navigation**: Affects `.nav-orbit .bubble` elements
- **Rising Bubbles**: Affects `#riseBubbles` canvas
- **Particles**: Affects `#bgParticles` canvas
- **Background**: Affects `.errl-bg .base`, `.errl-bg .shimmer`, `.vignette-frame`
- **GL Overlay**: Affects WebGL overlay layer (requires WebGL enabled)

**How to manipulate**:
1. Open Errl Phone panel
2. Navigate to **Hue Tab**
3. Select target layer from "Target" dropdown
4. Toggle "Enabled" checkbox to activate hue for that target
5. Adjust "Hue" slider to shift colors (0° = red, 120° = green, 240° = blue, 360° = red)
6. Adjust "Saturation" for color richness (0 = grayscale, 1 = normal, 2 = very saturated)
7. Adjust "Intensity" for effect strength (0 = no change, 1 = full effect)
8. Use "Timeline" slider to manually scrub through animation
9. Click "Play/Pause" to animate hue automatically

**Visual examples**:
- **Hue 0° + High Saturation**: Red-tinted, vibrant colors
- **Hue 120°**: Green-tinted colors
- **Hue 240°**: Blue-tinted colors
- **Low Saturation**: Desaturated, muted colors
- **High Saturation**: Very vibrant, rich colors
- **Timeline Animation**: Colors cycle automatically through spectrum

**Master Timeline**: The timeline control uses a global 45-second cycle. When playing, colors automatically shift through the full spectrum.

**CSS vs WebGL**: 
- CSS targets (Navigation, Rising Bubbles, Particles, Background) use CSS filters
- WebGL targets (GL Overlay) use shader-based color adjustments

---

### Audio Effects

#### 14. Audio System

**What it is**: Lightweight audio engine that provides sound feedback for navigation bubble hover interactions. Includes master volume and bass EQ controls.

**Where to find controls**: **HUD Tab** → "Audio" section

**Visual description**: Plays short "ping" sounds when hovering over navigation bubbles. Audio uses Web Audio API for real-time processing.

**All Controls**:
- **Enabled** (`audioEnabled`): Checkbox, default true - Master audio enable/disable
- **Master** (`audioMaster`): Range 0-1, default 0.4 - Overall volume level
- **Low End** (`audioBass`): Range 0-1, default 0.2 - Bass EQ gain (lowshelf filter)

**Parameter Ranges**:
- Master: 0 (silent) to 1 (full volume)
- Low End: 0 (no bass boost) to 1 (maximum bass boost)

**How to manipulate**:
1. Open Errl Phone panel
2. Navigate to **HUD Tab**
3. Scroll to "Audio" section
4. Toggle "Enabled" to turn audio on/off
5. Adjust "Master" slider for overall volume
6. Adjust "Low End" slider for bass emphasis

**Visual examples**:
- **Enabled + High Master**: Loud hover sounds
- **Enabled + Low Master**: Quiet, subtle hover sounds
- **High Low End**: Bass-heavy, punchy sounds
- **Low Low End**: Treble-focused, crisp sounds

**Note**: Audio requires Web Audio API support. Falls back gracefully if unavailable. Hover sounds are triggered automatically when mouse enters navigation bubbles.

---

## Developer/Technical Guide

This section provides technical implementation details, code references, and programmatic access information for developers.

---

### Background Layer Effects

#### 1. Background Particles

**File Location**: `src/apps/landing/scripts/bg-particles.js`

**Initialization**: Auto-initializes on page load via IIFE (Immediately Invoked Function Expression)

**Architecture**:
- Canvas 2D rendering
- Star objects stored in array
- RequestAnimationFrame loop
- Automatic viewport-based star count calculation

**Key Code**:
```javascript
const canvas = document.getElementById('bgParticles');
const ctx = canvas.getContext('2d');
const DPR = Math.min(window.devicePixelRatio || 1, 2);
let stars = [];
let alpha = 0.16;
let speed = 0.12;
```

**Programmatic Access**: No exposed API. Stars are private to the IIFE scope.

**Settings Persistence**: Not persisted (hardcoded values)

**Code References**:
- `build()`: Creates star array based on viewport size
- `step()`: Animation loop, updates and renders stars
- `resize()`: Handles viewport resize, rebuilds stars

**Improvement Opportunities**:
- Expose API for alpha/speed control
- Add settings persistence
- Support different star patterns (constellations, clusters)
- Add color theme options

---

#### 2. Errl Background

**File Location**: `src/apps/landing/fx/errl-bg.ts`

**Initialization**: 
```typescript
ErrlBG.mount({
  headerVariant: 1, // or 2
  shimmer: true,
  parallax: true,
  hud: true,
  basePath: '../..'
});
```

**Architecture**:
- DOM-based layers (no canvas)
- Parallax via pointer event listeners
- Lerp-based smooth movement
- Fallback image loading for HUD elements

**Key Code**:
```typescript
ErrlBG.mount = function mount(opts: any = {}) {
  // Creates: .errl-bg > .base, .shimmer, .vignette
  // Optional: .errl-hud with header images
  // Parallax: pointermove → lerp → transform
}
```

**Programmatic Access**:
- `ErrlBG.mount(opts)`: Initialize background system
- No runtime API for parameter changes

**Settings Persistence**: Not persisted (initialization-time only)

**Code References**:
- `create()`: DOM element creation helper
- `lerp()`: Linear interpolation for smooth movement
- `onMove()`: Pointer event handler
- `tick()`: Animation loop for parallax

**Improvement Opportunities**:
- Expose runtime API for enabling/disabling layers
- Add settings persistence for user preferences
- Support dynamic header variant switching
- Add more parallax layers for depth

---

#### 3. Rising Bubbles

**File Location**: `src/apps/landing/scripts/rise-bubbles-three.js`

**Initialization**: Auto-initializes on page load, waits for Three.js to load

**Architecture**:
- Three.js WebGL renderer
- Custom shader materials (iridescent effect)
- Multiple bubble layers (behind/in front of nav bubbles)
- Control state object with update functions

**Key Code**:
```javascript
import('https://esm.run/three').then((THREE) => {
  // Scene, camera, renderer setup
  // Custom shader material with fresnel
  // Bubble creation and animation loop
});
```

**Programmatic Access**:
```javascript
// Control object exposed on window (if available)
window.RB = {
  setSpeed(value),
  setDensity(value),
  setAlpha(value),
  setWobble(value),
  setFreq(value),
  setMinSize(value),
  setMaxSize(value),
  setJumboPct(value),
  setJumboScale(value),
  setSizeHz(value),
  setAttract(enabled),
  setAttractIntensity(value),
  setRipples(enabled),
  setRippleIntensity(value)
};
```

**Settings Persistence**: Persisted via unified settings bundle (`errl_portal_settings_v1`)

**Code References**:
- `init()`: Three.js scene setup
- `resetBubble()`: Resets bubble to bottom with new parameters
- `updateBubbleSpeeds()`: Applies speed multiplier to all bubbles
- `updateBubbleAlpha()`: Updates material opacity
- `updateBubbleSizes()`: Updates size ranges for new bubbles
- `animate()`: Main animation loop

**Shader Details**:
- Vertex shader: Standard Three.js with normal/position varying
- Fragment shader: HSV-based rainbow colors, fresnel effect, specular highlights

**Improvement Opportunities**:
- Expose full API on window object
- Add bubble collision detection
- Support custom bubble shapes
- Add particle trails
- Performance optimization for high bubble counts

---

### WebGL Effects

#### 4. WebGL Layer

**File Location**: `src/apps/landing/scripts/webgl.js`

**Initialization**: 
```javascript
window.enableErrlGL(); // Explicit enable (not auto-start)
// Or via burst button
window.errlGLBurst(x, y);
```

**Architecture**:
- PixiJS Application
- Multiple containers (particles, fxRoot, orbs, overlay)
- Custom shader filters
- Resolution scaling (device-aware)
- Safari-specific optimizations

**Key Code**:
```javascript
app = new PIXI.Application({
  view: getCanvas(),
  backgroundAlpha: 0,
  antialias: true,
  resolution: effectiveRes, // Device-aware
  powerPreference: 'high-performance'
});
```

**Programmatic Access**:
```javascript
// Global functions
window.enableErrlGL(); // Initialize WebGL layer
window.errlGLBurst(x, y); // Spawn burst effect at coordinates
window.errlGLSetMood(name); // Set mood preset
window.errlGLShowOrbs(show); // Show/hide GL orbs
window.errlGLSetGoo(params); // Set goo parameters
window.errlGLSetOverlay(params); // Set overlay parameters
window.errlGLSyncOrbs(); // Sync GL orbs with DOM bubbles

// Debug access
window.__ErrlPIXIApp; // PixiJS Application instance
window.__ErrlWebGL; // { overlay, bubbles, fxRoot, moodFilter, overlayFilter }
```

**Settings Persistence**: Persisted via unified settings bundle

**Code References**:
- `init()`: PixiJS setup, texture loading, filter creation
- `getErrlTextureURL()`: Gets Errl SVG/image URL
- `serializeErrlSVGToURL()`: Converts SVG to data URL
- `buildOrbs()`: Creates GL orb sprites
- `gradientTexture()`: Generates overlay gradient
- `spawnBurstGL()`: Particle burst effect

**Shader Filters**:
- **Goo Filter**: Noise-based displacement with viscosity, drip, wiggle
- **Orb Filter**: Iridescent shader with conic hue, edge lighting, squish
- **Overlay Filter**: Gradient displacement with pointer-reactive ripples
- **Mood Filter**: Tint and vignette post-processing

**Resolution Management**:
- Auto-detects device pixel ratio
- Safari cap at 1.5 DPR
- Manual override via `localStorage.errl_debug_dpr`
- Debug override via `window.__ERRL_DEBUG.flags.dprCap`

**Improvement Opportunities**:
- Add more mood presets
- Support custom shader injection
- Add particle system presets
- Performance profiling tools
- Mobile optimization modes

---

#### 5. GL Background Bubbles

**File Location**: Part of `src/apps/landing/scripts/webgl.js`

**Initialization**: Created during WebGL layer init via `ErrlFX.Manager` or `ErrlFX.Bubbles`

**Architecture**:
- Multiple bubble layers (L0, L1, L2) for depth
- Procedural texture generation
- Particle container optimization
- Alpha-based layering

**Key Code**:
```javascript
fxm = new window.ErrlFX.Manager({ app, rootContainer: app.stage });
bubblesFXLayers = [];
// Creates 3 layers with different alpha values
```

**Programmatic Access**:
```javascript
// Via Hue Controller (color adjustments)
HueController.registerWebGLLayer('bgBubbles', bubblesFXLayers);

// Direct access (if available)
window.__ErrlWebGL.bubbles; // Array of bubble layer instances
```

**Settings Persistence**: Persisted via unified settings bundle (`bgSpeed`, `bgDensity`, `glAlpha`)

**Code References**:
- Initialized in `init()` function of webgl.js
- Uses `ErrlFX.Bubbles` class (external dependency)
- Multiple layers for visual depth

**Improvement Opportunities**:
- Expose individual layer controls
- Add layer-specific parameters
- Support custom bubble textures
- Add physics-based interactions

---

#### 6. GL Overlay

**File Location**: Part of `src/apps/landing/scripts/webgl.js`

**Initialization**: Created during WebGL layer init

**Architecture**:
- Gradient texture sprite
- Custom displacement filter
- Pointer-reactive ripple effects
- Screen blend mode

**Key Code**:
```javascript
overlay = new PIXI.Sprite(gradTex);
overlay.alpha = 0.20;
overlay.blendMode = PIXI.BLEND_MODES.SCREEN;
overlayFilter = new PIXI.Filter(vert, frag, {
  uDX: 24, uDY: 18, uTime: 0,
  uPointer: new PIXI.Point(0.5, 0.5),
  uAmp: 0.0
});
```

**Programmatic Access**:
```javascript
window.errlGLSetOverlay({
  alpha: 0.2, // 0-1
  dx: 24, // Displacement X
  dy: 18, // Displacement Y
});

// Via Hue Controller
HueController.registerWebGLLayer('glOverlay', overlay);
```

**Settings Persistence**: Alpha/displacement not persisted (hardcoded). Color via Hue Controller.

**Code References**:
- `gradientTexture()`: Generates radial gradient texture
- Overlay filter: Sin/cos displacement + pointer ripples
- Pointer event handlers update `uPointer` and `uAmp`

**Improvement Opportunities**:
- Add UI controls for alpha/displacement
- Support custom gradient patterns
- Add more ripple effects
- Expose overlay blend mode control

---

### Navigation Effects

#### 7. Navigation Orbit/Bubbles

**File Location**: `src/apps/landing/scripts/portal-app.js`

**Initialization**: 
```javascript
function initializeBubbles() {
  bubbles = Array.from(document.querySelectorAll('.nav-orbit .bubble'));
  // Attach event listeners, start update loop
}
```

**Architecture**:
- DOM-based bubble elements
- RequestAnimationFrame update loop
- Orbital math (angle, distance, alternating direction)
- Z-index layering (behind/in front of Errl)
- Keyboard navigation support

**Key Code**:
```javascript
function updateBubbles(ts) {
  const rect = errl.getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;
  // Calculate orbital positions
  // Apply z-index based on position
}
```

**Programmatic Access**:
```javascript
window.errlNavControls = {
  getState: () => ({
    speed: navOrbitSpeed,
    radius: navRadius,
    orbScale: navOrbScale,
    gamesVisible
  }),
  setSpeed(value, opts),
  setRadius(value, opts),
  setOrbScale(value, opts),
  setGamesVisible(value, opts),
  toggleGames()
};
```

**Settings Persistence**: Persisted via unified settings bundle

**Code References**:
- `initializeBubbles()`: DOM query and listener setup
- `updateBubbles()`: Main animation loop
- `setNavOrbitSpeed()`: Speed setter with clamping
- `setNavRadius()`: Radius setter
- `setNavOrbScale()`: Scale setter
- `activateKeyboardNav()`: Keyboard navigation activation
- `focusKeyboardBubble()`: Focus management

**Z-Index Layering**:
- Bubbles below Errl center: `z-index: 0` (behind)
- Bubbles above Errl center: `z-index: 2` (in front)
- Errl wrapper: `z-index: 1` (middle layer)

**Improvement Opportunities**:
- Add bubble-specific parameters
- Support custom orbital paths
- Add bubble grouping/clustering
- Performance optimization for many bubbles

---

#### 8. Navigation Goo

**File Location**: `src/apps/landing/scripts/portal-app.js` (Nav Goo+ section)

**Initialization**: Wired on page load, requires WebGL to be enabled

**Architecture**:
- SVG filter for basic goo (`uiGoo`)
- WebGL goo for advanced effects (via `errlGLSetGoo`)
- Parameter conversion (UI ranges → shader uniforms)

**Key Code**:
```javascript
function navGooPlus() {
  // Reads UI controls
  // Converts parameters
  // Calls window.errlGLSetGoo(params)
}
```

**Programmatic Access**:
```javascript
window.errlGLSetGoo({
  intensity: 0.7, // 0-1, displacement amplitude
  speed: 0.8, // 0-1, animation speed
  viscosity: 0.9, // 0-1, smoothing factor
  drip: 0.25, // 0-1, downward bias (converted from -1..1)
  wiggle: 0.4 // 0-1, extra sin wobble
});
```

**Settings Persistence**: Persisted via unified settings bundle

**Code References**:
- `navGoo()`: SVG filter controls (blur, matrix, enabled)
- `navGooPlus()`: WebGL goo controls (wiggle, flow, grip, drip, viscosity)
- SVG filter nodes: `navGooBlurNode`, `navGooMatrixNode`

**Improvement Opportunities**:
- Add more goo presets
- Support per-bubble goo parameters
- Add goo animation presets
- Visual goo preview

---

### Errl Effects

#### 9. Errl Size/Scale

**File Location**: `src/apps/landing/scripts/portal-app.js`

**Initialization**: Wired on page load

**Architecture**:
- CSS `zoom` property (Chrome/Safari/Edge)
- Fallback to `transform: scale()` (Firefox)
- Syncs with WebGL orb positions

**Key Code**:
```javascript
on($("errlSize"), 'input', ()=>{
  const wrap = $("errl");
  const v = parseFloat($("errlSize").value || '1');
  if (CSS.supports('zoom', '1')) {
    wrap.style.zoom = v.toString();
  } else {
    wrap.style.setProperty('--errlScale', v.toString());
  }
  window.errlGLSyncOrbs && window.errlGLSyncOrbs();
});
```

**Programmatic Access**:
```javascript
// Direct DOM manipulation
const errlWrapper = document.getElementById('errl');
errlWrapper.style.zoom = '1.2'; // 120% scale
// Or for Firefox:
errlWrapper.style.setProperty('--errlScale', '1.2');
```

**Settings Persistence**: Persisted via unified settings bundle

**Code References**:
- Size input handler in portal-app.js
- CSS: `.errl-wrapper` uses `--errlScale` CSS variable

**Improvement Opportunities**:
- Add animation transitions
- Support independent X/Y scaling
- Add scale presets

---

#### 10. Classic Goo

**File Location**: `src/apps/landing/scripts/portal-app.js` (classicGooControls function)

**Initialization**: Wired on page load

**Architecture**:
- SVG filter (`classicGoo`) with multiple nodes
- Fractal noise turbulence
- Gaussian blur for viscosity
- Displacement mapping
- Auto-fade animation system
- Mouse reactive normalization

**Key Code**:
```javascript
const nodes = {
  noise: document.getElementById('classicGooNoise'),
  blur: document.getElementById('classicGooVisc'),
  disp: document.getElementById('classicGooDisp'),
  drip: document.getElementById('classicGooDrip')
};
```

**Programmatic Access**:
```javascript
// Direct SVG node manipulation
const noiseNode = document.getElementById('classicGooNoise');
noiseNode.setAttribute('baseFrequency', '0.005 0.008');

const dispNode = document.getElementById('classicGooDisp');
dispNode.setAttribute('scale', '10');

// Toggle goo class
const errlImg = document.getElementById('errlCenter');
errlImg.classList.toggle('goo', true);
```

**Settings Persistence**: Persisted via unified settings bundle (`goo` section)

**Code References**:
- `classicGooControls()`: Main control function
- `apply()`: Updates SVG filter nodes
- `advanceSlider()`: Auto-fade animation logic
- `pointerMoveHandler()`: Mouse reactive normalization
- SVG filter: `#classicGoo` in index.html

**Auto-Fade System**:
- Random target generation
- Smooth interpolation
- Direction-based movement
- Overshoot detection

**Mouse Reactive System**:
- Calculates distance from Errl center
- Normalization factor (0 = far, 1 = center)
- Reduces goo effects when close
- Decay animation on pointer leave

**Improvement Opportunities**:
- Add more noise patterns
- Support custom noise seeds
- Add goo presets library
- Performance optimization for filter updates

---

#### 11. Errl Goo FX

**File Location**: SVG filter in `src/index.html`

**Initialization**: Applied automatically when WebGL layer uses Errl texture

**Architecture**:
- SVG filter (`errlGooFX`)
- Fractal noise turbulence
- Displacement mapping

**Key Code**:
```xml
<filter id="errlGooFX">
  <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="2" result="noise"/>
  <feDisplacementMap in="SourceGraphic" in2="noise" scale="26" xChannelSelector="R" yChannelSelector="G" />
</filter>
```

**Programmatic Access**: Applied via WebGL layer, not directly controllable

**Settings Persistence**: Not persisted (hardcoded filter values)

**Code References**: Filter definition in index.html

**Improvement Opportunities**:
- Make parameters controllable
- Add UI controls
- Support multiple filter variants

---

#### 12. Pool Ripple

**File Location**: SVG filter in `src/index.html`

**Initialization**: Applied automatically to `.errl-pool` element

**Architecture**:
- SVG filter (`poolRipple`)
- Turbulence-based displacement
- Always active

**Key Code**:
```xml
<filter id="poolRipple">
  <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="1" seed="5" result="wave"/>
  <feDisplacementMap in="SourceGraphic" in2="wave" scale="14"/>
</filter>
```

**Programmatic Access**: Applied via CSS, not directly controllable

**Settings Persistence**: Not persisted (hardcoded filter values)

**Code References**: Filter definition in index.html, applied to `#errlPool`

**Improvement Opportunities**:
- Add intensity control
- Support animated ripples
- Add interaction-based ripples

---

### Color & Hue Effects

#### 13. Hue Controller

**File Location**: `src/apps/landing/fx/hue-controller.ts`

**Initialization**: 
```typescript
HueController.init();
// Auto-initializes on DOMContentLoaded or immediately if DOM ready
```

**Architecture**:
- Layer registry system
- CSS filter application (for DOM targets)
- WebGL shader integration (for GL targets)
- Master timeline animation
- Per-layer state management

**Key Code**:
```typescript
const LAYERS: Record<string, { label: string; selectors?: string[]; type?: string }> = {
  background: { label: 'Background', selectors: ['.errl-bg .base', '.errl-bg .shimmer', '.vignette-frame'] },
  riseBubbles: { label: 'Rising Bubbles', selectors: ['#riseBubbles'] },
  nav: { label: 'Navigation', selectors: ['.nav-orbit .bubble'] },
  glOverlay: { label: 'GL Overlay', type: 'webglOverlay' },
  bgBubbles: { label: 'GL Background Bubbles', type: 'webglBubbles' },
};
```

**Programmatic Access**:
```typescript
// Set target layer
HueController.setTarget('nav');

// Apply hue to current target
HueController.applyLayer('nav', {
  hue: 120, // 0-360
  saturation: 1.5, // 0-2
  intensity: 1.0, // 0-1
  enabled: true
});

// Register WebGL layer
HueController.registerWebGLLayer('bgBubbles', bubblesRef);

// Timeline control
HueController.playTimeline();
HueController.pauseTimeline();
HueController.setTimelinePosition(180); // 0-360
```

**Settings Persistence**: Persisted via unified settings bundle (`hue.layers` object)

**Code References**:
- `init()`: Initialization and settings load
- `applyLayer()`: Applies hue to specific layer
- `applyAllCSS()`: Applies CSS filters to DOM targets
- `applyWebGLLayer()`: Applies shader adjustments to WebGL targets
- `tickMaster()`: Master timeline animation loop
- `ensureClasses()`: Adds `hue-controlled` class to targets

**Master Timeline**:
- 45-second cycle period
- Global hue rotation
- Play/pause control
- Manual scrubbing support

**CSS Filter Generation**:
```css
.hue-controlled {
  filter: hue-rotate(120deg) saturate(1.5);
  /* Applied via inline styles */
}
```

**WebGL Integration**:
- Shader-based color matrix
- Uniform updates
- Per-layer registration

**Improvement Opportunities**:
- Add more layer targets
- Support custom color curves
- Add color presets
- Support keyframe animation
- Add color harmony tools

---

### Audio Effects

#### 14. Audio System

**File Location**: `src/apps/landing/scripts/portal-app.js` (audioEngine IIFE)

**Initialization**: Auto-initializes on page load

**Architecture**:
- Web Audio API
- AudioContext management
- Oscillator-based sound generation
- Lowshelf EQ for bass control
- Gain nodes for volume control

**Key Code**:
```javascript
const audioEngine = (function(){
  const Ctor = window.AudioContext || window.webkitAudioContext;
  let ctx = null;
  let enabled = true;
  let master = 0.4;
  let bass = 0.2;
  
  function playHover(index) {
    // Generate ping sound
  }
  
  return {
    setEnabled,
    setMaster,
    setBass,
    playHover
  };
})();
```

**Programmatic Access**:
```javascript
// If audioEngine is exposed (currently private)
audioEngine.setEnabled(true);
audioEngine.setMaster(0.5);
audioEngine.setBass(0.3);
audioEngine.playHover(0); // Play sound for bubble index 0
```

**Settings Persistence**: Persisted via unified settings bundle

**Code References**:
- `audioEngine` IIFE in portal-app.js
- `playHover()`: Generates and plays ping sound
- Audio control wiring in portal-app.js

**Sound Generation**:
- Oscillator with frequency sweep
- Short attack, quick decay
- Index-based frequency variation

**Improvement Opportunities**:
- Expose audioEngine on window
- Add more sound effects
- Support custom sound files
- Add audio presets
- Spatial audio support

---

## Settings & Persistence

### Unified Settings Bundle

All effect settings are stored in a single JSON object in localStorage:

**Key**: `errl_portal_settings_v1`

**Structure**:
```json
{
  "version": 1,
  "ui": {
    "rbSpeed": "1.0",
    "rbDensity": "1.0",
    "navOrbitSpeed": "1.0",
    "errlSize": "1.0",
    // ... all UI control values
  },
  "hue": {
    "layers": {
      "nav": { "hue": 0, "saturation": 1.0, "intensity": 1.0, "enabled": false },
      "riseBubbles": { ... },
      // ... per-layer hue settings
    }
  },
  "goo": {
    "auto": {
      "rate": 0.05,
      "strength": false,
      "wobble": false,
      "speed": true
    },
    "mouseReactive": true
  }
}
```

### Default Values

**Location**: `public/apps/landing/config/errl-defaults.json`

Default values are loaded from this file on first visit or when resetting to defaults.

### Export/Import

**Export**: 
- Click "Export Settings" button (if available)
- Copies JSON to clipboard or downloads file

**Import**:
- Click "Import Settings" button (if available)
- Paste JSON or upload file
- Validates and applies settings

### Legacy Key Migration

On first load, the system migrates legacy localStorage keys into the unified bundle:

- `errl_hue_layers` → `hue.layers`
- `errl_gl_overlay` → (integrated)
- `errl_gl_bubbles` → (integrated)
- `errl_nav_goo_cfg` → (integrated)
- `errl_rb_settings` → (integrated)
- `errl_goo_cfg` → `goo`
- `errl_ui_defaults` → `ui`

After migration, legacy keys are removed.

### Save Defaults / Reset Defaults

**Save Defaults**: Saves current UI state as new defaults (updates defaults file or localStorage)

**Reset Defaults**: Restores all controls to factory defaults

---

## Improvement & Enhancement

This section documents known limitations, enhancement ideas, and future features for each effect.

### Background Particles

**Known Limitations**:
- No user controls (hardcoded parameters)
- Fixed star count algorithm
- No color theme options

**Enhancement Ideas**:
- Add UI controls for alpha and speed
- Support different star patterns (constellations, clusters, galaxies)
- Add color theme presets
- Support animated star trails
- Add shooting stars effect

**Performance Considerations**:
- Current implementation is lightweight
- Could support more stars with instanced rendering
- Consider WebGL for very high star counts

**Future Features**:
- User-customizable star density
- Color theme selector
- Animation speed control
- Star size variation control

---

### Errl Background

**Known Limitations**:
- No UI controls (BG tab empty)
- Parallax intensity is hardcoded
- Limited to 2 header variants

**Enhancement Ideas**:
- Add parallax intensity control
- Support more header variants
- Add background image upload
- Support video backgrounds
- Add background animation presets

**Performance Considerations**:
- DOM-based (not GPU-accelerated)
- Parallax uses requestAnimationFrame (efficient)
- Consider CSS transforms for better performance

**Future Features**:
- Parallax intensity slider
- Background image selector
- Shimmer intensity control
- Vignette strength control

---

### Rising Bubbles

**Known Limitations**:
- Three.js dependency (large bundle size)
- Limited to spherical bubbles
- No collision detection between bubbles

**Enhancement Ideas**:
- Add bubble shape options (ellipsoid, custom)
- Implement bubble collision physics
- Add bubble trails/particles
- Support custom bubble textures
- Add bubble grouping/clustering
- Support bubble interactions (merge, split)

**Performance Considerations**:
- Shader complexity affects performance
- Bubble count scales with density
- Consider LOD (level of detail) for distant bubbles
- Instanced rendering for better performance

**Future Features**:
- Bubble shape selector
- Physics simulation toggle
- Custom texture upload
- Bubble interaction modes
- Performance mode (reduced quality)

---

### WebGL Layer

**Known Limitations**:
- Requires explicit enable (not auto-start)
- Safari performance limitations
- Resolution scaling can be confusing

**Enhancement Ideas**:
- Auto-enable option
- Better Safari optimization
- Resolution control UI
- Performance profiling tools
- Custom shader injection system
- More mood presets

**Performance Considerations**:
- Resolution scaling is critical for performance
- Multiple particle layers impact performance
- Filter complexity affects frame rate
- Consider quality presets (low/medium/high)

**Future Features**:
- Auto-enable toggle
- Quality preset selector
- Performance monitor
- Custom shader editor
- Mood preset library

---

### GL Background Bubbles

**Known Limitations**:
- Limited to 3 layers
- No individual layer controls
- Procedural textures only

**Enhancement Ideas**:
- Expose individual layer controls
- Support custom bubble textures
- Add more layers
- Layer-specific parameters
- Physics-based interactions

**Performance Considerations**:
- Multiple layers impact performance
- Particle count scales with density
- Consider layer culling for off-screen particles

**Future Features**:
- Per-layer controls
- Custom texture support
- Layer count selector
- Physics simulation

---

### GL Overlay

**Known Limitations**:
- No UI controls for alpha/displacement
- Fixed gradient pattern
- Limited ripple effects

**Enhancement Ideas**:
- Add alpha/displacement controls
- Support custom gradient patterns
- More ripple effect types
- Overlay blend mode selector
- Animated gradient patterns

**Performance Considerations**:
- Overlay filter adds rendering cost
- Pointer-reactive ripples are efficient
- Consider disabling on low-end devices

**Future Features**:
- Overlay intensity control
- Gradient pattern selector
- Ripple effect library
- Blend mode selector

---

### Navigation Orbit/Bubbles

**Known Limitations**:
- Fixed orbital paths (circular only)
- Limited to 8 bubbles (7 visible + 1 hidden)
- Z-index layering is position-based only

**Enhancement Ideas**:
- Support custom orbital paths (elliptical, figure-8, etc.)
- Dynamic bubble count
- Per-bubble parameters
- Bubble grouping/clustering
- Custom bubble styles
- Bubble animation presets

**Performance Considerations**:
- DOM-based (not GPU-accelerated for positioning)
- Many bubbles could impact performance
- Consider virtual scrolling for many bubbles

**Future Features**:
- Custom orbital path editor
- Dynamic bubble management
- Per-bubble customization
- Bubble animation library

---

### Navigation Goo

**Known Limitations**:
- Requires WebGL to be enabled
- Limited to group-level effects
- No per-bubble goo parameters

**Enhancement Ideas**:
- Per-bubble goo parameters
- More goo presets
- Goo animation presets
- Visual goo preview
- Goo interaction modes

**Performance Considerations**:
- Goo filter adds rendering cost
- Complex goo can impact performance
- Consider quality levels

**Future Features**:
- Goo preset library
- Per-bubble goo controls
- Goo animation editor
- Performance quality selector

---

### Errl Size/Scale

**Known Limitations**:
- Uniform scaling only (no X/Y independent)
- No animation transitions
- Limited scale range

**Enhancement Ideas**:
- Independent X/Y scaling
- Smooth scale transitions
- Scale presets
- Scale animation
- Responsive scale modes

**Performance Considerations**:
- CSS zoom is efficient
- Transform scale is also efficient
- No performance concerns

**Future Features**:
- Independent axis scaling
- Scale animation presets
- Responsive scale modes

---

### Classic Goo

**Known Limitations**:
- SVG filter performance on some devices
- Limited noise patterns
- Auto-fade can be unpredictable

**Enhancement Ideas**:
- More noise pattern options
- Custom noise seeds
- Goo preset library
- Better auto-fade controls
- Goo animation timeline
- Performance optimization

**Performance Considerations**:
- SVG filters can be expensive
- Complex filters impact rendering
- Consider WebGL alternative for better performance

**Future Features**:
- Noise pattern selector
- Goo preset library
- Animation timeline editor
- Performance mode toggle

---

### Hue Controller

**Known Limitations**:
- Limited to 5 target layers
- CSS filters have browser compatibility issues
- No color curve editing

**Enhancement Ideas**:
- Add more target layers
- Color curve editor
- Color harmony tools
- Keyframe animation
- Color preset library
- Better browser compatibility

**Performance Considerations**:
- CSS filters can impact performance
- WebGL shaders are more efficient
- Consider filter optimization

**Future Features**:
- Extended layer support
- Color curve editor
- Harmony tools
- Keyframe animation
- Preset library

---

### Audio System

**Known Limitations**:
- Limited to hover sounds
- No sound file support
- Basic EQ only

**Enhancement Ideas**:
- More sound effects
- Custom sound file support
- Advanced EQ (multi-band)
- Spatial audio
- Sound preset library
- Audio visualization

**Performance Considerations**:
- Web Audio API is efficient
- Sound generation is lightweight
- No performance concerns

**Future Features**:
- Extended sound library
- Custom sound upload
- Advanced audio controls
- Spatial audio support

---

## Code Reference Index

### Functions & Objects

| Name | Effect | File | Purpose |
|------|--------|------|---------|
| `ErrlBG.mount()` | Errl Background | `errl-bg.ts` | Initialize background system |
| `HueController.init()` | Hue Controller | `hue-controller.ts` | Initialize hue system |
| `HueController.applyLayer()` | Hue Controller | `hue-controller.ts` | Apply hue to layer |
| `window.enableErrlGL()` | WebGL Layer | `webgl.js` | Enable WebGL layer |
| `window.errlGLBurst()` | WebGL Layer | `webgl.js` | Spawn burst effect |
| `window.errlGLSetGoo()` | Navigation Goo | `webgl.js` | Set goo parameters |
| `window.errlGLSetOverlay()` | GL Overlay | `webgl.js` | Set overlay parameters |
| `window.errlNavControls` | Navigation Orbit | `portal-app.js` | Navigation controls API |
| `window.RB` | Rising Bubbles | `rise-bubbles-three.js` | Rising bubbles API |
| `audioEngine` | Audio System | `portal-app.js` | Audio engine (private) |

### Settings Keys

| Key | Effect | Storage | Purpose |
|-----|--------|---------|---------|
| `errl_portal_settings_v1` | All Effects | localStorage | Unified settings bundle |
| `errl_hue_layers` | Hue Controller | localStorage (legacy) | Legacy hue settings |
| `errl_debug_dpr` | WebGL Layer | localStorage | Resolution override |

### DOM Elements

| ID | Effect | Purpose |
|----|--------|---------|
| `#bgParticles` | Background Particles | Canvas element |
| `#riseBubbles` | Rising Bubbles | Canvas element |
| `#errlWebGL` | WebGL Layer | Canvas element |
| `#errl` | Errl Wrapper | Errl container |
| `#errlCenter` | Errl Image | Errl SVG/image |
| `#navOrbit` | Navigation Orbit | Bubble container |
| `#errlPanel` | Phone Panel | Control panel |
| `#errlGoo` | Classic Goo | Goo aura element |
| `#errlPool` | Pool Ripple | Pool element |

### SVG Filters

| ID | Effect | Purpose |
|----|--------|---------|
| `#uiGoo` | Navigation Goo | Basic goo filter |
| `#classicGoo` | Classic Goo | Errl goo filter |
| `#errlGooFX` | Errl Goo FX | WebGL displacement |
| `#poolRipple` | Pool Ripple | Water ripple effect |

### CSS Classes

| Class | Effect | Purpose |
|-------|--------|---------|
| `.errl-wrapper` | Errl Size | Errl container |
| `.nav-orbit` | Navigation Orbit | Bubble container |
| `.bubble` | Navigation Orbit | Individual bubble |
| `.bubble--behind` | Navigation Orbit | Behind Errl z-index |
| `.hue-controlled` | Hue Controller | Hue target marker |
| `.goo` | Classic Goo | Goo enabled marker |
| `.scene-layer` | Scene Container | Main scene wrapper |

---

## Conclusion

This master reference document provides comprehensive coverage of all effects in the Errl Portal. Use it as a reference for:

- **Users**: Understanding controls and parameters
- **Developers**: Implementation details and programmatic access
- **Designers**: Enhancement opportunities and future features

For questions or contributions, refer to the main project documentation or source code.

---

**Last Updated**: 2026-01-15  
**Document Version**: 1.0  
**Project**: errl-portal
