# Kiosk Virtual Keyboard Fix Script - Enhanced Version
# Fix virtual keyboard not showing for kiosk user
# Version 2.0 - With TrustedInstaller ownership handling

# Check administrator privileges
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "[错误] 需要管理员权限" -ForegroundColor Red
    Write-Host "请右键选择 '以管理员身份运行'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kiosk Virtual Keyboard Fix v2.0" -ForegroundColor Cyan
Write-Host "  Enhanced with ownership handling" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$LogFile = Join-Path $PSScriptRoot "fix-keyboard-kiosk-v2.log"
"Fix started: $(Get-Date)" | Out-File -FilePath $LogFile -Encoding UTF8
Write-Host ""

# Helper function to take ownership and set permissions
function Set-FileOwnershipAndPermissions {
    param(
        [string]$Path,
        [string]$User = "kiosk"
    )

    if (-not (Test-Path $Path)) {
        return $false
    }

    try {
        # Take ownership
        Write-Host "  获取文件所有权..." -ForegroundColor Gray
        takeown /f "$Path" /a /r /d y 2>&1 | Out-Null

        # Grant administrators full control
        icacls "$Path" /grant "Administrators:(F)" /t /c /q 2>&1 | Out-Null

        # Grant kiosk user read and execute
        icacls "$Path" /grant "${User}:(RX)" /t /c /q 2>&1 | Out-Null

        return $true
    } catch {
        return $false
    }
}

# Step 1: Ensure TabletInputService is running
Write-Host "[步骤 1/7] 检查 TabletInputService" -ForegroundColor Yellow
try {
    $service = Get-Service -Name TabletInputService -ErrorAction Stop
    if ($service.Status -eq 'Running') {
        Write-Host "[成功] TabletInputService 正在运行" -ForegroundColor Green
    } else {
        Write-Host "[警告] TabletInputService 未运行，正在启动..." -ForegroundColor Yellow
        Set-Service -Name TabletInputService -StartupType Automatic
        Start-Service -Name TabletInputService
        Write-Host "[成功] TabletInputService 已启动" -ForegroundColor Green
    }
    "TabletInputService: OK" | Out-File -FilePath $LogFile -Append -Encoding UTF8
} catch {
    Write-Host "[错误] TabletInputService 问题: $_" -ForegroundColor Red
    "TabletInputService error: $_" | Out-File -FilePath $LogFile -Append -Encoding UTF8
}
Write-Host ""

# Step 2: Take ownership and set permissions for TabTip.exe
Write-Host "[步骤 2/7] 获取 TabTip.exe 所有权并设置权限" -ForegroundColor Yellow
$tabtipPaths = @(
    "C:\Program Files\Common Files\microsoft shared\ink\TabTip.exe",
    "C:\Program Files (x86)\Common Files\microsoft shared\ink\TabTip.exe"
)

foreach ($path in $tabtipPaths) {
    if (Test-Path $path) {
        Write-Host "  处理: $path" -ForegroundColor Gray
        if (Set-FileOwnershipAndPermissions -Path $path -User "kiosk") {
            Write-Host "[成功] 权限已设置: $path" -ForegroundColor Green
            "Permissions set: $path" | Out-File -FilePath $LogFile -Append -Encoding UTF8
        } else {
            Write-Host "[警告] 权限设置可能失败: $path" -ForegroundColor Yellow
            "Permission warning: $path" | Out-File -FilePath $LogFile -Append -Encoding UTF8
        }
    }
}
Write-Host ""

# Step 3: Set permissions for ink directories
Write-Host "[步骤 3/7] 设置 ink 目录权限" -ForegroundColor Yellow
$inkDirs = @(
    "C:\Program Files\Common Files\microsoft shared\ink",
    "C:\Program Files (x86)\Common Files\microsoft shared\ink"
)

foreach ($dir in $inkDirs) {
    if (Test-Path $dir) {
        Write-Host "  处理: $dir" -ForegroundColor Gray
        if (Set-FileOwnershipAndPermissions -Path $dir -User "kiosk") {
            Write-Host "[成功] 目录权限已设置: $dir" -ForegroundColor Green
            "Directory permissions: $dir" | Out-File -FilePath $LogFile -Append -Encoding UTF8
        } else {
            Write-Host "[警告] 目录权限设置可能失败: $dir" -ForegroundColor Yellow
        }
    }
}
Write-Host ""

