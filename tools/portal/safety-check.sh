#!/bin/bash
# Safety check before making changes
# Run this before asking AI to modify code

echo "🔍 Running Errl Portal Safety Checks..."
echo ""

# Track if anything fails
FAILED=0
PLAYWRIGHT_HINT_REGEX="Looks like Playwright Test|npx playwright install|browserType\.launch|executable doesn't exist|Missing Playwright browsers|did you install them"

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
TEST_LOG=$(mktemp)
npm test --silent 2>&1 | tee "$TEST_LOG"
TEST_EXIT=${PIPESTATUS[0]}

handle_playwright_browser_issue() {
  local log_file="$1"
  if grep -qiE "$PLAYWRIGHT_HINT_REGEX" "$log_file"; then
    echo "⚠️  Detected a Playwright browser issue (missing/outdated browsers)."
    echo "   Attempting to install browsers via 'npx playwright install'..."
    if npx playwright install; then
      echo ""
      echo "🔁 Re-running tests after installing browsers..."
      local retry_log
      retry_log=$(mktemp)
      npm test --silent 2>&1 | tee "$retry_log"
      local retry_exit=${PIPESTATUS[0]}
      if [ $retry_exit -eq 0 ]; then
        echo "✅ Tests: OK after installing Playwright browsers"
        rm -f "$retry_log"
        return 0
      else
        echo "❌ Tests still failing after installing browsers"
        echo "   Review the logs above for details."
        rm -f "$retry_log"
        return 1
      fi
    else
      echo "❌ Could not install Playwright browsers automatically."
      echo "   Run 'npx playwright install' manually, then retry."
      return 1
    fi
  fi

  return 2
}

if [ $TEST_EXIT -eq 0 ]; then
  echo "✅ Tests: OK"
else
  handle_playwright_browser_issue "$TEST_LOG"
  STATUS=$?
  if [ $STATUS -eq 0 ]; then
    echo ""
  else
    echo "❌ Tests: FAILED"
    FAILED=1
  fi
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
  echo "💡 Before asking AI to make changes:"
  echo "   1. Create a checkpoint: git add -A && git commit -m 'checkpoint: before [change]'"
  echo "   2. Or create a branch: git checkout -b wip/feature-name"
  echo ""
  exit 0
else
  echo "❌ ❌ ❌  SOME CHECKS FAILED - FIX BEFORE PROCEEDING ❌ ❌ ❌"
  echo ""
  echo "🛠️  Fix the issues above, then run this script again"
  echo ""
  exit 1
fi
