## Cursor notes — 2026-05-06

- Implemented portal landing “calm mode”: Classic Throw goal-frame edges (`rb-classic-goal-edges`) only after Rising Bubbles play engagement; `errl:rb-play-engaged` wired from `rise-bubbles-three.js` (grab/flick on canvas) and honored by `portal-app.js` for score HUD + idle streak scheduling.
- RB score HUD: hidden until phone expanded and play engaged or scoring; compact styling via `.rb-collect-score--compact` in `styles.css`.
- Rising Bubbles spawn sectors derived from visible `#navOrbit .bubble` count (matches hidden Design nav).
- Calmer defaults in `src/index.html` for orbit, RB density/wobble/size Hz, and bg particles.
- Header consistency: trimmed duplicate portal header CSS from math-lab and pin-designer HTML; added shared header + `errlPortalHeader.css` to shape-madness.
- Updated Playwright tests in `tests/errl-phone-controls.spec.ts` for goal frame and HUD visibility.
- Verified: `npm test -- tests/errl-phone-controls.spec.ts -g "Classic Throw goal frame|..."` (4 passed).
- Playwright: preset/custom preset flows call `window.confirm`; tests now use `page.once('dialog', ... accept)` before Trippy/Clean/Apply. Burst test opens GL Particles tab (`glb`) where `#burstBtn` lives.
- Full suite: `npm test -- tests/errl-phone-controls.spec.ts` (31 passed). `npm run portal:build` OK. Committed and pushed `main` to trigger Cloudflare Pages deploy.
- Classic Throw edge goals: `#rbClassicGoals` + six `.rb-classic-goal` patrol animations (CSS); `errl:rb-classic-throw` only when projected exit crosses a goal (`rise-bubbles-three.js`); mouse/touch/pen eligible; `portal-legacy` hides `#rbClassicGoals`. Tests: `@controls Classic Throw edge goals…`.
