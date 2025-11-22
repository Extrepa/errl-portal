# Link Audit - errl-portal (2025-11-13)

This audit focuses on broken links and legacy paths that could cause 404s.

## Summary of Actions Taken

- Added SPA router redirects `/tools/*` → `/` and `/studio/*` → `/` in `src/portal/app/router.tsx`
- Added static redirect page `public/tools/index.html` that client-side redirects `/tools` to `/` and preserves subpaths

These changes prevent most legacy "tools" URLs from 404ing and align with the naming preference "studio".

## Findings

- Numerous references exist under archived directories (not modified):
  - `archive/docs-site-20251031/**`
  - `archive/component-rips-20251112/**`
  - `archive/portal-attic/**`
  These are kept for history; editing them is out-of-scope. Use redirects instead.

- Potentially problematic patterns found:
  - Absolute `file://` references (not valid on the web). Replace with relative paths or served assets.
  - Legacy `/tools/` paths in old docs or pages. Now covered via redirects.

## Recommended Next Fixes (Optional)

1) Replace remaining visible text "tools" with "studio" in active docs and UI copy.
2) For any external links pointing to deprecated routes, add explicit HTML redirect stubs under `public/` (e.g., `/public/tools/<app>/index.html`).
3) If deploying behind a server or CDN, add server-side redirects `/tools/* → /` to catch non-SPA hosts.

## Spot Examples (from grep)

- UI routes handled in SPA: `src/portal/app/router.tsx`
- Old pages with links: `src/legacy/portal/pages/studio/**`, `public/apps/**`
- `file://` references appear mainly in archived docs and examples.

## Validation Checklist

- Navigate to `/tools`, `/tools/anything`, `/studio`, `/studio/anything` and confirm you land on Studio.
- Click portal navigation links; confirm no 404s.
- Search console for 404 network errors on navigation.

