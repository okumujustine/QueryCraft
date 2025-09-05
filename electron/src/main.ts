import { app, BrowserWindow, shell, ipcMain } from "electron"
import path from "path"

const isDev = process.env.NODE_ENV === 'development'

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
        window.loadURL("http://localhost:6295")
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


// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
        // Open external URLs in default browser
        shell.openExternal(url)
        return { action: 'deny' }
    })
})