@echo off
REM Run keyboard fix script v2.0 as Administrator (Enhanced version with ownership handling)

echo Starting keyboard fix v2.0 with administrator privileges...
echo.

PowerShell -NoProfile -ExecutionPolicy Bypass -Command "& {Start-Process PowerShell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File ""%~dp0fix-keyboard-kiosk-v2.ps1""' -Verb RunAs}"

if %errorLevel% neq 0 (
    echo.
    echo [ERROR] Failed to start with administrator privileges
    echo Trying batch version instead...
    echo.
    pause

    REM Fallback to batch version
    powershell -Command "Start-Process '%~dp0fix-keyboard-kiosk-v2.bat' -Verb RunAs"
)
