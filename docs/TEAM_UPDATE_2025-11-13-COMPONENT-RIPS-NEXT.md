# Team Update — Component Rips Trajectory (2025-11-13)

## Snapshot
- **Normalized components**: 23 bundles across 7 categories (background 4 · button 2 · cursor 6 · module 5 · prop 2 · text 3 · misc 1) sourced from `archive/component-rips-20251112/Component_Rips`.
- **Catalog tooling**: `docs/catalog/component-rips/index.html` now drives filters, hover previews, accordion details, and uses the auto-generated manifest (`npm run catalog:component-rips`).
- **Asset hygiene**: Every bundle ships with `meta.json`, `index.html`, `script.js`, `styles.css`, safety notes, control descriptors, and a fresh thumbnail (`npm run thumbnails:generate`).
- **Documentation**: Backlog (`docs/catalog/component-rips/backlog.md`), audit trail (`docs/catalog/component-rips/audit-log.md`), and fixes plan (`docs/catalog/component-rips/COMPONENT_FIXES_PLAN.md`) record status and qualitative feedback.

## Recently Finished
1. **Catalog polish**
   - Manifest loader resilient to `file://` or `http(s)` origins.
   - Hover previews load via `<iframe ... preview=1>`; preview-mode helper hides controls automatically.
   - Card headers reflowed to keep titles + category/status badges readable; badges color-coded per category.
   - Thumbnail pipeline hides UI overlays before capture, yielding clean hero imagery for all 25 items.
2. **Normalization wave**
   - Added Bubble Mouse Trail + Holographic Cursor Trail scaffolds and completed 23 high-value conversions (see backlog table for per-component notes).
   - Safety gates enforced: no auto-play audio/video/camera, MIDI/mic behind explicit action, honors `prefers-reduced-motion`.
3. **Inventory + planning artifacts**
   - Unified inventory doc enumerates ~190 total components across archives, projects, and studio feeds.
   - Component fixes plan prioritizes display-mode consistency plus component-specific quality regressions.

## Active Threads
| Thread | Owner | Status | Notes |
| --- | --- | --- | --- |
| Display mode system | Catalog | 🟡 Design | Need declarative flag per component (full-window vs playground) + preview popup message behavior. |
| Visual parity fixes | Rips squad | 🟡 In progress | Gradient Waves, Liquid Text, Live Gradient Mixer, Terrapin Whirl, Rainbow Fluid Smoke flagged as “restore original feel.” |
| Cursor/button QoL | Rips squad | 🟢 Partially done | Speed slider landed for Rainbow Trailing Orbs; Holographic Cube larger-size option + Simple Blue Bubble Trail intensity tuning remain. |
| Webcam/Camera safety | Studio | 🟠 Blocked | WebCam Effects functional but held at `gate` until funhouse filters + policy review completed. |
| Integration path | Portal team | 🟡 Planning | Need decision tree for: landing backgrounds vs Studio tiles vs overlay props; depends on display-mode work. |

## Next Actions
1. **Finish Phase 1 fixes** (per `COMPONENT_FIXES_PLAN.md`): restore Liquid Text visibility, Live Gradient Mixer boxes, Rainbow Fluid Smoke energy, Terrapin Whirl look, Gradient Waves motion. Update thumbnails afterward.
2. **Ship display-mode metadata**:
   - Add `displayMode` to each `meta.json` (e.g., `full-window`, `cursor`, `playground-sm`, `playground-md`).
   - Teach catalog to size preview containers + launch popups accordingly.
3. **Stabilize webcam + permissioned modules**:
   - Harden opt-in flows, add “why we need this” copy, and write Playwright smoke tests that assert no permissions until buttons are clicked.
4. **Integration experiments**:
   - Prototype swapping hero background with Rainbow String Particles / Terrapin Whirl and cursor trails for landing interactions.
   - Add two Studio tiles (e.g., Live Gradient Mixer, Ribbon Topology) using `useLegacyAssetBridge`.
5. **Automation & QA**:
   - Extend inventory scanner to flag drift between archive status and manifest.
   - Add Playwright coverage ensuring catalog previews load without cross-origin or autoplay prompts.

## Risks & Needs
- **Visual drift**: Several “normalized” bundles diverge from source aesthetics; need reference diffs during Phase 1 fixes.
- **Performance**: Full-window shaders may spike GPU when multiple previews load; display-mode metadata should also control preview throttling.
- **Permissions**: Webcam/mic/MIDI components must never auto-request hardware—tests and UX copy required before `gate` can drop.

## Reference Commands
```
npm run catalog:component-rips   # regenerate manifest after editing meta.json
npm run thumbnails:generate      # refresh PNGs after visual tweaks
npm run inventory:scan           # rebuild unified component inventory
```

## Linked Artifacts
- Backlog: `docs/catalog/component-rips/backlog.md`
- Audit trail: `docs/catalog/component-rips/audit-log.md`
- Fixes plan: `docs/catalog/component-rips/COMPONENT_FIXES_PLAN.md`
- Inventory: `docs/catalog/component-inventory.md`
- Latest team update: `docs/TEAM_UPDATE_2025-11-12-PORTAL-COHESION.md`
