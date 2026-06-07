# Cursor notes — 2026-06-06

## Portal header UX — full session notes (shipped, left as-is)

**Problem:** Shared portal pill header (`.errl-header`) felt obnoxiously large on all viewports — tall bar, wide nav pills, heavy shadow/borders, “Back to Portal” eating space.

**Scope:** Sticky subpage header on static HTML pages + React `PortalHeader` + `StudioShell` secondary strip. **Out of scope:** landing orb nav, gallery in-page `GalleryCollectionHeader`, studio hub hero (`.studio-header__*`).

**Reference:** Gallery view switcher ([`gallery.css`](../src/apps/gallery/gallery.css) `.gallery-view-switcher`) for final ghost-nav capsule styling. Forum alignment doc: [`docs/reference/portal-nav-and-design-visibility.md`](../docs/reference/portal-nav-and-design-visibility.md).

---

### Pass 1 — Shrink & dedupe

**Goal:** ~38px bar desktop, ~34px phone; drop forced pill widths.

| Before | After (pass 1) |
|--------|----------------|
| ~52px bar, `min-width: 6.2rem` pills | Tokenized CSS, content-sized pills |
| Duplicate `!important` rule blocks | Single rule set per selector |
| “Back to Portal” full text everywhere | “Portal” + `aria-label` |
| 38px mobile home circle | Icon-only home ≤900px via CSS |
| Heavy `box-shadow` / borders | Lighter chrome |

**Changes:**
- [`src/shared/styles/errlPortalHeader.css`](../src/shared/styles/errlPortalHeader.css) — CSS custom properties (`--errl-header-height`, `--errl-header-btn-h`, etc.); removed pill `min-width`/`max-width`; smaller padding/fonts; expanded tap slop via `::after` hit areas.
- [`src/apps/studio/src/app/components/PortalHeader.tsx`](../src/apps/studio/src/app/components/PortalHeader.tsx) — home label `Portal`, `aria-label="Back to portal"`, `.errl-home-btn__label` span for CSS hide.
- **Static HTML** (~13 pages) — bulk “Back to Portal” → “Portal”.
- [`src/shared/scripts/portal-nav-visibility.mjs`](../src/shared/scripts/portal-nav-visibility.mjs) — `enhanceHomeButton()` sets `aria-label` on static `.errl-home-btn` when icon-only.
- [`src/apps/studio/features/live-studio/studio/app/layout/StudioShell.tsx`](../src/apps/studio/features/live-studio/studio/app/layout/StudioShell.tsx) — secondary header: `py-3`, `text-lg/xl`, breadcrumbs `hidden md:flex`.

---

### Pass 2 — Ghost / seamless (approved, frozen)

**Goal:** Header hidden into the top — blends with page gradient at rest; only materializes on scroll.

**At rest:**
- No border, shadow, or backdrop blur on `.errl-header`
- Background: `--errl-header-fade` gradient (`rgba(2,7,10,0.42)` → transparent) into `--errl-bg` / page `::before` gradient
- Home: ghost text/icon link (no pill gradient)
- Nav: single glass capsule (like gallery view switcher) — uppercase tabs, transparent inactive, soft cyan active fill
- LED `::before` ring on pills **removed**
- Bar ~**30px** desktop / ~**28px** phone

**On scroll (`scrollY > 8`):**
- Class `.errl-header--scrolled` via [`src/shared/scripts/portal-header-scroll.mjs`](../src/shared/scripts/portal-header-scroll.mjs)
- Adds `backdrop-filter: blur(10px)`, darker bg (`--errl-header-fade-scrolled`), light shadow
- Nav capsule opacity/border bump

**Scroll wiring:**
- Static pages: `bindHeaderScroll()` called from `portal-nav-visibility.mjs`
- React routes: `useEffect(() => bindHeaderScroll(), [])` in `PortalHeader.tsx`

**Layout polish:**
- [`src/shared/styles/errlStaticPage.css`](../src/shared/styles/errlStaticPage.css) — negative margin on header so bar tucks into content edge
- [`src/apps/gallery/gallery.css`](../src/apps/gallery/gallery.css) — `.errl-gallery-main` top padding `0.35rem` → `0.15rem` for immersive views
- `StudioShell` secondary header — `bg-transparent`, `border-white/[0.04]`, tighter `py-2`

---

### File map

