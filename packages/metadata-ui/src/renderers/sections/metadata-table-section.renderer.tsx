import type { ReactElement } from "react";
import { MetadataTable } from "../../components/metadata-table";
import type { MetadataSectionRendererProps } from "../../contracts/section-renderer.contract";
import { MetadataSectionRenderer } from "./metadata-section.renderer";

export function MetadataTableSectionRenderer({
  children,
  context,
  section,
}: MetadataSectionRendererProps): ReactElement {
  const content =
    children ??
    (section.metadata ? (
      <MetadataTable
        context={context}
        metadata={section.metadata}
        rows={section.rows ?? []}
        showSearch
      />
    ) : null);

  return (
    <MetadataSectionRenderer context={context} section={section}>
      {content}
    </MetadataSectionRenderer>
  );
}
