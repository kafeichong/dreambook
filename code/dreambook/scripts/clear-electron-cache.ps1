# Clear Electron Builder Cache Script
# Fix winCodeSign symbolic link permission error

Write-Host "Clearing Electron Builder cache..." -ForegroundColor Yellow

$cachePath = "$env:LOCALAPPDATA\electron-builder\Cache"

if (Test-Path $cachePath) {
    Write-Host "Found cache directory: $cachePath" -ForegroundColor Cyan
    
    # Clear winCodeSign cache
    $winCodeSignPath = Join-Path $cachePath "winCodeSign"
    if (Test-Path $winCodeSignPath) {
        Write-Host "Clearing winCodeSign cache..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force $winCodeSignPath -ErrorAction SilentlyContinue
        Write-Host "[OK] winCodeSign cache cleared" -ForegroundColor Green
    }
    
    # Optional: Clear all cache (uncomment to use)
    # Write-Host "Clearing all Electron Builder cache..." -ForegroundColor Yellow
    # Remove-Item -Recurse -Force $cachePath -ErrorAction SilentlyContinue
    # Write-Host "[OK] All cache cleared" -ForegroundColor Green
    
    Write-Host "`nCache cleared! You can now re-run the build command." -ForegroundColor Green
} else {
    Write-Host "Cache directory not found, may have been cleared already." -ForegroundColor Gray
}

Write-Host "`nTips: If the problem persists, try one of the following:" -ForegroundColor Cyan
Write-Host "1. Run PowerShell as Administrator, then execute the build command" -ForegroundColor White
Write-Host "2. Enable Windows Developer Mode (Settings > Update & Security > For developers)" -ForegroundColor White
Write-Host "3. Clear cache manually: Remove-Item -Recurse -Force `"$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign`"" -ForegroundColor White
