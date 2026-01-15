# Test Suite Plan

**Created**: 2026-01-15  
**Purpose**: Comprehensive test plan for all implemented features and verifications

---

## Test Coverage Overview

### 1. Home Page Verification Tests
**File**: `tests/home-page-verification.test.ts`

**Coverage**:
- ✅ Canvas elements exist (`#bgParticles`, `#riseBubbles`, `#errlWebGL`)
- ✅ SVG filters defined (`uiGoo`, `errlGooFX`, `classicGoo`, `poolRipple`)
- ✅ Phone panel structure
- ✅ All 9 phone tabs
- ✅ Rising bubbles controls (15 controls)
- ✅ Hue controller (7 controls, 5 layers)
- ✅ Classic goo controls (11 controls)
- ✅ Navigation goo controls
- ✅ WebGL controls
- ✅ Pin widget controls
- ✅ Developer tools
- ✅ Settings persistence

**Status**: ✅ Test structure created

---

### 2. Paper.js Utilities Tests
**File**: `tests/paper-utils.test.ts`

**Coverage**:
- ✅ `loadPaperJS()` initialization
- ✅ `performBooleanOperation()` - union, subtract, intersect, exclude
- ✅ `performBooleanOperationMultiple()` - multiple paths
- ✅ `simplifySvgPaths()` - path simplification
- ✅ `expandStrokeToFill()` - stroke expansion (documented limitation)

**Status**: ✅ Test structure created  
**Note**: Full implementation requires browser context execution

---

### 3. Keyboard Shortcuts Tests
**File**: `tests/keyboard-shortcuts.test.ts`

**Coverage**:
- ✅ Undo (Cmd/Ctrl+Z)
- ✅ Redo (Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y)
- ✅ Delete (Delete/Backspace)
- ✅ Deselect (Escape)
- ✅ Platform detection (Mac vs Windows)
- ✅ Input field exclusion

**Status**: ✅ Test structure created  
**Note**: Requires designer app context

---

## Test Execution Strategy

### Unit Tests
- **Paper.js utilities**: Test in isolation with mock paths
- **Keyboard shortcuts**: Test hook behavior in isolation

### Integration Tests
- **Home page effects**: Test control wiring and effect updates
- **Settings persistence**: Test save/load cycle

### E2E Tests
- **Full user flows**: Test complete interactions
- **Cross-browser**: Test in Chrome, Firefox, Safari

---

## Test Implementation Status

### Phase 1: Test Structure ✅
- [x] Create test files
- [x] Set up test structure
- [x] Define test cases

### Phase 2: Basic Tests (Next)
- [ ] Implement home page structure tests
- [ ] Implement control existence tests
- [ ] Implement basic interaction tests

### Phase 3: Effect Tests (Future)
- [ ] Test effect initialization
- [ ] Test effect updates
- [ ] Test settings persistence

### Phase 4: Paper.js Tests (Future)
- [ ] Test boolean operations with real paths
- [ ] Test path simplification
- [ ] Test error handling

### Phase 5: Keyboard Shortcuts Tests (Future)
- [ ] Test in designer app context
- [ ] Test platform differences
- [ ] Test input field exclusion

---

## Test Data Requirements

### SVG Paths for Testing
- Simple rectangles
- Complex curves
- Self-intersecting paths
- Open paths
- Closed paths

### Settings for Testing
- Default settings
- Custom settings
- Edge cases (min/max values)
- Invalid settings

---

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/home-page-verification.test.ts

# Run with UI
npm test -- --ui

# Run in specific browser
npm test -- --project=chromium
```

---

## Test Maintenance

### Regular Updates
- Update tests when features change
- Add tests for new features
- Remove tests for deprecated features

### Coverage Goals
- **Home page**: 80%+ coverage
- **Paper.js utilities**: 90%+ coverage
- **Keyboard shortcuts**: 100% coverage

---

## Known Limitations

1. **Paper.js tests**: Require browser context, may need Playwright page.evaluate()
2. **Effect tests**: Require actual effect initialization, may need longer timeouts
3. **Settings persistence**: Requires localStorage access, may need setup/teardown

---

## Future Enhancements

1. **Visual regression tests**: Screenshot comparisons for effects
2. **Performance tests**: Measure effect performance
3. **Accessibility tests**: Test keyboard navigation
4. **Cross-browser tests**: Test in all supported browsers

---

**Last Updated**: 2026-01-15
