#!/bin/bash
# Safety check before making changes
# Run this before asking AI to modify code

set -euo pipefail

echo "🔍 Running Errl Portal Safety Checks..."
echo ""

# Track if anything fails
FAILED=0
PLAYWRIGHT_HINT_REGEX="Looks like Playwright Test|npx playwright install|browserType\\.launch|executable doesn't exist|Missing Playwright browsers|did you install them"

# 1. TypeScript Check
echo "📘 Checking TypeScript..."
if npm run typecheck --silent; then
  echo "✅ TypeScript: OK"
else
  echo "❌ TypeScript: FAILED"
  FAILED=1
fi
echo ""

# 2. Build Check
echo "🏗️  Checking build..."
if npm run build --silent; then
  echo "✅ Build: OK"
else
  echo "❌ Build: FAILED"
  FAILED=1
fi
echo ""

# 3. Tests
echo "🧪 Running tests..."
TEST_LOG="$(mktemp)"
npm test --silent 2>&1 | tee "$TEST_LOG"
TEST_EXIT=${PIPESTATUS[0]}

if [ $TEST_EXIT -eq 0 ]; then
  echo "✅ Tests: OK"
else
  if grep -qiE "$PLAYWRIGHT_HINT_REGEX" "$TEST_LOG"; then
    echo "⚠️  Detected a Playwright browser issue (missing/outdated browsers)."
    echo "   This repo's Playwright browser install may require network access."
    echo "   Please run manually when you're ok with that:"
    echo "     npx playwright install"
  fi
  echo "❌ Tests: FAILED"
  FAILED=1
fi
rm -f "$TEST_LOG"
echo ""

# 4. Git Status
echo "📦 Git status..."
if git diff-index --quiet HEAD --; then
  echo "✅ No uncommitted changes"
else
  echo "⚠️  You have uncommitted changes"
  echo "💡 Consider committing them before making new changes"
  git status --short
fi
echo ""

# Summary
if [ $FAILED -eq 0 ]; then
  echo "✅ ✅ ✅  ALL CHECKS PASSED - SAFE TO PROCEED ✅ ✅ ✅"
  echo ""
  echo "💡 Before making changes:"
  echo "   - Consider creating a checkpoint commit or a branch."
  echo ""
  exit 0
else
  echo "❌ ❌ ❌  SOME CHECKS FAILED - FIX BEFORE PROCEEDING ❌ ❌ ❌"
  echo ""
  echo "🛠️  Fix the issues above, then run this script again"
  echo ""
  exit 1
fi