| File | Role |
|------|------|
| `src/shared/styles/errlPortalHeader.css` | Single source of truth for all header chrome |
| `src/apps/studio/src/app/components/portal-header.css` | Re-exports shared CSS (unchanged import) |
| `src/apps/studio/src/app/components/PortalHeader.tsx` | React header markup + scroll bind |
| `src/shared/scripts/portal-header-scroll.mjs` | **New** — scroll → `.errl-header--scrolled` |
| `src/shared/scripts/portal-nav-visibility.mjs` | Design nav sync, forum modal, home `aria-label`, scroll bind |
| `src/shared/styles/errlStaticPage.css` | Static page flex layout + header tuck |
| `src/apps/gallery/gallery.css` | Gallery main top spacing |
| `src/apps/studio/.../StudioShell.tsx` | Studio sub-app secondary header |
| Static `*/index.html` with `.errl-header` | Inline header HTML (Forum/About/Gallery/Studio pills) |

**Surfaces using header:** gallery, about, studio (static + React), design, assets, games, pin-designer, math-lab, shape-madness, designer, chatbot. Landing (`src/index.html`) loads CSS but uses orb nav, not `.errl-header`.

---

### Current CSS tokens (`:root`)

```css
--errl-header-height: 30px;       /* 28px ≤767px */
--errl-header-pad-y: 0.2rem;
--errl-header-pad-x: 0.75rem;
--errl-header-btn-h: 1.5rem;
--errl-header-font: 0.62rem;      /* uppercase nav */
--errl-header-home-size: 1.5rem;  /* icon-only ≤900px */
```

---

### A11y preserved

- `aria-label="Back to portal"` on home (React + static via `enhanceHomeButton`)
- `focus-visible` rings on home + nav tabs
- `[aria-current='page']` / `.active` styling unchanged semantically
- Invisible `::after` hit slop on controls for tap targets

---

### Not done / future levers (if revisiting)

- Scroll-shrink bar to ~32px (second compact tier)
- Auto-hide on idle (fade out after no pointer activity) — user liked current state, deferred
- `position: fixed` overlay (content full-bleed under header) — stayed `sticky` to avoid React/static layout offsets
- Shape-madness embed / pin-designer iframe hide-header behavior — unchanged, still works
- Playwright snapshot updates if visual regression fails on header screenshots

**Status:** User approved ghost pass; **no further header work planned** for now.

---

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

### Local-only follow-up (post prod freeze)
- `sceneControls.reloadFromStorage()` — Scene tab sliders sync when `portal-app` `setBundle` writes
- Scene tab intro copy: DOM vs CSS 3D orbs, long-press unlock, glow affects landing orbs
- `MetaballNavLinks` + `arrival.css`: `--nav-orb-glow` wired to Scene **Glow** slider
- Tests: `setBundle reload syncs scene tab sliders`, bundle write + reload panel size

### Production hotfix (errl.wtf broken state)
- Prod was serving old bundle: `MetaballNavCanvas` on landing + DOM bubbles + missing Errl (dual nav flash)
- Added `errl-layout-ready` gating so nav only shows after Errl has measurable layout
- Mobile menuOrb labels: slightly larger bubbles, no ellipsis truncation on `.menuOrb .label`
- Committed `9036ca3` and pushed `main` → Cloudflare Pages deploy

## Complete local work plan (2026-06-06 session 2)

### Phase 1 — Nav parity
- `useNavPhysics.ts`: DOM-matched scroll (`angleOffsetDeg`, `radiusOffset`), wobble, pointer pull scaling
- `MetaballNavLinks.tsx`: pointer tracking, `--nav-orb-merge` CSS var
- `arrival.css`: merge/glow on metaball orbs
- `tests/metaball-scroll-parity.spec.ts`

### Phase 2 — Metaball default
- Defaults: `scene-defaults.json`, `sceneTypes.ts`, `portal-app.js`, `boot-shell.js`, `sceneControls.ts`
- Escape hatch: `?dom=1` / `scene3d=0`
- Tests: live-visual-audit, responsive, performance, scene-phone-controls

### Phase 3 — Cinematic scroll
- `scrollBridge.setScrollProgress`, Lenis `ScrollDirector` sync, 300vh runway on `body`
- RB ambient `setScrollDrift` in `rise-bubbles-three.js`

