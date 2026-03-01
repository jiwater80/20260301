@echo off
cd /d "%~dp0"

echo ========================================
echo   Han-CN Budget App
echo ========================================
echo.
echo Folder: %cd%
echo.

if not exist "package.json" (
    echo ERROR: package.json not found.
    echo Put this bat file inside han-cn-budget-app folder.
    echo.
    pause
    exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js not found.
    echo Install from https://nodejs.org - LTS version.
    echo Then restart PC and try again.
    echo.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo ERROR: npm not found. Install Node.js first.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo First run. Installing packages... Please wait.
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: npm install failed. See message above.
        echo.
        pause
        exit /b 1
    )
    echo.
)

echo Starting server...
echo Open in browser: http://localhost:5173
echo.
echo Press Ctrl+C in this window to stop.
echo ========================================
echo.

start http://localhost:5173
call npm run dev

if errorlevel 1 (
    echo.
    echo ERROR: Server failed. See message above.
    echo.
)

echo.
pause
