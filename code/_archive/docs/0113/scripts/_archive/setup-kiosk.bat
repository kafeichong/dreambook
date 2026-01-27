@echo off
REM DreamBook Kiosk 一键配置脚本
REM 版本: 1.0
REM 日期: 2026-01-13
REM 说明: 自动配置 Windows 10 Kiosk 模式

setlocal EnableDelayedExpansion

echo ========================================
echo   DreamBook Kiosk 配置脚本 v1.0
echo ========================================
echo.

REM 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 此脚本需要管理员权限
    echo 请右键点击脚本，选择"以管理员身份运行"
    pause
    exit /b 1
)

echo [信息] 管理员权限检查通过
echo.

REM 设置日志文件
set LOG_FILE=%~dp0setup-kiosk.log
echo [信息] 日志文件: %LOG_FILE%
echo 配置开始时间: %date% %time% > "%LOG_FILE%"
echo. >> "%LOG_FILE%"

REM ========================================
REM 步骤 1: 设置配置参数
REM ========================================
echo [步骤 1/6] 配置参数设置
echo [步骤 1/6] 配置参数设置 >> "%LOG_FILE%"

set KIOSK_USER=kiosk
set KIOSK_PASSWORD=DreamBook2026!
set APP_PATH=C:\kiosk\dreambook\dreambook.exe

echo 用户名: %KIOSK_USER%
echo 应用路径: %APP_PATH%
echo.

REM ========================================
REM 步骤 2: 创建 kiosk 用户
REM ========================================
echo [步骤 2/6] 创建 kiosk 用户账户
echo [步骤 2/6] 创建 kiosk 用户账户 >> "%LOG_FILE%"

REM 检查用户是否已存在
net user %KIOSK_USER% >nul 2>&1
if %errorLevel% equ 0 (
    echo [警告] 用户 %KIOSK_USER% 已存在，跳过创建
    echo [警告] 用户 %KIOSK_USER% 已存在，跳过创建 >> "%LOG_FILE%"
) else (
    net user %KIOSK_USER% %KIOSK_PASSWORD% /add
    if %errorLevel% equ 0 (
        echo [成功] 用户 %KIOSK_USER% 创建成功
        echo [成功] 用户 %KIOSK_USER% 创建成功 >> "%LOG_FILE%"
    ) else (
        echo [错误] 用户创建失败，错误代码: %errorLevel%
        echo [错误] 用户创建失败，错误代码: %errorLevel% >> "%LOG_FILE%"
        goto :error
    )
)
echo.

REM ========================================
REM 步骤 3: 配置自动登录
REM ========================================
echo [步骤 3/6] 配置自动登录
echo [步骤 3/6] 配置自动登录 >> "%LOG_FILE%"

reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultUserName /t REG_SZ /d %KIOSK_USER% /f >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [成功] 设置默认用户名
) else (
    echo [错误] 设置默认用户名失败
    goto :error
)

reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultPassword /t REG_SZ /d %KIOSK_PASSWORD% /f >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [成功] 设置默认密码
) else (
    echo [错误] 设置默认密码失败
    goto :error
)

reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v AutoAdminLogon /t REG_SZ /d 1 /f >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [成功] 启用自动登录
) else (
    echo [错误] 启用自动登录失败
    goto :error
)
echo.

REM ========================================
REM 步骤 4: 配置 Shell 替换
REM ========================================
echo [步骤 4/6] 配置 Shell 替换
echo [步骤 4/6] 配置 Shell 替换 >> "%LOG_FILE%"

REM 检查应用文件是否存在
if not exist "%APP_PATH%" (
    echo [警告] 应用文件不存在: %APP_PATH%
    echo [警告] 请确保应用已部署到该路径
    echo [警告] 应用文件不存在: %APP_PATH% >> "%LOG_FILE%"
)

REM 加载 Default User 注册表
reg load HKU\DEF "C:\Users\Default\NTUSER.DAT" >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [成功] 加载 Default User 注册表
) else (
    echo [错误] 加载 Default User 注册表失败
    goto :error
)

REM 设置 Shell 为 dreambook.exe
reg add "HKU\DEF\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell /t REG_SZ /d "%APP_PATH%" /f >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [成功] 设置 Shell 为 dreambook.exe
) else (
    echo [错误] 设置 Shell 失败
    reg unload HKU\DEF
    goto :error
)

REM 卸载注册表
reg unload HKU\DEF >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [成功] 卸载 Default User 注册表
) else (
    echo [警告] 卸载注册表失败，但配置可能已完成
)
echo.

REM ========================================
REM 步骤 5: 启用虚拟键盘服务
REM ========================================
echo [步骤 5/6] 启用虚拟键盘服务
echo [步骤 5/6] 启用虚拟键盘服务 >> "%LOG_FILE%"

sc config TabletInputService start= auto >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [成功] 设置虚拟键盘服务为自动启动
) else (
    echo [警告] 设置虚拟键盘服务失败，但不影响主要功能
)

sc start TabletInputService >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [成功] 启动虚拟键盘服务
) else (
    echo [警告] 启动虚拟键盘服务失败，请手动启动
)
echo.

REM ========================================
REM 步骤 6: 配置应用权限
REM ========================================
echo [步骤 6/6] 配置应用权限
echo [步骤 6/6] 配置应用权限 >> "%LOG_FILE%"

if exist "C:\kiosk\dreambook" (
    icacls "C:\kiosk\dreambook" /grant "%KIOSK_USER%:(OI)(CI)F" /T >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [成功] 设置应用目录权限
    ) else (
        echo [警告] 设置应用目录权限失败
    )
) else (
    echo [警告] 应用目录不存在: C:\kiosk\dreambook
    echo [警告] 应用目录不存在: C:\kiosk\dreambook >> "%LOG_FILE%"
)
echo.

REM ========================================
REM 配置完成
REM ========================================
echo ========================================
echo   配置完成！
echo ========================================
echo.
echo [总结]
echo - kiosk 用户: %KIOSK_USER%
echo - 自动登录: 已启用
echo - Shell 替换: 已配置
echo - 虚拟键盘: 已启用
echo.
echo [下一步]
echo 1. 确保应用已部署到: %APP_PATH%
echo 2. 运行 verify-kiosk.bat 验证配置
echo 3. 重启电脑测试自动登录
echo.
echo 配置完成时间: %date% %time% >> "%LOG_FILE%"
pause
exit /b 0

:error
echo.
echo ========================================
echo   配置失败！
echo ========================================
echo.
echo 请查看日志文件了解详细错误: %LOG_FILE%
echo 或运行 cleanup-kiosk.bat 清理配置后重试
echo.
echo 配置失败时间: %date% %time% >> "%LOG_FILE%"
pause
exit /b 1
