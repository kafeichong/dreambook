@echo off
REM Run PowerShell cleanup script as Administrator
REM Double-click this file to execute cleanup-kiosk-v3.ps1 with admin rights

echo Starting cleanup script with administrator privileges...
echo.

PowerShell -NoProfile -ExecutionPolicy Bypass -Command "& {Start-Process PowerShell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File ""%~dp0cleanup-kiosk-v3.ps1""' -Verb RunAs}"

if %errorLevel% neq 0 (
    echo.
    echo [ERROR] Failed to start with administrator privileges
    echo Please try running as administrator manually
    pause
)
