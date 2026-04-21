# Complete Setup Guide: Auth0 + Azure Deployment Slots

## 🎯 Overview

Your setup uses Azure deployment slots:
- **Production:** `https://backfolio-frontend-ayh5hnewazg6fph4.canadacentral-01.azurewebsites.net`
- **Staging:** `https://backfolio-frontend-staging-brb5fjfdaufydfez.canadacentral-01.azurewebsites.net`

---

## Step 1: Configure Auth0 Dashboard

### Go to Auth0 Dashboard
https://manage.auth0.com → Applications → Your Application

### Add Both URLs to These Settings:

**Allowed Callback URLs:**
```
http://localhost:3000,http://localhost:5173,https://backfolio-frontend-ayh5hnewazg6fph4.canadacentral-01.azurewebsites.net,https://backfolio-frontend-staging-brb5fjfdaufydfez.canadacentral-01.azurewebsites.net
```

**Allowed Logout URLs:**
```
http://localhost:3000,http://localhost:5173,https://backfolio-frontend-ayh5hnewazg6fph4.canadacentral-01.azurewebsites.net,https://backfolio-frontend-staging-brb5fjfdaufydfez.canadacentral-01.azurewebsites.net
```

**Allowed Web Origins:**
```
http://localhost:3000,http://localhost:5173,https://backfolio-frontend-ayh5hnewazg6fph4.canadacentral-01.azurewebsites.net,https://backfolio-frontend-staging-brb5fjfdaufydfez.canadacentral-01.azurewebsites.net
```

**Allowed Origins (CORS):**
```
http://localhost:3000,http://localhost:5173,https://backfolio-frontend-ayh5hnewazg6fph4.canadacentral-01.azurewebsites.net,https://backfolio-frontend-staging-brb5fjfdaufydfez.canadacentral-01.azurewebsites.net
```

**Save Changes** ✅

---

## Step 2: Add GitHub Secrets

Go to: https://github.com/backfolio/BackfolioFrontend/settings/secrets/actions

Add these 4 secrets:

| Secret Name | Value |
|-------------|-------|
| `VITE_AUTH0_DOMAIN` | `dev-iobg5riagaafw7km.us.auth0.com` |
| `VITE_AUTH0_CLIENT_ID` | `702BrNIJ0blkNxJpV1MR86oPz87IaDGj` |
| `VITE_AUTH0_AUDIENCE` | `https://api.backfolio.io` |
| `VITE_AUTH0_REDIRECT_URI_STAGING` | `https://backfolio-frontend-staging-brb5fjfdaufydfez.canadacentral-01.azurewebsites.net` |

---

## Step 3: (Optional) Configure Azure Slot-Specific Settings

If you want to also set environment variables in Azure (for reference/logging):

### Staging Slot
```bash
az webapp config appsettings set \
  --name backfolio-frontend \
  --resource-group backfolio-fe-rg \
  --slot staging \
  --settings \
    VITE_AUTH0_DOMAIN="dev-iobg5riagaafw7km.us.auth0.com" \
    VITE_AUTH0_CLIENT_ID="702BrNIJ0blkNxJpV1MR86oPz87IaDGj" \
    VITE_AUTH0_AUDIENCE="https://api.backfolio.io" \
    VITE_AUTH0_REDIRECT_URI="https://backfolio-frontend-staging-brb5fjfdaufydfez.canadacentral-01.azurewebsites.net"
```

### Production Slot
```bash
az webapp config appsettings set \
  --name backfolio-frontend \
  --resource-group backfolio-fe-rg \
  --settings \
    VITE_AUTH0_DOMAIN="dev-iobg5riagaafw7km.us.auth0.com" \
    VITE_AUTH0_CLIENT_ID="702BrNIJ0blkNxJpV1MR86oPz87IaDGj" \
    VITE_AUTH0_AUDIENCE="https://api.backfolio.io" \
    VITE_AUTH0_REDIRECT_URI="https://backfolio-frontend-ayh5hnewazg6fph4.canadacentral-01.azurewebsites.net"
```

**Note:** These Azure settings are **for reference only** since Vite uses build-time variables. The actual values come from GitHub secrets during the build.

---

## Step 4: Deploy via GitHub Actions

### Commit and Push
```bash
git add .
git commit -m "Configure Auth0 for deployment slots"
git push origin main
```

The GitHub Actions workflow will:
1. ✅ Build with Auth0 environment variables (from GitHub secrets)
2. ✅ Package the application
3. ✅ Deploy to Azure staging slot
4. ✅ Start the application

