# Fix Cloudflare Authentication Issue

**Date**: 2026-01-13  
**Build Status**: ✅ **SUCCESS**  
**Issue**: Cloudflare API authentication failure

## Problem

The build succeeds, but deployment fails with:
```
Cloudflare API returned non-200: 400
Unable to authenticate request
```

## Root Cause

The GitHub Actions workflow needs Cloudflare API credentials that aren't configured in GitHub secrets.

## Solution Options

### Option 1: Add GitHub Secrets (For GitHub Actions)

**Step 1: Get Cloudflare API Token**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click your profile icon (top right) → **My Profile**
3. Go to **API Tokens** tab
4. Click **Create Token**
5. Use **"Edit Cloudflare Workers"** template OR create custom token with:
   - **Permissions**: 
     - Account → Cloudflare Pages → Edit
     - Zone → Zone → Read (if needed)
   - **Account Resources**: Include → Your account
6. Click **Continue to summary** → **Create Token**
7. **Copy the token immediately** (you won't see it again!)

**Step 2: Get Cloudflare Account ID**

1. In Cloudflare Dashboard, select your account
2. Account ID is shown in the **right sidebar** under "Account ID"
3. Copy the Account ID

**Step 3: Add Secrets to GitHub**

1. Go to your GitHub repository: `https://github.com/Extrepa/errl-portal`
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add first secret:
   - **Name**: `CLOUDFLARE_API_TOKEN`
   - **Value**: Paste your API token
   - Click **Add secret**
6. Add second secret:
   - **Name**: `CLOUDFLARE_ACCOUNT_ID`
   - **Value**: Paste your Account ID
   - Click **Add secret**

**Step 4: Re-run Workflow**

1. Go to **Actions** tab
2. Click on the failed workflow run
3. Click **Re-run all jobs** (or **Re-run failed jobs**)

The deployment should now succeed!

---

### Option 2: Use Cloudflare Pages GitHub Integration (Recommended - Simpler)

This is easier and doesn't require GitHub secrets.

**Step 1: Connect Repository in Cloudflare**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Pages**
3. Click **Create a project**
4. Click **Connect to Git**
5. Authorize Cloudflare to access GitHub (if needed)
6. Select repository: `Extrepa/errl-portal`

**Step 2: Configure Build Settings**

- **Project name**: `errl-portal` (or your preferred name)
- **Production branch**: `main`
- **Framework preset**: None (or Vite if available)
- **Build command**: `npm run portal:build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave empty)
- **Node.js version**: `20`

**Step 3: Save and Deploy**

1. Click **Save and Deploy**
2. Cloudflare will build and deploy automatically
3. Wait for first deployment to complete (~3-5 minutes)

**Benefits**:
- ✅ No GitHub secrets needed
- ✅ Automatic deployments on push to `main`
- ✅ Preview deployments for pull requests
- ✅ Built-in rollback capability
- ✅ Simpler setup

**Step 4: (Optional) Disable GitHub Actions**

If you use Cloudflare Pages integration, you can disable the GitHub Actions workflow:

1. Go to `.github/workflows/deploy-cloudflare.yml`
2. Comment out or delete the workflow file
3. OR keep it as backup (it won't interfere)

---

## Which Option to Choose?

**Use Option 2 (Cloudflare Pages Integration)** if:
- You want simpler setup
- You don't want to manage GitHub secrets
- You want automatic deployments

**Use Option 1 (GitHub Secrets)** if:
- You prefer GitHub Actions for deployment
- You want more control over the deployment process
- You're already familiar with GitHub Actions

---

## Verification

After configuring authentication:

1. **Check Build Logs**: Should show successful build
2. **Check Deployment**: Should complete successfully
3. **Visit Site**: Should load at Cloudflare Pages URL
4. **Test Routes**: Verify all pages work correctly

---

## Current Status

✅ **Build**: Working perfectly (`✓ built in 5.44s`)  
✅ **Code**: All issues resolved  
✅ **Output**: Complete and correct  
⚠️ **Deployment**: Needs authentication configuration  

Once authentication is configured, deployment will proceed automatically!

---

**Next Step**: Choose Option 1 or Option 2 above and configure Cloudflare authentication.
