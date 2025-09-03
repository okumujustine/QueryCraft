import { contextBridge, ipcRenderer } from 'electron'


contextBridge.exposeInMainWorld('electronAPI', {
  
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

declare global {
  interface Window {
    electronAPI: {
      sendMessage: (message: string) => void
      onMessage: (callback: (message: string) => void) => void
      invoke: (channel: string, data: unknown) => Promise<unknown>
      removeAllListeners: (channel: string) => void
    }
  }
}
