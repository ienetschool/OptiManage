import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Settings2,
  X
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface Column {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'number';
  filterOptions?: { value: string; label: string }[];
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
}

export interface EnhancedDataTableProps {
  data: any[];
  columns: Column[];
  title: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  onView?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  actions?: (row: any) => React.ReactNode;
  pageSize?: number;
  showPagination?: boolean;
  emptyMessage?: string;
  totalCount?: number;
}

export default function EnhancedDataTable({
  data,
  columns,
  title,
  searchPlaceholder = "Search...",
  isLoading = false,
  onRefresh,
  onView,
  onEdit,
  onDelete,
  actions,
  pageSize = 10,
  showPagination = true,
  emptyMessage = "No data found",
  totalCount
}: EnhancedDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pageSizeValue, setPageSizeValue] = useState(pageSize);

  // Filter data based on search term and column filters
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(row =>
        columns.some(col => {
          const value = row[col.key];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply column-specific filters
    Object.entries(filters).forEach(([columnKey, filterValue]) => {
      if (filterValue && filterValue !== 'all') {
        result = result.filter(row => {
          const value = row[columnKey];
          const column = columns.find(col => col.key === columnKey);
          
          if (column?.filterType === 'select') {
            return value === filterValue;
          } else {
            return value && value.toString().toLowerCase().includes(filterValue.toLowerCase());
          }
        });
      }
    });

    return result;
  }, [data, searchTerm, filters, columns]);

  // Sort data
  const sortedData = useMemo(() => {

    
    if (!sortColumn) {
      // Default sort by creation date (newest first) if available
      const hasCreatedAt = data.length > 0 && 'createdAt' in data[0];
      const hasDate = data.length > 0 && 'date' in data[0];
      const hasInvoiceDate = data.length > 0 && 'invoiceDate' in data[0];
      
      if (hasCreatedAt) {
        return [...filteredData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (hasInvoiceDate) {
        return [...filteredData].sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
      } else if (hasDate) {
        return [...filteredData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
      return filteredData;
    }

    const sorted = [...filteredData].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];
      
      // Handle date strings (convert to Date objects for proper comparison)
      if (sortColumn === 'date' || sortColumn === 'createdAt' || sortColumn === 'invoiceDate') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
        
        return sortDirection === 'asc' 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      
      // Handle Date objects
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      
      // Handle numbers (including string numbers)
      const aNum = parseFloat(aValue);
      const bNum = parseFloat(bValue);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // String comparison (case-insensitive)
      const aStr = (aValue?.toString() || '').toLowerCase();
      const bStr = (bValue?.toString() || '').toLowerCase();
      return sortDirection === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
    

    
    return sorted;
  }, [filteredData, sortColumn, sortDirection, data]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSizeValue);
  const startIndex = (currentPage - 1) * pageSizeValue;
  const paginatedData = showPagination 
    ? sortedData.slice(startIndex, startIndex + pageSizeValue)
    : sortedData;
  


  // Reset to first page when data changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortColumn, sortDirection]);

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (columnKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return null;
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {title}
            <Badge variant="outline" className="text-xs">
              {totalCount || sortedData.length} total
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              disabled={!searchTerm && Object.keys(filters).length === 0}
            >
              Clear
            </Button>
          </div>
          
          {/* Column-specific filters */}
          <div className="flex flex-wrap gap-2">
            {columns.filter(col => col.filterable).map(column => (
              <div key={column.key} className="min-w-[150px]">
                {column.filterType === 'select' && column.filterOptions ? (
                  <Select
                    value={filters[column.key] || ""}
                    onValueChange={(value) => handleFilterChange(column.key, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Filter ${column.title}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All {column.title}</SelectItem>
                      {column.filterOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder={`Filter ${column.title}`}
                    value={filters[column.key] || ""}
                    onChange={(e) => handleFilterChange(column.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead 
                    key={column.key}
                    className={`${column.sortable ? 'cursor-pointer hover:bg-muted' : ''} ${column.width || ''}`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.title}
                      {column.sortable && getSortIcon(column.key)}
                    </div>
                  </TableHead>
                ))}
                {(onView || onEdit || onDelete || actions) && (
                  <TableHead className="w-[100px]">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => (
                  <TableRow key={row.id || `row-${index}`}>
                    {columns.map((column) => {
                      const cellValue = row[column.key];
                      const renderedValue = column.render ? column.render(cellValue, row) : cellValue;
                      return (
                        <TableCell key={column.key}>
                          {renderedValue}
                        </TableCell>
                      );
                    })}
                    {(onView || onEdit || onDelete || actions) && (
                      <TableCell>
                        {actions ? (
                          actions(row)
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {onView && (
                                <DropdownMenuItem onClick={() => onView(row)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                              )}
                              {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(row)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {onDelete && (
                                <DropdownMenuItem onClick={() => onDelete(row)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Pagination */}
        {showPagination && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + pageSizeValue, sortedData.length)} of {sortedData.length} entries
              </span>
              <Select value={pageSizeValue.toString()} onValueChange={(value) => {
                setPageSizeValue(Number(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">per page</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
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