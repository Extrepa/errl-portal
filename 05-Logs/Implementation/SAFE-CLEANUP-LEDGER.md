# SAFE CLEANUP LEDGER

Date opened: 2026-04-22  
Policy: safe and recoverable cleanup only

## Classification

### keep
- `/Users/extrepa/Projects/errl-portal/.git` (history integrity)
- `/Users/extrepa/Projects/errl-portal/05-Logs/**` (project memory)
- `/Users/extrepa/Projects/errl-portal/docs/**` (reference docs)
- `/Users/extrepa/Projects/errl-portal-forum-docs/05-Logs/**` (project memory)
- `/Users/extrepa/Projects/errl-portal-forum-docs/docs/**` (project docs)
- `/Users/extrepa/Projects/errl-portal-forum-docs/migrations/**` (canonical schema history)
- `/Users/extrepa/Projects/errl-portal-forum-docs/.env` (local secret state)

### archive-first (reversible)
- `/Users/extrepa/Projects/errl-portal/SCREENSHOT April` (~8.8M)
- `/Users/extrepa/Projects/errl-portal/test-landing-effects-complete.log` (tracked)
- `/Users/extrepa/Projects/errl-portal/test-landing-effects-final.log` (tracked)
- `/Users/extrepa/Projects/errl-portal/test-landing-effects-run.log` (tracked)
- `/Users/extrepa/Projects/errl-portal/test-landing-effects.log` (tracked)
- `/Users/extrepa/Projects/errl-portal/test-output.log` (tracked)

### remove-safe (regenerable caches/artifacts)
- `/Users/extrepa/Projects/errl-portal/test-results` (~101M)
- `/Users/extrepa/Projects/errl-portal-forum-docs/.next` (~993M)
- `/Users/extrepa/Projects/errl-portal-forum-docs/.open-next` (~48M)
- `/Users/extrepa/Projects/errl-portal-forum-docs/.npm-cache` (~1.8G)
- `/Users/extrepa/Projects/errl-portal-forum-docs/.npm-logs` (~44K)
- `/Users/extrepa/Projects/errl-portal-forum-docs/.wrangler` (~872K)

### needs-confirmation
- `/Users/extrepa/Projects/errl-portal-forum-docs/errl-face-2 copy.txt` (possible backup/duplicate, unclear intent)
- `/Users/extrepa/Projects/errl-portal/.npm-logs` (contains tracked file; not removed under safe pass)
- `/Users/extrepa/Projects/errl-portal-forum-docs/.npm` (contains tracked files; restored and kept)
- `.git/refs/.DS_Store` artifacts flagged by `git fsck` in both repos (inside `.git`; no auto-clean under this plan)

## Execution log
- `2026-04-22` archived (moved) to `/Users/extrepa/Projects/errl-portal/05-Logs/Implementation/Cleanup-Archive/2026-04-22/errl-portal`:
  - `SCREENSHOT April`
  - `test-landing-effects-complete.log`
  - `test-landing-effects-final.log`
  - `test-landing-effects-run.log`
  - `test-landing-effects.log`
  - `test-output.log`
- `2026-04-22` removed safe artifacts:
  - `/Users/extrepa/Projects/errl-portal/test-results`
  - `/Users/extrepa/Projects/errl-portal-forum-docs/.next`
  - `/Users/extrepa/Projects/errl-portal-forum-docs/.open-next`
  - `/Users/extrepa/Projects/errl-portal-forum-docs/.npm-cache`
  - `/Users/extrepa/Projects/errl-portal-forum-docs/.npm-logs`
  - `/Users/extrepa/Projects/errl-portal-forum-docs/.wrangler`
- `2026-04-22` safety rollback:
  - restored tracked `.npm`/`.npm-logs` contents where deletion would have removed tracked files.

## Verification checklist
- [x] `git status --short` inspected after cleanup in both repos
- [x] archived items are restorable and present in archive location
- [x] no source/docs/logging directories were removed
