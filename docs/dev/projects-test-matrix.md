# Projects Effects — Test Matrix

Run locally with `npm run dev` (http://localhost:5173/) and direct file paths as needed.

## Desktop Chrome (latest)
- Gravity: drag/fling works, collisions bounce; 60fps typical
- Ripple: ripples draw on down/move; canvas scales with container
- Sparkle: paint(sparkle) active; twinkle slider updates; no console errors
- Bubble/Holographic: trails spawn; nodes auto-remove; no leaks
- Reduced Motion: set OS → reduced motion and verify lower density

## Desktop Safari (latest)
- Gravity/Ripple/Bubble/Holographic: function as expected
- Sparkle: fallback gradients active; no worklet errors; UI responsive
- Reduced Motion: verify clamps and shorter lifetimes

## iOS Safari / Android Chrome
- Touch events → pointer mapping ok
- Trailing effects visible; performance reasonable
- Orientation changes resize canvases correctly

## High-DPI/Retina
- Canvases crisp; no blur due to DPR; resize events stable

## File scheme
- Open single-file pages; Sparkle should gracefully fallback if worklet blocked

## Troubleshooting
- If an effect seems paused: ensure the tab is visible (some loops pause on hidden)
- Clear caches if CSS/JS seems stale
