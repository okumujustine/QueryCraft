#!/bin/bash

echo "🚀 QueryCraft Full Stack Setup"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python is installed
check_python() {
    print_status "Checking Python installation..."
    
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
        print_success "Python $PYTHON_VERSION found"
        PYTHON_CMD="python3"
    elif command -v python &> /dev/null; then
        PYTHON_VERSION=$(python --version 2>&1 | awk '{print $2}')
        print_success "Python $PYTHON_VERSION found"
        PYTHON_CMD="python"
    else
        print_error "Python is not installed. Please install Python 3.8 or higher."
        exit 1
    fi
    
    # Check Python version
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)
    
    if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 8 ]); then
        print_error "Python 3.8 or higher is required. Current version: $PYTHON_VERSION"
        exit 1
    fi
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js $NODE_VERSION found"
    else
        print_error "Node.js is not installed. Please install Node.js 20.19 or higher."
        exit 1
    fi
    
    # Check Node.js version
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | tr -d 'v')
    NODE_MINOR=$(echo $NODE_VERSION | cut -d. -f2)
    
    if [ "$NODE_MAJOR" -lt 20 ] || ([ "$NODE_MAJOR" -eq 20 ] && [ "$NODE_MINOR" -lt 19 ]); then
        print_warning "Node.js 20.19 or higher is recommended for Vite compatibility. Current version: $NODE_VERSION"
    fi
}

# Setup Python backend
setup_backend() {
    print_status "Setting up Python backend..."
    
    cd backend
    
    if [ ! -f "requirements.txt" ]; then
        print_error "requirements.txt not found in backend directory"
        exit 1
    fi
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        $PYTHON_CMD -m venv venv
        print_success "Virtual environment created"
    else
        print_success "Virtual environment already exists"
    fi
    
    # Activate virtual environment
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows
        source venv/Scripts/activate
    else
        # Unix/Linux/macOS
        source venv/bin/activate
    fi
    
    # Upgrade pip
    print_status "Upgrading pip..."
    pip install --upgrade pip
    
    # Install requirements
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
    
    if [ $? -eq 0 ]; then
        print_success "Python dependencies installed successfully"
    else
        print_error "Failed to install Python dependencies"
        exit 1
    fi
    
    # Test installation
    print_status "Testing Python installation..."
    python -c "import fastapi, uvicorn; print('✅ FastAPI and Uvicorn imported successfully')"
    
    if [ $? -eq 0 ]; then
        print_success "Backend setup completed successfully!"
    else
        print_error "Backend setup failed"
        exit 1
    fi
    
    cd ..
}

# Setup Node.js frontend
setup_frontend() {
    print_status "Setting up Node.js frontend..."
    
    # Install Node.js dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Node.js dependencies installed successfully"
    else
        print_error "Failed to install Node.js dependencies"
        exit 1
    fi
    
    # Build the project
    print_status "Building the project..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Project built successfully"
    else
        print_error "Project build failed"
        exit 1
    fi
}

# Test the setup
test_setup() {
    print_status "Testing the setup..."
    
    # Test backend
    cd backend
    
    # Activate virtual environment
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        source venv/Scripts/activate
    else
        source venv/bin/activate
    fi
    
    # Start backend in background
    print_status "Starting backend service for testing..."
    python querycraft_service.py --daemon &
    BACKEND_PID=$!
    
    # Wait for backend to start
    sleep 5
    
    # Test API endpoint
    print_status "Testing API endpoint..."
    if curl -s http://127.0.0.1:8000/health > /dev/null; then
        print_success "Backend API is responding"
    else
        print_warning "Backend API is not responding (this is normal if you haven't started it yet)"
    fi
    
    # Stop backend
    kill $BACKEND_PID 2>/dev/null
    
    cd ..
    
    print_success "Setup test completed"
}

# Main setup function
main() {
    echo "This script will set up QueryCraft with both frontend and backend components."
    echo ""
    
    # Check prerequisites
    check_python
    check_node
    
    echo ""
    print_status "Starting setup..."
    
    # Setup backend
    setup_backend
    
    echo ""
    
    # Setup frontend
    setup_frontend
    
    echo ""
    
    # Test setup
    test_setup
    
    echo ""
    print_success "🎉 QueryCraft setup completed successfully!"
    echo ""
    echo "📚 Next steps:"
    echo "1. Start the backend: cd backend && python querycraft_service.py"
    echo "2. Start the frontend: npm run dev"
    echo "3. Start Electron app: npm run electron:dev"
    echo "4. Build desktop app: npm run electron:build"
    echo ""
    echo "🌐 Backend API will be available at: http://127.0.0.1:8000"
    echo "📖 API documentation at: http://127.0.0.1:8000/docs"
    echo "🖥️  Frontend will be available at: http://localhost:5173"
}

# Run main function
main
