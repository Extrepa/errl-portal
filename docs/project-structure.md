# Project Structure Documentation

**Project:** errl-portal
**Last Updated:** 2026-01-09

## Directory Structure
```
errl-portal/
├── README.md              # Main project documentation
├── PURPOSE.md             # Project purpose
├── package.json           # Dependencies and scripts
├── src/                   # Source code
│   ├── apps/             # Multi-app structure
│   ├── shared/           # Shared utilities
│   └── components/        # Portal components
├── docs/                  # Documentation
│   ├── internal/         # Internal development docs
│   │   ├── verification/ # Verification reports
│   │   ├── deployment/   # Deployment logs
│   │   ├── testing/      # Testing summaries
│   │   └── implementation/ # Implementation logs
│   ├── architecture.md   # Technical architecture
│   ├── project-structure.md # This file
│   └── effects-master-reference.md # Effects reference
├── tests/                 # Test files
└── tools/                 # Development tools
```

## File Organization

### Core Files

- Configuration files (package.json, tsconfig.json, etc.)
- Entry points (index.html, main.js, etc.)
- Source code directories

### Documentation

- `README.md` - Main project documentation (root)
- `PURPOSE.md` - Project purpose (root)
- `docs/` - Organized documentation
  - Public docs: architecture, project structure, effects reference
  - Internal docs: verification, deployment, testing, implementation logs

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