---

## Step 5: Test Your Deployments

### Test Staging
```bash
open https://backfolio-frontend-staging-brb5fjfdaufydfez.canadacentral-01.azurewebsites.net
```

**Check:**
- [ ] Browser console shows correct Auth0 config with staging URL
- [ ] Login redirects to Auth0
- [ ] After login, returns to staging URL
- [ ] Logout works correctly

### Swap to Production (when ready)
```bash
# Swap staging slot to production
az webapp deployment slot swap \
  --name backfolio-frontend \
  --resource-group backfolio-fe-rg \
  --slot staging \
  --target-slot production
```

### Test Production
```bash
open https://backfolio-frontend-ayh5hnewazg6fph4.canadacentral-01.azurewebsites.net
```

---

## 🔄 Deployment Workflow

### For Staging Deployments
1. Push to `main` branch → GitHub Actions automatically deploys to **staging slot**
2. Test on staging URL
3. If good, swap staging to production

### For Production Deployments
Either:
- **Option A:** Swap staging to production (recommended)
- **Option B:** Create a separate workflow for production with `VITE_AUTH0_REDIRECT_URI_PRODUCTION` secret

---

## 🛠️ Helper Commands

### Check Slot Configuration
```bash
# View staging slot settings
az webapp config appsettings list \
  --name backfolio-frontend \
  --resource-group backfolio-fe-rg \
  --slot staging \
  --query "[?contains(name, 'AUTH0')].{name:name, value:value}" \
  --output table

# View production slot settings
az webapp config appsettings list \
  --name backfolio-frontend \
  --resource-group backfolio-fe-rg \
  --query "[?contains(name, 'AUTH0')].{name:name, value:value}" \
  --output table
```

### Check Deployment Slot Status
```bash
az webapp deployment slot list \
  --name backfolio-frontend \
  --resource-group backfolio-fe-rg \
  --output table
```

### View Slot Logs
```bash
# Staging logs
az webapp log tail \
  --name backfolio-frontend \
  --resource-group backfolio-fe-rg \
  --slot staging

# Production logs
az webapp log tail \
  --name backfolio-frontend \
  --resource-group backfolio-fe-rg
```

### Restart Slots
```bash
# Restart staging
az webapp restart \
  --name backfolio-frontend \
  --resource-group backfolio-fe-rg \
  --slot staging

# Restart production
az webapp restart \
  --name backfolio-frontend \
  --resource-group backfolio-fe-rg
```

---

## 📋 Quick Reference

### Your URLs
- **Staging:** https://backfolio-frontend-staging-brb5fjfdaufydfez.canadacentral-01.azurewebsites.net
- **Production:** https://backfolio-frontend-ayh5hnewazg6fph4.canadacentral-01.azurewebsites.net

### Your Auth0 Config
- **Domain:** dev-iobg5riagaafw7km.us.auth0.com
- **Client ID:** 702BrNIJ0blkNxJpV1MR86oPz87IaDGj
- **Audience:** https://api.backfolio.io

### GitHub Secrets Needed
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_AUDIENCE`
- `VITE_AUTH0_REDIRECT_URI_STAGING`

---

## ✅ Complete Checklist

### Auth0 Configuration
- [ ] Added staging URL to Allowed Callback URLs
- [ ] Added production URL to Allowed Callback URLs
- [ ] Added staging URL to Allowed Logout URLs
- [ ] Added production URL to Allowed Logout URLs
- [ ] Added staging URL to Allowed Web Origins
- [ ] Added production URL to Allowed Web Origins
- [ ] Added staging URL to Allowed Origins (CORS)
- [ ] Added production URL to Allowed Origins (CORS)
- [ ] Saved changes in Auth0 Dashboard

### GitHub Secrets
- [ ] Added `VITE_AUTH0_DOMAIN`
- [ ] Added `VITE_AUTH0_CLIENT_ID`
- [ ] Added `VITE_AUTH0_AUDIENCE`
- [ ] Added `VITE_AUTH0_REDIRECT_URI_STAGING`

### Deployment
- [ ] Committed workflow changes
- [ ] Pushed to main branch
- [ ] Verified GitHub Actions workflow ran successfully
- [ ] Tested staging deployment
- [ ] Verified Auth0 login flow on staging
- [ ] Swapped to production (when ready)
- [ ] Tested production deployment

---

**Last Updated:** November 16, 2025
