"use client";

import type { CustomizationLayerSet } from "@repo/customization/resolution";
import type { EntityMetadata } from "@repo/metadata";
import { EntityMetadataPanel } from "@repo/metadata-ui/components";
import type { MetadataRenderContext } from "@repo/metadata-ui/contracts";
import type { DashboardTableRow } from "@repo/ui";
import type { ReactElement } from "react";
import { useTranslations } from "next-intl";

export type DocumentsDirectoryPanelProps = {
  context: MetadataRenderContext;
  customizationLayers?: CustomizationLayerSet | null;
  defaultSortColumn?: string;
  description?: string;
  emptyDescription?: string;
  emptyTitle?: string;
  loadedDocumentCount: number;
  metadata: EntityMetadata;
  onRowSelect?: (row: DashboardTableRow) => void;
  rows: readonly DashboardTableRow[];
  searchPlaceholder?: string;
  selectedDocumentId?: string | null;
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
  onRowSelect,
  rows,
  searchPlaceholder,
  selectedDocumentId,
  title,
}: DocumentsDirectoryPanelProps): ReactElement {
  const tShortcuts = useTranslations("workspace.keyboardShortcuts");

  return (
    <section className="space-y-3">
      {selectedDocumentId ? (
        <p className="text-muted-foreground text-xs">
          {tShortcuts("selectedRow.openDocument")}
        </p>
      ) : null}
      <EntityMetadataPanel
        context={context}
        customizationLayers={customizationLayers}
        defaultSortColumn={defaultSortColumn}
        description={description}
        emptyDescription={emptyDescription}
        emptyTitle={emptyTitle}
        metadata={metadata}
        onRowClick={(row) => {
          onRowSelect?.(row);
        }}
        pageSize={10}
        rows={rows}
        searchPlaceholder={searchPlaceholder}
        selectedRowId={selectedDocumentId}
        title={title}
        totalRecords={loadedDocumentCount}
      />
    </section>
  );
}
