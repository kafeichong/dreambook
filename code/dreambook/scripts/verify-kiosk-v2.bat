@echo off
REM DreamBook Kiosk 配置验证脚本 v2.0
REM 版本: 2.0
REM 日期: 2026-01-13
REM 说明: 验证 Kiosk 配置或清理是否成功

setlocal EnableDelayedExpansion

echo ========================================
echo   DreamBook Kiosk 配置验证脚本 v2.0
echo ========================================
echo.

REM 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [警告] 部分检查需要管理员权限
    echo [信息] 继续以普通用户权限运行（功能受限）
    echo.
    set IS_ADMIN=0
) else (
    echo [信息] 管理员权限检查通过
    set IS_ADMIN=1
    echo.
)

REM 设置日志文件
set LOG_FILE=%~dp0verify-kiosk-v2.log
echo 验证开始时间: %date% %time% > "%LOG_FILE%"
echo. >> "%LOG_FILE%"

set ISSUES_FOUND=0
set TOTAL_CHECKS=0

echo [开始验证配置...]
echo.

REM ========================================
REM 检查 1: kiosk 用户
REM ========================================
set /a TOTAL_CHECKS+=1
echo [检查 1/%TOTAL_CHECKS%] kiosk 用户状态
echo [检查 1] kiosk 用户状态 >> "%LOG_FILE%"

net user kiosk >nul 2>&1
if %errorLevel% equ 0 (
    echo [√] kiosk 用户存在（Kiosk 模式配置）
    echo [√] kiosk 用户存在 >> "%LOG_FILE%"
    set KIOSK_USER_EXISTS=1
) else (
    echo [×] kiosk 用户不存在（正常模式）
    echo [×] kiosk 用户不存在 >> "%LOG_FILE%"
    set KIOSK_USER_EXISTS=0
)
echo.

REM ========================================
REM 检查 2: 自动登录配置
REM ========================================
set /a TOTAL_CHECKS+=1
echo [检查 2/%TOTAL_CHECKS%] 自动登录配置
echo [检查 2] 自动登录配置 >> "%LOG_FILE%"

for /f "tokens=3" %%a in ('reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v AutoAdminLogon 2^>nul ^| findstr /i "AutoAdminLogon"') do (
    if "%%a"=="1" (
        echo [√] 自动登录已启用（Kiosk 模式）
        echo [√] 自动登录已启用 >> "%LOG_FILE%"
        set AUTO_LOGIN=1
    ) else (
        echo [×] 自动登录已禁用（正常模式）
        echo [×] 自动登录已禁用 >> "%LOG_FILE%"
        set AUTO_LOGIN=0
    )
)

reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultUserName >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=3" %%a in ('reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultUserName 2^>nul ^| findstr /i "DefaultUserName"') do (
        echo [信息] 默认登录用户: %%a
        echo [信息] 默认登录用户: %%a >> "%LOG_FILE%"
    )
)
echo.

REM ========================================
REM 检查 3: 当前用户的 Shell 配置
REM ========================================
set /a TOTAL_CHECKS+=1
echo [检查 3/%TOTAL_CHECKS%] 当前用户的 Shell 配置
echo [检查 3] 当前用户的 Shell 配置 >> "%LOG_FILE%"

reg query "HKCU\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=3*" %%a in ('reg query "HKCU\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell 2^>nul ^| findstr /i "Shell"') do (
        echo [!] 当前用户有自定义 Shell: %%a %%b
        echo [!] 当前用户有自定义 Shell: %%a %%b >> "%LOG_FILE%"
        set /a ISSUES_FOUND+=1
        echo [警告] 这可能导致闪屏问题！
    )
) else (
    echo [√] 当前用户使用系统默认 Shell（正常）
    echo [√] 当前用户使用系统默认 Shell >> "%LOG_FILE%"
)
echo.

REM ========================================
REM 检查 4: Default User 的 Shell 配置
REM ========================================
if %IS_ADMIN%==1 (
    set /a TOTAL_CHECKS+=1
    echo [检查 4/%TOTAL_CHECKS%] Default User 的 Shell 配置
    echo [检查 4] Default User 的 Shell 配置 >> "%LOG_FILE%"

    reg load HKU\DEF "C:\Users\Default\NTUSER.DAT" >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        reg query "HKU\DEF\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell >nul 2>&1
        if %errorLevel% equ 0 (
            for /f "tokens=3*" %%a in ('reg query "HKU\DEF\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell 2^>nul ^| findstr /i "Shell"') do (
                echo [√] Default User 有自定义 Shell: %%a %%b
                echo [√] Default User 有自定义 Shell: %%a %%b >> "%LOG_FILE%"
            )
        ) else (
            echo [×] Default User 使用系统默认 Shell（已清理）
            echo [×] Default User 使用系统默认 Shell >> "%LOG_FILE%"
        )
        reg unload HKU\DEF >> "%LOG_FILE%" 2>&1
    ) else (
        echo [!] 无法加载 Default User 注册表
        echo [!] 无法加载 Default User 注册表 >> "%LOG_FILE%"
    )
    echo.
) else (
    echo [跳过] Default User Shell 检查（需要管理员权限）
    echo.
)

