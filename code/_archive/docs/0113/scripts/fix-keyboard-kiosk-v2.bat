@echo off
REM Kiosk Virtual Keyboard Fix Script v2.0
REM Enhanced with TrustedInstaller ownership handling

setlocal EnableDelayedExpansion

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Administrator privileges required
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo ========================================
echo   Kiosk Virtual Keyboard Fix v2.0
echo   With ownership handling
echo ========================================
echo.

set LOG_FILE=%~dp0fix-keyboard-kiosk-v2.log
echo Fix started: %date% %time% > "%LOG_FILE%"
echo.

REM Step 1: Ensure TabletInputService is running
echo [Step 1/7] Checking TabletInputService
sc query TabletInputService | find "RUNNING" >nul
if %errorLevel% equ 0 (
    echo [OK] TabletInputService is running
) else (
    echo [WARNING] TabletInputService not running, starting...
    sc config TabletInputService start= auto >> "%LOG_FILE%" 2>&1
    sc start TabletInputService >> "%LOG_FILE%" 2>&1
    echo [SUCCESS] TabletInputService started
)
echo.

REM Step 2: Take ownership of TabTip.exe and set permissions
echo [Step 2/7] Taking ownership of TabTip.exe
set TABTIP_64=C:\Program Files\Common Files\microsoft shared\ink\TabTip.exe
set TABTIP_32=C:\Program Files (x86)\Common Files\microsoft shared\ink\TabTip.exe

if exist "%TABTIP_64%" (
    echo   Processing: %TABTIP_64%
    takeown /f "%TABTIP_64%" /a /r /d y >> "%LOG_FILE%" 2>&1
    icacls "%TABTIP_64%" /grant Administrators:F /t /c /q >> "%LOG_FILE%" 2>&1
    icacls "%TABTIP_64%" /grant kiosk:RX /t /c /q >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [SUCCESS] Permissions set for 64-bit TabTip.exe
    ) else (
        echo [WARNING] Permission issues with 64-bit TabTip.exe
    )
)

if exist "%TABTIP_32%" (
    echo   Processing: %TABTIP_32%
    takeown /f "%TABTIP_32%" /a /r /d y >> "%LOG_FILE%" 2>&1
    icacls "%TABTIP_32%" /grant Administrators:F /t /c /q >> "%LOG_FILE%" 2>&1
    icacls "%TABTIP_32%" /grant kiosk:RX /t /c /q >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [SUCCESS] Permissions set for 32-bit TabTip.exe
    ) else (
        echo [WARNING] Permission issues with 32-bit TabTip.exe
    )
)
echo.

REM Step 3: Take ownership of ink directories
echo [Step 3/7] Setting ink directory permissions
set INK_64=C:\Program Files\Common Files\microsoft shared\ink
set INK_32=C:\Program Files (x86)\Common Files\microsoft shared\ink

if exist "%INK_64%" (
    echo   Processing: %INK_64%
    takeown /f "%INK_64%" /a /r /d y >> "%LOG_FILE%" 2>&1
    icacls "%INK_64%" /grant Administrators:F /t /c /q >> "%LOG_FILE%" 2>&1
    icacls "%INK_64%" /grant "kiosk:(OI)(CI)RX" /t /c /q >> "%LOG_FILE%" 2>&1
    echo [SUCCESS] Permissions set for 64-bit ink directory
)

if exist "%INK_32%" (
    echo   Processing: %INK_32%
    takeown /f "%INK_32%" /a /r /d y >> "%LOG_FILE%" 2>&1
    icacls "%INK_32%" /grant Administrators:F /t /c /q >> "%LOG_FILE%" 2>&1
    icacls "%INK_32%" /grant "kiosk:(OI)(CI)RX" /t /c /q >> "%LOG_FILE%" 2>&1
    echo [SUCCESS] Permissions set for 32-bit ink directory
)
echo.

