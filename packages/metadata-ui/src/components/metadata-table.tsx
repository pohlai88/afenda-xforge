import type { CustomizationContract } from "@repo/customization/contracts";
import type {
  CustomizationLayerSet,
  LayeredCustomizationResolutionOptions,
} from "@repo/customization/resolution";
import {
  resolveCustomizedEntityMetadata,
  resolveLayeredCustomizedEntityMetadata,
} from "@repo/customization/resolution";
import type { EntityLabels, EntityMetadata } from "@repo/metadata";
import type { DashboardTableRow, TableColumnMetadata } from "@repo/ui";
import { Card, CardContent, CardHeader, Separator } from "@repo/ui";
import type { ReactElement } from "react";

import type { MetadataRenderAdapterResult } from "../adapters/adapter-result";
import { emitMetadataTelemetry } from "../adapters/telemetry";
import type { MetadataDiagnostic } from "../contracts/diagnostics.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import { createMetadataRenderContext } from "../contracts/render-context.defaults";
import {
  resolveSurfaceKindProps,
  resolveSurfaceShellClassName,
} from "../visualization/surface-visual-contract";
import { ActivityTable } from "./activity-table";
import { composeMetadataWithDiagnostics } from "./compose-metadata-with-diagnostics";
import { renderMetadataTableCell } from "./metadata-cell-renderers";
import { MetadataSurfaceRegion } from "./metadata-surface-region";
import { MetadataToolbar } from "./metadata-toolbar";

const cn = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(" ");

type MetadataToolbarBadge = {
  label: string;
  variant?:
    | "destructive"
    | "info"
    | "neutral"
    | "outline"
    | "primary"
    | "secondary"
    | "success"
    | "warning";
};

const supportedTableCellKinds = new Set([
  "date",
  "email",
  "money",
  "status",
  "text",
]);

const resolveMetadataSurfaceKey = (metadata: EntityMetadata): string =>
  metadata.id ?? metadata.entity;

const createMetadataTableCellDiagnostic = (
  context: MetadataRenderContext,
  column: TableColumnMetadata
): MetadataDiagnostic => ({
  code: "missing-renderer",
  correlationId: context.correlationId,
  details: {
    columnKind: column.kind ?? "text",
    fallback: "formatted-text",
  },
  message: `No metadata table renderer is registered for column '${column.key}' with kind '${column.kind}'. Rendering formatted text instead.`,
  severity: "warning",
  target: column.key,
  timestamp: new Date().toISOString(),
});

const getResolvedMetadata = (
  metadata: EntityMetadata,
  customization?: CustomizationContract | null,
  customizationLayers?: CustomizationLayerSet | null,
  customizationOptions?: LayeredCustomizationResolutionOptions
): EntityMetadata =>
  customizationLayers
    ? resolveLayeredCustomizedEntityMetadata(
        metadata,
        customizationLayers,
        customizationOptions
      )
    : resolveCustomizedEntityMetadata(metadata, customization);

const getMetadataTableDiagnostics = (
  context: MetadataRenderContext,
  columns: readonly TableColumnMetadata[]
): readonly MetadataDiagnostic[] =>
  columns.flatMap((column) =>
    column.kind && !supportedTableCellKinds.has(column.kind)
      ? [createMetadataTableCellDiagnostic(context, column)]
      : []
  );

export const getEntityLabels = (metadata: EntityMetadata): EntityLabels =>
  metadata.labels;

export const getMetadataColumns = (
  metadata: EntityMetadata
): readonly TableColumnMetadata[] => metadata.table?.columns ?? [];

export const getMetadataSummary = (
  metadata: EntityMetadata,
  totalRecords: number
): {
  columnCount: number;
  defaultSort: string | null;
  filterCount: number;
  labels: EntityLabels;
  sectionCount: number;
  stateCount: number;
  totalRecords: number;
} => ({
  columnCount: getMetadataColumns(metadata).length,
  defaultSort: metadata.table?.defaultSort ?? null,
  filterCount: metadata.filters?.length ?? 0,
  labels: getEntityLabels(metadata),
  sectionCount: metadata.sections?.length ?? 0,
  stateCount: metadata.states?.length ?? 0,
  totalRecords,
});

