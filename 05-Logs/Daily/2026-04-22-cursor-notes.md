## Cursor Notes - 2026-04-22

- Implemented Errl Phone minimized CTA polish with visible `Customize` label, larger touch target, and glow/pulse animations.
- Added reduced-motion safeguards for minimized CTA animations (`body.reduced-motion` and `prefers-reduced-motion`).
- Improved tab accessibility wiring with `tablist/tab` roles, `aria-selected`, `tabindex`, and arrow/Home/End keyboard navigation.
- Guarded legacy Nav Goo bindings when old controls are absent to avoid dead-path behavior.
- Bootstrapped colorizer designer bindings at load so Pin action buttons can work before modal-open flow.
- Hardened rising bubbles touch interactions with explicit canvas touch-action/user-select setup and pointer fallback release handling.
- Tuned mobile panel sizing/row spacing for narrow viewports and added touch overscroll guard class.
- Updated Playwright coverage for minimized CTA behavior, reduced-motion behavior, pin button binding readiness, tab semantics, and iOS-like viewport sanity.
- Added RB interaction mode selector (`Classic Throw` vs `Pop Mode`) with mutually exclusive control behavior and mode status text.
- Added quick presets (`Clean`, `Epic`, `Trippy`) to apply coordinated multi-tab control values and persist last-used preset.
- Added nav bubble skin controls: preset selector, apply/reset actions, and upload support for custom image/GIF skins.
- Added pin action helper guidance text updates to make Inject/Save/Reset intent more obvious.
- Upgraded RB Pop Mode to real behavior in the Three.js layer (tap-to-pop flow) and exposed small diagnostics (`getStats`, `popAnyVisible`) for test verification.
- Added RB pop event pipeline (`errl:rb-pop`) feeding subtle flash overlay and short pop ping (honors existing audio enable/master controls).

### Next phases (this session)

- **2A Nav:** `data-nav-bubble-key` on each nav bubble; `navSkinTarget` (all vs one); bundle `nav.skinMode` + `nav.bubbleSkins`; `paintNavSkins` + `errlGLSetOrbTexture` per orb; image dimension cap (2048px); curated packs from `src/apps/landing/config/nav-skin-packs.json`.
- **2B RB pop:** Pointer `clientX/Y` on `errl:rb-pop`; optional 2D shard canvas (skipped for `prefReduce` / `prefers-reduced-motion` and `body.perf-safe`); mode legend copy; `?debug=1` logs `popCount`.
- **2C Presets:** Three HUD “My presets” slots (save/apply/clear) stored in `bundle.customPresets` with RB + Hue + Nav + UI snapshot restore.
- **3 Perf / a11y:** `applyBundle` calls `__errlRefreshNavSkins`; hue Playwright scroll fix; `navSkinTarget` `aria-label`; import bundle keeps `customPresets` + merged `nav`.
- **4 Content:** Pin dismissible tour banner; HUD “Scene tint (WebGL)” mood buttons wired to `errlGLSetMood`.

### Continue (follow-up)

- RB pop **shard** skipped while `body.rb-touch-active` (touch drag on canvas) to avoid extra paint during scroll/gesture.
- Nav **skin packs** JSON supports optional **`thumb`** URL; chips always show a **CSS gradient preview** (`::before`) unless a real `<img.thumb>` loads.
- Playwright: **per-bubble nav survives reload**; pack strip **preview chips** smoke (`data-pack` buttons).

### Pre-ship check (this session)

- `npx playwright test tests/errl-phone-controls.spec.ts`: **23 passed** (full file).
- Relaxed **`@ui tabs have square aspect ratio`** in `errl-phone.spec.ts` to assert non-zero size + rounded corners + flex (avoids brittle pixel-perfect square in grid+label layout).
- Before commit: include `src/apps/landing/config/nav-skin-packs.json`; exclude ad-hoc `SCREENSHOT April/` unless you intend to version those assets.

### Errl Phone reliability + UX (this pass)

