#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Initializing Errl Portal dev environment..."
if [ -f package.json ]; then
  npm install
else
  echo "⚠️  Run this from the project root that has package.json"
fi

npm i -D @playwright/test
npx playwright install

echo "▶️  Starting dev server (open http://localhost:5173/)"
npm run dev
