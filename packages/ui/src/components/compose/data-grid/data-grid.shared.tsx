"use client";

import type {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ExpandedState,
  PaginationState,
  RowPinningState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  BadgeCheck,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Copy,
  GripVertical,
  LayoutGrid,
  MoreHorizontal,
  PencilLine,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TrendingUp,
  UserRound,
} from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/utils";
import { Badge } from "../../ui-shadcn/badge";
import { Button } from "../../ui-shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";
import type {
  DataGridTableClassNames,
  DataGridTableLayout,
} from "../../ui-shadcn/data-grid";
import {
  DataGrid,
  DataGridColumnFilter,
  DataGridColumnHeader,
  DataGridColumnVisibility,
  DataGridContainer,
  DataGridPagination,
  DataGridScrollArea,
  DataGridTable,
  DataGridTableFootRow,
  DataGridTableFootRowCell,
  DataGridTableRowPin,
  DataGridTableVirtual,
} from "../../ui-shadcn/data-grid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui-shadcn/dropdown-menu";
import { Input } from "../../ui-shadcn/input";
import type { DataGridPatternName } from "./data-grid.catalog";
import { dataGridPatternCatalog } from "./data-grid.catalog";

type DemoRow = {
  id: string;
  project: string;
  owner: string;
  role: string;
  status: "Active" | "Paused" | "Draft";
  priority: "High" | "Medium" | "Low";
  progress: number;
  revenue: number;
  updated: string;
  region: string;
  category: string;
  notes: string;
  children?: DemoRow[];
};

const demoRows: DemoRow[] = [
  {
    id: "proj-1",
    project: "Aurora",
    owner: "Maya Chen",
    role: "Design Lead",
    status: "Active",
    priority: "High",
    progress: 92,
    revenue: 18400,
    updated: "2m ago",
    region: "APAC",
    category: "Launch",
    notes: "Design handoff is complete and QA is in progress.",
    children: [
      {
        id: "proj-1a",
        project: "Aurora / Research",
        owner: "Maya Chen",
        role: "Research",
        status: "Active",
        priority: "High",
        progress: 100,
        revenue: 4200,
        updated: "today",
        region: "APAC",
        category: "Nested",
        notes: "Research summary signed off.",
      },
      {
        id: "proj-1b",
        project: "Aurora / Launch",
        owner: "Maya Chen",
        role: "PM",
        status: "Paused",
        priority: "Medium",
        progress: 74,
        revenue: 6800,
        updated: "today",
        region: "APAC",
        category: "Nested",
        notes: "Launch checklist is waiting on legal.",
      },
    ],
  },
  {
    id: "proj-2",
    project: "Northstar",
    owner: "Jules Rivera",
    role: "Engineering",
    status: "Active",
    priority: "Medium",
    progress: 78,
    revenue: 12650,
    updated: "11m ago",
    region: "EMEA",
    category: "Build",
    notes: "API work is ahead of schedule.",
  },
  {
    id: "proj-3",
    project: "Atlas",
    owner: "Noah Patel",
    role: "Operations",
    status: "Paused",
    priority: "Low",
    progress: 41,
    revenue: 8800,
    updated: "32m ago",
    region: "NA",
    category: "Support",
    notes: "Operations review is scheduled for Friday.",
  },
  {
    id: "proj-4",
    project: "Helix",
    owner: "Ava Brooks",
    role: "Marketing",
    status: "Draft",
    priority: "High",
    progress: 25,
    revenue: 5400,
    updated: "1h ago",
    region: "APAC",
    category: "Planning",
    notes: "Campaign assets are still being assembled.",
  },
  {
    id: "proj-5",
    project: "Nova",
    owner: "Ethan Kim",
    role: "Finance",
    status: "Active",
    priority: "Low",
    progress: 67,
    revenue: 21900,
    updated: "2h ago",
    region: "NA",
    category: "Review",
    notes: "Budget reconciliation is in flight.",
  },
  {
    id: "proj-6",
    project: "Pulse",
    owner: "Sara Ali",
    role: "Product",
    status: "Active",
    priority: "Medium",
    progress: 86,
    revenue: 14900,
    updated: "4h ago",
    region: "LATAM",
    category: "Growth",
    notes: "Roadmap milestones are on track.",
  },
];

