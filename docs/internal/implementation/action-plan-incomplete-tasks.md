# Action Plan for Incomplete Tasks

**Created**: 2026-01-15  
**Purpose**: Prioritized action plan for completing or removing incomplete tasks  
**Based on**: `docs/audit-incomplete-tasks.md`

---

## Executive Summary

**Critical Issues**: 2 items (Paper.js utilities, keyboard shortcuts)  
**High Priority**: 1 item (stroke alignment)  
**Medium Priority**: 3 items (AI enhancements, template thumbnails, design system)  
**Low Priority**: 5 items (future features)  
**Cleanup**: 1 item (misleading TODO - already fixed)

---

## Priority 1: Critical - Must Fix Immediately

### 1.1 Paper.js Utilities Implementation

**Files Affected**:
- `src/shared/utils/paper.ts` - All 5 functions need implementation
- `src/apps/designer/src/utils/pathMerger.ts` - Uses `performBooleanOperationMultiple`
- `src/apps/designer/src/components/Editors/SVGEditor.tsx` - Uses `performBooleanOperation`, `loadPaperJS`
- `src/apps/designer/src/components/Inspector/SVGInspector.tsx` - Uses `simplifySvgPaths`, `expandStrokeToFill`

**Impact**: Features are broken - boolean operations, path simplification, and stroke expansion don't work

**Options**:

#### Option A: Install Paper.js Library (Recommended)
1. Install Paper.js: `npm install paper`
2. Implement `loadPaperJS()` to load the library
3. Implement boolean operations using Paper.js API
4. Implement path simplification using Paper.js
5. Implement stroke to fill using Paper.js or SVG manipulation

**Estimated Effort**: 4-6 hours  
**Dependencies**: Paper.js library (~200KB)

#### Option B: Use Alternative Libraries
1. Use `paper.js` or `js-svg-path` for path manipulation
2. Use `svg-path-properties` for path operations
3. Implement custom SVG manipulation

**Estimated Effort**: 8-12 hours  
**Dependencies**: Multiple smaller libraries

#### Option C: Browser-Native SVG APIs
1. Use native SVG path manipulation
2. Implement boolean operations using SVG filters or canvas
3. More complex but no dependencies

**Estimated Effort**: 12-16 hours  
**Dependencies**: None

**Recommendation**: Option A - Install Paper.js and implement properly

**Action Items**:
- [ ] Install Paper.js library
- [ ] Implement `loadPaperJS()` function
- [ ] Implement `performBooleanOperation()` using Paper.js
- [ ] Implement `performBooleanOperationMultiple()` using Paper.js
- [ ] Implement `simplifySvgPaths()` using Paper.js or alternative
- [ ] Implement `expandStrokeToFill()` using Paper.js or SVG manipulation
- [ ] Test all functions with real SVG data
- [ ] Update documentation

---

### 1.2 Keyboard Shortcuts Hook Implementation

**Files Affected**:
- `src/shared/hooks/index.ts` - Hook needs implementation
- `src/apps/designer/src/hooks/useKeyboardShortcuts.ts` - Uses the hook

**Impact**: Keyboard shortcuts (undo/redo/delete/deselect) don't work

**Implementation Plan**:

1. **Add event listeners** for keyboard events
2. **Handle shortcuts**:
   - `Ctrl+Z` / `Cmd+Z` → Undo
   - `Ctrl+Shift+Z` / `Cmd+Shift+Z` → Redo
   - `Delete` / `Backspace` → Delete
   - `Escape` → Deselect
3. **Clean up** listeners on unmount
4. **Platform detection** for Mac vs Windows shortcuts

**Code Structure**:
```typescript
export function useKeyboardShortcutsSimple(options?: {
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onDeselect?: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Implementation
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options]);
}
```

**Estimated Effort**: 2-3 hours

**Action Items**:
- [ ] Implement keyboard event listeners
- [ ] Handle platform differences (Mac vs Windows)
- [ ] Implement undo/redo handlers
- [ ] Implement delete handler
- [ ] Implement deselect handler
- [ ] Add cleanup on unmount
- [ ] Test all shortcuts
- [ ] Update documentation

---

## Priority 2: High Priority - Should Fix Soon

### 2.1 Stroke Alignment Implementation

**Files Affected**:
- `src/apps/designer/src/utils/strokeAlignment.ts` - All functions are placeholders

**Impact**: Advanced stroke alignment features don't work

**Implementation Options**:

1. **Use SVG path offset library** (e.g., `svg-path-properties`)
2. **Implement custom path offset algorithm**
3. **Document as future feature** if too complex

**Estimated Effort**: 8-12 hours (if implementing) or 1 hour (if documenting)

