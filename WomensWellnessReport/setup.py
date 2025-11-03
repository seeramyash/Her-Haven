#!/usr/bin/env python3
"""
Quick setup script for Women's Wellness Tracker
This script helps verify the installation and setup the environment.
"""

import sys
import subprocess
import os
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 11):
        print("❌ Python 3.11 or higher is required!")
        print(f"   Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def check_dependencies():
    """Check if required packages are installed"""
    required = [
        'streamlit',
        'pandas',
        'numpy',
        'plotly',
        'sqlalchemy',
        'scikit-learn',
        'xgboost',
        'tensorflow',
        'textblob'
    ]
    
    missing = []
    for package in required:
        try:
            __import__(package)
            print(f"✅ {package} is installed")
        except ImportError:
            print(f"❌ {package} is missing")
            missing.append(package)
    
    return missing

def install_dependencies():
    """Install missing dependencies"""
    print("\n📦 Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", 
                              "numpy>=2.3.4",
                              "pandas>=2.3.3",
                              "plotly>=6.3.1",
                              "psycopg2-binary>=2.9.11",
                              "scikit-learn>=1.7.2",
                              "sqlalchemy>=2.0.44",
                              "streamlit>=1.51.0",
                              "tensorflow>=2.20.0",
                              "textblob>=0.19.0",
                              "xgboost>=3.1.1"])
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        return False

def download_nltk_data():
    """Download required NLTK data for TextBlob"""
    print("\n📥 Downloading NLTK data for TextBlob...")
    try:
        import nltk
        nltk.download('punkt', quiet=True)
        nltk.download('brown', quiet=True)
        nltk.download('wordnet', quiet=True)
        print("✅ NLTK data downloaded successfully!")
        return True
    except Exception as e:
        print(f"⚠️  NLTK data download failed: {e}")
        print("   You may need to download this manually later")
        return False

def create_directories():
    """Create necessary directories"""
    print("\n📁 Creating directories...")
    directories = ['ml_models_saved', '__pycache__']
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Created {directory}/ directory")

def initialize_database():
    """Initialize the database"""
    print("\n🗄️  Initializing database...")
    try:
        from database import init_db
        init_db()
        print("✅ Database initialized successfully!")
        return True
    except Exception as e:
        print(f"⚠️  Database initialization: {e}")
        print("   Database will be created on first run")
        return False

def main():
    """Main setup function"""
    print("=" * 60)
    print("Women's Wellness Tracker - Setup Script")
    print("=" * 60)
    print()
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    print()
    
    # Check dependencies
    missing = check_dependencies()
    
    if missing:
        print(f"\n⚠️  Missing {len(missing)} package(s)")
        response = input("Would you like to install missing dependencies? (y/n): ")
        if response.lower() == 'y':
            if not install_dependencies():
                sys.exit(1)
        else:
            print("Please install dependencies manually:")
            print(f"pip install {' '.join(missing)}")
            sys.exit(1)
    
    print()
    
    # Download NLTK data
    download_nltk_data()
    
    # Create directories
    create_directories()
    
    # Initialize database
    initialize_database()
    
    print()
    print("=" * 60)
    print("✅ Setup complete!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Activate your virtual environment (if using one)")
    print("2. Run: streamlit run app.py")
    print("3. Open http://localhost:8501 in your browser")
    print()
    print("For detailed instructions, see README.md")
    print()

if __name__ == "__main__":
    main()

