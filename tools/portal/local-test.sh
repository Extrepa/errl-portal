#!/usr/bin/env bash
# Local-first test pass: Vite dev server + Playwright against http://127.0.0.1:5173
# Use this before deploy. Prod smoke is optional: npm run test:prod:audit

set -euo pipefail
cd "$(dirname "$0")/../.."

HEADED=""
if [[ "${1:-}" == "--headed" ]]; then
  HEADED="--headed"
fi

echo "Running local audit + visual tests (Vite auto-starts via Playwright)..."
npx playwright test tests/live-visual-audit.spec.ts tests/visual-regression.spec.ts tests/build-output.spec.ts $HEADED "$@"

echo ""
echo "Local pass complete. Optional prod check: npm run test:prod:audit"
