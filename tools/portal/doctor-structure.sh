#!/usr/bin/env bash
set -euo pipefail
echo "📁 Structure Doctor"
echo "──────────────────────────"
ok(){ printf "✅ %s\n" "$1"; } ; warn(){ printf "⚠️  %s\n" "$1"; } ; die(){ printf "❌ %s\n" "$1"; exit 1; }
REQ=("src/pages/Studio.jsx" "src/apps/ErrlLiveStudioPro.jsx" "src/utils/assetStore.js" "src/utils/bus.js" "src/utils/zipBundler.js")
for f in "${REQ[@]}"; do [[ -f "$f" ]] && ok "$f" || die "Missing $f"; done
if [[ -f "src/apps/PhotosTab.jsx" ]]; then ok "src/apps/PhotosTab.jsx"; else warn "PhotosTab not found (ok if you haven’t added Photos yet)"; fi
ROUTER=$(git ls-files | grep -E "src/.+\.(jsx|tsx)$" | xargs grep -n "Route path=.*/studio" || true)
if [[ -n "$ROUTER" ]]; then ok "Router contains /studio route"; else warn "No /studio route found. Add: <Route path=\"/studio\" element={<StudioPage />} />"; fi
VITECFG=$(git ls-files | grep -E "vite\.config\.(js|ts|mjs|cjs)$" || true)
if [[ -n "$VITECFG" ]]; then
  if grep -R "@.*src" $VITECFG >/dev/null 2>&1; then ok "Vite alias '@' present"; else warn "Vite alias '@' missing in vite config. Recommended."; fi
else warn "No vite config found (using defaults?)"; fi
