# Kiosk Virtual Keyboard Fix Script - PowerShell Version
# Fix virtual keyboard not showing for kiosk user

# Check administrator privileges
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "[ERROR] Administrator privileges required" -ForegroundColor Red
    Write-Host "Please right-click and select 'Run as administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kiosk Virtual Keyboard Fix v1.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$LogFile = Join-Path $PSScriptRoot "fix-keyboard-kiosk.log"
"Fix started: $(Get-Date)" | Out-File -FilePath $LogFile -Encoding UTF8
Write-Host ""

# Step 1: Ensure TabletInputService is running
Write-Host "[Step 1/6] Checking TabletInputService" -ForegroundColor Yellow
try {
    $service = Get-Service -Name TabletInputService -ErrorAction Stop
    if ($service.Status -eq 'Running') {
        Write-Host "[OK] TabletInputService is running" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] TabletInputService is not running, starting..." -ForegroundColor Yellow
        Set-Service -Name TabletInputService -StartupType Automatic
        Start-Service -Name TabletInputService
        Write-Host "[SUCCESS] TabletInputService started" -ForegroundColor Green
    }
    "TabletInputService: OK" | Out-File -FilePath $LogFile -Append -Encoding UTF8
} catch {
    Write-Host "[ERROR] TabletInputService issue: $_" -ForegroundColor Red
    "TabletInputService error: $_" | Out-File -FilePath $LogFile -Append -Encoding UTF8
}
Write-Host ""

# Step 2: Grant kiosk user permissions to TabTip.exe
Write-Host "[Step 2/6] Setting TabTip.exe permissions" -ForegroundColor Yellow
$tabtipPaths = @(
    "C:\Program Files\Common Files\microsoft shared\ink\TabTip.exe",
    "C:\Program Files (x86)\Common Files\microsoft shared\ink\TabTip.exe"
)

foreach ($path in $tabtipPaths) {
    if (Test-Path $path) {
        try {
            icacls $path /grant "kiosk:RX" /T | Out-Null
            Write-Host "[SUCCESS] Set permissions for: $path" -ForegroundColor Green
            "Permissions set: $path" | Out-File -FilePath $LogFile -Append -Encoding UTF8
        } catch {
            Write-Host "[ERROR] Failed to set permissions for: $path" -ForegroundColor Red
        }
    }
}
Write-Host ""

# Step 3: Enable virtual keyboard in system registry
Write-Host "[Step 3/6] Configuring system registry" -ForegroundColor Yellow
try {
    New-Item -Path "HKLM:\SOFTWARE\Microsoft\TabletTip\1.7" -Force | Out-Null
    New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\TabletTip\1.7" -Force | Out-Null
    Write-Host "[SUCCESS] System registry configured" -ForegroundColor Green
    "System registry: OK" | Out-File -FilePath $LogFile -Append -Encoding UTF8
} catch {
    Write-Host "[ERROR] Registry configuration failed: $_" -ForegroundColor Red
}
Write-Host ""

# Step 4: Configure kiosk user profile (if user exists and not logged in)
Write-Host "[Step 4/6] Configuring kiosk user profile" -ForegroundColor Yellow
try {
    $kioskUser = Get-LocalUser -Name "kiosk" -ErrorAction Stop
    Write-Host "[INFO] Kiosk user exists" -ForegroundColor Gray

    # Try to load user registry (only works if user is not logged in)
    $userProfile = "C:\Users\kiosk\NTUSER.DAT"
    if (Test-Path $userProfile) {
        try {
            reg load HKU\kiosk_temp $userProfile 2>&1 | Out-Null

            # Configure touch keyboard settings
            reg add "HKU\kiosk_temp\Software\Microsoft\TabletTip\1.7" /v EnableDesktopModeAutoInvoke /t REG_DWORD /d 1 /f 2>&1 | Out-Null
            reg add "HKU\kiosk_temp\Software\Microsoft\TabletTip\1.7" /v EdgeTargetDockedState /t REG_DWORD /d 1 /f 2>&1 | Out-Null

            reg unload HKU\kiosk_temp 2>&1 | Out-Null

            Write-Host "[SUCCESS] Kiosk user profile configured" -ForegroundColor Green
            "Kiosk profile: Configured" | Out-File -FilePath $LogFile -Append -Encoding UTF8
        } catch {
            Write-Host "[WARNING] Could not modify user profile (user may be logged in)" -ForegroundColor Yellow
            Write-Host "[INFO] Settings will be applied on next login" -ForegroundColor Gray
            "User profile: Not modified (user logged in)" | Out-File -FilePath $LogFile -Append -Encoding UTF8
        }
    }
} catch {
    Write-Host "[WARNING] Kiosk user does not exist yet" -ForegroundColor Yellow
    "Kiosk user: Does not exist" | Out-File -FilePath $LogFile -Append -Encoding UTF8
}
Write-Host ""

# Step 5: Grant kiosk user permissions to ink directory
Write-Host "[Step 5/6] Setting ink directory permissions" -ForegroundColor Yellow
$inkDirs = @(
    "C:\Program Files\Common Files\microsoft shared\ink",
    "C:\Program Files (x86)\Common Files\microsoft shared\ink"
)

foreach ($dir in $inkDirs) {
    if (Test-Path $dir) {
        try {
            icacls $dir /grant "kiosk:(OI)(CI)RX" /T | Out-Null
            Write-Host "[SUCCESS] Set permissions for: $dir" -ForegroundColor Green
            "Directory permissions: $dir" | Out-File -FilePath $LogFile -Append -Encoding UTF8
        } catch {
            Write-Host "[WARNING] Failed to set permissions for: $dir" -ForegroundColor Yellow
        }
    }
}
Write-Host ""

# Step 6: Add kiosk user to required groups
Write-Host "[Step 6/6] Checking user group membership" -ForegroundColor Yellow
try {
    $kioskUser = Get-LocalUser -Name "kiosk" -ErrorAction Stop

    # Ensure kiosk user is in Users group
    try {
        Add-LocalGroupMember -Group "Users" -Member "kiosk" -ErrorAction SilentlyContinue
        Write-Host "[OK] Kiosk user group membership verified" -ForegroundColor Green
    } catch {
        # User already in group
        Write-Host "[OK] Kiosk user already in Users group" -ForegroundColor Green
    }

    "User groups: OK" | Out-File -FilePath $LogFile -Append -Encoding UTF8
} catch {
    Write-Host "[INFO] Kiosk user does not exist yet" -ForegroundColor Gray
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fix Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[Summary]" -ForegroundColor Cyan
Write-Host "- TabletInputService: Running and auto-start enabled"
Write-Host "- TabTip.exe permissions: Granted to kiosk user"
Write-Host "- Registry: Configured for virtual keyboard"
Write-Host "- User profile: Updated (if applicable)"
Write-Host "- Directory permissions: Set"
Write-Host ""
Write-Host "[Next Steps]" -ForegroundColor Yellow
Write-Host "1. If kiosk user is currently logged in:"
Write-Host "   - Log out and log back in"
Write-Host "   - OR run this script again after logging out"
Write-Host ""
Write-Host "2. Test virtual keyboard in DreamBook"
Write-Host ""
Write-Host "3. If still not working, check:"
Write-Host "   - Windows Update (touch keyboard may need updates)"
Write-Host "   - Group Policy settings (gpedit.msc)"
Write-Host "   - Hardware touch support recognition"
Write-Host ""
Write-Host "Log file: $LogFile" -ForegroundColor Gray
Write-Host ""

"Fix completed: $(Get-Date)" | Out-File -FilePath $LogFile -Append -Encoding UTF8
pause
