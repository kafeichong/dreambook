# DreamBook Kiosk 配置脚本
# 版本: 1.0
# 日期: 2026-01-13
# 说明: 自动配置 Windows 10 Kiosk 模式

# 检查管理员权限
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "[错误] 需要管理员权限" -ForegroundColor Red
    Write-Host "请右键选择 '以管理员身份运行'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DreamBook Kiosk 配置 v1.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[信息] 管理员权限检查通过" -ForegroundColor Green
Write-Host ""

# 设置日志文件
$LogFile = Join-Path $PSScriptRoot "setup-kiosk.log"
Write-Host "[信息] 日志文件: $LogFile" -ForegroundColor Gray
"配置开始时间: $(Get-Date)" | Out-File -FilePath $LogFile -Encoding UTF8
"" | Out-File -FilePath $LogFile -Append -Encoding UTF8

# 配置参数
Write-Host "[步骤 1/6] 配置参数设置" -ForegroundColor Yellow
"[步骤 1/6] 配置参数设置" | Out-File -FilePath $LogFile -Append -Encoding UTF8

$KioskUser = "kiosk"
$KioskPassword = "DreamBook2026!"
$AppPath = "C:\kiosk\dreambook\dreambook.exe"

Write-Host "用户名: $KioskUser"
Write-Host "应用路径: $AppPath"
Write-Host ""

# 创建 kiosk 用户
Write-Host "[步骤 2/6] 创建 kiosk 用户账户" -ForegroundColor Yellow
"[步骤 2/6] 创建 kiosk 用户账户" | Out-File -FilePath $LogFile -Append -Encoding UTF8

try {
    $user = Get-LocalUser -Name $KioskUser -ErrorAction Stop
    Write-Host "[警告] 用户 $KioskUser 已存在，跳过创建" -ForegroundColor Yellow
    "[警告] 用户 $KioskUser 已存在，跳过创建" | Out-File -FilePath $LogFile -Append -Encoding UTF8
} catch {
    try {
        $SecurePassword = ConvertTo-SecureString $KioskPassword -AsPlainText -Force
        New-LocalUser -Name $KioskUser -Password $SecurePassword -PasswordNeverExpires -ErrorAction Stop | Out-Null
        Write-Host "[成功] 用户 $KioskUser 创建成功" -ForegroundColor Green
        "[成功] 用户 $KioskUser 创建成功" | Out-File -FilePath $LogFile -Append -Encoding UTF8
    } catch {
        Write-Host "[错误] 用户创建失败: $_" -ForegroundColor Red
        "[错误] 用户创建失败: $_" | Out-File -FilePath $LogFile -Append -Encoding UTF8
        pause
        exit 1
    }
}
Write-Host ""

# 配置自动登录
Write-Host "[步骤 3/6] 配置自动登录" -ForegroundColor Yellow
"[步骤 3/6] 配置自动登录" | Out-File -FilePath $LogFile -Append -Encoding UTF8

try {
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" -Name "DefaultUserName" -Value $KioskUser -ErrorAction Stop
    Write-Host "[成功] 设置默认用户名" -ForegroundColor Green

    Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" -Name "DefaultPassword" -Value $KioskPassword -ErrorAction Stop
    Write-Host "[成功] 设置默认密码" -ForegroundColor Green

    Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" -Name "AutoAdminLogon" -Value "1" -ErrorAction Stop
    Write-Host "[成功] 启用自动登录" -ForegroundColor Green

    "自动登录配置成功" | Out-File -FilePath $LogFile -Append -Encoding UTF8
} catch {
    Write-Host "[错误] 配置自动登录失败: $_" -ForegroundColor Red
    "配置自动登录失败: $_" | Out-File -FilePath $LogFile -Append -Encoding UTF8
    pause
    exit 1
}
Write-Host ""

# 配置 Shell 替换
Write-Host "[步骤 4/6] 配置 Shell 替换" -ForegroundColor Yellow
"[步骤 4/6] 配置 Shell 替换" | Out-File -FilePath $LogFile -Append -Encoding UTF8

