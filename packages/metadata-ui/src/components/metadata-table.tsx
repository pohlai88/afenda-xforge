import type { CustomizationContract } from "@repo/customization/contracts";
import { resolveCustomizedEntityMetadata } from "@repo/customization/resolution";
import type { EntityLabels, EntityMetadata } from "@repo/metadata";
import type { DashboardTableRow, TableColumnMetadata } from "@repo/ui";
import { Card, CardContent, CardHeader, Separator } from "@repo/ui";
import type { ReactElement } from "react";

import type { MetadataRenderContext } from "../contracts/render-context.contract";
import { createMetadataRenderContext } from "../contracts/render-context.defaults";
import { ActivityTable } from "./activity-table";
import { renderMetadataTableCell } from "./metadata-cell-renderers";
import { MetadataToolbar } from "./metadata-toolbar";

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

export function MetadataTable({
  context: _context,
  customization,
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
}: MetadataTableProps): ReactElement {
  const resolvedMetadata = resolveCustomizedEntityMetadata(
    metadata,
    customization
  );
  const labels = getEntityLabels(resolvedMetadata);
  const columns = getMetadataColumns(resolvedMetadata);

  return (
    <ActivityTable
      columns={columns}
      defaultSortColumn={
        defaultSortColumn ?? resolvedMetadata.table?.defaultSort
      }
      emptyDescription={emptyDescription}
      emptyTitle={emptyTitle}
      error={error}
      forbidden={forbidden}
      loading={loading}
      onRetry={onRetry}
      onRowClick={onRowClick}
      pageSize={pageSize}
      renderCell={(
        column: TableColumnMetadata,
        value: unknown
      ): ReactElement | null => renderMetadataTableCell(column, value)}
      rows={rows}
      searchPlaceholder={
        searchPlaceholder ?? `Search ${labels.plural.toLowerCase()}...`
      }
      showSearch={showSearch}
      surface={surface}
    />
  );
}

export type MetadataPanelProps = MetadataTableProps & {
  description?: string;
  title?: string;
  totalRecords?: number;
};

export function MetadataPanel({
  context,
  customization,
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
}: MetadataPanelProps): ReactElement {
  const resolvedMetadata = resolveCustomizedEntityMetadata(
    metadata,
    customization
  );
  const summary = getMetadataSummary(
    resolvedMetadata,
    totalRecords ?? rows.length
  );
  const resolvedContext = createMetadataRenderContext(context, {
    mode: "read",
  });

  return (
    <Card className="overflow-hidden border-border bg-card/95 shadow-sm">
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
          title={title ?? resolvedMetadata.title ?? summary.labels.plural}
        />
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        <MetadataTable
          context={context}
          customization={customization}
          defaultSortColumn={defaultSortColumn}
          emptyDescription={emptyDescription}
          emptyTitle={emptyTitle}
          error={error}
          forbidden={forbidden}
          loading={loading}
          metadata={metadata}
          onRetry={onRetry}
          onRowClick={onRowClick}
          pageSize={pageSize}
          rows={rows}
          searchPlaceholder={searchPlaceholder}
          showSearch={showSearch}
          surface="embedded"
        />
      </CardContent>
    </Card>
  );
}

export const EntityMetadataTable: typeof MetadataTable = MetadataTable;
export const EntityMetadataPanel: typeof MetadataPanel = MetadataPanel;