- **WebGL init race:** `errlGLBurst`, `errlGLSetBubbles`, `errlGLSetGoo`, `errlGLSetMood`, `errlGLSetOverlay`, and `errlGLShowOrbs` now use pending queues until the Errl texture `img.onload` finishes (`webgl.js`). Fires `errl:webgl-ready` and sets `window.errlGLLoaded` when ready. Burst no longer no-ops on the first click.
- **HUD feedback:** `errl:webgl-unavailable` / `errl:webgl-error` show a short line in `#errlGlHint` (portal-app).
- **A11y labels:** `sliderRow--a11y` on Reduced Motion / High Contrast / Invert rows so text is not ellipsized.
- **CTA:** Larger `Customize` under the minimized fab; `margin-bottom` on minimized panel; one-time hint `#errlPhoneCtaHint` (dismiss + opening phone clears; respects reduced motion).
- **Pin:** tour copy as bullet list; `?` button to re-show; dismiss key `errl_pin_tour_dismissed_v2` (shows new copy once for returning users who only had v1).
- **Copy:** RB / GLB / BG tabs: clearer separation (RB vs GLB), BG shimmer/vignette vs GL overlay, GLB + Hue "Particles" cross-reference.
- **Motion:** `#errlIdleStreak` rare CSS streak (disabled for reduced motion).
- **GL helpers:** `setBubs` / `rotateSkins` / `glbRandom` / `navRandom` call `enableErrlGL` where relevant.
- **Playwright:** Burst waits for `PIXI` + `enableErrlGL` + `errl:webgl-ready` (with timeout); a11y label test; CTA node smoke. Full file can hit `ERR_CONNECTION_REFUSED` if the dev server drops mid-run; re-run.
- **Deploy (manual):** After merge, deploy to production and spot-check that `errl.wtf` matches this branch.

### Documentation (wrap-up)

- **Reference:** [docs/reference/errl-phone-capabilities.md](../../docs/reference/errl-phone-capabilities.md) — durable guide: layer model (RB / GLB / BG / overlay), `webgl.js` queue + `errl:webgl-ready` / `errlGLLoaded`, localStorage keys (`errl_phone_cta_dismissed_v1`, `errl_pin_tour_dismissed_v2`), new DOM ids, test file pointer, and future extension ideas.
- **Index:** Linked from [docs/reference/README.md](../../docs/reference/README.md) and root [README.md](../../README.md) under Documentation.

### Portal nav / Design visibility / forum header (2026-04-22)

- `errl_portal_show_design_nav` in `localStorage` (default off): `html[data-errl-hide-design-nav]` + Errl Phone DEV **Show Design in navigation**; `window.__errlGetVisibleNavBubbles`, WebGL `errlGLRebuildNavOrbs`, skin/hover use visible orbs only.
- Shared [errlPortalHeader.css](src/shared/styles/errlPortalHeader.css) restyled to forum-like dark/cyan shell; studio `portal-header.css` imports it; [portal-nav-visibility.mjs](src/shared/scripts/portal-nav-visibility.mjs) for static subpages; `PortalHeader.tsx` filters Design by the same key.
- Playwright: `errl-phone-controls` test for default-hidden Design and toggle.

### Wrap-up (merge to main, docs, branches)

- **Reference:** [docs/reference/portal-nav-and-design-visibility.md](docs/reference/portal-nav-and-design-visibility.md) — behavior, code map, tests, admin note; linked from [docs/reference/README.md](docs/reference/README.md).
- **Deploy:** Changes committed and **pushed to `origin/main`**; production follows your usual path (e.g. Cloudflare Pages) from `main`.
- **Other branches:** Local only-not-merged-into-`main` (backups / old work): `archive/legacy-kits`, `backup/pre-push-2025-11-12*`, `checkpoint/20251111-015458`, `erc-20251030-082458`, `feature/bubble-labels-and-phone-face`. **Not** merged (would risk regressions); `main` is the shipped line. Delete or keep as archives as you prefer.
- **Pre-ship test:** `npx playwright test tests/errl-phone-controls.spec.ts -g "Design nav"` — 1 passed (wrap-up run).
- **Production check:** Fetched `https://errl.wtf` (2026-04-22): home page and nav content load; site is publicly reachable.

### Testing workflow: deploy-first, no heavy local E2E