if (-not (Test-Path $AppPath)) {
    Write-Host "[警告] 应用文件不存在: $AppPath" -ForegroundColor Yellow
    Write-Host "[警告] 请确保应用已部署到该路径" -ForegroundColor Yellow
    "[警告] 应用文件不存在: $AppPath" | Out-File -FilePath $LogFile -Append -Encoding UTF8
}

try {
    # 加载 Default User 注册表
    reg load HKU\DEF "C:\Users\Default\NTUSER.DAT" 2>&1 | Out-Null
    Write-Host "[成功] 加载 Default User 注册表" -ForegroundColor Green

    # 设置 Shell
    reg add "HKU\DEF\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell /t REG_SZ /d "$AppPath" /f 2>&1 | Out-Null
    Write-Host "[成功] 设置 Shell 为 dreambook.exe" -ForegroundColor Green

    # 卸载注册表
    reg unload HKU\DEF 2>&1 | Out-Null
    Write-Host "[成功] 卸载 Default User 注册表" -ForegroundColor Green

    "Shell 配置成功" | Out-File -FilePath $LogFile -Append -Encoding UTF8
} catch {
    Write-Host "[错误] Shell 配置失败: $_" -ForegroundColor Red
    "[错误] Shell 配置失败: $_" | Out-File -FilePath $LogFile -Append -Encoding UTF8
    reg unload HKU\DEF 2>&1 | Out-Null
    pause
    exit 1
}
Write-Host ""

# 启用虚拟键盘服务
Write-Host "[步骤 5/6] 启用虚拟键盘服务" -ForegroundColor Yellow
"[步骤 5/6] 启用虚拟键盘服务" | Out-File -FilePath $LogFile -Append -Encoding UTF8

try {
    Set-Service -Name TabletInputService -StartupType Automatic -ErrorAction Stop
    Write-Host "[成功] 设置虚拟键盘服务为自动启动" -ForegroundColor Green

    Start-Service -Name TabletInputService -ErrorAction SilentlyContinue
    Write-Host "[成功] 启动虚拟键盘服务" -ForegroundColor Green

    "虚拟键盘服务配置成功" | Out-File -FilePath $LogFile -Append -Encoding UTF8
} catch {
    Write-Host "[警告] 虚拟键盘服务配置失败，但不影响主要功能" -ForegroundColor Yellow
    "虚拟键盘服务配置失败: $_" | Out-File -FilePath $LogFile -Append -Encoding UTF8
}
Write-Host ""

# 配置应用权限
Write-Host "[步骤 6/6] 配置应用权限" -ForegroundColor Yellow
"[步骤 6/6] 配置应用权限" | Out-File -FilePath $LogFile -Append -Encoding UTF8

if (Test-Path "C:\kiosk\dreambook") {
    try {
        icacls "C:\kiosk\dreambook" /grant "${KioskUser}:(OI)(CI)F" /T 2>&1 | Out-Null
        Write-Host "[成功] 设置应用目录权限" -ForegroundColor Green
        "应用目录权限配置成功" | Out-File -FilePath $LogFile -Append -Encoding UTF8
    } catch {
        Write-Host "[警告] 设置应用目录权限失败" -ForegroundColor Yellow
        "设置应用目录权限失败: $_" | Out-File -FilePath $LogFile -Append -Encoding UTF8
    }
} else {
    Write-Host "[警告] 应用目录不存在: C:\kiosk\dreambook" -ForegroundColor Yellow
    "[警告] 应用目录不存在: C:\kiosk\dreambook" | Out-File -FilePath $LogFile -Append -Encoding UTF8
}
Write-Host ""

# 配置完成
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  配置完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[总结]" -ForegroundColor Cyan
Write-Host "- kiosk 用户: $KioskUser"
Write-Host "- 自动登录: 已启用"
Write-Host "- Shell 替换: 已配置"
Write-Host "- 虚拟键盘: 已启用"
Write-Host ""
Write-Host "[下一步]" -ForegroundColor Yellow
Write-Host "1. 确保应用已部署到: $AppPath"
Write-Host "2. 运行 verify-kiosk.bat 验证配置"
Write-Host "3. 重启电脑测试自动登录"
Write-Host ""

"配置完成时间: $(Get-Date)" | Out-File -FilePath $LogFile -Append -Encoding UTF8
pause
