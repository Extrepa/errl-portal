# 2026-06-05 — Errl.wtf launch execution

## Production baseline (pre-launch)

- Live [https://errl.wtf](https://errl.wtf) matched committed `574053f` (score HUD in HTML, no scene island).
- GitHub Actions deploy step failing since April (Cloudflare API auth 9106); **Cloudflare Pages Git integration** is the active deploy path.

## Shipped

- Commit `1f8ce18`: cinematic scene, Scene tab, metaball nav, scroll bus, phone unlock, metaball lab, docs.
- Production updated ~3 min after push (verified via curl: `errl-scene-root`, `dev-phone-unlock.js`, no `rbCollectScoreWrap`).
- Routes verified: `/`, `/fx/metaball-lab/` (200), `/studio` (308).

## Local verification

- `npm run typecheck` — pass (fixed scene-presets/sceneControls/MetaballNavCanvas TS errors).
- `npm run portal:build` — pass; `dist/_redirects` present.
- Playwright: scene + phone + nav suites — 43 passed, 6 skipped (pop/score tests).

## Post-launch P1 (same session)

- `?scenePreset=` URL hydration in `scene-controls-init.ts`.
- Scene tab **Copy scene link** button.
- Phone panel `recoverCorruptedPanelSize()` guard in `portal-app.js`.
- `home-page-verification.test.ts` uses `gotoPortalLanding()` + Scene tab (10 tabs).
- Workflow CI split (build on push, deploy manual only) — local change; push blocked without `workflow` OAuth scope.

## Deploy notes

- `npm run test:smoke:prod` needs Playwright browsers installed in CI/sandbox (`npx playwright install`).
- To fix GitHub Actions deploy: rotate `CLOUDFLARE_API_TOKEN` per `docs/internal/implementation/FIX_CLOUDFLARE_AUTH.md`.
- Purge Cloudflare cache if stale bundles appear after deploy.

## Commit SHAs

- Launch: `1f8ce18`
- P1 follow-up: `3df6331`
