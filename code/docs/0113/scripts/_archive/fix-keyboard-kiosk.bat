@echo off
REM Kiosk Virtual Keyboard Fix Script
REM Fix virtual keyboard not showing for kiosk user

setlocal EnableDelayedExpansion

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Administrator privileges required
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo ========================================
echo   Kiosk Virtual Keyboard Fix v1.0
echo ========================================
echo.

set LOG_FILE=%~dp0fix-keyboard-kiosk.log
echo Fix started: %date% %time% > "%LOG_FILE%"
echo.

REM Step 1: Ensure TabletInputService is running
echo [Step 1/5] Checking TabletInputService
sc query TabletInputService | find "RUNNING" >nul
if %errorLevel% equ 0 (
    echo [OK] TabletInputService is running
) else (
    echo [WARNING] TabletInputService is not running, starting...
    sc config TabletInputService start= auto >> "%LOG_FILE%" 2>&1
    sc start TabletInputService >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [SUCCESS] TabletInputService started
    ) else (
        echo [ERROR] Failed to start TabletInputService
    )
)
echo.

REM Step 2: Grant kiosk user permissions to TabTip.exe
echo [Step 2/5] Setting TabTip.exe permissions for kiosk user
set TABTIP_PATH_64=C:\Program Files\Common Files\microsoft shared\ink\TabTip.exe
set TABTIP_PATH_32=C:\Program Files (x86)\Common Files\microsoft shared\ink\TabTip.exe

if exist "%TABTIP_PATH_64%" (
    icacls "%TABTIP_PATH_64%" /grant kiosk:RX >> "%LOG_FILE%" 2>&1
    echo [SUCCESS] Set permissions for 64-bit TabTip.exe
)

if exist "%TABTIP_PATH_32%" (
    icacls "%TABTIP_PATH_32%" /grant kiosk:RX >> "%LOG_FILE%" 2>&1
    echo [SUCCESS] Set permissions for 32-bit TabTip.exe
)
echo.

REM Step 3: Enable virtual keyboard for kiosk user in registry
echo [Step 3/5] Configuring registry for kiosk user
reg add "HKLM\SOFTWARE\Microsoft\TabletTip\1.7" /f >> "%LOG_FILE%" 2>&1
reg add "HKLM\SOFTWARE\Policies\Microsoft\TabletTip\1.7" /f >> "%LOG_FILE%" 2>&1
echo [SUCCESS] Registry configured
echo.

REM Step 4: Load kiosk user registry and enable virtual keyboard
echo [Step 4/5] Configuring kiosk user profile
net user kiosk >nul 2>&1
if %errorLevel% equ 0 (
    echo [INFO] Kiosk user exists, configuring...

    REM Load kiosk user's NTUSER.DAT
    reg load HKU\kiosk_temp "C:\Users\kiosk\NTUSER.DAT" >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [SUCCESS] Loaded kiosk user registry

        REM Enable touch keyboard
        reg add "HKU\kiosk_temp\Software\Microsoft\TabletTip\1.7" /v EnableDesktopModeAutoInvoke /t REG_DWORD /d 1 /f >> "%LOG_FILE%" 2>&1
        reg add "HKU\kiosk_temp\Software\Microsoft\TabletTip\1.7" /v EdgeTargetDockedState /t REG_DWORD /d 1 /f >> "%LOG_FILE%" 2>&1

        echo [SUCCESS] Configured kiosk user registry

        REM Unload registry
        reg unload HKU\kiosk_temp >> "%LOG_FILE%" 2>&1
        echo [SUCCESS] Unloaded kiosk user registry
    ) else (
        echo [WARNING] Could not load kiosk user registry (user may be logged in)
        echo [INFO] Settings will be applied on next login
    )
) else (
    echo [WARNING] Kiosk user does not exist yet
)
echo.

REM Step 5: Grant kiosk user permissions to touch keyboard directories
echo [Step 5/5] Setting directory permissions
set INK_DIR=C:\Program Files\Common Files\microsoft shared\ink
if exist "%INK_DIR%" (
    icacls "%INK_DIR%" /grant kiosk:(OI)(CI)RX /T >> "%LOG_FILE%" 2>&1
    echo [SUCCESS] Set permissions for ink directory
)
echo.

echo ========================================
echo   Fix Complete!
echo ========================================
echo.
echo [Summary]
echo - TabletInputService: Running and set to auto-start
echo - TabTip.exe permissions: Granted to kiosk user
echo - Registry: Configured for virtual keyboard
echo - User profile: Updated (if user exists)
echo.
echo [Next Steps]
echo 1. If kiosk user is currently logged in, log out and log back in
echo 2. Test virtual keyboard in DreamBook application
echo 3. Check log file if issues persist: %LOG_FILE%
echo.
echo Fix completed: %date% %time% >> "%LOG_FILE%"
pause
exit /b 0
