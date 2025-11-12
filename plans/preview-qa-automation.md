## Plan

1. Add `tools/portal/stage-preview-qa.sh`
   - Shell script (`bash`) with `set -euo pipefail`
   - Ensure `docs/dev/preview-qa-complete.md` exists
   - Show status (`git status --short`, `git diff --stat`, `git diff docs/dev/preview-qa-complete.md`)
   - Include `--stage` flag to run `git add docs/dev/preview-qa-complete.md`
   - Print guidance for next commands
   - `chmod +x`

2. Add `tools/portal/run-preview-verifications.sh`
   - Sequentially run `npm run typecheck`, `npm test`, `npm run portal:build`
   - Log output to `logs/preview-verifications-*.log` and summarize pass/fail with emoji
   - Hint for rerunning failing step
   - `chmod +x`

3. Add `tools/portal/draft-preview-announcement.sh`
   - Accept optional `--output docs/journal/preview-YYYYMMDD.md`
   - Gather metadata (date, latest commit, outstanding manual QA items) from `docs/dev/preview-qa-complete.md`
   - Emit markdown template with sections: Summary, QA status, Automated checks, Manual checks, Next steps
   - Write file (fail if exists unless `--force`)
   - `chmod +x`

4. Wire scripts into workflow
   - Register npm scripts in `package.json` (`portal:preview-qa:stage`, `portal:preview-qa:verify`, `portal:preview-qa:draft-announcement`)
   - Update docs:
     - `docs/dev/preview-qa-complete.md` → mention new scripts in Commands/Next Steps
     - `docs/dev/local-preview-notes.md` → swap manual command list for new helper scripts
     - `docs/team/AI_DEVELOPMENT_GUIDE.md` & `docs/team/WORKFLOW_GUIDE.md` & `docs/team/WARP.md` → reference scripts in safety/test checklists
   - Document usage in plan doc or README if needed

