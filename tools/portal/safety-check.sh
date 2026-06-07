#!/bin/bash
# Safety check before making changes
# Run this before asking AI to modify code

set -euo pipefail

echo "🔍 Running Errl Portal Safety Checks..."
echo ""

# Track if anything fails
FAILED=0

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

# 3. Git Status
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
