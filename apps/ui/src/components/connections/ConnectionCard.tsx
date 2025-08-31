import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DatabaseConnection } from "@/entities/all";
import { Circle, Database, Edit, MoreVertical, TestTube, Trash2 } from "lucide-react";

interface ConnectionCardProps {
  connection: DatabaseConnection;
  onEdit: (connection: DatabaseConnection) => void;
  onDelete: (connectionId: string) => void;
  onTest: (connection: DatabaseConnection) => void;
}

export default function ConnectionCard({ connection, onEdit, onDelete, onTest }: ConnectionCardProps) {
  const typeColors = {
    postgresql: 'text-blue-500',
    mysql: 'text-orange-500'
  };

  return (
    <div className="p-4 border border-subtle rounded-lg flex items-center justify-between hover:bg-muted transition-colors">
      <div className="flex items-center gap-4">
        <Database className={`w-5 h-5 ${typeColors[connection.type] || 'text-gray-400'}`} />
        <div className="flex items-center gap-3">
          <p className="font-medium text-gray-800">{connection.name}</p>
          <div className="flex items-center gap-1.5">
              <Circle className={`w-2 h-2 ${connection.is_active ? 'text-green-500 fill-current' : 'text-gray-300'}`} />
              <span className="text-xs text-gray-500">
                {connection.is_active ? 'Active' : 'Inactive'}
              </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-gray-400">{connection.host}:{connection.port}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onTest(connection)}>
              <TestTube className="w-4 h-4 mr-2" />
              Test Connection
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(connection)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => connection.id && onDelete(connection.id)}
              className="text-red-500"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}