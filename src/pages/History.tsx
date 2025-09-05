import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatabaseConnection, QueryHistory } from "@/entities/all";
import { Clock, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";

import HistoryItem from "../components/history/HistoryItem";

export default function History() {
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<QueryHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [connectionFilter, setConnectionFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filterHistory = (): void => {
      let filtered = history;

      if (searchQuery) {
        filtered = filtered.filter((item: QueryHistory) => 
          item.sql?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (statusFilter !== "all") {
        filtered = filtered.filter((item: QueryHistory) => item.status === statusFilter);
      }
      if (connectionFilter !== "all") {
        filtered = filtered.filter((item: QueryHistory) => item.connection_id === connectionFilter);
      }
      setFilteredHistory(filtered);
    };

    filterHistory();
  }, [history, searchQuery, statusFilter, connectionFilter]);

  const loadData = async (): Promise<void> => {
    setIsLoading(true);
    const [historyData, connectionsData] = await Promise.all([
      QueryHistory.list('-created_date', 100),
      DatabaseConnection.list()
    ]);
    setHistory(historyData);
    setConnections(connectionsData);
    setIsLoading(false);
  };

  const getConnectionName = (connectionId: string): string => {
    const connection = connections.find((c: DatabaseConnection) => c.id === connectionId);
    return connection ? connection.name : 'Unknown';
  };

  return (
    <div className="h-full bg-white">
      <div className="px-6 pt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">History</h1>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search queries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted border-none"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-muted border-none">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-md">
              <SelectItem value="all" className="hover:bg-gray-50">All Status</SelectItem>
              <SelectItem value="success" className="hover:bg-gray-50">Success</SelectItem>
              <SelectItem value="error" className="hover:bg-gray-50">Error</SelectItem>
            </SelectContent>
          </Select>

          <Select value={connectionFilter} onValueChange={setConnectionFilter}>
            <SelectTrigger className="bg-muted border-none">
              <SelectValue placeholder="Filter by connection" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-md">
              <SelectItem value="all" className="hover:bg-gray-50">All Connections</SelectItem>
              {connections.map((connection) => (
                <SelectItem key={connection.id} value={connection.id || ''} className="hover:bg-gray-50">
                  {connection.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* History List */}
      <div className="px-6 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
          </div>
        ) : filteredHistory.length > 0 ? (
          <div className="space-y-2">
            {filteredHistory.map((item) => (
              <HistoryItem
                key={item.id}
                item={item}
                connectionName={getConnectionName(item.connection_id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-lg">
            <Clock className="w-10 h-10 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No query history found</h3>
            <p className="text-sm text-gray-500">Your past queries will be logged here.</p>
          </div>
        )}
      </div>
    </div>
  );
}