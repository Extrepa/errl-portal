## Cursor Notes - 2026-04-28

- Implemented classic throw reliability and startup parity updates in `src/apps/landing/scripts/rise-bubbles-three.js`:
  - Cleared stale interaction state when switching modes so classic starts throw-ready.
  - Lowered flick speed threshold and widened nearest-bubble pick radius for mouse throws.
  - Extended throw scoring eligibility window and required mouse-origin throws.
  - Counted top-cap exits as valid edge exits for classic throw scoring.
- Removed classic throw flash trigger and retired flash styles.
- Added score-driven excitement in `src/apps/landing/scripts/portal-app.js` using randomized burst calls and background boosts instead of flash overlays.
- Updated burst spread randomization in `src/apps/landing/scripts/webgl.js` so shooting particles are less patterned and more omnidirectional.
- Added `window.errlBgParticlesBoost(...)` in `src/apps/landing/scripts/bg-particles.js` for temporary background particle velocity/brightness surges.
- Removed old global reset/default controls from DEV UI and removed associated runtime wiring/secret reset paths.
- Removed bottom reset strip from `src/index.html` and added per-tab reset controls inline via dynamic tab help injection (`data-tab-reset`) in `portal-app.js`.
- Lint diagnostics for all touched files: clean.
- Double-check pass: `npm run portal:build` completed successfully (existing asset-resolution warnings only, no build failure).
