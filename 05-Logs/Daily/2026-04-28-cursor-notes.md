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
- Moved generated per-tab reset controls to the bottom of each tab's content by appending reset rows to the last section for each tab in `setupTabHelpNotes()` (`src/apps/landing/scripts/portal-app.js`).

### Errl Phone resize, mobile sheet, RB score HUD

- **CSS (`styles.css`):** Panel max dimensions scale with `--phone-user-scale`; narrow (520px) breakpoint uses scaled `max-width` / `max-height` instead of fixed `width`/`height` overrides; `.errl-panel--mobile-sheet` for optional larger caps; `.rb-collect-score` z-index 15; HUD row for mobile-large toggle visible only ≤520px.
- **HTML:** Continuous `#errlPhonePanelSize` range (0.85–2); `#errlPhoneMobileLarge` checkbox.
- **JS (`portal-app.js`):** `normalizeStoredPhoneSize` (legacy index 0/2 → 0.88/1.12); `syncMobileLargePanel`; RB `renderScoreHud` decoupled from RB tab (hidden only when phone minimized); `errl:score-hud-sync` + MutationObserver `class` on `#errlPanel`.
- **Defaults:** `errl-defaults.json` adds `errlPhoneMobileLarge`: false.
- **Tests:** `errl-phone-controls.spec.ts` — score HUD stays synced when switching to HUD tab.

### Portal UI/UX consistency (shipped routes)

- **Inventory:** [05-Logs/Daily/2026-04-28-shipped-routes-checklist.md](05-Logs/Daily/2026-04-28-shipped-routes-checklist.md) lists vite inputs and a nav/a11y checklist.
- **Shared static shell:** [src/shared/styles/errlStaticPage.css](src/shared/styles/errlStaticPage.css) — body + container + “coming soon” card patterns; linked from gallery, design, chatbot, designer, etc.
- **Header dedupe:** Removed duplicate inline header/bubble CSS from gallery, design, pin-designer (and face-only) index pages, assets index (kept grid/box rules), `chatbot` and `designer` now use the same link stack as other section pages.
- **Asset paths:** Fixed `errl-bg.css` links to `apps/landing/fx/errl-bg.css` where they pointed at a non-existent `src/fx/`.
- **Nav a11y:** [src/shared/styles/errlPortalHeader.css](src/shared/styles/errlPortalHeader.css) — `focus-visible` for home + bubble buttons; `[aria-current='page']` matches `.active` styles; about/gallery/assets/studio/gallery pages updated with `aria-label` on nav and `aria-current` on current route where applicable.
- **Errl phone:** [src/apps/landing/scripts/portal-app.js](src/apps/landing/scripts/portal-app.js) — `normalizeBundle` clamps `errlPhonePanelSize` (0.85–2), re-persist on load if normalized; `restorePanel` re-activates the current `data-active-tab` instead of forcing HUD; [src/apps/landing/styles/styles.css](src/apps/landing/styles/styles.css) — `max-height` uses `dvh` + safe-area for expanded panel.
- **Tests:** [tests/errl-phone-panel-size.spec.ts](tests/errl-phone-panel-size.spec.ts) (min panel box); [tests/pages.spec.ts](tests/pages.spec.ts) — nav/back lists use shipped routes (studio, design); back-link test waits for `#errlPanel` on home.
- **Playwright:** `tests/errl-phone-panel-size.spec.ts` + `tests/pages.spec.ts` — 16 passed.