const virtualRows: DemoRow[] = Array.from({ length: 60 }, (_, index) => {
  const base = demoRows[index % demoRows.length];

  return {
    ...base,
    id: `virtual-${index + 1}`,
    project: `${base.project} ${index + 1}`,
    updated: `${index + 1}m ago`,
  };
});

const statusVariant: Record<
  DemoRow["status"],
  "default" | "secondary" | "outline"
> = {
  Active: "default",
  Paused: "secondary",
  Draft: "outline",
};

const statusOptions = [
  { label: "Active", value: "Active", icon: CheckCircle2 },
  { label: "Paused", value: "Paused", icon: CircleDashed },
  { label: "Draft", value: "Draft", icon: Sparkles },
];

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function percentBar(value: number) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-full max-w-24 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs text-muted-foreground">
        {value}%
      </span>
    </div>
  );
}

function statusBadge(status: DemoRow["status"]) {
  return <Badge variant={statusVariant[status]}>{status}</Badge>;
}

function usePreviewTable({
  data,
  columns,
  layout,
  initialSorting = [],
  initialColumnVisibility = {},
  initialRowSelection = {},
  initialExpanded = {},
  initialPagination = { pageIndex: 0, pageSize: 5 },
  initialColumnOrder = [],
}: {
  data: DemoRow[];
  columns: ColumnDef<DemoRow>[];
  layout?: DataGridTableLayout;
  initialSorting?: SortingState;
  initialColumnVisibility?: VisibilityState;
  initialRowSelection?: RowSelectionState;
  initialExpanded?: ExpandedState;
  initialPagination?: PaginationState;
  initialColumnOrder?: ColumnOrderState;
}) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialColumnVisibility);
  const [rowSelection, setRowSelection] =
    React.useState<RowSelectionState>(initialRowSelection);
  const [rowPinning, setRowPinning] = React.useState<RowPinningState>({
    top: [],
    bottom: [],
  });
  const [expanded, setExpanded] =
    React.useState<ExpandedState>(initialExpanded);
  const [columnOrder, setColumnOrder] =
    React.useState<ColumnOrderState>(initialColumnOrder);
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    left: [],
    right: [],
  });
  const [pagination, setPagination] =
    React.useState<PaginationState>(initialPagination);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  return useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      rowPinning,
      expanded,
      columnOrder,
      columnPinning,
      pagination,
      columnFilters,
    },
    defaultColumn: {
      size: 160,
      minSize: 80,
      maxSize: 360,
    },
    enableSorting: true,
    enableColumnPinning: true,
    enableRowPinning: Boolean(layout?.rowsPinnable),
    enableColumnResizing: Boolean(layout?.columnsResizable),
    enableRowSelection: true,
    enableExpanding: true,
    enableMultiSort: true,
    getSubRows: (row) => row.children ?? [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onRowPinningChange: setRowPinning,
    onExpandedChange: setExpanded,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    initialState: {
      pagination: initialPagination,
    },
    columnResizeMode: "onChange",
    getRowId: (row) => row.id,
  });
}

function PatternShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-1">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}

function Stage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-[280px] rounded-xl bg-muted/35 p-5", className)}>
      {children}
    </div>
  );
}

