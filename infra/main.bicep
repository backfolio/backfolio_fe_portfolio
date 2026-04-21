// Azure App Service Plan and Web App for Backfolio Frontend
// This Bicep file deploys the infrastructure needed for the React/Vite app

@description('The Azure region where resources will be deployed')
param location string = resourceGroup().location

@description('The name of the App Service Plan')
param appServicePlanName string = 'asp-backfolio-${uniqueString(resourceGroup().id)}'

@description('The name of the Web App')
param webAppName string = 'app-backfolio-${uniqueString(resourceGroup().id)}'

@description('Azure Front Door ID for header validation (get from existing AFD)')
param azureFrontDoorId string = ''

@description('Environment name (dev, staging, prod)')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environment string = 'dev'

@description('The SKU for the App Service Plan')
param appServicePlanSku object = {
  name: 'B1'
  tier: 'Basic'
  capacity: 1
}

// Tags for resource organization
var tags = {
  application: 'Backfolio'
  environment: environment
  managedBy: 'Bicep'
}

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  tags: tags
  sku: appServicePlanSku
  kind: 'linux'
  properties: {
    reserved: true // Required for Linux
  }
}

// Web App
resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  tags: tags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    clientAffinityEnabled: false
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      alwaysOn: environment == 'prod'
      http20Enabled: true
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      // Restrict access to Azure Front Door only via header validation
      ipSecurityRestrictions: !empty(azureFrontDoorId)
        ? [
            {
              action: 'Allow'
              priority: 100
              name: 'Allow-AFD-Only'
              description: 'Only allow traffic from Azure Front Door'
              ipAddress: 'AzureFrontDoor.Backend'
              tag: 'ServiceTag'
              headers: {
                'x-azure-fdid': [
                  azureFrontDoorId
                ]
              }
            }
            {
              action: 'Deny'
              priority: 2147483647
              name: 'Deny-All'
              description: 'Deny all other traffic'
              ipAddress: 'Any'
            }
          ]
        : []
      appSettings: [
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~20'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
      ]
      cors: {
        allowedOrigins: [
          '*'
        ]
        supportCredentials: false
      }
    }
  }
}

// Output the Web App URL
output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output webAppName string = webApp.name
output resourceGroupName string = resourceGroup().name
