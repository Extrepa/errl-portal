# Cursor notes — 2026-06-05

## Live site visual fixes (plan: live_site_visual_fixes)

### P0 fixes shipped in this commit
- **Metaball lab route:** `vite.config.ts` merges `landing/fx` into `dist/fx` without wiping static `metaball-lab`; `_redirects` SPA rule added.
- **Mobile DOM nav:** tighter orbit scale, all bubbles front orbit ≤480px, smaller bubbles, labels always visible.
- **Scene3d labels:** mobile CSS + closer Html positions in `MetaballNavCanvas`.
- **Phone discoverability:** long-press hint visible while phone hidden; hidden on `?dev=1` / unlock; copy updated in `index.html`.
- **About hero:** hero visible above fold on mobile (no fade-in delay on hero).

### Tests added
- `tests/build-output.spec.ts` — asserts `dist/fx/metaball-lab/index.html`
- `tests/live-visual-audit.spec.ts` — mobile nav, scene3d labels, metaball lab, phone hint, about hero
- `tests/visual-regression.spec.ts` — snapshots for landing mobile, scene3d, metaball lab

### Verification
- `npm run typecheck` + `npm run portal:build` OK; `dist/fx/metaball-lab/index.html` present
- Playwright: build-output + live-visual-audit (7/7), visual regression snapshots (3/3)
- Deployed **`02ef59f`** to errl.wtf; production re-audit: `/fx/metaball-lab/` title "Metaball Lab | Errl FX", `#metaball-lab-root` present

### Re-verify pass (2026-06-06, commit `00f2321`)
- Local: typecheck + portal:build OK; build-output (1/1); live-visual-audit (6/6); visual-regression (3/3); phone+scene specs (32 passed, 6 skipped)
- Production: curl metaball-lab + phone hint OK; live-visual-audit (6/6); smoke (1/1)
- Manual 390px: about hero, studio hub, gallery placeholder, dev nav (4 labels), metaball lab shell all OK
