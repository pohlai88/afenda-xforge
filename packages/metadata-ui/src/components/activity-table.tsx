"use client";

import type { DashboardTableRow, TableColumnMetadata } from "@repo/ui";
import {
  Button,
  Input,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import type {
  ChangeEvent,
  KeyboardEvent,
  ReactElement,
  ReactNode,
} from "react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type {
  MetadataRenderContext,
  MetadataRenderDensity,
} from "../contracts/render-context.contract";
import {
  coerceDateValue,
  coerceNumericValue,
  formatMetadataTableCellValue,
} from "../formatting/metadata-value-formatter";
import {
  handleKeyboardActivation,
  METADATA_INTERACTIVE_ROW_CLASS,
} from "../interaction/keyboard-focus-contract";
import {
  METADATA_TABLE_CELL_CONTENT_CLASS,
  METADATA_TABLE_HEADER_LABEL_CLASS,
  resolveMetadataDisplayValue,
} from "../visualization/content-length-visual-contract";
import {
  resolveDensitySurfaceProps,
  resolveFieldControlDensityClassName,
  resolveTableRowDensityClassName,
} from "../visualization/density-visual-contract";
import {
  resolveSurfaceKindProps,
  resolveSurfaceShellClassName,
} from "../visualization/surface-visual-contract";
import { MetadataMotionSkeleton } from "./metadata-motion-skeleton";
import { renderMetadataStateBoundaryResult } from "./metadata-state-boundary";
import { MetadataSurfaceRegion } from "./metadata-surface-region";

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
  context?: Partial<MetadataRenderContext>;
  defaultSortColumn?: string;
  defaultSortOrder?: Exclude<SortOrder, null>;
  density?: MetadataRenderDensity;
  emptyDescription?: string;
  emptyTitle?: string;
  error?: string | null;
  forbidden?: boolean;
  loading?: boolean;
  locale?: string;
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
  timezone?: string;
};

const cn = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(" ");

