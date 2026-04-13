# Cursor notes — 2026-04-13

## Legacy Safari (pre–iOS 10.3) portal bubbles

- Added `public/legacy/portal-legacy-bootstrap.js` (ES5, `nomodule`) to run the nav orbit `requestAnimationFrame` loop when `type="module"` scripts are ignored; sets `html.portal-legacy`.
- Added `src/apps/landing/styles/portal-legacy.css` and pulled it into the main stylesheet via `@import` in `styles.css` so production bundles include the rules (Vite was dropping a standalone `<link>` from processed HTML).
- Wired `nomodule` script in `src/index.html`; set `publicDir: resolve(__dirname, 'public')` in `vite.config.ts` so repo-root `public/` (including `legacy/`) is emitted to `dist/` despite `root: 'src'`.
- Legacy CSS: simpler bubble fill (no `conic-gradient` / `clamp`), `mix-blend-mode: normal`, hide `#bgParticles`, `#riseBubbles`, `#errlWebGL`; force `.label` opacity so nav text is visible without keyframe animations.

Smoke: `npx vite build` — `dist/legacy/portal-legacy-bootstrap.js` present; `portal-legacy` rules appear at start of hashed `main-*.css`.
