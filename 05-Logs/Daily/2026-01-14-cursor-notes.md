## 2026-01-14 (Cursor)

- Updated colorizer overlay sizing to behave like a modal: it now sizes to the on-screen Errl (`#errlCenter`) and stays within viewport margins when opened/resized.
- Reworked the in-designer tip to a compact **two-line** layout with a subtle divider and per-line truncation (ellipsis), plus more balanced padding.
- Reduced excess bottom reservation/padding in the designer card so the tip doesn't consume unnecessary space.
- Updated the tip again to **two columns** with a vertical divider on wider screens, and to **wrap/stack** (never truncate) on smaller screens.
- Updated colorizer top control buttons to **wrap labels** instead of clipping.
- Added hover/focus tooltips (via `data-tip`) for key pin-widget controls (Load, Randomize, Apply/Close, glitter chips).
- Added hard viewport clamping + header drag-to-move for the colorizer modal, so it can’t get stuck off-screen on desktop.
- Added a third colorizer control: **Reset Default** (clears saved SVG + restores default Errl) while keeping Inject/Save/Reset on one row.

- Centered the phone tab labels (HUD/Errl/Nav/RB/GLB/BG/DEV/Hue) by taking the tab icon out of flex flow (absolute positioning) so the text centers cleanly.
- Removed the DEV-panel helper text “Second phone overlay”.
- Improved Snapshot export to also download a JSON bundle (and include persisted `errl_hue_layers` as a fallback), making it easier to convert a good local state into code defaults.
- Removed the (non-working) tab icon textures and made tabs text-only with perfectly centered labels.
- Fixed listener accumulation in `src/index.html` by registering the iframe `message` handler and the Inject/Save/Reset click handlers **once** (not inside the iframe `load` callback), preventing duplicate actions after iframe reloads.
- Fixed `Save Defaults` to persist **all tab control positions** (not just a subset) by saving/loading a unified UI defaults blob, and preserved classic-goo auto settings instead of overwriting them.
- Reduced Errl Goo **Auto Speed** sensitivity by tightening the range and increasing precision (smaller step), plus clamping any older persisted values into the new range on load.
- Added a **single settings bundle** (`localStorage.errl_portal_settings_v1`) with **Export/Import** buttons, plus a repo-backed defaults file at `public/apps/landing/config/errl-defaults.json`. The app bootstraps by migrating legacy scattered keys into the bundle and keeps legacy keys mirrored for backward compatibility.
- Switched to **bundle-only persistence** (legacy `errl_*` keys are now one-time migrated then removed), and updated the Hue controller to persist/load from the bundle instead of `errl_hue_layers`.

### Detailed notes (what/why + where)

- **Customizer modal (iframe overlay)**
  - **Goal**: keep the customizer usable on all screen sizes (header/title/close always reachable), never let it spawn off-screen, and keep it draggable without snap-back.
  - **Key behaviors**
    - Opens centered with pixel positioning on desktop; full-screen sheet on small screens.
    - Always clamped into the viewport after open/resize/drag so it can’t get trapped outside the viewbox.
    - Dragging sets a "user moved" state so auto-sizing won’t snap it back; we only re-clamp.
    - Close works reliably (including when focus is inside the iframe), plus Escape close support.
  - **Where**
    - `src/index.html` (CSS overrides for `#colorizerPhone`, controls row layout, and the open/close/drag/viewport-clamp JS).

- **Customizer modal controls row**
  - **Goal**: keep all labels readable (no cut-off), and keep 3 primary actions on one row.
  - **Result**
    - Added **Reset Default** button next to **Inject to Home** and **Save SVG**.
    - Buttons wrap text instead of clipping.
  - **Where**
    - `src/index.html` (HTML/CSS/JS for `#colorizerResetBtn` + `resetHomeToDefault()`).

