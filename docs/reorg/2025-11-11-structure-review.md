## Workspace Structure Review — 2025‑11‑11

This document captures a top-down audit of the current repository layout after restoring the working state from 2025-11-11. It identifies which areas power the main portal build, which directories are optional or historical, and how to keep things fast both locally and when deploying the site.

### High-Level Summary

| Path | Role | Needed for Portal Launch? | Notes / Recommendations |
| --- | --- | --- | --- |
| `src/` | React/Vite source + legacy HTML portal | **Yes** | Largest tree; contains both modern app code (`src/main.tsx`, `apps/`, `fx/`) and older HTML exports under `src/portal/`. Consider splitting legacy exports into `archive/` to slim builds. |
| `public/` | Static assets for Vite dev server | **Yes (partial)** | Only a few HTML demos; confirm if they still serve a purpose or can move to docs. |
| `tools/portal/` | Shell helpers for build/test workflows | **Nice to have** | Used by npm scripts (`portal:*`, `studio:*`). Keep documented for contributors. |
| `server/` | Express upload harness | Optional | Not part of portal build; useful for studio tooling only. Move under `tools/backend/` when reorganizing. |
| `services/` | MCP organizer CLI bundle | Optional | Heavy (includes `node_modules`). Consider extracting to its own repo or packaging as a dev dependency. |
| `tests/` | Playwright smoke tests | **Yes** | Keep for QA; ensure snapshots are ignored (`test-results/`). |
| `docs/` | Documentation & performance notes | Optional for runtime | Don’t ship to production; should accompany repo but excluded from static hosting. |
| `archive/` | Legacy exports, snapshots, large assets | **No** | Prospective candidates for offloading to external storage if size becomes an issue. |
| `Errl_Portal_Cursor_NextMove_Kit*` | Cursor handoff kit | Optional | Keep zipped version in `archive/kits/` to avoid clutter at root. |
| `about.html`, `index.html`, `StudioRouterExample.txt` (root) | Legacy HTML artifacts | Optional | Already duplicated in `src/` or `archive/`; safe to archive or delete once confirmed. |

### Branch Strategy (Active vs Legacy)
- **`main` branch** — keep only what the live portal, studio, and docs need. Large archives move out once the active build no longer references them.
- **`archive/legacy-kits` branch** — store Cursor handoff kits, root HTML duplicates, and other heavy artifacts so they remain accessible without bloating `main`.
- **Workflow guidance**
  1. Stage moves into `archive/legacy/` (or another attic folder) on `main`.
  2. Copy or cherry-pick those commits into `archive/legacy-kits` before pruning further.
  3. Use `npm run portal:checkpoint` around each move to guarantee fast rollback on both branches.

### Detailed Review (Top Down)

#### Root Files
- `README.md`, `GETTING_STARTED.md`, `WORKFLOW_GUIDE.md`, `AI_*`, `WARP.md`, `SAFETY_REFERENCE.md`, `DEV-SYSTEM-GUIDE.md`, `UPDATE.md` — documentation meant for contributors. Keep in repo but exclude from production deploys.
- `package.json`, `package-lock.json`, `tsconfig.json`, `vite*.config.ts`, `playwright.config.ts`, `warp_tasks.yaml` — core configuration for build/test/automation. These must stay versioned; no production footprint beyond generated bundle differences.
- `about.html`, `index.html` (root) — old static exports; duplicates exist in `src/portal/`. Recommend relocating to `archive/legacy-root/` or deleting once redundant.
- `Errl_Portal_Cursor_NextMove_Kit/` and `.zip` — distribution kit for Cursor handoff. Suggest moving both into `archive/kits/` to declutter root; keep zipped copy only.
- `.DS_Store` and large generated directories (e.g., `dist`) should be ignored/cleaned before committing.

#### `src/` (Primary Source)
- `main.tsx`, `portal/app/App.tsx`, `portal/app/router.tsx`, `portal/app/pages/Studio*`, `studio/app/ErrlLiveStudio*` — current React application; required for live portal.
- `fx/`, `portal/core/bg-particles.js`, `portal/core/rise-bubbles.js`, `portal/core/webgl.js`, `portal/core/portal-app.js` — power the animated landing experience. Critical for launch; ensure tree-shaking works (they are referenced by `src/index.html`).
- `portal/` — contains the React hub (`portal/app/**`), landing runtime (`portal/core/**`), and the historical HTML exports now relocated under `src/legacy/portal`. Legacy files still feed Vite’s multipage build; keep until each gets a React bridge.
- `assets/Recent_Generations/` (247 JPEGs) — heavy; confirm whether they are still displayed. If only used for reference/gallery, moving them to a CDN or lazy-loading would reduce build size.
- `tools/` (under `src/`) — contains legacy JSX and helper modules; evaluate whether these should live in a dedicated `tools/` directory outside `src` to avoid bundling.
- `data/errl/paths/` — JSON/txt assets for Errl SVG; essential for hero scene. Keep with version control.
- `devpanel/`, `shared/utils/`, `shared/components/ui/` — necessary for portal runtime.

