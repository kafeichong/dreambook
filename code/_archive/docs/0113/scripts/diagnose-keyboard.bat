@echo off
REM Diagnose virtual keyboard issues for kiosk user

setlocal EnableDelayedExpansion

echo ========================================
echo   Virtual Keyboard Diagnostic
echo ========================================
echo.

set REPORT_FILE=%~dp0keyboard-diagnostic.txt
echo Diagnostic Report > "%REPORT_FILE%"
echo Generated: %date% %time% >> "%REPORT_FILE%"
echo. >> "%REPORT_FILE%"

REM Check 1: Current user
echo [Check 1] Current User
echo Current user: %USERNAME%
echo Current user: %USERNAME% >> "%REPORT_FILE%"
echo. >> "%REPORT_FILE%"

REM Check 2: TabletInputService status
echo [Check 2] TabletInputService Status
sc query TabletInputService
sc query TabletInputService >> "%REPORT_FILE%" 2>&1
echo. >> "%REPORT_FILE%"

REM Check 3: TabTip.exe existence and permissions
echo [Check 3] TabTip.exe Files
set TABTIP_64=C:\Program Files\Common Files\microsoft shared\ink\TabTip.exe
set TABTIP_32=C:\Program Files (x86)\Common Files\microsoft shared\ink\TabTip.exe

if exist "%TABTIP_64%" (
    echo [OK] Found: %TABTIP_64%
    echo Found: %TABTIP_64% >> "%REPORT_FILE%"
    icacls "%TABTIP_64%" >> "%REPORT_FILE%" 2>&1
) else (
    echo [ERROR] Not found: %TABTIP_64%
    echo Not found: %TABTIP_64% >> "%REPORT_FILE%"
)

if exist "%TABTIP_32%" (
    echo [OK] Found: %TABTIP_32%
    echo Found: %TABTIP_32% >> "%REPORT_FILE%"
    icacls "%TABTIP_32%" >> "%REPORT_FILE%" 2>&1
) else (
    echo [INFO] Not found: %TABTIP_32%
    echo Not found: %TABTIP_32% >> "%REPORT_FILE%"
)
echo. >> "%REPORT_FILE%"

REM Check 4: Kiosk user existence
echo [Check 4] Kiosk User
net user kiosk >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] Kiosk user exists
    echo Kiosk user exists >> "%REPORT_FILE%"
    net user kiosk >> "%REPORT_FILE%" 2>&1
) else (
    echo [ERROR] Kiosk user does not exist
    echo Kiosk user does not exist >> "%REPORT_FILE%"
)
echo. >> "%REPORT_FILE%"

REM Check 5: Registry settings
echo [Check 5] Registry Settings
echo Checking HKLM TabletTip settings... >> "%REPORT_FILE%"
reg query "HKLM\SOFTWARE\Microsoft\TabletTip\1.7" >> "%REPORT_FILE%" 2>&1
echo. >> "%REPORT_FILE%"

REM Check 6: User permissions
echo [Check 6] Current User Permissions
whoami /groups | find "Mandatory Label" >> "%REPORT_FILE%" 2>&1
echo. >> "%REPORT_FILE%"

echo ========================================
echo   Diagnostic Complete!
echo ========================================
echo.
echo Report saved to: %REPORT_FILE%
echo.
echo [Common Issues]
echo 1. TabletInputService not running
echo 2. Kiosk user lacks permissions to TabTip.exe
echo 3. User is not logged in when testing
echo 4. Windows Group Policy restrictions
echo.
echo Run fix-keyboard-kiosk.bat as administrator to fix issues
echo.
pause
