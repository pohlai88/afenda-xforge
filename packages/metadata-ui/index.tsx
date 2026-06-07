import type {
  DashboardTableRow,
  EntityLabels,
  EntityMetadata,
  TableColumnMetadata,
} from "@repo/metadata";
import { ActivityTable } from "@repo/ui/components/activity-table";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import type { StatusBadgeTone } from "@repo/ui/components/status-badge";
import { StatusBadge } from "@repo/ui/components/status-badge";
import type { ReactElement } from "react";

export const getEntityLabels = (metadata: EntityMetadata): EntityLabels =>
  metadata.labels;

export const getMetadataColumns = (
  metadata: EntityMetadata
): readonly TableColumnMetadata[] => metadata.table?.columns ?? [];

export const resolveStatusTone = (value: string): StatusBadgeTone => {
  if (value === "active") {
    return "success";
  }

  if (value === "pending" || value === "draft") {
    return "info";
  }

  if (value === "inactive") {
    return "warning";
  }

  return "neutral";
};

export const renderMetadataStatus = (
  value: string,
  label = value
): ReactElement => (
  <StatusBadge tone={resolveStatusTone(value)}>{label}</StatusBadge>
);

export type EntityMetadataTableProps = {
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

export const EntityMetadataTable = ({
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
}: EntityMetadataTableProps): ReactElement => {
  const labels = getEntityLabels(metadata);
  const columns = getMetadataColumns(metadata);

  return (
    <ActivityTable
      columns={columns}
      defaultSortColumn={defaultSortColumn ?? metadata.table?.defaultSort}
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
      ): ReactElement | null => {
        if (column.kind === "status" && typeof value === "string") {
          return renderMetadataStatus(value);
        }

        if (column.kind === "email" && typeof value === "string" && value) {
          return (
            <a
              className="font-medium text-foreground underline-offset-4 hover:underline"
              href={`mailto:${value}`}
            >
              {value}
            </a>
          );
        }

        return null;
      }}
      rows={rows}
      searchPlaceholder={
        searchPlaceholder ?? `Search ${labels.plural.toLowerCase()}...`
      }
      showSearch={showSearch}
      surface={surface}
    />
  );
};

export type EntityMetadataPanelProps = EntityMetadataTableProps & {
  description?: string;
  title?: string;
  totalRecords?: number;
};

export const getMetadataSummary = (
  metadata: EntityMetadata,
  totalRecords: number
): {
  columnCount: number;
  defaultSort: string | null;
  labels: EntityLabels;
  totalRecords: number;
} => ({
  columnCount: getMetadataColumns(metadata).length,
  defaultSort: metadata.table?.defaultSort ?? null,
  labels: getEntityLabels(metadata),
  totalRecords,
});

export const EntityMetadataPanel = ({
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
}: EntityMetadataPanelProps): ReactElement => {
  const summary = getMetadataSummary(metadata, totalRecords ?? rows.length);

  return (
    <Card className="overflow-hidden border-border bg-card/95 shadow-sm">
      <CardHeader className="gap-3 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{metadata.entity}</Badge>
              <Badge variant="secondary">
                {summary.totalRecords} record
                {summary.totalRecords === 1 ? "" : "s"}
              </Badge>
              <Badge variant="neutral">
                {summary.columnCount} column
                {summary.columnCount === 1 ? "" : "s"}
              </Badge>
              {summary.defaultSort ? (
                <Badge variant="info">Sort: {summary.defaultSort}</Badge>
              ) : null}
            </div>

            <div className="space-y-1">
              <CardTitle>{title ?? summary.labels.plural}</CardTitle>
              <CardDescription>
                {description ??
                  `Metadata-driven ${summary.labels.plural.toLowerCase()} surface with tenant-ready search, sorting, and state handling.`}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        <EntityMetadataTable
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
};
