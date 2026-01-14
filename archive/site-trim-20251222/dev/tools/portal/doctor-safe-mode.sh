#!/usr/bin/env bash
set -euo pipefail
echo "🛟 Safe-Mode Doctor (advice only)"
echo "──────────────────────────"
grep -R --line-number "serviceWorker.register" src || echo "✅ No SW registration found (good for dev)"
grep -R --line-number "navigator.serviceWorker.register" src || true
echo "──────────────────────────"
echo "DnD listeners on window (can cause crashes on some setups):"
grep -R --line-number "addEventListener(\"dragover\"" src || true
grep -R --line-number "addEventListener(\"drop\"" src || true
echo "→ If you see window-level DnD, bind to a container div instead."
echo "──────────────────────────"
echo "BroadcastChannel usage:"
grep -R --line-number "new BroadcastChannel" src || echo "✅ No BroadcastChannel found"
echo "→ If crashes persist, temporarily no-op the bus (this.ch = null) in src/utils/bus.js"
