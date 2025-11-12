# Team Update — Portal Link Cleanup (2025-11-12)

## Summary
- Root landing page now rewrites nav bubbles + embedded SVG Colorizer iframe via `data-portal-link`/`data-portal-frame`, ensuring every route resolves to `/legacy/portal/...` (no more chained `/legacy/portal/legacy/portal` URLs).
- Legacy HTML pages under `src/legacy/portal/pages/**` were mass-updated to use absolute `/legacy/portal/...` hrefs, so jumping between pages never nests relative paths.
- Added `resolvePortalPageUrl` helper usage across the Studio React wrappers (Math Lab, Shape Madness, Pin Designer) to keep iframe bridges aligned with the same routing logic.
- Playwright nav test now asserts both the orbit links and the Colorizer iframe point to `/legacy/portal/...`, catching regressions automatically.
- Typecheck + `npm run portal:build` still pass; existing Cursor-led tasks remain untouched.

## Next
1. Re-run Playwright on CI after Cursor finishes their current branch.
2. Start migrating Pin Designer/assets to the shared store once the React bridge lands.
