import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Spinner, SpinnerCustom } from "@/components/ui/spinner";

export function DataTable({
  data = [],
  columns = [],
  isLoading = false,
  loadingText = "Loading live records from Supabase...",
  searchPlaceholder = "Search records...",
  searchKey = "name",
  filterOptions = [],
  onView,
  onEdit,
  onDelete,
  onAdd,
  addLabel = "Add Record",
  onRefresh,
  customActions,
  emptyTitle = "No records found",
  emptyDescription = "There are no entries matching your current filters.",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtered & Searched Data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((item) => {
        if (typeof searchKey === "function") {
          return searchKey(item, q);
        }
        if (Array.isArray(searchKey)) {
          return searchKey.some((k) =>
            String(item[k] || "")
              .toLowerCase()
              .includes(q)
          );
        }
        return String(item[searchKey] || "")
          .toLowerCase()
          .includes(q);
      });
    }

    // Category / Status filter
    if (selectedFilter !== "all") {
      result = result.filter((item) => {
        return (
          item.status === selectedFilter ||
          item.category_id === selectedFilter ||
          item.category === selectedFilter ||
          item.tag === selectedFilter ||
          (selectedFilter === "emergency" && item.is_emergency)
        );
      });
    }

    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (typeof aVal === "string") {
          aVal = aVal.toLowerCase();
          bVal = (bVal || "").toString().toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, selectedFilter, sortConfig, searchKey]);

  // Pagination calculation
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (key) => {
    if (!key) return;
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="space-y-4">
      {/* Search, Filters, and Add Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-9 text-xs sm:text-sm bg-white"
            />
          </div>

          {filterOptions.length > 0 && (
            <Select
              value={selectedFilter}
              onValueChange={(val) => {
                setSelectedFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[150px] sm:w-[170px] h-9 text-xs sm:text-sm bg-white">
                <div className="flex items-center gap-1.5 truncate">
                  <Filter className="h-3.5 w-3.5 text-slate-500" />
                  <SelectValue placeholder="All Categories" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Records</SelectItem>
                {filterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-white text-slate-600 hover:text-slate-900 shrink-0"
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-[#223f6b]" : ""}`} />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {customActions}
          {onAdd && (
            <Button
              onClick={onAdd}
              className="h-9 px-3.5 gap-1.5 bg-[#223f6b] hover:bg-[#16264a] text-white text-xs sm:text-sm shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>{addLabel}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 border-b border-slate-200/80">
              {columns.map((col, idx) => (
                <TableHead
                  key={col.key || idx}
                  className={`text-xs font-semibold text-slate-600 uppercase tracking-wider ${col.sortable ? "cursor-pointer select-none hover:text-slate-900" : ""
                    } ${col.className || ""}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-400">
                        {sortConfig.key === col.key ? (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5 text-[#223f6b]" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-[#223f6b]" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
              {(onView || onEdit || onDelete) && (
                <TableHead className="w-16 text-right pr-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)}
                  className="h-48 text-center"
                >
                  <SpinnerCustom text={loadingText} />
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)}
                  className="h-40 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-1 text-slate-500 py-6">
                    <p className="text-sm font-semibold text-slate-700">{emptyTitle}</p>
                    <p className="text-xs text-slate-400 max-w-sm">{emptyDescription}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <TableRow
                  key={row.id || rowIdx}
                  className="hover:bg-slate-50/70 border-b border-slate-100 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <TableCell key={col.key || colIdx} className={col.className || ""}>
                      {col.render ? col.render(row) : row[col.key]}
                    </TableCell>
                  ))}

                  {(onView || onEdit || onDelete) && (
                    <TableCell className="text-right pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-white">
                          {onView && (
                            <DropdownMenuItem
                              onClick={() => onView(row)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Eye className="h-3.5 w-3.5 text-slate-500" />
                              View Details
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem
                              onClick={() => onEdit(row)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                              Edit Record
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDelete(row)}
                                className="gap-2 cursor-pointer text-xs text-red-600 focus:text-red-700 focus:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination & Records Per Page Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/40 text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <span className="font-semibold text-slate-800">
              {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>
            <span>to</span>
            <span className="font-semibold text-slate-800">
              {Math.min(currentPage * pageSize, totalRecords)}
            </span>
            <span>of</span>
            <span className="font-semibold text-slate-800">{totalRecords}</span>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-7 w-16 text-xs bg-white">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 p-0 bg-white"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isLoading}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="px-2 font-medium text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 p-0 bg-white"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isLoading}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

