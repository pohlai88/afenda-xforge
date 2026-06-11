import type { CustomizationLayerSet } from "@repo/customization/resolution";
import type { DocumentsManagementDocumentSummaryProjection } from "@repo/features-employee-management-documents-management";
import type { EntityMetadata } from "@repo/metadata";
import type { MetadataRenderContext } from "@repo/metadata-ui/contracts";
import {
  MetadataSectionStack,
} from "@repo/metadata-ui/components";
import type { StorageProviderKind } from "@repo/storage/types";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import type { ReactElement } from "react";
import { AuthenticatedFeatureScope } from "../../../_components/authenticated-feature-scope.tsx";
import { StatusBadge } from "../../_components/status-badge.tsx";
import type { HrDocumentsPageData } from "./_data.ts";
import { DocumentsDirectoryPanel } from "./_components/documents-directory-panel.tsx";
import { DocumentUploadForm } from "./document-upload-form.tsx";

const HR_DOCUMENTS_FEATURE_ID =
  "hr-suite.employee-management.documents-management";

export type DocumentsViewProps = {
  context: MetadataRenderContext;
  customizationLayers?: CustomizationLayerSet | null;
  data: HrDocumentsPageData;
  metadata: EntityMetadata;
  storageProvider: StorageProviderKind;
};

const humanizeValue = (value: string): string =>
  value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const toDocumentTableRows = (
  documents: readonly DocumentsManagementDocumentSummaryProjection[]
) =>
  documents.map((document) => ({
    currentVersionNumber: document.currentVersionNumber ?? "n/a",
    documentCategory: humanizeValue(document.documentCategory),
    documentType: humanizeValue(document.documentType),
    employeeId: document.employeeId,
    expiresAt: document.expiresAt,
    id: document.id,
    mandatory: document.mandatory ? "Yes" : "No",
    renewalDueAt: document.renewalDueAt,
    status: document.status,
    title: document.title,
    updatedAt: document.updatedAt,
    visibility: document.visibility,
  }));

export function DocumentsView({
  context,
  customizationLayers,
  data,
  metadata,
  storageProvider,
}: DocumentsViewProps): ReactElement {
  const uploadModeLabel = data.access.canWrite ? "Upload enabled" : "Read only";
  const expiringSoonLabel =
    data.expiringSoonDocumentCount === 0
      ? "No expiring documents in view"
      : `${data.expiringSoonDocumentCount} expiring soon`;

  const kpiSections = [
    {
      description: "Loaded",
      key: "documents-kpi-count",
      kind: "stat" as const,
      metadataAttributes: {
        tone: "primary",
        value: data.loadedDocumentCount,
      },
      title: "Document count",
    },
    {
      description: "Lifecycle",
      key: "documents-kpi-verified",
      kind: "stat" as const,
      metadataAttributes: {
        tone: "success",
        value: data.verifiedDocumentCount,
      },
      title: "Verified",
    },
    {
      description: "Compliance",
      key: "documents-kpi-mandatory",
      kind: "stat" as const,
      metadataAttributes: {
        tone: "warning",
        value: data.mandatoryDocumentCount,
      },
      title: "Mandatory",
    },
    {
      description: "Access",
      key: "documents-kpi-write",
      kind: "stat" as const,
      metadataAttributes: {
        tone: data.access.canWrite ? "info" : "warning",
        value: data.access.canWrite ? "Enabled" : "Read only",
      },
      title: "Write mode",
    },
  ];

  return (
    <AuthenticatedFeatureScope featureId={HR_DOCUMENTS_FEATURE_ID}>
      <section className="space-y-8">
        <header className="rounded-xl border border-border bg-card/95 p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
                  XForge
                </p>
                <h1 className="font-semibold text-4xl tracking-tight">
                  Document storage
                </h1>
                <p className="max-w-3xl text-muted-foreground">
                  Tenant-scoped document browsing, provider-selected direct
                  uploads for large files, and secured API uploads for smaller
                  files.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="secondary">Tenant {data.tenantId}</Badge>
                <Badge variant="outline">Role {data.tenantRole}</Badge>
                <Badge variant="outline">Storage {storageProvider}</Badge>
                <Badge variant="secondary">{uploadModeLabel}</Badge>
                <Badge variant="outline">{expiringSoonLabel}</Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="outline">
                <Link href="/hr">Back to HR hub</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">Back to dashboard</Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpiSections.map((section) => (
              <MetadataSectionStack
                context={context}
                key={section.key}
                sections={[section]}
              />
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-border bg-background/80 p-6 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
                  Current scope
                </p>
                <h2 className="font-semibold text-2xl tracking-tight">
                  Tenant view is ready
                </h2>
                <p className="text-muted-foreground text-sm">
                  Upload headers are synthesized from the authenticated runtime
                  access object.
                </p>
              </div>
              <StatusBadge tone={data.access.canRead ? "success" : "danger"}>
                {data.access.canRead
                  ? "Read access granted"
                  : "Read access denied"}
              </StatusBadge>
            </div>
          </div>
        </header>

        {data.access.canWrite ? (
          <DocumentUploadForm
            context={context}
            customizationLayers={customizationLayers}
            metadata={metadata}
            requestHeaders={data.headerSet}
            storageProvider={storageProvider}
          />
        ) : (
          <section className="rounded-xl border border-border bg-card/95 p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
                Upload access
              </p>
              <h2 className="font-semibold text-2xl tracking-tight">
                Uploads are disabled for this role
              </h2>
              <p className="max-w-3xl text-muted-foreground text-sm">
                The document list is visible, but upload calls stay disabled
                until the runtime tenant role has write access.
              </p>
            </div>
          </section>
        )}

        <DocumentsDirectoryPanel
          context={context}
          customizationLayers={customizationLayers}
          defaultSortColumn={metadata.table?.defaultSort}
          description={`${data.loadedDocumentCount} document${data.loadedDocumentCount === 1 ? "" : "s"} loaded in this view.`}
          emptyDescription="No document summaries were returned for this tenant scope yet."
          emptyTitle="No documents"
          loadedDocumentCount={data.loadedDocumentCount}
          metadata={metadata}
          rows={toDocumentTableRows(data.documents)}
          searchPlaceholder="Search documents..."
          title="Document directory"
        />
      </section>
    </AuthenticatedFeatureScope>
  );
}
