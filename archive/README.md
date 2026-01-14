# Archive Directory

**Last Updated:** 2027-01-09  
**Total Size:** ~505MB

This directory contains historical backups, legacy code, and temporary files from errl-portal development.

## Structure

### Large Backups

- **snapshots/** (277MB) - Historical backup snapshots (29 zip files)
  - Contains dated snapshots of the project
  - See snapshots/README.md for details

- **site-trim-20251222/** (170MB) - Site backup from December 2025
  - Contains 374 files (markdown, HTML, JS)
  - Recent backup, keep for reference

- **docs-site-20251031/** (46MB) - Documentation site backup from October 2025
  - Contains 130+ files
  - Documentation reference material

### Component Backups

- **component-rips-20251112/** (4.6MB) - Component HTML backups
  - Contains component rips organized by type (BG, Buttons, Cursors, Modules, Props, Text)
  - May contain useful component code

### Legacy Code

- **legacy-portal-pages-backup/** (4.6MB) - Old portal pages backup
  - Contains 141 files (126 HTML pages)
  - Review before deletion

- **legacy/** (2.4MB) - Legacy code
  - Contains 52 files
  - Review before deletion

### Small Backups

- **portal-attic/** (280KB) - Old portal code
- **dev-panel-backup/** (196KB) - Dev panel CSS backup
- **portal-pixi-gl-20251030/** (188KB) - Portal version backup
- **assets-central-20251101/** (76KB) - Asset backup

### Temporary Files (Candidate for Deletion)

- **Tools temporary/** (80KB) - Temporary tools
- **moved/** (64KB) - Files that were moved
- **unreferenced-20251030/** (48KB) - Unreferenced files
- **duplicate-js-20251030/** (36KB) - Duplicate JavaScript files
- **root-duplicates-20251031/** (32KB) - Duplicate files
- **redirect-stubs-20251030/** (4KB) - Redirect stubs

## File Statistics

- HTML files: 432
- JavaScript files: 1,057
- CSS files: 94
- Other: Various (markdown, images, zip, etc.)

## Cleanup Recommendations

See `ARCHIVE_CLEANUP_PLAN.md` in project root for detailed cleanup recommendations.

### Quick Summary

- **Keep:** snapshots, site-trim, docs-site, component-rips
- **Review:** legacy-portal-pages-backup, legacy
- **Delete:** Temporary files, duplicates, unreferenced files (after verification)

## Notes

- Archive contains historical backups and legacy code
- Most files are from October-December 2025
- Largest items are snapshots (277MB) and site-trim (170MB)
- Cleanup should be gradual and verified
- Consider external storage for large backups
