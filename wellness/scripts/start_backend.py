#!/usr/bin/env python3
"""
Start the Flask backend API server
"""
import os
import sys

# Add src directories to path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(project_root, 'src', 'backend'))
sys.path.insert(0, os.path.join(project_root, 'src', 'ml'))

from api_server import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Flask API server on http://localhost:{port}")
    print(f"API documentation: http://localhost:{port}/api/health")
    app.run(host='0.0.0.0', port=port, debug=True)