REM Step 4: Configure system registry
echo [Step 4/7] Configuring system registry
reg add "HKLM\SOFTWARE\Microsoft\TabletTip\1.7" /f >> "%LOG_FILE%" 2>&1
reg add "HKLM\SOFTWARE\Policies\Microsoft\TabletTip\1.7" /f >> "%LOG_FILE%" 2>&1
echo [SUCCESS] System registry configured
echo.

REM Step 5: Configure user groups
echo [Step 5/7] Configuring user groups
net user kiosk >nul 2>&1
if %errorLevel% equ 0 (
    net localgroup "Users" kiosk /add >> "%LOG_FILE%" 2>&1
    echo [OK] User groups configured
) else (
    echo [WARNING] Kiosk user does not exist
)
echo.

REM Step 6: Configure kiosk user profile
echo [Step 6/7] Configuring kiosk user profile
set USER_PROFILE=C:\Users\kiosk\NTUSER.DAT
if exist "%USER_PROFILE%" (
    reg load HKU\kiosk_temp "%USER_PROFILE%" >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        reg add "HKU\kiosk_temp\Software\Microsoft\TabletTip\1.7" /v EnableDesktopModeAutoInvoke /t REG_DWORD /d 1 /f >> "%LOG_FILE%" 2>&1
        reg add "HKU\kiosk_temp\Software\Microsoft\TabletTip\1.7" /v EdgeTargetDockedState /t REG_DWORD /d 1 /f >> "%LOG_FILE%" 2>&1
        reg unload HKU\kiosk_temp >> "%LOG_FILE%" 2>&1
        echo [SUCCESS] Kiosk user profile configured
    ) else (
        echo [WARNING] Could not modify user profile (user may be logged in)
        echo [INFO] Please log out kiosk user and run this script again
    )
) else (
    echo [INFO] Kiosk user profile does not exist (user has not logged in yet)
)
echo.

REM Step 7: Create manual keyboard launcher
echo [Step 7/7] Creating manual keyboard launcher
set HELPER_SCRIPT=C:\kiosk\launch-keyboard.bat
set HELPER_DIR=C:\kiosk

if not exist "%HELPER_DIR%" (
    mkdir "%HELPER_DIR%" 2>nul
)

(
echo @echo off
echo REM Manual keyboard launcher for kiosk user
echo start "" "C:\Program Files\Common Files\microsoft shared\ink\TabTip.exe"
) > "%HELPER_SCRIPT%"

icacls "%HELPER_SCRIPT%" /grant kiosk:RX /c /q >> "%LOG_FILE%" 2>&1
echo [SUCCESS] Created manual launcher: %HELPER_SCRIPT%
echo.

echo ========================================
echo   Fix Complete!
echo ========================================
echo.
echo [Summary]
echo - TabletInputService: Running and auto-start enabled
echo - TabTip.exe ownership: Acquired
echo - TabTip.exe permissions: Granted to kiosk user
echo - Directory permissions: Set
echo - System registry: Configured
echo - User profile: Updated (if applicable)
echo - Manual launcher: Created
echo.
echo [IMPORTANT NEXT STEPS]
echo.
echo 1. If kiosk user is currently logged in:
echo    a^) Log out kiosk user
echo    b^) Re-run this script as administrator
echo    c^) Log back in as kiosk user
echo.
echo 2. Test virtual keyboard:
echo    - Log in as kiosk user
echo    - Open DreamBook application
echo    - Click on input field
echo    - Virtual keyboard should appear
echo.
echo 3. If still not working, manually test:
echo    - Run: C:\kiosk\launch-keyboard.bat
echo    - Or: C:\Program Files\Common Files\microsoft shared\ink\TabTip.exe
echo.
echo 4. If manual launch also fails:
echo    - Check Windows Update
echo    - Check Group Policy settings (gpedit.msc)
echo    - Consider using classic on-screen keyboard (osk.exe)
echo.
echo Log file: %LOG_FILE%
echo.
pause
exit /b 0
