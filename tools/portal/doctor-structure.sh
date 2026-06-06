#!/usr/bin/env bash
set -euo pipefail
echo "📁 Structure Doctor"
echo "──────────────────────────"
ok(){ printf "✅ %s\n" "$1"; } ; warn(){ printf "⚠️  %s\n" "$1"; } ; die(){ printf "❌ %s\n" "$1"; exit 1; }

REQ=(
  "src/index.html"
  "vite.config.ts"
  "src/apps/landing/scene/App.tsx"
  "src/apps/studio/src/app/router.tsx"
  "src/apps/designer/index.html"
  "package.json"
)
for f in "${REQ[@]}"; do
  [[ -f "$f" ]] && ok "$f" || die "Missing $f"
done

if [[ -f "src/apps/landing/scripts/portal-app.js" ]]; then
  ok "src/apps/landing/scripts/portal-app.js"
else
  warn "portal-app.js not found"
fi

ROUTER=$(git ls-files | grep -E "src/.+\.(jsx|tsx)$" | xargs grep -nE "path=.*/studio|/studio" 2>/dev/null | grep -i route || true)
if [[ -n "$ROUTER" ]]; then ok "Router contains /studio route"; else warn "No /studio route found in src/"; fi

VITECFG=$(git ls-files | grep -E "^vite\.config\.(js|ts|mjs|cjs)$" || true)
if [[ -n "$VITECFG" ]]; then
  if grep -q "@.*src\|resolve.*src" vite.config.ts 2>/dev/null; then
    ok "Vite alias present in vite.config.ts"
  else
    warn "Vite alias '@' missing — check vite.config.ts"
  fi
else
  warn "No root vite.config.ts found"
fi

for cfg in vite.studio.config.ts vite.designer.config.ts; do
  [[ -f "$cfg" ]] && ok "$cfg" || warn "Missing $cfg (optional if app retired)"
done

if [[ -f "docs/PROJECT_STATUS.md" ]]; then ok "docs/PROJECT_STATUS.md"; else warn "Missing docs/PROJECT_STATUS.md"; fi

echo "──────────────────────────"
ok "Structure check complete"
