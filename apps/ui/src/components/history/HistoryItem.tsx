import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { QueryHistory } from "@/entities/all";
import { format } from "date-fns";
import { CheckCircle, Clock, Database, XCircle } from "lucide-react";

interface HistoryItemProps {
  item: QueryHistory;
  connectionName: string;
}

export default function HistoryItem({ item, connectionName }: HistoryItemProps) {
  const getStatusIcon = (status: string) => {
    return status === 'success' 
      ? <CheckCircle className="w-4 h-4 text-green-500" />
      : <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <TooltipProvider delayDuration={200}>
    <Tooltip>
        <TooltipTrigger asChild>
          <div className="p-3 border border-subtle rounded-lg flex items-center justify-between hover:bg-muted transition-colors cursor-default">
            <div className="flex items-center gap-3 overflow-hidden">
              {getStatusIcon(item.status)}
              <p className="font-mono text-xs text-gray-600 truncate">
                {item.sql}
              </p>
            </div>
            
            <div className="flex items-center gap-4 flex-shrink-0">
              <Badge variant="secondary" className="hidden md:flex items-center gap-1.5 font-normal">
                <Database className="w-3 h-3 text-gray-400" />
                {connectionName}
              </Badge>
              <Badge variant="secondary" className="hidden lg:flex items-center gap-1.5 font-normal">
                <Clock className="w-3 h-3 text-gray-400" />
                {item.execution_time}ms
              </Badge>
              <span className="text-xs text-gray-400">
                {item.created_date ? format(new Date(item.created_date), 'MMM d, HH:mm') : 'Unknown'}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xl">
          <pre className="font-mono text-xs p-2 whitespace-pre-wrap">{item.sql}</pre>
          {item.error_message && <p className="text-red-500 mt-2 text-xs">{item.error_message}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}