**Action Items**:
- [ ] Research path offset algorithms
- [ ] Decide: implement or document as future feature
- [ ] If implementing: use library or custom algorithm
- [ ] If documenting: add to future features list
- [ ] Update code comments

---

## Priority 3: Medium Priority - Nice to Have

### 3.1 AI Service Enhancements

**Files Affected**:
- `src/apps/designer/src/services/aiService.ts` - Two TODOs

**Enhancements**:
1. **Prompt Parsing** (line 64): Use Gemini for complex prompts
2. **Auto Layout** (line 118): Implement AI-based layout

**Impact**: Limited functionality, but current implementation works

**Action Items**:
- [ ] Document as future enhancement
- [ ] Or implement Gemini integration for prompt parsing
- [ ] Or implement better auto layout algorithm

**Estimated Effort**: 4-8 hours (if implementing) or 1 hour (if documenting)

---

### 3.2 Template Thumbnail Generation

**Files Affected**:
- `src/apps/designer/src/utils/templateManager.ts` - Thumbnail generation is placeholder

**Impact**: Templates work but don't have thumbnails

**Implementation Options**:
1. Generate thumbnails from SVG on the fly
2. Pre-generate thumbnails and store
3. Use canvas to render SVG to image

**Estimated Effort**: 3-4 hours

**Action Items**:
- [ ] Implement SVG to image conversion
- [ ] Generate thumbnails on template save
- [ ] Store thumbnails with templates
- [ ] Display thumbnails in UI

---

### 3.3 Design System Integration

**Files Affected**:
- `src/apps/designer/src/components/MainLayout.tsx` - ThemeControls commented out

**Impact**: Theme controls not available

**Action Items**:
- [ ] Check if design system package exists
- [ ] If exists: uncomment and test
- [ ] If not: remove comment or document dependency

**Estimated Effort**: 1 hour

---

## Priority 4: Low Priority - Future Features

### 4.1 Collaboration Service
- **Status**: Placeholder simulation
- **Action**: Document as future feature
- **Effort**: 1 hour (documentation)

### 4.2 Extension System
- **Status**: Placeholder UI
- **Action**: Document as future feature or implement
- **Effort**: 1 hour (documentation) or 20+ hours (implementation)

### 4.3 Component to Asset Conversion
- **Status**: Placeholder comment
- **Action**: Document as future feature
- **Effort**: 1 hour (documentation)

### 4.4 Vibe Parameter Copying
- **Status**: Placeholder comment
- **Action**: Document as future feature
- **Effort**: 1 hour (documentation)

### 4.5 Cleanup Utils
- **Status**: Placeholder comment
- **Action**: Check if used, remove if not
- **Effort**: 30 minutes

---

## Implementation Timeline

### Week 1: Critical Fixes
- Day 1-2: Paper.js utilities implementation
- Day 3: Keyboard shortcuts hook implementation
- Day 4: Testing and documentation

### Week 2: High Priority
- Day 1-2: Stroke alignment (implement or document)
- Day 3: Code review and cleanup

### Week 3: Medium Priority
- Day 1: Design system check
- Day 2: Template thumbnails
- Day 3: AI service documentation/enhancement

### Week 4: Low Priority & Cleanup
- Day 1-2: Document future features
- Day 3: Final review and documentation updates

---

## Quick Wins (Can Do Immediately)

1. ✅ **Remove misleading TODO** from historyManager (DONE)
2. **Check design system availability** - 15 minutes
3. **Document future features** - 2 hours
4. **Update completion checklists** - 1 hour

---

## Dependencies and Blockers

### Paper.js Implementation
- **Blockers**: None
- **Dependencies**: Paper.js library
- **Risk**: Low - library is well-maintained

### Keyboard Shortcuts
- **Blockers**: None
- **Dependencies**: None
- **Risk**: Low - straightforward implementation

### Stroke Alignment
- **Blockers**: Complex algorithm needed
- **Dependencies**: Path offset library or custom implementation
- **Risk**: Medium - may need research

---

## Success Criteria

### Critical Items
- [ ] All Paper.js functions work with real SVG data
- [ ] Keyboard shortcuts work in designer app
- [ ] No console warnings for missing implementations

### High Priority Items
- [ ] Stroke alignment implemented or documented
- [ ] Code is clean and maintainable

### Medium Priority Items
- [ ] Template thumbnails work or limitation documented
- [ ] Design system status determined
- [ ] AI enhancements documented or implemented

### Low Priority Items
- [ ] Future features documented
- [ ] Unused placeholders removed

---

## Notes

- Paper.js and keyboard shortcuts are actively used and must be fixed
- Other items can be prioritized based on user needs
- Some items may be better documented as future features than implemented now
- Regular code reviews should catch new incomplete implementations

---

**Last Updated**: 2026-01-15  
**Next Review**: After implementing critical items
