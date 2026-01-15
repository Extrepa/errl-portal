# Future Features Documentation

**Created**: 2026-01-15  
**Purpose**: Document placeholder features and future enhancements  
**Status**: Planning / Future Work

---

## Overview

This document tracks features that are currently placeholders or documented as future work. These features are not critical for current functionality but represent potential enhancements.

---

## Designer App Future Features

### 1. Collaboration Service

**File**: `src/apps/designer/src/services/collaborationService.ts`  
**Status**: Placeholder simulation  
**Current**: Simulates connection, doesn't provide real-time collaboration  
**Future**: Implement real-time collaboration using WebSockets or similar

**Requirements**:
- WebSocket server or service
- Real-time synchronization
- Conflict resolution
- User presence indicators

**Priority**: Low

---

### 2. Extension System

**File**: `src/apps/designer/src/components/Extensions/ExtensionManager.tsx`  
**Status**: Placeholder UI  
**Current**: Shows placeholder instead of extension UI  
**Future**: Implement extension system

**Requirements**:
- Extension API
- Extension registry
- Extension loading/unloading
- Extension UI

**Priority**: Low

---

### 3. Component to Asset Conversion

**File**: `src/apps/designer/src/components/Inspector/SceneInspector.tsx:485`  
**Status**: Placeholder comment  
**Current**: Comment says "would need actual flattening logic"  
**Future**: Implement component flattening to create standalone assets

**Requirements**:
- Flattening algorithm
- Asset export format
- Dependency resolution

**Priority**: Low

---

### 4. Vibe Parameter Copying

**File**: `src/apps/designer/src/components/Inspector/SceneInspector.tsx:516`  
**Status**: Placeholder comment  
**Current**: Comment says "placeholder"  
**Future**: Implement copying vibe parameters between components

**Requirements**:
- Vibe parameter extraction
- Parameter application
- Validation

**Priority**: Low

---

### 5. Template Thumbnail Generation

**File**: `src/apps/designer/src/utils/templateManager.ts:28`  
**Status**: Placeholder  
**Current**: Returns placeholder instead of actual thumbnail  
**Future**: Generate thumbnails from SVG

**Implementation Options**:
1. Canvas-based rendering
2. Server-side generation
3. Pre-generate on save

**Priority**: Medium

---

### 6. AI Service Enhancements

**File**: `src/apps/designer/src/services/aiService.ts`  
**Status**: Partial implementation

#### 6.1 Prompt Parsing (Line 64)
**Current**: Keyword-based implementation  
**Future**: Use Gemini API for complex prompt parsing  
**Priority**: Medium

#### 6.2 Auto Layout (Line 118)
**Current**: Simple grid layout  
**Future**: AI-based layout optimization  
**Priority**: Medium

---

### 7. Stroke Alignment

**File**: `src/apps/designer/src/utils/strokeAlignment.ts`  
**Status**: Placeholder implementation  
**Current**: Placeholder - requires complex path offset algorithm  
**Future**: Implement full stroke alignment (inside/outside/center)

**Requirements**:
- Path offset algorithm
- SVG path manipulation
- Library: `svg-path-properties` or custom implementation

**Priority**: High (advanced feature)

---

### 8. Design System Integration

**File**: `src/apps/designer/src/components/MainLayout.tsx:10`  
**Status**: Commented out import  
**Current**: ThemeControls import is commented  
**Future**: Re-enable when design system is available

**Action**: Check if `@errl-design-system` package exists, re-enable or remove comment

**Priority**: Low

---

## Portal App Future Features

### 9. Background/Shader Experimentation System

**Status**: Planning phase  
**Reference**: `05-Logs/Daily/2026-01-15-future-plans.md`

**Future**: Create system to test different background/shader methods

**Approach Options**:
1. Configuration-based system
2. A/B testing system
3. Modular background manager

**Priority**: High (from roadmap)

---

### 10. Gallery Rebuild

**Status**: "Coming Soon" placeholder  
**Reference**: `05-Logs/Daily/2026-01-15-future-plans.md`

**Future**: Rebuild with photo albums

**Questions to Resolve**:
- Database vs static JSON/manifest
- Expected scale
- Upload system needed?

**Priority**: Medium (from roadmap)

---

### 11. Errl Chat Rebuild

**Status**: "Coming Soon" placeholder  
**Reference**: `05-Logs/Daily/2026-01-15-future-plans.md`

**Future**: Rebuild chat experience

**Priority**: Low (back burner)

---

## Implementation Notes

### When to Implement

1. **User Request**: If users request these features
2. **Roadmap Priority**: Based on roadmap priorities
3. **Dependencies**: When dependencies become available
4. **Time Available**: When time allows for enhancement work

### How to Track

- Check this document for status
- Update as features are implemented
- Remove from this doc when complete
- Add new placeholders as they're discovered

---

## Related Documentation

- `docs/audit-incomplete-tasks.md` - Complete audit of incomplete items
- `docs/action-plan-incomplete-tasks.md` - Prioritized action plan
- `05-Logs/Daily/2026-01-15-future-plans.md` - Future roadmap

---

**Last Updated**: 2026-01-15  
**Next Review**: As features are implemented or priorities change
