# Deployment Fix - External Dependency Issue

**Date**: 2026-01-13  
**Status**: ⚠️ **CSS Fixed, TypeScript Imports May Still Fail**

## Issue

GitHub Actions build failed with:
```
Could not load /home/runner/work/errl-portal/all-components/errl-design-system/src/styles/errlDesignSystem.css
```

## Root Cause

The studio app imports CSS from `@errl-design-system/styles/errlDesignSystem.css`, which resolves via alias to `../all-components/errl-design-system/src/styles/errlDesignSystem.css`. This directory doesn't exist in CI.

## Fix Applied

### Commit `7a792d0`
- ✅ Changed CSS import in `src/apps/studio/main.tsx`
- ✅ Changed from: `import '@errl-design-system/styles/errlDesignSystem.css'`
- ✅ Changed to: `import '../../shared/styles/errlDesignSystem.css'`
- ✅ Uses local file that's tracked in git

## Remaining Issue

### ⚠️ TypeScript Imports Still Use External Dependency

The studio app still imports TypeScript/React components from `@errl-design-system`:
- `src/apps/studio/main.tsx`: `import { ThemeProvider } from '@errl-design-system'`
- `src/apps/studio/src/app/components/PortalHeader.tsx`: `import { ThemeControls } from '@errl-design-system'`

**Alias Configuration**:
```typescript
'@errl-design-system': resolve(__dirname, '../all-components/errl-design-system/src')
```

**Problem**: This directory (`../all-components/errl-design-system/src`) doesn't exist in CI.

## Potential Solutions

### Option 1: Make External Dependency Available in CI
- Add `all-components/errl-design-system` as a git submodule
- Or include it in the repository
- Or install it via npm if it's published

### Option 2: Remove External Dependency
- Remove `ThemeProvider` and `ThemeControls` imports
- Use alternative implementations
- May require code changes

### Option 3: Conditional Import
- Check if external dependency exists
- Fall back to local alternatives
- More complex but flexible

## Current Status

- ✅ CSS import fixed (uses local file)
- ⚠️ TypeScript imports may still fail in CI
- ✅ Local build succeeds (because external dependency exists locally)

## Next Steps

Monitor GitHub Actions build. If it fails on TypeScript imports from `@errl-design-system`, we'll need to:
1. Make the external dependency available in CI, OR
2. Remove/replace the TypeScript imports

---

**CSS fix pushed!** TypeScript imports may need additional work.
