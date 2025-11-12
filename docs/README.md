# Project Docs

Purpose: keep planning, notes, and decisions separate from the app code. No builds or site in here.

Structure
- journal/ — dated work logs, `TEAM_UPDATE_*`, and migrated `notes/`
- team/ — onboarding, workflow, and safety guides
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

Recent updates (2025-11-12)
- React Studio hub now hosts Math Lab, Shape Madness, and Pin Designer via iframe bridges; see `src/portal/app/pages/*`.
- Legacy pages use `data-portal-link` + runtime rewrite helpers so `/legacy/portal/...` routes stay consistent.
- Playwright suite expanded to cover the Studio hub navigation and Pin Designer asset bridge.

Related root docs
- README.md — repo overview and dev commands (still at repo root)
