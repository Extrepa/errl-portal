# Live Preview Catalog Proposal

## Goals
1. **Live Previews**: Show mini previews of each component directly in the catalog
2. **Performance**: Handle 150+ components without bogging down the site
3. **Smart Loading**: Different strategies for simple vs complex components
4. **Keep All Info**: Preserve all current metadata and controls

## Component Types & Preview Strategies

### Simple Components (Live Iframe Previews)
**Types:** Cursors, Backgrounds, Simple Props
**Strategy:** Small iframe (e.g., 320x240px) that loads the actual component
- **Pros:** True live preview, shows actual behavior
- **Cons:** More resource-intensive
- **Optimization:** Lazy-load only when visible (Intersection Observer)

### Medium Components (Thumbnail + Lazy Iframe)
**Types:** Modules, Text effects, Interactive props
**Strategy:** 
- Initial: Static thumbnail/screenshot
- On hover/click: Load live iframe preview
- **Optimization:** Generate thumbnails during build, lazy-load iframes

### Complex Components (Thumbnail Only)
**Types:** Games, Full-screen experiences, WebCam effects
**Strategy:** Static thumbnail with "Open Demo" button
- **Reason:** Too resource-intensive for inline preview
- **Fallback:** Link to full demo page

## Implementation Plan

### Phase 1: Basic Live Previews (Simple Components)
1. Add preview container to each card
2. Use Intersection Observer to lazy-load iframes
3. Start with cursors and backgrounds only
4. Small iframe size (320x240px or similar)

### Phase 2: Progressive Enhancement
1. Add thumbnail generation for complex components
2. Implement hover-to-preview for medium components
3. Add loading states and error handling

### Phase 3: Performance Optimization
1. Virtual scrolling for large lists
2. Pagination or "Load More" button
3. Preview caching
4. Throttle/debounce scroll events

## Technical Approach

### Preview Container Structure
```html
<div class="card">
  <!-- Existing header/metadata -->
  
  <!-- NEW: Preview section -->
  <div class="preview-container">
    <div class="preview-placeholder">
      <div class="preview-loading">Loading preview...</div>
    </div>
    <iframe 
      class="preview-iframe" 
      data-src="../../../packages/component-rips/{slug}/index.html"
      loading="lazy"
      sandbox="allow-scripts allow-same-origin"
    ></iframe>
  </div>
  
  <!-- Existing actions/metadata -->
</div>
```

### CSS for Previews
```css
.preview-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #0a0c12;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(90, 192, 255, 0.15);
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  pointer-events: none; /* Prevent interaction in catalog */
  transform: scale(0.5);
  transform-origin: top left;
  width: 200%;
  height: 200%;
}

.preview-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f141d, #0a0c12);
}
```

### Lazy Loading with Intersection Observer
```javascript
const previewObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const iframe = entry.target.querySelector('.preview-iframe');
      if (iframe && !iframe.src) {
        iframe.src = iframe.dataset.src;
        iframe.onload = () => {
          entry.target.querySelector('.preview-placeholder').style.display = 'none';
        };
      }
      previewObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: '50px' });

// Observe all preview containers
document.querySelectorAll('.preview-container').forEach(container => {
  previewObserver.observe(container);
});
```

## Performance Considerations

### 1. Limit Active Previews
- Only load previews for visible cards
- Unload previews when scrolled out of view
- Maximum 6-8 active previews at once

### 2. Component Classification
Add to `meta.json`:
```json
{
  "preview": {
    "type": "iframe" | "thumbnail" | "none",
    "complexity": "simple" | "medium" | "complex"
  }
}
```

### 3. Virtual Scrolling
For 150+ components, implement virtual scrolling:
- Only render visible cards + buffer
- Use libraries like `react-window` or custom implementation
- Maintain smooth scrolling experience

### 4. Thumbnail Generation
- Generate static thumbnails during build
- Use headless browser (Puppeteer/Playwright) to capture
- Store in `packages/component-rips/{slug}/thumbnail.png`
- Fallback to placeholder if thumbnail missing

## User Experience

### Grid View (Default)
- Cards with live previews
- Compact metadata
- Hover to see more details

### List View (Optional)
- More compact, preview on left
- Better for scanning many components
- Toggle between views

### Preview Interaction
- **Hover**: Show preview (if not already loaded)
- **Click preview**: Open full demo in new tab
- **Click "Open Demo"**: Same as current behavior

## Migration Path

1. **Week 1**: Add preview containers to existing cards (cursors/backgrounds only)
2. **Week 2**: Implement lazy loading and Intersection Observer
3. **Week 3**: Add thumbnail generation for complex components
4. **Week 4**: Virtual scrolling if needed (test with 50+ components first)

## Alternative: Hybrid Approach

### Option A: Preview Toggle
- Default: Show thumbnails/metadata only
- Toggle button: "Show Live Previews"
- When enabled: Load iframes for visible components
- User controls performance impact

### Option B: Preview on Hover
- Default: Thumbnail or placeholder
- Hover: Load live iframe preview
- Click: Open full demo
- Best of both worlds: fast initial load, live previews on demand

## Recommendation

**Start with Option B (Preview on Hover)** because:
1. ✅ Fast initial page load (thumbnails only)
2. ✅ Live previews available on demand
3. ✅ User controls when to load heavy content
4. ✅ Scales well to 150+ components
5. ✅ Can upgrade to always-on previews later if desired

Then add:
- Virtual scrolling if page becomes slow
- Thumbnail generation for better initial experience
- Progressive enhancement based on user feedback

