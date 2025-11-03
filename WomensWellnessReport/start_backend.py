#!/usr/bin/env python3
"""
Start the Flask backend API server
"""
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api_server import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Flask API server on http://localhost:{port}")
    print(f"API documentation: http://localhost:{port}/api/health")
    app.run(host='0.0.0.0', port=port, debug=True)

