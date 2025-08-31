import { Button } from "@/components/ui/button";
import { DatabaseConnection } from "@/entities/all";
import { Database, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import ConnectionCard from "../components/connections/ConnectionCard";
import ConnectionDialog from "../components/connections/ConnectionDialog";

export default function Connections() {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [editingConnection, setEditingConnection] = useState<DatabaseConnection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async (): Promise<void> => {
    setIsLoading(true);
    const fetchedConnections = await DatabaseConnection.list();
    setConnections(fetchedConnections);
    setIsLoading(false);
  }; 

  const handleSaveConnection = async (connectionData: DatabaseConnection): Promise<void> => {
    if (editingConnection) {
      await DatabaseConnection.update(editingConnection.id!, connectionData);
    } else {
      await DatabaseConnection.create(connectionData);
    }
    setShowDialog(false);
    setEditingConnection(null);
    loadConnections();
  };

  const handleEditConnection = (connection: DatabaseConnection): void => {
    setEditingConnection(connection);
    setShowDialog(true);
  };

  const handleDeleteConnection = async (connectionId: string): Promise<void> => {
    await DatabaseConnection.delete(connectionId);
    loadConnections();
  };

  const handleTestConnection = async (connection: DatabaseConnection): Promise<void> => {
    alert(`Testing connection to ${connection.name}...`);
  };

  return (
    <div className="h-full bg-white p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Connections</h1>
        <Button
          onClick={() => setShowDialog(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Connection
        </Button>
      </div>

      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
          </div>
        ) : connections.length > 0 ? (
          <div className="space-y-3">
            {connections.map((connection) => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                onEdit={handleEditConnection}
                onDelete={handleDeleteConnection}
                onTest={handleTestConnection}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-lg">
            <Database className="w-10 h-10 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No connections yet</h3>
            <p className="text-sm text-gray-500 mb-6">Create your first database connection to get started.</p>
            <Button
              onClick={() => setShowDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Connection
            </Button>
          </div>
        )}
      </div>

      <ConnectionDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        connection={editingConnection}
        onSave={handleSaveConnection}
        onCancel={() => {
          setShowDialog(false);
          setEditingConnection(null);
        }}
      />
    </div>
  );
}