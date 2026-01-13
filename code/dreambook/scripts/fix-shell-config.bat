@echo off
REM DreamBook Shell 配置修复脚本
REM 用途: 修复因 cleanup-kiosk.bat 未完全清理导致的闪屏问题
REM 日期: 2026-01-13

setlocal EnableDelayedExpansion

REM 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ========================================
    echo   DreamBook Shell 配置修复脚本
    echo ========================================
    echo.
    echo [错误] 此脚本需要管理员权限
    echo.
    echo 请右键点击此脚本，选择"以管理员身份运行"
    echo.
    pause
    exit /b 1
)

echo ========================================
echo   DreamBook Shell 配置修复脚本
echo ========================================
echo.
echo [信息] 管理员权限检查通过
echo.

REM 设置日志文件
set LOG_FILE=%~dp0fix-shell-config.log
echo 修复开始时间: %date% %time% > "%LOG_FILE%"
echo. >> "%LOG_FILE%"

REM ========================================
REM 步骤 1: 清理当前用户的 Shell 配置
REM ========================================
echo [步骤 1/4] 清理当前用户的 Shell 配置
echo [步骤 1/4] 清理当前用户的 Shell 配置 >> "%LOG_FILE%"

REM 删除当前用户的自定义 Shell
reg delete "HKCU\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell /f >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [成功] 当前用户的 Shell 配置已删除
    echo [成功] 当前用户的 Shell 配置已删除 >> "%LOG_FILE%"
) else (
    echo [信息] 当前用户没有自定义 Shell 配置（正常）
    echo [信息] 当前用户没有自定义 Shell 配置 >> "%LOG_FILE%"
)
echo.

REM ========================================
REM 步骤 2: 清理 Default User 的 Shell 配置
REM ========================================
echo [步骤 2/4] 清理 Default User 的 Shell 配置
echo [步骤 2/4] 清理 Default User 的 Shell 配置 >> "%LOG_FILE%"

reg load HKU\DEF "C:\Users\Default\NTUSER.DAT" >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [成功] 加载 Default User 注册表

    reg delete "HKU\DEF\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell /f >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [成功] Default User 的 Shell 配置已删除
        echo [成功] Default User 的 Shell 配置已删除 >> "%LOG_FILE%"
    ) else (
        echo [信息] Default User 没有自定义 Shell 配置（正常）
        echo [信息] Default User 没有自定义 Shell 配置 >> "%LOG_FILE%"
    )

    reg unload HKU\DEF >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [成功] 卸载 Default User 注册表
    ) else (
        echo [警告] 卸载注册表失败
    )
) else (
    echo [警告] 无法加载 Default User 注册表
    echo [警告] 无法加载 Default User 注册表 >> "%LOG_FILE%"
)
echo.

REM ========================================
REM 步骤 3: 清理 kiosk 用户的 Shell 配置（如果存在）
REM ========================================
echo [步骤 3/4] 清理 kiosk 用户的 Shell 配置
echo [步骤 3/4] 清理 kiosk 用户的 Shell 配置 >> "%LOG_FILE%"

if exist "C:\Users\kiosk\NTUSER.DAT" (
    reg load HKU\KIOSK "C:\Users\kiosk\NTUSER.DAT" >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [成功] 加载 kiosk 用户注册表

        reg delete "HKU\KIOSK\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell /f >> "%LOG_FILE%" 2>&1
        if %errorLevel% equ 0 (
            echo [成功] kiosk 用户的 Shell 配置已删除
            echo [成功] kiosk 用户的 Shell 配置已删除 >> "%LOG_FILE%"
        ) else (
            echo [信息] kiosk 用户没有自定义 Shell 配置（正常）
            echo [信息] kiosk 用户没有自定义 Shell 配置 >> "%LOG_FILE%"
        )

        reg unload HKU\KIOSK >> "%LOG_FILE%" 2>&1
        if %errorLevel% equ 0 (
            echo [成功] 卸载 kiosk 用户注册表
        ) else (
            echo [警告] 卸载注册表失败
        )
    ) else (
        echo [警告] 无法加载 kiosk 用户注册表（用户可能正在登录）
        echo [警告] 无法加载 kiosk 用户注册表 >> "%LOG_FILE%"
    )
) else (
    echo [信息] kiosk 用户不存在，跳过
    echo [信息] kiosk 用户不存在 >> "%LOG_FILE%"
)
echo.

REM ========================================
REM 步骤 4: 验证系统 Shell 是否恢复正常
REM ========================================
echo [步骤 4/4] 验证系统 Shell 配置
echo [步骤 4/4] 验证系统 Shell 配置 >> "%LOG_FILE%"

echo [信息] 检查当前系统 Shell 配置...
echo.

REM 查询系统默认 Shell（应该是 explorer.exe）
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [成功] 系统默认 Shell 存在
    for /f "tokens=3" %%a in ('reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell ^| findstr /i "Shell"') do (
        echo [信息] 系统 Shell: %%a
        echo [信息] 系统 Shell: %%a >> "%LOG_FILE%"
    )
) else (
    echo [信息] 系统使用默认 Shell (explorer.exe)
    echo [信息] 系统使用默认 Shell >> "%LOG_FILE%"
)
echo.

REM ========================================
REM 修复完成
REM ========================================
echo ========================================
echo   修复完成！
echo ========================================
echo.
echo [总结]
echo - 当前用户 Shell: 已清理
echo - Default User Shell: 已清理
echo - kiosk 用户 Shell: 已清理
echo.
echo [下一步]
echo 1. 重启电脑让配置生效
echo 2. 正常登录 Windows（不会再闪屏）
echo 3. 然后可以正常运行 DreamBook 应用
echo.
echo [注意]
echo - 如果重启后仍然闪屏，请查看日志: %LOG_FILE%
echo - 或联系技术支持
echo.
echo 修复完成时间: %date% %time% >> "%LOG_FILE%"
pause
exit /b 0
