import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  filterType?: "text" | "select" | "date";
  filterOptions?: { value: string; label: string; }[];
}

interface EnhancedDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  actions?: (item: T) => React.ReactNode;
  defaultSort?: { field: keyof T; direction: "asc" | "desc" };
  defaultPageSize?: number;
}

export function EnhancedDataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  searchPlaceholder = "Search...",
  isLoading = false,
  onRefresh,
  onExport,
  actions,
  defaultSort = { field: "createdAt" as keyof T, direction: "desc" },
  defaultPageSize = 20
}: EnhancedDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortField, setSortField] = useState<keyof T>(defaultSort.field);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSort.direction);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Apply filters, search, and sorting
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        filtered = filtered.filter(item => {
          const itemValue = String(item[key]).toLowerCase();
          return itemValue.includes(value.toLowerCase());
        });
      }
    });

    // Apply sorting - newest first by default
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle date strings
      if (typeof aValue === 'string' && aValue.includes('T')) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, searchTerm, filters, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = processedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc"); // Default to desc for new field (newest first)
    }
  };

  const handleFilterChange = (columnKey: string, value: string) => {
    setFilters(prev => ({ ...prev, [columnKey]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getSortIcon = (field: keyof T) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* Column Filters */}
          {columns.filter(col => col.filterable).map(column => (
            <Select
              key={String(column.key)}
              value={filters[String(column.key)] || "all"}
              onValueChange={(value) => handleFilterChange(String(column.key), value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={`Filter ${column.label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {column.label}</SelectItem>
                {column.filterOptions?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={String(column.key)}
                    className={column.sortable ? "cursor-pointer hover:bg-muted/50 select-none" : ""}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && getSortIcon(column.key)}
                    </div>
                  </TableHead>
                ))}
                {actions && <TableHead className="w-20">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center">
                    No data found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => (
                  <TableRow key={item.id || index}>
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>
                        {column.render
                          ? column.render(item[column.key], item)
                          : String(item[column.key] || "—")
                        }
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell>
                        {actions(item)}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, processedData.length)} of {processedData.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}