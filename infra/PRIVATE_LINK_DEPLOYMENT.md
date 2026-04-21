# AFD Header Validation Deployment Guide

## Overview

Secures your App Service behind Azure Front Door using header validation with **$0 additional cost**. Direct access to `*.azurewebsites.net` URLs will be blocked.

## How It Works

1. Azure Front Door sends unique `X-Azure-FDID` header with every request
2. App Service only accepts requests with this header
3. Direct requests to `.azurewebsites.net` are rejected (403 Forbidden)

## Cost Impact

**$0 additional** - uses existing AFD and App Service tier

## Prerequisites

You must already have Azure Front Door configured. If not, set it up first:

```bash
# Check if AFD exists
az afd profile list --query "[].{name:name,id:id}" -o table
```

## Deployment Steps

### 1. Get Your AFD ID

```bash
# List your Front Door profiles
az afd profile list --query "[].{name:name,frontDoorId:frontDoorId}" -o table

# Or get specific profile
az afd profile show \
  --profile-name <your-afd-name> \
  --resource-group <your-rg> \
  --query frontDoorId -o tsv
```

Copy the `frontDoorId` (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### 2. Update Parameters

Edit `main.parameters.json`:

```json
{
  "azureFrontDoorId": {
    "value": "your-front-door-id-here"
  }
}
```

### 3. Deploy

```bash
RESOURCE_GROUP="<your-resource-group>"

az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file infra/main.bicep \
  --parameters infra/main.parameters.json
```

### 4. Verify

```bash
# Get your App Service URL
APP_URL=$(az webapp list \
  --resource-group $RESOURCE_GROUP \
  --query "[0].defaultHostName" -o tsv)

# Test direct access (should be BLOCKED - 403 Forbidden)
curl -I https://$APP_URL

# Test via AFD (should work)
curl -I https://www.backfolio.io
```

## Quick Apply (Portal)

If you don't want to redeploy, configure via Portal:

1. Go to App Service → Networking → Access Restrictions
2. Click "+ Add rule"
3. Configure:
   - **Name**: Allow-AFD-Only
   - **Priority**: 100
   - **Type**: Service Tag
   - **Service Tag**: AzureFrontDoor.Backend
   - **Action**: Allow
4. Click "Add http header restriction"
   - **Header**: X-Azure-FDID
   - **Operator**: Equals
   - **Value**: `<your-front-door-id>`
5. Add final rule:
   - **Name**: Deny-All
   - **Priority**: 2147483647
   - **Source**: Any
   - **Action**: Deny

## Staging Environment

Repeat for staging with staging AFD ID:

```bash
az deployment group create \
  --resource-group rg-backfolio-staging \
  --template-file infra/main.bicep \
  --parameters environment=staging azureFrontDoorId=<staging-afd-id>
```

## Troubleshooting

### "403 Forbidden" on www.backfolio.io

Check AFD is sending correct header:

```bash
curl -I https://www.backfolio.io -H "X-Azure-FDID: <your-front-door-id>"
```

If still fails, AFD config may be wrong. Verify origin hostname.

### Still Accessible Directly

- Wait 2-3 minutes for rule propagation
- Check rule priority (100 should be first)
- Verify `frontDoorId` matches your AFD

### Deployment Broken

Temporarily disable restrictions:

```bash
az webapp config access-restriction remove \
  --name <app-name> \
  --resource-group $RESOURCE_GROUP \
  --rule-name Allow-AFD-Only
```

## Security Validation

```bash
# Should FAIL (403 Forbidden)
curl https://backfolio-frontend-brb5fjfdaufydfez.canadacentral-01.azurewebsites.net

# Should SUCCEED
curl https://www.backfolio.io
```

## Next Steps

1. Enable AFD WAF rules (free on Standard/Premium)
2. Configure rate limiting
3. Monitor AFD logs for blocked requests
4. Test thoroughly before applying to production
