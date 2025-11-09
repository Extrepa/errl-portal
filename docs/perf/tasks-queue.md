# Safari Layers Audit — Tasks Queue

> Created: 2025-11-09  
> Branch: `perf/layer-audit-portal-landing-2025-11-09`

| ID | Task | Owner | Status | Notes |
|----|------|-------|--------|-------|
| T-001 | Capture baseline Safari layers + memory metrics | _unassigned_ | ☐ | Populate `docs/perf/2025-11-09-results.md` and drop screenshots under `docs/perf/2025-11-09-safari-layers/` |
| T-002 | Build debug harness (overlay/orb/bubbles/vignette toggles, renderer clamp) | _unassigned_ | ☐ | Add CLI/UI toggles + persistent flags per TEAM_UPDATE plan |
| T-003 | Harden canvas CSS & z-order invariants | _unassigned_ | ☐ | Ensure pointer-events, fixed sizing, canonical z-index order |
| T-004 | Audit PIXI stage & filters for extra composites | _unassigned_ | ☐ | Validate ParticleContainer ordering, relocate filters if needed |
| T-005 | Implement renderer resolution clamp & resize guards | _unassigned_ | ☐ | Cap DPR, prevent zero-dimension resizes |
| T-006 | Log before/after metrics + PR handoff | _unassigned_ | ☐ | Update TEAM_UPDATE, results log, open PR with findings |

Update this queue as subtasks are claimed or completed.

