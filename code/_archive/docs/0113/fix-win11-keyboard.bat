@echo off
chcp 65001 >nul
echo ========================================
echo Windows 11 触摸键盘配置
echo ========================================
echo.

echo [1] 启用触摸键盘服务...
sc config TabletInputService start= auto
net start TabletInputService
echo.

echo [2] 启用触摸键盘辅助功能...
reg add "HKEY_CURRENT_USER\Software\Microsoft\TabletTip\1.7" /v EnableDesktopModeAutoInvoke /t REG_DWORD /d 1 /f
echo.

echo [3] 禁用 Windows 11 的触摸键盘策略限制...
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v TouchKeyboardVisibility /t REG_DWORD /d 1 /f
echo.

echo [4] 设置触摸键盘为始终可见...
reg add "HKEY_CURRENT_USER\Software\Microsoft\Input\Settings" /v InsightsEnabled /t REG_DWORD /d 0 /f
echo.

echo ========================================
echo 配置完成！请重启应用或重启电脑
echo ========================================
pause
