@echo off
SETLOCAL EnableDelayedExpansion
TITLE Rollercoinmarkt Controller

echo ===================================================
echo             Rollercoinmarkt Launcher               
echo ===================================================
echo.

:: 1. Check if Python is installed
echo [*] Checking Python installation...
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python was not found in your PATH.
    echo Please install Python and make sure to check "Add Python to PATH" during setup.
    echo.
    pause
    exit /b 1
)

:: 2. Check if Node.js is installed
echo [*] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js was not found in your PATH.
    echo Please install Node.js from https://nodejs.org/ to run the frontend.
    echo.
    pause
    exit /b 1
)
echo [OK] Prerequisites met: Python and Node.js are installed.
echo.

:: 3. Port Check (8001 for Backend)
echo [*] Checking if port 8001 is available...
netstat -ano | findstr LISTENING | findstr :8001 >nul 2>nul
if %ERRORLEVEL% eq 0 (
    echo [WARNING] Port 8001 is already in use. 
    echo The backend might fail to start if another instance is running.
    echo.
) else (
    echo [OK] Port 8001 is free.
)

:: 4. Auto-detect & Configure Python Virtual Environment
set "START_BACKEND="
if exist "backend\.venv\" (
    echo [INFO] Detected virtual environment in backend\.venv
    set "START_BACKEND=cd backend && call .venv\Scripts\activate && python -m uvicorn app:app --host 127.0.0.1 --port 8001 --reload"
) else if exist "backend\venv\" (
    echo [INFO] Detected virtual environment in backend\venv
    set "START_BACKEND=cd backend && call venv\Scripts\activate && python -m uvicorn app:app --host 127.0.0.1 --port 8001 --reload"
) else (
    echo [INFO] No virtual environment detected. Using global python...
    set "START_BACKEND=cd backend && python -m uvicorn app:app --host 127.0.0.1 --port 8001 --reload"
)

:: 5. Install Frontend dependencies automatically if missing
if not exist "frontend\node_modules\" (
    echo [INFO] frontend\node_modules is missing. Installing frontend dependencies...
    pushd frontend
    call npm install
    popd
)

:: 6. Launch Backend in a new window
echo.
echo [+] Starting Backend Service (FastAPI) on port 8001...
start "Rollercoinmarkt - Backend API" cmd /k "%START_BACKEND%"

:: 7. Launch Frontend in a new window
echo [+] Starting Frontend Service (Vite + Vue 3)...
start "Rollercoinmarkt - Frontend UI" cmd /k "cd frontend && npm run dev -- --host"

echo.
echo ===================================================
echo  Services started successfully.
echo  - Backend API: http://127.0.0.1:8001
echo  - Frontend UI: Check the newly opened terminal window.
echo ===================================================
echo.
timeout /t 5
