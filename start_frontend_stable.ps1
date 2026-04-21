# Script de démarrage STABLE du frontend Backfolio
# Utilise Start-Process pour lancer en arrière-plan

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BACKFOLIO FRONTEND - Demarrage Stable" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Tuer les anciens processus Node
$oldNodeProcs = Get-Process -Name node -ErrorAction SilentlyContinue
if ($oldNodeProcs) {
    Write-Host "Arret des anciens processus Node..." -ForegroundColor Yellow
    $oldNodeProcs | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Configuration
$FrontendDir = "c:\Users\Famille Leblanc\Documents\GitHub\BackfolioFrontend"

Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  - Port: 3000" -ForegroundColor Gray
Write-Host "  - Mode: Development" -ForegroundColor Gray
Write-Host ""

# Lancer le frontend en arrière-plan
Write-Host "Lancement du serveur Vite en arriere-plan..." -ForegroundColor Yellow

$scriptBlock = "cd '$FrontendDir'; npm run dev"
$FrontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", $scriptBlock -WindowStyle Minimized -PassThru

Start-Sleep -Seconds 8

# Vérifier que le processus tourne
if ($FrontendProcess.HasExited) {
    Write-Host ""
    Write-Host "ERREUR: Le frontend a crash au demarrage" -ForegroundColor Red
    exit 1
}

# Tester la connexion
$maxRetries = 15
$retryCount = 0
$isHealthy = $false

Write-Host "Test de connexion au frontend..." -ForegroundColor Yellow

while ($retryCount -lt $maxRetries -and -not $isHealthy) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            $isHealthy = $true
            Write-Host ""
            Write-Host "SUCCESS Frontend operationnel!" -ForegroundColor Green
            Write-Host "  - URL: http://localhost:3000" -ForegroundColor Cyan
            Write-Host "  - PID: $($FrontendProcess.Id)" -ForegroundColor Gray
            Write-Host ""
        }
    } catch {
        $retryCount++
        Write-Host "." -NoNewline -ForegroundColor Gray
        Start-Sleep -Seconds 1
    }
}

if (-not $isHealthy) {
    Write-Host ""
    Write-Host "ERREUR: Le frontend ne repond pas" -ForegroundColor Red
    Write-Host "Arret du processus..." -ForegroundColor Yellow
    Stop-Process -Id $FrontendProcess.Id -Force
    exit 1
}

Write-Host "Frontend pret! PID: $($FrontendProcess.Id)" -ForegroundColor Green
Write-Host ""
