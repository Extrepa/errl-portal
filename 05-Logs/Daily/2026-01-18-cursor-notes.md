# 2026-01-18 (Cursor notes)

- Added a **Forum** link (`https://forum.errl.wtf`) to site navigation:
  - Home page orbit bubble (`src/index.html`)
  - Shared header navigation across static pages + Studio header component (`src/apps/**`, `src/apps/studio/src/app/components/PortalHeader.tsx`)

- Temporarily removed/disabled **Chat** and **Design** navigation bubbles from:
  - Home page orbit bubbles (`src/index.html`)
  - Shared header navigation across pages (`src/apps/**`)

- Header/navigation consistency pass:
  - Standardized header link set and made **header link order alphabetical** (About Errl, Assets, Designer, Forum, Gallery, Games, Studio) across pages.
  - Added shared header stylesheet `src/shared/styles/errlPortalHeader.css` and ensured it loads after per-page CSS so it reliably overrides.
  - Updated home orbit bubbles to include **Designer** and align ordering; kept Games hidden by default (Shift-B toggle).
  - Studio React: breadcrumbs now include a proper intermediate link for Code Lab (`/code-lab`).

- Verification (final pass):
  - Checked all `errl-nav` instances: they all match the same **alphabetical** order.
  - Confirmed no remaining `#studio` header links or `data-portal-link="*index.html"` values.
  - Confirmed `errlPortalHeader.css` is included across all header-bearing static pages and the orbit home page uses the same link targets (including dev-safe Designer via `data-multitool-link`).

- Fix: Forum links not opening
  - Switched Forum links from `target="_blank"` to **same-tab navigation** everywhere (home orbit + all shared headers + Studio header) to avoid environments that block new-tab/popup navigation.

- Verification (follow-up pass)
  - Confirmed **zero** `forum.errl.wtf` links still use `target="_blank"`.
  - Re-checked all 11 `errl-nav` headers: order remains **alphabetical** and `Forum` is present.
  - Confirmed no `Chat`/`Design` header links, no `href="#studio"`, and no `data-portal-link="*index.html"` values in `src/`.
  - Confirmed home orbit bubble set is **About / Assets / Designer / Forum / Gallery / (Games hidden) / Studio** and `data-multitool-link` rewrite still exists for Designer.

- Fix: make headers consistently “skinny”
  - Root cause was `.errl-nav` allowing **wrap**, which pushed items like “Studio” onto a second row on some pages.
  - Updated the canonical header CSS (`src/shared/styles/errlPortalHeader.css`) and the Studio header CSS (`src/apps/studio/src/app/components/portal-header.css`) to:
    - Force **single-row nav** (`flex-wrap: nowrap`)
    - Enable horizontal scrolling for the nav instead of wrapping
    - Slightly reduce header/button padding for a slimmer consistent height

- Update: remove Games + disable Design navigation
  - Deleted the Games static page (`src/apps/static/pages/games/index.html`) and removed all Games links/bubbles; `/games/` is expected to 404 for now.
  - Replaced “Designer” navigation with a **disabled “Design”** item across:
    - Home orbit bubbles (`src/index.html`)
    - Static headers (`src/apps/**`)
    - Studio header (`src/apps/studio/src/app/components/PortalHeader.tsx`)
  - Clicking Design now shows a small **“Design — coming soon”** toast and does not navigate.
  - Removed leftover Games-bubble toggle logic from the landing script (`src/apps/landing/scripts/portal-app.js`).

- Verification (post-change pass)
  - Confirmed no remaining `games` nav links or `/games/` references in `src/` (aside from unrelated dev panel runtime text).
  - Confirmed all shared headers use the same alphabetical link set: About Errl, Assets, Design (disabled), Forum, Gallery, Studio.
  - Confirmed no remaining `data-multitool-link` / `/designer.html` navigation items.

