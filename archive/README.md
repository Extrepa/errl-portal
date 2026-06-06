# Archive Directory

**Last updated:** 2026-06-06

Historical backups and legacy code. **Not imported by active `src/` code.**

---

## Large backups (gitignored — local or external storage only)

These folders may exist on disk but are **not tracked in git** (see root `.gitignore`):

| Path | ~Size | Notes |
|------|-------|--------|
| `snapshots/` | 277 MB | Phase zip/tar snapshots; README kept in git |
| `site-trim-20251222/` | 94 MB | Full site backup Dec 2025 |
| `docs-site-20251031/` | 46 MB | Old docs site Oct 2025 |

To restore: copy from local disk or separate `errl-portal-archive` storage.

---

## Tracked backups (still in repo)

| Path | ~Size | Notes |
|------|-------|--------|
| `component-rips-20251112/` | 4.5 MB | HTML component rips by category |
| `legacy-portal-pages-backup/` | 4.5 MB | Old portal HTML pages |
| `legacy/` | 2.3 MB | Legacy standalone pages |
| `portal-attic/` | 264 KB | Old portal code |
| `dev-panel-backup/` | 196 KB | Dev panel CSS backup |
| `portal-pixi-gl-20251030/` | 180 KB | Pixi portal version |
| `assets-central-20251101/` | 76 KB | Asset backup |

Review before deleting; none are referenced from `src/`.

---

## Removed from git (2026-06-06 cleanup)

- `Tools temporary/` — temp tools
- `duplicate-js-20251030/` — duplicate JS
- `root-duplicates-20251031/` — root duplicates
- `redirect-stubs-20251030/` — redirect stubs (redirects live in Vite/build)
- `unreferenced-20251030/` — unreferenced files
- `moved/` — files already relocated
- `snapshots/*.zip` — phase snapshots (local copies may remain)

See `ARCHIVE_CLEANUP_EXECUTED.md` for earlier cleanup log.

---

## Documentation archive

Completed verification/deployment docs: `docs/archive/` (not this folder).