**Local build tips**
- Use `npm run dev` for development; `npm run build` for production bundle.
- When previewing production output locally, run `npm run preview -- --host --base=/` so hashed assets resolve without `/errl-portal/` base path (or set `VITE_PREVIEW_BASE` script).

**Deployment tips**
- Ensure `dist/` is deployed to a static host. Current `vite.config.ts` sets `base: '/errl-portal/'` for GitHub Pages; adjust if deploying to root domain.
- Exclude large static archives (`archive/`, `Errl_Portal_Cursor_NextMove_Kit/`, docs) from deployment pipeline (e.g., use `.npmignore` or specific upload scripts).

#### `public/`
- Contains older static HTML demos (`public/apps/...`). If the React app no longer references them, consider moving to `docs/examples/` or `archive/`.
- `public/styles.css`, `public/webgl.js`, `public/app.js` may overlap with `src` versions; verify they’re still required. Everything under `public/` gets copied to the build root, so remove unused files to keep deploys slim.

#### `tools/portal/`
- Bash + Node helpers invoked by npm (e.g., `portal:doctor:*`, `studio:dev`, `portal:safety-check`). These live under a single namespace now; keep them versioned and document usage as you add new workflows.

#### `server/`
- Minimal Express upload/test harness. Only needed for studio tooling; does not impact portal runtime. Move under a new `tools/backend/` namespace during future cleanup or remove if unused.

#### `services/mcp/errl-organizer/`
- Bundled MCP CLI with its own `node_modules`. Heavy directory (~hundreds of MB). Since it’s unrelated to portal delivery, consider treating it as an external dependency (separate repo or npm package). For now, ensure `.gitignore` excludes unnecessary build artifacts if you keep it inline.

#### `tests/` and `test-results/`
- Playwright specs that validate portal functionality. `test-results/` should remain in `.gitignore` to avoid committing recordings.
- Keep tests for regression coverage; run with `npm test` (headless). For CI, ensure Playwright browsers are installed (`npx playwright install`).

#### `docs/`
- Houses ADRs, performance notes, team updates, and reorg documentation. None of this deploys with the site, but it’s valuable for contributors.
- `docs/reorg/phase1-inventory.md` already lists top-level directories; expanding this review (current file) adds clarity for future structural changes.

#### `archive/`
- Contains bulk historical data: legacy builds, old snapshots, art exports, and zipped phase checkpoints.
- Keeping archives versioned is useful for reference, but they heavily increase repo size. Consider:
  - Moving rarely-used assets to cloud storage.
  - Keeping only zipped snapshots (e.g., the new `2025-11-11` tarball) rather than entire duplicated `src/` trees.
  - Organizing into subdirectories (`archive/legacy-portal/`, `archive/snapshots/`, `archive/kits/`) if you plan to maintain them in-repo.

#### Other Directories
- `notes/` — informal logs; keep under docs or `docs/journal/` for consistency.
- `tools/browser-control/` — used by `npm run agent:browser`. Optional for portal but helpful for automation. Document usage in README when reorganizing.
- `tests/`, `public/apps/`, and `src/apps/` share overlapping demos; confirm deduplication to avoid confusion.

### Recommendations for Future Restructuring
1. **Branch before moving files** — use the saved snapshot (`archive/snapshots/2025-11-11-working-state.tar.gz`) as a fallback.
2. **Define target layout** — e.g., `apps/` for React, `legacy/` for historical HTML, `tools/` for scripts/backends, `docs/` for documentation, `archive/` for large assets.
3. **Automate base path testing** — ensure preview/build scripts mimic production paths (`/errl-portal/` vs `/`) to avoid missing CSS/JS during reorgs.
4. **Gradual migration** — move one bucket at a time (docs, tooling, legacy assets), run `npm run build` and `npm test`, then adjust import paths before proceeding.
5. **Deployment pipeline** — create a whitelist (e.g., `dist/**`, `README.md`, `LICENSE`) to upload for production so extra assets don’t slow deployments.

### Transition Checklist (Local → Hosted)
- [ ] Run `npm run build`.
- [ ] Archive snapshot if major changes were made.
- [ ] Deploy contents of `dist/` using the correct base path.
- [ ] Purge old caches/CDN to ensure new assets load.
- [ ] Run Playwright (`npm test`) or at least smoke tests on preview host.
- [ ] Monitor load time; offload heavy media to CDN if needed.

This review should serve as the baseline for future “sort me” efforts. Keep it updated as directories move or are retired.
