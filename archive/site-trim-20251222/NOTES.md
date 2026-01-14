# Site Trim Notes (2025-12-22)

Goal: keep only what is required for website function and Playwright tests; move everything else into archive for reversibility.

## Kept (needed for site + tests)
- `src/` (site source)
- `tests/` (Playwright specs)
- `package.json`, `package-lock.json` (deps + scripts)
- `vite.config.ts`, `vite.studio.config.ts` (build/dev)
- `tsconfig.json`, `postcss.config.js`, `tailwind.config.ts` (tooling)
- `playwright.config.ts` (test runner config)
- `.git/`, `.gitignore` (repo + ignore test/build outputs)
- `node_modules/` (local deps for running tests without reinstall)
- `archive/` (existing archive root)

## Archived (not required for site/tests)
### docs/
- `README.md`
- `docs/`
- `plans/`

### build/
- `dist/`
- `dist-mini/`
- `test-results/`
- `.reports/`

### dev/
- `copilot/`
- `electron/`
- `server/`
- `services/`
- `tools/`
- `packages/`

### automation/
- `.github/`
- `warp_tasks.yaml`

### local/
- `.cursor/`
- `.local/`
- `.npm-cache/`
- `.npm-logs/`
- `.obsidian/`
- `.smart-env/`
- `.vscode/`
- `.DS_Store`

### config/
- `vite.mini.config.ts`

## Restore notes
- Move any folder/file back to repo root to restore functionality.
- `electron/` restores `npm run portal:preview`.
- `tools/` restores `npm run studio:dev` and portal doctor/safety scripts.
- `dist/`/`dist-mini/` restore prebuilt static outputs (optional).

