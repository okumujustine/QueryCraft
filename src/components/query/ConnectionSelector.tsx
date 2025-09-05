import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatabaseConnection } from "@/entities/all";
import { Database } from "lucide-react";

interface ConnectionSelectorProps {
  connections: DatabaseConnection[];
  selectedConnection: DatabaseConnection | null;
  onConnectionChange: (connection: DatabaseConnection | null) => void;
}

export default function ConnectionSelector({ connections, selectedConnection, onConnectionChange }: ConnectionSelectorProps) {
  return (
    <Select
      value={selectedConnection?.id || ""}
      onValueChange={(value) => {
        const connection = connections.find(c => c.id === value);
        onConnectionChange(connection || null);
      }}
    >
      <SelectTrigger className="w-full md:w-64 bg-muted border-none">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-gray-400" />
          <SelectValue placeholder="Select connection" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-200 shadow-md">
        {connections.map((connection) => (
          <SelectItem key={connection.id} value={connection.id || ''} className="hover:bg-gray-50">
            {connection.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}