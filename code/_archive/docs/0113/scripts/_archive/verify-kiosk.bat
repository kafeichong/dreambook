@echo off
REM DreamBook Kiosk 配置验证脚本
REM 版本: 1.0
REM 日期: 2026-01-13
REM 说明: 验证 Kiosk 模式配置是否正确

setlocal EnableDelayedExpansion

echo ========================================
echo   DreamBook Kiosk 配置验证 v1.0
echo ========================================
echo.

set PASS_COUNT=0
set FAIL_COUNT=0
set WARN_COUNT=0

REM ========================================
REM 检查 1: kiosk 用户是否存在
REM ========================================
echo [检查 1/8] kiosk 用户
net user kiosk >nul 2>&1
if %errorLevel% equ 0 (
    echo [通过] kiosk 用户存在
    set /a PASS_COUNT+=1
) else (
    echo [失败] kiosk 用户不存在
    set /a FAIL_COUNT+=1
)
echo.

REM ========================================
REM 检查 2: AutoAdminLogon 配置
REM ========================================
echo [检查 2/8] 自动登录配置
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v AutoAdminLogon | find "0x1" >nul 2>&1
if %errorLevel% equ 0 (
    echo [通过] AutoAdminLogon = 1 (已启用)
    set /a PASS_COUNT+=1
) else (
    echo [失败] AutoAdminLogon 未启用
    set /a FAIL_COUNT+=1
)
echo.

REM ========================================
REM 检查 3: DefaultUserName 配置
REM ========================================
echo [检查 3/8] 默认用户名配置
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultUserName | find "kiosk" >nul 2>&1
if %errorLevel% equ 0 (
    echo [通过] DefaultUserName = kiosk
    set /a PASS_COUNT+=1
) else (
    echo [失败] DefaultUserName 未配置为 kiosk
    set /a FAIL_COUNT+=1
)
echo.

REM ========================================
REM 检查 4: Shell 替换配置
REM ========================================
echo [检查 4/8] Shell 替换配置
if exist "C:\Users\Default\NTUSER.DAT" (
    reg load HKU\DEF "C:\Users\Default\NTUSER.DAT" >nul 2>&1
    if %errorLevel% equ 0 (
        reg query "HKU\DEF\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell | find "dreambook.exe" >nul 2>&1
        if %errorLevel% equ 0 (
            echo [通过] Shell = dreambook.exe
            set /a PASS_COUNT+=1
        ) else (
            echo [失败] Shell 未配置为 dreambook.exe
            set /a FAIL_COUNT+=1
        )
        reg unload HKU\DEF >nul 2>&1
    ) else (
        echo [警告] 无法加载 Default User 注册表
        set /a WARN_COUNT+=1
    )
) else (
    echo [失败] Default User 注册表文件不存在
    set /a FAIL_COUNT+=1
)
echo.

REM ========================================
REM 检查 5: TabletInputService 服务
REM ========================================
echo [检查 5/8] 虚拟键盘服务
sc query TabletInputService | find "RUNNING" >nul 2>&1
if %errorLevel% equ 0 (
    echo [通过] TabletInputService 运行中
    set /a PASS_COUNT+=1
) else (
    sc query TabletInputService | find "STOPPED" >nul 2>&1
    if %errorLevel% equ 0 (
        echo [警告] TabletInputService 已停止，但可以手动启动
        set /a WARN_COUNT+=1
    ) else (
        echo [失败] TabletInputService 服务不可用
        set /a FAIL_COUNT+=1
    )
)
echo.

REM ========================================
REM 检查 6: 应用文件是否存在
REM ========================================
echo [检查 6/8] 应用文件
if exist "C:\kiosk\dreambook\dreambook.exe" (
    echo [通过] 应用文件存在: C:\kiosk\dreambook\dreambook.exe
    set /a PASS_COUNT+=1
) else (
    echo [失败] 应用文件不存在: C:\kiosk\dreambook\dreambook.exe
    set /a FAIL_COUNT+=1
)
echo.

REM ========================================
REM 检查 7: 应用文件权限
REM ========================================
echo [检查 7/8] 应用文件权限
if exist "C:\kiosk\dreambook" (
    icacls "C:\kiosk\dreambook" | find "kiosk" >nul 2>&1
    if %errorLevel% equ 0 (
        echo [通过] kiosk 用户拥有应用目录权限
        set /a PASS_COUNT+=1
    ) else (
        echo [警告] kiosk 用户可能没有应用目录权限
        set /a WARN_COUNT+=1
    )
) else (
    echo [失败] 应用目录不存在
    set /a FAIL_COUNT+=1
)
echo.

REM ========================================
REM 检查 8: TabTip.exe 是否存在
REM ========================================
echo [检查 8/8] 虚拟键盘程序
if exist "C:\Program Files\Common Files\microsoft shared\ink\TabTip.exe" (
    echo [通过] TabTip.exe 存在
    set /a PASS_COUNT+=1
) else (
    echo [警告] TabTip.exe 不存在，虚拟键盘可能无法工作
    set /a WARN_COUNT+=1
)
echo.

REM ========================================
REM 验证总结
REM ========================================
echo ========================================
echo   验证结果总结
echo ========================================
echo.
echo [统计]
echo - 通过: %PASS_COUNT% 项
echo - 警告: %WARN_COUNT% 项
echo - 失败: %FAIL_COUNT% 项
echo.

if %FAIL_COUNT% equ 0 (
    if %WARN_COUNT% equ 0 (
        echo [结论] 所有配置检查通过，可以重启测试
        echo.
        echo [建议]
        echo 1. 重启电脑测试自动登录
        echo 2. 测试虚拟键盘弹出功能
        echo 3. 测试管理面板和切换用户功能
    ) else (
        echo [结论] 配置基本正常，但有警告项需要关注
        echo.
        echo [建议]
        echo 1. 查看上述警告项
        echo 2. 重启电脑测试自动登录
        echo 3. 如果功能正常，警告项可以忽略
    )
    pause
    exit /b 0
) else (
    echo [结论] 配置存在问题，需要修复
    echo.
    echo [建议]
    echo 1. 查看失败项的错误信息
    echo 2. 重新运行 setup-kiosk.bat
    echo 3. 或手动修复失败的配置项
    pause
    exit /b 1
)
