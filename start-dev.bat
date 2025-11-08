@echo off
title VSConnectO - Development Servers

echo ==========================================
echo 🚀 Starting VSConnectO Development Servers
echo ==========================================
echo.

REM Check if node_modules exists in backend
if not exist "backend\node_modules\" (
    echo 📦 Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo ✅ Backend dependencies installed!
    echo.
)

REM Check if node_modules exists in frontend
if not exist "frontend\node_modules\" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo ✅ Frontend dependencies installed!
    echo.
)

echo 🔧 Starting servers...
echo.

REM Start backend in new window
start "VSConnectO Backend" cmd /k "cd backend && npm start"
echo ✅ Backend server starting on http://localhost:5000
echo.

REM Wait 3 seconds for backend to initialize
timeout /t 3 /nobreak >nul

REM Start frontend in new window
start "VSConnectO Frontend" cmd /k "cd frontend && npm run dev"
echo ✅ Frontend server starting on http://localhost:5173
echo.

echo ==========================================
echo ✨ Both servers are starting!
echo ==========================================
echo.
echo 📝 Access the application:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo    Health:   http://localhost:5000/api/health
echo.
echo 🔌 Real-time features enabled:
echo    - Socket.io connections
echo    - WebRTC video/voice calls
echo    - Live notifications
echo.
echo 💡 Two command windows will open:
echo    1. Backend Server (Node.js)
echo    2. Frontend Server (Vite)
echo.
echo ⚠️  Keep both windows open while developing!
echo    Press Ctrl+C in each window to stop servers.
echo.
echo ==========================================

pause
