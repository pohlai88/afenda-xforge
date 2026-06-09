import type { EntityMetadata } from "@repo/metadata";
import type { DashboardTableRow, DashboardTableValue } from "@repo/ui/types";
import type { ReactElement } from "react";

import { MetadataTable } from "../../components/metadata-table";
import type {
  MetadataSectionMetadata,
  MetadataSectionRendererProps,
  MetadataSectionRow,
} from "../../contracts/section-renderer.contract";
import { MetadataSectionRenderer } from "./metadata-section.renderer";

const isEntityMetadata = (
  value: MetadataSectionMetadata | undefined
): value is EntityMetadata =>
  Boolean(
    value && typeof value === "object" && "entity" in value && "labels" in value
  );

const isDashboardTableValue = (value: unknown): value is DashboardTableValue =>
  value === null ||
  value === undefined ||
  typeof value === "boolean" ||
  typeof value === "number" ||
  typeof value === "string" ||
  value instanceof Date;

const isDashboardTableRow = (
  value: MetadataSectionRow
): value is DashboardTableRow =>
  Object.values(value).every(isDashboardTableValue);

const toDashboardRows = (
  rows: readonly MetadataSectionRow[] | undefined
): readonly DashboardTableRow[] | undefined =>
  rows?.every(isDashboardTableRow) ? rows : undefined;

export function MetadataTableSectionRenderer({
  children,
  context,
  section,
}: MetadataSectionRendererProps): ReactElement {
  const metadata = isEntityMetadata(section.metadata)
    ? section.metadata
    : undefined;
  const rows = toDashboardRows(section.rows);

  const content =
    children ??
    (metadata ? (
      <MetadataTable
        context={context}
        metadata={metadata}
        rows={rows ?? []}
        showSearch
      />
    ) : null);

  return (
    <MetadataSectionRenderer context={context} section={section}>
      {content}
    </MetadataSectionRenderer>
  );
}
