# Framer Component Extraction Guide

## Overview

Framer exports bundle React components and load them via external ES modules from `framerusercontent.com`. This makes direct code extraction challenging, but we have tools to help.

## Extraction Methods

### Method 1: Browser-Based Extraction (Recommended)

Uses Playwright to load the Framer export in a headless browser and capture the actual running code:

```bash
npm run extract:framer <source-html> <target-slug>
```

**Example:**
```bash
npm run extract:framer archive/component-rips-20251112/Component_Rips/Modules/ParticleShapes_Module.html particle-shapes-module
```

**How it works:**
1. Launches a headless Chromium browser
2. Loads the Framer export HTML file
3. Intercepts network requests to capture all script files
4. Extracts component code from the captured scripts
5. Creates a normalized component structure

**Advantages:**
- Captures actual running code
- Handles React components
- Extracts canvas/WebGL code
- Gets inline styles

**Limitations:**
- Complex React components may need manual refinement
- Some code may be minified/obfuscated
- External dependencies may still be needed

### Method 2: Manual Browser Extraction

For more control, you can manually extract code using browser DevTools:

1. **Open the Framer export HTML in a browser**
2. **Open DevTools (F12)**
3. **Go to Sources/Network tab**
4. **Find the `script_main.*.mjs` file**
5. **Copy the code** (may be minified)
6. **Use a beautifier** to format it
7. **Extract the component logic**

### Method 3: Framer Project Access

If you have access to the original Framer project:

1. Open the project in Framer
2. Use Framer's "Export Code" feature
3. Copy the component code directly
4. Adapt it to our normalized structure

## Component Types

### Canvas-Based Components

Components with `<canvas>` elements are easier to extract because:
- Canvas code is usually in plain JavaScript
- Less React-specific code
- Can be extracted more directly

**Examples:**
- ParticleShapes_Module
- AsciiDrawingTablet_Module
- RainbowDrawingTablet_Module

### React Components

React components are more complex because:
- Code is bundled with React runtime
- Component logic is embedded in the bundle
- May require React dependencies

**Extraction tips:**
- Look for `createElement` calls
- Find component function definitions
- Extract props and state management
- May need to adapt to vanilla JS

## Extraction Status

Current status of Framer exports:

| Component | Status | Method | Notes |
|-----------|--------|--------|-------|
| ParticleShapes_Module | ✅ Extracted | Browser | Full scripts captured (8 files, 800KB+) |
| AsciiDrawingTablet_Module | ✅ Extracted | Browser | Full scripts captured (8 files, 750KB+) |
| RainbowDrawingTablet_Module | ✅ Extracted | Browser | Full scripts captured (8 files, 1.2MB+) |
| ParticleFaceParallaxPush_Module | ✅ Extracted | Browser | Full scripts captured (8 files, 750KB+) |
| 3DEffect_3DObject_Prop | ✅ Extracted | Browser | Full scripts captured (8 files, 750KB+) |

**Note:** All components have been re-extracted using browser automation. Full source scripts are available in `_extracted-scripts/` folders. The component code is embedded in minified React/Framer bundles and may require manual refinement for full functionality.

## Next Steps

1. **Run browser extraction** on all Framer exports:
   ```bash
   npm run extract:framer archive/component-rips-20251112/Component_Rips/Modules/ParticleShapes_Module.html particle-shapes-module
   ```

2. **Review extracted code** and refine as needed

3. **Test components** to ensure they work standalone

4. **Update meta.json** with extraction status

## Tools

- `tools/portal/extract-framer-browser.mjs` - Browser-based extraction tool
- `tools/portal/extract-framer-component.mjs` - Direct script fetching (requires jsdom)

## Tips

- Always test extracted components in isolation
- Check for external dependencies
- Ensure `prefers-reduced-motion` support
- Add proper safety gates (camera, audio, etc.)
- Update component status in meta.json

