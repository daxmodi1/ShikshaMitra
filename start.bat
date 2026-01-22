@echo off
echo.
echo ========================================
echo Shiksha Mitra - Startup Script
echo ========================================
echo.

echo [Step 1] Checking Python Installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    exit /b 1
)
echo ✓ Python found

echo.
echo [Step 2] Checking Node.js Installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    exit /b 1
)
echo ✓ Node.js found

echo.
echo [Step 3] Starting Backend Server...
echo.
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt >nul 2>&1
echo.
echo Backend server starting at http://localhost:8000
echo Keep this window open and open another terminal for frontend
echo.
start "" cmd /k "cd /d %cd% && venv\Scripts\activate.bat && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 >nul

echo.
echo [Step 4] Starting Frontend Server...
echo.
cd ..\frontend
call npm install >nul 2>&1
echo.
echo Frontend server starting at http://localhost:5173
echo.
call npm run dev

pause
