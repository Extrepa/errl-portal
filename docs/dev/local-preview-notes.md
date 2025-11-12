# Local Preview Setup

**Date:** 2025-11-11 13:16 UTC

## Summary

Single Vite dev server serves both Portal and Studio from one process:
- **Portal**: http://localhost:5173/ → `src/index.html`
- **Studio hub**: http://localhost:5173/studio → `src/studio.html`
- Vite middleware rewrites `/studio/**` → `studio.html` (configured in `vite.config.ts`)

## Architecture

- **Not** separate apps with a proxy
- **Single** Vite multi-page config with two HTML entry points
- BrowserRouter with `basename="/studio"` for React routing under `/studio`
- Legacy pages at `/legacy/portal/pages/**` embedded via iframes with shared asset bridge

## Key Constraints

- Use Errl spelling everywhere
- Main Errl body asset on home page with wiggle/jiggle
- Updated Errl face (errl-face-2.svg) for coin decoration and About page
- Layer order enforced: filters on fxRoot only, not app.stage with ParticleContainer

## Dev Commands

```bash
# Start dev server (one command, serves both)
npm run dev
# → http://localhost:5173/

# Visit routes
open http://localhost:5173/              # Portal landing
open http://localhost:5173/studio        # Studio hub
open http://localhost:5173/studio/code-lab
open http://localhost:5173/studio/math-lab
open http://localhost:5173/studio/shape-madness
open http://localhost:5173/studio/pin-designer
```

## Tests

```bash
npm run typecheck
npm test
npm run portal:build
```

## Routes Verified

- ✅ `/` → Portal (200)
- ✅ `/studio` → Studio hub (200)
- ✅ Middleware rewrites working

## Current Session Status

**Date**: 2025-11-11 13:16 UTC
**Branch**: main (ahead 1 commit)
**Package manager**: npm

### Files Changed
- 39 files changed: +2276 -543
- Key additions:
  - `src/portal/app/pages/StudioPinDesigner.tsx` (new)
  - `src/portal/app/pages/StudioShapeMadness.tsx` (new)  
  - `src/portal/app/hooks/useLegacyAssetBridge.ts` (new)
  - `src/portal/app/utils/portalPaths.ts` (new)
  - `src/portal/app/pages/studio.css` (new)
  - `src/portal/app/pages/studio-detail.css` (new)

### Architecture Confirmed

- **Single Vite instance** serving multi-page app (not separate Portal/Studio servers)
- No reverse proxy needed—Vite middleware handles `/studio/**` rewrites
- `BrowserRouter` with `basename="/studio"` for React routing
- Legacy pages embedded via iframes with shared IndexedDB asset store
- `tools/` directory is for **shell scripts**, not user-facing content (no rename needed)

### To Start Dev Server

```bash
npm run dev
# Serves at http://localhost:5173/
# Routes:
#   /              → Portal landing (src/index.html)
#   /studio        → Studio hub (src/studio.html, React)
#   /studio/*      → React Router handles sub-routes
```

### Backup Created
- `.local/wip-20251111-0516.patch` (123KB)

### Next Steps
1. Open browser to http://localhost:5173/ and verify Portal landing
2. Navigate to http://localhost:5173/studio and test hub cards
3. Check asset bridge by loading Pin Designer or Math Lab
4. Run `npm run typecheck && npm test` when ready to commit
5. Consider adding this doc to `.gitignore` if it's workspace-specific

