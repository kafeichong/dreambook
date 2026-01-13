@echo off
REM 自动请求管理员权限启动器 v2.0
REM 适用于: cleanup-kiosk-v2.bat

REM 检查是否已经是管理员权限
net session >nul 2>&1
if %errorLevel% == 0 (
    REM 已经是管理员，直接运行脚本
    call "%~dp0cleanup-kiosk-v2.bat"
    goto :eof
)

REM 不是管理员，请求提升权限
cls
echo ========================================
echo   DreamBook Kiosk 清理工具 v2.0
echo ========================================
echo.
echo [v2.0 改进]
echo - 修复了可能导致闪屏的问题
echo - 清理所有用户的 Shell 配置
echo - 更完整的配置清理
echo.
echo 正在请求管理员权限...
echo 请在弹出的 UAC 对话框中点击"是"
echo.

REM 使用 PowerShell 提升权限并运行批处理
powershell -Command "Start-Process '%~dp0cleanup-kiosk-v2.bat' -Verb RunAs"

REM 等待一下让用户看到信息
timeout /t 2 /nobreak >nul
exit
