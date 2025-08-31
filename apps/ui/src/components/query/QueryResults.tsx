import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface QueryResultsProps {
  results: {
    columns: string[];
    rows: (string | number)[][];
  } | null;
  executionTime: number | null;
}

export default function QueryResults({ results, executionTime }: QueryResultsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    setCurrentPage(1);
  }, [results]);

  if (!results || !results.rows || results.rows.length === 0) return null;

  const totalPages = Math.ceil(results.rows.length / rowsPerPage);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRows = results.rows.slice(startIndex, endIndex);

  return (
    <div className="h-full flex flex-col bg-white border border-subtle rounded-lg">
      <div className="p-3 border-b border-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-normal">{results.rows.length} rows</Badge>
            <Badge variant="secondary" className="font-normal">{results.columns.length} columns</Badge>
        </div>
        <Badge variant="secondary" className="text-green-600 font-normal">{executionTime}ms</Badge>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-subtle">
              {results.columns.map((column, index) => (
                <TableHead key={index} className="text-gray-600 font-medium bg-muted whitespace-nowrap">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRows.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="border-subtle">
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="font-mono text-xs text-gray-800 whitespace-nowrap">
                    {String(cell)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="p-3 border-t border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Select value={String(rowsPerPage)} onValueChange={(value) => setRowsPerPage(Number(value))}>
                    <SelectTrigger className="w-28 h-9 bg-muted border-none">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {[10, 25, 50, 100].map(size => (
                            <SelectItem key={size} value={String(size)}>{size} rows</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handlePreviousPage} 
                        disabled={currentPage === 1}
                        className="h-9 w-9 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleNextPage} 
                        disabled={currentPage === totalPages}
                        className="h-9 w-9 p-0"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}