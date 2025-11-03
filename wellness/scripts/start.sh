#!/bin/bash

echo "========================================"
echo "Women's Wellness Report"
echo "Starting Application..."
echo "========================================"
echo ""

# Check if Python dependencies are installed
python3 -c "import flask" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "[ERROR] Python dependencies not installed!"
    echo "Please run ./setup.sh first"
    exit 1
fi

# Check if Node dependencies are installed
if [ ! -d "../frontend/node_modules" ]; then
    echo "[ERROR] Node.js dependencies not installed!"
    echo "Please run ./setup.sh first"
    exit 1
fi

# Start backend
echo "Starting backend server..."
cd ..
python3 scripts/start_backend.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "Application Started! ✓"
echo "========================================"
echo ""
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "The app will open in your browser shortly..."
echo ""

# Open browser
sleep 5
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
else
    echo "Please open your browser to: http://localhost:3000"
fi

echo ""
echo "To stop the application, press Ctrl+C"
echo ""

# Wait for user interrupt
wait
