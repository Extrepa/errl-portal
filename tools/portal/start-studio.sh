#!/usr/bin/env bash
set -euo pipefail

# ---- Config (edit if you want different ports) ----
DEV_PORT="${DEV_PORT:-5174}"
PREV_PORT="${PREV_PORT:-5177}"
HOST="127.0.0.1"
VITE_CFG="${VITE_CFG:-}"   # e.g. vite.studio.config.ts (leave empty to let vite auto-detect)

log() { printf "▶ %s\n" "$*"; }

# Kill anything on our ports
for P in "$DEV_PORT" "$PREV_PORT"; do
  lsof -ti tcp:$P | xargs -r kill -9 || true
done
# Kill old vite processes politely
pkill -f "vite( |$)" 2>/dev/null || true
pkill -f "vite preview" 2>/dev/null || true

# Start DEV
log "Starting Vite dev on http://$HOST:$DEV_PORT …"
if [[ -n "$VITE_CFG" ]]; then
  npx vite --config "$VITE_CFG" --host "$HOST" --port "$DEV_PORT" --strictPort --open false </dev/null >>/tmp/errl-vite-dev.log 2>&1 &
else
  npx vite --host "$HOST" --port "$DEV_PORT" --strictPort --open false </dev/null >>/tmp/errl-vite-dev.log 2>&1 &
fi

# Start PREVIEW (optional; nice for final check of built output if already built)
log "Starting Vite preview on http://$HOST:$PREV_PORT …"
if [[ -n "$VITE_CFG" ]]; then
  npx vite preview --config "$VITE_CFG" --host "$HOST" --port "$PREV_PORT" --strictPort </dev/null >>/tmp/errl-vite-preview.log 2>&1 &
else
  npx vite preview --host "$HOST" --port "$PREV_PORT" --strictPort </dev/null >>/tmp/errl-vite-preview.log 2>&1 &
fi

sleep 1
echo "── Status ───────────────────────────"
printf "DEV   %s\n" "$(curl -sI "http://$HOST:$DEV_PORT/" | head -n1 || true)"
printf "PREV  %s\n" "$(curl -sI "http://$HOST:$PREV_PORT/" | head -n1 || true)"
echo "Logs: tail -f /tmp/errl-vite-dev.log /tmp/errl-vite-preview.log"
echo "Open: http://localhost:$DEV_PORT/studio"
