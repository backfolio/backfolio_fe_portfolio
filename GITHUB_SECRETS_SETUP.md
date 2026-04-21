# GitHub Secrets Setup for Auth0

## 🔐 Add GitHub Secrets

You need to add 4 secrets to your GitHub repository for the deployment workflow to work.

### Step 1: Go to GitHub Repository Settings

Navigate to:
```
https://github.com/backfolio/BackfolioFrontend/settings/secrets/actions
```

Or manually:
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Step 2: Add These Secrets

Add each secret one at a time:

#### Secret 1: VITE_AUTH0_DOMAIN
- **Name:** `VITE_AUTH0_DOMAIN`
- **Value:** `dev-iobg5riagaafw7km.us.auth0.com`

#### Secret 2: VITE_AUTH0_CLIENT_ID
- **Name:** `VITE_AUTH0_CLIENT_ID`
- **Value:** Your Auth0 Client ID (from your .env file or Auth0 Dashboard)

#### Secret 3: VITE_AUTH0_AUDIENCE
- **Name:** `VITE_AUTH0_AUDIENCE`
- **Value:** `https://api.backfolio.io`

#### Secret 4: VITE_AUTH0_REDIRECT_URI_STAGING
- **Name:** `VITE_AUTH0_REDIRECT_URI_STAGING`
- **Value:** `https://backfolio-frontend-ayh5hnewazg6fph4.canadacentral-01.azurewebsites.net` (your staging slot URL)

### Step 3: Verify Secrets

After adding all secrets, you should see:
```
✓ VITE_AUTH0_DOMAIN
✓ VITE_AUTH0_CLIENT_ID
✓ VITE_AUTH0_AUDIENCE
✓ VITE_AUTH0_REDIRECT_URI_STAGING
```

## 📋 Quick Copy-Paste Values

Get your values from your local `.env` file:

```bash
# Show your current values (Client ID hidden)
cat .env | grep VITE_AUTH0
```

## 🚀 Deploy After Setup

Once secrets are added:

### Option 1: Push to Main Branch
```bash
git add .
git commit -m "Configure Auth0 for production deployment"
git push origin main
```

The GitHub Action will automatically trigger and deploy.

### Option 2: Manual Trigger
1. Go to **Actions** tab in GitHub
2. Select "Build and deploy Python app to Azure Web App"
3. Click **Run workflow**
4. Click **Run workflow** button

## 🧪 Verify Deployment

After the workflow completes:

1. **Check workflow logs:**
   - Go to Actions tab
   - Click on the latest workflow run
   - Verify "Build with Auth0 configuration" step shows the env vars (values will be hidden as ***)

2. **Test the deployed app:**
   ```bash
   open https://backfolio-frontend-ayh5hnewazg6fph4.canadacentral-01.azurewebsites.net
   ```

3. **Check browser console:**
   Open DevTools (F12) and verify:
   ```javascript
   Auth0 Config: {
     domain: "dev-iobg5riagaafw7km.us.auth0.com",
     clientId: "...",
     audience: "https://api.backfolio.io",
     redirectUri: "https://backfolio-frontend-ayh5hnewazg6fph4.canadacentral-01.azurewebsites.net"
   }
   ```

4. **Test login flow:**
   - Click Login
   - Should redirect to Auth0
   - After login, should return to dashboard

## 🐛 Troubleshooting

### "Context access might be invalid" warning in VS Code
This is normal! The workflow file references secrets that don't exist locally. The warning will disappear once you add the secrets to GitHub.

### Auth0 config shows `undefined` after deployment
- Secrets weren't set in GitHub
- Workflow didn't run after adding secrets
- Check workflow logs to ensure env vars were passed to build step

### "Callback URL mismatch" error
- Verify Auth0 Dashboard has the correct URLs configured
- See AUTH0_CONFIG.md for details

## 📚 Related Files

- **AUTH0_CONFIG.md** - Complete Auth0 configuration guide
- **deploy-with-auth.sh** - Local deployment script (alternative to GitHub Actions)
- **.github/workflows/main_backfolio-frontend(staging).yml** - Updated GitHub workflow

## ✅ Checklist

- [ ] Added `VITE_AUTH0_DOMAIN` secret to GitHub
- [ ] Added `VITE_AUTH0_CLIENT_ID` secret to GitHub
- [ ] Added `VITE_AUTH0_AUDIENCE` secret to GitHub
- [ ] Added `VITE_AUTH0_REDIRECT_URI_STAGING` secret to GitHub
- [ ] Configured Auth0 Dashboard (see AUTH0_CONFIG.md)
- [ ] Pushed workflow changes to main branch
- [ ] Verified workflow ran successfully
- [ ] Tested login flow on deployed app
- [ ] Verified browser console shows correct Auth0 config

---

**Last Updated:** November 16, 2025
