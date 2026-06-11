"use client";

import type { CustomizationLayerSet } from "@repo/customization/resolution";
import type { EntityMetadata } from "@repo/metadata";
import type { MetadataRenderContext } from "@repo/metadata-ui/contracts";
import type { StorageProviderKind } from "@repo/storage/types";
import type { DashboardTableRow } from "@repo/ui";
import { toast } from "@repo/ui";
import type { ReactElement } from "react";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { deleteHrDocument } from "../../../../../../lib/hr-documents/document-api.client.ts";
import type {
  FocusedShortcutTarget,
  ShortcutActionId,
} from "../../../../../../lib/workspace-shortcuts/contract.ts";
import { useStableFocusedShortcutTarget } from "../../../../../_components/workspace/keyboard-shortcuts/use-stable-focused-shortcut-target.ts";
import { DocumentUploadForm } from "../document-upload-form.tsx";
import { DocumentsDirectoryPanel } from "./documents-directory-panel.tsx";

type DocumentsWorkspaceShellProps = {
  canWrite: boolean;
  context: MetadataRenderContext;
  customizationLayers?: CustomizationLayerSet | null;
  defaultSortColumn?: string;
  directoryDescription?: string;
  directoryTitle?: string;
  emptyDescription?: string;
  emptyTitle?: string;
  loadedDocumentCount: number;
  metadata: EntityMetadata;
  requestHeaders: Readonly<Record<string, string>>;
  rows: readonly DashboardTableRow[];
  searchPlaceholder?: string;
  storageProvider: StorageProviderKind;
};

type ActiveSurface = "form" | "grid";

export function DocumentsWorkspaceShell({
  canWrite,
  context,
  customizationLayers,
  defaultSortColumn,
  directoryDescription,
  directoryTitle,
  emptyDescription,
  emptyTitle,
  loadedDocumentCount,
  metadata,
  requestHeaders,
  rows,
  searchPlaceholder,
  storageProvider,
}: DocumentsWorkspaceShellProps): ReactElement {
  const router = useRouter();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const [activeSurface, setActiveSurface] = useState<ActiveSurface>(
    canWrite ? "form" : "grid"
  );
  const submitRef = useRef<(() => void) | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);
  const createRef = useRef<(() => void) | null>(null);

  useStableFocusedShortcutTarget((): FocusedShortcutTarget | null => {
    const handlers: Partial<Record<ShortcutActionId, () => void>> = {};

    if (canWrite && activeSurface === "form") {
      handlers["crud.save"] = () => submitRef.current?.();
      handlers["crud.cancel"] = () => cancelRef.current?.();
      handlers["crud.create"] = () => createRef.current?.();
    }

    if (activeSurface === "grid" && selectedDocumentId) {
      handlers["crud.edit"] = () => {
        router.push(`/hr/documents/${selectedDocumentId}`);
      };
      handlers["crud.delete"] = () => {
        if (!canWrite) {
          toast.message("You do not have permission to delete documents.");
          return;
        }

        deleteHrDocument({
          documentId: selectedDocumentId,
          requestHeaders,
        })
          .then(() => {
            toast.message("Document deleted.");
            setSelectedDocumentId(null);
            router.refresh();
          })
          .catch((error: unknown) => {
            toast.message(
              error instanceof Error
                ? error.message
                : "Unable to delete document."
            );
          });
      };
    }

    if (Object.keys(handlers).length === 0) {
      return null;
    }

    return {
      targetId:
        activeSurface === "form"
          ? "documents-upload-form"
          : (selectedDocumentId ?? "documents-grid"),
      targetType: activeSurface === "form" ? "form" : "record",
      handlers,
    };
  }, [activeSurface, canWrite, requestHeaders, router, selectedDocumentId]);

  const handleRowSelect = useCallback((row: DashboardTableRow) => {
    if (typeof row.id !== "string" || row.id.length === 0) {
      return;
    }

    setSelectedDocumentId(row.id);
    setActiveSurface("grid");
  }, []);

  const registerShortcutHandlers = useCallback(
    (handlers: {
      cancel: () => void;
      create: () => void;
      submit: () => void;
    }) => {
      submitRef.current = handlers.submit;
      cancelRef.current = handlers.cancel;
      createRef.current = handlers.create;
    },
    []
  );

  return (
    <>
      {canWrite ? (
        <div
          onFocusCapture={() => setActiveSurface("form")}
          onPointerDownCapture={() => setActiveSurface("form")}
        >
          <DocumentUploadForm
            context={context}
            customizationLayers={customizationLayers}
            metadata={metadata}
            onRegisterShortcutHandlers={registerShortcutHandlers}
            requestHeaders={requestHeaders}
            storageProvider={storageProvider}
          />
        </div>
      ) : null}

      <div
        onFocusCapture={() => setActiveSurface("grid")}
        onPointerDownCapture={() => setActiveSurface("grid")}
      >
        <DocumentsDirectoryPanel
          context={context}
          customizationLayers={customizationLayers}
          defaultSortColumn={defaultSortColumn}
          description={directoryDescription}
          emptyDescription={emptyDescription}
          emptyTitle={emptyTitle}
          loadedDocumentCount={loadedDocumentCount}
          metadata={metadata}
          onRowSelect={handleRowSelect}
          rows={rows}
          searchPlaceholder={searchPlaceholder}
          selectedDocumentId={selectedDocumentId}
          title={directoryTitle}
        />
      </div>
    </>
  );
}
