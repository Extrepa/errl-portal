# Errl Portal - Purpose and Architecture

**Created:** 2027-01-07  
**Purpose:** Document the purpose, architecture, and relationships of errl-portal

---

## Overview

`errl-portal` is a comprehensive portal application that serves as a hub for multiple tools and applications. This document clarifies its purpose and how it relates to other projects.

---

## Purpose

### Primary Function

**Errl Portal is a portal/launcher application** that provides:
- Access to multiple tools and applications
- Component catalog and management
- Studio tools for visual editing
- Asset handling and management
- Monaco editor integration
- Fabric.js canvas manipulation

### Architecture

**Multi-App Portal:**
- Portal interface with navigation
- Multiple apps accessible from portal
- Shared components and utilities
- Component catalog system

---

## Relationship to Other Projects

### Uses Components From

1. **`errl-portal-shared`**
   - Location: `all-components/errl-portal-shared/`
   - Purpose: Shared components for portal
   - Components: bubble-mouse-trail, gravity-sticker-field, etc.

2. **`all-components`** (Reference)
   - Uses for component catalog
   - References for examples
   - Does not import directly

### Integrates With

1. **Monaco Editor**
   - Code editing capabilities
   - Syntax highlighting
   - Multi-file editing

2. **Fabric.js**
   - Canvas manipulation
   - Visual editing tools

3. **GSAP**
   - Animations
   - Transitions

---

## Project Structure

```
errl-portal/
├── src/
│   ├── apps/
│   │   ├── studio/          # Studio application
│   │   ├── landing/         # Landing page
│   │   └── static/          # Static pages
│   ├── shared/              # Shared utilities
│   └── components/          # Portal components
├── electron/                # Electron main process
├── tools/                   # Development tools
└── tests/                   # Test files
```

---

## Key Features

### Portal Interface

- Navigation between apps
- Component catalog
- Asset management
- Tool access

### Studio Application

- Visual editing tools
- Canvas manipulation
- Component management
- Asset handling

### Component Catalog

- Browse components from multiple projects
- Preview components
- Reference implementations
- Component management

---

## Component Usage

### From `errl-portal-shared`

```tsx
// Portal uses components from errl-portal-shared
import { GravityStickerField } from '@/all-components/errl-portal-shared/projects/gravity-sticker-field';
import { RippleFace } from '@/all-components/errl-portal-shared/projects/ripple-face';
```

### Component Catalog

- References `all-components` for catalog
- Displays components from multiple projects
- Provides preview functionality
- Does not import directly

---

## Technology Stack

- **React** - UI framework
- **Vite** - Build tool
- **Electron** - Desktop support
- **Monaco Editor** - Code editing
- **Fabric.js** - Canvas manipulation
- **GSAP** - Animations
- **Playwright** - Testing

---

## Future Plans

### Clarification Needed

1. **Is it a launcher or separate app?**
   - Current: Appears to be portal/launcher
   - Needs: Clear documentation

2. **Component sharing strategy**
   - Current: Uses `errl-portal-shared`
   - Needs: Clear guidelines

3. **Relationship to other projects**
   - Current: Uses components from multiple sources
   - Needs: Documented relationships

---

## Recommendations

1. **Document as Portal/Launcher**
   - Primary purpose: Portal for multiple tools
   - Secondary: Individual applications

2. **Clarify Component Strategy**
   - Use `errl-portal-shared` for portal-specific components
   - Reference `all-components` for catalog only
   - Use `Errl_Components` for 3D components if needed

3. **Update Documentation**
   - Add architecture diagram
   - Document app structure
   - Clarify relationships

---

## References

- [Component Library Strategy](../COMPONENT_LIBRARY_STRATEGY.md)
- [Project Similarity Analysis](../PROJECT_SIMILARITY_ANALYSIS.md)
- [Project Relationships](../PROJECT_RELATIONSHIPS.md)
