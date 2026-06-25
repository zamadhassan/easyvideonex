@echo off
title Universal Video Downloader
cd /d "%~dp0"

cls
echo.
echo  ╔═══════════════════════════════════════════╗
echo  ║   Universal Video Downloader - Launcher   ║
echo  ╚═══════════════════════════════════════════╝
echo.

if not exist "node_modules" (
    echo [*] Installing npm dependencies...
    call npm install
    if errorlevel 1 (
        echo [!] Failed to install dependencies.
        pause
        exit /b 1
    )
    echo.
)

echo [*] Checking Python + yt-dlp...
python -c "import yt_dlp" 2>nul
if errorlevel 1 (
    echo [!] yt-dlp not found. Installing...
    pip install yt-dlp
    echo.
)

echo [*] Starting Python download backend on port 8787...
start "" /B python backend-api/python-server.py > NUL 2>&1
timeout /t 3 /nobreak >nul

echo [*] Starting Next.js dev server on port 3456...
echo [*] Open: http://localhost:3456
echo [*] Press Ctrl+C to stop both servers
echo.

start "" http://localhost:3456
npm run dev

echo [*] Stopping Python backend...
taskkill /F /IM python.exe 2>nul
pause
