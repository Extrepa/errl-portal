# Live Preview Catalog - Implementation Summary

## Recommended Approach: **Hover-to-Preview with Lazy Loading**

### Why This Approach?
1. ✅ **Fast Initial Load**: Only thumbnails/placeholders load initially
2. ✅ **User-Controlled**: Users decide when to load previews (hover)
3. ✅ **Performance**: Only 1-2 previews active at a time
4. ✅ **Scalable**: Works with 150+ components
5. ✅ **Progressive**: Can upgrade to always-on later

## Implementation Details

### Component Classification
Based on category, determine preview strategy:
- **Simple (Live Preview)**: `cursor`, `background`, `prop` → Small iframe preview
- **Medium (Hover Preview)**: `module`, `text` → Load iframe on hover
- **Complex (Thumbnail Only)**: `misc` (webcam, etc.) → Static placeholder + "Open Demo" button

### Preview Container
Each card gets a preview section:
```html
<div class="preview-container" data-preview-type="simple|medium|complex">
  <div class="preview-placeholder">
    <div class="preview-hint">Hover to preview</div>
  </div>
  <iframe 
    class="preview-iframe" 
    data-src="../../../packages/component-rips/{slug}/index.html"
    loading="lazy"
    sandbox="allow-scripts allow-same-origin"
  ></iframe>
</div>
```

### Loading Strategy
1. **Initial**: Show placeholder with hint
2. **Hover (Simple)**: Load iframe immediately
3. **Hover (Medium)**: Load iframe with slight delay (300ms)
4. **Complex**: Never load iframe, show thumbnail/placeholder

### Performance Optimizations
1. **Intersection Observer**: Only observe visible cards
2. **Unload on Scroll**: Remove iframe src when scrolled out of view
3. **Max Active Previews**: Limit to 2-3 active previews
4. **Throttle Hover**: Debounce hover events (100ms)

## Next Steps

1. **Update catalog HTML** with preview containers
2. **Add preview CSS** for containers and iframes
3. **Implement lazy loading** JavaScript
4. **Test with 10-20 components** first
5. **Add virtual scrolling** if needed for 150+ components

## Files to Modify

- `docs/catalog/component-rips/index.html` - Add preview containers and logic
- `docs/catalog/component-rips/manifest.json` - Add preview type metadata (optional)
- Consider adding `preview.type` to `meta.json` for explicit control

## Estimated Impact

- **Initial Load**: ~50ms faster (no iframes)
- **Memory**: ~80% reduction (only 2-3 active previews vs 23+)
- **Network**: On-demand loading (only when hovered)
- **User Experience**: Better - faster initial load, live previews on demand

