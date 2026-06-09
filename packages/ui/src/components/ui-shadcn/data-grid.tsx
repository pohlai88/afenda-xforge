"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import { DndContext } from "@dnd-kit/core";
import type { Column, Row, Table } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Filter,
  Loader2,
  Pin,
  PinOff,
} from "lucide-react";
import * as React from "react";

import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";
import { ScrollArea, ScrollBar } from "./scroll-area";
import { Skeleton } from "./skeleton";

export type DataGridLoadingMode = "skeleton" | "spinner";

export type DataGridTableLayout = {
  dense?: boolean;
  cellBorder?: boolean;
  rowBorder?: boolean;
  rowRounded?: boolean;
  stripped?: boolean;
  headerBackground?: boolean;
  headerBorder?: boolean;
  headerSticky?: boolean;
  width?: "auto" | "fixed";
  columnsVisibility?: boolean;
  columnsResizable?: boolean;
  columnsPinnable?: boolean;
  columnsMovable?: boolean;
  columnsDraggable?: boolean;
  rowsDraggable?: boolean;
  rowsPinnable?: boolean;
};

export type DataGridTableClassNames = {
  base?: string;
  header?: string;
  headerRow?: string;
  headerSticky?: string;
  body?: string;
  bodyRow?: string;
  footer?: string;
  edgeCell?: string;
};

type DataGridContextValue<TData> = {
  table: Table<TData>;
  recordCount: number;
  isLoading: boolean;
  loadingMode: DataGridLoadingMode;
  loadingMessage: React.ReactNode;
  fetchingMoreMessage: React.ReactNode;
  allRowsLoadedMessage: React.ReactNode;
  emptyMessage: React.ReactNode;
  onRowClick?: (row: TData) => void;
  tableLayout?: DataGridTableLayout;
  tableClassNames?: DataGridTableClassNames;
};

type DataGridProps<TData> = {
  table: Table<TData>;
  recordCount: number;
  isLoading?: boolean;
  loadingMode?: DataGridLoadingMode;
  loadingMessage?: React.ReactNode;
  fetchingMoreMessage?: React.ReactNode;
  allRowsLoadedMessage?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  tableLayout?: DataGridTableLayout;
  tableClassNames?: DataGridTableClassNames;
  className?: string;
  children?: React.ReactNode;
};

const DataGridContext =
  React.createContext<DataGridContextValue<unknown> | null>(null);

function useDataGridContext<TData>() {
  const context = React.useContext(DataGridContext);

  if (!context) {
    throw new Error("DataGrid components must be used within <DataGrid />");
  }

  return context as DataGridContextValue<TData>;
}

function DataGrid<TData>({
  table,
  recordCount,
  isLoading = false,
  loadingMode = "skeleton",
  loadingMessage = "Loading...",
  fetchingMoreMessage = loadingMessage,
  allRowsLoadedMessage = "All records loaded",
  emptyMessage = "No data available",
  onRowClick,
  tableLayout,
  tableClassNames,
  className,
  children,
}: DataGridProps<TData>) {
  const value = React.useMemo(
    () =>
      ({
        table: table as unknown as Table<unknown>,
        recordCount,
        isLoading,
        loadingMode,
        loadingMessage,
        fetchingMoreMessage,
        allRowsLoadedMessage,
        emptyMessage,
        onRowClick: onRowClick as ((row: unknown) => void) | undefined,
        tableLayout,
        tableClassNames,
      }) as DataGridContextValue<unknown>,
    [
      allRowsLoadedMessage,
      emptyMessage,
      fetchingMoreMessage,
      isLoading,
      loadingMessage,
      loadingMode,
      onRowClick,
      recordCount,
      table,
      tableClassNames,
      tableLayout,
    ],
  );

  return (
    <DataGridContext.Provider value={value as DataGridContextValue<unknown>}>
      <div data-slot="data-grid" className={cn("space-y-4", className)}>
        {children}
      </div>
    </DataGridContext.Provider>
  );
}