const formatCellValue = (
  value: DashboardTableRow[string],
  column?: TableColumnMetadata,
  locale = "en",
  timezone = "UTC"
): string => {
  const formattedValue = column
    ? formatMetadataTableCellValue(value, column.kind, {
        locale,
        timezone,
      })
    : null;

  if (formattedValue !== null) {
    return formattedValue;
  }

  if (value instanceof Date) {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timezone,
    }).format(value);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return resolveMetadataDisplayValue(value);
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
  right: DashboardTableRow[string],
  column?: TableColumnMetadata
): number => {
  if (column?.kind === "money") {
    const leftNumber = coerceNumericValue(left);
    const rightNumber = coerceNumericValue(right);

    if (leftNumber !== undefined && rightNumber !== undefined) {
      return leftNumber - rightNumber;
    }
  }

  if (column?.kind === "date") {
    const leftDate = coerceDateValue(left);
    const rightDate = coerceDateValue(right);

    if (leftDate && rightDate) {
      return leftDate.getTime() - rightDate.getTime();
    }
  }

  if (left instanceof Date && right instanceof Date) {
    return left.getTime() - right.getTime();
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return formatCellValue(left, column).localeCompare(
    formatCellValue(right, column)
  );
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
  context,
  defaultSortColumn,
  defaultSortOrder = "asc",
  density = "default",
  emptyDescription = "There is no activity to display yet.",
  emptyTitle = "No activity found",
  error,
  forbidden = false,
  loading = false,
  locale = "en",
  onRetry,
  onRowClick,
  pageSize = 10,
  renderCell,
  rows,
  searchAriaLabel = "Search rows",
  searchPlaceholder = "Search records...",
  showSearch = true,
  surface = "contained",
  timezone = "UTC",
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
        formatCellValue(row[column.key], column, locale, timezone)
          .toLowerCase()
          .includes(normalizedQuery)
      )
    );
  }, [deferredQuery, locale, resolvedColumns, rows, timezone]);

  const sortedRows = useMemo(() => {
    if (!(sortColumn && sortOrder)) {
      return filteredRows;
    }

    return [...filteredRows].sort((left, right) => {
      const column = resolvedColumns.find((entry) => entry.key === sortColumn);
      const result = compareValues(left[sortColumn], right[sortColumn], column);
      return sortOrder === "asc" ? result : result * -1;
    });
  }, [filteredRows, resolvedColumns, sortColumn, sortOrder]);

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

  const resolveSortLabel = (column: TableColumnMetadata): string => {
    if (sortColumn !== column.key || !sortOrder) {
      return `Sort by ${column.label}`;
    }

    return `Sort by ${column.label}, currently ${sortOrder === "asc" ? "ascending" : "descending"}`;
  };

  if (forbidden) {
    return renderMetadataStateBoundaryResult({
      context,
      forbiddenDescription: "You do not have permission to view this table.",
      forbiddenTitle: "Access restricted",
      state: "forbidden",
    }).element as ReactElement;
  }

  if (error) {
    return renderMetadataStateBoundaryResult({
      context,
      error,
      onRetry,
      state: "error",
    }).element as ReactElement;
  }

  if (loading) {
    return renderMetadataStateBoundaryResult({
      children: (
        <div className="grid gap-3">
          {SKELETON_KEYS.map((key) => (
            <MetadataMotionSkeleton className="h-10 w-full" key={key} />
          ))}
        </div>
      ),
      context,
      loadingDescription: "Loading rows for this table.",
      loadingTitle: "Loading",
      state: "loading",
    }).element as ReactElement;
  }

  if (sortedRows.length === 0) {
    return renderMetadataStateBoundaryResult({
      context,
      emptyDescription,
      emptyTitle,
      state: "empty",
    }).element as ReactElement;
  }

  return (
    <div
      className={cn(
        surface === "contained" && "space-y-4",
        "w-full",
        surface !== "embedded" && resolveSurfaceShellClassName("list")
      )}
      {...resolveDensitySurfaceProps(density)}
      {...(surface === "embedded" ? {} : resolveSurfaceKindProps("list"))}
    >
      <MetadataSurfaceRegion kind="list" region="primary">
        {showSearch ? (
          <MetadataSurfaceRegion kind="list" region="filters">
            <div className="flex items-center gap-3">
              <Input
                aria-label={searchAriaLabel}
                className={cn(
                  "max-w-sm",
                  resolveFieldControlDensityClassName(density)
                )}
                onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                  setPage(1);
                  setQuery(event.target.value);
                }}
                placeholder={searchPlaceholder}
                value={query}
              />
            </div>
          </MetadataSurfaceRegion>
        ) : null}

        <MetadataSurfaceRegion kind="list" region="data-grid">
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
                      <Button
                        aria-label={resolveSortLabel(column)}
                        className="h-auto max-w-[12rem] px-1 font-medium"
                        onClick={(): void => handleSort(column.key)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <span
                          className={METADATA_TABLE_HEADER_LABEL_CLASS}
                          title={column.label}
                        >
                          {column.label}
                        </span>
                        {renderSortIcon(column.key)}
                      </Button>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.map((row) => {
                  const rowIsInteractive = Boolean(onRowClick);
                  const activateRow = (): void => {
                    onRowClick?.(row);
                  };

                  return (
                    <TableRow
                      className={cn(
                        resolveTableRowDensityClassName(),
                        rowIsInteractive && METADATA_INTERACTIVE_ROW_CLASS
                      )}
                      key={row.id}
                      onClick={rowIsInteractive ? activateRow : undefined}
                      onKeyDown={
                        rowIsInteractive
                          ? (
                              event: KeyboardEvent<HTMLTableRowElement>
                            ): void => {
                              handleKeyboardActivation(event, activateRow);
                            }
                          : undefined
                      }
                      role={rowIsInteractive ? "button" : undefined}
                      tabIndex={rowIsInteractive ? 0 : undefined}
                    >
                      {resolvedColumns.map((column) => {
                        const value = row[column.key];
                        const rendered = renderCell?.(column, value, row);
                        const cellDisplayValue = formatCellValue(
                          value,
                          column,
                          locale,
                          timezone
                        );

                        return (
                          <TableCell key={`${row.id}-${column.key}`}>
                            {rendered ?? (
                              <span
                                className={METADATA_TABLE_CELL_CONTENT_CLASS}
                                title={cellDisplayValue}
                              >
                                {cellDisplayValue}
                              </span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </MetadataSurfaceRegion>

        {totalPages > 1 ? (
          <MetadataSurfaceRegion kind="list" region="pagination">
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
          </MetadataSurfaceRegion>
        ) : null}
      </MetadataSurfaceRegion>
    </div>
  );
}
