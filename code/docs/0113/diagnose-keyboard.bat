@echo off
chcp 65001 >nul
echo ========================================
echo 虚拟键盘诊断工具
echo ========================================
echo.

echo [1] 检查触摸键盘服务状态...
sc query TabletInputService
echo.

echo [2] 检查 TabTip.exe 是否存在...
if exist "C:\Program Files\Common Files\microsoft shared\ink\TabTip.exe" (
    echo ✅ TabTip.exe 64位版本存在
) else (
    echo ❌ TabTip.exe 64位版本不存在
)

if exist "C:\Program Files (x86)\Common Files\microsoft shared\ink\TabTip.exe" (
    echo ✅ TabTip.exe 32位版本存在
) else (
    echo ❌ TabTip.exe 32位版本不存在
)
echo.

echo [3] 检查触摸键盘进程是否运行...
tasklist /FI "IMAGENAME eq TabTip.exe" 2>NUL | find /I /N "TabTip.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ 触摸键盘进程正在运行
) else (
    echo ⚠️  触摸键盘进程未运行
)
echo.

echo [4] 测试手动启动触摸键盘...
echo    方法1: TabTip.exe
start "" "C:\Program Files\Common Files\microsoft shared\ink\TabTip.exe"
timeout /t 2 >nul

echo    方法2: URI 协议
start ms-availableinsettings:touch-keyboard
timeout /t 2 >nul

echo.
echo ========================================
echo 如果键盘仍未弹出，请检查：
echo   1. TabletInputService 服务是否启动
echo   2. 触摸屏驱动是否正常
echo   3. 系统是否识别为触摸设备
echo ========================================
echo.
pause
