#!/bin/bash
# Quick Azure CLI commands for Auth0 configuration

# View current environment variables
echo "=== Current Environment Variables ==="
az webapp config appsettings list \
  --name backfolio-frontend \
  --resource-group backfolio-fe-rg \
  --query "[?contains(name, 'AUTH0') || contains(name, 'VITE')].{name:name, value:value}" \
  --output table

# Set Auth0 environment variables (replace YOUR_CLIENT_ID with actual value)
echo -e "\n=== Set Auth0 Configuration ==="
echo "Command:"
cat << 'EOF'
az webapp config appsettings set \
  --name backfolio-frontend \
  --resource-group backfolio-fe-rg \
  --settings \
    VITE_AUTH0_DOMAIN="dev-iobg5riagaafw7km.us.auth0.com" \
    VITE_AUTH0_CLIENT_ID="YOUR_CLIENT_ID" \
    VITE_AUTH0_AUDIENCE="https://api.backfolio.io" \
    VITE_AUTH0_REDIRECT_URI="https://backfolio-frontend-ayh5hnewazg6fph4.canadacentral-01.azurewebsites.net"
EOF

# View web app details
echo -e "\n=== Web App Details ==="
az webapp show \
  --name backfolio-frontend \
  --resource-group backfolio-fe-rg \
  --query "{name:name, state:state, url:defaultHostName, nodeVersion:siteConfig.linuxFxVersion}" \
  --output table

# Check deployment status
echo -e "\n=== Recent Deployments ==="
az webapp deployment list \
  --name backfolio-frontend \
  --resource-group backfolio-fe-rg \
  --query "[].{id:id, status:status, author:author, timestamp:receivedTime}" \
  --output table 2>/dev/null || echo "No deployments found or deployment history not available"

# Restart web app
echo -e "\n=== Restart Command ==="
echo "az webapp restart --name backfolio-frontend --resource-group backfolio-fe-rg"
