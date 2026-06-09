import type { TableColumnMetadata } from "@repo/ui";
import type { ReactElement } from "react";

import type { StatusBadgeTone } from "./status-badge";
import { StatusBadge } from "./status-badge";

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

export function renderMetadataTableCell(
  column: TableColumnMetadata,
  value: unknown
): ReactElement | null {
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
}
