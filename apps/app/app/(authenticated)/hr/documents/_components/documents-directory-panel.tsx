"use client";

import type { CustomizationLayerSet } from "@repo/customization/resolution";
import type { EntityMetadata } from "@repo/metadata";
import { EntityMetadataPanel } from "@repo/metadata-ui/components";
import type { MetadataRenderContext } from "@repo/metadata-ui/contracts";
import type { DashboardTableRow } from "@repo/ui";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";

export type DocumentsDirectoryPanelProps = {
  context: MetadataRenderContext;
  customizationLayers?: CustomizationLayerSet | null;
  defaultSortColumn?: string;
  description?: string;
  emptyDescription?: string;
  emptyTitle?: string;
  loadedDocumentCount: number;
  metadata: EntityMetadata;
  rows: readonly DashboardTableRow[];
  searchPlaceholder?: string;
  title?: string;
};

export function DocumentsDirectoryPanel({
  context,
  customizationLayers,
  defaultSortColumn,
  description,
  emptyDescription,
  emptyTitle,
  loadedDocumentCount,
  metadata,
  rows,
  searchPlaceholder,
  title,
}: DocumentsDirectoryPanelProps): ReactElement {
  const router = useRouter();

  return (
    <EntityMetadataPanel
      context={context}
      customizationLayers={customizationLayers}
      defaultSortColumn={defaultSortColumn}
      description={description}
      emptyDescription={emptyDescription}
      emptyTitle={emptyTitle}
      metadata={metadata}
      onRowClick={(row) => {
        if (typeof row.id === "string" && row.id.length > 0) {
          router.push(`/hr/documents/${row.id}`);
        }
      }}
      pageSize={10}
      rows={rows}
      searchPlaceholder={searchPlaceholder}
      title={title}
      totalRecords={loadedDocumentCount}
    />
  );
}
