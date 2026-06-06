# Static experiments & legacy pages

**Last updated:** 2026-06-06  
**Purpose:** Clarify which static HTML under `src/apps/static/` is **not** part of the cinematic landing product.

These pages are built and deployed, but they are reference labs, demos, or legacy content — not the core `/` experience.

---

## Shape Madness lab

**Path:** `src/apps/static/pages/studio/shape-madness/`  
**URL:** `/studio/shape-madness/` (and nested content paths)

| Subpath | Contents |
|---------|----------|
| `content/css-examples/` | 60+ standalone CSS/HTML effect examples (`example-01-…` through `example-60-…`) |
| `content/errl *.html` | Early Errl shape experiments |
| `content/*/minimal.html`, `remix.html` | Themed mini-demos (chroma-bloom, quantum-slime-halo, etc.) |

**Build:** Vite copies `content/` to `dist/studio/shape-madness/content` via `copyShapeMadnessContentPlugin` in `vite.config.ts`.

**When to touch:** Adding new CSS demos, studio gallery links, or pruning unused examples. Do **not** confuse with landing scene code in `src/apps/landing/scene/`.

---

## Other static pages (non-core)

| Path | URL | Role |
|------|-----|------|
| `static/pages/fx/metaball-lab/` | `/fx/metaball-lab/` | Shader lab — **related** to landing metaball nav but isolated entry |
| `static/pages/studio/svg-colorer/` | `/studio/svg-colorer/` | SVG color tool |
| `static/pages/studio/limewire-simulator/` | `/studio/limewire-simulator/` | Nostalgia demo |
| `static/pages/games/` | `/games/` | Unity game embeds (external build copy) |
| `static/pages/assets/` | `/assets/` | Asset browser |
| `static/pages/about/` | `/about/` | About copy + Lenis scroll |
| `static/pages/gallery/` | `/gallery/` | Gallery shell; R3F work also in `src/apps/gallery/` |

---

## React apps (separate Vite entries)

These are **apps**, not static HTML dumps:

| App | Config | URL |
|-----|--------|-----|
| Studio | `vite.studio.config.ts` | `/studio/` (React router) |
| Designer | `vite.designer.config.ts` | `/designer` |
| Chatbot | portal rewrite | `/chat` |
| Landing scene | `src/index.html` + `src/apps/landing/scene/` | `/` |

---

## Cleanup guidance

- **Safe to archive:** Individual shape-madness examples with no inbound links — move to `archive/` after checking `rg example-XX` for references.
- **Keep in repo:** Anything linked from Studio nav, tests, or manifests.
- **Do not delete** the whole `shape-madness/` tree without updating `vite.config.ts` copy plugin and Studio routes.

See also: [PROJECT_STATUS.md](../PROJECT_STATUS.md), [cinematic-scene-master-plan.md](../cinematic-scene-master-plan.md).
