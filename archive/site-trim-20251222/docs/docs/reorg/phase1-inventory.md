## Phase 1 Inventory – Top-Level Repository Check

Last updated: 2025-11-11  
Status: Initial classification of top-level directories/files.

### Category Legend

- `source`: actively maintained application code or tests.
- `docs`: documentation, updates, journals, guides.
- `tooling`: scripts, services, or backend helpers that support development.
- `build`: generated artifacts or test output that can be regenerated.
- `archive`: historical snapshots, kits, or legacy exports kept for reference.
- `config`: project configuration or workflow definitions.
- `dependency`: third-party installation directories (do not commit/move).
- `stray`: items that need relocation or confirmation.

### Top-Level Items

| Item | Category | Notes / Next Steps |
| --- | --- | --- |
| `AI_DEVELOPMENT_GUIDE.md` | docs | Include in consolidated documentation. |
| `AI_PROMPT_TEMPLATES.md` | docs | Same doc bucket; confirm audience. |
| `DEV-SYSTEM-GUIDE.md` | docs | Candidate for `docs/` merge. |
| `Errl_Portal_Cursor_NextMove_Kit/` | archive | Packaged Cursor kit; move under `archive/` or `docs/kits`. |
| `Errl_Portal_Cursor_NextMove_Kit.zip` | archive | Duplicate of above; consider removing after relocating source folder. |
| `GETTING_STARTED.md` | docs | Fold into docs index. |
| `README.md` | docs | Primary entry point; keep in root. |
| `SAFETY_REFERENCE.md` | docs | Move to `docs/` or cross-link. |
| `StudioRouterExample.txt` | docs | Confirm usefulness; likely move to `docs/`. |
| `TEAM_UPDATE.md` | docs | Archive in `docs/journal` or `docs/team-updates`. |
| `TEAM_UPDATE_2025-11-09-LAYERS.md` | docs | Same as above. |
| `TEAM_UPDATE_2025-11-09.md` | docs | Same as above. |
| `UPDATE.md` | docs | Historical note; relocate to `docs/updates`. |
| `WARP.md` | docs | Document for Warp automation; move to `docs/`. |
| `WORKFLOW_GUIDE.md` | docs | Move into docs structure. |
| `about.html` | stray | Legacy HTML; confirm if needed before archiving (likely `archive/legacy-portal`). |
| `archive/` | archive | Contains historical exports/backups; keep but index contents. |
| `dist/` | build | Generated Vite output; should be ignored or moved out of tracked tree. |
| `dist-mini/` | build | Alternate build output; treat same as `dist/`. |
| `docs/` | docs | Canonical documentation home; expand to host scattered guides. |
| `index.html` | stray | Root HTML snapshot; relocate with other legacy portal exports. |
| `node_modules/` | dependency | Managed by npm; exclude from structural changes. |
| `notes/` | docs | Two markdown logs; move/merge into `docs/journal`. |
| `package-lock.json` | config | Keep in root; ensure consistent with `npm`. |
| `package.json` | config | Root project metadata; remains. |
| `playwright.config.ts` | config | Testing configuration; stays with project root configs. |
| `public/` | source | Static assets served by Vite; retain but audit contents later. |
| `src/assets/portal/` | source | Layered hero art + phone UI sprites consumed by the landing page. |
| `src/assets/shared/` | source | Shared textures (bubbles, orb skins, dev icons) referenced via aliases. |
| `src/assets/legacy/` | source | Assets only needed by archived HTML exports (e.g., gallery thumbnails). |
| `src/portal/app/` | source | React Studio hub (router, cards, experiment bridges) served at `/studio` routes. |
| `src/legacy/portal/pages/` | source | Archived standalone HTML experiences (About, Gallery, Studio subsites) still built via Vite. |
| `tools/portal/` | tooling | Shell helpers (doctor, start/stop studio, backups) consolidated under one namespace. |
| `server/` | tooling | Upload/test scripts; decide if they belong under `tools/backend`. |
| `services/` | tooling | MCP organizer CLI; evaluate relocation or extraction. |
| `src/` | source | Main app code; requires internal reorg in Phase 3. |
| `test-results/` | build | Appears empty; confirm retention policy or add to `.gitignore`. |
| `tests/` | source | Automated tests; retain with source. |
| `tools/browser-control/` | tooling | Front-end helper utilities; now sits alongside `tools/portal/` within the tooling namespace. |
| `tsconfig.json` | config | Root TS config; keep. |
| `vite.config.ts` | config | Primary build config; keep. |
| `vite.mini.config.ts` | config | Secondary build config; verify necessity. |
| `vite.studio.config.ts` | config | Studio-specific config; document usage. |
| `warp_tasks.yaml` | config | Warp automation file; document or relocate under workflow settings. |

### Observations

- Many documentation files live in the root alongside code; consolidating them into `docs/` will simplify onboarding.
- Tracked build artifacts (`dist`, `dist-mini`, `test-results`) should be removed or ignored once backups are confirmed.
- Legacy HTML exports (`about.html`, `index.html`, portions of `archive/`) need stakeholder confirmation before relocation or deletion.
- Tooling (`scripts`, `server`, `services`, `tools`) should likely live under a single `tools/` namespace with subfolders (`cli/`, `automation/`, `backend/`).

### Open Questions for Stakeholders

1. Which legacy HTML portals must remain accessible inside the repo versus external storage?
2. Do we need to preserve packaged kits (e.g., `Errl_Portal_Cursor_NextMove_Kit`) in git, or can we regenerate them?
3. Are the `dist` and `dist-mini` outputs relied upon by any deployment scripts, or can we rely solely on `npm run build`?


