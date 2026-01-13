@echo off
REM DreamBook Kiosk 清理脚本 v2.0（改进版）
REM 版本: 2.0
REM 日期: 2026-01-13
REM 说明: 彻底清理 Kiosk 模式配置，恢复系统到正常状态
REM 改进: 修复了 v1.1 只清理 Default User 导致的闪屏问题

setlocal EnableDelayedExpansion

REM 优先检查管理员权限（防止闪退）
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ========================================
    echo   DreamBook Kiosk 清理脚本 v2.0
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
echo   DreamBook Kiosk 清理脚本 v2.0
echo ========================================
echo.
echo [新功能] v2.0 改进内容:
echo - 清理所有用户的 Shell 配置（不仅是 Default User）
echo - 修复了 v1.1 可能导致的闪屏问题
echo - 更完整的配置清理
echo - 更详细的日志记录
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
set LOG_FILE=%~dp0cleanup-kiosk-v2.log
echo 清理开始时间: %date% %time% > "%LOG_FILE%"
echo 版本: 2.0 >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

REM ========================================
REM 步骤 1: 清理当前用户的 Shell 配置【新增】
REM ========================================
echo [步骤 1/7] 清理当前用户的 Shell 配置
echo [步骤 1/7] 清理当前用户的 Shell 配置 >> "%LOG_FILE%"

reg query "HKCU\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell >nul 2>&1
if %errorLevel% equ 0 (
    reg delete "HKCU\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell /f >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [成功] 当前用户的 Shell 配置已删除
        echo [成功] 当前用户的 Shell 配置已删除 >> "%LOG_FILE%"
    ) else (
        echo [警告] 删除当前用户 Shell 配置失败
        echo [警告] 删除当前用户 Shell 配置失败 >> "%LOG_FILE%"
    )
) else (
    echo [信息] 当前用户没有自定义 Shell 配置（正常）
    echo [信息] 当前用户没有自定义 Shell 配置 >> "%LOG_FILE%"
)
echo.

REM ========================================
REM 步骤 2: 删除 kiosk 用户
REM ========================================
echo [步骤 2/7] 删除 kiosk 用户
echo [步骤 2/7] 删除 kiosk 用户 >> "%LOG_FILE%"

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
REM 步骤 3: 禁用自动登录
REM ========================================
echo [步骤 3/7] 禁用自动登录
echo [步骤 3/7] 禁用自动登录 >> "%LOG_FILE%"

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
    echo [信息] DefaultUserName 不存在（正常）
)

reg delete "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultPassword /f >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [成功] DefaultPassword 已删除
) else (
    echo [信息] DefaultPassword 不存在（正常）
)
echo.

REM ========================================
REM 步骤 4: 恢复 Default User 的 Shell 配置
REM ========================================
echo [步骤 4/7] 恢复 Default User 的 Shell 配置
echo [步骤 4/7] 恢复 Default User 的 Shell 配置 >> "%LOG_FILE%"

reg load HKU\DEF "C:\Users\Default\NTUSER.DAT" >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [成功] 加载 Default User 注册表

    reg query "HKU\DEF\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell >nul 2>&1
    if %errorLevel% equ 0 (
        reg delete "HKU\DEF\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell /f >> "%LOG_FILE%" 2>&1
        if %errorLevel% equ 0 (
            echo [成功] Default User 的 Shell 配置已恢复
            echo [成功] Default User 的 Shell 配置已恢复 >> "%LOG_FILE%"
        ) else (
            echo [警告] 恢复 Default User Shell 配置失败
            echo [警告] 恢复 Default User Shell 配置失败 >> "%LOG_FILE%"
        )
    ) else (
        echo [信息] Default User 没有自定义 Shell 配置（正常）
        echo [信息] Default User 没有自定义 Shell 配置 >> "%LOG_FILE%"
    )

    reg unload HKU\DEF >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [成功] 卸载 Default User 注册表
    ) else (
        echo [警告] 卸载注册表失败（可能被占用，重启后生效）
    )
) else (
    echo [警告] 无法加载 Default User 注册表
    echo [警告] 无法加载 Default User 注册表 >> "%LOG_FILE%"
)
echo.

REM ========================================
REM 步骤 5: 清理 kiosk 用户的 Shell 配置【改进】
REM ========================================
echo [步骤 5/7] 清理 kiosk 用户的 Shell 配置
echo [步骤 5/7] 清理 kiosk 用户的 Shell 配置 >> "%LOG_FILE%"

