"use client";

import { cn } from "@repo/design-system/lib/utils";
import type { DashboardTableColumn, DashboardTableRow } from "@repo/metadata";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ChangeEvent, ReactElement } from "react";
import { useMemo, useState } from "react";

type SortOrder = "asc" | "desc" | null;

type ActivityTableProps = {
  columns?: readonly DashboardTableColumn[];
  loading?: boolean;
  onRowClick?: (row: DashboardTableRow) => void;
  pageSize?: number;
  rows: readonly DashboardTableRow[];
  searchPlaceholder?: string;
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

export const ActivityTable = ({
  columns,
  loading = false,
  onRowClick,
  pageSize = 10,
  rows,
  searchPlaceholder = "Search...",
}: ActivityTableProps): ReactElement => {
  const inferredColumns = useMemo<readonly DashboardTableColumn[]>(() => {
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
      }));
  }, [columns, rows]);

  const [sortColumn, setSortColumn] = useState<string | null>(
    inferredColumns[0]?.key ?? null
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("");

  const filteredRows = useMemo(() => {
    if (!filter) {
      return rows;
    }

    const normalizedFilter = filter.toLowerCase();

    return rows.filter((row) =>
      Object.values(row).some((value) =>
        formatCellValue(value).toLowerCase().includes(normalizedFilter)
      )
    );
  }, [filter, rows]);

  const sortedRows = useMemo(() => {
    if (!(sortColumn && sortOrder)) {
      return [...filteredRows];
    }

    return [...filteredRows].sort((left, right) =>
      compareDashboardValues(left[sortColumn], right[sortColumn], sortOrder)
    );
  }, [filteredRows, sortColumn, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
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

  if (loading) {
    return (
      <div className="rounded-md border bg-card p-4">
        <div className="space-y-3">
          {activityTableSkeletonKeys.map((skeletonKey) => (
            <div
              className="h-10 animate-pulse rounded bg-muted/40"
              key={skeletonKey}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-md border bg-card">
      <div className="border-b p-4">
        <input
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0"
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
          type="text"
          value={filter}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              {inferredColumns.map((column) => (
                <th
                  className="px-4 py-3 text-left font-medium text-muted-foreground"
                  key={column.key}
                >
                  <button
                    className="inline-flex items-center gap-2"
                    onClick={(): void => toggleSort(column.key)}
                    type="button"
                  >
                    <span>{column.label}</span>
                    {sortColumn === column.key && sortOrder === "asc" ? (
                      <ChevronUp className="size-4" />
                    ) : null}
                    {sortColumn === column.key && sortOrder === "desc" ? (
                      <ChevronDown className="size-4" />
                    ) : null}
                  </button>
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
                      {formatCellValue(row[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-4 py-8 text-center text-muted-foreground"
                  colSpan={Math.max(inferredColumns.length, 1)}
                >
                  No data
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
            <button
              className="rounded-md border px-3 py-1 disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={(): void =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
              type="button"
            >
              Previous
            </button>
            <span>
              {currentPage} / {totalPages}
            </span>
            <button
              className="rounded-md border px-3 py-1 disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={(): void =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
