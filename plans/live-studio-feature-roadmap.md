# Live Studio Feature Roadmap

## SVG Tooling
- **Layer naming:** add editable text inputs beside each entry in layer list (`SVGTab.tsx`). Persist names in component state and include in export metadata.
- **Quick actions:** configurable preset list stored in `studioPresets.json` or new `svgQuickActions.ts`. Provide buttons for “Outline Stroke”, “Duplicate + Flip”, etc.
- **Slider help:** tooltip data map (copy + icon) describing optimize/unite/intersect parameters; render via `Tooltip` component next to controls.
- **Animations:** extend animation panel with new presets (bounce, pulse, orbit) and easing controls. Store definitions in JSON to share between quick actions/export.
- **Export:** allow export as SVG + JSON bundle. Provide preview of generated animation CSS.

## Photos Tab
- **Upload fix:** verify Fabric canvas `addImageFromFile` path; ensure async load adds to canvas and layer list. Add loading indicator + error toast.
- **Sticker placement:** spawn at canvas center relative to viewport; fix heart asset path to valid SVG.
- **Grid/background:** replace CSS background with Fabric overlay grid toggle. Use `fabric.Grid` or custom rendering for consistent spacing.
- **Exports:** support PNG, JPEG, SVG (vectorize), and layered JSON export for re-import.

## Code Tab
- **Console drawer:** collapsible panel with auto-scroll + clear button.
- **Asset manager:** allow drag/drop reordering, search, and preview. Persist metadata to localStorage.
- **Export options:** add HTML+CSS+JS zip, single HTML, `.errlproj`, and “Share link” stub.
- **Help overlay:** contextual description of each button; include keyboard shortcuts.

## Navigation & Shared Services
- Breadcrumb header linking back to hub (see layout plan).
- Shared context for autosave state + last export timestamp.
- Document all tooltips/copy in `docs/dev/live-studio.md`.

## Sequencing
1. Implement shared layout shell + breadcrumbs.
2. Fix Photos uploads + stickers, add export choices.
3. Add SVG layer naming + slider tooltips + animations expansion.
4. Enhance Code tab console/assets + export suite.
5. Polish navigation/help overlays and documentation.

