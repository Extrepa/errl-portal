# Errl Portal Effects Testing Checklist

## Responsive Panel Sizing
- [ ] **Mobile (< 768px)**: Panel displays at 1x scale (180px x 280px) - perfect size
- [ ] **Tablet (≥ 768px)**: Panel scales to 1.5x, positioned correctly
- [ ] **Desktop (≥ 1024px)**: Panel scales to 1.75x, positioned correctly
- [ ] **Large Desktop (≥ 1440px)**: Panel scales to 2x, positioned correctly
- [ ] **Minimized state**: Panel never scales when minimized (stays at 40px bubble)
- [ ] **Panel elements**: All fonts, padding, borders, buttons, tabs scale proportionally

## Background Effects (BG Tab)
- [ ] **Speed slider** (`bgSpeed`): Changes particle speed, persists to localStorage
- [ ] **Density slider** (`bgDensity`): Changes particle count, persists to localStorage
- [ ] **Alpha slider** (`glAlpha`): Changes particle opacity, persists to localStorage
- [ ] **Random button**: Randomizes all three values

## Rising Bubbles (RB Tab)
### Basic Controls
- [ ] **Speed** (`rbSpeed`): Controls bubble rise speed
- [ ] **Density** (`rbDensity`): Controls number of bubbles
- [ ] **Alpha** (`rbAlpha`): Controls bubble opacity
- [ ] **Wobble** (`rbWobble`): Side-to-side wiggle as bubbles rise
- [ ] **Frequency** (`rbFreq`): Speed of wobble oscillation
- [ ] **Min Size** (`rbMin`): Smallest bubble size in pixels
- [ ] **Max Size** (`rbMax`): Largest bubble size in pixels
- [ ] **Size Hertz** (`rbSizeHz`): Speed of bubble size pulsing (0 = disabled)
- [ ] **Jumbo Percent** (`rbJumboPct`): Probability of jumbo bubbles (0-60%)
- [ ] **Jumbo Scale** (`rbJumboScale`): Size multiplier for jumbo bubbles

### Advanced Controls
- [ ] **Attract** (`rbAttract`): Checkbox toggles pointer attraction/repulsion
- [ ] **Attract Intensity** (`rbAttractIntensity`): Strength of attraction effect
- [ ] **Ripples** (`rbRipples`): Checkbox toggles water-like ripples on click
- [ ] **Ripple Intensity** (`rbRippleIntensity`): Strength of ripple effect

### Animation Controls
- [ ] **Loop mode** (`rbAdvModeLoop`): Button sets loop animation mode
- [ ] **Ping-Pong mode** (`rbAdvModePing`): Button sets ping-pong animation mode
- [ ] **Animation Speed** (`rbAdvAnimSpeed`): Controls animation speed (0.02-1.0)
- [ ] **Play/Pause** (`rbAdvPlayPause`): Starts/stops animation, updates button text

### Persistence
- [ ] All RB settings persist to localStorage (`errl_rb_settings`)
- [ ] Settings restore on page reload

## Navigation Bubbles (Nav Tab)
### Orbit Controls
- [ ] **Orbit Speed** (`navOrbitSpeed`): Controls rotation speed of bubbles
- [ ] **Radius** (`navRadius`): Controls distance from center (0.6-1.6)
- [ ] **Orb Size** (`navOrbSize`): Controls bubble scale (0.6-1.6)

### SVG Goo Controls
- [ ] **Goo Enabled** (`navGooEnabled`): Checkbox toggles SVG goo filter
- [ ] **Blur** (`navGooBlur`): Controls blur amount (stdDeviation)
- [ ] **Multiplier** (`navGooMult`): Controls color matrix multiplier
- [ ] **Threshold** (`navGooThresh`): Controls color matrix threshold
- [ ] Settings persist to localStorage (`errl_nav_goo_cfg`)

### WebGL Goo+ Controls
- [ ] **Wiggle** (`navWiggle`): Elastic movement blend (0-1)
- [ ] **Flow Speed** (`navFlow`): Motion scaling speed (0-2)
- [ ] **Grip** (`navGrip`): Stickiness/resistance (0-1)
- [ ] **Drip** (`navDrip`): Downward bias (-1 to 1)
- [ ] **Viscosity** (`navVisc`): Blob merge strength (0-1)
- [ ] **Slow Gradient button** (`navSlowGradient`): Applies gentle gradient animation
- [ ] **Gradient Play/Pause** (`navGradientPlayPause`): Controls gradient animation

### GL Orbs
- [ ] **GL Orbs Toggle** (`glOrbsToggle`): Checkbox shows/hides WebGL orb layer

### Keyboard Navigation
- [ ] **Cmd+K**: Activates keyboard navigation mode
- [ ] **Arrow keys**: Navigate between bubbles
- [ ] **Enter/Space**: Activates focused bubble
- [ ] **Escape**: Exits keyboard navigation
- [ ] **Shift+B**: Toggles hidden Games bubble

### Bubble Interactions
- [ ] **Hover**: Plays audio ping, applies glow effect, triggers WebGL orb hover
- [ ] **Click**: Navigates to target page
- [ ] Bubbles orbit correctly around Errl center
- [ ] Bubbles alternate orbit direction (every other bubble)

