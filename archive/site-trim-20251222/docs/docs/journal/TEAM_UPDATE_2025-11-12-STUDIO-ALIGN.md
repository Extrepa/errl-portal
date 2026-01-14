# Team Update — Legacy Studio Hub Refresh (2025-11-12)

## Summary
- Legacy `src/legacy/portal/pages/studio/index.html` now mirrors the new React `/studio` hub: same hero copy, card grid, roadmap section, and badge language.
- Nav bubbles on the legacy page use `data-portal-link` so the runtime rewrite script keeps URLs aligned with the `/legacy/portal/...` base (no double-prefix bugs).
- Router now runs with `basename="/studio"` and a Vite dev/preview middleware rewrites `/studio/**` requests to `studio.html`, so direct loads like `/studio/code-lab` finally land in the React app.
- Cards route to the React experiences (`/studio/code-lab`, `/studio/math-lab`, `/studio/shape-madness`, `/studio/pin-designer`) with Pin Designer now running inside the hub via the legacy asset bridge.
- Portal build verified with `npm run portal:build` after the rewrite; assets and doctor scripts untouched.

## Next
1. QA the shared asset store (save/load/delete) across Code Lab + Pin Designer with larger sample files.
2. Add nightly Playwright coverage for the legacy studio page to ensure nav rewrites stay healthy.
