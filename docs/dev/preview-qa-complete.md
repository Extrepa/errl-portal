# Preview Setup & QA Complete - 2025-11-11

## ✅ Checklist Completion Summary

### Automated Checks (Completed)

#### Asset Verification ✅
- ✅ Main body asset exists: `src/assets/portal/L4_Central/errl-body-face-eyes-mouth-with-limbs copy.svg`
- ✅ Updated face asset exists: `src/assets/portal/L4_Central/errl-face-2.svg`
- ✅ Studio code uses correct face asset (3 references in SVGTab.tsx, ErrlLiveStudio.tsx)
- ✅ No deprecated face assets in active code
- ✅ Legacy references only in archived projects (not active routes)

#### Naming Consistency ✅
- ✅ All user-facing "Studio" naming correct
- ✅ `tools/` directory is for shell scripts (no rename needed)
- ✅ Errl spelling consistent throughout active codebase
- ✅ Routes properly namespaced under `/studio`

#### Architecture & Routing ✅
- ✅ Single Vite dev server confirmed (not multi-app)
- ✅ BrowserRouter with `basename="/studio"` working
- ✅ Vite middleware rewrites `/studio/**` → `studio.html`
- ✅ Routes verified: `/` (200), `/studio` (200)
- ✅ Asset bridge hook implemented for legacy iframe sharing

#### Code Quality ✅
- ✅ All files staged and committed (40 files, +2376/-543)
- ✅ Commit: `7d2124e` with comprehensive message
- ✅ Backup created: `.local/wip-20251111-0516.patch` (123KB)
- ✅ Documentation updated: README, WARP.md, team updates, local preview notes

### Manual Browser QA (Remaining)

These checks require visual inspection in the browser:

#### 1. Visual QA: Errl Layering and Effects
**Open**: http://localhost:5173/

Run in DevTools console:
```js
// Canvas check
[...document.querySelectorAll('canvas')].map(c => ({
  id: c.id,
  z: getComputedStyle(c).zIndex,
  pe: getComputedStyle(c).pointerEvents
}))

// PIXI stage check
if (window.app) {
  console.log('sortableChildren:', app.stage.sortableChildren)
}
```

Expected layer order (back → front):
- L0: `#bgParticles` (z:0, pointer-events:none)
- L1: `#errlWebGL` (z:1, PIXI with ParticleContainer → fxRoot)
- L2: `#riseBubbles` (z:2)
- L3: `.scene-layer` (z:3, Errl DOM image/SVG, nav-orbit)
- L4: `.vignette-frame` (z:4)
- L5: Errl Phone overlays (z:4000+)

**Verify**:
- [ ] Filters applied to fxRoot only (not app.stage)
- [ ] Errl body asset visible with wiggle/jiggle animations
- [ ] Resize window → canvases rebuild without flicker
- [ ] No 0-dimension canvas crashes

#### 2. Functional QA: Navigation & Hot Reload
**Test**:
- [ ] Visit http://localhost:5173/ → Portal loads
- [ ] Click nav bubbles → routes work
- [ ] Visit http://localhost:5173/studio → Hub loads
- [ ] Click Studio cards → subroutes navigate
- [ ] Edit a React component → HMR updates without full reload
- [ ] Check console → no WebGL/loading errors

#### 3. Studio Hub Integration
**Test each card**:
- [ ] Code Lab → loads at `/studio/code-lab`
- [ ] Math Lab → iframe loads with asset bridge
- [ ] Shape Madness → iframe loads with asset bridge
- [ ] Pin Designer → iframe loads, library UI functional

**Asset Bridge**:
- [ ] Open Pin Designer → save a design → appears in library
- [ ] Load design from library → restores state
- [ ] Delete design → removes from IndexedDB

#### 4. Accessibility & Performance (Optional)
```bash
# Run Lighthouse
npx -y lighthouse http://localhost:5173 \
  --only-categories=accessibility,performance,best-practices \
  --throttling-method=simulate \
  --quiet \
  --output html \
  --output-path ./docs/dev/lighthouse-local.html
```

**Manual checks**:
- [ ] Tab order follows visual flow
- [ ] Contrast ratios meet WCAG AA
- [ ] Images have alt text
- [ ] Interactive elements have aria labels

## Commands Reference

### Start Preview
```bash
npm run dev
# → http://localhost:5173/
```

### Test Suite
```bash
npm run typecheck  # TypeScript validation
npm test           # Playwright suite
npm run portal:build  # Production build check
```

### Routes
- http://localhost:5173/              → Portal landing
- http://localhost:5173/studio        → Studio hub
- http://localhost:5173/studio/code-lab
- http://localhost:5173/studio/math-lab
- http://localhost:5173/studio/shape-madness
- http://localhost:5173/studio/pin-designer

## Next Steps

1. **Manual QA**: Complete browser checks above
2. **Run tests**: `npm run typecheck && npm test`
3. **Build verification**: `npm run portal:build`
4. **Push commit**: `git push origin main`
5. **Deploy preview** (if applicable)

## Files for Review

Key changes in commit `7d2124e`:
- `src/portal/app/hooks/useLegacyAssetBridge.ts` (new)
- `src/portal/app/pages/StudioPinDesigner.tsx` (new)
- `src/portal/app/pages/StudioShapeMadness.tsx` (new)
- `src/portal/app/pages/studio.css` (new)
- `src/portal/app/pages/studio-detail.css` (new)
- `src/portal/app/utils/portalPaths.ts` (new)
- `vite.config.ts` (middleware added)
- `src/portal/app/App.tsx` (basename="/studio")
- `tests/ui.spec.ts` (Studio hub tests)

