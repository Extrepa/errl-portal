# Projects Effects (Standalone + Studio)

This document summarizes the five standalone effects and their Studio integration, how to run them, and QA guidance.

## Effects
- Gravity Sticker Field — canvas physics, drag, collisions
- Ripple Face — Errl face (SVG) with a canvas ripple overlay
- Sparkle Worklet Pin — CSS Paint Worklet sparkles with gradient fallback
- Bubble Mouse Trail — DOM bubbles with CSS keyframes
- Holographic Cursor Trail — gradient dots with blur + fade

## Locations
- Standalone HTML (open via file://):
  archive/legacy/standalone-pages/apps/projects/_single-file/{gravity-sticker-field.html,ripple-face.html,sparkle-worklet-pin.html,bubble-mouse-trail.html,holographic-cursor-trail.html}
- Portal variants (served via Vite):
  archive/legacy/standalone-pages/apps/projects/<slug>/{index.html,style.css,script.js,...}
- Studio React wrappers:
  src/apps/projects/<slug>/<Component>.tsx
- Studio Projects Page:
  /studio/projects (via router)

## Reduced motion
All effects respect `prefers-reduced-motion: reduce` by lowering density/intensity and shortening lifetimes. Sparkle clamps twinkle.

## Browser support
- Sparkle Worklet: Chromium (paintWorklet). Safari/Firefox → fallback gradients.
- Others: modern evergreen browsers.

## Notes
- No external libraries.
- DPR-aware canvases; resize handled.
- Effects guard against hidden tabs (pause/cleanup).
