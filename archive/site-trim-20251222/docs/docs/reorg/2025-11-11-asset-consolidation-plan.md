# Phase 2 — Asset & Portal Source Consolidation

_Last updated: 2025-11-11_

## Goals
- Clarify what stays in the active portal runtime versus legacy exports.
- Collapse duplicated art into a single `src/assets/` tree while keeping portal-specific layers easy to address.
- Update import aliases so React code references shared assets with predictable prefixes (`@assets/*`, `@portal/*`, `@legacy/*`).
- Preserve the ability to test the site after every move (`npm run portal:build`, `npm run studio:build`, `npm run test`).

## Status
- ✅ Aliases wired (`vite.config.ts`, `tsconfig.json`)
- ✅ Portal layers moved to `src/assets/portal/`; shared art under `src/assets/shared/`
- ✅ Legacy gallery thumbnails relocated to `src/assets/legacy/gallery/recent/` and HTML updated to use `%BASE_URL%`
- ⏳ React/studio code still lives under `src/apps/**`
- ⏳ Tooling/docs need refresh once the app move completes

## Current Snapshot
- **Shared art** now lives in `src/assets/shared/` (bubbles, dev icons, experimental textures).
- **Portal runtime art** is in `src/assets/portal/L*` plus `src/assets/portal/ui/`.
- **Legacy static pages** sit under `src/legacy/portal/pages/**` and reference `%BASE_URL%assets/legacy/...`.
- **React portal code** is still split across `src/index.html`, `src/portal/core/**`, `src/apps/**`, and `src/components/ui/**`.
- **Studio React implementation** is in `src/apps/ErrlLiveStudio*.{tsx,jsx}`; TypeScript declarations in `src/studio/` are stale.

## Proposed Structure
```
src/
  assets/
    shared/              ← bubbles, dev icons, reusable textures
    portal/              ← layered Errl art (L0-L6) + phone UI sprites
    legacy/              ← thumbnails that only the legacy HTML exports need
  portal/
    app/                 ← React SPA entry (App.tsx, router, hooks)
    core/                ← existing DOM bootstrap scripts (untouched for now)
    dev/                 ← debug helpers
  studio/
    app/                 ← React ErrlLiveStudioPro + helpers (out of src/apps/)
  legacy/
    portal/pages/**      ← already moved
```

## Step-by-Step Plan
1. **Introduce asset aliases**
   - Add `@assets` → `src/assets`, `@portal` → `src/portal`, and `@legacy` → `src/legacy` in `vite.config.ts`.
   - Update ESLint/TypeScript configs if needed.

2. **Partition `src/assets/`**
   - Create `src/assets/shared/` and move current contents under it.
   - Copy/move `src/portal/assets/L*` into `src/assets/portal/` (keep folder names).
   - Move gallery thumbnails (`src/legacy/portal/pages/gallery/assets/recent`) into `src/assets/legacy/gallery/recent/` and adjust legacy HTML paths.

3. **Update references**
   - React + TS: swap relative paths (`./portal/assets/...`) with alias imports (`@assets/portal/...`).
   - Legacy HTML: replace deep relative paths with `%BASE_URL%legacy/...` or adjust Vite copy plugin.
   - CSS masks / JS modules: ensure they resolve via aliases so the bundler rewrites them automatically.

4. **Re-home React portal code**
   - Create `src/portal/app/` and move `src/index.tsx` (if introduced) or equivalent React router components there.
   - Move `src/apps/ErrlLiveStudio*.{tsx,jsx}` into `src/studio/app/` and delete the stale declaration file.
   - Update imports (`@/apps/...` → `@portal/app/...` or `@studio/app/...`) and adjust `tsconfig` paths.

5. **Tooling update**
   - Refresh `tools/portal/doctor-structure.sh` expectations to the new paths.
   - Document alias usage in `DEV-SYSTEM-GUIDE.md`.

6. **Validation per sub-step**
   - After alias + asset moves: run `npm run portal:build`.
   - After React/studio moves: run `npm run studio:build`.
   - Finish with `npm run test` + manual smoke via `npm run dev`.
   - Update docs (`README.md`, `docs/reorg/portal-structure.md`) once structure stabilizes.

## Open Questions
- Should we keep gallery thumbnails in git or generate them on demand?
- Does the legacy branch also need the new alias structure, or can it stay frozen post-export?
- Are there assets inside `archive/portal-attic/` that should move into `src/assets/legacy/` for completeness?

## Rollback Guidance
- Each major move (aliases, asset relocation, React/studio refactor) should happen on its own git commit.
- Use `npm run portal:checkpoint` before relocating files so we can revert quickly if a test fails.