export type MetadataTableProps = {
  context?: Partial<MetadataRenderContext>;
  customization?: CustomizationContract | null;
  customizationLayers?: CustomizationLayerSet | null;
  customizationOptions?: LayeredCustomizationResolutionOptions;
  defaultSortColumn?: string;
  emptyDescription?: string;
  emptyTitle?: string;
  error?: string | null;
  forbidden?: boolean;
  loading?: boolean;
  metadata: EntityMetadata;
  onRetry?: () => void;
  onRowClick?: (row: DashboardTableRow) => void;
  pageSize?: number;
  rows: readonly DashboardTableRow[];
  searchPlaceholder?: string;
  showSearch?: boolean;
  surface?: "contained" | "embedded";
};

export type MetadataTableRenderResult =
  MetadataRenderAdapterResult<ReactElement>;

export function renderMetadataTableResult({
  context,
  customization,
  customizationLayers,
  customizationOptions,
  defaultSortColumn,
  emptyDescription,
  emptyTitle,
  error,
  forbidden = false,
  loading = false,
  metadata,
  onRetry,
  onRowClick,
  pageSize,
  rows,
  searchPlaceholder,
  showSearch = true,
  surface = "contained",
}: MetadataTableProps): MetadataTableRenderResult {
  const resolvedMetadata = getResolvedMetadata(
    metadata,
    customization,
    customizationLayers,
    customizationOptions
  );
  const resolvedContext = createMetadataRenderContext(context, {
    mode: "read",
    surfaceId: `metadata-table:${resolveMetadataSurfaceKey(resolvedMetadata)}`,
  });
  const labels = getEntityLabels(resolvedMetadata);
  const columns = getMetadataColumns(resolvedMetadata);
  const diagnostics = getMetadataTableDiagnostics(resolvedContext, columns);

  emitMetadataTelemetry(resolvedContext, "metadata.table.render.started", {
    attributes: {
      columnCount: columns.length,
      forbidden,
      loading,
      rowCount: rows.length,
      surface,
    },
    diagnostics,
    level: "debug",
    rendererKey: "table",
  });

  const element = (
    <ActivityTable
      columns={columns}
      defaultSortColumn={
        defaultSortColumn ?? resolvedMetadata.table?.defaultSort
      }
      density={resolvedContext.density}
      emptyDescription={emptyDescription}
      emptyTitle={emptyTitle}
      error={error}
      forbidden={forbidden}
      loading={loading}
      locale={resolvedContext.locale}
      onRetry={onRetry}
      onRowClick={onRowClick}
      pageSize={pageSize}
      renderCell={(
        column: TableColumnMetadata,
        value: unknown
      ): ReactElement | null =>
        renderMetadataTableCell(column, value, resolvedContext)
      }
      rows={rows}
      searchAriaLabel={`Search ${labels.plural.toLowerCase()}`}
      searchPlaceholder={
        searchPlaceholder ?? `Search ${labels.plural.toLowerCase()}...`
      }
      showSearch={showSearch}
      surface={surface}
      timezone={resolvedContext.timezone}
    />
  );

  emitMetadataTelemetry(resolvedContext, "metadata.table.render.completed", {
    attributes: {
      columnCount: columns.length,
      diagnosticsCount: diagnostics.length,
      forbidden,
      loading,
      rowCount: rows.length,
      surface,
    },
    diagnostics,
    level: "info",
    rendererKey: "table",
  });

  return {
    diagnostics,
    element: composeMetadataWithDiagnostics(
      resolvedContext,
      element,
      diagnostics
    ),
  };
}

export function MetadataTable(props: MetadataTableProps): ReactElement {
  return renderMetadataTableResult(props).element;
}

export type MetadataPanelProps = MetadataTableProps & {
  description?: string;
  title?: string;
  totalRecords?: number;
};

export type MetadataPanelRenderResult =
  MetadataRenderAdapterResult<ReactElement>;

