# Errl Portal

A comprehensive portal application with studio tools, component management, and visual editing capabilities.

## Overview

Errl Portal is a large-scale web application providing a portal interface with multiple apps including studio tools, component management, asset handling, and visual editing capabilities. Built with React, Vite, and Electron.

## Features

- Portal interface with multiple apps
- Studio tools for visual editing
- Component catalog and management
- Monaco editor integration
- Fabric.js canvas manipulation
- GSAP animations
- Playwright testing
- Electron desktop support

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# or
npm run portal:dev

# Build for production
npm run build
# or
npm run portal:build

# Preview with Electron
npm run preview
# or
npm run portal:preview
```

## Project Structure

See [INDEX.md](INDEX.md) for detailed project structure.

Key directories:
- `src/` - Application source code
- `electron/` - Electron main process
- `tools/` - Development and build tools
- `dist/` - Build output
- `tests/` - Test files

## Documentation

- [INDEX.md](INDEX.md) - Workspace index
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current status
- [Documentation Index](docs/index.md) - Complete documentation index with links to all docs
- [Purpose](PURPOSE.md) - Purpose and architecture documentation

### Verification & Implementation

- [Final Verification](FINAL_VERIFICATION.md) - Final verification report
- [Implementation Complete](IMPLEMENTATION_COMPLETE.md) - Implementation completion status
- [Testing Checklist](TESTING_CHECKLIST.md) - Comprehensive testing checklist
- [Testing Summary](TESTING_SUMMARY.md) - Testing summary

### Technical Documentation

- [Architecture](docs/architecture.md) - Technical architecture and design
- [Project Structure](docs/project-structure.md) - File organization and structure

See [Documentation Index](docs/index.md) for complete list of all verification and implementation documentation.

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run portal:dev` - Start portal dev server
- `npm run studio:dev` - Start studio dev server

### Building
- `npm run build` - Build portal
- `npm run portal:build` - Build portal
- `npm run studio:build` - Build studio

### Testing
- `npm test` - Run Playwright tests
- `npm run test:ui` - Run UI tests

### Tools
- `npm run portal:doctor:*` - Various diagnostic tools
- `npm run catalog:component-rips` - Generate component catalog
- `npm run thumbnails:generate` - Generate component thumbnails

## Dependencies

- React 19
- Vite
- Electron
- Monaco Editor
- Fabric.js
- GSAP
- Playwright
- React Router DOM
- Zod

## Development

This is a large project with multiple apps and tools. See the tools directory for various utilities and scripts.

## License

See project files for license information.
