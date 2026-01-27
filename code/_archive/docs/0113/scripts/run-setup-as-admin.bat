@echo off
REM Run PowerShell setup script as Administrator
REM Double-click this file to execute setup-kiosk.ps1 with admin rights

echo Starting setup script with administrator privileges...
echo.

PowerShell -NoProfile -ExecutionPolicy Bypass -Command "& {Start-Process PowerShell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File ""%~dp0setup-kiosk.ps1""' -Verb RunAs}"

if %errorLevel% neq 0 (
    echo.
    echo [ERROR] Failed to start with administrator privileges
    echo Please try running as administrator manually
    pause
)
