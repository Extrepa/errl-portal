# Shipped HTML routes (inventory)

Source: [vite.config.ts](../../vite.config.ts) `build.rollupOptions.input` + dev middleware rewrites (`/about|gallery|assets|games|studio|design|pin-designer...` → `/apps/static/pages/...`).

| Route | Build input | Notes |
|-------|-------------|-------|
| `/` | `main` → `src/index.html` | Main portal + phone |
| `/apps/static/pages/index.html` | `index` | Static hub |
| `/about/` | `about/index` | Section page |
| `/gallery/` | `gallery/index` | Section page |
| `/assets/` | `assets/index` | Section page |
| `/assets/errl-head-coin/` … | asset inputs | Demos |
| `/design/` | `design/index` | Section page |
| `/studio/` | `studio/index` | Section page |
| `/studio/svg-colorer/` | `studio/svg-colorer/index` | |
| `/studio/limewire-simulator/` | `studio/limewire-simulator/index` | |
| `/studio/pin-widget/ErrlPin.Widget/designer` | designer html | |
| `/pin-designer/` | `pin-designer/index` | |
| `/pin-designer-face-only/` | `pin-designer-face-only/index` | |
| `/chat` | `chat` | Chatbot |
| `/fx/hue-examples` | `fx/hue-examples` | FX demo |
| `/designer` | separate vite.designer.config.ts (verify) | Designer app |

**Consistency checklist (each section page):**

- [x] `errlDesignSystem.css` + `errlPortalHeader.css` + `errlStaticPage.css` (where the static shell applies)
- [x] Nav order: About Errl, Assets, Design (gated), Forum, Gallery, Studio — same `data-portal-link` / disabled Design pattern as main portal
- [x] Active route: `aria-current="page"` (and/or `.active`) on current section where a nav item exists
- [x] `data-errl-hide-design-nav` bootstrap script in `<head>` (section pages)
- [x] Title pattern: e.g. `Page | Errl Portal` on updated pages

Non-goals: `archive/`, ad-hoc demos not in rollup input unless manually maintained.