export function renderMetadataPanelResult({
  context,
  customization,
  customizationLayers,
  customizationOptions,
  defaultSortColumn,
  description,
  emptyDescription,
  emptyTitle,
  error,
  forbidden,
  loading,
  metadata,
  onRetry,
  onRowClick,
  pageSize,
  rows,
  searchPlaceholder,
  showSearch,
  title,
  totalRecords,
}: MetadataPanelProps): MetadataPanelRenderResult {
  const resolvedMetadata = getResolvedMetadata(
    metadata,
    customization,
    customizationLayers,
    customizationOptions
  );
  const summary = getMetadataSummary(
    resolvedMetadata,
    totalRecords ?? rows.length
  );
  const panelSurfaceId = `metadata-panel:${resolveMetadataSurfaceKey(
    resolvedMetadata
  )}`;
  const resolvedContext = createMetadataRenderContext(context, {
    mode: "read",
    surfaceId: panelSurfaceId,
  });
  const tableResult = renderMetadataTableResult({
    context: {
      ...resolvedContext,
      surfaceId: `${resolvedContext.surfaceId ?? panelSurfaceId}/table`,
    },
    customization,
    customizationLayers,
    customizationOptions,
    defaultSortColumn,
    emptyDescription,
    emptyTitle,
    error,
    forbidden,
    loading,
    metadata,
    onRetry,
    onRowClick,
    pageSize,
    rows,
    searchPlaceholder,
    showSearch,
    surface: "embedded",
  });

  emitMetadataTelemetry(resolvedContext, "metadata.panel.render.started", {
    attributes: {
      columnCount: summary.columnCount,
      recordCount: summary.totalRecords,
      stateCount: summary.stateCount,
    },
    diagnostics: tableResult.diagnostics,
    level: "debug",
    rendererKey: "panel",
  });

  const element = (
    <Card
      className={cn(
        "overflow-hidden border-border bg-card/95 shadow-sm",
        resolveSurfaceShellClassName("list")
      )}
      {...resolveSurfaceKindProps("list")}
    >
      <CardHeader className="gap-3 pb-4">
        <MetadataToolbar
          badges={
            [
              {
                label: metadata.entity,
                variant: "outline",
              },
              {
                label: `${summary.totalRecords} record${
                  summary.totalRecords === 1 ? "" : "s"
                }`,
                variant: "secondary",
              },
              {
                label: `${summary.columnCount} column${
                  summary.columnCount === 1 ? "" : "s"
                }`,
                variant: "neutral",
              },
              summary.filterCount
                ? {
                    label: `${summary.filterCount} filter${
                      summary.filterCount === 1 ? "" : "s"
                    }`,
                    variant: "secondary",
                  }
                : undefined,
              summary.stateCount
                ? {
                    label: `${summary.stateCount} state${
                      summary.stateCount === 1 ? "" : "s"
                    }`,
                    variant: "info",
                  }
                : undefined,
              summary.defaultSort
                ? {
                    label: `Sort: ${summary.defaultSort}`,
                    variant: "info",
                  }
                : undefined,
            ].filter(Boolean) as readonly MetadataToolbarBadge[]
          }
          context={resolvedContext}
          description={
            description ??
            resolvedMetadata.description ??
            `Metadata-driven ${summary.labels.plural.toLowerCase()} surface with tenant-ready search, sorting, and state handling.`
          }
          surfaceKind="list"
          title={title ?? resolvedMetadata.title ?? summary.labels.plural}
        />
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        <MetadataSurfaceRegion kind="list" region="primary">
          {tableResult.element}
        </MetadataSurfaceRegion>
      </CardContent>
    </Card>
  );

  emitMetadataTelemetry(resolvedContext, "metadata.panel.render.completed", {
    attributes: {
      columnCount: summary.columnCount,
      diagnosticsCount: tableResult.diagnostics.length,
      recordCount: summary.totalRecords,
      stateCount: summary.stateCount,
    },
    diagnostics: tableResult.diagnostics,
    level: "info",
    rendererKey: "panel",
  });

  return {
    diagnostics: tableResult.diagnostics,
    element: composeMetadataWithDiagnostics(
      resolvedContext,
      element,
      tableResult.diagnostics
    ),
  };
}

export function MetadataPanel(props: MetadataPanelProps): ReactElement {
  return renderMetadataPanelResult(props).element;
}

export const EntityMetadataTable: typeof MetadataTable = MetadataTable;
export const EntityMetadataPanel: typeof MetadataPanel = MetadataPanel;
