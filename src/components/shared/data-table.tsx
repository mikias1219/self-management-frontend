"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { RowActions } from "@/components/shared/row-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyTitle?: string;
  emptyAction?: React.ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  getRowId: (row: T) => string;
  className?: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  /** Server-side pagination — parent controls page/limit and provides total. */
  serverSide?: boolean;
  total?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  emptyMessage = "No records found",
  emptyTitle,
  emptyAction,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  getRowId,
  className,
  onEdit,
  onDelete,
  pageSize: defaultPageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  serverSide,
  total: serverTotal,
  page: controlledPage,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<T>) {
  const [clientPage, setClientPage] = useState(0);
  const [clientPageSize, setClientPageSize] = useState(defaultPageSize);

  const pageSize = serverSide ? defaultPageSize : clientPageSize;
  const safePage = serverSide
    ? Math.max(0, (controlledPage ?? 1) - 1)
    : Math.min(clientPage, Math.max(0, Math.ceil(data.length / pageSize) - 1));

  const totalRecords = serverSide ? (serverTotal ?? 0) : data.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const pageData = useMemo(() => {
    if (serverSide) return data;
    return data.slice(safePage * pageSize, safePage * pageSize + pageSize);
  }, [data, safePage, pageSize, serverSide]);

  const hasActions = !!(onEdit || onDelete);
  const allColumns = hasActions
    ? [
        ...columns,
        {
          key: "_actions",
          header: "",
          cell: (row: T) => (
            <RowActions
              onEdit={onEdit ? () => onEdit(row) : undefined}
              onDelete={onDelete ? () => onDelete(row) : undefined}
            />
          ),
          className: "w-[80px]",
        } satisfies DataTableColumn<T>,
      ]
    : columns;

  const goToPage = (next: number) => {
    const clamped = Math.max(0, Math.min(next, totalPages - 1));
    if (serverSide) {
      onPageChange?.(clamped + 1);
    } else {
      setClientPage(clamped);
    }
  };

  const changePageSize = (size: number) => {
    if (serverSide) {
      onPageSizeChange?.(size);
      onPageChange?.(1);
    } else {
      setClientPageSize(size);
      setClientPage(0);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {onSearchChange && (
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (!serverSide) setClientPage(0);
              else onPageChange?.(1);
            }}
            className="h-8 pl-8"
          />
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {allColumns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {allColumns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!loading && totalRecords === 0 && (
              <TableRow>
                <TableCell colSpan={allColumns.length} className="p-0">
                  <EmptyState
                    title={emptyTitle ?? emptyMessage}
                    description={
                      emptyTitle ? emptyMessage : "Try adjusting your filters."
                    }
                    action={emptyAction}
                    className="border-0 bg-transparent"
                  />
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              pageData.map((row) => (
                <TableRow key={getRowId(row)}>
                  {allColumns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      {!loading && totalRecords > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground">
            {totalRecords} record{totalRecords === 1 ? "" : "s"}
            {totalPages > 1 && ` · Page ${safePage + 1} of ${totalPages}`}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Rows
              <select
                className="h-8 rounded-md border bg-background px-2 text-sm"
                value={pageSize}
                onChange={(e) => changePageSize(Number(e.target.value))}
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 0}
              onClick={() => goToPage(safePage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages - 1}
              onClick={() => goToPage(safePage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
