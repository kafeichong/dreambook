@echo off
REM DreamBook Kiosk Setup Script
REM Version: 1.0
REM Date: 2026-01-13
REM Description: Automatically configure Windows 10 Kiosk mode

setlocal EnableDelayedExpansion

echo ========================================
echo   DreamBook Kiosk Setup v1.0
echo ========================================
echo.

REM Check administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Administrator privileges required
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo [INFO] Administrator privileges verified
echo.

REM Set log file
set LOG_FILE=%~dp0setup-kiosk.log
echo [INFO] Log file: %LOG_FILE%
echo Setup started: %date% %time% > "%LOG_FILE%"
echo. >> "%LOG_FILE%"

REM ========================================
REM Step 1: Set configuration parameters
REM ========================================
echo [Step 1/6] Configuration setup
echo [Step 1/6] Configuration setup >> "%LOG_FILE%"

set KIOSK_USER=kiosk
set KIOSK_PASSWORD=DreamBook2026!
set APP_PATH=C:\kiosk\dreambook\dreambook.exe

echo Username: %KIOSK_USER%
echo App path: %APP_PATH%
echo.

REM ========================================
REM Step 2: Create kiosk user
REM ========================================
echo [Step 2/6] Creating kiosk user account
echo [Step 2/6] Creating kiosk user account >> "%LOG_FILE%"

REM Check if user already exists
net user %KIOSK_USER% >nul 2>&1
if %errorLevel% equ 0 (
    echo [WARNING] User %KIOSK_USER% already exists, skipping creation
    echo [WARNING] User %KIOSK_USER% already exists, skipping creation >> "%LOG_FILE%"
) else (
    net user %KIOSK_USER% %KIOSK_PASSWORD% /add
    if %errorLevel% equ 0 (
        echo [SUCCESS] User %KIOSK_USER% created successfully
        echo [SUCCESS] User %KIOSK_USER% created successfully >> "%LOG_FILE%"
    ) else (
        echo [ERROR] User creation failed, error code: %errorLevel%
        echo [ERROR] User creation failed, error code: %errorLevel% >> "%LOG_FILE%"
        goto :error
    )
)
echo.

REM ========================================
REM Step 3: Configure auto-login
REM ========================================
echo [Step 3/6] Configuring auto-login
echo [Step 3/6] Configuring auto-login >> "%LOG_FILE%"

reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultUserName /t REG_SZ /d %KIOSK_USER% /f >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [SUCCESS] Set default username
) else (
    echo [ERROR] Failed to set default username
    goto :error
)

reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultPassword /t REG_SZ /d %KIOSK_PASSWORD% /f >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [SUCCESS] Set default password
) else (
    echo [ERROR] Failed to set default password
    goto :error
)

reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v AutoAdminLogon /t REG_SZ /d 1 /f >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [SUCCESS] Enabled auto-login
) else (
    echo [ERROR] Failed to enable auto-login
    goto :error
)
echo.

REM ========================================
REM Step 4: Configure Shell replacement
REM ========================================
echo [Step 4/6] Configuring Shell replacement
echo [Step 4/6] Configuring Shell replacement >> "%LOG_FILE%"

REM Check if app file exists
if not exist "%APP_PATH%" (
    echo [WARNING] App file does not exist: %APP_PATH%
    echo [WARNING] Please ensure the app is deployed to this path
    echo [WARNING] App file does not exist: %APP_PATH% >> "%LOG_FILE%"
)

REM Load Default User registry
reg load HKU\DEF "C:\Users\Default\NTUSER.DAT" >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [SUCCESS] Loaded Default User registry
) else (
    echo [ERROR] Failed to load Default User registry
    goto :error
)

REM Set Shell to dreambook.exe
reg add "HKU\DEF\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell /t REG_SZ /d "%APP_PATH%" /f >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [SUCCESS] Set Shell to dreambook.exe
) else (
    echo [ERROR] Failed to set Shell
    reg unload HKU\DEF
    goto :error
)

REM Unload registry
reg unload HKU\DEF >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [SUCCESS] Unloaded Default User registry
) else (
    echo [WARNING] Failed to unload registry, but configuration may be complete
)
echo.

REM ========================================
REM Step 5: Enable virtual keyboard service
REM ========================================
echo [Step 5/6] Enabling virtual keyboard service
echo [Step 5/6] Enabling virtual keyboard service >> "%LOG_FILE%"

sc config TabletInputService start= auto >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [SUCCESS] Set virtual keyboard service to auto-start
) else (
    echo [WARNING] Failed to set virtual keyboard service, but main function not affected
)

sc start TabletInputService >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [SUCCESS] Started virtual keyboard service
) else (
    echo [WARNING] Failed to start virtual keyboard service, please start manually
)
echo.

REM ========================================
REM Step 6: Configure app permissions
REM ========================================
echo [Step 6/6] Configuring app permissions
echo [Step 6/6] Configuring app permissions >> "%LOG_FILE%"

if exist "C:\kiosk\dreambook" (
    icacls "C:\kiosk\dreambook" /grant "%KIOSK_USER%:(OI)(CI)F" /T >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [SUCCESS] Set app directory permissions
    ) else (
        echo [WARNING] Failed to set app directory permissions
    )
) else (
    echo [WARNING] App directory does not exist: C:\kiosk\dreambook
    echo [WARNING] App directory does not exist: C:\kiosk\dreambook >> "%LOG_FILE%"
)
echo.

REM ========================================
REM Configuration complete
REM ========================================
echo ========================================
echo   Configuration Complete!
echo ========================================
echo.
echo [Summary]
echo - kiosk user: %KIOSK_USER%
echo - Auto-login: Enabled
echo - Shell replacement: Configured
echo - Virtual keyboard: Enabled
echo.
echo [Next Steps]
echo 1. Ensure app is deployed to: %APP_PATH%
echo 2. Run verify-kiosk.bat to verify configuration
echo 3. Restart computer to test auto-login
echo.
echo Setup completed: %date% %time% >> "%LOG_FILE%"
pause
exit /b 0

:error
echo.
echo ========================================
echo   Configuration Failed!
echo ========================================
echo.
echo Please check log file for details: %LOG_FILE%
echo Or run cleanup-kiosk.bat to clean up and retry
echo.
echo Setup failed: %date% %time% >> "%LOG_FILE%"
pause
exit /b 1
