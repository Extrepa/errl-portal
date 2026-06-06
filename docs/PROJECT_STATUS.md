# Errl Portal — Project Status

**Last updated:** 2026-06-06  
**Purpose:** Single entry point for what is live, what is in progress, and what is legacy.

---

## Live routes (product spine)

| Route | What it is | Code |
|-------|------------|------|
| `/` | Cinematic landing — arrival, metaball nav, Errl Phone (dev/long-press) | `src/apps/landing/scene/`, `src/index.html` |
| `/?skipIntro=1` | Skip arrival overlay | `App.tsx` |
| `/?dev=1&skipIntro=1` | Phone available without long-press | `dev-phone-unlock.js` |
| `/fx/metaball-lab/` | Isolated metaball shader lab | `src/apps/static/pages/fx/metaball-lab/` |
| `/gallery/` | Floating hall R3F spike (in progress) | `src/apps/gallery/`, `src/apps/static/pages/gallery/` |
| `/about/` | About page + Lenis scroll | `src/apps/static/pages/about/` |
| `/studio/` | Studio hub (static + React app) | `src/apps/studio/`, `src/apps/static/pages/studio/` |
| `/designer` | Design tool (separate Vite app) | `src/apps/designer/` |
| `/chat` | Chatbot UI | `src/apps/chatbot/` |
| `/games/` | Unity game embeds (build-time copy) | `src/apps/static/pages/games/` |

**Quick verify:** see the table in [cinematic-scene-master-plan.md](./cinematic-scene-master-plan.md#how-to-verify-quickly).

---

## Active work (June 2026)

1. **Scene3D / metaball nav** — scroll-driven orbit, Scene tab presets, URL hydration  
   - Master plan: [cinematic-scene-master-plan.md](./cinematic-scene-master-plan.md)  
   - Agent handoff: [scene3d-nav-agent-handoff.md](./scene3d-nav-agent-handoff.md)

2. **Gallery floating hall** — manifest-driven R3F frames at `/gallery/`  
   - Architecture: [gallery-immersive-architecture.md](./gallery-immersive-architecture.md) (if present)

3. **Errl Phone UX** — panel sizing, tab behavior  
   - Plan: `.cursor/plans/errl-phone-panel-ux.md`

---

## Frozen / legacy (not part of landing scene)

| Area | Notes |
|------|--------|
| `src/apps/static/pages/studio/shape-madness/` | CSS/HTML experiment lab — 60+ examples; shipped but not core portal | See [reference/static-experiments.md](./reference/static-experiments.md) |
| Pixi nav mirror orbs | Guarded/hidden in metaball mode; legacy WebGL in `webgl.js` |
| Score HUD / RB score tests | HUD removed; reducer still in `portal-app.js` |
| `archive/legacy/`, `archive/legacy-portal-pages-backup/` | Old HTML pages — reference only |
| `archive/component-rips-20251112/` | Component rip HTML backups |

Large backups (`site-trim-20251222`, `docs-site-20251031`, `snapshots/`) are **gitignored** — keep locally or in a separate archive repo.

---

## Known gaps

| Item | Priority | Location |
|------|----------|----------|
| Paper.js utilities are placeholders | High (designer) | `src/shared/utils/paper.ts` |
| Keyboard shortcuts hook incomplete | High (designer) | `src/shared/hooks/index.ts` |
| `portal-app` bundle sync for Scene tab sliders | Medium | `scene-phone-controls.ts` |
| Lazy-load Three/R3F chunk (~1.1MB metaball) | Medium | `MetaballNavCanvas.tsx` |
| Full Playwright suite green | Medium | `tests/` — run before deploy |

Details: [internal/implementation/audit-incomplete-tasks.md](./internal/implementation/audit-incomplete-tasks.md)

---

## Build & test

```bash
npm run dev              # Portal (Vite)
npm run portal:build     # Production build (+ designer)
npm run studio:dev       # Studio app
npm run typecheck
npm run test             # Full Playwright
npm run portal:doctor:structure
```

Focused scene tests: `npx playwright test tests/scene-phone-controls.spec.ts` — **8/8 pass** (2026-06-06 cleanup baseline)

---

## Documentation map

| Doc | Role |
|-----|------|
| **This file** | North star — routes, active work, legacy, gaps |
| [cinematic-scene-master-plan.md](./cinematic-scene-master-plan.md) | Landing scene audit + roadmap |
| [reference/errl-phone-capabilities.md](./reference/errl-phone-capabilities.md) | Phone tabs, layers, events |
| [reference/static-experiments.md](./reference/static-experiments.md) | Non-core static pages |
| [effects-master-reference.md](./effects-master-reference.md) | FX systems reference |
| [deployment/cloudflare-setup.md](./deployment/cloudflare-setup.md) | Deploy |
| [internal/](./internal/) | Historical verification, deployment logs, session notes |
| [archive/](./archive/) | Archived completed docs (verification, deployment, testing) |
| [active/README.md](./active/README.md) | Index of current vs archived docs |

---

## Repo layout

```
src/apps/
  landing/    ← cinematic scene (primary product)
  studio/     ← React studio (vite.studio.config.ts)
  designer/   ← design tool (vite.designer.config.ts)
  chatbot/
  gallery/    ← R3F spike
  static/     ← HTML pages (about, games, shape-madness, …)
src/shared/   ← assets, scripts, hooks
docs/         ← you are here
archive/      ← code backups (small); large backups gitignored
05-Logs/      ← daily cursor notes
tests/        ← Playwright
tools/portal/ ← doctor scripts, manifests
```
