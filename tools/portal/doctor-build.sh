#!/usr/bin/env bash
set -euo pipefail
echo "🏗  Build Doctor"
echo "──────────────────────────"
npm run build || { echo "❌ vite build failed"; exit 1; }
echo "✅ Build complete"
if [[ -d "dist" ]]; then
  echo "Top-level build artifacts:"
  find dist -maxdepth 2 -type f -size +0 -print | head -n 20
fi
