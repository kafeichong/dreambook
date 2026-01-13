# DreamBook Shell Configuration Fix Script (PowerShell)
# Version: 2.0
# Date: 2026-01-13
# Usage: Right-click > Run with PowerShell (as Administrator)

# Check administrator privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: Administrator privileges required!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Right-click this file"
    Write-Host "2. Select 'Run with PowerShell'"
    Write-Host "3. Click 'Yes' in UAC dialog"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DreamBook Shell Fix Tool v2.0 (PS)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$logFile = Join-Path $PSScriptRoot "fix-shell-ps.log"
"Fix started: $(Get-Date)" | Out-File $logFile

# Step 1: Clean current user Shell config
Write-Host "[Step 1/4] Cleaning current user Shell config" -ForegroundColor Yellow
try {
    $shellPath = "HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Winlogon"
    $shellValue = Get-ItemProperty -Path $shellPath -Name "Shell" -ErrorAction SilentlyContinue
    
    if ($shellValue) {
        Remove-ItemProperty -Path $shellPath -Name "Shell" -Force
        Write-Host "[OK] Current user Shell config deleted" -ForegroundColor Green
        "Current user Shell deleted" | Out-File $logFile -Append
    } else {
        Write-Host "[OK] No custom Shell config found (normal)" -ForegroundColor Green
        "No custom Shell" | Out-File $logFile -Append
    }
} catch {
    Write-Host "[WARN] $($_.Exception.Message)" -ForegroundColor Yellow
    $_.Exception.Message | Out-File $logFile -Append
}
Write-Host ""

# Step 2: Clean Default User Shell config
Write-Host "[Step 2/4] Cleaning Default User Shell config" -ForegroundColor Yellow
try {
    reg load HKU\DEF "C:\Users\Default\NTUSER.DAT" 2>&1 | Out-Null
    
    if (Test-Path "Registry::HKU\DEF\Software\Microsoft\Windows NT\CurrentVersion\Winlogon") {
        $defShell = Get-ItemProperty -Path "Registry::HKU\DEF\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" -Name "Shell" -ErrorAction SilentlyContinue
        
        if ($defShell) {
            Remove-ItemProperty -Path "Registry::HKU\DEF\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" -Name "Shell" -Force
            Write-Host "[OK] Default User Shell deleted" -ForegroundColor Green
            "Default User Shell deleted" | Out-File $logFile -Append
        } else {
            Write-Host "[OK] No custom Shell (normal)" -ForegroundColor Green
            "No custom Shell" | Out-File $logFile -Append
        }
    }
    
    reg unload HKU\DEF 2>&1 | Out-Null
    Write-Host "[OK] Default User registry unloaded" -ForegroundColor Green
} catch {
    Write-Host "[WARN] $($_.Exception.Message)" -ForegroundColor Yellow
    $_.Exception.Message | Out-File $logFile -Append
}
Write-Host ""

# Step 3: Clean kiosk user Shell config
Write-Host "[Step 3/4] Cleaning kiosk user Shell config" -ForegroundColor Yellow
$kioskPath = "C:\Users\kiosk\NTUSER.DAT"
if (Test-Path $kioskPath) {
    try {
        reg load HKU\KIOSK $kioskPath 2>&1 | Out-Null
        
        if (Test-Path "Registry::HKU\KIOSK\Software\Microsoft\Windows NT\CurrentVersion\Winlogon") {
            $kioskShell = Get-ItemProperty -Path "Registry::HKU\KIOSK\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" -Name "Shell" -ErrorAction SilentlyContinue
            
            if ($kioskShell) {
                Remove-ItemProperty -Path "Registry::HKU\KIOSK\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" -Name "Shell" -Force
                Write-Host "[OK] Kiosk user Shell deleted" -ForegroundColor Green
                "Kiosk Shell deleted" | Out-File $logFile -Append
            } else {
                Write-Host "[OK] No custom Shell (normal)" -ForegroundColor Green
                "No custom Shell" | Out-File $logFile -Append
            }
        }
        
        reg unload HKU\KIOSK 2>&1 | Out-Null
        Write-Host "[OK] Kiosk user registry unloaded" -ForegroundColor Green
    } catch {
        Write-Host "[WARN] $($_.Exception.Message)" -ForegroundColor Yellow
        $_.Exception.Message | Out-File $logFile -Append
    }
} else {
    Write-Host "[OK] Kiosk user does not exist, skip" -ForegroundColor Green
    "Kiosk user not found" | Out-File $logFile -Append
}
Write-Host ""

# Step 4: Verify system Shell
Write-Host "[Step 4/4] Verifying system Shell config" -ForegroundColor Yellow
try {
    $sysShell = Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" -Name "Shell" -ErrorAction SilentlyContinue
    
    if ($sysShell) {
        Write-Host "[OK] System Shell: $($sysShell.Shell)" -ForegroundColor Green
        "System Shell: $($sysShell.Shell)" | Out-File $logFile -Append
    } else {
        Write-Host "[OK] Using default Shell (explorer.exe)" -ForegroundColor Green
        "Using default Shell" | Out-File $logFile -Append
    }
} catch {
    Write-Host "[WARN] $($_.Exception.Message)" -ForegroundColor Yellow
    $_.Exception.Message | Out-File $logFile -Append
}
Write-Host ""

# Fix complete
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fix Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[Summary]" -ForegroundColor Green
Write-Host "- Current user Shell: Cleaned"
Write-Host "- Default User Shell: Cleaned"
Write-Host "- Kiosk user Shell: Cleaned"
Write-Host ""
Write-Host "[Next Steps]" -ForegroundColor Yellow
Write-Host "1. Restart your computer"
Write-Host "2. Log in normally (no more black screen flash)"
Write-Host "3. DreamBook will run as normal app"
Write-Host ""
Write-Host "[Log file] $logFile" -ForegroundColor Gray
Write-Host ""

"Fix completed: $(Get-Date)" | Out-File $logFile -Append

Read-Host "Press Enter to exit"