- **Pin widget designer (inside iframe)**
  - **Goal**: keep SVG centered/contained across very wide/tall viewports and keep bottom tip readable without forcing huge padding.
  - **Result**
    - `.stage` + `svg` constrained with `object-fit: contain` and responsive max sizes on large screens.
    - `fitToOutline()` updated to include extra padding for stroke/blur/glow so nothing renders outside the viewBox.
    - Tip redesigned to be subtle and compact, and to never truncate text:
      - 2 columns with a vertical divider when space allows
      - collapses to a single stacked layout on small widths
    - Added tooltips via `data-tip` for key controls.
    - Added iframe Escape handling to request parent modal close (`postMessage`).
    - Improved auto-load for `errl-body-with-limbs.svg` by trying multiple path strategies (and parent origin when embedded).
  - **Where**
    - `src/apps/static/pages/studio/pin-widget/ErrlPin.Widget/designer.html`

- **Main "phone" tabs (HUD / ERRL / NAV / RB / GLB / BG / DEV / HUE)**
  - **Goal**: make tab labels visually centered and remove broken icon textures.
  - **Result**
    - Removed tab icon textures (they weren’t reliably visible).
    - Tabs are now **text-only** with the label centered using grid layout.
  - **Where**
    - `src/apps/landing/styles/styles.css` (`.panel-tabs`, `.panel-tabs .tab`, `.panel-tabs .tab .label`, and `::after` disabled).

- **DEV panel cleanup**
  - **Goal**: reduce clutter.
  - **Result**
    - Removed “Second phone overlay” helper text next to "Open Customizer".
  - **Where**
    - `src/index.html`

- **Snapshot exporting (DEV tools)**
  - **Goal**: easiest path to “tweak locally → export → make it default”.
  - **Result**
    - Snapshot now exports **HTML + a JSON bundle**.
    - JSON includes a `_storage` section with relevant localStorage keys and hue fallback (`errl_hue_layers`) if the controller isn’t present.
  - **Where**
    - `src/apps/landing/scripts/portal-app.js`

### Files touched (high level)

- `src/index.html`
- `src/apps/landing/styles/styles.css`
- `src/apps/landing/scripts/portal-app.js`
- `src/apps/static/pages/studio/pin-widget/ErrlPin.Widget/designer.html`

### Verification checklist (quick)

- **Open customizer (DEV -> Open Customizer)**:
  - Modal opens centered on desktop and fully visible (header + close always reachable).
  - Dragging the header moves the modal and it stays where placed (no snap-back); it clamps inside viewport edges.
  - **Escape** closes (works even when focus is inside iframe).
  - Close button "X" is clickable and closes immediately.

- **Customizer controls row**:
  - Inject / Save SVG / Reset Default all visible and clickable on one row.
  - Labels wrap (no clipping) if space is tight.

- **Pin designer iframe**:
  - SVG stays contained (no giant stretch on ultrawide), and viewBox includes glow/filters.
  - Tip text never truncates; becomes 2-col with divider on wide, stacks on narrow.
  - Load + Randomize + context panel actions work; tooltips show on hover/focus.
  - `errl-body-with-limbs.svg` auto-load resolves when embedded (tries parent origin and fallbacks).

- **Phone tabs (HUD/ERRL/NAV/RB/GLB/BG/DEV/HUE)**:
  - Text-only tabs with centered labels (no icon textures).

- **Snapshot**:
  - PNG snapshot tries WebGL capture first, then html2canvas fallback.
  - Snapshot export downloads both HTML and JSON; hue falls back to `errl_hue_layers` from localStorage.

### TODOs / follow-ups

- Confirm tab label centering on all browsers (grid-centering should be consistent).
- Run a quick manual test on a large desktop viewport + a small mobile viewport.

### Extra notes / gotchas

- **Playwright tests**: `npm test` tries to start a web server on `127.0.0.1:5173`. In the sandbox it fails with `listen EPERM`. To run tests from here, we need permission to bind a local port (or run outside sandbox).
- **SVG colorer hardening**: `src/apps/static/pages/studio/svg-colorer/app.js` got defensive null-check wiring (buttons/inputs may not exist depending on embed/route), to prevent runtime errors that would break interactions.
