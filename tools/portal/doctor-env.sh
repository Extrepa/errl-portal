#!/usr/bin/env bash
set -euo pipefail
echo "🌡  Env Doctor"
echo "──────────────────────────"
echo "Node: $(node -v || echo 'not found')"
echo "npm : $(npm -v  || echo 'not found')"
echo "OS  : $(uname -a | cut -d' ' -f1-3)"
VITE_VER=$(node -e "try{console.log(require('vite/package.json').version)}catch{console.log('vite not found')}" 2>/dev/null || true)
echo "Vite: ${VITE_VER}"
echo "──────────────────────────"
echo "Git branch: $(git branch --show-current 2>/dev/null || echo 'n/a')"
if ! git diff --quiet 2>/dev/null; then echo "⚠️  You have uncommitted changes"; else echo "✅ Working tree clean"; fi
echo "──────────────────────────"
PORT=${1:-5173}
if lsof -i TCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  echo "⚠️  Port $PORT is busy:"
  lsof -nP -i TCP:$PORT -sTCP:LISTEN | tail -n +2
else
  echo "✅ Port $PORT is free"
fi
