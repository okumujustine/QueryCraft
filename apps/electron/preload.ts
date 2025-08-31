import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Backend service management
  backend: {
    getStatus: () => ipcRenderer.invoke('backend:get-status'),
    restart: () => ipcRenderer.invoke('backend:restart'),
    getPort: () => ipcRenderer.invoke('backend:get-port')
  },
  
  // General IPC communication
  sendMessage: (message: string) => ipcRenderer.send('message', message),
  
  onMessage: (callback: (message: string) => void) => {
    ipcRenderer.on('message', (_event, message) => callback(message))
  },
  
  invoke: (channel: string, data: unknown) => ipcRenderer.invoke(channel, data),
  
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  }
})

// Type declaration for the exposed API
declare global {
  interface Window {
    electronAPI: {
      backend: {
        getStatus: () => Promise<{ status: string; port: number; pid?: number }>
        restart: () => Promise<boolean>
        getPort: () => Promise<number>
      }
      sendMessage: (message: string) => void
      onMessage: (callback: (message: string) => void) => void
      invoke: (channel: string, data: unknown) => Promise<unknown>
      removeAllListeners: (channel: string) => void
    }
  }
}
