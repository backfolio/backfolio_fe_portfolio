#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Backfolio Frontend Deployment with Auth0${NC}\n"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Create a .env file with your Auth0 credentials"
    exit 1
fi

# Load environment variables from .env
export $(grep -v '^#' .env | xargs)

# Validate required variables
if [ -z "$VITE_AUTH0_DOMAIN" ] || [ -z "$VITE_AUTH0_CLIENT_ID" ] || [ -z "$VITE_AUTH0_AUDIENCE" ]; then
    echo -e "${RED}❌ Missing required Auth0 environment variables in .env${NC}"
    echo "Required: VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, VITE_AUTH0_AUDIENCE"
    exit 1
fi

# Configuration
WEB_APP_NAME="backfolio-frontend"
RESOURCE_GROUP="backfolio-fe-rg"
PRODUCTION_URL="https://backfolio-frontend-ayh5hnewazg6fph4.canadacentral-01.azurewebsites.net"

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "  Web App: $WEB_APP_NAME"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Production URL: $PRODUCTION_URL"
echo "  Auth0 Domain: $VITE_AUTH0_DOMAIN"
echo ""

# Step 1: Build with production environment variables
echo -e "${BLUE}🔨 Building application with production configuration...${NC}"
VITE_AUTH0_REDIRECT_URI="$PRODUCTION_URL" npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}\n"

# Step 2: Create deployment package
echo -e "${BLUE}📦 Creating deployment package...${NC}"
cd dist
zip -r ../dist.zip . > /dev/null
cd ..
echo -e "${GREEN}✅ Package created${NC}\n"

# Step 3: Deploy to Azure
echo -e "${BLUE}☁️  Deploying to Azure Web App...${NC}"
az webapp deployment source config-zip \
    --name "$WEB_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --src dist.zip \
    --timeout 300

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Deployment successful${NC}\n"

# Step 4: Set environment variables (for runtime logging/debugging only - Vite vars are build-time)
echo -e "${BLUE}⚙️  Configuring environment variables...${NC}"
az webapp config appsettings set \
    --name "$WEB_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --settings \
        VITE_AUTH0_DOMAIN="$VITE_AUTH0_DOMAIN" \
        VITE_AUTH0_CLIENT_ID="$VITE_AUTH0_CLIENT_ID" \
        VITE_AUTH0_AUDIENCE="$VITE_AUTH0_AUDIENCE" \
        VITE_AUTH0_REDIRECT_URI="$PRODUCTION_URL" \
    --output none

echo -e "${GREEN}✅ Environment variables configured${NC}\n"

# Step 5: Restart the web app
echo -e "${BLUE}🔄 Restarting web app...${NC}"
az webapp restart \
    --name "$WEB_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --output none

echo -e "${GREEN}✅ Web app restarted${NC}\n"

# Cleanup
rm dist.zip

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Deployment Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo -e "${BLUE}🌐 Your app is available at:${NC}"
echo -e "   $PRODUCTION_URL\n"
echo -e "${BLUE}📋 Next steps:${NC}"
echo "   1. Verify Auth0 configuration (see AUTH0_CONFIG.md)"
echo "   2. Test login flow at $PRODUCTION_URL/login"
echo "   3. Check browser console for Auth0 config logs"
echo ""
