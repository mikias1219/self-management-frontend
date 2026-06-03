"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  getRowId: (row: T) => string;
  className?: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  emptyMessage = "No records found",
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  getRowId,
  className,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
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
  return (
    <div className={cn("space-y-4", className)}>
      {onSearchChange && (
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pl-8"
          />
        </div>
      )}
      <div className="rounded-lg border bg-card shadow-sm">
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
            {!loading && data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              data.map((row) => (
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
    </div>
  );
}
