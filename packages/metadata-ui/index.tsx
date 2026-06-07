import type {
  DashboardTableRow,
  EntityLabels,
  EntityMetadata,
  TableColumnMetadata,
} from "@repo/metadata";
import { ActivityTable } from "@repo/ui/components/activity-table";
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

type EntityMetadataTableProps = {
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
    />
  );
};
