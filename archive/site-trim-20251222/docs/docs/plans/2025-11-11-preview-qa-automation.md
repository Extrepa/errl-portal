## Plan

1. Add a doc staging script `tools/portal/stage-preview-qa.sh` that confirms `docs/dev/preview-qa-complete.md` exists, shows current git diff for it, optionally stages it (flag), and prints next git commands.
2. Add a QA/test runner script `tools/portal/run-preview-verifications.sh` to sequentially execute `npm run typecheck`, `npm test`, and `npm run portal:build`, stopping on failure and summarizing results/log pointers.
3. Add an announcement drafting script `tools/portal/draft-preview-announcement.sh` that collects release metadata (date, commit, checklist status) and writes a template file under `docs/journal/` with links to key assets.
4. Update `docs/dev/preview-qa-complete.md` to mention the new scripts in the Next Steps section so the workflow stays discoverable.