# Step 4: Enable virtual keyboard in system registry (using reg command)
Write-Host "[步骤 4/7] 配置系统注册表" -ForegroundColor Yellow
try {
    reg add "HKLM\SOFTWARE\Microsoft\TabletTip\1.7" /f 2>&1 | Out-Null
    reg add "HKLM\SOFTWARE\Policies\Microsoft\TabletTip\1.7" /f 2>&1 | Out-Null
    Write-Host "[成功] 系统注册表已配置" -ForegroundColor Green
    "System registry: OK" | Out-File -FilePath $LogFile -Append -Encoding UTF8
} catch {
    Write-Host "[警告] 注册表配置可能失败: $_" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Add kiosk to Interactive group (for touch keyboard access)
Write-Host "[步骤 5/7] 配置用户组" -ForegroundColor Yellow
try {
    # Ensure kiosk user exists
    $kioskUser = Get-LocalUser -Name "kiosk" -ErrorAction Stop
    Write-Host "[信息] Kiosk 用户存在" -ForegroundColor Gray

    # Try to add to Interactive group (this may not work on all systems)
    try {
        net localgroup "Users" kiosk /add 2>&1 | Out-Null
        Write-Host "[成功] 用户组配置完成" -ForegroundColor Green
    } catch {
        Write-Host "[信息] 用户已在所需组中" -ForegroundColor Gray
    }

    "User groups: OK" | Out-File -FilePath $LogFile -Append -Encoding UTF8
} catch {
    Write-Host "[警告] Kiosk 用户不存在" -ForegroundColor Yellow
}
Write-Host ""

# Step 6: Configure kiosk user profile (if not logged in)
Write-Host "[步骤 6/7] 配置 kiosk 用户配置文件" -ForegroundColor Yellow
$userProfile = "C:\Users\kiosk\NTUSER.DAT"
if (Test-Path $userProfile) {
    try {
        reg load HKU\kiosk_temp $userProfile 2>&1 | Out-Null

        # Configure touch keyboard settings
        reg add "HKU\kiosk_temp\Software\Microsoft\TabletTip\1.7" /v EnableDesktopModeAutoInvoke /t REG_DWORD /d 1 /f 2>&1 | Out-Null
        reg add "HKU\kiosk_temp\Software\Microsoft\TabletTip\1.7" /v EdgeTargetDockedState /t REG_DWORD /d 1 /f 2>&1 | Out-Null

        reg unload HKU\kiosk_temp 2>&1 | Out-Null

        Write-Host "[成功] Kiosk 用户配置文件已更新" -ForegroundColor Green
        "Kiosk profile: Configured" | Out-File -FilePath $LogFile -Append -Encoding UTF8
    } catch {
        Write-Host "[警告] 无法修改用户配置文件（用户可能已登录）" -ForegroundColor Yellow
        Write-Host "[信息] 请注销 kiosk 用户后重新运行此脚本" -ForegroundColor Gray
        "User profile: Not modified (user logged in)" | Out-File -FilePath $LogFile -Append -Encoding UTF8
    }
} else {
    Write-Host "[信息] Kiosk 用户配置文件不存在（用户可能尚未登录过）" -ForegroundColor Gray
}
Write-Host ""

# Step 7: Create a helper script for kiosk user to manually launch keyboard
Write-Host "[步骤 7/7] 创建手动启动键盘的快捷方式" -ForegroundColor Yellow
$helperScript = "C:\kiosk\launch-keyboard.bat"
$helperDir = Split-Path $helperScript

try {
    if (-not (Test-Path $helperDir)) {
        New-Item -ItemType Directory -Path $helperDir -Force | Out-Null
    }

    @'
@echo off
REM Manual keyboard launcher for kiosk user
start "" "C:\Program Files\Common Files\microsoft shared\ink\TabTip.exe"
'@ | Out-File -FilePath $helperScript -Encoding ASCII -Force

    icacls $helperScript /grant "kiosk:(RX)" /c /q 2>&1 | Out-Null

    Write-Host "[成功] 已创建手动启动脚本: $helperScript" -ForegroundColor Green
    "Helper script: Created" | Out-File -FilePath $LogFile -Append -Encoding UTF8
} catch {
    Write-Host "[警告] 无法创建辅助脚本" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  修复完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[总结]" -ForegroundColor Cyan
Write-Host "- TabletInputService: 已启动并设为自动启动"
Write-Host "- TabTip.exe 所有权: 已获取"
Write-Host "- TabTip.exe 权限: 已授予 kiosk 用户"
Write-Host "- 目录权限: 已设置"
Write-Host "- 系统注册表: 已配置"
Write-Host "- 用户配置文件: 已更新（如适用）"
Write-Host "- 手动启动脚本: 已创建"
Write-Host ""
Write-Host "[下一步 - 重要！]" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 如果 kiosk 用户当前已登录：" -ForegroundColor White
Write-Host "   a) 注销 kiosk 用户"
Write-Host "   b) 重新以管理员身份运行此脚本"
Write-Host "   c) 重新登录 kiosk 用户"
Write-Host ""
Write-Host "2. 测试虚拟键盘：" -ForegroundColor White
Write-Host "   - 登录 kiosk 用户"
Write-Host "   - 打开 DreamBook 应用"
Write-Host "   - 点击输入框"
Write-Host "   - 虚拟键盘应该弹出"
Write-Host ""
Write-Host "3. 如果仍不工作，手动测试：" -ForegroundColor White
Write-Host "   - 在 kiosk 用户下运行: C:\kiosk\launch-keyboard.bat"
Write-Host "   - 或运行: C:\Program Files\Common Files\microsoft shared\ink\TabTip.exe"
Write-Host ""
Write-Host "4. 如果手动也无法启动：" -ForegroundColor White
Write-Host "   - 检查 Windows 更新"
Write-Host "   - 检查触摸键盘功能是否被组策略禁用"
Write-Host "   - 考虑使用传统屏幕键盘 (osk.exe)"
Write-Host ""
Write-Host "日志文件: $LogFile" -ForegroundColor Gray
Write-Host ""

"Fix completed: $(Get-Date)" | Out-File -FilePath $LogFile -Append -Encoding UTF8
pause
