# Cursor notes — 2026-06-06

## Viewport nav vision restore

### DOM nav (Phase 1)
- `portal-app.js`: `getBubbleRadiusPx`, `getMinOrbitDistPx`, phone-panel dead zone, tier orbit scales, restored front/behind layering on mobile
- `styles.css`: smaller mobile Errl (52vw max 340px), `labelFadeMobile`, behind-label contrast

### Metaball parity (Phase 2)
- New `orbitLayout.ts` shared scale + anchor math
- `useNavPhysics.ts`, `MetaballNavCanvas.tsx`, `metaballSDF.ts`: unified world scale, transparent canvas, label clamp

### Subpages (Phase 3)
- `errlStaticPage.css`: flex `100dvh` layout
- About/Studio/Gallery/Design padding + centered coming-soon

### Tests
- `live-visual-audit.spec.ts`: 5 viewports + intro enter overlap + gallery scroll check (12/12 local)
- Visual regression snapshots updated

### Build fix
- `vite.config.ts`: copy `apps/landing/scripts|styles|config|fx` to dist (was deleted by reorganize plugin)
- `build-output.spec.ts`: assert `portal-app.js` + orbit helpers in dist

### Deploy verify (10934cf on errl.wtf)
- Prod `portal-app.js` serves 200 with `getMinOrbitDistPx`
- `live-visual-audit.spec.ts` 12/12 pass against https://errl.wtf

### Visual testing pass (2026-06-06)
- Local: visual-regression 7 pass + 2 customizer skipped; live-visual-audit 12/12
- Prod: same suite 17 pass / 2 skipped in 36s
- Spot-check screenshots: landing 390/1440, about/gallery/studio mobile — nav ring outside Errl, subpages fill viewport
- Fixed visual-regression portal-home tests to use skipIntro + freeze nav (was hitting arrival screen)

### Local-first testing workflow
- Default Playwright base URL: `http://127.0.0.1:5173` (no deploy needed)
- `npm run test:local` — audit + visual + build-output
- `npm run test:local:headed` — same, visible browser
- `npm run test:prod:audit` — optional post-deploy smoke only
- `bash tools/portal/local-test.sh [--headed]`

### Scene3d metaball nav fix
- Shader: transparent alpha + Errl core cutout (was opaque black fullscreen)
- Labels: screen-space overlay (R3F Html projected off-screen)
- Orbit: min/max radius from Errl bbox + viewport clamp (matches DOM)

### portal-app.js syntax fix (blocked Vite HMR)
- `syncGLNavOrbsIfDom` insertion corrupted `getActiveBubbles()` — restored function wrapper; call `window.errlGLSyncOrbs()` instead of self-recursion
- `node --check` OK; dev server loads; live-visual-audit 12/12 pass

### Scene3d label + metaball alignment
- Labels projected via R3F camera (`size / dpr` CSS pixels), not linear orbitNormToScreen
- Shader FOV matched to camera (`uTanHalfFov`); Errl cutout tracks `#errl` bbox
- Labels restyled text-only (no menuOrb chrome); clamped to viewport on mobile
- Mobile orbit scale tightened; GL orbs hidden on `errl:webgl-ready` in metaball mode

### Scene3d rewrite — pixel orbit + colored screen-space metaballs
- Orbit now uses **same px math as DOM** `placeBubble` (Errl center + angle/dist in pixels)
- Shader switched to **2D screen-space SDF** — ball UV from label px, no perspective mismatch
- Per-nav colors from `navConfig` (forum blue, about purple, gallery pink, studio green)
- Labels share exact px coords with shader balls
- Disabled `EffectComposer` (was stalling R3F `useFrame` on desktop widths)

### DOM-first metaball nav (ground-up rebuild)
- New `MetaballNavLinks.tsx`: each link = colored CSS orb + label in one `<a>`, single rAF physics loop
- Landing uses `MetaballNavLinks`; WebGL `MetaballNavCanvas` kept for metaball lab only
- `#riseBubbles` hidden entirely in metaball mode
- Verify: build OK; audit 12/12; browser shows 4 colored orbs with centered labels orbiting Errl

### Agent handoff documentation
- `docs/scene3d-nav-agent-handoff.md` — full vision, architecture, failures, file map, agent checklist
- `.cursor/plans/scene3d-nav-handoff.md` — short pointer for Cursor agents
- Updated `docs/cinematic-scene-master-plan.md` for DOM-first metaball nav
- `updateBubbles()` early-returns when `errl-nav-mode-metaball` — DOM orbit loop no longer fights scene3d physics
- `scene-controls-init.ts` applies nav render mode synchronously on load (before `portal-app.js`)
- `#navOrbit` / `#navOrbitBehind` hidden via `visibility:hidden` in metaball mode
- `webgl.js`: `buildOrbs` / `syncOrbsPositions` / `errlGLShowOrbs` / rebuild guarded — Pixi GL orbs stay off
- `glOrbsToggle` + debug harness orb flag ignored in metaball mode
- Verify: `npm run build` OK; `test:local:audit` 12/12 pass @ 127.0.0.1:5173

### Boot shell — first-paint flash fix
- New `boot-shell.js` runs synchronously as first `<body>` child; sets `errl-phone-hidden`, nav mode, and scene phase before chrome paints
- `dev-phone-unlock.js` moved after boot shell; long-press unlock only (no head-time body mutation)
- `arrival.css`: hide `#navOrbit` / `#errlPanel` by default; reveal on `errl-scene-main.errl-nav-mode-dom` / `errl-phone-unlocked`
- `MetaballNavLinks.tsx`: `errl-metaball-link--ready` class instead of inline visibility
- Tests: boot-shell panel hidden + scene3d legacy nav hidden; responsive/performance use `gotoPortalLanding`
- `portal-app.js`: Scene tab in `TAB_HELP_SUMMARIES`
- Verify: `test:local` 22/23 pass (metaball-lab snapshot 1% drift pre-existing); scene-phone 8/8; build includes `boot-shell.js`
