#!/usr/bin/env bash
set -euo pipefail
touch /tmp/errl-vite-dev.log /tmp/errl-vite-preview.log
echo "Tailing logs. Ctrl-C to stop."
tail -n 50 -f /tmp/errl-vite-dev.log /tmp/errl-vite-preview.log
