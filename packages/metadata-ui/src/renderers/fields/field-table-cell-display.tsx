import type { ReactElement } from "react";
import type { StatusBadgeTone } from "../../components/status-badge";
import { StatusBadge } from "../../components/status-badge";
import type { MetadataRenderContext } from "../../contracts/render-context.contract";
import { METADATA_INTERACTIVE_LINK_CLASS } from "../../interaction/keyboard-focus-contract";
import {
  METADATA_STATUS_BADGE_CLASS,
  METADATA_TABLE_CELL_CONTENT_CLASS,
  METADATA_TABLE_LINK_CLASS,
  resolveMetadataDisplayValue,
  resolveMetadataTableCellClassName,
} from "../../visualization/content-length-visual-contract";

export function isMetadataTableCellSurface(
  context: MetadataRenderContext
): boolean {
  return context.surfaceRole === "table-cell";
}

export const resolveStatusTone = (value: string): StatusBadgeTone => {
  if (value === "active" || value === "success" || value === "verified") {
    return "success";
  }

  if (value === "pending" || value === "internal") {
    return "info";
  }

  if (
    value === "inactive" ||
    value === "denied" ||
    value === "pending_verification" ||
    value === "draft" ||
    value === "restricted"
  ) {
    return "warning";
  }

  if (
    value === "failure" ||
    value === "rejected" ||
    value === "expired" ||
    value === "confidential"
  ) {
    return "danger";
  }

  return "neutral";
};

export function renderMetadataTableCellSpan(
  content: string,
  className?: string,
  attributes?: Record<string, string | undefined>
): ReactElement {
  return (
    <span
      className={resolveMetadataTableCellClassName(className)}
      {...attributes}
    >
      {content}
    </span>
  );
}

export function renderMetadataTableCellStatus(
  value: string,
  label = value
): ReactElement {
  return (
    <StatusBadge tone={resolveStatusTone(value)}>
      <span className={METADATA_STATUS_BADGE_CLASS}>{label}</span>
    </StatusBadge>
  );
}

export function renderMetadataTableCellEmail(value: string): ReactElement {
  const displayValue = resolveMetadataDisplayValue(value);

  if (value.trim() === "") {
    return (
      <span className={METADATA_TABLE_CELL_CONTENT_CLASS}>{displayValue}</span>
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
