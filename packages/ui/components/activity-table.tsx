"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Skeleton } from "@repo/design-system/components/ui/skeleton";
import { cn } from "@repo/design-system/lib/utils";
import type { DashboardTableRow, TableColumnMetadata } from "@repo/metadata";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ChangeEvent, ReactElement, ReactNode } from "react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { StatePanel } from "./state-panel";

type SortOrder = "asc" | "desc" | null;

type ActivityTableProps = {
  columns?: readonly TableColumnMetadata[];
  defaultSortOrder?: Exclude<SortOrder, null>;
  emptyDescription?: string;
  emptyTitle?: string;
  error?: string | null;
  forbidden?: boolean;
  loading?: boolean;
  onRetry?: () => void;
  onRowClick?: (row: DashboardTableRow) => void;
  pageSize?: number;
  rows: readonly DashboardTableRow[];
  searchAriaLabel?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  renderCell?: (
    column: TableColumnMetadata,
    value: DashboardTableRow[string],
    row: DashboardTableRow
  ) => ReactNode;
  defaultSortColumn?: string;
};

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

const compareDashboardValues = (
  leftValue: DashboardTableRow[string],
  rightValue: DashboardTableRow[string],
  sortOrder: Exclude<SortOrder, null>
): number => {
  if (leftValue instanceof Date && rightValue instanceof Date) {
    return sortOrder === "asc"
      ? leftValue.getTime() - rightValue.getTime()
      : rightValue.getTime() - leftValue.getTime();
  }

  const leftText = formatCellValue(leftValue);
  const rightText = formatCellValue(rightValue);

  if (leftText < rightText) {
    return sortOrder === "asc" ? -1 : 1;
  }

  if (leftText > rightText) {
    return sortOrder === "asc" ? 1 : -1;
  }

  return 0;
};

const getAriaSort = (
  sortColumn: string | null,
  sortOrder: SortOrder,
  columnKey: string
): "ascending" | "descending" | "none" => {
  if (sortColumn !== columnKey) {
    return "none";
  }

  if (sortOrder === "asc") {
    return "ascending";
  }

  if (sortOrder === "desc") {
    return "descending";
  }

  return "none";
};

export const ActivityTable = ({
  columns,
  emptyDescription = "There are no records to display yet.",
  emptyTitle = "No data available",
  error,
  forbidden = false,
  defaultSortOrder = "asc",
  loading = false,
  onRetry,
  onRowClick,
  pageSize = 10,
  rows,
  searchAriaLabel = "Search table",
  searchPlaceholder = "Search...",
  showSearch = true,
  renderCell,
  defaultSortColumn,
}: ActivityTableProps): ReactElement => {
  const inferredColumns = useMemo<readonly TableColumnMetadata[]>(() => {
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
        label: key,
        kind: inferColumnKind(key),
      }));
  }, [columns, rows]);

  const [sortColumn, setSortColumn] = useState<string | null>(
    defaultSortColumn ?? inferredColumns[0]?.key ?? null
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortOrder);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("");
  const deferredFilter = useDeferredValue(filter);

  const filteredRows = useMemo(() => {
    if (!deferredFilter) {
      return rows;
    }

    const normalizedFilter = deferredFilter.toLowerCase();

    return rows.filter((row) =>
      Object.values(row).some((value) =>
        formatCellValue(value).toLowerCase().includes(normalizedFilter)
      )
    );
  }, [deferredFilter, rows]);

  const sortedRows = useMemo(() => {
    if (!(sortColumn && sortOrder)) {
      return [...filteredRows];
    }

    return [...filteredRows].sort((left, right) =>
      compareDashboardValues(left[sortColumn], right[sortColumn], sortOrder)
    );
  }, [filteredRows, sortColumn, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const pageRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedRows.slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, sortedRows]);

  const toggleSort = (columnKey: string): void => {
    setCurrentPage(1);

    if (sortColumn === columnKey) {
      setSortOrder((currentOrder) => {
        if (currentOrder === "asc") {
          return "desc";
        }

        if (currentOrder === "desc") {
          return null;
        }

        return "asc";
      });

      return;
    }

    setSortColumn(columnKey);
    setSortOrder("asc");
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setCurrentPage(1);
    setFilter(event.target.value);
  };

  const activityTableSkeletonKeys = [
    "activity-table-skeleton-1",
    "activity-table-skeleton-2",
    "activity-table-skeleton-3",
    "activity-table-skeleton-4",
    "activity-table-skeleton-5",
  ] as const;

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
        title="Unable to load records"
        tone="danger"
      />
    );
  }

  if (forbidden) {
    return (
      <StatePanel
        description="You do not have permission to view this dataset. Ask an administrator to grant access."
        title="Access restricted"
        tone="warning"
      />
    );
  }

  if (loading) {
    return (
      <div className="rounded-md border bg-card p-4">
        <div className="space-y-3">
          {activityTableSkeletonKeys
            .slice(0, Math.max(1, Math.min(pageSize, 5)))
            .map((skeletonKey) => (
              <Skeleton className="h-10" key={skeletonKey} />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-md border bg-card">
      {showSearch ? (
        <div className="border-b p-4">
          <Input
            aria-label={searchAriaLabel}
            autoComplete="off"
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            type="search"
            value={filter}
          />
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">
            {showSearch ? "Filterable results table" : "Results table"}
          </caption>
          <thead>
            <tr className="border-b bg-muted/30">
              {inferredColumns.map((column) => (
                <th
                  aria-sort={getAriaSort(sortColumn, sortOrder, column.key)}
                  className="px-4 py-3 text-left font-medium text-muted-foreground"
                  key={column.key}
                  scope="col"
                >
                  <Button
                    aria-label={`Sort by ${column.label}`}
                    className="justify-start"
                    onClick={(): void => toggleSort(column.key)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <span>{column.label}</span>
                    {sortColumn === column.key && sortOrder === "asc" ? (
                      <ChevronUp />
                    ) : null}
                    {sortColumn === column.key && sortOrder === "desc" ? (
                      <ChevronDown />
                    ) : null}
                  </Button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length > 0 ? (
              pageRows.map((row) => (
                <tr
                  className={cn(
                    "border-b transition-colors",
                    onRowClick && "cursor-pointer hover:bg-accent/30"
                  )}
                  key={row.id}
                  onClick={(): void => onRowClick?.(row)}
                >
                  {inferredColumns.map((column) => (
                    <td className="px-4 py-3" key={`${row.id}-${column.key}`}>
                      {renderCell?.(column, row[column.key], row) ??
                        formatCellValue(row[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-4 py-8 text-center"
                  colSpan={Math.max(inferredColumns.length, 1)}
                >
                  <div className="flex justify-center py-2">
                    <StatePanel
                      action={
                        filter
                          ? {
                              label: "Clear search",
                              onClick: (): void => setFilter(""),
                            }
                          : undefined
                      }
                      description={
                        filter
                          ? "Try adjusting the search query or clearing the filter."
                          : emptyDescription
                      }
                      title={filter ? "No matching records" : emptyTitle}
                      tone="neutral"
                    />
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between border-t px-4 py-3 text-xs">
          <span className="text-muted-foreground">
            {sortedRows.length} result{sortedRows.length === 1 ? "" : "s"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              disabled={currentPage === 1}
              onClick={(): void =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
              size="sm"
              type="button"
              variant="outline"
            >
              Previous
            </Button>
            <span>
              {currentPage} / {totalPages}
            </span>
            <Button
              disabled={currentPage === totalPages}
              onClick={(): void =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              size="sm"
              type="button"
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
