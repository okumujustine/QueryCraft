#!/usr/bin/env python3
"""
QueryCraft Backend Service
This service runs as a subprocess from Electron and provides the FastAPI backend
"""

import os
import sys
import signal
import subprocess
import time
import json
from pathlib import Path

class QueryCraftService:
    def __init__(self, port=8000, host="127.0.0.1"):
        self.port = port
        self.host = host
        self.process = None
        self.is_running = False
        
    def start(self):
        """Start the FastAPI service"""
        try:
            # Get the directory where this script is located
            script_dir = Path(__file__).parent.absolute()
            
            # Change to the backend directory
            os.chdir(script_dir)
            
            # Start the FastAPI server
            cmd = [
                sys.executable, "-m", "uvicorn", 
                "main:app", 
                "--host", self.host, 
                "--port", str(self.port),
                "--log-level", "info"
            ]
            
            # Start the process
            self.process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            self.is_running = True
            print(f"✅ QueryCraft backend service started on {self.host}:{self.port}")
            print(f"📊 Process ID: {self.process.pid}")
            
            # Wait for the service to be ready
            self._wait_for_service()
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to start QueryCraft backend service: {e}")
            return False
    
    def stop(self):
        """Stop the FastAPI service"""
        if self.process and self.is_running:
            try:
                # Send SIGTERM signal
                self.process.terminate()
                
                # Wait for graceful shutdown
                try:
                    self.process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    # Force kill if it doesn't respond
                    self.process.kill()
                    self.process.wait()
                
                self.is_running = False
                print("✅ QueryCraft backend service stopped")
                
            except Exception as e:
                print(f"❌ Error stopping service: {e}")
    
    def _wait_for_service(self, timeout=10):
        """Wait for the service to be ready"""
        import requests
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                response = requests.get(f"http://{self.host}:{self.port}/health", timeout=1)
                if response.status_code == 200:
                    print("✅ Backend service is ready!")
                    return True
            except:
                time.sleep(0.5)
        
        print("⚠️  Service startup timeout - it may still be starting up")
        return False
    
    def get_status(self):
        """Get the current status of the service"""
        if not self.is_running or not self.process:
            return {"status": "stopped", "port": self.port}
        
        # Check if process is still running
        if self.process.poll() is None:
            return {
                "status": "running", 
                "port": self.port, 
                "pid": self.process.pid
            }
        else:
            self.is_running = False
            return {"status": "stopped", "port": self.port}

def main():
    """Main entry point when run as a script"""
    import argparse
    
    parser = argparse.ArgumentParser(description="QueryCraft Backend Service")
    parser.add_argument("--port", type=int, default=8000, help="Port to run the service on")
    parser.add_argument("--host", default="127.0.0.1", help="Host to bind the service to")
    parser.add_argument("--daemon", action="store_true", help="Run as a daemon process")
    
    args = parser.parse_args()
    
    service = QueryCraftService(port=args.port, host=args.host)
    
    def signal_handler(signum, frame):
        print(f"\n🛑 Received signal {signum}, shutting down...")
        service.stop()
        sys.exit(0)
    
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        if service.start():
            if args.daemon:
                # Run as daemon - just keep the process alive
                print("🔄 Running as daemon process...")
                while service.is_running:
                    time.sleep(1)
                    if service.process and service.process.poll() is not None:
                        break
            else:
                # Interactive mode - wait for user input
                print("\n🎯 Service is running! Press Ctrl+C to stop.")
                while service.is_running:
                    time.sleep(1)
                    if service.process and service.process.poll() is not None:
                        break
        else:
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Shutting down...")
    finally:
        service.stop()

if __name__ == "__main__":
    main()
