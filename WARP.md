# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

Current repo has no configured tooling (no `package.json`, `Makefile`, `Dockerfile`, or language-specific config). There are no build, lint, or test commands yet.

When tooling is added, discover commands via:
- Node: check `package.json` scripts (`cat package.json | jq .scripts` or open the file), then run `npm run <script>`/`pnpm <script>`/`yarn <script>`.
- Python: check `pyproject.toml`/`requirements*.txt`/`make` targets; run `pytest -k "<test_name>"` for a single test.
- Go: `go test ./... -run <Regex>`.
Update this file with concrete commands once the stack is introduced.

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
