# Changelog (dev-facing)

- 2025-10-31 — Replaced docs/ site with project documentation structure; archived old docs site to archive/docs-site-20251031/.
- 2025-10-31 — Removed sync:docs script; docs no longer mirrors src/.
- 2025-10-31 — Removed redundant .github/workflows/static.yml; using Vite build workflow only.
- 2025-10-31 — Reorganized app/pages under `src/portal/pages/*`; fixed Back to Portal links across pages.
- 2025-10-31 — Ported `about.html` → `src/portal/pages/about/index.html`; inlined Errl face SVG with glimmer animation.
- 2025-10-31 — Set scripts to `type="module"` and added `file://` fallback in `src/index.html` to load classic scripts when opened directly.
- 2025-10-31 — Created `src/portal/index.html` redirect and quick links.
- 2025-10-31 — Fixed Pin Designer nav link to About page.
