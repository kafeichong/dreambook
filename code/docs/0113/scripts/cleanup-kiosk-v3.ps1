# DreamBook Kiosk 清理脚本 v3.0
# 对应 setup-kiosk-v3.bat
# 日期: 2026-01-13

# 检查管理员权限
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "[错误] 需要管理员权限" -ForegroundColor Red
    Write-Host "请右键选择 '以管理员身份运行'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DreamBook Kiosk 清理 v3.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$Confirm = Read-Host "确定要清理 Kiosk 配置？(Y/N)"
if ($Confirm -ne "Y" -and $Confirm -ne "y") {
    Write-Host "操作已取消" -ForegroundColor Yellow
    pause
    exit 0
}

Write-Host ""
$LogFile = Join-Path $PSScriptRoot "cleanup-kiosk-v3.log"
"清理开始: $(Get-Date)" | Out-File -FilePath $LogFile -Encoding UTF8
Write-Host ""

# 步骤 1: 删除 kiosk 用户
Write-Host "[步骤 1/4] 删除 kiosk 用户" -ForegroundColor Yellow
try {
    $user = Get-LocalUser -Name "kiosk" -ErrorAction Stop
    Remove-LocalUser -Name "kiosk" -ErrorAction Stop
    Write-Host "[成功] kiosk 用户已删除" -ForegroundColor Green
    "kiosk 用户已删除" | Out-File -FilePath $LogFile -Append -Encoding UTF8
} catch {
    Write-Host "[信息] kiosk 用户不存在" -ForegroundColor Gray
    "kiosk 用户不存在" | Out-File -FilePath $LogFile -Append -Encoding UTF8
}
Write-Host ""

# 步骤 2: 禁用自动登录
Write-Host "[步骤 2/4] 禁用自动登录" -ForegroundColor Yellow
try {
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" -Name "AutoAdminLogon" -Value "0" -ErrorAction Stop
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" -Name "DefaultUserName" -ErrorAction SilentlyContinue
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" -Name "DefaultPassword" -ErrorAction SilentlyContinue
    Write-Host "[成功] 自动登录已禁用" -ForegroundColor Green
    "自动登录已禁用" | Out-File -FilePath $LogFile -Append -Encoding UTF8
} catch {
    Write-Host "[错误] 禁用自动登录失败: $_" -ForegroundColor Red
    "禁用自动登录失败: $_" | Out-File -FilePath $LogFile -Append -Encoding UTF8
}
Write-Host ""

# 步骤 3: 删除启动项
Write-Host "[步骤 3/4] 删除启动项" -ForegroundColor Yellow
try {
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -Name "DreamBook" -ErrorAction Stop
    Write-Host "[成功] 启动项已删除" -ForegroundColor Green
    "启动项已删除" | Out-File -FilePath $LogFile -Append -Encoding UTF8
} catch {
    Write-Host "[信息] 启动项不存在" -ForegroundColor Gray
    "启动项不存在" | Out-File -FilePath $LogFile -Append -Encoding UTF8
}
Write-Host ""

# 步骤 4: 恢复界面配置
Write-Host "[步骤 4/4] 恢复界面配置" -ForegroundColor Yellow
try {
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer" -Name "NoTrayItemsDisplay" -ErrorAction SilentlyContinue
    Write-Host "[成功] 界面配置已恢复" -ForegroundColor Green
    "界面配置已恢复" | Out-File -FilePath $LogFile -Append -Encoding UTF8
} catch {
    Write-Host "[信息] 界面配置不存在" -ForegroundColor Gray
    "界面配置不存在" | Out-File -FilePath $LogFile -Append -Encoding UTF8
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  清理完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[总结]" -ForegroundColor Cyan
Write-Host "- kiosk 用户: 已删除"
Write-Host "- 自动登录: 已禁用"
Write-Host "- 启动项: 已删除"
Write-Host "- 界面: 已恢复"
Write-Host ""
Write-Host "[下一步]" -ForegroundColor Yellow
Write-Host "1. 重启电脑"
Write-Host "2. 正常登录 Windows"
Write-Host "3. DreamBook 变为普通应用"
Write-Host ""

"清理完成: $(Get-Date)" | Out-File -FilePath $LogFile -Append -Encoding UTF8
pause
