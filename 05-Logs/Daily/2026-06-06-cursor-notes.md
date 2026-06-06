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
