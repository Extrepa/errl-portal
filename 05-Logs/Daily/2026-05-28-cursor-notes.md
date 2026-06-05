# 2026-05-28 — ERRL cinematic redesign implementation

## Shipped

- **Phase 1:** 4-bubble nav (Forum, About, Gallery, Studio) on landing + static headers + Studio `PortalHeader`; score HUD and classic goals removed; RB default `ambient`; Errl Phone hidden unless `?dev=1` or 2s long-press on Errl.
- **Phase 2:** React scene island (`src/apps/landing/scene/`) with arrival + ENTER + GSAP transition; `?skipIntro=1` for tests/return visits.
- **Phase 3:** SDF metaball lab at `/fx/metaball-lab/`; optional `?scene3d=1` R3F nav overlay.
- **Phase 4:** Lenis on About via `about-scroll.mjs`; `ScrollDirector` stub for homepage virtual scroll.
- **Cross-cutting:** `scene/quality.ts` tiers; darker landing base; About lore copy; gallery architecture doc.

## Deps added

`three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `lenis`

## Test notes

- Landing tests should use `gotoPortalLanding()` (`?dev=1&skipIntro=1`).
- Legacy RB score / classic-goal phone tests skipped.

## Phase 1 — Scene nav render mode (follow-up)

- Added `scene/navRenderMode.ts` + `scene/sceneTypes.ts` (`navRenderMode: dom | metaball`).
- URL `?scene3d=1` forces metaball; bundle `scene.navRenderMode` for persistence (Phase 2 UI).
- Nav tab: `#navDomControls` wrapped; `#navMetaballNotice` when metaball active.
- `nav-render-mode-phone.ts` syncs Phone Nav tab disabled state.
- `navSkinTarget` options: forum, about, gallery, studio only.
- Tests: `tests/scene-phone-controls.spec.ts`.

## Phase 2–3 — Scene control bus + Phone Scene tab

- `scene/bridge/sceneControls.ts`: `window.errlSceneControls`, `errl:scene-controls-changed`, `bundle.scene` read/write.
- Shader: `metaballSDF.ts` uniforms `uBall0..3`, `uMergeK`, `uGlow`, `uPointerPull`; ball positions driven from nav physics.
- Shared `scene/effects/MetaballNavCanvas.tsx` used by `NavSculptures` and `/fx/metaball-lab/`.
- `useNavPhysics` reads `sculpture.separation`, `magneticRadius`, `floatSpeed` from bus.
- Errl Phone **Scene** tab (`data-tab="scene"`) + `scene-phone-controls.ts` sliders.
- Tests: Scene tab glow + existing nav mode tests.

## Phase 4 — Scene presets

- `scene/bridge/scene-presets.ts`: Portal, Metaball, Atmospheric (scene bus + RB/BG/hue controls).
- Scene tab preset buttons + status line; `buildSceneQuery()` on `errlSceneControls`.
- Docs: `docs/reference/errl-phone-capabilities.md` Scene tab section.
- Test: atmospheric preset applies without metaball reload.

## Scroll → nav bubbles

- `scene/scroll/scrollBridge.ts`: wheel/touch → `window.errlSceneScroll` (progress, angle/radius/center offsets).
- `ScrollNavDrive` mounts in main scene phase; `portal-app.js` orbit loop + `useNavPhysics` read the bus.
- Scene tab **Scroll pull** slider; `?scrollNav=0` disables. Test: wheel changes progress.

## Branch note (user)

- No feature branch for now; keep building on current branch and document in master plan.

## Master audit doc

- **`docs/cinematic-scene-master-plan.md`** — full phase checklist, verify URLs, test status, gaps, next steps (2026-05-28).
