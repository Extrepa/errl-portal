# Architecture Documentation

**Project:** errl-portal
**Type:** Web App
**Last Updated:** 2026-01-09

## Technical Architecture

### Technology Stack

- **React**
- **Monaco Editor**
- **Fabric.js**
### Project Type

Web App

## Architecture Overview

errl-portal is a comprehensive portal application serving as a hub for multiple tools and applications. It provides studio tools, component management, asset handling, and visual editing capabilities.

### Core Architecture

**Technical Stack:**
- React 19 - UI framework
- Vite - Build tool
- Electron - Desktop support
- Monaco Editor - Code editing
- Fabric.js - Canvas manipulation
- GSAP - Animations
- Playwright - Testing

### Multi-App Portal Structure

**Apps:**
- **Portal Interface** - Main navigation and hub
- **Studio Application** - Visual editing tools
- **Landing Page** - Public-facing interface
- **Static Pages** - Legacy HTML pages

**Components:**
- Shared utilities (`src/shared/`)
- Portal components (`src/components/`)
- App-specific code (`src/apps/`)

### Key Integrations

**Monaco Editor:**
- Code editing capabilities
- Syntax highlighting
- Multi-file editing

**Fabric.js:**
- Canvas manipulation
- Visual editing tools
- Object transformation

**GSAP:**
- Animations
- Transitions
- Timeline control

## Key Design Decisions

### Portal/Launcher Architecture
- **Rationale**: Central hub for multiple tools
- **Benefit**: Unified access to all tools
- **Implementation**: Multi-app structure

### Component Sharing Strategy
- **Uses**: `errl-portal-shared` for portal-specific components
- **References**: `all-components` for catalog only
- **Does not import directly**: Maintains separation

### Electron Support
- **Rationale**: Desktop app capability
- **Benefit**: Native app experience
- **Implementation**: Electron main process

## Dependencies
- `@monaco-editor/react` - Monaco Editor React wrapper
- `fabric` - Canvas manipulation
- `flubber` - Path morphing
- `gsap` - Animation library
- `jszip` - ZIP file handling
- `lucide-react` - Icons
- `monaco-editor` - Code editor
- `playwright` - Testing framework
- `react`, `react-dom` - UI framework

## Design Patterns

### Multi-App Pattern
- Each app is independent
- Shared components and utilities
- Portal coordinates navigation

### Component Catalog
- References external components
- Preview functionality
- Does not import directly

## Performance Considerations

### Large Project Size
- 1.7GB total (575MB node_modules, 505MB archive)
- Archive folder cleanup recommended
- Efficient code splitting

### Testing
- Playwright test suite
- Comprehensive test coverage
- Performance testing

## Related Documentation

- [Purpose](../PURPOSE.md) - Purpose and architecture
- [Project Structure](project-structure.md) - File organization
