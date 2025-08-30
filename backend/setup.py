#!/usr/bin/env python3
"""
Setup script for QueryCraft Backend
Installs dependencies and sets up the Python environment
"""

import os
import sys
import subprocess
import venv
from pathlib import Path

def run_command(cmd, cwd=None):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(
            cmd, 
            shell=True, 
            cwd=cwd, 
            capture_output=True, 
            text=True, 
            check=True
        )
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, f"Command failed: {e.stderr}"

def setup_python_environment():
    """Set up Python virtual environment and install dependencies"""
    print("🐍 Setting up Python environment for QueryCraft Backend...")
    
    # Get the backend directory
    backend_dir = Path(__file__).parent.absolute()
    venv_dir = backend_dir / "venv"
    
    # Check if Python 3.8+ is available
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        return False
    
    print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro} detected")
    
    # Create virtual environment if it doesn't exist
    if not venv_dir.exists():
        print("📁 Creating virtual environment...")
        venv.create(venv_dir, with_pip=True)
        print("✅ Virtual environment created")
    else:
        print("✅ Virtual environment already exists")
    
    # Determine the pip path
    if os.name == 'nt':  # Windows
        pip_path = venv_dir / "Scripts" / "pip"
        python_path = venv_dir / "Scripts" / "python"
    else:  # Unix/Linux/macOS
        pip_path = venv_dir / "bin" / "pip"
        python_path = venv_dir / "bin" / "python"
    
    # Upgrade pip
    print("⬆️  Upgrading pip...")
    success, output = run_command(f'"{pip_path}" install --upgrade pip', cwd=backend_dir)
    if success:
        print("✅ Pip upgraded")
    else:
        print(f"⚠️  Pip upgrade failed: {output}")
    
    # Install requirements
    print("📦 Installing Python dependencies...")
    requirements_file = backend_dir / "requirements.txt"
    
    if requirements_file.exists():
        success, output = run_command(f'"{pip_path}" install -r requirements.txt', cwd=backend_dir)
        if success:
            print("✅ Dependencies installed successfully")
        else:
            print(f"❌ Failed to install dependencies: {output}")
            return False
    else:
        print("❌ requirements.txt not found")
        return False
    
    # Test the installation
    print("🧪 Testing installation...")
    success, output = run_command(f'"{python_path}" -c "import fastapi, uvicorn; print(\'✅ FastAPI and Uvicorn imported successfully\')"', cwd=backend_dir)
    
    if success:
        print("✅ Backend setup completed successfully!")
        print(f"\n🎯 To start the backend service:")
        print(f"   cd {backend_dir}")
        print(f"   {python_path} querycraft_service.py")
        print(f"\n🌐 Or start the FastAPI server directly:")
        print(f"   {python_path} -m uvicorn main:app --reload --host 127.0.0.1 --port 8000")
        return True
    else:
        print("❌ Installation test failed")
        return False

def main():
    """Main setup function"""
    print("🚀 QueryCraft Backend Setup")
    print("=" * 40)
    
    if setup_python_environment():
        print("\n🎉 Setup completed successfully!")
        print("\n📚 Next steps:")
        print("1. Start the backend service: python querycraft_service.py")
        print("2. The API will be available at: http://127.0.0.1:8000")
        print("3. API documentation at: http://127.0.0.1:8000/docs")
        print("4. Test the API: curl http://127.0.0.1:8000/health")
    else:
        print("\n❌ Setup failed. Please check the error messages above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
