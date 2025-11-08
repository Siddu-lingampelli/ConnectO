#!/bin/bash

echo "=========================================="
echo "🚀 Starting VSConnectO Development Servers"
echo "=========================================="
echo ""

# Check if node_modules exists in backend
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo "✅ Backend dependencies installed!"
    echo ""
fi

# Check if node_modules exists in frontend
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo "✅ Frontend dependencies installed!"
    echo ""
fi

echo "🔧 Starting servers..."
echo ""

# Start backend in background
cd backend
npm start &
BACKEND_PID=$!
echo "✅ Backend server starting on http://localhost:5000 (PID: $BACKEND_PID)"
cd ..
echo ""

# Wait 3 seconds for backend to initialize
sleep 3

# Start frontend in background
cd frontend
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend server starting on http://localhost:5173 (PID: $FRONTEND_PID)"
cd ..
echo ""

echo "=========================================="
echo "✨ Both servers are running!"
echo "=========================================="
echo ""
echo "📝 Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo "   Health:   http://localhost:5000/api/health"
echo ""
echo "🔌 Real-time features enabled:"
echo "   - Socket.io connections"
echo "   - WebRTC video/voice calls"
echo "   - Live notifications"
echo ""
echo "📊 Process IDs:"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "⚠️  To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   Or press Ctrl+C"
echo ""
echo "=========================================="

# Wait for user interrupt
wait
