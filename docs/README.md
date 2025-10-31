# Project Docs

Purpose: keep planning, notes, and decisions separate from the app code. No builds or site in here.

Structure
- journal/ — dated work logs and progress notes
- adr/ — Architecture Decision Records (0001-*.md, one per decision)
- architecture/ — diagrams, schemas, and design docs
- assets/ — images used by docs (not shipped with the app)
- roadmap.md — near-term plan and milestones
- changelog.md — human-friendly notable changes (dev-facing)

Conventions
- Use YYYY-MM-DD filenames for journal entries.
- ADR template: Context → Decision → Consequences → Alternatives.
- Link to source files with relative paths (e.g., src/fx/errl-bg.ts).
- Keep production assets in src/ (no builds in docs/).

Recent updates (2025-10-31)
- Pages moved to `src/portal/pages/*`; see root README for navigation.
- About page fully ported; effects fixed; standardized navigation links.
- GH Actions: single deploy workflow; Vite base path set.

Related root docs
- README.md — repo overview and dev commands
- DEV-SYSTEM-GUIDE.md — local dev helper notes
- WARP.md — assistant guidance (keep at repo root)
