# Live Studio Layout & Navigation Proposal

## Global Shell
- Render errl portal header + breadcrumb stack above studio content.
- Breadcrumb pattern: `Errl Hub / Live Studio / {Tab}`.
- Implement as wrapper in `src/portal/app/App.tsx` around `AppRouter` or create `StudioLayout` component consumed by studio routes.
- Add persistent “Back to Hub” button in top-left, reusing existing portal `Link` styles.

## Layout Structure
```
<StudioShell>
  <StudioHeader />  // title, breadcrumbs, quick actions
  <StudioBody>
    <PrimaryPane />     // code editors, svg canvas, photo canvas
    <Sidebar />         // assets, quick actions, sliders
  </StudioBody>
  <StudioFooter />      // console, export status
</StudioShell>
```

### StudioHeader
- Includes tab selector (Code/SVG/Photos) with descriptive copy.
- Shows autosave indicator + last saved timestamp.
- Houses quick links (Docs, Presets, Export).

### StudioBody — per tab
- **Code Tab:** Two-column split (Editors left, Preview right). Console collapsible drawer under editors. Assets drawer collapsible on right.
- **SVG Tab:** Center canvas with responsive max width, right sidebar for layers (with rename inputs) and animations. Quick actions row at top of sidebar.
- **Photos Tab:** Fabric canvas centered; right sidebar for layers, adjustments, asset uploads; bottom toolbar for grid/background toggles.

### StudioFooter
- Console logs shared across tabs; toggle to expand.
- Export summary showing last export type/time with buttons.

## Responsive Behavior
- Breakpoint at 1280px: sidebar collapses to accordion; tab selection stacked.
- Breakpoint at 960px: preview collapses under editors; breadcrumbs move into dropdown.

## Implementation Notes
- Create shared layout components under `src/studio/app/layout/`.
- Update routes in `src/portal/app/router.tsx` to wrap studio pages with new layout.
- Ensure global styles (Tailwind) include utility classes for new grid/spacing.
- Expose context provider for console/log + autosave indicators to share across tabs.

