@echo off
REM DreamBook Shell Configuration Fix Script
REM Version: 2.0 (English Simplified)
REM Date: 2026-01-13

setlocal EnableDelayedExpansion

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ========================================
    echo   DreamBook Shell Fix Tool v2.0
    echo ========================================
    echo.
    echo ERROR: Administrator privileges required!
    echo.
    echo Please:
    echo 1. Right-click this file
    echo 2. Select "Run as administrator"
    echo 3. Click "Yes" in UAC dialog
    echo.
    pause
    exit /b 1
)

echo ========================================
echo   DreamBook Shell Fix Tool v2.0
echo ========================================
echo.
echo [INFO] Administrator check passed
echo.

set LOG_FILE=%~dp0fix-shell.log
echo Fix started: %date% %time% > "%LOG_FILE%"
echo. >> "%LOG_FILE%"

REM Step 1: Clean current user Shell config
echo [Step 1/4] Cleaning current user Shell config
echo [Step 1/4] Current user Shell >> "%LOG_FILE%"

reg query "HKCU\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell >nul 2>&1
if %errorLevel% equ 0 (
    reg delete "HKCU\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell /f >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [OK] Current user Shell config deleted
        echo [OK] Current user Shell deleted >> "%LOG_FILE%"
    ) else (
        echo [WARN] Failed to delete current user Shell
        echo [WARN] Failed >> "%LOG_FILE%"
    )
) else (
    echo [OK] No custom Shell config found (normal)
    echo [OK] No custom Shell >> "%LOG_FILE%"
)
echo.

REM Step 2: Clean Default User Shell config
echo [Step 2/4] Cleaning Default User Shell config
echo [Step 2/4] Default User Shell >> "%LOG_FILE%"

reg load HKU\DEF "C:\Users\Default\NTUSER.DAT" >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [OK] Loaded Default User registry

    reg delete "HKU\DEF\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell /f >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [OK] Default User Shell deleted
        echo [OK] Default User Shell deleted >> "%LOG_FILE%"
    ) else (
        echo [OK] No custom Shell (normal)
        echo [OK] No custom Shell >> "%LOG_FILE%"
    )

    reg unload HKU\DEF >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [OK] Unloaded Default User registry
    ) else (
        echo [WARN] Failed to unload registry
    )
) else (
    echo [WARN] Cannot load Default User registry
    echo [WARN] Cannot load >> "%LOG_FILE%"
)
echo.

REM Step 3: Clean kiosk user Shell config
echo [Step 3/4] Cleaning kiosk user Shell config
echo [Step 3/4] Kiosk user Shell >> "%LOG_FILE%"

if exist "C:\Users\kiosk\NTUSER.DAT" (
    reg load HKU\KIOSK "C:\Users\kiosk\NTUSER.DAT" >> "%LOG_FILE%" 2>&1
    if %errorLevel% equ 0 (
        echo [OK] Loaded kiosk user registry

        reg delete "HKU\KIOSK\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell /f >> "%LOG_FILE%" 2>&1
        if %errorLevel% equ 0 (
            echo [OK] Kiosk user Shell deleted
            echo [OK] Kiosk Shell deleted >> "%LOG_FILE%"
        ) else (
            echo [OK] No custom Shell (normal)
            echo [OK] No custom Shell >> "%LOG_FILE%"
        )

        reg unload HKU\KIOSK >> "%LOG_FILE%" 2>&1
        if %errorLevel% equ 0 (
            echo [OK] Unloaded kiosk user registry
        ) else (
            echo [WARN] Failed to unload registry
        )
    ) else (
        echo [WARN] Cannot load kiosk user registry
        echo [WARN] Cannot load >> "%LOG_FILE%"
    )
) else (
    echo [OK] Kiosk user does not exist, skip
    echo [OK] Kiosk user not found >> "%LOG_FILE%"
)
echo.

REM Step 4: Verify system Shell
echo [Step 4/4] Verifying system Shell config
echo [Step 4/4] Verify >> "%LOG_FILE%"

echo [INFO] Checking system Shell...
echo.

reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell >> "%LOG_FILE%" 2>&1
if %errorLevel% equ 0 (
    echo [OK] System default Shell exists
    for /f "tokens=3" %%a in ('reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell ^| findstr /i "Shell"') do (
        echo [INFO] System Shell: %%a
        echo [INFO] System Shell: %%a >> "%LOG_FILE%"
    )
) else (
    echo [OK] Using default Shell (explorer.exe)
    echo [OK] Using default Shell >> "%LOG_FILE%"
)
echo.

REM Fix complete
echo ========================================
echo   Fix Complete!
echo ========================================
echo.
echo [Summary]
echo - Current user Shell: Cleaned
echo - Default User Shell: Cleaned
echo - Kiosk user Shell: Cleaned
echo.
echo [Next Steps]
echo 1. Restart your computer
echo 2. Log in normally (no more black screen flash)
echo 3. DreamBook will run as normal app
echo.
echo [Note]
echo - If still have issues, check log: %LOG_FILE%
echo - Or contact technical support
echo.
echo Fix completed: %date% %time% >> "%LOG_FILE%"
pause
exit /b 0
