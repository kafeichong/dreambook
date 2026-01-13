# =========================================
# Windows 触摸键盘修复脚本 (Kiosk 模式)
# 用途：诊断并修复 Kiosk 账户下虚拟键盘无法弹出的问题
# 使用：以管理员权限运行此脚本
# =========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "梦境解析 - 虚拟键盘诊断与修复工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否以管理员权限运行
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ 错误：请以管理员权限运行此脚本" -ForegroundColor Red
    Write-Host ""
    Write-Host "右键点击此脚本 -> '以管理员身份运行'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ 管理员权限已确认" -ForegroundColor Green
Write-Host ""

# =========================================
# 1. 检查触摸键盘服务
# =========================================
Write-Host "【1/7】检查触摸键盘服务..." -ForegroundColor Yellow

$services = @(
    "TabletInputService",  # 触摸键盘服务
    "TouchKeyboardService" # 触摸键盘服务（Win11）
)

foreach ($serviceName in $services) {
    $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue

    if ($service) {
        Write-Host "  服务: $serviceName" -ForegroundColor Cyan
        Write-Host "    状态: $($service.Status)" -ForegroundColor $(if ($service.Status -eq 'Running') { 'Green' } else { 'Yellow' })
        Write-Host "    启动类型: $($service.StartType)" -ForegroundColor Cyan

        # 如果服务未运行，尝试启动
        if ($service.Status -ne 'Running') {
            Write-Host "  ⚡ 正在启动服务..." -ForegroundColor Yellow
            try {
                Set-Service -Name $serviceName -StartupType Automatic
                Start-Service -Name $serviceName
                Write-Host "  ✅ 服务已启动并设置为自动启动" -ForegroundColor Green
            } catch {
                Write-Host "  ❌ 启动服务失败: $_" -ForegroundColor Red
            }
        } else {
            # 确保自动启动
            if ($service.StartType -ne 'Automatic') {
                Set-Service -Name $serviceName -StartupType Automatic
                Write-Host "  ✅ 已设置为自动启动" -ForegroundColor Green
            } else {
                Write-Host "  ✅ 服务正常运行" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "  ⚠️  服务 $serviceName 不存在（可能不是此Windows版本的服务）" -ForegroundColor Yellow
    }
    Write-Host ""
}

# =========================================
# 2. 检查 TabTip.exe 文件
# =========================================
Write-Host "【2/7】检查 TabTip.exe 文件..." -ForegroundColor Yellow

$tabtipPaths = @(
    "C:\Program Files\Common Files\microsoft shared\ink\TabTip.exe",
    "C:\Program Files (x86)\Common Files\microsoft shared\ink\TabTip.exe"
)

$tabtipFound = $false
foreach ($path in $tabtipPaths) {
    if (Test-Path $path) {
        Write-Host "  ✅ 找到: $path" -ForegroundColor Green
        $tabtipFound = $true

        # 测试运行权限
        try {
            $acl = Get-Acl $path
            Write-Host "    所有者: $($acl.Owner)" -ForegroundColor Cyan
        } catch {
            Write-Host "    ⚠️  无法读取文件权限" -ForegroundColor Yellow
        }
    }
}

if (-not $tabtipFound) {
    Write-Host "  ❌ 未找到 TabTip.exe，系统可能不支持触摸键盘" -ForegroundColor Red
}
Write-Host ""

# =========================================
# 3. 检查组策略设置
# =========================================
Write-Host "【3/7】检查组策略设置..." -ForegroundColor Yellow

# 检查触摸键盘是否被组策略禁用
$policyPath = "HKLM:\SOFTWARE\Microsoft\TabletTip\1.7"
try {
    if (Test-Path $policyPath) {
        $policyValue = Get-ItemProperty -Path $policyPath -ErrorAction SilentlyContinue
        Write-Host "  触摸键盘策略配置:" -ForegroundColor Cyan
        $policyValue | Format-List
    } else {
        Write-Host "  ℹ️  未发现特殊策略配置（使用默认设置）" -ForegroundColor Cyan
    }
} catch {
    Write-Host "  ⚠️  无法读取策略配置" -ForegroundColor Yellow
}
Write-Host ""

# =========================================
# 4. 修复：为所有用户启用触摸键盘
# =========================================
Write-Host "【4/7】为所有用户启用触摸键盘..." -ForegroundColor Yellow

try {
    # 创建或修改注册表项，允许触摸键盘自动显示
    $regPath = "HKLM:\SOFTWARE\Microsoft\TabletTip\1.7"
    if (-not (Test-Path $regPath)) {
        New-Item -Path $regPath -Force | Out-Null
    }

    # 启用触摸键盘（不同Windows版本可能不同）
    Set-ItemProperty -Path $regPath -Name "EnableDesktopModeAutoInvoke" -Value 1 -Type DWord -ErrorAction SilentlyContinue

    Write-Host "  ✅ 触摸键盘注册表配置已更新" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  注册表修改失败: $_" -ForegroundColor Yellow
}
Write-Host ""

# =========================================
# 5. 为 Kiosk 账户授权
# =========================================
Write-Host "【5/7】为 Kiosk 账户配置权限..." -ForegroundColor Yellow

# 获取 Kiosk 用户信息
$kioskUser = Read-Host "请输入 Kiosk 账户名称（例如: kiosk 或 kiosk-user）"

if ($kioskUser) {
    try {
        # 检查用户是否存在
        $user = Get-LocalUser -Name $kioskUser -ErrorAction Stop
        Write-Host "  ✅ 找到用户: $kioskUser" -ForegroundColor Green

        # 为该用户授予 TabTip.exe 运行权限
        foreach ($path in $tabtipPaths) {
            if (Test-Path $path) {
                Write-Host "    正在配置 $path 的权限..." -ForegroundColor Cyan

                $acl = Get-Acl $path
                $permission = "$env:COMPUTERNAME\$kioskUser", "ReadAndExecute", "Allow"
                $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
                $acl.SetAccessRule($accessRule)
                Set-Acl $path $acl

                Write-Host "    ✅ 权限已配置" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "  ⚠️  用户 '$kioskUser' 不存在或权限配置失败: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⏭️  跳过（未输入用户名）" -ForegroundColor Yellow
}
Write-Host ""

# =========================================
# 6. 测试虚拟键盘启动
# =========================================
Write-Host "【6/7】测试虚拟键盘启动..." -ForegroundColor Yellow

try {
    # 尝试启动 TabTip
    Write-Host "  正在启动 TabTip.exe..." -ForegroundColor Cyan
    Start-Process "TabTip.exe" -ErrorAction Stop

    Start-Sleep -Seconds 2

    # 检查进程是否运行
    $process = Get-Process -Name "TabTip" -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "  ✅ 虚拟键盘启动成功！" -ForegroundColor Green
        Write-Host "    进程 ID: $($process.Id)" -ForegroundColor Cyan

        # 关闭测试键盘
        Start-Sleep -Seconds 1
        Stop-Process -Name "TabTip" -Force -ErrorAction SilentlyContinue
        Write-Host "    (测试键盘已关闭)" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠️  键盘启动成功，但进程未检测到" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ 启动失败: $_" -ForegroundColor Red
}
Write-Host ""

# =========================================
# 7. 生成诊断报告
# =========================================
Write-Host "【7/7】生成诊断报告..." -ForegroundColor Yellow

$reportPath = "$env:USERPROFILE\Desktop\keyboard-diagnostic-report.txt"
$report = @"
========================================
梦境解析 - 虚拟键盘诊断报告
生成时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
========================================

【系统信息】
操作系统: $(Get-WmiObject -Class Win32_OperatingSystem | Select-Object -ExpandProperty Caption)
版本: $(Get-WmiObject -Class Win32_OperatingSystem | Select-Object -ExpandProperty Version)
当前用户: $env:USERNAME
计算机名: $env:COMPUTERNAME

【服务状态】
$($services | ForEach-Object {
    $svc = Get-Service -Name $_ -ErrorAction SilentlyContinue
    if ($svc) {
        "$_`: $($svc.Status) (启动类型: $($svc.StartType))"
    } else {
        "$_`: 不存在"
    }
} | Out-String)

【TabTip.exe 路径】
$($tabtipPaths | ForEach-Object {
    if (Test-Path $_) { "✅ $_" } else { "❌ $_" }
} | Out-String)

【建议操作】
1. 确保以管理员权限安装和运行应用
2. 在 Kiosk 账户中运行诊断脚本
3. 如仍有问题，考虑使用自定义虚拟键盘组件

========================================
"@

$report | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "  ✅ 报告已保存到桌面: $reportPath" -ForegroundColor Green
Write-Host ""

# =========================================
# 总结
# =========================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "诊断与修复完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步建议：" -ForegroundColor Yellow
Write-Host "1. 在 Kiosk 账户下重新运行应用，测试键盘是否弹出" -ForegroundColor White
Write-Host "2. 如果仍有问题，请查看桌面的诊断报告" -ForegroundColor White
Write-Host "3. 考虑将应用配置为以管理员权限自动运行" -ForegroundColor White
Write-Host ""

pause