function DataGridContainer({
  border = true,
  className,
  children,
}: {
  border?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-slot="data-grid-container"
      className={cn(
        "overflow-hidden rounded-xl bg-background",
        border && "border shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

type DataGridScrollAreaProps = {
  children: React.ReactNode;
  orientation?: "horizontal" | "vertical" | "both";
  className?: string;
};

function DataGridScrollArea({
  children,
  orientation = "both",
  className,
}: DataGridScrollAreaProps) {
  const showHorizontal = orientation === "horizontal" || orientation === "both";

  return (
    <ScrollArea
      data-slot="data-grid-scroll-area"
      className={cn("size-full", className)}
    >
      {children}
      {showHorizontal ? <ScrollBar orientation="horizontal" /> : null}
    </ScrollArea>
  );
}

function DataGridTableFoot({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <tfoot
      data-slot="data-grid-table-foot"
      className={cn("border-t bg-muted/40 font-medium", className)}
    >
      {children}
    </tfoot>
  );
}

function DataGridTableFootRow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <tr
      data-slot="data-grid-table-foot-row"
      className={cn("border-0", className)}
    >
      {children}
    </tr>
  );
}

function DataGridTableFootRowCell({
  colSpan,
  className,
  children,
}: {
  colSpan?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <td
      data-slot="data-grid-table-foot-row-cell"
      colSpan={colSpan}
      className={cn("px-3 py-2 text-sm text-muted-foreground", className)}
    >
      {children}
    </td>
  );
}

function DataGridTableRowPin<TData>({
  row,
  className,
}: {
  row: Row<TData> & {
    pin?: (position: false | "top" | "bottom") => void;
    getIsPinned?: () => false | "top" | "bottom";
  };
  className?: string;
}) {
  const pinned = row.getIsPinned?.();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className={cn("text-muted-foreground", className)}
      onClick={() => row.pin?.(pinned ? false : "top")}
      aria-label={pinned ? "Unpin row" : "Pin row"}
    >
      {pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
    </Button>
  );
}

function DataGridColumnFilter<TData, TValue>({
  column,
  title,
  options,
  className,
}: {
  column: Column<TData, TValue>;
  title: string;
  options: Array<{
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  className?: string;
}) {
  const selected = new Set(
    (column.getFilterValue() as string[] | undefined) ?? [],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("h-8 gap-2 rounded-full px-3", className)}
        >
          <Filter className="size-3.5" />
          {title}
          <ChevronDown className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <PopoverHeader>
          <PopoverTitle>{title}</PopoverTitle>
        </PopoverHeader>
        <div className="mt-3 grid gap-2">
          {options.map((option) => {
            const Icon = option.icon;
            const checked = selected.has(option.value);

            return (
              <div
                key={option.value}
                className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(value) => {
                    const next = new Set(selected);

                    if (value) {
                      next.add(option.value);
                    } else {
                      next.delete(option.value);
                    }

                    column.setFilterValue(Array.from(next));
                  }}
                />
                {Icon ? (
                  <Icon className="size-4 text-muted-foreground" />
                ) : null}
                <span className="flex-1">{option.label}</span>
              </div>
            );
          })}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="justify-start px-2 text-muted-foreground"
            onClick={() => column.setFilterValue(undefined)}
          >
            Clear filter
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DataGridColumnVisibility<TData>({
  table,
  trigger,
}: {
  table: Table<TData>;
  trigger: React.ReactElement;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllLeafColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(checked) => column.toggleVisibility(!!checked)}
            >
              {column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DataGridColumnHeader<TData, TValue>({
  column,
  title,
  icon,
  filter,
  visibility = false,
  className,
}: {
  column: Column<TData, TValue>;
  title: string;
  icon?: React.ReactNode;
  filter?: React.ReactNode;
  visibility?: boolean;
  className?: string;
}) {
  const sorted = column.getIsSorted();
  const canSort = column.getCanSort();
  const canHide = column.getCanHide();
  const canPin =
    typeof column.getCanPin === "function" ? column.getCanPin() : false;
  const pinColumn = column as Column<TData, TValue> & {
    pin?: (position: false | "left" | "right") => void;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex min-w-0 items-center gap-2">
        {icon ? <span className="text-muted-foreground">{icon}</span> : null}
        <span className="truncate">{title}</span>
      </span>
      {canSort ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground"
          onClick={() => column.toggleSorting(sorted === "asc")}
          aria-label={`Sort ${title}`}
        >
          <ArrowUpDown className="size-3.5" />
        </Button>
      ) : null}
      {filter}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground"
              aria-label={`${title} menu`}
            >
              <Columns3 className="size-3.5" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{title}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {canSort ? (
            <>
              <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                Sort ascending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                Sort descending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => column.clearSorting()}>
                Clear sort
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}
          {canPin ? (
            <>
              <DropdownMenuItem onClick={() => pinColumn.pin?.("left")}>
                Pin left
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => pinColumn.pin?.("right")}>
                Pin right
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => pinColumn.pin?.(false)}>
                Unpin
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}
          {visibility && canHide ? (
            <DropdownMenuCheckboxItem
              checked={column.getIsVisible()}
              onCheckedChange={(checked) => column.toggleVisibility(!!checked)}
            >
              Show column
            </DropdownMenuCheckboxItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function DataGridTable({
  footerContent,
  renderHeader = true,
  className,
}: {
  footerContent?: React.ReactNode;
  renderHeader?: boolean;
  className?: string;
}) {
  const {
    table,
    isLoading,
    loadingMode,
    loadingMessage,
    emptyMessage,
    onRowClick,
    tableLayout,
    tableClassNames,
  } = useDataGridContext();

  const layout = tableLayout ?? {};
  const rows = table.getRowModel().rows;
  const columnCount = table.getVisibleLeafColumns().length || 1;
  const tableWidthClass =
    layout.width === "auto"
      ? "min-w-full w-max table-auto"
      : "w-full table-fixed";

  const baseTableClassName = cn(
    "caption-bottom text-sm",
    tableWidthClass,
    className,
    tableClassNames?.base,
  );

  const headerClassName = cn(
    layout.headerBackground && "bg-muted/50",
    tableClassNames?.header,
  );

  const headerRowClassName = cn(
    layout.headerBorder !== false && "border-b",
    tableClassNames?.headerRow,
  );

  const bodyRowBaseClassName = cn(
    layout.rowBorder !== false && "border-b",
    layout.stripped && "odd:bg-muted/30",
    layout.rowRounded && "rounded-lg",
    tableClassNames?.bodyRow,
  );

  if (isLoading && loadingMode === "spinner") {
    return (
      <div className="flex min-h-48 items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        {loadingMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table data-slot="data-grid-table" className={baseTableClassName}>
        {renderHeader ? (
          <thead className={headerClassName}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className={cn(
                  headerRowClassName,
                  tableClassNames?.headerSticky,
                )}
              >
                {headerGroup.headers.map((header, index) => {
                  const isEdge =
                    index === 0 || index === headerGroup.headers.length - 1;

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "px-3 py-3 text-left align-middle font-medium text-foreground",
                        layout.dense ? "h-8" : "h-10",
                        layout.cellBorder && "border-l first:border-l-0",
                        layout.headerSticky && "sticky top-0 z-20",
                        isEdge && tableClassNames?.edgeCell,
                      )}
                      style={{ width: header.getSize() || undefined }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
        ) : null}
        <tbody className={tableClassNames?.body}>
          {isLoading && loadingMode === "skeleton" ? (
            Array.from({ length: 4 }).map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`} className={bodyRowBaseClassName}>
                {Array.from({ length: columnCount }).map((__, cellIndex) => (
                  <td
                    key={`skeleton-${rowIndex}-${cellIndex}`}
                    className={cn(
                      "px-3 py-3",
                      layout.dense ? "h-8" : "h-12",
                      layout.cellBorder && "border-l first:border-l-0",
                    )}
                  >
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length > 0 ? (
            rows.map((row) => {
              const canClick = Boolean(onRowClick);

              return (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={cn(
                    bodyRowBaseClassName,
                    canClick && "cursor-pointer",
                    row.getIsExpanded() && "bg-muted/30",
                  )}
                  onClick={
                    canClick ? () => onRowClick?.(row.original) : undefined
                  }
                >
                  {row.getVisibleCells().map((cell, index) => {
                    const isEdge =
                      index === 0 || index === row.getVisibleCells().length - 1;

                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-3 py-3 align-middle",
                          layout.dense ? "h-8" : "h-12",
                          layout.cellBorder && "border-l first:border-l-0",
                          isEdge && tableClassNames?.edgeCell,
                        )}
                        style={
                          index === 0 && row.depth > 0
                            ? { paddingLeft: `${row.depth * 1.25}rem` }
                            : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={columnCount}
                className="px-3 py-12 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
        {footerContent ? (
          <DataGridTableFoot className={tableClassNames?.footer}>
            {footerContent}
          </DataGridTableFoot>
        ) : table.getFooterGroups().length > 0 ? (
          <tfoot
            className={cn("border-t bg-muted/40", tableClassNames?.footer)}
          >
            {table.getFooterGroups().map((footerGroup) => (
              <tr key={footerGroup.id}>
                {footerGroup.headers.map((footer, index) => {
                  const isEdge =
                    index === 0 || index === footerGroup.headers.length - 1;

                  return (
                    <td
                      key={footer.id}
                      className={cn(
                        "px-3 py-2 text-sm text-muted-foreground",
                        layout.cellBorder && "border-l first:border-l-0",
                        isEdge && tableClassNames?.edgeCell,
                      )}
                    >
                      {footer.isPlaceholder
                        ? null
                        : flexRender(
                            footer.column.columnDef.footer,
                            footer.getContext(),
                          )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tfoot>
        ) : null}
      </table>
      {isLoading ? null : null}
    </div>
  );
}

function DataGridTableVirtual({
  height = 420,
  estimateSize = 48,
  overscan = 10,
  footerContent,
  renderHeader = true,
  onFetchMore,
  isFetchingMore = false,
  hasMore = false,
  fetchMoreOffset = 0,
  className,
}: {
  height?: number | string;
  estimateSize?: number;
  overscan?: number;
  footerContent?: React.ReactNode;
  renderHeader?: boolean;
  onFetchMore?: () => void;
  isFetchingMore?: boolean;
  hasMore?: boolean;
  fetchMoreOffset?: number;
  className?: string;
}) {
  const { table, fetchingMoreMessage, allRowsLoadedMessage } =
    useDataGridContext();
  const parentRef = React.useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  React.useEffect(() => {
    if (!onFetchMore || !hasMore || isFetchingMore) {
      return;
    }

    const lastItem = virtualItems[virtualItems.length - 1];

    if (lastItem && lastItem.index >= rows.length - 1 - fetchMoreOffset) {
      onFetchMore();
    }
  }, [
    fetchMoreOffset,
    hasMore,
    isFetchingMore,
    onFetchMore,
    rows.length,
    virtualItems,
  ]);

  const columnCount = table.getVisibleLeafColumns().length || 1;

  return (
    <div
      ref={parentRef}
      className={cn(
        "relative overflow-auto rounded-xl border bg-background",
        className,
      )}
      style={{ height }}
    >
      <table className="w-full caption-bottom text-sm">
        {renderHeader ? (
          <thead className="sticky top-0 z-20 bg-background/95 backdrop-blur">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-10 px-3 py-3 text-left align-middle font-medium text-foreground"
                    style={{ width: header.getSize() || undefined }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
        ) : null}
        <tbody style={{ height: totalSize, position: "relative" }}>
          {virtualItems.length > 0 ? (
            virtualItems.map((virtualRow) => {
              const row = rows[virtualRow.index];

              return (
                <tr
                  key={row.id}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: "absolute",
                    transform: `translateY(${virtualRow.start}px)`,
                    width: "100%",
                  }}
                  className="border-b"
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <td
                      key={cell.id}
                      className="px-3 py-3 align-middle"
                      style={
                        index === 0 && cell.row.depth > 0
                          ? { paddingLeft: `${cell.row.depth * 1.25}rem` }
                          : undefined
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={columnCount}
                className="px-3 py-12 text-center text-sm text-muted-foreground"
              >
                {allRowsLoadedMessage}
              </td>
            </tr>
          )}
        </tbody>
        {footerContent ? (
          <DataGridTableFoot>{footerContent}</DataGridTableFoot>
        ) : null}
      </table>
      {isFetchingMore ? (
        <div className="border-t bg-background px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="mr-2 inline size-4 animate-spin" />
          {fetchingMoreMessage}
        </div>
      ) : !hasMore ? (
        <div className="border-t bg-background px-4 py-3 text-sm text-muted-foreground">
          {allRowsLoadedMessage}
        </div>
      ) : null}
    </div>
  );
}

function buildPageWindow(
  currentPage: number,
  totalPages: number,
  limit: number,
) {
  if (totalPages <= limit) {
    return Array.from({ length: totalPages }, (_, index) => index);
  }

  const half = Math.floor(limit / 2);
  const start = Math.max(0, Math.min(currentPage - half, totalPages - limit));
  return Array.from({ length: limit }, (_, index) => start + index);
}

function DataGridPagination({
  sizes = [5, 10, 25, 50, 100],
  sizesLabel = "Show",
  sizesDescription = "per page",
  rowsPerPageLabel = "Rows per page",
  info = "{from} - {to} of {count}",
  more = false,
  moreLimit = 5,
  previousPageLabel = "Go to previous page",
  nextPageLabel = "Go to next page",
  ellipsisText = "...",
  className,
}: {
  sizes?: number[];
  sizesLabel?: string;
  sizesDescription?: string;
  rowsPerPageLabel?: string;
  info?: string;
  more?: boolean;
  moreLimit?: number;
  previousPageLabel?: string;
  nextPageLabel?: string;
  ellipsisText?: string;
  className?: string;
}) {
  const { table, recordCount } = useDataGridContext();
  const pagination = table.getState().pagination;
  const pageIndex = pagination?.pageIndex ?? 0;
  const pageSize = pagination?.pageSize ?? sizes[0] ?? 10;
  const pageCount = Math.max(table.getPageCount(), 1);
  const from = recordCount === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min(recordCount, (pageIndex + 1) * pageSize);
  const pageButtons = more
    ? buildPageWindow(pageIndex, pageCount, moreLimit)
    : Array.from({ length: pageCount }, (_, index) => index);

  return (
    <div
      data-slot="data-grid-pagination"
      className={cn(
        "flex flex-col gap-4 rounded-xl border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{rowsPerPageLabel}</span>
        <label className="flex items-center gap-2">
          <span>{sizesLabel}</span>
          <select
            className="h-8 rounded-md border bg-background px-2 text-sm"
            value={pageSize}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
          >
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>{sizesDescription}</span>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {info
            .replace("{from}", String(from))
            .replace("{to}", String(to))
            .replace("{count}", String(recordCount))}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label={previousPageLabel}
          >
            <ChevronLeft className="size-4" />
          </Button>
          {pageButtons.map((pageNumber, index) => {
            const isCurrent = pageNumber === pageIndex;
            const isEllipsis =
              more &&
              index === pageButtons.length - 1 &&
              pageCount > pageButtons.length;

            if (isEllipsis) {
              return (
                <Button
                  key="ellipsis"
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled
                >
                  {ellipsisText}
                </Button>
              );
            }

            return (
              <Button
                key={pageNumber}
                type="button"
                variant={isCurrent ? "default" : "outline"}
                size="icon-sm"
                onClick={() => table.setPageIndex(pageNumber)}
                aria-current={isCurrent ? "page" : undefined}
              >
                {pageNumber + 1}
              </Button>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label={nextPageLabel}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function DataGridTableDnd({
  handleDragEnd,
  children,
}: {
  handleDragEnd: (event: DragEndEvent) => void;
  children?: React.ReactNode;
}) {
  return <DndContext onDragEnd={handleDragEnd}>{children}</DndContext>;
}

function DataGridTableDndRows({
  handleDragEnd,
  children,
  dataIds: _dataIds,
}: {
  dataIds?: React.Key[];
  handleDragEnd: (event: DragEndEvent) => void;
  children?: React.ReactNode;
}) {
  return <DndContext onDragEnd={handleDragEnd}>{children}</DndContext>;
}

export {
  DataGrid,
  DataGridColumnFilter,
  DataGridColumnHeader,
  DataGridColumnVisibility,
  DataGridContainer,
  DataGridPagination,
  DataGridScrollArea,
  DataGridTable,
  DataGridTableDnd,
  DataGridTableDndRows,
  DataGridTableFoot,
  DataGridTableFootRow,
  DataGridTableFootRowCell,
  DataGridTableRowPin,
  DataGridTableVirtual,
  useDataGridContext,
};
