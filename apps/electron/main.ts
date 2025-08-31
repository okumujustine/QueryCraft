import { app, BrowserWindow, shell, ipcMain } from "electron"
import path from "path"
import { spawn, ChildProcess } from 'child_process'

const isDev = process.env.NODE_ENV === 'development'

let backendProcess: ChildProcess | null = null
const backendPort = 8000

const startBackendService = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      // In production, use bundled Python executable
      // In development, use system Python
      let pythonPath: string
      let backendPath: string
      
      if (isDev) {
        // Development: Use system Python
        pythonPath = 'python3'
        backendPath = path.join(__dirname, '../backend/querycraft_service.py')
      } else {
        // Production: Use bundled Python executable
        if (process.platform === 'win32') {
          pythonPath = path.join(__dirname, '../backend/python/python.exe')
        } else if (process.platform === 'darwin') {
          pythonPath = path.join(__dirname, '../backend/python/bin/python3')
        } else {
          pythonPath = path.join(__dirname, '../backend/python/bin/python3')
        }
        backendPath = path.join(__dirname, '../backend/querycraft_service.py')
      }
      
      console.log('🚀 Starting Python backend service...')
      console.log('📁 Backend path:', backendPath)
      console.log('🐍 Python path:', pythonPath)
      
      // Start the Python backend service
      backendProcess = spawn(pythonPath, [backendPath, '--port', backendPort.toString()], {
        stdio: 'pipe',
        cwd: path.join(__dirname, '../backend')
      })
      
      backendProcess.stdout?.on('data', (data) => {
        console.log('🐍 Backend:', data.toString().trim())
      })
      
      backendProcess.stderr?.on('data', (data) => {
        console.error('🐍 Backend Error:', data.toString().trim())
      })
      
      backendProcess.on('close', (code) => {
        console.log(`🐍 Backend service exited with code ${code}`)
        backendProcess = null
      })
      
      backendProcess.on('error', (error) => {
        console.error('🐍 Failed to start backend service:', error)
        backendProcess = null
        resolve(false)
      })
      
      // Wait a bit for the service to start
      setTimeout(() => {
        if (backendProcess && !backendProcess.killed) {
          console.log('✅ Backend service started successfully')
          resolve(true)
        } else {
          console.log('❌ Backend service failed to start')
          resolve(false)
        }
      }, 3000)
      
    } catch (error) {
      console.error('❌ Error starting backend service:', error)
      resolve(false)
    }
  })
}

const stopBackendService = (): void => {
  if (backendProcess && !backendProcess.killed) {
    console.log('🛑 Stopping backend service...')
    backendProcess.kill('SIGTERM')
    
    // Force kill after 5 seconds if it doesn't respond
    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        console.log('💀 Force killing backend service...')
        backendProcess.kill('SIGKILL')
      }
    }, 5000)
    
    backendProcess = null
  }
}

const createWindow = () => {
    const window = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        titleBarStyle: 'default',
        show: false,
        icon: path.join(__dirname, '../public/vite.svg')
    })

    // Show window when ready to prevent visual flash
    window.once('ready-to-show', () => {
        window.show()
    })

    // Load the app
    if (isDev) {
        window.loadURL("http://localhost:5173")
        // Open DevTools in development
        window.webContents.openDevTools()
    } else {
        window.loadFile(path.join(__dirname, '../dist/index.html'))
    }

    // Handle window closed
    window.on('closed', () => {
        // Dereference the window object
        window.destroy()
    })
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
    // Start the backend service first
    const backendStarted = await startBackendService()
    
    if (backendStarted) {
        console.log('🎯 Backend service ready, creating main window...')
        createWindow()
    } else {
        console.log('⚠️  Backend service failed to start, but continuing...')
        createWindow()
    }

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// Clean up when app is quitting
app.on('before-quit', () => {
    stopBackendService()
})

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
        // Open external URLs in default browser
        shell.openExternal(url)
        return { action: 'deny' }
    })
})

// IPC handlers for backend service management
ipcMain.handle('backend:get-status', () => {
    if (backendProcess && !backendProcess.killed) {
        return { status: 'running', port: backendPort, pid: backendProcess.pid }
    }
    return { status: 'stopped', port: backendPort }
})

ipcMain.handle('backend:restart', async () => {
    stopBackendService()
    await new Promise(resolve => setTimeout(resolve, 1000))
    return await startBackendService()
})

ipcMain.handle('backend:get-port', () => {
    return backendPort
})