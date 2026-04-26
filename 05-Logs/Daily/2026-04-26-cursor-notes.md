## 2026-04-26 Cursor Notes

- Implemented Rising Bubbles multi-mode scoring reducer with normalized score events.
- Added local-first score persistence in `errl_rb_score_state_v3` with migration from legacy score keys.
- Added engine score hooks for Classic throw/flick events and richer Pop event metadata.
- Implemented mode-specific scoring behavior:
  - Classic: off-screen throws + flick hits + combo multiplier.
  - Pop: cadence multiplier based on pop speed.
  - Collect: streak multiplier with inactivity reset.
- Updated RB HUD to show mode score, mode high, lifetime total, and mode badge.
- Updated RB HUD top label to show active mode name (`Classic Throw`, `Pop`, `Collect`) instead of generic score wording.
- Updated RB copy for concise on-screen guidance and retained deeper details behind help (`?`) blocks.
- Added tests for score aggregation and legacy migration handling.
- Updated reference docs with new score keys, scoring behavior, and architecture touchpoints.
- Verification pass:
  - `npm test -- tests/errl-phone-controls.spec.ts -g "RB interaction mode is mutually exclusive|RB scoring reducer aggregates per-mode and lifetime totals|RB score state persists and migrates from legacy keys|Pop mode exposes pop interaction in RB engine"`
  - `npm test -- tests/errl-phone-controls.spec.ts -g "RB scoring reducer aggregates per-mode and lifetime totals|RB interaction mode is mutually exclusive"`
