# Playwright Test Suite

**Created**: 2026-01-15  
**Status**: Complete and Ready

---

## Test Suite Overview

Comprehensive Playwright test suite covering:
- Home page structure and elements
- All 50+ Errl phone controls
- Effect systems (Rising Bubbles, WebGL, Hue Controller, Goo effects)
- Settings persistence (localStorage)
- Phone panel navigation
- Integration tests for control-to-effect wiring
- Paper.js utilities (browser context)
- Keyboard shortcuts (designer app)

---

## Test Files

### Core Test Files

1. **`home-page-verification.test.ts`** (46 tests)
   - Home page structure
   - All canvas elements
   - SVG filters
   - Phone panel tabs
   - Rising Bubbles controls
   - Hue Controller (all layers)
   - Classic Goo controls
   - Navigation Goo controls
   - WebGL effects
   - Pin Widget
   - Developer Tools
   - Settings persistence
   - Phone panel navigation

2. **`errl-phone-controls.spec.ts`** (Enhanced)
   - All Rising Bubbles controls (15 controls)
   - Advanced animation controls
   - Nav controls
   - Classic Goo controls
   - GLB controls
   - Hue controls
   - Effect function verification

3. **`effects.spec.ts`** (Enhanced)
   - Background particles
   - Rising bubbles canvas
   - WebGL canvas
   - Hue Controller initialization
   - Classic Goo effects
   - Navigation Goo effects
   - WebGL effects
   - Reduced motion

4. **`settings-persistence.test.ts`** (10 tests) - NEW
   - localStorage save/load
   - Settings bundle structure
   - Multi-tab settings persistence
   - Save/Reset defaults
   - Import/Export settings
   - Empty localStorage handling

5. **`integration-controls-effects.test.ts`** (10 tests) - NEW
   - Control-to-effect wiring
   - Complete user flows
   - Multi-control interactions
   - Settings persistence across reloads
   - Rapid control changes
   - Error handling

6. **`paper-utils.test.ts`** (Enhanced)
   - Paper.js initialization (browser context)
   - Boolean operations
   - Multiple path operations
   - Path simplification
   - Error handling

7. **`keyboard-shortcuts.test.ts`** (Enhanced)
   - Undo/Redo shortcuts
   - Delete/Deselect
   - Platform detection
   - Input field exclusion
   - ContentEditable handling

### Test Helpers

**`helpers/test-helpers.ts`** - Reusable utilities:
- `waitForEffects()` - Wait for effect initialization
- `waitForEffect()` - Wait for specific effect
- `getControlValue()` - Get control value safely
- `setControlValue()` - Set control and wait
- `verifyEffectFunction()` - Check function exists
- `clearLocalStorage()` - Clear settings
- `getSettingsBundle()` - Get settings from localStorage
- `setSettingsBundle()` - Set settings in localStorage
- `openPhoneTab()` - Open tab and verify
- `ensurePhonePanelOpen()` - Ensure panel is open
- `waitForCanvasContent()` - Wait for canvas rendering
- `getFilterNodeAttribute()` - Get SVG filter attributes
- `verifyControlWiring()` - Verify control-to-effect wiring

---

## Test Coverage

### Controls Tested (50+)

**Rising Bubbles (15)**:
- rbSpeed, rbDensity, rbAlpha, rbWobble, rbFreq
- rbMin, rbMax, rbSizeHz, rbJumboPct, rbJumboScale
- rbAttract, rbAttractIntensity, rbRipples, rbRippleIntensity
- Advanced: rbAdvModeLoop, rbAdvModePing, rbAdvAnimSpeed, rbAdvPlayPause

**Hue Controller (7)**:
- hueTarget, hueEnabled, hueShift, hueSat, hueInt, hueTimeline, huePlayPause
- All 5 layers: nav, riseBubbles, bgBubbles, background, glOverlay

**Classic Goo (11)**:
- classicGooEnabled, classicGooStrength, classicGooWobble, classicGooSpeed
- classicGooStrengthAuto, classicGooWobbleAuto, classicGooSpeedAuto
- classicGooAutoSpeed, classicGooMouseReact, classicGooAutoPlayPause, classicGooRandom

**Navigation (12)**:
- navOrbitSpeed, navRadius, navOrbSize, glOrbsToggle
- navWiggle, navFlow, navGrip, navDrip, navVisc
- navSlowGradient, navGradientPlayPause, navRandom

**WebGL (4)**:
- bgSpeed, bgDensity, glAlpha, glbRandom

**Pin Widget (4)**:
- inject, save, reset, modal open

**Developer Tools (7)**:
- snapshotPngBtn, exportHtmlBtn, saveDefaultsBtn, resetDefaultsBtn
- exportSettingsBtn, importSettingsBtn, importSettingsFile

**HUD (4)**:
- burstBtn, audio controls, accessibility controls

### Effect Systems Tested

- ✅ Background particles (`#bgParticles`)
- ✅ Rising Bubbles (`#riseBubbles` - Three.js)
- ✅ WebGL effects (`#errlWebGL`)
- ✅ Hue Controller (all 5 layers)
- ✅ Classic Goo (SVG filters)
- ✅ Navigation Goo (SVG + WebGL)
- ✅ Settings persistence (localStorage)

---

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/home-page-verification.test.ts

# Run with UI
npm test -- --ui

# Run in specific browser
npm test -- --project=chromium

# Run with headed browser
npm test -- --headed

# Run specific test
npm test -- -g "should load all required canvas elements"
```

---

## Test Structure

### Test Organization

- **Structure Tests**: Verify elements exist
- **Control Tests**: Verify controls work and are wired
- **Effect Tests**: Verify effects initialize and update
- **Integration Tests**: End-to-end user flows
- **Persistence Tests**: Settings save/load

### Wait Strategies

- `waitForEffects()` - Wait for all effects
- `waitForEffect()` - Wait for specific effect
- `page.waitForFunction()` - Wait for conditions
- `page.waitForTimeout()` - Used sparingly

### Verification Methods

1. **Control Existence**: `expect(locator).toBeVisible()`
2. **Control Values**: `expect(locator).toHaveValue()`
3. **Effect Functions**: `page.evaluate()` + `verifyEffectFunction()`
4. **Settings**: `getSettingsBundle()` from localStorage
5. **DOM Changes**: `page.evaluate()` to check classes/attributes

---

## Test Statistics

- **Total Test Files**: 7 core files (enhanced/created)
- **Total Tests**: 100+ individual test cases
- **Test Helpers**: 12 utility functions
- **Coverage**: 50+ controls, 8 effect systems, 9 phone tabs

---

## Known Limitations

1. **Paper.js Tests**: Require Paper.js to be available in browser context
2. **Visual Effects**: Some effects require screenshot comparison for full verification
3. **Designer App**: Keyboard shortcuts tests require designer app to be fully loaded
4. **Effect Timing**: Some effects may need longer timeouts on slower machines

---

## Maintenance

### Adding New Tests

1. Use test helpers from `helpers/test-helpers.ts`
2. Follow existing test structure
3. Add proper waits for effects
4. Verify both control and effect updates

### Updating Tests

- Update when controls change
- Update when effect APIs change
- Update when new features are added

---

**Last Updated**: 2026-01-15  
**Status**: ✅ Complete and Ready for Execution
