@echo off
REM DreamBook Kiosk 清理脚本 v3.0
REM 对应 setup-kiosk-v3.bat
REM 日期: 2026-01-13

setlocal EnableDelayedExpansion

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 需要管理员权限
    echo 请右键选择"以管理员身份运行"
    pause
    exit /b 1
)

echo ========================================
echo   DreamBook Kiosk 清理 v3.0
echo ========================================
echo.

set /p CONFIRM="确定要清理 Kiosk 配置？(Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo 操作已取消
    pause
    exit /b 0
)

echo.
set LOG_FILE=%~dp0cleanup-kiosk-v3.log
echo 清理开始: %date% %time% > "%LOG_FILE%"
echo.

REM 步骤 1: 删除 kiosk 用户
echo [步骤 1/4] 删除 kiosk 用户
net user kiosk >nul 2>&1
if %errorLevel% equ 0 (
    net user kiosk /delete >> "%LOG_FILE%" 2>&1
    echo [成功] kiosk 用户已删除
) else (
    echo [信息] kiosk 用户不存在
)
echo.

REM 步骤 2: 禁用自动登录
echo [步骤 2/4] 禁用自动登录
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v AutoAdminLogon /t REG_SZ /d 0 /f >> "%LOG_FILE%" 2>&1
reg delete "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultUserName /f >> "%LOG_FILE%" 2>&1
reg delete "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultPassword /f >> "%LOG_FILE%" 2>&1
echo [成功] 自动登录已禁用
echo.

REM 步骤 3: 删除启动项
echo [步骤 3/4] 删除启动项
reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /v DreamBook /f >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [成功] 启动项已删除
) else (
    echo [信息] 启动项不存在
)
echo.

REM 步骤 4: 恢复界面配置
echo [步骤 4/4] 恢复界面配置
reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v NoTrayItemsDisplay /f >> "%LOG_FILE%" 2>&1
echo [成功] 界面配置已恢复
echo.

echo ========================================
echo   清理完成！
echo ========================================
echo.
echo [总结]
echo - kiosk 用户: 已删除
echo - 自动登录: 已禁用
echo - 启动项: 已删除
echo - 界面: 已恢复
echo.
echo [下一步]
echo 1. 重启电脑
echo 2. 正常登录 Windows
echo 3. DreamBook 变为普通应用
echo.
echo 清理完成: %date% %time% >> "%LOG_FILE%"
pause
exit /b 0
