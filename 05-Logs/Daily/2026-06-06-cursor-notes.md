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
