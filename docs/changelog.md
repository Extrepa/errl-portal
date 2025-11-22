# Changelog (dev-facing)

- 2025-11-22 — Refactored project structure: reorganized codebase into `src/apps/landing/`, `src/apps/static/`, `src/apps/studio/`, and `src/shared/` directories; updated Vite, TypeScript, and Tailwind configs for new structure.
- 2025-11-22 — Moved all pages from `src/legacy/portal/pages/` to `src/portal/pages/`; updated Vite build config to use new structure.
- 2025-11-22 — Updated all navigation links to point to `/portal/pages/...` instead of `/legacy/portal/pages/...`.
- 2025-11-22 — Fixed all "Back to Portal" buttons to point to `/` (landing page).
- 2025-11-22 — Restructured pin-designer page: created wrapper `index.html` with card/iframe structure; designer loads in iframe from `pin-designer.html`.
- 2025-11-22 — Updated `portalPaths.ts` utility to use `/portal` prefix instead of `/legacy/portal`.
- 2025-11-22 — Updated runtime URL rewriting scripts across all pages to use `/portal` base path.
- 2025-11-22 — Updated shape-madness content copy plugin to reference new portal pages location.
- 2025-10-31 — Replaced docs/ site with project documentation structure; archived old docs site to archive/docs-site-20251031/.
- 2025-10-31 — Removed sync:docs script; docs no longer mirrors src/.
- 2025-10-31 — Removed redundant .github/workflows/static.yml; using Vite build workflow only.
- 2025-10-31 — Reorganized app/pages under `src/legacy/portal/pages/*`; fixed Back to Portal links across pages.
- 2025-10-31 — Ported `about.html` → `src/legacy/portal/pages/about/index.html`; inlined Errl face SVG with glimmer animation.
- 2025-10-31 — Set scripts to `type="module"` and added `file://` fallback in `src/index.html` to load classic scripts when opened directly.
- 2025-10-31 — Created `src/portal/index.html` redirect and quick links.
- 2025-10-31 — Fixed Pin Designer nav link to About page.
