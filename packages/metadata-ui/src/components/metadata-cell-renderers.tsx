import type { TableColumnMetadata } from "@repo/ui";
import type { ReactElement } from "react";

import type { MetadataRenderContext } from "../contracts/render-context.contract";
import { formatMetadataTableCellValue } from "../formatting/metadata-value-formatter";
import { METADATA_INTERACTIVE_LINK_CLASS } from "../interaction/keyboard-focus-contract";
import {
  METADATA_STATUS_BADGE_CLASS,
  METADATA_TABLE_CELL_CONTENT_CLASS,
  METADATA_TABLE_LINK_CLASS,
  resolveMetadataDisplayValue,
  resolveMetadataTableCellClassName,
} from "../visualization/content-length-visual-contract";
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
  <StatusBadge tone={resolveStatusTone(value)}>
    <span className={METADATA_STATUS_BADGE_CLASS}>{label}</span>
  </StatusBadge>
);

export function renderMetadataTableCell(
  column: TableColumnMetadata,
  value: unknown,
  context: Pick<MetadataRenderContext, "locale" | "timezone">
): ReactElement | null {
  if (column.kind === "status" && typeof value === "string") {
    return renderMetadataStatus(value, resolveMetadataDisplayValue(value));
  }

  if (column.kind === "email" && typeof value === "string") {
    const displayValue = resolveMetadataDisplayValue(value);

    if (value.trim() === "") {
      return (
        <span className={METADATA_TABLE_CELL_CONTENT_CLASS}>
          {displayValue}
        </span>
      );
    }

    return (
      <a
        className={`${METADATA_INTERACTIVE_LINK_CLASS} ${METADATA_TABLE_LINK_CLASS}`}
        href={`mailto:${value}`}
        title={value}
      >
        {displayValue}
      </a>
    );
  }

  const formattedValue = formatMetadataTableCellValue(
    value,
    column.kind,
    context
  );

  if (formattedValue !== null) {
    return (
      <span
        className={resolveMetadataTableCellClassName("tabular-nums")}
        data-locale-formatted={column.kind}
        title={formattedValue}
      >
        {formattedValue}
      </span>
    );
  }

  return null;
}
