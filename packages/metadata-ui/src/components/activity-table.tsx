"use client";

import type { DashboardTableRow, TableColumnMetadata } from "@repo/ui";
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
import type { ChangeEvent, ReactElement, ReactNode } from "react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { StatePanel } from "./state-panel";

type SortOrder = "asc" | "desc" | null;

const SKELETON_KEYS = [
  "metadata-table-skeleton-1",
  "metadata-table-skeleton-2",
  "metadata-table-skeleton-3",
  "metadata-table-skeleton-4",
  "metadata-table-skeleton-5",
] as const;

type ActivityTableProps = {
  columns?: readonly TableColumnMetadata[];
  defaultSortColumn?: string;
  defaultSortOrder?: Exclude<SortOrder, null>;
  emptyDescription?: string;
  emptyTitle?: string;
  error?: string | null;
  forbidden?: boolean;
  loading?: boolean;
  onRetry?: () => void;
  onRowClick?: (row: DashboardTableRow) => void;
  pageSize?: number;
  renderCell?: (
    column: TableColumnMetadata,
    value: DashboardTableRow[string],
    row: DashboardTableRow
  ) => ReactNode;
  rows: readonly DashboardTableRow[];
  searchAriaLabel?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  surface?: "contained" | "embedded";
};

const cn = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(" ");

const formatCellValue = (value: DashboardTableRow[string]): string => {
  if (value instanceof Date) {
    return value.toLocaleString();
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value ?? "-");
};

const inferColumnKind = (key: string): TableColumnMetadata["kind"] => {
  if (key === "email") {
    return "email";
  }

  if (key === "status") {
    return "status";
  }

  return "text";
};

const compareValues = (
  left: DashboardTableRow[string],
  right: DashboardTableRow[string]
): number => {
  if (left instanceof Date && right instanceof Date) {
    return left.getTime() - right.getTime();
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return formatCellValue(left).localeCompare(formatCellValue(right));
};

const normalizeColumns = (
  columns: readonly TableColumnMetadata[] | undefined,
  rows: readonly DashboardTableRow[]
): readonly TableColumnMetadata[] => {
  if (columns && columns.length > 0) {
    return columns;
  }

  const firstRow = rows[0];
  if (!firstRow) {
    return [];
  }

  return Object.keys(firstRow)
    .filter((key) => key !== "id")
    .map((key) => ({
      key,
      kind: inferColumnKind(key),
      label: key,
    }));
};

const getAriaSort = (
  columnKey: string,
  sortColumn: string | null,
  sortOrder: SortOrder
): "ascending" | "descending" | "none" => {
  if (sortColumn !== columnKey || sortOrder === null) {
    return "none";
  }

  return sortOrder === "asc" ? "ascending" : "descending";
};

export function ActivityTable({
  columns,
  defaultSortColumn,
  defaultSortOrder = "asc",
  emptyDescription = "There is no activity to display yet.",
  emptyTitle = "No activity found",
  error,
  forbidden = false,
  loading = false,
  onRetry,
  onRowClick,
  pageSize = 10,
  renderCell,
  rows,
  searchAriaLabel = "Search rows",
  searchPlaceholder = "Search records...",
  showSearch = true,
  surface = "contained",
}: ActivityTableProps): ReactElement {
  const resolvedColumns = useMemo(
    () => normalizeColumns(columns, rows),
    [columns, rows]
  );
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(
    defaultSortColumn ?? resolvedColumns[0]?.key ?? null
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortOrder);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setSortColumn(defaultSortColumn ?? resolvedColumns[0]?.key ?? null);
  }, [defaultSortColumn, resolvedColumns]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) =>
      resolvedColumns.some((column) =>
        formatCellValue(row[column.key]).toLowerCase().includes(normalizedQuery)
      )
    );
  }, [deferredQuery, resolvedColumns, rows]);

  const sortedRows = useMemo(() => {
    if (!(sortColumn && sortOrder)) {
      return filteredRows;
    }

    return [...filteredRows].sort((left, right) => {
      const result = compareValues(left[sortColumn], right[sortColumn]);
      return sortOrder === "asc" ? result : result * -1;
    });
  }, [filteredRows, sortColumn, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedRows = useMemo(() => {
    const offset = (page - 1) * pageSize;
    return sortedRows.slice(offset, offset + pageSize);
  }, [page, pageSize, sortedRows]);

  const handleSort = (columnKey: string): void => {
    setPage(1);

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

  if (forbidden) {
    return (
      <StatePanel
        description="You do not have permission to view this table."
        title="Access restricted"
        tone="warning"
      />
    );
  }

  if (error) {
    return (
      <StatePanel
        action={
          onRetry
            ? {
                label: "Retry",
                onClick: onRetry,
              }
            : undefined
        }
        description={error}
        title="Unable to load table"
        tone="danger"
      />
    );
  }

  if (loading) {
    return (
      <StatePanel
        description="Loading rows for this table."
        title="Loading"
        tone="info"
      >
        <div className="grid gap-3">
          {SKELETON_KEYS.map((key) => (
            <Skeleton className="h-10 w-full" key={key} />
          ))}
        </div>
      </StatePanel>
    );
  }

  if (sortedRows.length === 0) {
    return (
      <StatePanel
        description={emptyDescription}
        title={emptyTitle}
        tone="neutral"
      />
    );
  }

  return (
    <div className={cn(surface === "contained" && "space-y-4", "w-full")}>
      {showSearch ? (
        <div className="flex items-center gap-3">
          <Input
            aria-label={searchAriaLabel}
            className="max-w-sm"
            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
              setPage(1);
              setQuery(event.target.value);
            }}
            placeholder={searchPlaceholder}
            value={query}
          />
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <Table>
          <TableCaption>
            Page {page} of {totalPages}
          </TableCaption>
          <TableHeader>
            <TableRow>
              {resolvedColumns.map((column) => (
                <TableHead
                  aria-sort={getAriaSort(column.key, sortColumn, sortOrder)}
                  key={column.key}
                >
                  <button
                    className="inline-flex items-center gap-1 font-medium"
                    onClick={(): void => handleSort(column.key)}
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
            {pagedRows.map((row) => (
              <TableRow
                className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
                key={row.id}
                onClick={onRowClick ? (): void => onRowClick(row) : undefined}
              >
                {resolvedColumns.map((column) => {
                  const value = row[column.key];
                  const rendered = renderCell?.(column, value, row);

                  return (
                    <TableCell key={`${row.id}-${column.key}`}>
                      {rendered ?? formatCellValue(value)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
