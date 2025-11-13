# Thumbnail-Based Catalog Guide

## Overview

The catalog now uses thumbnails with hover-to-preview functionality. This provides:
- ✅ Fast initial page load (thumbnails only)
- ✅ Live previews on hover
- ✅ Scales to 150+ components
- ✅ All metadata preserved

## Generating Thumbnails

### Automatic Generation (Recommended)

```bash
# Start a local server first (for best results)
cd docs/catalog/component-rips
python3 -m http.server 8000

# In another terminal, generate thumbnails
npm run thumbnails:generate -- --url=http://localhost:8000
```

### Manual Screenshots

For components that fail to generate automatically:
1. Open the component demo in your browser
2. Take a screenshot (640x480px recommended)
3. Save as: `packages/component-rips/_thumbnails/{slug}.png`

### Force Regenerate

To regenerate all thumbnails (even if they exist):
```bash
npm run thumbnails:force -- --url=http://localhost:8000
```

## How It Works

1. **Thumbnail Display**: Each card shows a thumbnail image
2. **Hover to Preview**: Hovering over the thumbnail loads a live iframe preview
3. **Click to Open**: Clicking the thumbnail opens the full demo
4. **Fallback**: If no thumbnail exists, shows placeholder with "Hover to preview"

## Preview Types

Components are automatically classified:
- **Simple** (cursors, backgrounds, props): Preview loads quickly (100ms delay)
- **Medium** (modules, text): Preview loads with slight delay (300ms)
- **Complex** (webcam, games): No live preview, thumbnail only

## File Structure

```
packages/component-rips/
  ├── _thumbnails/
  │   ├── {slug}.png  (generated thumbnails)
  │   └── .gitkeep
  └── {component-slug}/
      └── index.html
```

## Troubleshooting

### Thumbnails not generating?
- Make sure Playwright browsers are installed: `npm run agent:browsers`
- Try using a local HTTP server instead of file:// protocol
- Check browser console for errors

### Thumbnails not showing?
- Verify file exists: `packages/component-rips/_thumbnails/{slug}.png`
- Check file permissions
- Ensure path is correct (relative to catalog location)

### Preview not loading?
- Check browser console for CORS errors
- Verify component HTML file exists
- Try opening the component directly in browser

