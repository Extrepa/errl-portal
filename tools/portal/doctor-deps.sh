#!/usr/bin/env bash
set -euo pipefail
echo "📦 Deps Doctor"
echo "──────────────────────────"
check(){ local pkg="$1"; node -e "require.resolve('$pkg')" >/dev/null 2>&1 && echo "✅ $pkg" || { echo "❌ $pkg (missing)"; FAIL=1; } }
FAIL=0
check "@monaco-editor/react"
check "monaco-editor"
check "lucide-react"
check "jszip"
check "fabric"
node -e "require.resolve('express');require.resolve('multer');require.resolve('cors');console.log('✅ express/multer/cors')" 2>/dev/null || echo "ℹ️ server deps not installed (ok if not using cloud demo)"
if [[ ${FAIL} -eq 0 ]]; then echo "All client deps present 🎉"; else echo "Install missing: npm i @monaco-editor/react monaco-editor lucide-react jszip fabric"; exit 1; fi
