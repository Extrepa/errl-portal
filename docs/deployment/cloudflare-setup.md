# Cloudflare Pages Deployment Guide

Complete guide for deploying Errl Portal to Cloudflare Pages with the domain **errl.wtf**.

## Prerequisites

- Cloudflare account (free tier works)
- Domain `errl.wtf` purchased and accessible
- GitHub repository with the code
- Node.js 18+ installed locally (for testing builds)

## Step 1: Add Domain to Cloudflare

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **"Add a Site"** or **"Add Site"** button
3. Enter your domain: `errl.wtf`
4. Click **"Add site"**
5. Select a plan (Free plan is sufficient for most use cases)
6. Click **"Continue"**

## Step 2: Configure Nameservers

Cloudflare will provide you with two nameservers. You need to update these at your domain registrar.

1. **Copy the nameservers** provided by Cloudflare (they look like):
   - `[name].ns.cloudflare.com`
   - `[name].ns.cloudflare.com`

2. **Go to your domain registrar** (where you purchased errl.wtf)

3. **Find DNS/Nameserver settings** for your domain

4. **Replace existing nameservers** with Cloudflare's nameservers

5. **Save changes**

6. **Wait for propagation** (usually 5 minutes to 1 hour, can take up to 24 hours)

   - You can check propagation status at: https://www.whatsmydns.net/
   - Cloudflare dashboard will show "Active" when nameservers are properly configured

## Step 3: Create Cloudflare Pages Project

1. In Cloudflare dashboard, go to **Workers & Pages** → **Pages**

2. Click **"Create a project"**

3. Click **"Connect to Git"**

4. **Authorize Cloudflare** to access your GitHub account (if not already done)

5. **Select repository**: `errl-portal` (or your repository name)

6. **Configure build settings**:
   - **Project name**: `errl-portal` (or your preferred name)
   - **Production branch**: `main`
   - **Framework preset**: None (or Vite if available)
   - **Build command**: `npm run portal:build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty or set to `/`)
   - **Node.js version**: `18` or `20` (recommended: `20`)

7. Click **"Save and Deploy"**

8. Wait for the first build to complete (usually 2-5 minutes)

## Step 4: Configure Custom Domain

1. In your Cloudflare Pages project, go to **Custom domains**

2. Click **"Set up a custom domain"**

3. Enter your domain: `errl.wtf`

4. Click **"Continue"**

5. Cloudflare will automatically:
   - Create necessary DNS records
   - Provision SSL/TLS certificate
   - Configure HTTPS redirect

6. Wait for DNS propagation and SSL certificate provisioning (usually 5-15 minutes)

7. Verify the domain is active:
   - Status should show as "Active" in Cloudflare dashboard
   - Visit `https://errl.wtf` to confirm site loads

## Step 5: Configure DNS Records (if needed)

Cloudflare Pages usually handles DNS automatically, but you can verify:

1. Go to **DNS** → **Records** in Cloudflare dashboard

2. You should see:
   - A CNAME record for `errl.wtf` pointing to your Pages deployment
   - Or automatic root domain handling

3. **Do not delete** any records Cloudflare creates automatically

## Step 6: SSL/TLS Configuration

1. Go to **SSL/TLS** in Cloudflare dashboard

2. Ensure **SSL/TLS encryption mode** is set to **"Full (strict)"**

3. **Automatic HTTPS Rewrites** should be enabled (default)

4. **Always Use HTTPS** should be enabled (default)

## Step 7: Performance Optimization

1. Go to **Speed** → **Optimization** in Cloudflare dashboard

2. Enable the following (all free):
   - ✅ **Auto Minify**: JavaScript, CSS, HTML
   - ✅ **Brotli** compression
   - ✅ **HTTP/2** (automatic)
   - ✅ **HTTP/3 (with QUIC)** (automatic)

3. **Caching**:
   - Go to **Caching** → **Configuration**
   - Set **Browser Cache TTL** to **4 hours** or **Respect Existing Headers**
   - Static assets will be cached automatically

## Step 8: Security Settings

1. **SSL/TLS**: Already configured in Step 6

2. **DDoS Protection**: Enabled automatically (no configuration needed)

3. **Web Application Firewall (WAF)**:
   - Available on Pro plan and above
   - Free plan includes basic DDoS protection

4. **Bot Fight Mode** (optional):
   - Go to **Security** → **Bots**
   - Enable if you want additional bot protection

## Step 9: Environment Variables (if needed)

If your build requires environment variables:

1. In your Pages project, go to **Settings** → **Environment variables**

2. Click **"Add variable"**

3. Add variables for:
   - **Production**: Variables used in production builds
   - **Preview**: Variables used in preview deployments (PRs)

4. Common examples:
   - API keys
   - Feature flags
   - Build-time configuration

5. **Never commit secrets** to your repository - use environment variables instead

## Step 10: Verify Deployment

### Check Site Accessibility