### Phase 4 — Gallery spike
- `src/apps/gallery/` + `src/apps/static/pages/gallery/main.tsx` — Floating Hall R3F room
- `tests/gallery-floating-hall.spec.ts`

### Phase 5 — Bundle cleanup
- `rise-bubbles-three.js`: bundled `import('three')` (no CDN)
- `metaball-lab/main.tsx`: lazy-load `MetaballNavCanvas`
- `portal-app.js`: dead score HUD body removed

### Docs
- Updated `cinematic-scene-master-plan.md`, `scene3d-nav-agent-handoff.md`

## Repo cleanup (full plan)

### Phase 1 — Hygiene
- `.gitignore`: drive-download, chatgptnotes, large archive paths
- `doctor-structure.sh` updated for current layout
- README/PURPOSE: R3F/Lenis stack, doc links

### Phase 2 — Archive
- git rm small duplicate/temp archive folders
- git rm site-trim-20251222, docs-site-20251031, snapshot zips (~500+ files)
- Large backups gitignored for local/external storage

### Phase 3 — Docs
- New `docs/PROJECT_STATUS.md`, `docs/reference/static-experiments.md`
- Moved internal verification/deployment/testing → `docs/archive/`
- Updated active/README, archive READMEs

### Tests
- `scene-phone-controls.spec.ts`: 8/8 pass post-cleanup

### Upgrade merge research (`errl-portal-upgrade`)
- **Agent handoff:** `docs/upgrade-merge-handoff.md` (full map, file refs, P1–P6 tasks)
- **Cursor pointer:** `.cursor/plans/upgrade-merge-handoff.md`
- Metaball nav **is** the merge layer: upgrade `ErrlOrb` (3D glass) → current `MetaballNavLinks` (CSS orbs + shared orbit physics)
- Already merged: orbit breathing, 4 destinations, scroll carousel, scene bus, DOM/metaball parity tests
- Not merged yet: warp overlay on click, ReactiveStarfield backdrop, gallery focus zoom
- P1 next: internal nav warp (Framer Motion already in deps)
- Do **not** port upgrade R3F v8 stack; current R3F v9 + DOM-first nav is ahead

---

## 100-Step Dream Plan — agent session (2026-06-06)

### Phase 1 — Stabilize
- Fixed `gallery-floating-hall.spec.ts` scroll assertion (`scrollTo` + structural height check)
- Added `npm run test:tier-a` / `test:prod:tier-a`
- Deploy checklist in `docs/scene3d-nav-agent-handoff.md`
- **Tier A local:** 38 passed, 1 skipped (`--workers=1`)

### Phase 2 — Docs
- `docs/runtime-global-api.md` (errlSceneControls, errlSceneScroll, Pixi, hue, boot shell)
- Master plan + handoff §9 synced (Lenis, Three bundle, gallery spikes marked done)
- `chatgptnotes/03_TECHNICAL_ROADMAP.md` landing nav note

### Phase 3 — Tests
- `ui.spec.ts`, `landing-effects.spec.ts`, `studio-projects-gallery.spec.ts` updated for metaball default + `#gallery-root`
- New `dom-metaball-parity.spec.ts` (72px rest tolerance — label vs bubble center drift)

### Phase 4 — Nav
- Orbit change checklist in handoff §9
- `orbitLayout.ts` remains shared source (DOM + metaball)

### Phase 5 — Phone
- Scene tab copy already accurate in `index.html`; phone specs green in Tier A

### Phase 6 — Scroll
- `scrollChapters.ts` chapters 1–2 (approach / orbit / departure)
- Scroll easter egg at departure (`errl-scroll-easter-egg` body class)

### Phase 7 — Cleanup
- Score reducer + event listeners removed from `portal-app.js` (~400 lines)
- Pixi guards retained in `webgl.js`

### Phase 8–9 — Gallery
- Floating Hall polish: loading/error, SEO meta, reduced-motion static grid, mobile quality tier
- Room spikes: `CrtWall.tsx`, `GooVitrine.tsx`, `PinShelf.tsx` wired in `gallery/main.tsx`
- `docs/gallery-immersive-architecture.md` updated

### Phase 10 — Platform
- Arrival reduced-motion instant reveal
- v1.0 retrospective: Tier A green locally; prod audit pending user “ship” + push

