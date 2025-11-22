# MASTER.md — Project Master Overview

This master file centralizes the current state, key documents, and active work across Errl Portal and the Design Tool.

## Repos and Major Areas
- errl-portal — Multi-app portal and Studio shell
- design-tool — Standalone Canvas-based design tool (no bundler required)

## Current Status (2025-11-13)
- UI compaction complete in design-tool; drawers added for Components/Assets/Comments
- Portal link hardening added: redirects `/tools/*` and `/studio/*` → Studio root
- Dev docs: how to serve design-tool locally over HTTP to avoid CORS

## Key Documents
- errl-portal/docs/link-audit.md — link audit and redirects
- design-tool/DESIGN_TOOL_DEV.md — local dev and testing
- design-tool/docs/TEAM_UPDATE_2025_11_13_DRAWERS_AND_LINKS.md — latest team update
- design-tool/WARP.md — dev environment standards (TypeScript, testing, migration)

## Open Work
1) Optional Rulers (OFF by default)
   - Toggle in top bar, persist in localStorage
   - Overlay canvases synced with pan/zoom
2) Replace visible text "tools" → "studio" in active UI and docs (non-archived)
3) QA sweep in Safari + Chrome; screenshot deltas

## How to Run
- design-tool: `npx http-server -p 5180` → http://localhost:5180
- portal (Studio): run Vite dev as usual; routes `/tools/*` and `/studio/*` redirect to Studio root

## Delivery Plan
- Small, scoped commits per feature (drawers, compaction, rulers, redirects)
- Keep archived content read-only; prefer lightweight redirects over heavy edits
