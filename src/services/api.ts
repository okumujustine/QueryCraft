import type { DatabaseConnection, QueryHistory } from '@/entities/all'

// Type declaration for Electron API
declare global {
  interface Window {
    electronAPI?: {
      backend: {
        getStatus: () => Promise<{ status: string; port: number; pid?: number }>
        restart: () => Promise<boolean>
        getPort: () => Promise<number>
      }
    }
  }
}

// API configuration
const API_CONFIG = {
  // In Electron, the backend runs on localhost:8000
  // In web development, you can change this to your actual backend URL
  baseURL: 'http://127.0.0.1:8000',
  timeout: 30000
}

// Helper function to make HTTP requests
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)
    throw error
  }
}

// API endpoints
export const api = {
  // Health check
  health: () => apiRequest<{ status: string; timestamp: string }>('/health'),
  
  // Database connections
  getConnections: () => apiRequest<DatabaseConnection[]>('/api/connections'),
  createConnection: (connection: Omit<DatabaseConnection, 'id'>) => 
    apiRequest<DatabaseConnection>('/api/connections', {
      method: 'POST',
      body: JSON.stringify(connection)
    }),
  updateConnection: (id: string, connection: Partial<DatabaseConnection>) => 
    apiRequest<DatabaseConnection>(`/api/connections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(connection)
    }),
  deleteConnection: (id: string) => 
    apiRequest<{ message: string }>(`/api/connections/${id}`, {
      method: 'DELETE'
    }),
  
  // Query execution
  executeQuery: (connectionId: string, sql: string, parameters?: Record<string, unknown>) => 
    apiRequest<{
      success: boolean
      data?: Record<string, unknown>[]
      columns?: string[]
      error?: string
      execution_time?: number
      row_count?: number
    }>('/api/query', {
      method: 'POST',
      body: JSON.stringify({
        connection_id: connectionId,
        sql,
        parameters
      })
    }),
  
  // Query history
  getHistory: () => apiRequest<QueryHistory[]>('/api/history'),
  
  // Database schema
  getSchema: (connectionId: string) => 
    apiRequest<{
      tables: Array<{
        name: string
        columns: Array<{
          name: string
          type: string
          nullable: boolean
          primary_key: boolean
        }>
      }>
    }>(`/api/schema/${connectionId}`)
}

// Backend service management (Electron only)
export const backendService = {
  getStatus: async () => {
    if (window.electronAPI?.backend) {
      return await window.electronAPI.backend.getStatus()
    }
    return { status: 'unknown', port: 8000 }
  },
  
  restart: async () => {
    if (window.electronAPI?.backend) {
      return await window.electronAPI.backend.restart()
    }
    return false
  },
  
  getPort: async () => {
    if (window.electronAPI?.backend) {
      return await window.electronAPI.backend.getPort()
    }
    return 8000
  }
}

// Check if running in Electron
export const isElectron = () => {
  return !!(window.electronAPI)
}

// Check if backend is available
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    await api.health()
    return true
  } catch {
    return false
  }
}
