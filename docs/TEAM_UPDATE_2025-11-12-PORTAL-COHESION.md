# Team Update — Portal Cohesion & Studio Bridges (2025-11-12)

## Branch
`main`

## Summary
- Navigation rewrites now normalize every portal link and embedded iframe through `data-portal-link`/`data-portal-frame`, eliminating duplicate `/legacy/portal` prefixes across the legacy app.
- Legacy `src/legacy/portal/pages/studio/index.html` mirrors the new React `/studio` hub, keeping copy, cards, and roadmap content consistent no matter how the page is loaded.
- Pin Designer, Shape Madness, and Math Lab all run inside the React Studio hub via `useLegacyAssetBridge`, sharing the IndexedDB asset store with Code Lab without breaking legacy exports.
- Playwright coverage expanded to assert portal link targets, Studio hub navigation, and iframe bridge wiring; `npm test` and `npm run portal:build` both green.

## Highlights
### Navigation & Link Rewrites
- Root landing orbit bubbles and runtime SVG Colorizer iframe now rely on a single link resolution helper.
- Legacy static pages rewired to absolute `/legacy/portal/...` hrefs so cross-linking never nests paths.

### Studio Hub Refresh
- Legacy hub refreshed to match the React experience for copy, calls-to-action, and card styling.
- Router now uses `basename="/studio"` with Vite middleware to serve `studio.html` for direct deep links.

### Pin Designer Bridge
- Introduced `StudioPinDesigner.tsx` so the enamel designer operates inside the React hub.
- Shared `useLegacyAssetBridge` hook exposes the IndexedDB asset store to the legacy iframes.
- Updated documentation (`README.md`, `docs/dev/preview-qa-complete.md`) to reflect the shared routing model.

## Verification
- `npm run portal:build`
- `npm test`
- Manual nav checks across `/` and `/studio/**` (React hub + legacy bridges)

## Next Steps
1. Stress-test the shared asset store with large Pin Designer exports and Code Lab imports.
2. Add nightly Playwright coverage for the legacy studio page to catch link regressions automatically.
3. Implement the preview QA automation scripts (`stage-preview-qa.sh`, `run-preview-verifications.sh`, `draft-preview-announcement.sh`) outlined in `plans/2025-11-11-preview-qa-automation.md`.

## Timeline References
- `docs/journal/TEAM_UPDATE_2025-11-12-LINKS.md`
- `docs/journal/TEAM_UPDATE_2025-11-12-STUDIO-ALIGN.md`
- `docs/TEAM_UPDATE_2025-11-09-LAYER-CLEANUP.md`

