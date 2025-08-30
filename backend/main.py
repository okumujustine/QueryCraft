from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import sqlite3
import json
from datetime import datetime

app = FastAPI(
    title="QueryCraft API",
    description="Backend API for QueryCraft database client",
    version="1.0.0"
)

# CORS middleware for web development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class DatabaseConnection(BaseModel):
    id: Optional[str] = None
    name: str
    host: str
    port: int
    database: str
    username: str
    password: str
    type: str = "postgresql"
    is_active: bool = True

class QueryRequest(BaseModel):
    connection_id: str
    sql: str
    parameters: Optional[Dict[str, Any]] = None

class QueryResponse(BaseModel):
    success: bool
    data: Optional[List[Dict[str, Any]]] = None
    columns: Optional[List[str]] = None
    error: Optional[str] = None
    execution_time: Optional[float] = None
    row_count: Optional[int] = None

# In-memory storage for demo (replace with actual database)
connections_db: Dict[str, DatabaseConnection] = {}
query_history: List[Dict[str, Any]] = []

@app.get("/")
async def root():
    return {"message": "QueryCraft API is running!", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/connections", response_model=List[DatabaseConnection])
async def get_connections():
    """Get all database connections"""
    return list(connections_db.values())

@app.post("/api/connections", response_model=DatabaseConnection)
async def create_connection(connection: DatabaseConnection):
    """Create a new database connection"""
    import uuid
    connection.id = str(uuid.uuid4())
    connections_db[connection.id] = connection
    return connection

@app.get("/api/connections/{connection_id}", response_model=DatabaseConnection)
async def get_connection(connection_id: str):
    """Get a specific database connection"""
    if connection_id not in connections_db:
        raise HTTPException(status_code=404, detail="Connection not found")
    return connections_db[connection_id]

@app.put("/api/connections/{connection_id}", response_model=DatabaseConnection)
async def update_connection(connection_id: str, connection: DatabaseConnection):
    """Update a database connection"""
    if connection_id not in connections_db:
        raise HTTPException(status_code=404, detail="Connection not found")
    connection.id = connection_id
    connections_db[connection_id] = connection
    return connection

@app.delete("/api/connections/{connection_id}")
async def delete_connection(connection_id: str):
    """Delete a database connection"""
    if connection_id not in connections_db:
        raise HTTPException(status_code=404, detail="Connection not found")
    del connections_db[connection_id]
    return {"message": "Connection deleted successfully"}

@app.post("/api/query", response_model=QueryResponse)
async def execute_query(request: QueryRequest):
    """Execute a SQL query"""
    import time
    
    if request.connection_id not in connections_db:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    connection = connections_db[request.connection_id]
    start_time = time.time()
    
    try:
        # Demo: Simulate query execution
        # In production, you would connect to the actual database
        if "SELECT" in request.sql.upper():
            # Simulate successful SELECT query
            mock_data = [
                {"id": 1, "name": "John Doe", "email": "john@example.com"},
                {"id": 2, "name": "Jane Smith", "email": "jane@example.com"}
            ]
            columns = list(mock_data[0].keys()) if mock_data else []
            
            execution_time = time.time() - start_time
            
            # Store in history
            history_entry = {
                "id": str(len(query_history) + 1),
                "connection_id": request.connection_id,
                "sql": request.sql,
                "status": "success",
                "execution_time": execution_time,
                "timestamp": datetime.now().isoformat()
            }
            query_history.append(history_entry)
            
            return QueryResponse(
                success=True,
                data=mock_data,
                columns=columns,
                execution_time=execution_time,
                row_count=len(mock_data)
            )
        else:
            # Simulate other query types
            execution_time = time.time() - start_time
            
            history_entry = {
                "id": str(len(query_history) + 1),
                "connection_id": request.connection_id,
                "sql": request.sql,
                "status": "success",
                "execution_time": execution_time,
                "timestamp": datetime.now().isoformat()
            }
            query_history.append(history_entry)
            
            return QueryResponse(
                success=True,
                execution_time=execution_time,
                row_count=0
            )
            
    except Exception as e:
        execution_time = time.time() - start_time
        
        history_entry = {
            "id": str(len(query_history) + 1),
            "connection_id": request.connection_id,
            "sql": request.sql,
            "status": "error",
            "error": str(e),
            "execution_time": execution_time,
            "timestamp": datetime.now().isoformat()
        }
        query_history.append(history_entry)
        
        return QueryResponse(
            success=False,
            error=str(e),
            execution_time=execution_time
        )

@app.get("/api/history")
async def get_query_history():
    """Get query execution history"""
    return query_history

@app.get("/api/schema/{connection_id}")
async def get_schema(connection_id: str):
    """Get database schema for a connection"""
    if connection_id not in connections_db:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    # Demo: Return mock schema
    # In production, you would query the actual database metadata
    mock_schema = {
        "tables": [
            {
                "name": "users",
                "columns": [
                    {"name": "id", "type": "INTEGER", "nullable": False, "primary_key": True},
                    {"name": "name", "type": "VARCHAR(255)", "nullable": False},
                    {"name": "email", "type": "VARCHAR(255)", "nullable": False},
                    {"name": "created_at", "type": "TIMESTAMP", "nullable": False}
                ]
            },
            {
                "name": "orders",
                "columns": [
                    {"name": "id", "type": "INTEGER", "nullable": False, "primary_key": True},
                    {"name": "user_id", "type": "INTEGER", "nullable": False},
                    {"name": "amount", "type": "DECIMAL(10,2)", "nullable": False},
                    {"name": "status", "type": "VARCHAR(50)", "nullable": False}
                ]
            }
        ]
    }
    
    return mock_schema

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