### Checkpoint URLs (user spot-check)
- `/?skipIntro=1` — metaball default
- `/?skipIntro=1&dom=1` — DOM escape hatch
- `/gallery/` — hall + room sections
- `/fx/metaball-lab/` — shader lab only
- Click **About** on landing — black/purple warp curtain (~400ms) before navigation

### P1 warp nav (2026-06-06)
- `warpNav.ts`, `WarpOverlay.tsx` (portaled to `document.body`), click intercept on internal metaball links
- Orb charge-up class `errl-metaball-link--warping`; Forum stays external
- `tests/warp-nav.spec.ts` in Tier A

### Errl phone unlock + 3D nav labels (2026-06-06)
- Removed `#errlPhoneCtaHint` (HTML, CSS, `dev-phone-unlock.js`, `portal-app.js`, docs); updated audit/warp/phone tests
- Long-press fix: `body.errl-scene-main #errl { pointer-events: auto; touch-action: none }`; hardened gesture (move cancel, main-scene guard, hold glow)
- Unlock reveals minimized `#errlPanel` bubble only (no auto-expand)
- `MetaballNavLinks`: `orientationchange` reanchor, depth scale from physics `s.z`, per-letter arc labels + reduced-motion flat fallback
- New `tests/errl-phone-long-press.spec.ts` (unlock + move-cancel)
- Verify: long-press + audit + warp 23/23 pass; `npm run portal:build` OK

### Follow-up: phone click + Meltdown labels (2026-06-06)
- Fixed minimized `#errlPanel` click (`openMinimizedPanel` any hit inside panel; role/tabindex when minimized)
- Bottom-left dock CSS conflict removed (duplicate `right` rule); restored 52px width
- Nav labels: billboard upright text on revolving ring, orb bottom blur, `--orb-spin` / `--ring-spin`
- Added `Meltdown MF` from `src/shared/assets/portal/L5_UI/fonts/Meltdownmf-OEyd.ttf` (from Downloads)

### Phone dock, scroll, sizing + hybrid 3D nav (2026-06-06)
- **Bottom-right dock:** `lockPanelToBottomRight()` in `portal-app.js`; init/minimize/restore/resize all use `right` + safe-area; `.errl-panel.minimized` CSS aligned
- **Scroll:** wheel `stopPropagation` on `#errlPanel` + `.panel-content-wrapper`; Lenis `prevent` when target inside panel; CSS `touch-action: pan-y`, `overscroll-behavior: contain`
- **Size/tabs:** base panel 200×320; `computeDefaultPhoneScale()` on first open; tab grid 5×2; single-line abbrev labels in `index.html`
- **Hybrid nav:** `NavPhysicsProvider` + shared physics; `MetaballNavCanvas` on landing (`pointer-events: none`, links step sim); `MetaballNavLinks` `hybrid` mode hides CSS orbs, upright Meltdown labels; reduced-motion falls back to DOM orbs
- **Tests:** `errl-phone-long-press.spec.ts` — dock bottom-right assertion + pointerdown dispatch for reliable unlock (3/3 pass)
- **Manual QA:** verify at 390 / 768 / 1440 — bubble + expanded panel bottom-right, Dev/Scene tab scroll, 4 readable nav labels + warp

### Phone + nav usability pass (2026-06-06)
- Killed stray Playwright run; `PLAYWRIGHT_SKIP_WEBSERVER=1` skips Vite boot during tests
- Phone scroll: `scrollBridge` skips wheel/touch when target inside `#errlPanel`; panel capture-phase isolation
- Phone z-index 30 when unlocked so nav links do not block tabs/sliders
- Nav bubbles: CSS orbs stay until WebGL first frame; then hybrid (shader + upright labels); canvas sizing fix

### Nav + long-press fix (2026-06-06 evening)
- Root cause: hybrid mode hid CSS orbs when WebGL `onReady` fired but shader layer was invisible → labels-only flash/poof
- CSS orbs always render; WebGL canvas is additive glow underneath labels
- boot-shell injects early style to hide legacy `#navOrbit` before paint
- Long-press uses document capture + Errl bounding-box hit test (nav links excluded)

### Nav visual cleanup (2026-06-06 evening)
- Removed landing WebGL canvas overlay (was double-drawing muddy blobs + Errl ghost behind character)
- Fixed CSS orbs spinning edge-on (`rotateY(--orb-spin)`) — flat billboard mode only
- Tighter orb size, softer glow, readable Meltdown labels (Forum / About / Gallery / Studio)