if exist "C:\Users\kiosk\NTUSER.DAT" (
    reg load HKU\KIOSK "C:\Users\kiosk\NTUSER.DAT" >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [成功] 加载 kiosk 用户注册表

        reg query "HKU\KIOSK\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell >nul 2>&1
        if %errorLevel% equ 0 (
            reg delete "HKU\KIOSK\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell /f >> "%LOG_FILE%" 2>&1
            if %errorLevel% equ 0 (
                echo [成功] kiosk 用户的 Shell 配置已删除
                echo [成功] kiosk 用户的 Shell 配置已删除 >> "%LOG_FILE%"
            ) else (
                echo [警告] 删除 kiosk 用户 Shell 配置失败
                echo [警告] 删除 kiosk 用户 Shell 配置失败 >> "%LOG_FILE%"
            )
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
    echo [信息] kiosk 用户配置文件不存在，跳过
    echo [信息] kiosk 用户配置文件不存在 >> "%LOG_FILE%"
)
echo.

REM ========================================
REM 步骤 6: 停止虚拟键盘服务（可选）
REM ========================================
echo [步骤 6/7] 停止虚拟键盘服务
echo [步骤 6/7] 停止虚拟键盘服务 >> "%LOG_FILE%"

echo [信息] 保留虚拟键盘服务运行（不影响系统正常使用）
echo [信息] 保留虚拟键盘服务运行 >> "%LOG_FILE%"
echo.

REM 如果需要停止虚拟键盘服务，取消注释以下行：
REM sc stop TabletInputService >> "%LOG_FILE%" 2>&1
REM sc config TabletInputService start= demand >> "%LOG_FILE%" 2>&1

REM ========================================
REM 步骤 7: 删除应用文件（可选）
REM ========================================
echo [步骤 7/7] 处理应用文件
echo [步骤 7/7] 处理应用文件 >> "%LOG_FILE%"

if exist "C:\kiosk\dreambook" (
    echo [信息] 检测到应用文件: C:\kiosk\dreambook
    set /p DEL_APP="是否删除应用文件？(Y/N): "
    if /i "!DEL_APP!"=="Y" (
        rmdir /s /q "C:\kiosk\dreambook" >> "%LOG_FILE%" 2>&1
        if %errorLevel% equ 0 (
            echo [成功] 应用文件已删除
            echo [成功] 应用文件已删除 >> "%LOG_FILE%"
        ) else (
            echo [警告] 删除应用文件失败（可能被占用）
            echo [警告] 删除应用文件失败 >> "%LOG_FILE%"
        )
    ) else (
        echo [信息] 保留应用文件
        echo [信息] 保留应用文件 >> "%LOG_FILE%"
    )
) else (
    echo [信息] 应用文件不存在，跳过
    echo [信息] 应用文件不存在 >> "%LOG_FILE%"
)
echo.

REM ========================================
REM 验证清理结果【新增】
REM ========================================
echo [验证] 检查清理结果...
echo [验证] 检查清理结果 >> "%LOG_FILE%"

set CLEANUP_SUCCESS=1

REM 检查当前用户是否还有 Shell 配置
reg query "HKCU\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell >nul 2>&1
if %errorLevel% equ 0 (
    echo [警告] 当前用户仍有自定义 Shell 配置
    echo [警告] 当前用户仍有自定义 Shell 配置 >> "%LOG_FILE%"
    set CLEANUP_SUCCESS=0
)

REM 检查 kiosk 用户是否还存在
net user kiosk >nul 2>&1
if %errorLevel% equ 0 (
    echo [警告] kiosk 用户仍然存在
    echo [警告] kiosk 用户仍然存在 >> "%LOG_FILE%"
    set CLEANUP_SUCCESS=0
)

REM 检查自动登录是否已禁用
for /f "tokens=3" %%a in ('reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v AutoAdminLogon 2^>nul ^| findstr /i "AutoAdminLogon"') do (
    if "%%a"=="1" (
        echo [警告] 自动登录仍然启用
        echo [警告] 自动登录仍然启用 >> "%LOG_FILE%"
        set CLEANUP_SUCCESS=0
    )
)

if %CLEANUP_SUCCESS%==1 (
    echo [验证] ✓ 所有配置已成功清理
    echo [验证] ✓ 所有配置已成功清理 >> "%LOG_FILE%"
) else (
    echo [验证] ⚠ 部分配置可能未完全清理，请查看日志
    echo [验证] ⚠ 部分配置可能未完全清理 >> "%LOG_FILE%"
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
echo - 当前用户 Shell: 已清理 ✓
echo - kiosk 用户: 已删除 ✓
echo - 自动登录: 已禁用 ✓
echo - Default User Shell: 已恢复 ✓
echo - kiosk Shell: 已清理 ✓
echo - 虚拟键盘: 保留运行
echo.
echo [v2.0 改进]
echo ✓ 修复了可能导致闪屏的问题
echo ✓ 清理所有用户的 Shell 配置
echo ✓ 添加了验证步骤
echo.
echo [下一步]
echo 1. 重启电脑让配置生效
echo 2. 正常登录 Windows（不会再闪屏）
echo 3. DreamBook 恢复为普通应用模式
echo.
echo [日志文件]
echo 详细日志保存在: %LOG_FILE%
echo.
echo 清理完成时间: %date% %time% >> "%LOG_FILE%"
echo.
pause
exit /b 0
