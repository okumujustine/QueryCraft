
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DatabaseConnection, QueryHistory, SavedQuery } from "@/entities/all";
import { AlertCircle, Database, Loader2, PanelLeft, Play, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import ConnectionSelector from "../components/query/ConnectionSelector";
import QueryResults from "../components/query/QueryResults";
import SaveQueryDialog from "../components/query/SaveQueryDialog";
import SchemaViewer from "../components/query/SchemaViewer";

export default function QueryEditor() {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<DatabaseConnection | null>(null);
  const [query, setQuery] = useState("-- Write your SQL query here\nSELECT * FROM users LIMIT 10;");
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<{ columns: string[]; rows: (string | number)[][] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const [queryPanelHeight, setQueryPanelHeight] = useState(60);
  const [isVerticalResizing, setIsVerticalResizing] = useState(false);
  
  const [schemaPanelWidth, setSchemaPanelWidth] = useState(280);
  const [isHorizontalResizing, setIsHorizontalResizing] = useState(false);
  const [showSchemaPanel, setShowSchemaPanel] = useState(true);
  
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Vertical Resizing Handlers
  const handleVerticalMouseDown = (e: React.MouseEvent): void => {
    e.preventDefault();
    setIsVerticalResizing(true);
  };

  const handleVerticalMouseMove = (e: MouseEvent): void => {
    if (!isVerticalResizing || !editorContainerRef.current) return;
    const rect = editorContainerRef.current.getBoundingClientRect();
    const percentage = Math.max(20, Math.min(80, ((e.clientY - rect.top) / rect.height) * 100));
    setQueryPanelHeight(percentage);
  };
  
  // Horizontal Resizing Handlers
  const handleHorizontalMouseDown = (e: React.MouseEvent): void => {
    e.preventDefault();
    setIsHorizontalResizing(true);
  };
  
  const handleHorizontalMouseMove = (e: MouseEvent): void => {
    if (!isHorizontalResizing || !pageContainerRef.current) return;
    const rect = pageContainerRef.current.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;
    setSchemaPanelWidth(Math.max(200, Math.min(500, newWidth)));
  };

  const handleMouseUp = (): void => {
    setIsVerticalResizing(false);
    setIsHorizontalResizing(false);
  };

  useEffect(() => {
    const isResizing = isVerticalResizing || isHorizontalResizing;
    if (isResizing) {
      document.addEventListener('mousemove', isVerticalResizing ? handleVerticalMouseMove : handleHorizontalMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isVerticalResizing ? 'row-resize' : 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleVerticalMouseMove);
      document.removeEventListener('mousemove', handleHorizontalMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleVerticalMouseMove);
      document.removeEventListener('mousemove', handleHorizontalMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isVerticalResizing, isHorizontalResizing]);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async (): Promise<void> => {
    const fetchedConnections = await DatabaseConnection.list();
    const activeConnections = fetchedConnections.filter((conn: DatabaseConnection) => conn.is_active);
    setConnections(activeConnections);
    if (activeConnections.length > 0 && !selectedConnection) {
      setSelectedConnection(activeConnections[0]);
    }
  };

  const executeQuery = async (): Promise<void> => {
    if (!selectedConnection || !query.trim()) return;
    setIsExecuting(true);
    setError(null);
    setResults(null);
    const startTime = Date.now();
    try {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      const mockColumns = ['id', 'first_name', 'last_name', 'email', 'gender', 'ip_address', 'country', 'company', 'job_title', 'last_login'];
      const mockRows = [];
      const genders = ['Male', 'Female', 'Non-binary', 'Agender'];
      const countries = ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'France'];
      for (let i = 1; i <= 100; i++) {
          mockRows.push([ i, `FirstName${i}`, `LastName${i}`, `user${i}@example.com`, genders[i % genders.length], `192.168.1.${i}`, countries[i % countries.length], `Company ${(i % 10) + 1}`, 'Software Engineer', new Date(Date.now() - Math.random() * 10000000000).toISOString() ]);
      }
      const mockResults = { columns: mockColumns, rows: mockRows };
      const endTime = Date.now();
      const execTime = endTime - startTime;
      setResults(mockResults);
      setExecutionTime(execTime);
      await QueryHistory.create({ sql: query, connection_id: selectedConnection.id, execution_time: execTime, row_count: mockResults.rows.length, status: "success" });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      await QueryHistory.create({ sql: query, connection_id: selectedConnection.id, execution_time: Date.now() - startTime, row_count: 0, status: "error", error_message: errorMessage });
    }
    setIsExecuting(false);
  };

  const handleSaveQuery = async (name: string, description: string) => {
    if (!selectedConnection) return;
    await SavedQuery.create({ name, sql: query, connection_id: selectedConnection.id, description, last_executed: new Date().toISOString() });
    setShowSaveDialog(false);
  };

  const handleSchemaItemSelect = (text: string) => {
    setQuery(prev => `${prev} ${text}`);
  };

  return (
    <div ref={pageContainerRef} className="h-screen flex bg-muted overflow-hidden">
      <style>{`
        .vertical-resize-handle { position: absolute; bottom: -2px; left: 0; right: 0; height: 4px; cursor: row-resize; z-index: 10; }
        .vertical-resize-handle:hover { background: #e2e8f0; }
        .vertical-resize-handle.resizing { background: #3b82f6; }
        .horizontal-resize-handle { position: absolute; right: -2px; top: 0; bottom: 0; width: 4px; cursor: col-resize; z-index: 10; }
        .horizontal-resize-handle:hover { background: #e2e8f0; }
        .horizontal-resize-handle.resizing { background: #3b82f6; }
      `}</style>
      
      {showSchemaPanel && (
        <div className="relative flex-shrink-0" style={{ width: schemaPanelWidth, height: '100vh' }}>
          <SchemaViewer connection={selectedConnection} onSelectItem={handleSchemaItemSelect} />
          <div 
            className={`horizontal-resize-handle ${isHorizontalResizing ? 'resizing' : ''}`}
            onMouseDown={handleHorizontalMouseDown} 
          />
        </div>
      )}

      <div ref={editorContainerRef} className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <div className="relative flex flex-col bg-white min-h-0 overflow-hidden" style={{ height: `${queryPanelHeight}%` }}>
          <div className="p-4 border-b border-subtle flex justify-between items-center flex-shrink-0 min-w-0 overflow-hidden">
            <div className="flex items-center gap-3 min-w-0 overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSchemaPanel(!showSchemaPanel)}
                className="flex-shrink-0"
              >
                <PanelLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-0 overflow-hidden">
                <ConnectionSelector 
                  connections={connections}
                  selectedConnection={selectedConnection}
                  onConnectionChange={setSelectedConnection}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button
                variant="ghost"
                onClick={() => setShowSaveDialog(true)}
                disabled={!query.trim() || !selectedConnection}
                className="hidden sm:flex"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                onClick={executeQuery}
                disabled={isExecuting || !selectedConnection || !query.trim()}
                className="sm:w-40 w-auto"
              >
                {isExecuting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span className="ml-2 hidden sm:inline">{isExecuting ? 'Running...' : 'Run Query'}</span>
              </Button>
            </div>
          </div>
          <div className="flex-1 p-4 min-h-0 overflow-hidden">
            <Textarea 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="-- Write your SQL query here..." 
              className="font-mono text-sm w-full h-full resize-none border-0 focus-visible:ring-0 p-2" 
              disabled={isExecuting} 
            />
          </div>
          <div 
            className={`vertical-resize-handle ${isVerticalResizing ? 'resizing' : ''}`}
            onMouseDown={handleVerticalMouseDown} 
          />
        </div>

        <div className="flex flex-col bg-muted min-h-0 overflow-hidden" style={{ height: `${100 - queryPanelHeight}%` }}>
          <div className="flex-1 p-4 min-h-0 overflow-hidden">
            {error && (
              <div className="h-full flex items-center justify-center">
                <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                  <AlertCircle className="h-4 w-4" /> 
                  <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
                </Alert>
              </div>
            )}
            {results && !error && (
              <div className="h-full">
                <QueryResults results={results} executionTime={executionTime} />
              </div>
            )}
            {!results && !error && !isExecuting && (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Database className="w-8 h-8 mx-auto mb-2" /> 
                  <p className="text-sm">Results will appear here</p>
                </div>
              </div>
            )}
            {isExecuting && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Loader2 className="w-6 h-6 mx-auto mb-4 animate-spin" /> 
                  <p className="text-sm">Executing query...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SaveQueryDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSave={handleSaveQuery}
      />
    </div>
  );
}
