@echo off
REM ================================================
REM ShopVia - Startup Script for Windows
REM ================================================
REM This script helps you start both backend and frontend
REM Make sure you have Maven and Node.js installed
REM ================================================

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║         ShopVia E-Commerce Platform - Startup            ║
echo ║           Backend + Frontend Combined Start              ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Check if the Maven wrapper is present
if not exist "%~dp0mvnw.cmd" (
    echo ❌ mvnw.cmd not found in the project directory.
    pause
    exit /b 1
)
echo ✅ Maven wrapper found

REM Check if Node.js is installed
echo Checking for Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found
node --version

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0START_SHOPVIA.ps1"
if errorlevel 1 (
    echo ShopVia startup failed. Review the PowerShell output above.
    pause
    exit /b 1
)
