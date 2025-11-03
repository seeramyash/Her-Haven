#!/bin/bash

echo "========================================"
echo "Women's Wellness Report - Setup Script"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed!"
    echo "Please install Python 3.8+ from https://www.python.org/downloads/"
    exit 1
fi

echo "[✓] Python found!"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[✓] Node.js found!"
echo ""

# Upgrade pip
echo "[1/4] Upgrading pip..."
python3 -m pip install --upgrade pip --quiet

# Install Python dependencies
echo "[2/4] Installing Python dependencies..."
python3 -m pip install -r ../requirements.txt --quiet
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install Python dependencies"
    exit 1
fi

echo "[✓] Python dependencies installed!"
echo ""

# Install Node.js dependencies
echo "[3/4] Installing Node.js dependencies..."
cd ../frontend
npm install --silent
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install Node.js dependencies"
    cd ..
    exit 1
fi
cd ..

echo "[✓] Node.js dependencies installed!"
echo ""

echo "[4/4] Making scripts executable..."
chmod +x ../start.sh

echo ""
echo "========================================"
echo "Setup Complete! ✓"
echo "========================================"
echo ""
echo "To start the application, run:"
echo "  ./start.sh"
echo ""
echo "Or manually:"
echo "  Terminal 1: python3 start_backend.py"
echo "  Terminal 2: cd frontend && npm start"
echo ""
echo "Then open your browser to: http://localhost:3000"
echo ""