## Errl Effects (Errl Tab)
- [ ] **Size slider** (`errlSize`): Scales Errl via CSS custom property `--errlScale`
- [ ] **Goo Enabled** (`classicGooEnabled`): Checkbox toggles classic SVG goo filter
- [ ] **Strength** (`classicGooStrength`): Controls displacement scale (0-2)
- [ ] **Wobble** (`classicGooWobble`): Controls blur amount (0-2)
- [ ] **Speed** (`classicGooSpeed`): Controls noise speed (0-2)
- [ ] **Strength Auto** (`classicGooStrengthAuto`): Auto-animates strength
- [ ] **Wobble Auto** (`classicGooWobbleAuto`): Auto-animates wobble
- [ ] **Speed Auto** (`classicGooSpeedAuto`): Auto-animates speed
- [ ] **Auto Speed** (`classicGooAutoSpeed`): Controls auto-animation rate (0.01-0.5)
- [ ] **Auto Play/Pause** (`classicGooAutoPlayPause`): Starts/stops auto-animation
- [ ] **Mouse Reactive** (`classicGooMouseReact`): Checkbox enables mouse proximity boost
- [ ] **Random button**: Randomizes strength, wobble, speed
- [ ] Settings persist to localStorage (`errl_goo_cfg`)

## Hue Effects (Hue Tab)
- [ ] **Enabled** (`hueEnabled`): Checkbox toggles hue filter for target layer
- [ ] **Target** (`hueTarget`): Dropdown selects target layer (all, bgBubbles, glOverlay, etc.)
- [ ] **Hue Shift** (`hueShift`): Rotates hue (0-360 degrees)
- [ ] **Saturation** (`hueSat`): Adjusts saturation (0-2)
- [ ] **Intensity** (`hueInt`): Adjusts effect intensity (0-1)
- [ ] **Timeline** (`hueTimeline`): Global hue timeline position (0-360)
- [ ] **Play/Pause** (`huePlayPause`): Starts/stops timeline animation
- [ ] All changes call `applyLayerCSS()` to update visuals immediately
- [ ] Timeline changes call `applyAllCSS()` for global updates
- [ ] Settings persist to localStorage (`errl_hue_layers`)

## HUD Effects (HUD Tab)
- [ ] **Burst button** (`burstBtn`): Triggers particle burst at viewport center
- [ ] **Audio Enabled** (`audioEnabled`): Checkbox toggles audio engine
- [ ] **Master** (`audioMaster`): Controls overall volume (0-1)
- [ ] **Bass** (`audioBass`): Controls low-end EQ gain (0-1)
- [ ] Audio plays on bubble hover with correct frequency based on bubble index
- [ ] Audio respects motion multiplier for reduced motion mode

### Accessibility
- [ ] **Reduce Motion** (`prefReduce`): Checkbox enables reduced motion mode
- [ ] **High Contrast** (`prefContrast`): Checkbox enables high contrast mode
- [ ] **Invert Colors** (`prefInvert`): Checkbox inverts colors
- [ ] Settings persist to localStorage (`errl_a11y`)

## Developer Tools (Dev Tab)
- [ ] **PNG Snapshot** (`snapshotPngBtn`): Captures screenshot, downloads PNG
- [ ] **HTML Snapshot** (`exportHtmlBtn`): Exports settings as HTML file
- [ ] **Save Defaults** (`saveDefaultsBtn`): Saves current settings as defaults
- [ ] **Reset Defaults** (`resetDefaultsBtn`): Resets all settings to stock values
- [ ] **Shift+S**: Keyboard shortcut saves defaults
- [ ] Reset stops all animations (RB, Nav Gradient, Errl Goo, Hue Timeline)

## Phone Panel UI
- [ ] **Tabs**: Clicking tabs switches between sections (HUD, Errl, Nav, RB, GLB, BG, Dev, Hue)
- [ ] **Minimize button**: Minimizes panel to bubble icon
- [ ] **Close button**: Toggles minimize/restore
- [ ] **Clicking minimized bubble**: Restores panel
- [ ] **Drag header**: Moves panel around screen
- [ ] **Scroll to top**: Button appears when scrolled down, scrolls to top on click
- [ ] **Default tab**: Panel opens to HUD tab and shows content immediately
- [ ] Panel state persists to localStorage (`errl_phone_min`)

## Visual Verification
- [ ] All sliders have rainbow gradient track
- [ ] All buttons have hover effects
- [ ] Active tabs are highlighted with cyan border
- [ ] Animating buttons show rainbow outline animation
- [ ] Play/Pause buttons update text and aria-pressed state
- [ ] Checkboxes have proper accent color
- [ ] Number inputs have proper styling
- [ ] Scrollbar has rainbow gradient (WebKit browsers)

## Performance
- [ ] No console errors or warnings
- [ ] Smooth animations at 60fps
- [ ] No memory leaks (check over extended use)
- [ ] WebGL initializes only when needed
- [ ] Reduced motion mode slows animations appropriately

## Cross-Browser Testing
- [ ] **Chrome/Edge**: All features work correctly
- [ ] **Firefox**: All features work correctly
- [ ] **Safari**: All features work correctly
- [ ] **Mobile Safari**: Touch interactions work, panel scales correctly
- [ ] **Mobile Chrome**: Touch interactions work, panel scales correctly

## Notes
- Test on actual devices when possible
- Verify localStorage persistence across page reloads
- Check that all animations can be stopped via Reset Defaults
- Ensure WebGL effects don't break if WebGL is unavailable
- Verify audio works only when enabled and AudioContext is available
