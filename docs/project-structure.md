# Project Structure Documentation

**Project:** errl-portal
**Last Updated:** 2026-01-09

## Directory Structure
```
errl-portal/
- `05-Logs/`
  - `Daily/`
- `ADDITIONAL_FIXES_COMPLETED.md`
- `COMPREHENSIVE_FIXES_SUMMARY.md`
- `DESIGN_SYSTEM_MIGRATION_NOTES.md`
- `FINAL_VERIFICATION.md`
- `FIXES_VERIFICATION.md`
- `GRID_LAYOUT_VERIFICATION_COMPLETE.md`
- `IMPLEMENTATION_COMPLETE.md`
- `IMPLEMENTATION_SUMMARY.md`
- `IMPLEMENTATION_VERIFICATION_COMPLETE.md`
- `INDEX.md`
- `NAV_BUBBLES_AND_TABS_VERIFICATION.md`
- `PROJECT_STATUS.md`
- `README.md`
  ... (28 more items)
```

## File Organization

### Core Files

- Configuration files (package.json, tsconfig.json, etc.)
- Entry points (index.html, main.js, etc.)
- Source code directories

### Documentation

- Root documentation files
- docs/ directory (this directory)
- README.md

### Build and Distribution

- Build output directories
- Distribution files
- Compiled assets

## Key Directories

### `src/` - Source Code
- `apps/` - Multi-app structure
  - `studio/` - Studio application
  - `landing/` - Landing page
  - `static/` - Static pages
- `shared/` - Shared utilities
- `components/` - Portal components

### `electron/` - Electron Main Process
- Window management
- Desktop app integration

### `tests/` - Playwright Tests
- `accessibility.spec.ts`
- `effects.spec.ts`
- `pages.spec.ts`
- `studio.spec.ts`
- `ui.spec.ts`
- And 8 more test files

### `archive/` - Archived Files (505MB)
- `snapshots/` - Project snapshots (277MB)
- `site-trim-20251222/` - Archived site version (170MB)
- `docs-site-20251031/` - Archived docs (46MB)
- Legacy backups and old versions

### `docs/` - Documentation
- Architecture, project structure, completion checklist

## File Naming Conventions

- React components: PascalCase (e.g., `StudioProjects.tsx`)
- TypeScript: camelCase files
- Test files: `*.spec.ts`

## Import/Export Structure

- ES modules
- TypeScript
- React components
- Multi-app routing
- Shared utilities
