# 🎮 Errl Portal Development System Guide

## Overview

The Enhanced Integrated Dev Mode provides professional-grade development tools for your Errl Portal, giving you complete control over effects, layers, and parameters while keeping your production site clean.

## 🚀 Getting Started

### Enabling Dev Mode

**Option 1: URL Parameter**
```
http://localhost:3000/src/portal/pixi-gl/index.html?dev=true
```

**Option 2: localStorage (persistent)**
```javascript
localStorage.setItem('errl-dev-mode', 'true')
// Then refresh the page
```

### Visual Indicators

When dev mode is active, you'll see:
- 🎮 DEV MODE indicator (bottom left)
- Professional dev panel (top right)
- Element highlighting on hover with Alt key

## 🎛️ Dev Panel Features

### Inspector Tab 🎯
- **Element Selection**: Alt+click any element to inspect
- **Layer Detection**: Automatic layer classification
- **Parameter Controls**: Real-time effect editing
- **Property Display**: Current styles and computed values

### Layers Tab 📚
- **Layer Manager**: Toggle visibility, solo layers
- **Effect Overview**: See which effects are applied to each layer
- **Quick Controls**: Show All, Hide All, Reset buttons

### FX Library Tab ✨
- **Effect Categories**: Color, Distortion, Spatial, Visual
- **Effect Browser**: Searchable library of all available effects
- **Parameter Preview**: See parameter counts and types
- **One-Click Apply**: Add effects to selected elements

### Presets Tab 💾
- **Save Configurations**: Store complete effect setups
- **Quick Apply**: One-click preset application
- **Export/Import**: Share presets between projects

## 🎨 Layer System

Your portal is organized into these layers:

| Layer | ID | Description | Effects Available |
|-------|-----|-------------|-------------------|
| **L0** | `l0` | Background gradients | Hue, Blur, Brightness |
| **L1** | `l1-gl` | WebGL Canvas | Displacement, Shimmer, Hue |
| **L2** | `l2` | Floating Motes | Hue, Opacity, Scale |
| **L3** | `l3` | Frame Drip | Hue, Blur |
| **L4** | `l4` | Errl Character | Hue, Goo, Scale, Rotation |
| **L5** | `l5` | Navigation Bubbles | Hue, Goo, Physics |
| **L6** | `l6` | Awakening Effects | Hue, Opacity |
| **HUD** | `hud` | Interface Elements | Hue, Scale |

## 🎮 Keyboard Shortcuts

### Global
- `F12` or `Cmd+Shift+I` - Toggle dev panel
- `Alt` + hover - Highlight elements
- `Alt` + click - Select element for inspection

### Selected Element
- `R` - Reset parameters to defaults
- `Cmd+C` - Copy all parameters  
- `Cmd+V` - Paste parameters
- `Cmd+Z` - Undo last change
- `Cmd+Shift+Z` - Redo change

## 🎛️ Parameter Controls

### Control Types

**Range Sliders**
- Drag slider or scrub value display
- Mouse drag on blue value = real-time scrubbing
- Precision based on step size

**Checkboxes**
- Enable/disable boolean effects
- Immediate visual feedback

**Number Inputs**  
- Direct value entry
- Respects min/max bounds

**Dropdowns**
- Preset themes and options
- Category-based selection

### Real-Time Scrubbing 🖱️

Click and drag on any **blue value display** to scrub parameters in real-time:
- Sensitivity auto-adjusts based on parameter range
- Respects min/max bounds automatically  
- Snaps to step increments
- Visual feedback during scrubbing

## 🎨 Available Effects

### Color Effects
- **Hue Rotation**: 0-360° hue shift with saturation and intensity
- **Themes**: Warm, Cool, Electric, Sunset, Ocean, Forest

### Distortion Effects  
- **Goo Filter**: Viscous wobble with strength and speed controls
- **Displacement**: X/Y offset with WebGL shaders

### Spatial Effects
- **Transform**: Translate, Scale, Rotate with live preview
- **Physics**: Bubble collision and movement parameters

### Visual Effects
- **CSS Filters**: Blur, Brightness, Contrast, Opacity
- **Animation**: Built-in parameter animation with speed control

## 🔄 Integration with Existing Systems

The dev system integrates seamlessly with your current setup:

- **ErrlHueController**: All hue effects sync with existing system
- **WebGL Effects**: PIXI.js filters work through dev panel
- **CSS Layers**: Direct style manipulation with preview
- **Mobile Responsive**: Touch-friendly controls on mobile devices

## 📁 File Structure

```
src/fx/
├── dev-system.js          # Main dev panel and UI
├── parameter-controls.js   # Live parameter editing
├── fx-core.js             # Effect registry (existing)
├── hue-controller.js      # Hue system (existing)
├── hue-filter.js          # WebGL hue filter (existing)
└── hue-effects.css        # CSS effects (existing)
```

## 🛠️ Customization

### Adding New Effects

```javascript
// Register a new effect
window.ErrlDevSystem.fxRegistry.set('myEffect', {
  id: 'myEffect',
  label: 'My Custom Effect',
  category: 'Visual',
  type: 'css',
  parameters: {
    strength: { type: 'range', min: 0, max: 2, step: 0.1, default: 1.0 },
    color: { type: 'color', default: '#ff0000' }
  },
  apply: (element, params) => {
    // Your effect implementation
    element.style.filter = `brightness(${params.strength})`;
  }
});
```

### Adding New Layers

```javascript
// Register a new layer
window.ErrlDevSystem.layerRegistry.set('myLayer', {
  id: 'myLayer',
  label: 'My Custom Layer',
  selectors: ['.my-element'],
  type: 'css',
  effects: ['hue', 'transform', 'myEffect']
});
```

## 🎯 Best Practices

### Development Workflow
1. Enable dev mode via URL parameter
2. Use Inspector to select elements  
3. Experiment with parameters using scrubbing
4. Save successful configurations as presets
5. Copy/paste parameters between similar elements
6. Use layer manager for complex scene organization

### Performance Tips
- Dev tools only load when `?dev=true` is present
- Parameter changes are throttled for smooth performance
- WebGL effects use hardware acceleration
- CSS effects leverage GPU when possible

### Production Deployment
- Remove `?dev=true` from production URLs
- Dev tools automatically disabled in production
- Zero performance impact when disabled
- All production effects remain fully functional

## 🐛 Debugging

### Console Access
```javascript
// Access dev system from console
ErrlDevSystem.selectElement(document.querySelector('#errl-img'))
ErrlDevSystem.fxRegistry.get('hue')
ErrlParameterControls.resetElementParameters(element)
```

### Common Issues
- **Dev panel not appearing**: Check URL has `?dev=true`
- **Effects not applying**: Verify element is in registered layer
- **WebGL effects broken**: Check PIXI.js loaded correctly
- **Mobile issues**: Use touch instead of mouse events

## 🔄 Version Compatibility

- **Current Version**: v1.0 (2024)
- **Browser Support**: Modern browsers with ES6+ support
- **Mobile Support**: iOS Safari 12+, Android Chrome 70+
- **WebGL Support**: Required for advanced effects

---

**Happy developing! 🎨✨**

Your dev system provides professional-grade tools while maintaining clean production code. Use it to push the boundaries of what's possible with web-based visual effects!