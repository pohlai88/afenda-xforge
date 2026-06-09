"use client";

import {
  Button,
  Input,
  Skeleton,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import type { DashboardTableRow, TableColumnMetadata } from "@repo/ui";
import type { ChangeEvent, ReactElement, ReactNode } from "react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

type SortOrder = "asc" | "desc" | null;

type ActivityTableProps = {
  columns?: readonly TableColumnMetadata[];
  defaultSortColumn?: string;
  defaultSortOrder?: Exclude<SortOrder, null>;
  emptyDescription?: string;
  emptyTitle?: string;
  pageSize?: number;
  renderCell?: (
    column: TableColumnMetadata,
    value: DashboardTableRow[string],
    row: DashboardTableRow,
  ) => ReactNode;
  rows: readonly DashboardTableRow[];
  searchAriaLabel?: string;
  searchPlaceholder?: string;
};

const SKELETON_KEYS = [
  "audit-table-skeleton-1",
  "audit-table-skeleton-2",
  "audit-table-skeleton-3",
] as const;

const formatCellValue = (value: DashboardTableRow[string]): string => {
  if (value instanceof Date) {
    return value.toLocaleString();
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value ?? "-");
};

const compareValues = (
  left: DashboardTableRow[string],
  right: DashboardTableRow[string],
): number => {
  if (left instanceof Date && right instanceof Date) {
    return left.getTime() - right.getTime();
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return formatCellValue(left).localeCompare(formatCellValue(right));
};

export function ActivityTable({
  columns = [],
  defaultSortColumn,
  defaultSortOrder = "asc",
  emptyDescription = "There are no rows to display.",
  emptyTitle = "No records found",
  pageSize = 10,
  renderCell,
  rows,
  searchAriaLabel = "Search rows",
  searchPlaceholder = "Search...",
}: ActivityTableProps): ReactElement {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(
    defaultSortColumn ?? columns[0]?.key ?? null,
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortOrder);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setSortColumn(defaultSortColumn ?? columns[0]?.key ?? null);
  }, [columns, defaultSortColumn]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) =>
      columns.some((column) =>
        formatCellValue(row[column.key]).toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [columns, deferredQuery, rows]);

  const sortedRows = useMemo(() => {
    if (!sortColumn || !sortOrder) {
      return filteredRows;
    }

    return [...filteredRows].sort((left, right) => {
      const result = compareValues(left[sortColumn], right[sortColumn]);
      return sortOrder === "asc" ? result : -result;
    });
  }, [filteredRows, sortColumn, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [deferredQuery, pageSize, sortColumn, sortOrder]);

  const pagedRows = useMemo(() => {
    const offset = (page - 1) * pageSize;
    return sortedRows.slice(offset, offset + pageSize);
  }, [page, pageSize, sortedRows]);

  const toggleSort = (columnKey: string): void => {
    if (sortColumn !== columnKey) {
      setSortColumn(columnKey);
      setSortOrder("asc");
      return;
    }

    setSortOrder((current) => {
      if (current === "asc") {
        return "desc";
      }

      if (current === "desc") {
        return null;
      }

      return "asc";
    });
  };

  const renderSortIcon = (columnKey: string): ReactElement | null => {
    if (sortColumn !== columnKey || !sortOrder) {
      return null;
    }

    return <span aria-hidden>{sortOrder === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <div className="space-y-4">
      <Input
        aria-label={searchAriaLabel}
        className="max-w-sm"
        onChange={(event: ChangeEvent<HTMLInputElement>): void =>
          setQuery(event.target.value)
        }
        placeholder={searchPlaceholder}
        value={query}
      />

      {rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-card/80 p-8 text-center shadow-sm">
          <h3 className="font-medium text-lg">{emptyTitle}</h3>
          <p className="mt-2 text-muted-foreground text-sm">{emptyDescription}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>
              Page {page} of {totalPages}
            </TableCaption>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key}>
                    <button
                      className="inline-flex items-center gap-1 font-medium"
                      onClick={(): void => toggleSort(column.key)}
                      type="button"
                    >
                      {column.label}
                      {renderSortIcon(column.key)}
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRows.length === 0
                ? SKELETON_KEYS.map((key) => (
                    <TableRow key={key}>
                      <TableCell colSpan={columns.length}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : pagedRows.map((row) => (
                    <TableRow key={row.id}>
                      {columns.map((column) => {
                        const value = row[column.key];
                        return (
                          <TableCell key={`${row.id}-${column.key}`}>
                            {renderCell?.(column, value, row) ?? formatCellValue(value)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2">
          <Button
            disabled={page === 1}
            onClick={(): void => setPage((current) => current - 1)}
            size="sm"
            type="button"
            variant="outline"
          >
            Previous
          </Button>
          <Button
            disabled={page === totalPages}
            onClick={(): void => setPage((current) => current + 1)}
            size="sm"
            type="button"
            variant="outline"
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
