@echo off
echo ========================================
echo   Approve Pending Verifications
echo ========================================
echo.

cd /d "%~dp0.."
node scripts\approveVerification.js

echo.
pause
