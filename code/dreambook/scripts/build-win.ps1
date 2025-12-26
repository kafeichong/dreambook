# Windows Build Script - Disable Code Signing
# Fix winCodeSign symbolic link permission error

param(
    [switch]$Dir,      # Build directory only, no installer
    [switch]$SkipCheck # Skip type checking
)

Write-Host "=== DreamBook Windows Build Script ===" -ForegroundColor Cyan
Write-Host ""

# Set environment variable to disable code signing
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
Write-Host "[OK] Environment variable set to disable code signing" -ForegroundColor Green

# Clear corrupted cache if exists
$cachePath = "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"
if (Test-Path $cachePath) {
    Write-Host "Clearing winCodeSign cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $cachePath -ErrorAction SilentlyContinue
    Write-Host "[OK] Cache cleared" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting build..." -ForegroundColor Yellow
Write-Host ""

# Select build command based on parameters
if ($SkipCheck) {
    Write-Host "Mode: Skip type check" -ForegroundColor Cyan
    npm run build:skip-check
} else {
    Write-Host "Mode: Full build (with type check)" -ForegroundColor Cyan
    npm run build
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Starting packaging..." -ForegroundColor Yellow
Write-Host ""

# Package
if ($Dir) {
    Write-Host "Output: Directory mode (win-unpacked)" -ForegroundColor Cyan
    electron-builder --win --dir
} else {
    Write-Host "Output: Installer" -ForegroundColor Cyan
    electron-builder --win
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[SUCCESS] Build completed!" -ForegroundColor Green
    Write-Host "Output directory: release\" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "[FAILED] Packaging failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}
