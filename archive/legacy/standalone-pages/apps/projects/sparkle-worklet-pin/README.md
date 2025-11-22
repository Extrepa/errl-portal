# Sparkle Worklet Pin

A pin with animated sparkles using CSS Paint Worklet. Graceful fallback to layered gradients when unsupported or blocked (e.g., file:// or Safari).

## Files
- index.html, style.css, script.js, sparkle.js

## How to run
- Direct file: open `index.html` in a browser
- Via dev server: http://localhost:5173/apps/projects/sparkle-worklet-pin/

## Reduced motion
- Twinkle intensity clamped; animation rate reduced.

## Browser support
- Paint Worklet: Chromium-based browsers. Safari/Firefox will use the fallback automatically.

## Notes
- If the worklet fails to load, `.enamel` receives a `fallback` class with static/animated gradients.
