
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { DatabaseConnection } from "@/entities/all";
import { Database, KeyRound, Loader2, Search, Table, Type } from "lucide-react";
import { useEffect, useState } from "react";

interface Column {
  name: string;
  type: string;
  is_pk?: boolean;
}

interface TableData {
  name: string;
  columns: Column[];
}

interface SchemaData {
  tables: TableData[];
}

interface SchemaViewerProps {
  connection: DatabaseConnection | null;
  onSelectItem: (item: string) => void;
}

const mockSchemaData = {
  'prod-db-1': {
    tables: [
      { name: 'users', columns: [
          { name: 'id', type: 'integer', is_pk: true },
          { name: 'first_name', type: 'varchar(255)' },
          { name: 'last_name', type: 'varchar(255)' },
          { name: 'email', type: 'varchar(255)' },
          { name: 'created_at', type: 'timestamp' },
      ]},
      { name: 'products', columns: [
          { name: 'id', type: 'integer', is_pk: true },
          { name: 'name', type: 'varchar(255)' },
          { name: 'description', type: 'text' },
          { name: 'price', type: 'decimal(10, 2)' },
      ]},
    ],
  },
  'staging-db-1': {
    tables: [
      { name: 'customers', columns: [
          { name: 'customer_id', type: 'uuid', is_pk: true },
          { name: 'full_name', type: 'string' },
      ]},
    ],
  }
} as Record<string, SchemaData>;

export default function SchemaViewer({ connection, onSelectItem }: SchemaViewerProps) {
  const [schema, setSchema] = useState<SchemaData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSchema = async () => {
      if (!connection) {
        setSchema(null);
        return;
      }
      setIsLoading(true);
      
      setTimeout(() => {
        const mockKey = (connection.id as keyof typeof mockSchemaData) || 'prod-db-1';
        setSchema(mockSchemaData[mockKey] || mockSchemaData['prod-db-1']);
        setIsLoading(false);
      }, 500);
    };
    
    fetchSchema();
  }, [connection]);

  const filteredTables = schema?.tables?.filter((table: TableData) =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.columns.some((col: Column) => col.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const renderItem = (name: string, type: string, isTable = false) => (
    <button
      className="w-full text-left px-3 py-1.5 rounded text-sm hover:bg-muted transition-colors flex items-center gap-2"
      onClick={() => onSelectItem(name)}
    >
      {isTable ? (
        <Table className="w-3.5 h-3.5 text-blue-500" />
      ) : (
        <Type className="w-3.5 h-3.5 text-gray-400" />
      )}
      <span className="font-medium">{name}</span>
      <span className="text-xs text-gray-400 ml-auto">{type}</span>
    </button>
  );

  if (!connection) {
    return (
      <div className="p-4 text-center text-gray-400">
        <Database className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Select a connection to view schema</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-gray-400" />
        <p className="text-sm text-gray-400">Loading schema...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-subtle">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search tables & columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-8 bg-muted border-none"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        {filteredTables.length > 0 ? (
          <Accordion type="multiple" className="space-y-1">
            {filteredTables.map((table: TableData) => (
              <AccordionItem key={table.name} value={table.name} className="border-none">
                <AccordionTrigger className="px-2 py-1 text-sm hover:bg-muted rounded font-medium">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-blue-500" />
                    {table.name}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-6 space-y-0.5">
                  {table.columns.map((col: Column) => (
                    <div key={col.name} className="flex items-center gap-1.5 py-0.5">
                      {col.is_pk && <KeyRound className="w-3 h-3 text-yellow-500" />}
                      {renderItem(col.name, col.type)}
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="p-4 text-center text-gray-400">
            <Search className="w-6 h-6 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No tables found</p>
          </div>
        )}
      </div>
    </div>
  );
}
