# Integration Points Documentation

This document describes API endpoints, file sharing mechanisms, and integration points for connecting external projects to the Errl Portal.

## Table of Contents

1. [Component Library API](#component-library-api)
2. [Asset Bridge Protocol](#asset-bridge-protocol)
3. [Export Functionality](#export-functionality)
4. [File Sharing Mechanisms](#file-sharing-mechanisms)
5. [Future Integration Points](#future-integration-points)

## Component Library API

### Overview

The Studio Component Library connects to an external API server to fetch component registry data and preview components.

### Endpoints

#### Component Registry

- **URL**: `http://localhost:8080/data/master-component-registry.json`
- **Method**: GET
- **Response**: JSON object with `components` array
- **Location**: `src/apps/studio/src/app/pages/StudioComponentLibrary.tsx`

```typescript
const REGISTRY_URL = 'http://localhost:8080/data/master-component-registry.json';
```

#### Component Structure

```typescript
interface Component {
  id: string;
  name: string;
  description: string;
  category: string[];
  tags: string[];
  location: {
    primary: string;
    source: string;
  };
  quality?: {
    score: number;
  };
  usage?: {
    count: number;
  };
  thumbnail?: string;
  codeSnippet?: string;
  props?: {
    options?: Record<string, any>;
  };
}
```

#### Preview Server

- **Base URL**: `http://localhost:8080`
- **Purpose**: Serves component previews and assets
- **Usage**: Component previews are loaded from this server
- **Location**: `src/apps/studio/src/app/pages/StudioComponentLibrary.tsx`

```typescript
const PREVIEW_SERVER = 'http://localhost:8080';
```

### Integration Notes

- The component library fetches the registry on mount
- Supports basic and full-text search modes
- Category filtering available
- Component selection and preview functionality
- Requires API server to be running at `localhost:8080`

## Asset Bridge Protocol

### Overview

The Asset Bridge enables communication between embedded iframes (like the Pin Designer) and the Studio hub for saving, loading, and managing design assets.

### Protocol Specification

The bridge uses `postMessage` for cross-frame communication with a request/response pattern.

### Message Types

#### Request Messages (iframe → parent)

```typescript
type LegacyAssetRequest =
  | { type: 'legacy-asset:list'; requestId?: string }
  | { type: 'legacy-asset:get'; requestId?: string; payload?: { id?: string } }
  | { type: 'legacy-asset:save'; requestId?: string; payload?: { id?: string; name?: string; mimeType?: string; dataUrl?: string } }
  | { type: 'legacy-asset:remove'; requestId?: string; payload?: { id?: string } };
```

#### Response Messages (parent → iframe)

```typescript
type LegacyAssetResponse =
  | { type: 'legacy-asset:list:response'; requestId?: string; payload: Array<{ id: string; name?: string; type?: string; size?: number; updatedAt?: number }> }
  | { type: 'legacy-asset:get:response'; requestId?: string; payload: { id: string; dataUrl: string | null } }
  | { type: 'legacy-asset:save:response'; requestId?: string; payload: { id: string; name?: string; type?: string; size?: number } }
  | { type: 'legacy-asset:remove:response'; requestId?: string; payload: { id: string } }
  | { type: 'legacy-asset:error'; requestId?: string; payload: { message: string } };
```

### Implementation

#### Pin Designer Bridge Client

**Location**: `src/apps/static/pages/pin-designer/pin-designer.html`

The pin designer creates a bridge interface that communicates with the parent window:

```javascript
const pinAssetBridge = {
  available: boolean,
  list: () => Promise<Array<Asset>>,
  get: (id: string) => Promise<{ id: string; dataUrl: string }>,
  save: (payload: { id?: string; name: string; mimeType: string; dataUrl: string }) => Promise<{ id: string }>,
  remove: (id: string) => Promise<void>
};
```

#### Studio Hub Bridge Handler

**Location**: `src/apps/studio/src/app/hooks/useLegacyAssetBridge.ts`

The Studio hub listens for bridge messages and handles them using the asset store:

- `listAssets()` - Lists all saved assets
- `getAssetBlob(id)` - Retrieves an asset by ID
- `saveAsset({ id, name, type, size, blob })` - Saves an asset
- `removeAsset(id)` - Removes an asset

### Integration Notes

- Bridge is only available when Pin Designer runs in Studio context (iframe)
- Uses `postMessage` with `*` target origin (parent-child relationship)
- Request/response pattern with unique request IDs
- 12-second timeout for requests
- Data is transferred as base64 data URLs for design snapshots

## Export Functionality

### Main Portal Exports

#### HTML Snapshot Export

- **Button ID**: `exportHtmlBtn`
- **Location**: `src/apps/landing/scripts/portal-app.js`
- **Functionality**: Exports current portal state as standalone HTML with embedded settings
- **Settings Captured**:
  - Hue controller layers
  - GL overlay settings
  - Background bubbles settings
  - Navigation settings
  - Rising bubbles settings
  - Goo effect settings
- **Output**: HTML file with embedded JSON settings and timestamp

#### PNG Snapshot Export

- **Button ID**: `snapshotPngBtn`
- **Location**: `src/apps/landing/scripts/portal-app.js`
- **Functionality**: Captures portal as PNG screenshot
- **Method**: Uses `window.errlGLScreenshot()` if available, otherwise falls back to `html2canvas`
- **Output**: PNG file with timestamp in filename

#### Save/Reset Defaults

- **Buttons**: `saveDefaultsBtn`, `resetDefaultsBtn`
- **Storage**: localStorage
- **Keys**: 
  - `errl_gl_overlay`
  - `errl_gl_bubbles`
  - `errl_nav_goo_cfg`
  - `errl_rb_settings`
  - `errl_goo_cfg`
  - `errl_hue_layers`

### Pin Designer Exports

#### SVG Export

- **Button ID**: `exportSVG`
- **Location**: `src/apps/static/pages/pin-designer/pin-designer.html`
- **Functionality**: Exports current pin design as standalone SVG
- **Output**: `errl-painted.svg`

#### PNG Export

- **Button ID**: `exportPNG`
- **Location**: `src/apps/static/pages/pin-designer/pin-designer.html`
- **Functionality**: Converts SVG to PNG and downloads
- **Output**: `errl-painted.png`

### Integration Notes

- All exports use browser download API (`<a>` element with `download` attribute)
- Files are created as Blobs and downloaded client-side
- Export functions can be called programmatically for automation

## File Sharing Mechanisms

### Asset Storage

Assets are stored using the asset store utilities:

**Location**: `src/shared/utils/assetStore.js`

- Stores assets with metadata (id, name, type, size, updatedAt)
- Supports blob storage
- Provides list, get, save, remove operations

### Design Snapshots

Pin Designer uses design snapshots for saving/loading:

- **Encoding**: Base64 data URLs
- **Format**: JSON with design state and metadata
- **Structure**: Contains region colors, finishes, plating, wires, etc.

### Shared Assets

Portal assets are served from:

- **Shared assets**: `/shared/assets/`
- **Shared styles**: `/shared/styles/`
- **Shape-madness content**: `/studio/shape-madness/content/`

### Integration Notes

- Assets can be referenced cross-page using relative URLs
- Shared assets are copied to build output during build process
- Design snapshots can be exported/imported as JSON

## Future Integration Points

### External Project Connections

#### 1. Component Library Integration

External projects can integrate by:

- Providing component registry JSON at expected endpoint
- Serving component previews from preview server
- Matching component structure format
- Supporting search and filtering requirements

**API Contract**:
```
GET /data/master-component-registry.json
→ { components: Component[] }
```

#### 2. Design Tool Integration

External design tools can integrate via:

- Implementing Asset Bridge protocol
- Supporting postMessage communication
- Providing design snapshot format
- Handling save/load/delete operations

**Bridge Contract**:
- Implement `pinAssetBridge` interface
- Use postMessage with request/response pattern
- Support timeout handling (12 seconds)

#### 3. Export Integration

External projects can add export functionality by:

- Implementing export button handlers
- Using browser download API
- Creating appropriate file formats (SVG, PNG, HTML)
- Embedding settings/metadata in exports

#### 4. File Sharing Integration

External projects can share files by:

- Using asset store utilities
- Implementing bridge protocols
- Supporting design snapshot format
- Providing download/upload endpoints

### API Server Requirements

For full functionality, an API server should provide:

1. **Component Registry Endpoint**
   - Serve JSON at `/data/master-component-registry.json`
   - Support CORS if needed
   - Return component array with required structure

2. **Preview Server**
   - Serve component previews
   - Support iframe embedding
   - Provide asset access

3. **Asset Storage** (if using server-side storage)
   - REST API for CRUD operations
   - Support for design snapshots
   - Metadata management

### Testing Integration Points

Test files for integration:

- `tests/functionality-api.spec.ts` - API connection tests
- `tests/functionality-library.spec.ts` - Library/bridge tests
- `tests/functionality-export.spec.ts` - Export functionality tests

### Configuration

Integration points can be configured via:

- Environment variables
- Configuration files
- Runtime settings
- Build-time constants

### Security Considerations

- Asset Bridge uses `*` origin (parent-child relationship)
- API endpoints should implement CORS appropriately
- File downloads are client-side (no server upload)
- Design snapshots contain design data (consider size limits)

## Summary

The Errl Portal provides multiple integration points:

1. **Component Library API** - External component registry and preview
2. **Asset Bridge Protocol** - Cross-frame communication for design tools
3. **Export Functionality** - Client-side file generation and download
4. **File Sharing** - Asset storage and design snapshots

External projects can integrate by:
- Implementing API endpoints
- Using Asset Bridge protocol
- Providing compatible data formats
- Following established patterns

For questions or additional integration requirements, refer to the source code implementations in the locations specified above.