1. Visit `https://errl.wtf` - should load the main page
2. Visit `https://errl.wtf/studio` - should load Studio app
3. Visit `https://errl.wtf/portal/pages/about/` - should load static pages
4. Check browser console for any errors

### Verify HTTPS

1. Check SSL certificate:
   - Click the padlock icon in browser address bar
   - Certificate should be issued by Cloudflare
   - Should show as "Valid" or "Secure"

### Test Routing

1. **Studio app routing**:
   - `/studio` → should load Studio app
   - `/studio/code-lab` → should route within Studio app
   - `/studio/math-lab` → should route within Studio app

2. **Static pages**:
   - `/portal/pages/about/` → About page
   - `/portal/pages/gallery/` → Gallery page
   - `/portal/pages/assets/` → Assets page

### Check Build Logs

1. In Cloudflare Pages project, go to **Deployments**

2. Click on latest deployment

3. Review build logs for any warnings or errors

4. Check that `_redirects` file was included in build

## Automatic Deployments

Once configured, Cloudflare Pages will automatically:

- **Deploy on push to `main` branch**: Every push triggers a new production deployment
- **Create preview deployments**: Pull requests get preview URLs automatically
- **Provide instant rollbacks**: Roll back to any previous deployment with one click

### Deployment Workflow

1. Push code to `main` branch on GitHub
2. Cloudflare Pages detects the push
3. Runs build command: `npm run portal:build`
4. Deploys `dist/` directory
5. Updates production site automatically

## Troubleshooting

### DNS Not Resolving

**Symptoms**: Site doesn't load, DNS errors

**Solutions**:
1. Verify nameservers at registrar match Cloudflare
2. Wait for DNS propagation (can take up to 24 hours)
3. Check DNS propagation: https://www.whatsmydns.net/
4. Clear DNS cache: `sudo dscacheutil -flushcache` (macOS) or restart router

### 404 Errors on Routes

**Symptoms**: Main page loads, but routes like `/studio` return 404

**Solutions**:
1. Verify `_redirects` file exists in `dist/` after build
2. Check `_redirects` file content is correct:
   ```
   /studio/*  /studio.html  200
   /*  /index.html  200
   ```
3. Verify Cloudflare Pages routing is enabled
4. Check build logs to ensure `_redirects` was copied

### Assets Not Loading

**Symptoms**: Images, CSS, or JS files fail to load

**Solutions**:
1. Verify base path is `/` in `vite.config.ts`
2. Check built HTML files - asset paths should start with `/`
3. Ensure all assets are in `dist/` directory
4. Check browser console for 404 errors on specific assets
5. Verify Cloudflare caching isn't serving stale assets (purge cache if needed)

### Build Failures

**Symptoms**: Deployment fails, build errors in logs

**Solutions**:
1. Check Node.js version matches (should be 18 or 20)
2. Verify all dependencies install correctly
3. Test build locally: `npm run portal:build`
4. Check for missing environment variables
5. Review build logs in Cloudflare dashboard for specific errors
6. Ensure `package.json` has correct build script

### SSL Certificate Issues

**Symptoms**: HTTPS not working, certificate errors

**Solutions**:
1. Wait for SSL certificate provisioning (usually 5-15 minutes)
2. Verify domain is properly added to Cloudflare
3. Check SSL/TLS mode is set to "Full (strict)"
4. Ensure DNS records are correct
5. Contact Cloudflare support if issues persist

### Slow Deployments

**Symptoms**: Builds take a long time

**Solutions**:
1. Check build logs for slow steps
2. Optimize dependencies (remove unused packages)
3. Consider using build caching if available
4. Check Node.js version (newer versions may be faster)

## Monitoring & Analytics

### Cloudflare Analytics

1. Go to **Analytics** → **Web Analytics** in Cloudflare dashboard
2. Enable **Web Analytics** (free)
3. View traffic, page views, and visitor statistics

### Deployment History

1. Go to **Deployments** in your Pages project
2. View all deployments with:
   - Build status
   - Deployment time
   - Commit message
   - Preview URLs (for PRs)

### Performance Monitoring

1. Use browser DevTools to check:
   - Page load times
   - Asset loading
   - Network requests

2. Cloudflare provides:
   - CDN performance metrics
   - Cache hit rates
   - Bandwidth usage

## Rollback Deployment

If a deployment causes issues:

1. Go to **Deployments** in Cloudflare Pages
2. Find the last working deployment
3. Click **"..."** menu → **"Retry deployment"** or **"Rollback to this deployment"**
4. Site will revert to previous version

## Custom Error Pages (Optional)

1. Create custom error pages:
   - `404.html` for 404 errors
   - `500.html` for server errors

2. Place in `public/` directory (will be copied to `dist/`)

3. Cloudflare Pages will serve these automatically

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)
- [Cloudflare SSL/TLS Documentation](https://developers.cloudflare.com/ssl/)

## Support

If you encounter issues not covered here:

1. Check Cloudflare Pages documentation
2. Review build logs in Cloudflare dashboard
3. Test builds locally first
4. Contact Cloudflare support if needed