REM ========================================
REM 检查 5: 应用文件
REM ========================================
set /a TOTAL_CHECKS+=1
echo [检查 5/%TOTAL_CHECKS%] DreamBook 应用文件
echo [检查 5] DreamBook 应用文件 >> "%LOG_FILE%"

if exist "C:\kiosk\dreambook\dreambook.exe" (
    echo [√] 应用文件存在: C:\kiosk\dreambook\dreambook.exe
    echo [√] 应用文件存在 >> "%LOG_FILE%"
    set APP_EXISTS=1
) else (
    echo [×] 应用文件不存在
    echo [×] 应用文件不存在 >> "%LOG_FILE%"
    set APP_EXISTS=0
)
echo.

REM ========================================
REM 检查 6: 虚拟键盘服务
REM ========================================
set /a TOTAL_CHECKS+=1
echo [检查 6/%TOTAL_CHECKS%] 虚拟键盘服务
echo [检查 6] 虚拟键盘服务 >> "%LOG_FILE%"

sc query TabletInputService | findstr /i "RUNNING" >nul 2>&1
if %errorLevel% equ 0 (
    echo [√] TabletInputService 正在运行
    echo [√] TabletInputService 正在运行 >> "%LOG_FILE%"
) else (
    echo [!] TabletInputService 未运行
    echo [!] TabletInputService 未运行 >> "%LOG_FILE%"
    echo [信息] 触摸键盘可能无法自动弹出
)
echo.

REM ========================================
REM 检查 7: 系统默认 Shell
REM ========================================
set /a TOTAL_CHECKS+=1
echo [检查 7/%TOTAL_CHECKS%] 系统默认 Shell
echo [检查 7] 系统默认 Shell >> "%LOG_FILE%"

reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=3*" %%a in ('reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell 2^>nul ^| findstr /i "Shell"') do (
        echo [√] 系统 Shell: %%a %%b
        echo [√] 系统 Shell: %%a %%b >> "%LOG_FILE%"
    )
) else (
    echo [√] 使用 Windows 默认 Shell (explorer.exe)
    echo [√] 使用 Windows 默认 Shell >> "%LOG_FILE%"
)
echo.

REM ========================================
REM 总结
REM ========================================
echo ========================================
echo   验证结果总结
echo ========================================
echo.

if %KIOSK_USER_EXISTS%==1 (
    if %AUTO_LOGIN%==1 (
        if %APP_EXISTS%==1 (
            echo [状态] Kiosk 模式已配置
            echo.
            echo [配置详情]
            echo - kiosk 用户: 存在
            echo - 自动登录: 已启用
            echo - 应用文件: 存在
            echo - Shell 替换: 已配置
            echo.
            echo [建议]
            echo 1. 重启电脑测试自动登录
            echo 2. 验证 DreamBook 是否自动启动
            echo 3. 测试触摸键盘是否正常弹出
        ) else (
            echo [状态] Kiosk 配置不完整
            echo.
            echo [问题]
            echo × 应用文件不存在
            echo.
            echo [建议]
            echo 1. 将 DreamBook 部署到: C:\kiosk\dreambook\
            echo 2. 重新运行 setup-kiosk.bat
            set /a ISSUES_FOUND+=1
        )
    ) else (
        echo [状态] Kiosk 配置不完整
        echo.
        echo [问题]
        echo × 自动登录未启用
        echo.
        echo [建议]
        echo 1. 重新运行 setup-kiosk.bat
        set /a ISSUES_FOUND+=1
    )
) else (
    echo [状态] 正常模式（非 Kiosk）
    echo.
    echo [配置详情]
    echo - kiosk 用户: 不存在
    echo - 自动登录: 已禁用
    echo - Shell 替换: 已清理
    echo.
    if %ISSUES_FOUND% gtr 0 (
        echo [警告] 发现 %ISSUES_FOUND% 个配置问题
        echo.
        echo [建议]
        echo 1. 运行 fix-shell-config.bat 修复
        echo 2. 或运行 cleanup-kiosk-v2.bat 彻底清理
        echo 3. 重启电脑验证
    ) else (
        echo [建议]
        echo 系统配置正常，可以：
        echo 1. 正常使用 Windows
        echo 2. 双击运行 DreamBook 应用（普通模式）
        echo 3. 如需配置 Kiosk 模式，运行 setup-kiosk.bat
    )
)
echo.

if %ISSUES_FOUND% gtr 0 (
    echo [注意] 发现 %ISSUES_FOUND% 个问题，请查看上方详情
    echo.
)

echo [日志文件] %LOG_FILE%
echo.
echo 验证完成时间: %date% %time% >> "%LOG_FILE%"
pause
exit /b 0
