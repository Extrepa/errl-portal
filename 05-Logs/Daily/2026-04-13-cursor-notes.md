# Cursor notes — 2026-04-13

## Legacy Safari (pre–iOS 10.3) portal bubbles

- Added `public/legacy/portal-legacy-bootstrap.js` (ES5, `nomodule`) to run the nav orbit `requestAnimationFrame` loop when `type="module"` scripts are ignored; sets `html.portal-legacy`.
- Added `src/apps/landing/styles/portal-legacy.css` and pulled it into the main stylesheet via `@import` in `styles.css` so production bundles include the rules (Vite was dropping a standalone `<link>` from processed HTML).
- Wired `nomodule` script in `src/index.html`; set `publicDir: resolve(__dirname, 'public')` in `vite.config.ts` so repo-root `public/` (including `legacy/`) is emitted to `dist/` despite `root: 'src'`.
- Legacy CSS: simpler bubble fill (no `conic-gradient` / `clamp`), `mix-blend-mode: normal`, hide `#bgParticles`, `#riseBubbles`, `#errlWebGL`; force `.label` opacity so nav text is visible without keyframe animations.

Smoke: `npx vite build` — `dist/legacy/portal-legacy-bootstrap.js` present; `portal-legacy` rules appear at start of hashed `main-*.css`.

## Old Safari (iOS 10.3–12) — transpile + subpages

- **`vite.config.ts`**: `build.target: 'safari12'` so optional chaining is lowered in portal `main-*` and static-page module chunks (fixes dead JS when `nomodule` is skipped).
- **`portal-legacy.css`**: `transform: translate(-50%, -50%)` on legacy bubbles so `left`/`top` match portal-app center convention without wobble keyframes.
- **`about/index.html`**: `IntersectionObserver` feature-detect; show-all `.is-visible` fallback; toast `maxWidth` via `Math.min(window.innerWidth * 0.92, 520)`; template strings for drip scroll swapped for concatenation in that loop.
- **Toast `maxWidth`**: same `Math.min` pattern in `src/index.html`, `gallery`, `design`, `studio`, `assets` (avoids CSS `min()` in inline styles on old WebKit).
- **`errlPortalHeader.css`**: `inset` → `top/right/bottom/left` on `.errl-bubble-btn::before`; compact home button `inline-grid`/`place-items` → `inline-flex` + centering; `@supports` fallbacks for missing `clamp()` / `aspect-ratio` on nav pills.

Verify: `npx vite build` OK; `grep '\\?\\.' dist/assets/main-*.js` has no hits on latest main chunk.

## Plan summary (architecture)

| Track | Audience | Mechanism |
|-------|----------|-----------|
| A | Pre–ES modules (pre–iOS 10.3) | `nomodule` [`public/legacy/portal-legacy-bootstrap.js`](../../public/legacy/portal-legacy-bootstrap.js) + `html.portal-legacy` styles via [`portal-legacy.css`](../../src/apps/landing/styles/portal-legacy.css) (`@import` in [`styles.css`](../../src/apps/landing/styles/styles.css)). Repo [`public/`](../../public/) wired via `publicDir` in [`vite.config.ts`](../../vite.config.ts). |
| B | iOS 10.3–12 (modules, no `?.`) | `build.target: 'safari12'` in [`vite.config.ts`](../../vite.config.ts) so Vite lowers modern syntax in **all** multi-page chunks (home `main-*`, gallery/design/studio modules, etc.). |

**Subpages:** [`errlPortalHeader.css`](../../src/shared/styles/errlPortalHeader.css) fallbacks (`inset` → TRBL, `clamp`/`aspect-ratio` `@supports`, flex for compact home). About: safe `IntersectionObserver` + toast width via `Math.min`. Toasts on home/assets/gallery/design/studio: same `Math.min` for max width (avoid CSS `min()` in inline styles).

**False positive:** Minified `on ? 0.2 : 0` can look like `on?.2:0` in grep (ternary + numeric `.2`, not optional chaining).

**Deploy:** Push to `main` runs [`.github/workflows/deploy-cloudflare.yml`](../../.github/workflows/deploy-cloudflare.yml) (Cloudflare Pages, `npm run portal:build`, `dist/`).
