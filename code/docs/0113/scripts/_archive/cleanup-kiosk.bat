@echo off
REM DreamBook Kiosk 清理脚本
REM 版本: 1.1
REM 日期: 2026-01-13
REM 说明: 清理 Kiosk 模式配置，恢复系统到正常状态

setlocal EnableDelayedExpansion

REM 优先检查管理员权限（防止闪退）
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ========================================
    echo   DreamBook Kiosk 清理脚本 v1.1
    echo ========================================
    echo.
    echo [错误] 此脚本需要管理员权限
    echo.
    echo 请按以下步骤操作:
    echo 1. 右键点击此脚本文件
    echo 2. 选择 "以管理员身份运行"
    echo 3. 在 UAC 提示中点击 "是"
    echo.
    echo ========================================
    echo.
    pause
    exit /b 1
)

echo ========================================
echo   DreamBook Kiosk 清理脚本 v1.1
echo ========================================
echo.
echo [警告] 此脚本将删除所有 Kiosk 配置
echo [警告] 包括用户账户、注册表配置等
echo.

set /p CONFIRM="确定要继续吗？(Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo 操作已取消
    pause
    exit /b 0
)

echo.
echo [信息] 开始清理配置...
echo.

REM 设置日志文件
set LOG_FILE=%~dp0cleanup-kiosk.log
echo 清理开始时间: %date% %time% > "%LOG_FILE%"
echo. >> "%LOG_FILE%"

REM ========================================
REM 步骤 1: 删除 kiosk 用户
REM ========================================
echo [步骤 1/5] 删除 kiosk 用户
echo [步骤 1/5] 删除 kiosk 用户 >> "%LOG_FILE%"

net user kiosk >nul 2>&1
if %errorLevel% equ 0 (
    net user kiosk /delete >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [成功] kiosk 用户已删除
        echo [成功] kiosk 用户已删除 >> "%LOG_FILE%"
    ) else (
        echo [警告] 删除 kiosk 用户失败
        echo [警告] 删除 kiosk 用户失败 >> "%LOG_FILE%"
    )
) else (
    echo [信息] kiosk 用户不存在，跳过
    echo [信息] kiosk 用户不存在，跳过 >> "%LOG_FILE%"
)
echo.

REM ========================================
REM 步骤 2: 禁用自动登录
REM ========================================
echo [步骤 2/5] 禁用自动登录
echo [步骤 2/5] 禁用自动登录 >> "%LOG_FILE%"

reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v AutoAdminLogon /t REG_SZ /d 0 /f >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [成功] 自动登录已禁用
) else (
    echo [警告] 禁用自动登录失败
)

reg delete "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultUserName /f >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [成功] DefaultUserName 已删除
) else (
    echo [警告] 删除 DefaultUserName 失败
)

reg delete "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultPassword /f >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [成功] DefaultPassword 已删除
) else (
    echo [警告] 删除 DefaultPassword 失败
)
echo.

REM ========================================
REM 步骤 3: 恢复 Shell 配置
REM ========================================
echo [步骤 3/5] 恢复 Shell 配置
echo [步骤 3/5] 恢复 Shell 配置 >> "%LOG_FILE%"

reg load HKU\DEF "C:\Users\Default\NTUSER.DAT" >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [成功] 加载 Default User 注册表

    reg delete "HKU\DEF\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell /f >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [成功] Shell 配置已恢复
    ) else (
        echo [警告] 恢复 Shell 配置失败
    )

    reg unload HKU\DEF >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [成功] 卸载 Default User 注册表
    ) else (
        echo [警告] 卸载注册表失败
    )
) else (
    echo [警告] 无法加载 Default User 注册表
)
echo.

REM ========================================
REM 步骤 4: 停止虚拟键盘服务（可选）
REM ========================================
echo [步骤 4/5] 停止虚拟键盘服务
echo [步骤 4/5] 停止虚拟键盘服务 >> "%LOG_FILE%"

echo [信息] 保留虚拟键盘服务运行（不影响系统正常使用）
echo.

REM 如果需要停止虚拟键盘服务，取消注释以下行：
REM sc stop TabletInputService >> "%LOG_FILE%" 2>&1
REM sc config TabletInputService start= demand >> "%LOG_FILE%" 2>&1

REM ========================================
REM 步骤 5: 删除应用文件（可选）
REM ========================================
echo [步骤 5/5] 处理应用文件
echo [步骤 5/5] 处理应用文件 >> "%LOG_FILE%"

if exist "C:\kiosk\dreambook" (
    echo [信息] 检测到应用文件
    set /p DEL_APP="是否删除应用文件？(Y/N): "
    if /i "!DEL_APP!"=="Y" (
        rmdir /s /q "C:\kiosk\dreambook" >> "%LOG_FILE%" 2>&1
        if %errorLevel% equ 0 (
            echo [成功] 应用文件已删除
            echo [成功] 应用文件已删除 >> "%LOG_FILE%"
        ) else (
            echo [警告] 删除应用文件失败
            echo [警告] 删除应用文件失败 >> "%LOG_FILE%"
        )
    ) else (
        echo [信息] 保留应用文件
        echo [信息] 保留应用文件 >> "%LOG_FILE%"
    )
) else (
    echo [信息] 应用文件不存在，跳过
    echo [信息] 应用文件不存在，跳过 >> "%LOG_FILE%"
)
echo.

REM ========================================
REM 清理完成
REM ========================================
echo ========================================
echo   清理完成！
echo ========================================
echo.
echo [总结]
echo - kiosk 用户: 已删除
echo - 自动登录: 已禁用
echo - Shell 替换: 已恢复
echo - 虚拟键盘: 保留运行
echo.
echo [下一步]
echo 1. 重启电脑验证配置已清理
echo 2. 使用正常的登录界面登录
echo.
echo 清理完成时间: %date% %time% >> "%LOG_FILE%"
pause
exit /b 0