function baseColumns({
  showIcons = false,
  showSelection = false,
  showActions = false,
  showDragHandle = false,
  showRowPin = false,
  showFilters = false,
  dense = false,
}: {
  showIcons?: boolean;
  showSelection?: boolean;
  showActions?: boolean;
  showDragHandle?: boolean;
  showRowPin?: boolean;
  showFilters?: boolean;
  dense?: boolean;
} = {}): ColumnDef<DemoRow>[] {
  const columns: ColumnDef<DemoRow>[] = [];

  if (showSelection) {
    columns.push({
      id: "select",
      size: 42,
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <input
          type="checkbox"
          aria-label="Select all rows"
          className="size-4 rounded border-input"
          checked={table.getIsAllPageRowsSelected()}
          ref={(node) => {
            if (node) {
              node.indeterminate = table.getIsSomePageRowsSelected();
            }
          }}
          onChange={(event) =>
            table.toggleAllPageRowsSelected(event.target.checked)
          }
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select ${row.original.project}`}
          className="size-4 rounded border-input"
          checked={row.getIsSelected()}
          ref={(node) => {
            if (node) {
              node.indeterminate = row.getIsSomeSelected();
            }
          }}
          onChange={(event) => row.toggleSelected(event.target.checked)}
        />
      ),
    });
  }

  if (showDragHandle) {
    columns.push({
      id: "drag",
      size: 42,
      enableSorting: false,
      enableHiding: false,
      header: () => <GripVertical className="size-4 text-muted-foreground" />,
      cell: () => <GripVertical className="size-4 text-muted-foreground" />,
    });
  }

  if (showRowPin) {
    columns.push({
      id: "pin",
      size: 42,
      enableSorting: false,
      enableHiding: false,
      header: () => <BadgeCheck className="size-4 text-muted-foreground" />,
      cell: ({ row }) => <DataGridTableRowPin row={row} />,
    });
  }

  columns.push(
    {
      accessorKey: "project",
      header: ({ column }) => (
        <DataGridColumnHeader
          column={column}
          title="Project"
          icon={showIcons ? <LayoutGrid className="size-4" /> : undefined}
          visibility
          filter={
            showFilters ? (
              <DataGridColumnFilter
                column={column}
                title="Project"
                options={demoRows.map((row) => ({
                  label: row.project,
                  value: row.project,
                }))}
              />
            ) : undefined
          }
        />
      ),
      filterFn: (row, columnId, value) => {
        const selected = new Set(Array.isArray(value) ? value : []);
        return (
          selected.size === 0 || selected.has(String(row.getValue(columnId)))
        );
      },
      cell: ({ row }) => (
        <div className={cn("flex flex-col gap-0.5", dense && "py-0.5")}>
          <div className="font-medium">{row.original.project}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.notes}
          </div>
        </div>
      ),
      size: 220,
    },
    {
      accessorKey: "owner",
      header: ({ column }) => (
        <DataGridColumnHeader
          column={column}
          title="Owner"
          icon={showIcons ? <UserRound className="size-4" /> : undefined}
          visibility
        />
      ),
      cell: ({ row }) => row.original.owner,
      size: 150,
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataGridColumnHeader
          column={column}
          title="Role"
          icon={showIcons ? <Sparkles className="size-4" /> : undefined}
          visibility
        />
      ),
      cell: ({ row }) => row.original.role,
      size: 140,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataGridColumnHeader
          column={column}
          title="Status"
          icon={showIcons ? <CheckCircle2 className="size-4" /> : undefined}
          visibility
          filter={
            showFilters ? (
              <DataGridColumnFilter
                column={column}
                title="Status"
                options={statusOptions}
              />
            ) : undefined
          }
        />
      ),
      filterFn: (row, columnId, value) => {
        const selected = new Set(Array.isArray(value) ? value : []);
        return (
          selected.size === 0 || selected.has(String(row.getValue(columnId)))
        );
      },
      cell: ({ row }) => statusBadge(row.original.status),
      size: 120,
    },
    {
      accessorKey: "progress",
      header: ({ column }) => (
        <DataGridColumnHeader
          column={column}
          title="Progress"
          icon={showIcons ? <TrendingUp className="size-4" /> : undefined}
          visibility
        />
      ),
      cell: ({ row }) => percentBar(row.original.progress),
      size: 180,
    },
    {
      accessorKey: "revenue",
      header: ({ column }) => (
        <DataGridColumnHeader
          column={column}
          title="Revenue"
          icon={showIcons ? <BarChart3 className="size-4" /> : undefined}
          visibility
        />
      ),
      cell: ({ row }) => money(row.original.revenue),
      size: 120,
    },
    {
      accessorKey: "updated",
      header: ({ column }) => (
        <DataGridColumnHeader
          column={column}
          title="Updated"
          icon={showIcons ? <CalendarDays className="size-4" /> : undefined}
          visibility
        />
      ),
      cell: ({ row }) => row.original.updated,
      size: 120,
    },
    {
      accessorKey: "region",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Region" visibility />
      ),
      cell: ({ row }) => row.original.region,
      size: 100,
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Priority" visibility />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.priority}</Badge>
      ),
      size: 110,
    },
  );

  if (showActions) {
    columns.push({
      id: "actions",
      size: 88,
      enableSorting: false,
      enableHiding: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{row.original.project}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <PencilLine className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="size-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    });
  }

  return columns;
}

function footerTotals() {
  const totalRevenue = demoRows.reduce((sum, row) => sum + row.revenue, 0);
  const totalProgress = Math.round(
    demoRows.reduce((sum, row) => sum + row.progress, 0) / demoRows.length,
  );

  return (
    <DataGridTableFootRow>
      <DataGridTableFootRowCell colSpan={3}>Totals</DataGridTableFootRowCell>
      <DataGridTableFootRowCell>{totalProgress}% avg.</DataGridTableFootRowCell>
      <DataGridTableFootRowCell>{money(totalRevenue)}</DataGridTableFootRowCell>
      <DataGridTableFootRowCell colSpan={2} className="text-right">
        {demoRows.length} projects
      </DataGridTableFootRowCell>
    </DataGridTableFootRow>
  );
}

function footerSummary() {
  return (
    <DataGridTableFootRow>
      <DataGridTableFootRowCell colSpan={7}>
        Showing core project metrics across active, paused, and draft work.
      </DataGridTableFootRowCell>
    </DataGridTableFootRow>
  );
}

function footerAggregates() {
  const active = demoRows.filter((row) => row.status === "Active").length;
  const paused = demoRows.filter((row) => row.status === "Paused").length;
  const draft = demoRows.filter((row) => row.status === "Draft").length;

  return (
    <DataGridTableFootRow>
      <DataGridTableFootRowCell colSpan={2}>
        Aggregates
      </DataGridTableFootRowCell>
      <DataGridTableFootRowCell>{active} active</DataGridTableFootRowCell>
      <DataGridTableFootRowCell>{paused} paused</DataGridTableFootRowCell>
      <DataGridTableFootRowCell>{draft} draft</DataGridTableFootRowCell>
      <DataGridTableFootRowCell colSpan={2} className="text-right">
        {money(demoRows.reduce((sum, row) => sum + row.revenue, 0))}
      </DataGridTableFootRowCell>
    </DataGridTableFootRow>
  );
}

function PreviewGrid({
  data = demoRows,
  columns = baseColumns(),
  layout,
  tableClassNames,
  toolbar,
  footerContent,
  className,
  containerClassName,
  scrollArea,
  scrollAreaClassName,
  scrollAreaOrientation = "both",
  showPagination = true,
  paginationMore = false,
  loading = false,
  loadingMode,
  renderHeader = true,
  virtual = false,
  virtualHeight = 420,
  onRowClick,
  initialSorting,
  initialColumnVisibility,
  initialRowSelection,
  initialExpanded,
  initialPagination,
  initialColumnOrder,
  isFetchingMore = false,
  hasMore = false,
  onFetchMore,
  fetchMoreOffset = 0,
}: {
  data?: DemoRow[];
  columns?: ColumnDef<DemoRow>[];
  layout?: DataGridTableLayout;
  tableClassNames?: DataGridTableClassNames;
  toolbar?: React.ReactNode;
  footerContent?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  scrollArea?: boolean;
  scrollAreaClassName?: string;
  scrollAreaOrientation?: "horizontal" | "vertical" | "both";
  showPagination?: boolean;
  paginationMore?: boolean;
  loading?: boolean;
  loadingMode?: "skeleton" | "spinner";
  renderHeader?: boolean;
  virtual?: boolean;
  virtualHeight?: number | string;
  onRowClick?: (row: DemoRow) => void;
  initialSorting?: SortingState;
  initialColumnVisibility?: VisibilityState;
  initialRowSelection?: RowSelectionState;
  initialExpanded?: ExpandedState;
  initialPagination?: PaginationState;
  initialColumnOrder?: ColumnOrderState;
  isFetchingMore?: boolean;
  hasMore?: boolean;
  onFetchMore?: () => void;
  fetchMoreOffset?: number;
}) {
  const table = usePreviewTable({
    data,
    columns,
    layout,
    initialSorting,
    initialColumnVisibility,
    initialRowSelection,
    initialExpanded,
    initialPagination,
    initialColumnOrder,
  });

  return (
    <DataGrid
      table={table}
      recordCount={data.length}
      tableLayout={layout}
      tableClassNames={tableClassNames}
      onRowClick={onRowClick}
      isLoading={loading}
      loadingMode={loadingMode}
      fetchingMoreMessage="Fetching more records..."
      allRowsLoadedMessage="All records loaded"
    >
      <div className={cn("flex flex-col gap-4", className)}>
        {toolbar}
        {virtual ? (
          <DataGridTableVirtual
            height={virtualHeight}
            footerContent={footerContent}
            renderHeader={renderHeader}
            onFetchMore={onFetchMore}
            isFetchingMore={isFetchingMore}
            hasMore={hasMore}
            fetchMoreOffset={fetchMoreOffset}
          />
        ) : (
          <DataGridContainer className={containerClassName}>
            {scrollArea ? (
              <DataGridScrollArea
                orientation={scrollAreaOrientation}
                className={scrollAreaClassName}
              >
                <DataGridTable
                  footerContent={footerContent}
                  renderHeader={renderHeader}
                />
              </DataGridScrollArea>
            ) : (
              <DataGridTable
                footerContent={footerContent}
                renderHeader={renderHeader}
              />
            )}
          </DataGridContainer>
        )}
        {showPagination && !virtual ? (
          <DataGridPagination more={paginationMore} />
        ) : null}
      </div>
    </DataGrid>
  );
}

function ColumnControlsToolbar() {
  const table = usePreviewTable({
    data: demoRows,
    columns: baseColumns({ showIcons: true, showFilters: true }),
    layout: { headerBackground: true },
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative max-w-sm flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="h-9 pl-9" placeholder="Search projects..." />
      </div>
      <Button variant="outline" size="sm">
        <SlidersHorizontal className="size-4" />
        Filters
      </Button>
      <DataGridColumnVisibility
        table={table}
        trigger={
          <Button variant="outline" size="sm">
            <LayoutGrid className="size-4" />
            Columns
          </Button>
        }
      />
    </div>
  );
}

function ColumnVisibilityToolbar() {
  const table = usePreviewTable({
    data: demoRows,
    columns: baseColumns({ showIcons: true }),
    layout: { headerBackground: true },
  });

  return (
    <div className="flex justify-end">
      <DataGridColumnVisibility
        table={table}
        trigger={
          <Button variant="outline" size="sm">
            <LayoutGrid className="size-4" />
            Columns
          </Button>
        }
      />
    </div>
  );
}

function renderPatternGrid(
  props: React.ComponentProps<typeof PreviewGrid> & { className?: string },
) {
  return <PreviewGrid {...props} />;
}

function renderPatternShell(
  name: DataGridPatternName,
  children: React.ReactNode,
) {
  const pattern = dataGridPatternCatalog.find((item) => item.name === name);

  if (!pattern) {
    return null;
  }

  return (
    <PatternShell title={pattern.title} description={pattern.description}>
      {children}
    </PatternShell>
  );
}

export function renderDataGridPattern(name: DataGridPatternName) {
  switch (name) {
    case "basic":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            layout: { headerBackground: true, headerBorder: true },
            initialSorting: [{ id: "project", desc: false }],
          })}
        </Stage>,
      );
    case "cell-border":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            layout: {
              cellBorder: true,
              headerBackground: true,
              headerBorder: true,
            },
          })}
        </Stage>,
      );
    case "dense-table":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            layout: { dense: true, headerBackground: true },
          })}
        </Stage>,
      );
    case "light-table":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            layout: {
              headerBackground: false,
              headerBorder: false,
              rowBorder: false,
            },
            containerClassName: "border-0 shadow-none",
          })}
        </Stage>,
      );
    case "striped-table":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            layout: { stripped: true, headerBackground: true },
          })}
        </Stage>,
      );
    case "auto-width":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            layout: { width: "auto", headerBackground: true },
          })}
        </Stage>,
      );
    case "row-selection":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            columns: baseColumns({ showSelection: true, showActions: true }),
            layout: { headerBackground: true, rowBorder: true },
            initialRowSelection: { "proj-2": true, "proj-5": true },
          })}
        </Stage>,
      );
    case "expandable-row":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            initialExpanded: { "proj-1": true },
            columns: baseColumns({ showActions: true }),
            layout: { headerBackground: true },
          })}
        </Stage>,
      );
    case "sub-data-grid":
      return renderPatternShell(
        name,
        <Stage>
          <div className="flex flex-col gap-4">
            {renderPatternGrid({
              data: demoRows.slice(0, 3),
              columns: baseColumns({ showActions: true }),
              layout: { headerBackground: true },
              initialExpanded: { "proj-1": true },
            })}
            <div className="rounded-xl border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Nested work items</h4>
                  <p className="text-xs text-muted-foreground">
                    Detail table aligned under the selected project.
                  </p>
                </div>
                <Badge variant="outline">6 items</Badge>
              </div>
              {renderPatternGrid({
                data: demoRows[0].children ?? [],
                columns: baseColumns({ showSelection: true }).slice(0, 5),
                layout: {
                  dense: true,
                  headerBackground: false,
                  rowBorder: true,
                },
                showPagination: false,
              })}
            </div>
          </div>
        </Stage>,
      );
    case "column-icons":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            columns: baseColumns({ showIcons: true }),
            layout: { headerBackground: true },
          })}
        </Stage>,
      );
    case "sortable-columns":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            columns: baseColumns({ showIcons: true, showFilters: true }),
            layout: { headerBackground: true },
            initialSorting: [{ id: "progress", desc: true }],
          })}
        </Stage>,
      );
    case "movable-columns":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            columns: baseColumns({ showIcons: true, showDragHandle: true }),
            layout: { headerBackground: true, columnsMovable: true },
          })}
        </Stage>,
      );
    case "draggable-columns":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            columns: baseColumns({ showIcons: true, showDragHandle: true }),
            layout: {
              headerBackground: true,
              columnsDraggable: true,
              columnsPinnable: true,
            },
          })}
        </Stage>,
      );
    case "draggable-rows":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            columns: baseColumns({
              showIcons: true,
              showDragHandle: true,
              showActions: true,
            }),
            layout: { headerBackground: true, rowsDraggable: true },
          })}
        </Stage>,
      );
    case "resizable-columns":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            columns: baseColumns({ showIcons: true }),
            layout: {
              headerBackground: true,
              columnsResizable: true,
              width: "fixed",
            },
          })}
        </Stage>,
      );
    case "pinnable-columns":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            columns: baseColumns({ showIcons: true }),
            layout: { headerBackground: true, columnsPinnable: true },
          })}
        </Stage>,
      );
    case "sticky-header":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            columns: baseColumns({ showIcons: true }),
            layout: { headerBackground: true, headerSticky: true },
            scrollArea: true,
            scrollAreaClassName: "max-h-[360px]",
          })}
        </Stage>,
      );
    case "column-controls":
      return renderPatternShell(
        name,
        <Stage>
          <div className="flex flex-col gap-4">
            <ColumnControlsToolbar />
            {renderPatternGrid({
              columns: baseColumns({ showIcons: true, showFilters: true }),
              layout: { headerBackground: true, columnsVisibility: true },
            })}
          </div>
        </Stage>,
      );
    case "card-container":
      return renderPatternShell(
        name,
        <Stage>
          <Card className="overflow-hidden">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">Revenue board</CardTitle>
              <CardDescription>Compact card-framed data grid.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {renderPatternGrid({
                containerClassName: "border-0 rounded-none shadow-none",
                columns: baseColumns({ showIcons: true, showActions: true }),
                layout: { headerBackground: true },
              })}
            </CardContent>
          </Card>
        </Stage>,
      );
    case "column-visibility":
      return renderPatternShell(
        name,
        <Stage>
          <div className="flex flex-col gap-4">
            {renderPatternGrid({
              toolbar: <ColumnVisibilityToolbar />,
              columns: baseColumns({ showIcons: true }),
              layout: { headerBackground: true, columnsVisibility: true },
            })}
          </div>
        </Stage>,
      );
    case "loading-skeleton":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            columns: baseColumns({ showIcons: true }),
            layout: { headerBackground: true },
            loading: true,
            loadingMode: "skeleton",
          })}
        </Stage>,
      );
    case "crud":
      return renderPatternShell(
        name,
        <Stage>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button>
                  <Plus className="size-4" />
                  New project
                </Button>
                <Button variant="outline">
                  <PencilLine className="size-4" />
                  Bulk edit
                </Button>
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="h-9 pl-9" placeholder="Search..." />
              </div>
            </div>
            {renderPatternGrid({
              columns: baseColumns({
                showIcons: true,
                showActions: true,
                showSelection: true,
              }),
              layout: { headerBackground: true },
            })}
          </div>
        </Stage>,
      );
    case "crud-in-frame":
      return renderPatternShell(
        name,
        <Stage>
          <Card className="overflow-hidden">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">Project manager</CardTitle>
              <CardDescription>
                Actions framed for a settings-style workflow.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-6 pt-4">
                <Button variant="secondary">
                  <Plus className="size-4" />
                  Add row
                </Button>
                <Button variant="outline">
                  <SlidersHorizontal className="size-4" />
                  Settings
                </Button>
              </div>
              {renderPatternGrid({
                containerClassName: "border-0 rounded-none shadow-none",
                columns: baseColumns({
                  showIcons: true,
                  showActions: true,
                  showSelection: true,
                }),
                layout: { headerBackground: true },
              })}
            </CardContent>
          </Card>
        </Stage>,
      );
    case "footer-totals":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            columns: baseColumns({ showIcons: true }),
            layout: { headerBackground: true },
            footerContent: footerTotals(),
          })}
        </Stage>,
      );
    case "footer-summary":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            columns: baseColumns({ showIcons: true }),
            layout: { headerBackground: true },
            footerContent: footerSummary(),
          })}
        </Stage>,
      );
    case "footer-aggregates":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            columns: baseColumns({ showIcons: true }),
            layout: { headerBackground: true },
            footerContent: footerAggregates(),
          })}
        </Stage>,
      );
    case "infinite-scroll-local":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            columns: baseColumns({ showIcons: true, showActions: true }),
            layout: { headerBackground: true },
            virtual: true,
            virtualHeight: 380,
            data: virtualRows,
            onFetchMore: () => undefined,
          })}
        </Stage>,
      );
    case "infinite-scroll-remote":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            columns: baseColumns({ showIcons: true, showActions: true }),
            layout: { headerBackground: true },
            virtual: true,
            virtualHeight: 380,
            data: virtualRows,
            isFetchingMore: true,
            onFetchMore: () => undefined,
          })}
        </Stage>,
      );
    case "row-pinning":
      return renderPatternShell(
        name,
        <Stage>
          {renderPatternGrid({
            columns: baseColumns({ showIcons: true, showRowPin: true }),
            layout: { headerBackground: true, rowsPinnable: true },
            initialExpanded: { "proj-1": true },
          })}
        </Stage>,
      );
    default:
      return null;
  }
}

export {
  demoRows,
  footerAggregates,
  footerSummary,
  footerTotals,
  money,
  percentBar,
  statusBadge,
};
