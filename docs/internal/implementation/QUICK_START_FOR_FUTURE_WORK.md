# Quick Start Guide for Future Work

**Created**: 2026-01-13  
**Purpose**: Quick reference for when you return to work on the project

## 🚀 Site is Live!

**URL**: https://errl-portal.pages.dev

## Quick Commands

```bash
# Start development server
npm run portal:dev

# Build for production
npm run portal:build

# Type check
npm run typecheck

# Run tests
npm test

# Preview build locally
npm run portal:preview
```

## Project Structure

```
errl-portal/
├── src/                    # Source code
│   ├── index.html         # Main portal entry
│   ├── apps/
│   │   ├── studio/        # Studio app
│   │   ├── chatbot/       # Chatbot app
│   │   └── landing/       # Landing page
│   ├── components/        # Shared components
│   └── shared/            # Shared utilities/styles
├── dist/                  # Build output (deployed)
├── public/                # Static files
│   └── _redirects        # Cloudflare routing
├── .github/workflows/     # CI/CD
│   └── deploy-cloudflare.yml
└── vite.config.ts        # Build configuration
```

## Key Files to Know

### Build Configuration
- `vite.config.ts` - Main build config
- `package.json` - Dependencies and scripts
- `public/_redirects` - Cloudflare Pages routing

### Entry Points
- `src/index.html` - Main portal
- `src/apps/studio/index.html` - Studio app
- `src/apps/chatbot/index.html` - Chatbot app

### Deployment
- `.github/workflows/deploy-cloudflare.yml` - CI/CD workflow
- `wrangler.toml` - Cloudflare configuration (optional)

## Common Tasks

### Fix a Bug
1. Identify the issue
2. Locate the relevant file(s)
3. Make the fix
4. Test locally: `npm run portal:dev`
5. Build: `npm run portal:build`
6. Commit and push (auto-deploys)

### Add a Feature
1. Create/modify files in `src/`
2. Update routes if needed
3. Test locally
4. Build and deploy

### Update Dependencies
```bash
npm update
npm run portal:build  # Test build still works
```

### Check Deployment Status
- GitHub Actions: https://github.com/Extrepa/errl-portal/actions
- Cloudflare Dashboard: Check Pages deployment

## Troubleshooting

### Build Fails
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run portal:build
```

### Type Errors
```bash
npm run typecheck
```

### Local Dev Server Issues
```bash
# Kill any existing server
pkill -f vite

# Start fresh
npm run portal:dev
```

## Important Notes

- **Auto-Deploy**: Pushing to `main` branch auto-deploys
- **Build Output**: `dist/` directory is what gets deployed
- **Redirects**: Studio routes handled by `_redirects` file
- **BASE_URL**: Replaced automatically during build

## Getting Help

1. **Start with**: `DOCUMENTATION_INDEX.md` for complete overview
2. **Main summary**: `LAUNCH_WRAP_UP_NOTES.md` for launch context
3. **All fixes**: `ALL_DEPLOYMENT_FIXES.md` for fix history
4. **Verification**: `COMPREHENSIVE_VERIFICATION_COMPLETE.md` for details
5. **Git history**: `git log --oneline -20` for commit history
6. **Issue tracking**: Use `ISSUE_TRACKING_TEMPLATE.md` for new issues

## Next Steps

1. Test the live site
2. Document any issues found
3. Prioritize fixes
4. Start fixing issues systematically

---

**Welcome back! The site is live and ready for improvements.** 🎉