- Deleted `tests/`, `playwright.config.ts`, prod/local Playwright shell scripts
- Removed all `test:*` npm scripts, `@playwright/test`, and postinstall browser install
- `playwright` kept as dependency for thumbnail/extract dev tools only (`npx playwright install chromium` when needed)
- `safety-check.sh` now runs typecheck + build only

### Warp nav → walking Errl loader (2026-06-06)
- Replaced swipe-down glitch curtain with animated walking Errl from `assets/walking-errl`
- New `WalkingErrlLoader.tsx`; `WarpOverlay` fades in loader on violet backdrop
- Nav delay ~850ms (`WARP_NAVIGATE_MS`) for one step cycle
- Seamless pass: transparent overlay, light vignette scrim (no blur), local halo behind Errl, `#errl` dims to 0.82; toned down orb warp pulse
- Warp v2: hero-scale walking Errl (78vmin) over live `#bgParticles` starfield; scene crossfade; preload on hover + navigate when fetch completes (280ms–12s); overlay persists through assign; destination `warp-handoff.js` fade-in on about/gallery/studio
- Fix: walking loader used enlarged container without scaling 220px limb layout → floating head/hands; added `__scale` wrapper with uniform `transform: scale()`
- Bidirectional warp: `warp-portal-nav.mjs` via `portal-nav-visibility.mjs` — intercepts `data-portal-link`, home btn, bubble nav; walking-errl iframe overlay; preload; landing arrival boost in `boot-shell.js`
- Static page overflow: `errlStaticPage.css` pseudo-element bg (no `fixed`), `100dvh`, `overflow-x: clip`; about inline styles aligned
- Gallery completion plan appended to `docs/gallery-immersive-architecture.md`
- `npm run gallery:sync` — 326 images (7 albums) from `~/Errl/Photos/Projects/Errl`; exclusions per user; manifest regen; vite dev serves `/assets/legacy/`

---

## Session wrap-up — phone + nav update (2026-06-06)

### Shipped
- **Errl Phone:** bottom-right dock, panel scroll isolation, viewport default scale, 5×2 tab grid, z-index above nav
- **Long-press unlock:** document capture + Errl hit box (nav bubbles excluded)
- **Nav:** flat CSS billboard orbs (Forum / About / Gallery / Studio), no landing WebGL double-draw
- **Labels:** Meltdown MF, 94% orb width, stroke + shadow (no backdrop pills)
- **Playwright:** full test suite removed; manual QA + `npm run portal:visual-test` instead
- **Warp loader:** walking Errl handoff (separate thread in same day)

### Nav iteration notes (what we tried / rejected)
- Hybrid WebGL + CSS orbs → muddy double draw, Errl ghost, poof on mode switch
- CSS `rotateY(--orb-spin)` → edge-on orb slivers
- Semi-transparent label pills → rejected (looked bad)

### Next update (documented only)
- **Metaball merge + animated colors:** full agent plan — `docs/active/metaball-nav-merge-and-color-plan.md`
- Supersedes earlier color-only note; includes physics merge-aware separation + lab-first hybrid path

### Manual verify before ship
- `/?skipIntro=1` — orbs, labels, warp, long-press → phone, scroll Dev/Scene tabs
- 390 / 768 / 1440 widths

---

## Gallery UI overhaul (2026-06-06, continued)

### Shipped
- **Photo names** replace descriptions — `item.title` on circles, scroll album, orbit labels, lightbox caption
- **Three view modes:** Circles, Orbit (spinning hall), Album (vertical scroll)
- **Corner dial** — `GalleryViewDial` knob + tabs; mode persisted in `sessionStorage` (`errl_gallery_view`)
- **Lightbox** — click any photo in any mode → full-screen viewer (Escape / backdrop / Close)
- **`gallery.css`** — styles for all new views, dial, lightbox
- **Tests** — `tests/gallery-floating-hall.spec.ts` updated for dial, modes, lightbox
- **Page copy** — subtitle removed; meta description updated

### Manual verify
- `/gallery/` — dial switches modes; each photo opens lightbox with name
- Orbit: click 3D frame; Circles / Album: click thumbnail card