- **`precommit`:** `typecheck` + `portal:build` only (full `npm test` / Playwright removed from pre-commit; use CI or a deliberate command).
- **`postinstall`:** `SKIP_PLAYWRIGHT_INSTALL=1` skips `playwright install` to speed local `npm install`.
- **Remote Playwright:** `playwright.config.ts` reads `PLAYWRIGHT_BASE_URL`; if set, Vite `webServer` is not started. `npm run test:smoke:prod` runs `tests/production-smoke.spec.ts` against `https://errl.wtf` (or set `PLAYWRIGHT_BASE_URL` for another URL). Optional GitHub Action: copy [tools/portal/playwright-against-prod.workflow.yml](../tools/portal/playwright-against-prod.workflow.yml) to `.github/workflows/` (push needs `workflow` scope, or add via GitHub web UI), then **Run workflow**; hits production URL, Chromium only.
- **Human verification:** After deploy, open the site in a normal browser (or Cursor’s browser / MCP) and spot-check what changed; the automated smoke is a small safety net, not a full duplicate of the old 40+ file suite.
- **Verify (proceed):** `npm run typecheck` + `npm run portal:build` both exit 0; `npm run test:smoke:prod` (against `https://errl.wtf`) **1 passed** in ~3s.
- **Shipped to `main`:** Pushed `e39b5e4` to `origin/main` (portal polish + tests + `tools/portal/playwright-against-prod.workflow.yml`). Cloudflare Pages should build from `main` per [`.github/workflows/deploy-cloudflare.yml`](../.github/workflows/deploy-cloudflare.yml). If you want the optional Playwright **GitHub Action** in the UI, copy `tools/portal/playwright-against-prod.workflow.yml` → `.github/workflows/playwright-against-prod.yml` in a normal `git push` (token with `workflow` scope) or add the file in the GitHub web editor.
- **Proceed (this turn):** Created `.github/workflows/playwright-against-prod.yml` locally and attempted `git push`; **GitHub rejected** the push (`refusing to allow an OAuth App to create or update workflow ... without 'workflow' scope`). **Dropped the local commit** (`git reset --hard`); the workflow is **not** on `main`. The canonical copy remains [tools/portal/playwright-against-prod.workflow.yml](../tools/portal/playwright-against-prod.workflow.yml) until you add it via web UI or a credential with `workflow` scope.

### Errl Phone: mobile/desktop, size, labels, scroll (this session)

- **CSS:** `#errlPanel` / `.errl-panel` uses `--phone-user-scale` multiplied into width/height with `.minimized` forcing scale via cleared inline + `--phone-user-scale: 1`; **max-width/height** on non-minimized (desktop cap + mobile **~55vh** and safe-area); two-line **tab** layout; **`.panel-tab-intro`** and **coarse pointer** / mobile touch target tweaks; **`errlPhonePanelSize`** (S/M/L) label styling.
- **JS:** `activateTab` and restore path reset **`.panel-content-wrapper` scroll** to top and hide `#panelScrollTop`; **S/M/L** range updates `--phone-user-scale`, label, `localStorage` `errl_phone_size_v1`, merges with settings bundle; **self-heal** if expanded panel is tiny; **`errl-panel--coarse`** class on narrow/coarse viewports; reset defaults and repo **`errl-defaults.json`** include **`errlPhonePanelSize`: `"1"**.
- **Tests:** Phone tab strips use **`role="tab"`** in markup; Playwright selectors updated from **`getByRole('button')` to `getByRole('tab')`** (Format HTML in studio left as `button`); **“all tabs”** test uses **`data-tab`** for all 9 keys; **scrollIntoViewIfNeeded** where capped panel height hides controls.
- **Process guardrail:** In this workspace/session, do **not** run Playwright or make Playwright-test changes unless explicitly requested first by the user.
- **Secret reset flow:** Added guarded global key handler in `portal-app.js`: triple `Enter` (outside editable fields) opens a command prompt; typing exact lowercase `errl` and pressing Enter routes through `requestResetDefaults('secret')`, which confirms before calling `resetDefaults()`. Reset button now uses the same wrapper with in-flight guard so full reset behavior stays single-path and extensible for future easter-egg commands.
