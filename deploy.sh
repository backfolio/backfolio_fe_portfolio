#!/bin/bash

# Backfolio Frontend - Azure Deployment Script
# This script builds and deploys the React/Vite app to Azure Web App

set -e

echo "🚀 Starting Backfolio Frontend Deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables (customize these)
RESOURCE_GROUP="rg-backfolio"
LOCATION="eastus"
BICEP_FILE="./infra/main.bicep"
PARAMETERS_FILE="./infra/main.parameters.json"

# Step 1: Build the application
echo -e "${BLUE}📦 Building the application...${NC}"
npm install
npm run build

if [ ! -d "dist" ]; then
  echo -e "${RED}❌ Build failed! dist folder not found.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Build completed successfully!${NC}"

# Step 2: Create Resource Group (if it doesn't exist)
echo -e "${BLUE}🏗️  Creating resource group...${NC}"
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --output none

echo -e "${GREEN}✅ Resource group ready!${NC}"

# Step 3: Validate Bicep deployment
echo -e "${BLUE}🔍 Validating deployment...${NC}"
az deployment group validate \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "$BICEP_FILE" \
  --parameters "$PARAMETERS_FILE"

echo -e "${GREEN}✅ Validation passed!${NC}"

# Step 4: Preview deployment (what-if)
echo -e "${BLUE}👀 Previewing deployment changes...${NC}"
az deployment group what-if \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "$BICEP_FILE" \
  --parameters "$PARAMETERS_FILE"

# Step 5: Deploy infrastructure
echo -e "${BLUE}☁️  Deploying infrastructure...${NC}"
DEPLOYMENT_OUTPUT=$(az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "$BICEP_FILE" \
  --parameters "$PARAMETERS_FILE" \
  --output json)

WEB_APP_NAME=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.properties.outputs.webAppName.value')
WEB_APP_URL=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.properties.outputs.webAppUrl.value')

echo -e "${GREEN}✅ Infrastructure deployed!${NC}"
echo -e "${BLUE}Web App Name: $WEB_APP_NAME${NC}"

# Step 6: Deploy application code
echo -e "${BLUE}📤 Deploying application to Azure Web App...${NC}"

# Create a deployment package
cd dist
zip -r ../deploy.zip . > /dev/null
cd ..

# Deploy using az webapp deployment
az webapp deployment source config-zip \
  --resource-group "$RESOURCE_GROUP" \
  --name "$WEB_APP_NAME" \
  --src deploy.zip

# Clean up
rm deploy.zip

echo -e "${GREEN}✅ Application deployed successfully!${NC}"
echo -e ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${BLUE}Your app is now available at: ${GREEN}$WEB_APP_URL${NC}"
echo -e ""
echo -e "📝 Next steps:"
echo -e "  1. Visit $WEB_APP_URL to see your app"
echo -e "  2. Configure custom domain (optional)"
echo -e "  3. Set up CI/CD with GitHub Actions"
