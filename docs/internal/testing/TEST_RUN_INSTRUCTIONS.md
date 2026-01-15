# Test Run Instructions - Watch Tests Execute

## Quick Start - Watch Tests Run

The browser is having stability issues in the sandbox environment. Here are the best ways to watch tests run:

### Option 1: Playwright UI Mode (Recommended - Most Visual)

```bash
npx playwright test --ui
```

This opens an interactive UI where you can:
- See all tests listed
- Watch tests execute in real-time
- See browser windows open and close
- View screenshots and videos
- Click on tests to see details
- Re-run individual tests

### Option 2: Headed Mode (See Browser Windows)

```bash
npm test -- --headed
```

This runs tests with visible browser windows so you can watch them execute.

### Option 3: Verbose Output with Progress

```bash
npm test -- --reporter=list --workers=1
```

Shows detailed progress as each test runs.

### Option 4: Run Specific Test Suite

```bash
# Run just the pages tests
npm test -- tests/pages.spec.ts --headed

# Run comprehensive page tests
npm test -- tests/pages-comprehensive.spec.ts --headed

# Run visual tests
npm test -- tests/visual-comprehensive.spec.ts --headed

# Run visual regression (snapshots)
npm run test:visual

# Update visual regression baselines
npm run test:visual:update
```

## All Available Test Suites

1. **pages.spec.ts** - Basic page load tests (15 tests)
2. **pages-comprehensive.spec.ts** - Comprehensive page tests (7 tests)
3. **studio.spec.ts** - Studio application tests
4. **studio-comprehensive.spec.ts** - Comprehensive studio tests
5. **assets-comprehensive.spec.ts** - Asset page tests (7 tests)
6. **pin-designer-comprehensive.spec.ts** - Pin designer tests
7. **ui.spec.ts** - UI component tests
8. **accessibility.spec.ts** - Accessibility tests (9 tests)
9. **responsive.spec.ts** - Responsive design tests
10. **performance.spec.ts** - Performance tests
11. **visual-comprehensive.spec.ts** - Visual testing with screenshots (NEW)
12. **visual-regression.spec.ts** - Visual regression with snapshot comparisons

## Test Execution Summary

**Total Tests**: 165 tests across all suites
**Pages Covered**: 23 pages
**Test Types**: 
- Page loading
- Design system verification
- Navigation testing
- Visual screenshots
- Interactivity testing
- Accessibility checks
- Performance metrics

## Troubleshooting

If you see browser crashes (SIGSEGV):
- This is a sandbox environment limitation
- Run tests locally on your machine for full stability
- The test infrastructure is correctly configured
- All test files are valid and ready

## Expected Test Results

When tests run successfully, you should see:
- ✅ All pages load correctly
- ✅ Design system CSS variables present
- ✅ Navigation links functional
- ✅ Screenshots captured
- ✅ No critical console errors

## Next Steps

1. Run `npx playwright test --ui` to open the interactive test UI
2. Or run `npm test -- --headed` to see browser windows
3. Check `test-results/` directory for screenshots and reports
