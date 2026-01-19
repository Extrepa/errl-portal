#!/usr/bin/env bash
set -euo pipefail
DEV_PORT="${DEV_PORT:-5174}"
PREV_PORT="${PREV_PORT:-5177}"

echo "Stopping studio servers…"
for P in "$DEV_PORT" "$PREV_PORT"; do
  lsof -ti tcp:$P | xargs -r kill -9 || true
done
pkill -f "vite preview" 2>/dev/null || true
pkill -f "vite( |$)" 2>/dev/null || true
echo "✅ Stopped anything on $DEV_PORT / $PREV_PORT"
