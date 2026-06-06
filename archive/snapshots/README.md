# Snapshots Directory

**Last updated:** 2026-06-06

Historical backup snapshots (phase zip files and tar archives). **Not tracked in git** — see root `.gitignore`.

## Local contents

If present on disk:

- `phase-*.zip` — Incremental project snapshots (phases 1–26)
- `2025-11-11-working-state.tar.gz` — Full working state (~290 MB)

## Restoration

1. Extract the desired zip/tar to a temp folder
2. Diff against current `src/` before copying anything back
3. Prefer git history over snapshots when possible

## Storage

Keep on local disk or copy to external / `errl-portal-archive` repo. Do not re-add to git.
