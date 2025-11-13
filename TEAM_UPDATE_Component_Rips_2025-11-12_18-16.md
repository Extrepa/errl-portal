# Team Update — Component_Rips (2025-11-12_18-16)

## Inventory

**File type counts:**

- `.html`: 49
- `(no ext)`: 5
- `.css`: 5
- `.js`: 4
- `.tsx`: 4
- `.ds_store`: 3
- `.zip`: 2

**Folder Tree (truncated):**

```
├─ Component_Rips
│  ├─ .DS_Store
│  ├─ Bubble_Mouse_Trail
│  │  ├─ component.html
│  │  ├─ component.tsx
│  │  ├─ script.js
│  │  └─ style.css
│  ├─ Clean_Components_v2_Portable
│  │  ├─ .DS_Store
│  │  ├─ Ascii Flow Trail_portable.html
│  │  ├─ BaseBox by Framify_portable.html
│  │  ├─ BubbleBuster_portable.html
│  │  ├─ Bubbling Cursor_portable.html
│  │  ├─ Confetticon-preview_portable.html
│  │  ├─ Motion Trace Cursor_portable.html
│  │  ├─ My Framer Site-2_portable.html
│  │  ├─ My Framer Site_3_portable.html
│  │  ├─ My Framer Site_portable.html
│  │  ├─ PixelTrailFX_portable.html
│  │  ├─ Spiral: Free UI Component by Floris ╬ôC╠ºo╠ê Framer Marketplace_portable.html
│  │  ├─ Squirkle | Superellipse Component for Framer_portable.html
│  │  └─ index.html
│  ├─ Holographic Cursor Trail
│  │  ├─ component.html
│  │  ├─ component.tsx
│  │  ├─ script.js
│  │  └─ style.css
│  ├─ Mimic_Kit_v1
│  │  ├─ .DS_Store
│  │  ├─ base.css
│  │  ├─ components
│  │  │  ├─ cursor_trail.html
│  │  │  ├─ pixel_trail.html
│  │  │  └─ wire_grid.html
│  │  └─ index.html
│  └─ Newer
│     ├─ 1index.html
│     ├─ Holographic Cursor Trail.zip
│     ├─ Holographic Cursor Trail_portable.html
│     ├─ Liquid Heading_portable.html
│     ├─ My Framer Site_10_portable.html
│     ├─ My Framer Site_5_portable.html
│     ├─ My Framer Site_6_portable.html
│     ├─ My Framer Site_7_portable.html
│     ├─ My Framer Site_8_portable.html
│     ├─ My Framer Site_9_portable.html
│     ├─ Pixel Mouse Trail | Framer Component_portable.html
│     ├─ Web Cam Effects Components_portable.html
│     └─ index.html
└─ __MACOSX
   └─ Component_Rips
      ├─ ._.DS_Store
      ├─ ._Bubble_Mouse_Trail
      ├─ ._Holographic Cursor Trail
      ├─ Bubble_Mouse_Trail
      │  ├─ ._component.html
      │  ├─ ._component.tsx
      │  ├─ ._script.js
      │  └─ ._style.css
      ├─ Clean_Components_v2_Portable
      │  ├─ ._.DS_Store
      │  └─ ._index.html
      ├─ Holographic Cursor Trail
      │  ├─ ._component.html
      │  ├─ ._component.tsx
      │  ├─ ._script.js
      │  └─ ._style.css
      ├─ Mimic_Kit_v1
      │  ├─ ._.DS_Store
      │  └─ components
      │     ├─ ._cursor_trail.html
      │     ├─ ._pixel_trail.html
      │     └─ ._wire_grid.html
      └─ Newer
         ├─ ._1index.html
         ├─ ._Holographic Cursor Trail.zip
         ├─ ._Holographic Cursor Trail_portable.html
         ├─ ._Liquid Heading_portable.html
         ├─ ._My Framer Site_10_portable.html
         ├─ ._My Framer Site_5_portable.html
         ├─ ._My Framer Site_6_portable.html
         ├─ ._My Framer Site_7_portable.html
         ├─ ._My Framer Site_8_portable.html
         ├─ ._My Framer Site_9_portable.html
         ├─ ._Pixel Mouse Trail | Framer Component_portable.html
         ├─ ._Web Cam Effects Components_portable.html
         └─ ._index.html
```

## Proposed Action Plan

1. **Normalize each component to a standalone bundle** (index.html + styles.css + script.js + assets folder). Ensure all Framer/React-specific logic has a plain JS fallback.

2. **Auto-Extractor Tool**: build a small parser that ingests each HTML/JS/SVG and rewrites:

   - Inline scripts → module pattern
   - External Framer/TS → plain JS with DOM hooks
   - Replace proprietary event systems with standard `addEventListener`

3. **Component Catalog App**: one-page browser to preview every component, with filters by type (SVG, shader, UI, background), demo knobs, and an "Export ZIP" button per component.

4. **Portal Integration**: wrap chosen components as tiles in Errl Portal with midi/mic hooks and Glow (G) toggle.

5. **QA Harness**: each component loads under `file://` with no CORS, mobile-friendly, and keyboard shortcuts standardized.


## Packaging Targets

- **/components/** — each component in its own folder

- **/catalog/** — index.html to browse/preview all

- **/shared/** — base CSS theme, utility JS (glow toggle, resize, safe loaders)

- **/scripts/convert/** — the HTML/SVG/JS extractor & normalizer


## Next 48‑Hour Deliverables

- Ship **catalog scaffolding** with auto-discovery of components. ✅ (`docs/catalog/component-rips/index.html` + manifest)

- Convert **5 high-value components** first:
  - ✅ Terrapin Whirl background (`packages/component-rips/terrapin-whirl`)
  - ✅ Rainbow Neural Pathways module (`packages/component-rips/rainbow-neural-pathways`)
  - ✅ WebCam Effects module (permission gated)
  - ✅ Bubbling Rainbow Rings cursor trail
  - ✅ Gradient Waves text headline

- Add **webcam module** as a reusable effect layer (done: WebCam Effects bundle + snapshot gallery).

## 2025-11-12 — Evening Sync

- Built manifest generator (`npm run catalog:component-rips`) that ingests bundle metadata and hydrates the catalog UI with filters, safety notes, and preview links.
- Normalized first wave of components with enforced no-autoplay rules (camera/audio gated behind explicit buttons).
- Updated backlog status to `normalized` for the converted assets; catalog highlights controls and safety expectations for each item.
- Next focus: batch two (Rainbow Tunnel BG, Rainbow Fluid Smoke cursor, Live Gradient Mixer module, Liquid Text FX, Ribbon Topology prop) + add Playwright smoke step for catalog previews.
