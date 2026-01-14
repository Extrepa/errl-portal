# Cloudflare Deployment Checklist

Quick reference checklist for deploying to Cloudflare Pages.

## Pre-Deployment Setup ✅

- [x] Base path updated to `/` in `vite.config.ts`
- [x] `public/_redirects` file created for SPA routing
- [x] Vite plugin added to copy `_redirects` to `dist/`
- [x] GitHub Actions workflow created (optional)
- [x] Wrangler config created (optional)
- [x] Deployment documentation created

## Files Created

1. ✅ `public/_redirects` - Cloudflare Pages routing rules
2. ✅ `.github/workflows/deploy-cloudflare.yml` - GitHub Actions workflow (optional)
3. ✅ `wrangler.toml` - Wrangler configuration (optional)
4. ✅ `docs/deployment/cloudflare-setup.md` - Complete setup guide

## Configuration Changes

1. ✅ `vite.config.ts` - Base path changed from `/errl-portal/` to `/`
2. ✅ `vite.config.ts` - Added `copyRedirectsPlugin()` to copy `_redirects` file

## Before Deploying

### Fix Build Issues (if any)

⚠️ **Note**: There's a current build issue with `errl-design-system` dependency that needs to be resolved before deployment:

```
Error: Rollup failed to resolve import "react" from errl-design-system
```

This is unrelated to Cloudflare setup but must be fixed for successful deployment.

**To verify build works:**
```bash
npm run portal:build
```

**Expected output:**
- Build completes successfully
- `dist/` directory contains all files
- `dist/_redirects` file exists
- All assets are in correct locations

### Verify Redirects File

After build, check that `dist/_redirects` exists and contains:
```
/studio/*  /studio.html  200
/*  /index.html  200
```

## Cloudflare Dashboard Setup

Follow the complete guide in `docs/deployment/cloudflare-setup.md`

### Quick Steps:

1. [ ] Add domain `errl.wtf` to Cloudflare
2. [ ] Update nameservers at domain registrar
3. [ ] Create Cloudflare Pages project
4. [ ] Connect GitHub repository
5. [ ] Configure build:
   - Build command: `npm run portal:build`
   - Output directory: `dist`
   - Node version: `20`
6. [ ] Add custom domain: `errl.wtf`
7. [ ] Verify SSL/TLS is set to "Full (strict)"
8. [ ] Enable performance optimizations

## Post-Deployment Verification

- [ ] Site loads at `https://errl.wtf`
- [ ] Studio app routes work: `https://errl.wtf/studio`
- [ ] Static pages work: `https://errl.wtf/portal/pages/about/`
- [ ] HTTPS certificate is valid
- [ ] All assets load correctly
- [ ] No console errors in browser

## Deployment Options

### Option A: Cloudflare Pages GitHub Integration (Recommended)

- Connect repo in Cloudflare dashboard
- Automatic deployments on push to `main`
- No GitHub Actions needed
- Simplest setup

### Option B: GitHub Actions + Wrangler

- Uses `.github/workflows/deploy-cloudflare.yml`
- Requires GitHub Secrets:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`
- More control over deployment process

## Troubleshooting

See `docs/deployment/cloudflare-setup.md` for detailed troubleshooting guide.

Common issues:
- DNS not resolving → Check nameservers
- 404 errors on routes → Verify `_redirects` file in `dist/`
- Assets not loading → Check base path is `/`
- Build failures → Fix dependency issues first
