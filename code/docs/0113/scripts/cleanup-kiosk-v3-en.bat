@echo off
REM DreamBook Kiosk Cleanup Script v3.0
REM Date: 2026-01-13

setlocal EnableDelayedExpansion

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Administrator privileges required
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo ========================================
echo   DreamBook Kiosk Cleanup v3.0
echo ========================================
echo.

set /p CONFIRM="Cleanup Kiosk configuration? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Operation cancelled
    pause
    exit /b 0
)

echo.
set LOG_FILE=%~dp0cleanup-kiosk-v3.log
echo Cleanup started: %date% %time% > "%LOG_FILE%"
echo.

REM Step 1: Delete kiosk user
echo [Step 1/4] Deleting kiosk user
net user kiosk >nul 2>&1
if %errorLevel% equ 0 (
    net user kiosk /delete >> "%LOG_FILE%" 2>&1
    echo [SUCCESS] kiosk user deleted
) else (
    echo [INFO] kiosk user does not exist
)
echo.

REM Step 2: Disable auto-login
echo [Step 2/4] Disabling auto-login
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v AutoAdminLogon /t REG_SZ /d 0 /f >> "%LOG_FILE%" 2>&1
reg delete "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultUserName /f >> "%LOG_FILE%" 2>&1
reg delete "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultPassword /f >> "%LOG_FILE%" 2>&1
echo [SUCCESS] Auto-login disabled
echo.

REM Step 3: Delete startup entry
echo [Step 3/4] Deleting startup entry
reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /v DreamBook /f >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [SUCCESS] Startup entry deleted
) else (
    echo [INFO] Startup entry does not exist
)
echo.

REM Step 4: Restore UI settings
echo [Step 4/4] Restoring UI settings
reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer" /v NoTrayItemsDisplay /f >> "%LOG_FILE%" 2>&1
echo [SUCCESS] UI settings restored
echo.

echo ========================================
echo   Cleanup Complete!
echo ========================================
echo.
echo [Summary]
echo - kiosk user: Deleted
echo - Auto-login: Disabled
echo - Startup entry: Deleted
echo - UI settings: Restored
echo.
echo [Next Steps]
echo 1. Restart computer
echo 2. Login to Windows normally
echo 3. DreamBook will run as a normal app
echo.
echo Cleanup finished: %date% %time% >> "%LOG_FILE%"
pause
exit /b 0
