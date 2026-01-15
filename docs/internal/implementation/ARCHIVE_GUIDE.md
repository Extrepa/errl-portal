# Documentation Archive Guide

**Created**: 2026-01-15  
**Purpose**: Guidelines for organizing and archiving documentation

---

## Archive Structure

```
docs/
├── active/                    # Current, actively referenced docs
│   └── README.md            # Index of active docs
├── archive/                  # Historical/completed docs
│   ├── verification/        # All verification docs
│   ├── deployment/          # Deployment fix docs
│   ├── testing/             # Test result docs
│   ├── implementation/     # Implementation summaries
│   ├── fixes/               # Fix documentation
│   └── README.md            # Index of archived docs
└── reference/                # Reference guides
    └── README.md            # Index of reference docs
```

---

## What Can Be Archived

### Safe to Archive (Completed Work)

1. **Verification Documents**
   - Final verification reports
   - Comprehensive verification docs
   - Launch readiness verification
   - Build verification
   - **Criteria**: Work is complete and verified

2. **Deployment Fix Documents**
   - Individual deployment fix docs (DEPLOYMENT_FIX_*.md)
   - Deployment summaries
   - **Criteria**: Fixes are deployed and working

3. **Test Result Documents**
   - Test execution summaries
   - Test results
   - Testing checklists (if completed)
   - **Criteria**: Tests are complete, results documented

4. **Implementation Summaries**
   - Implementation complete docs
   - Work completed logs
   - Changes summaries (older than 30 days)
   - **Criteria**: Implementation is done and stable

5. **Fix Documentation**
   - Fixes complete docs
   - Individual fix docs
   - **Criteria**: Fixes are applied and verified

6. **Older Daily Logs**
   - Logs older than 30 days
   - **Criteria**: Work is complete, no active TODOs

### Keep Active (Current Work)

1. **Core Project Docs**
   - README.md
   - INDEX.md
   - PROJECT_STATUS.md
   - QUICK_START_FOR_FUTURE_WORK.md

2. **Current Documentation**
   - documentation-index.md
   - documentation-map.md
   - audit-incomplete-tasks.md
   - action-plan-incomplete-tasks.md

3. **Recent Daily Logs**
   - Last 30 days of logs
   - Any logs with active TODOs

4. **Reference Guides**
   - architecture.md
   - project-structure.md
   - completion-checklist.md
   - deployment/ directory

---

## Archive Organization Rules

### Verification Docs → `docs/archive/verification/`

Move all files matching:
- `*VERIFICATION*.md`
- `*VERIFICATION_*.md`
- `FINAL_*.md` (verification-related)
- `COMPREHENSIVE_VERIFICATION*.md`
- `LAUNCH_READINESS*.md`

### Deployment Docs → `docs/archive/deployment/`

Move all files matching:
- `DEPLOYMENT_*.md`
- `DEPLOYMENT_FIX_*.md`
- `BUILD_*.md` (deployment-related)

### Testing Docs → `docs/archive/testing/`

Move all files matching:
- `TEST_*.md`
- `TESTING_*.md`
- `*TEST_RESULTS*.md`

### Implementation Docs → `docs/archive/implementation/`

Move all files matching:
- `IMPLEMENTATION_*.md`
- `WORK_COMPLETED.md`
- `WORK_VERIFICATION*.md`
- `CHANGES_SUMMARY.md` (if older than 30 days)

### Fix Docs → `docs/archive/fixes/`

Move all files matching:
- `FIXES_*.md`
- `FIX_*.md`
- `*FIX_COMPLETE*.md`
- `*FIXES_COMPLETE*.md`

---

## How to Restore Archived Docs

If you need to reference an archived document:

1. **Find the doc** in `docs/archive/` subdirectories
2. **Copy or symlink** to `docs/active/` if needed temporarily
3. **Or reference directly** from archive location
4. **Update references** if moving back to active

---

## Archive Maintenance

### Regular Reviews

- **Monthly**: Review active docs, archive completed work
- **Quarterly**: Review archive structure, consolidate if needed
- **As needed**: Archive completed verification/fix docs immediately

### Archive Size Management

- Archive is for reference, not active use
- Can compress old archives if space is concern
- Consider external storage for very old archives (>1 year)

---

## Slimmed Down Version

For a minimal documentation set, keep only:

### Root Level (Minimal)
- `README.md` - Main entry point
- `INDEX.md` - Workspace index
- `PROJECT_STATUS.md` - Current status

### Docs Directory (Minimal)
- `docs/active/README.md` - Active docs index
- `docs/reference/architecture.md` - Architecture reference
- `docs/reference/project-structure.md` - Structure reference
- `docs/ARCHIVE_GUIDE.md` - This guide

Everything else can be archived or removed if not needed.

---

## Backup Recommendations

### What to Backup

1. **Entire `docs/` directory** - All documentation
2. **`05-Logs/Daily/`** - All daily logs
3. **Root-level active docs** - README, INDEX, PROJECT_STATUS

### What Can Be Excluded from Backups

1. **Archive directory** - Can be regenerated from git history
2. **Very old logs** - If space is concern
3. **Duplicate verification docs** - Keep only most recent

### Backup Strategy

- **Local backup**: Copy `docs/` to external drive
- **Git**: All docs are in git, can restore from history
- **Cloud**: Optional cloud backup for important docs

---

## Notes

- Archiving doesn't delete files, just organizes them
- All archived docs remain in git history
- Can always restore from git if needed
- Archive structure is flexible - adjust as needed

---

**Last Updated**: 2026-01-15
