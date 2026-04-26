## 2026-04-26 Cursor Notes

- Implemented phone panel reset UX cleanup: replaced multi-tab mini reset cluster with a single active-tab reset action in the bottom row.
- Added two-step inline reset safety flow: arm state, confirm state, warning text, timeout auto-disarm, and blur disarm.
- Kept reset scope strictly tab-local by wiring the active tab key into `applyRepoTabReset`.
- Simplified always-visible Rising Bubbles copy and kept detailed guidance behind the tab `?` help disclosures.
- Reworked RB scoring UI/state to support per-mode score + overall total, with ERRL neon-themed score visuals.
- Added active-tab-driven help panel accent styling via `data-active-tab` on the phone panel.
- Fixed minimized phone regression where controls could leak into the bubble due later CSS overrides; added a final minimized lock rule.
- Updated tests for reset safety behavior, RB score aggregation, and minimized bubble control hiding.
- Verified the minimized bubble regression test passes:
  - `npm test -- tests/errl-phone-controls.spec.ts -g "Minimized phone bubble shows Customize CTA and restores"`
