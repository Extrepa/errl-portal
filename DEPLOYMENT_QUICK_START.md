# Quick Deployment Guide

**Status**: ✅ Ready to Deploy

## Pre-Flight Checklist

✅ Build verified (`npm run portal:build` passes)  
✅ TypeScript compilation passes  
✅ Build output structure correct  
✅ `_redirects` file present  
✅ Configuration files ready  

## Cloudflare Pages Deployment Steps

### 1. Create Pages Project
- Go to Cloudflare Dashboard → Workers & Pages → Pages
- Click "Create a project" → "Connect to Git"
- Select your `errl-portal` repository

### 2. Configure Build Settings
```
Build command:    npm run portal:build
Output directory:  dist
Node.js version:   20
Production branch: main
```

### 3. Add Custom Domain
- In Pages project → Custom domains → "Set up a custom domain"
- Enter: `errl.wtf`
- Wait for SSL certificate (5-15 minutes)

### 4. Configure SSL/TLS
- Go to SSL/TLS settings
- Set encryption mode to: **Full (strict)**

### 5. Enable Performance
- Speed → Optimization
- Enable: Auto Minify (JS, CSS, HTML)
- Enable: Brotli compression

## Post-Deployment Testing

After deployment, test:
- [ ] `https://errl.wtf` loads
- [ ] `/studio` routes correctly
- [ ] All navigation links work
- [ ] Assets load correctly
- [ ] No console errors
- [ ] HTTPS certificate valid

## Troubleshooting

**Build fails?**
- Check Node.js version is 20
- Verify `package.json` has correct scripts
- Review build logs in Cloudflare dashboard

**404 errors on routes?**
- Verify `dist/_redirects` exists after build
- Check Cloudflare Pages routing is enabled

**Assets not loading?**
- Verify base path is `/` in `vite.config.ts`
- Check asset paths in built HTML files

## Full Documentation

See `docs/deployment/cloudflare-setup.md` for complete guide.
