# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development
- **Start dev server**: `npm run dev`
  - Expected output: "VITE v7"
  - URL: http://localhost:5173/
  - Entry point: `src/portal/pages/studio/math-lab/index.html`

### Testing
- **Framework**: Playwright
- **Install**:
  ```bash
  npm i -D @playwright/test
  npx playwright install
  ```
- **Run tests**: `npx playwright test`

### Other commands
Check `package.json` scripts for additional commands:
```bash
cat package.json | jq .scripts
```

## Architecture overview

From `README.md`:
- Purpose: multi-app portal/landing hub showcasing a mascot with playful, “trippy” visuals; will aggregate and link multiple experiences.
- Iterative approach: assets/apps will be integrated over time.

Initial structure:
- `src/` — main site/app source (currently empty; scaffold only).
- `public/` — static assets (currently empty).

Implications:
- Expect either a single-app site that links/embeds sub-experiences or a future multi-app workspace/monorepo. Once sub-apps land, document per-app dev commands here.

## Important project docs

- `README.md` captures the vision and initial directory structure; keep it as the source of truth and mirror key operational details here as the implementation matures.

## Absent rule files

No CLAUDE rules (`CLAUDE.md`), Cursor rules (`.cursor/` or `.cursorrules`), or Copilot instructions (`.github/copilot-instructions.md`) were found at the time of writing.
