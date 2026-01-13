@echo off
REM DreamBook Kiosk 配置脚本 v3.0 (正确方法)
REM 使用启动项而不是 Shell 替换
REM 日期: 2026-01-13

setlocal EnableDelayedExpansion

REM 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 需要管理员权限
    echo 请右键选择"以管理员身份运行"
    pause
    exit /b 1
)

echo ========================================
echo   DreamBook Kiosk 配置 v3.0
echo ========================================
echo.
echo [改进] v3.0 使用启动项方式，更稳定
echo.

REM 配置参数
set KIOSK_USER=kiosk
set KIOSK_PASSWORD=DreamBook2026!
set APP_PATH=C:\kiosk\dreambook\dreambook.exe
set APP_DIR=C:\kiosk\dreambook

echo 用户名: %KIOSK_USER%
echo 应用路径: %APP_PATH%
echo.

set /p CONFIRM="确定要配置 Kiosk 模式？(Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo 操作已取消
    pause
    exit /b 0
)

echo.
set LOG_FILE=%~dp0setup-kiosk-v3.log
echo 配置开始: %date% %time% > "%LOG_FILE%"
echo.

REM ========================================
REM 步骤 1: 创建 kiosk 用户
REM ========================================
echo [步骤 1/6] 创建 kiosk 用户
net user %KIOSK_USER% >nul 2>&1
if %errorLevel% equ 0 (
    echo [信息] 用户已存在，重置密码
    net user %KIOSK_USER% %KIOSK_PASSWORD% >> "%LOG_FILE%" 2>&1
) else (
    net user %KIOSK_USER% %KIOSK_PASSWORD% /add >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [成功] 用户创建成功
    ) else (
        echo [错误] 用户创建失败
        goto :error
    )
)
echo.

REM ========================================
REM 步骤 2: 配置自动登录
REM ========================================
echo [步骤 2/6] 配置自动登录
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v AutoAdminLogon /t REG_SZ /d 1 /f >> "%LOG_FILE%" 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultUserName /t REG_SZ /d %KIOSK_USER% /f >> "%LOG_FILE%" 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultPassword /t REG_SZ /d %KIOSK_PASSWORD% /f >> "%LOG_FILE%" 2>&1
echo [成功] 自动登录已配置
echo.

REM ========================================
REM 步骤 3: 配置应用自动启动（启动项方式）
REM ========================================
echo [步骤 3/6] 配置应用自动启动
echo [信息] 使用启动项方式（不替换 Shell）

REM 检查应用是否存在
if not exist "%APP_PATH%" (
    echo [警告] 应用文件不存在: %APP_PATH%
    echo [警告] 请先部署应用到该路径
    echo.
)

REM 为 kiosk 用户配置启动项
REM 方法1: 注册表启动项（所有用户）
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /v DreamBook /t REG_SZ /d "%APP_PATH%" /f >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [成功] 已添加到启动项
) else (
    echo [警告] 添加启动项失败
)

REM 方法2: 创建启动文件夹快捷方式（备用）
REM 需要先创建 kiosk 用户的配置文件
echo [信息] 启动项已配置为注册表方式
echo.

REM ========================================
REM 步骤 4: 隐藏桌面图标和任务栏（可选）
REM ========================================
echo [步骤 4/6] 配置 Kiosk 界面
echo [信息] 配置全屏无干扰模式

REM 禁用任务栏自动隐藏提示
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v NoTrayItemsDisplay /t REG_DWORD /d 1 /f >> "%LOG_FILE%" 2>&1
echo [成功] 已配置界面优化
echo.

REM ========================================
REM 步骤 5: 启用虚拟键盘服务
REM ========================================
echo [步骤 5/6] 启用虚拟键盘服务
sc config TabletInputService start= auto >> "%LOG_FILE%" 2>&1
sc start TabletInputService >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [成功] 虚拟键盘服务已启动
) else (
    echo [警告] 虚拟键盘服务启动失败（可能已在运行）
)
echo.

REM ========================================
REM 步骤 6: 设置应用权限
REM ========================================
echo [步骤 6/6] 配置应用权限
if exist "%APP_DIR%" (
    icacls "%APP_DIR%" /grant "%KIOSK_USER%:(OI)(CI)F" /T >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [成功] 应用权限已设置
    ) else (
        echo [警告] 权限设置失败
    )
) else (
    echo [警告] 应用目录不存在: %APP_DIR%
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
echo - kiosk 用户: 已创建/更新
echo - 自动登录: 已启用
echo - 启动方式: 注册表启动项（不是 Shell 替换）
echo - 虚拟键盘: 已启用
echo.
echo [v3.0 改进]
echo + 使用启动项方式，不再替换 Shell
echo + 避免闪屏和黑屏问题
echo + 更容易调试和恢复
echo.
echo [下一步]
echo 1. 确保应用已部署: %APP_PATH%
echo 2. 重启电脑
echo 3. 系统会自动登录 kiosk 用户
echo 4. DreamBook 会自动启动
echo.
echo [如何退出 Kiosk 模式]
echo - 使用应用右上角管理面板（点击5次）
echo - 或运行 cleanup-kiosk-v3.bat 清理配置
echo.
echo 配置完成: %date% %time% >> "%LOG_FILE%"
pause
exit /b 0

:error
echo.
echo ========================================
echo   配置失败！
echo ========================================
echo.
echo 请查看日志: %LOG_FILE%
echo 或运行 cleanup-kiosk-v3.bat 清理后重试
echo.
pause
exit /b 1
