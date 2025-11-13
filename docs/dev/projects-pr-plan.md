# PR Plan — Projects Effects

## Scope
- Add five standalone effects (standalone HTML + portal variants)
- Add Studio wrappers and /studio/projects
- Reduced-motion, DPR-aware canvases
- Sparkle Worklet fallback for non-Chromium/file://

## Checklist
- [x] Typecheck: `npm run typecheck`
- [x] Tests: `npm test` (Playwright)
- [x] Build: `npm run portal:build`
- [x] Docs: READMEs per effect, `docs/dev/projects-effects-overview.md`, `docs/dev/projects-test-matrix.md`
- [x] Studio integration: router + hub card

## Caveats
- Sparkle worklet may be blocked on file://; fallback is automatic
- Wrappers are single-instance (fixed ids). Multi-instance requires ref-scoped init

## Commit suggestion
```
feat(projects): add 5 standalone effects + Studio wrappers, reduced-motion, worklet fallbacks

- Gravity Sticker Field, Ripple Face, Sparkle Worklet Pin, Bubble Mouse Trail, Holographic Cursor Trail
- Standalone HTML pages and portal variants under public/apps/projects
- Studio React wrappers and /studio/projects route
- Reduced-motion across all, DPR-aware canvases, visibility guards
- CSS Paint Worklet fallback for non-Chromium/file://
- Docs: READMEs, overview, test matrix
```

## Verify before push
```
npm run typecheck && npm test && npm run portal:build
```
