# Studio Projects & Gallery Testing

## Overview
Comprehensive Playwright tests to ensure:
1. **Studio Projects**: Each project loads independently (not in nested frames)
2. **Gallery Pages**: Display all items directly, not loading another page in a frame

## Test File
`tests/studio-projects-gallery.spec.ts`

## Test Coverage

### Studio Projects - Independent Loading
- ✅ Code Lab loads as standalone page (no iframe)
- ✅ Math Lab loads in dedicated view (no nested frames)
- ✅ Shape Madness loads in dedicated view (no nested frames)
- ✅ Pin Designer loads in dedicated view (no nested frames)
- ✅ All studio projects are accessible from hub
- ✅ Projects navigate correctly without frame nesting

### Gallery Pages - Display All Items
- ✅ Gallery page displays all images directly (no iframe)
- ✅ Gallery manifest loads and processes correctly
- ✅ Gallery displays all items from manifest (20 items expected)
- ✅ Gallery images load with proper src attributes
- ✅ Gallery page does not load content in iframe
- ✅ Gallery handles missing images gracefully

### Assets Page - Iframe Loading
- ✅ Assets page displays all projects in iframes
- ✅ Assets page iframes load content without nesting
- ✅ Assets page displays all expected projects (8 projects)

### Integration Tests
- ✅ Navigation between studio and gallery works
- ✅ State maintenance when navigating

## Key Assertions

### Studio Projects
1. **No Nested Frames**: Each project should have 0 or 1 iframe (main content), never nested iframes
2. **Direct Content**: Projects should display content directly on the page or in a single iframe
3. **Proper Navigation**: Clicking project links should navigate to the project page, not load in a frame

### Gallery Pages
1. **No Iframes**: Gallery should never use iframes - all items displayed directly
2. **All Items Visible**: Should display all items from manifest (20 items)
3. **Proper Image Loading**: Images should have valid src attributes and load correctly
4. **Error Handling**: Should handle missing images gracefully

## Running Tests

```bash
# Run all studio/gallery tests
npm test -- tests/studio-projects-gallery.spec.ts

# Run with UI mode (for debugging)
npm test -- tests/studio-projects-gallery.spec.ts --ui

# Run specific test suite
npm test -- tests/studio-projects-gallery.spec.ts -g "Studio Projects"
npm test -- tests/studio-projects-gallery.spec.ts -g "Gallery Pages"
```

## Expected Results

### Studio Projects
- Code Lab: Standalone page with Monaco editor, no iframes
- Math Lab: May use iframe for legacy content, but not nested
- Shape Madness: May use iframe for legacy content, but not nested
- Pin Designer: May use iframe for legacy content, but not nested

### Gallery
- All 20 images from manifest displayed
- Images load with proper paths (no undefined/null)
- No iframes used
- Error handling for missing images

### Assets
- All 8 projects displayed in iframes
- Iframes load content without nesting
- Each project has valid src attribute
- Projects include: Errl Head Coin (v1-4), Face Popout, Walking Errl, Color Customizer, Pin Widget

## Notes
- Tests run in background mode by default
- Tests wait for network idle and content loading
- Gallery tests allow time for async image loading
- Frame nesting is explicitly checked and prevented
