# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Quick status — 2025‑11‑12

- `/studio` now serves the React Studio Hub (`src/portal/app/pages/Studio.tsx`) with cards for Code Lab, Math Lab, Shape Madness, and Pin Designer. Use `resolvePortalPageUrl` for any legacy iframe links.
- `/studio/pin-designer` runs the legacy designer inside an iframe with `useLegacyAssetBridge`; saves flow into the same IndexedDB store as Code Lab.
- Dev/preview middleware rewrites `/studio/**` requests to `studio.html`, so restart `npm run portal:dev` if routing seems stuck.
- Math Lab & Shape Madness wrappers (`StudioMathLab.tsx`, `StudioShapeMadness.tsx`) forward asset requests through `useLegacyAssetBridge` → `@/utils/assetStore.js`. Touch that hook if the bridge protocol changes.
- Fresh hub theming lives in `studio.css` & `studio-detail.css`. Adjust styling there; avoid inline Tailwind-style class strings elsewhere in the portal.
- Verification snapshot (2025‑11‑12 19:30 PT): `npm run portal:build`, `npm run studio:build`, `npm test` — all passing.

## Commands

### Development
- **Portal dev server**: `npm run portal:dev`
  - URL: http://localhost:5173/
  - React app mounts at `/studio/*`; legacy landing remains at `/index.html`.
- **Studio-only legacy build**: `npm run studio:dev` (wraps `vite.studio.config.ts`)

### Testing & quality gates
- Install browsers once: `npm run agent:browsers`
- Full Playwright suite: `npm test`
- UI-focused group: `npm run test:ui`
- TypeScript guard: `npm run typecheck`
- Production bundles:
  - Portal: `npm run portal:build`
  - Mini studio bundle: `npm run studio:build`
- Safety sweep before hand-off: `npm run portal:safety-check`

Utilities: checkpoint with `npm run portal:checkpoint`, rollback via `npm run portal:rollback`, see doctor scripts under `tools/portal/doctor-*.sh`.

## Architecture overview

- `src/portal/**` — React portal shell (App, router, hub pages, hooks, utils)
- `src/studio/**` — Code Lab React surface & shared studio components
- `src/legacy/portal/pages/**` — legacy HTML bundles embedded via iframes
- `src/utils/**` — legacy JS modules kept for bridges (`assetStore.js`, `bus.js`, etc.)
- `src/shared/**` — modern TS/React utilities & UI primitives shared between portal and studio
- `tools/portal/**` — shell helpers (doctor scripts, checkpoints, studio start/stop)

Always route iframe changes through `resolvePortalPageUrl` so dev/prod bases keep working.

## Important project docs

- `README.md` — high-level vision + structure
- `docs/journal/TEAM_UPDATE.md` — rolling status log (read latest section before starting)
- `docs/reorg/` — repo cleanup & migration plan

## Absent rule files

No CLAUDE rules (`CLAUDE.md`), Cursor rules (`.cursor/` or `.cursorrules`), or Copilot instructions (`.github/copilot-instructions.md`) exist yet.
