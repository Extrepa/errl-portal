# Errl Phone (Control Panel) Overview

This document summarizes the tabs and controls in the Errl Phone panel.

## Tabs

- HUD
  - Particles: Burst snapshot of BG particles.
  - Audio: Enabled (master), Master volume, Low End (lowshelf EQ). Tooltip on each.
  - Accessibility: Reduced Motion, High Contrast.
- Errl
  - Errl Goo (wobble): Enabled, Displacement, Wobble, Speed. Animate/random controls with speed.
  - Errl Size: Sizes the main image.
- Nav
  - Nav Bubbles: Orbit speed, Radius. Animate with speed.
  - GL Orbs: Toggle WebGL orbs; Rotate Skins cycles textures.
  - Nav Goo+: Wiggle, Flow Speed, Drip, Viscosity.
- Rising Bubbles (RB)
  - Basic: Attract, Ripples, Speed, Density, Alpha.
  - Layers: Layer 1/2 texture source (Pack/Procedural/Custom) with Apply/Load.
  - Advanced: Wobble, Frequency, Min/Max size, Jumbo Percent/Scale, Size Hertz. Animate Wobble/Frequency with speed.
- GLB (Particles)
  - GPU Bubbles: Speed, Density, Alpha. Each has its own Animate and speed controls directly beneath.
- BG (Background)
  - Background effects removed (Shimmer, Vignette, GL Overlay).
- Hue
  - Enabled toggle in section header; Target selector; Hue/Saturation/Intensity sliders. Animate with speed.
- DEV
  - Developer Tools: Snapshot button (PNG capture of current view).

## Animation

- Every Animate button sweeps its sliders across full ranges smoothly. Speed boxes have +/- bumpers. Buttons show a rainbow outline and a small indicator circle while active.

## Notes

- All labels and sliders include tooltips.
- Backups: `npm run build && npm run backup:dist` will zip `dist/` into `archive/builds/` and append `logs/build.log`.
