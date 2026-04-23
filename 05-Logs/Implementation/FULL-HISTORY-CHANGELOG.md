# FULL HISTORY CHANGELOG - errl-portal

Date generated: 2026-04-22
Scope: local forensics (`--all` refs, local reflog, unreachable commits)

## Source map
- Git refs/history: `.git` (all local branches/tags/remotes)
- Local reflog: `git reflog`
- Unreachable/orphan scan: `git fsck --no-reflogs --unreachable`
- Project notes: `05-Logs/Daily/*.md`
- Session plans: `.cursor/plans/*.md`

## Repository forensics snapshot
- Reachable commits from all refs: `203`
- Earliest reachable commit date: `2025-10-22`
- Latest reachable commit date: `2026-04-22`
- Total branch refs (local + remote): `20`
- Total tags: `3`
- Reflog entries (local recovery timeline): `18`
- Unreachable commit objects (not in reachable refs): `9`

## Active refs captured
- Long-lived branch: `main`
- Feature/history refs include:
  - `feature/bubble-labels-and-phone-face`
  - `feature/portal-legacy-safari`
  - `perf/layer-audit-portal-landing-2025-11-09`
  - `backup/*` and `checkpoint/*` preservation branches
- Tags found:
  - `checkpoint-2025-11-13-1517`
  - `erc-20251030-082458`
  - `v2025.10.31`

## Commit volume by month (`git log --all`)
- `2025-10`: 28
- `2025-11`: 64
- `2025-12`: 1
- `2026-01`: 100
- `2026-03`: 2
- `2026-04`: 8

## High-level chronology
- **2025-10 to 2025-11:** Initial portal foundation, visual effects, and early branch checkpoints.
- **2025-12 to 2026-01:** Largest development burst; core UX controls, interaction systems, and test expansion.
- **2026-03:** Small stabilization window.
- **2026-04:** Current polishing cycle with Errl Phone UX and guarded reset flows.

## Recent head activity (latest 5 on `HEAD`)
- `2026-04-22` `7cf3fac` feat(portal): improve Errl Phone UX and add guarded secret reset flow
- `2026-04-22` `c44884d` docs(log): document failed workflow push, fix optional Action path
- `2026-04-22` `14d93f6` docs(log): note e39b5e4 on main and CI workflow copy path
- `2026-04-22` `e39b5e4` feat(portal): polish plan - RB collect, GLB burst, presets, undo, deploy-first tests
- `2026-04-22` `1da49e3` feat(portal): Design nav visibility, forum header, nav skins, Errl Phone docs

## Forensics caveats
- `fsck` reports `.git/refs/.DS_Store` as an invalid refname artifact. This does not rewrite history but should be treated as repo-health cleanup work.
- Reflog/orphan history is local and retention-dependent; it is not a canonical shared timeline.
- Unreachable commit count may change over time with GC/pruning.
