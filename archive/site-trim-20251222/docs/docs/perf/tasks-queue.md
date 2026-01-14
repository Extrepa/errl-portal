# Safari Layers Audit — Tasks Queue

> Created: 2025-11-09  
> Branch: `perf/layer-audit-portal-landing-2025-11-09`

| ID | Task | Owner | Status | Notes |
|----|------|-------|--------|-------|
| T-001 | Capture baseline Safari layers + memory metrics | _unassigned_ | ☑ | Baseline logged in `docs/perf/2025-11-09-results.md` (≈5.1 GB, 27 layers) with screenshots + audit export |
| T-002 | Build debug harness (overlay/orb/bubbles/vignette toggles, renderer clamp) | Extrepa | ☑ | `window.errlDebug` + dev panel hotkeys landed (Alt+D hide, Alt+P click-through) |
| T-003 | Harden canvas CSS & z-order invariants | Extrepa | ☑ | `src/styles.css` + index restores canonical sizing/z-index |
| T-004 | Audit PIXI stage & filters for extra composites | Extrepa | ☑ | Confirmed filters only on `fxRoot` overlay/mood + orb sprites; stage/ParticleContainer remain filter-free (see results log) |
| T-005 | Implement renderer resolution clamp & resize guards | Extrepa | ☑ | Safari DPR = 1.5, RAF resize guards in `webgl.js` + `rise-bubbles.js` |
| T-006 | Log before/after metrics + PR handoff | _unassigned_ | ☐ | Update TEAM_UPDATE, results log, open PR with findings |
| T-007 | Capture isolation passes (overlay/vignette/bubbles toggles) | _unassigned_ | ☐ | Use checklist in results log to document layer deltas + screenshots |

Update this queue as subtasks are claimed or completed.

