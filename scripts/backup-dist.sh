#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
DIST_DIR="$ROOT_DIR/dist"
OUT_DIR="$ROOT_DIR/archive/builds"
LOG_DIR="$ROOT_DIR/logs"
TS=$(date +%Y%m%d-%H%M%S)
if [ ! -d "$DIST_DIR" ]; then
  echo "dist/ not found. Run 'npm run build' first." >&2
  exit 1
fi
mkdir -p "$OUT_DIR" "$LOG_DIR"
ZIP="$OUT_DIR/errl-portal-dist-$TS.zip"
(
  cd "$DIST_DIR"
  zip -qr "$ZIP" .
)
echo "[$(date -u +%FT%TZ)] Backed up dist to $ZIP" | tee -a "$LOG_DIR/build.log"