### Gallery polish (2026-06-06)
- Removed corner dial knob — tabs-only view switcher in top toolbar
- **Album picker** — 7 manifest albums (OpenArt, Lizard Codex, Mushroom Forest, etc.) with counts
- **Denser layouts** — smaller circles grid, multi-column scroll album, more orbit frames (14–26)
- **Lazy load** — `GalleryLazyImage` IntersectionObserver + `loading="lazy"` / `decoding="async"`
- Orbit carousel advances every 14s through large albums (no per-frame texture churn)

### Gallery orbit + downloads (2026-06-06)
- **Orbit labels removed** — clean 3D view; names only in lightbox/circles/album modes
- **Scroll-driven orbit** — sticky stage + tall scroll track; scroll rotates hall and advances photo window
- **Orbit default** view on first visit
- **Albums** → compact `Collection` dropdown (random album each page load)
- **Downloads** — per-image in lightbox; full-album ZIP from collection menu (`galleryDownload.ts` + jszip)

### Gallery orbit viewport lock (2026-06-06)
- Removed page scroll track — orbit fits in `100dvh`, body overflow hidden in orbit mode
- Wheel / swipe / arrow keys drive carousel inside the stage (no document scroll)
- Ring layout — frames evenly on a circle facing center (replaces messy diagonal stack)

### Gallery sync — previews + one-offs (2026-06-06)
- `sync-from-photos.mjs` now **prefers `previews/`** when >8% larger (7 upgrades, 1400px vs 1024px)
- Old note was wrong: previews are not all dupes — 32/54 are smaller sprites excluded anyway
- New album **Errl One-Offs** (16): posters, totems, Stonehendge, DJ Mayday, compilations, etc.
- Lizard codex +3 (`Errl_Lizard_*`, `ErrlLizarf_*` typo)
- Still excluded: pins, sprites, field guides, stickers, hash assets — **110** unclassified remain
- Ran `npm run gallery:sync` → **345** images, **8** albums

### Gallery visual polish (2026-06-06)
- **Circles** fill viewport; fixed-size grid columns (no stretch gaps); larger default tiles
- **Album → Grid** rename; **tile size slider** (⊟–⊞) for circles + grid
- **GalleryAmbient** — portal-style shimmer + starfield using design-system colors
- Names show on hover only; cleaner toolbar glass styling

### Gallery orbit chrome + ring (2026-06-06)
- **Unified padding** — orbit uses same `0.35rem 20px` main padding + chrome flow as circles/grid (removed orbit-only 8px + absolute toolbar)
- **Orbit ring** — smaller radius (2.75), closer camera (3.95), narrower front arc (0.58π) so frames fill center instead of hugging viewport edges
- **Density slider** — separate session keys per circles/grid; CSS vars on parent containers so slider actually resizes tiles

### Gallery orbit drift path + dock (2026-06-06)
- **Scattered path** — `orbitPath.ts` Lissajous loop; `useFrame` animation; auto-drift + drag/scroll speed-up
- **Click to open** — no pointer capture; drag threshold 8px; mesh clicks reach lightbox
- **Bottom dock** — compact mode switcher + orbit hint; density slider stays top for circles/grid only
- **Tighter chrome** — orbit header shrunk; content area flex-fills between header and dock

### Gallery orbit immersive (2026-06-06)
- **Surround ring** — camera at center; 18–22 tiles on full 360° for large albums; tight front arc for small sets (no 6-photo ring gaps)
- **Borderless tiles** — `meshBasicMaterial` only; no frame boxes; `tileFill: 0.995`
- **Drag + scroll** — horizontal pointer drag rotates hall; wheel/touch/keys unchanged; drag suppresses accidental lightbox open
- **Viewport fill** — orbit canvas `height: 100%`; FOV 84°

### Gallery orbit + collection reset (2026-06-06)
- **FloatingHall rewrite** — single `ORBIT` config block; 6-frame window; camera z=7 / radius 4.6 / 0.62π arc; dark canvas bg; dropped renderOrder churn
- **Collection click target** — trigger `inset: 0` over full watermark band; `overflow: visible` on chrome/collection so picker isn't clipped
- **Picker** — `top: 100%`, chrome `z-index: 10`; orbit hint moved outside stage flex

---

## Gallery session wrap-up — break checkpoint (2026-06-06)

**Default view is now Grid** (was Orbit). First visit / cleared `sessionStorage` opens dense photo wall; choice still saved in `errl_gallery_view`.

### What the gallery is today

| Piece | Status |
|-------|--------|
| **Grid** (default) | Dense photo wall, tile-size slider, names on hover, click → lightbox |
| **Circles** | Round thumbnail grid, separate density setting, click → lightbox |
| **Orbit** | Work-in-progress — scattered 3D path, auto-drift, drag/scroll to speed up, click photo → lightbox |
| **Collection header** | Faded watermark title; full band clickable; popover list + ZIP download |
| **Random album** | New page load picks random collection from manifest |
| **Lightbox** | Full-screen viewer + per-image download |
| **Bottom dock** | Compact Circles / Orbit / Grid switcher; orbit hint on left |
| **Assets** | `npm run gallery:sync` → 345 images, 8 albums from `~/Errl/Photos/Projects/Errl` |

### Key files

- `src/apps/static/pages/gallery/main.tsx` — shell, modes, random album, body classes
- `src/apps/gallery/GalleryCollectionHeader.tsx` — watermark + picker + download
- `src/apps/gallery/GalleryGridView.tsx` / `GalleryCirclesView.tsx` / `GalleryOrbitView.tsx`
- `src/apps/gallery/FloatingHall.tsx` + `orbitPath.ts` — 3D orbit scene
- `src/apps/gallery/GalleryViewDial.tsx` — bottom mode tabs (`compact`)
- `src/apps/gallery/GalleryDensitySlider.tsx` — circles/grid tile size (separate session keys)
- `src/apps/gallery/GalleryLightbox.tsx` + `galleryDownload.ts`
- `src/apps/gallery/gallery.css` — all layout/styling
- `tools/gallery/sync-from-photos.mjs` — asset sync + manifest

### Orbit — iteration history (layered fixes → reset)

1. Started as scroll-driven 3D hall with labels (removed labels early)
2. Page scroll track → viewport-locked `100dvh`, wheel inside stage
3. Ring layout tuning (radius, arc, camera) — kept overlapping; empty center / edge-hugging issues
4. Unified chrome padding with circles/grid; collection picker clipped by `overflow: hidden` (fixed)
5. Surround ring from camera center — small albums had huge gaps on full 360°
6. **Current approach:** `orbitPath.ts` Lissajous-style loop; `useFrame` per-frame poses; 10–16 visible tiles; auto-drift + user nudge; borderless `meshBasicMaterial`; bottom dock

### Orbit — still rough / next session

- [ ] Fill viewport more — photos still feel small with empty space above/below on some collections
- [ ] Tune path: more “surrounded” on large albums, tighter pack on small (e.g. Extrepa Logos 10)
- [ ] Auto-drift speed / drag sensitivity feel-test
- [ ] Click vs drag edge cases on slow machines
- [ ] Consider pausing auto-drift while collection picker open
- [ ] Orbit was default briefly; **Grid is default again** until orbit polish lands

### Circles / Grid — done enough for now

- [x] Tile slider works (CSS vars on parent, per-mode session keys)
- [x] Names hidden until hover; shown in lightbox
- [x] Lazy-loaded images

### Collection UX — done

- [x] Watermark header, click-anywhere on band
- [x] Picker not clipped
- [x] Download collection ZIP

### Manual verify when back

1. `/gallery/` — lands on **Grid**, random album, scroll wall, click photo → lightbox + download
2. Bottom dock → Circles (slider works), Orbit (drift + drag + click), back to Grid
3. Click watermark band → switch collection → photos update
4. `npm run gallery:sync` if new photos added on disk
5. Widths: 390 / 768 / 1440

### sessionStorage keys

- `errl_gallery_view` — `circles` \| `orbit` \| `grid` (legacy `scroll` → `grid`)
- `errl_gallery_density_circles` / `errl_gallery_density_grid`

### Deploy to main (2026-06-07)

- **Commit** `d32f1aa` on `chore/repo-cleanup` → merged + pushed to `origin/main`
- **CI build:** passes (typecheck + `portal:build`)
- **Cloudflare deploy:** fails — `Authentication failed (status: 400)` on `cloudflare/pages-action@v1` (GitHub secrets `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` likely expired or revoked)
- **Fix:** rotate Cloudflare API token in repo Settings → Secrets, then re-run workflow `Deploy to Cloudflare Pages` on main (or `gh workflow run deploy-cloudflare.yml`)

