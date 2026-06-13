import type { DocumentsManagementDocumentSummaryProjection } from "@repo/features-employee-management-documents-management";
import type { EntityMetadata } from "@repo/metadata";
import {
  MetadataForm,
  MetadataSectionStack,
} from "@repo/metadata-ui/components";
import type {
  MetadataFieldContract,
  MetadataRenderContext,
} from "@repo/metadata-ui/contracts";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import type { ReactElement } from "react";
import { AuthenticatedFeatureScope } from "../../../../_components/authenticated-feature-scope.tsx";
import { DashboardGrid } from "../../_components/dashboard-grid.tsx";
import type { DocumentsManagementOverviewPageData } from "./documents-management-overview-data.ts";

const HR_DOCUMENTS_FEATURE_ID =
  "hr-suite.employee-management.documents-management";

export type DocumentsManagementOverviewViewProps = {
  context: MetadataRenderContext;
  data: DocumentsManagementOverviewPageData;
  metadata: EntityMetadata;
};

const hubStatSections = [
  {
    description: "Surface",
    key: "hr-hub-documents",
    kind: "stat" as const,
    metadataAttributes: {
      tone: "primary",
      value: "/hr/documents",
    },
    title: "Documents",
  },
  {
    description: "Blob",
    key: "hr-hub-upload",
    kind: "stat" as const,
    metadataAttributes: {
      tone: "info",
      value: "Server + direct browser",
    },
    title: "Upload mode",
  },
  {
    description: "Registration",
    key: "hr-hub-store",
    kind: "stat" as const,
    metadataAttributes: {
      tone: "success",
      value: "Tenant-scoped",
    },
    title: "Record store",
  },
] as const;

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

const buildUploadPreviewFields = (
  metadata: EntityMetadata
): readonly MetadataFieldContract[] => {
  const uploadForm = metadata.forms?.find(
    (form) => form.key === "document-upload"
  );
  const fieldMap = new Map(
    (metadata.fields ?? []).map((field) => [field.key, field])
  );

  if (!uploadForm) {
    return [];
  }

  return uploadForm.fieldKeys.flatMap((fieldKey) => {
    const field = fieldMap.get(fieldKey);
    return field ? [field as MetadataFieldContract] : [];
  });
};

const formatDate = (value: Date | null | undefined): string =>
  value ? value.toLocaleDateString() : "n/a";

export function DocumentsManagementOverviewView({
  context,
  data,
  metadata,
}: DocumentsManagementOverviewViewProps): ReactElement {
  const latestDocument = data.documents[0] ?? null;
  const uploadPreviewValues: Record<string, unknown> = {
    description: "Upload files on the documents route.",
    documentCategory: "employment",
    documentType: "other",
    employeeId: latestDocument?.employeeId ?? "employee-001",
    expiresAt: "",
    issuedAt: "",
    legalEntityCode: "n/a",
    mandatory: false,
    renewalDueAt: "",
    title: latestDocument?.title ?? "New document",
    visibility: "internal",
  };

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
                  Documents Management
                </h1>
                <p className="max-w-3xl text-muted-foreground">
                  Governed overview for document storage, registration, upload
                  routing, and tenant-scoped access.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="outline">
                <Link href="/dashboard">Back to dashboard</Link>
              </Button>
              <Button asChild>
                <Link href="/hr/documents">Open documents</Link>
              </Button>
            </div>
          </div>

          <div className="mt-8">
            <DashboardGrid columns={3} gap="md">
              {hubStatSections.map((section) => (
                <MetadataSectionStack
                  context={context}
                  key={section.key}
                  sections={[section]}
                />
              ))}
            </DashboardGrid>
          </div>
        </header>

        <MetadataSectionStack
          context={context}
          sections={[
            {
              description: "Recent documents loaded for this tenant.",
              key: "hr-hub-document-list",
              kind: "list",
              metadata,
              rows: toDocumentTableRows(data.documents),
              title: "Document preview",
            },
          ]}
        />

        <MetadataSectionStack
          context={context}
          resolveSectionContent={({ section }) =>
            section.key === "hr-hub-document-timeline" && latestDocument ? (
              <ol className="space-y-4 border-border border-l pl-4">
                {[
                  {
                    date: formatDate(latestDocument.uploadedAt),
                    label: "Uploaded",
                  },
                  {
                    date: formatDate(latestDocument.issuedAt),
                    label: "Issued",
                  },
                  {
                    date: formatDate(latestDocument.updatedAt),
                    label: "Updated",
                  },
                  {
                    date: formatDate(latestDocument.expiresAt),
                    label: "Expires",
                  },
                  {
                    date: formatDate(latestDocument.renewalDueAt),
                    label: "Renewal due",
                  },
                ].map((entry) => (
                  <li className="relative pl-4" key={entry.label}>
                    <span className="absolute top-1 -left-[1.35rem] size-2 rounded-full bg-lane-active" />
                    <p className="font-medium text-sm">{entry.label}</p>
                    <p className="text-muted-foreground text-xs">
                      {entry.date}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-muted-foreground text-sm">
                No documents loaded yet. Open the documents route to register
                records.
              </p>
            )
          }
          sections={[
            {
              description: latestDocument
                ? `Lifecycle dates for ${latestDocument.title}.`
                : "Lifecycle preview appears when documents are loaded.",
              key: "hr-hub-document-timeline",
              kind: "timeline",
              title: "Lifecycle timeline",
            },
          ]}
        />

        <MetadataSectionStack
          context={{ ...context, readonly: true }}
          resolveSectionContent={({ section }) =>
            section.key === "hr-hub-upload-form" ? (
              <MetadataForm
                context={{ ...context, readonly: true }}
                fields={buildUploadPreviewFields(metadata)}
                values={uploadPreviewValues}
              />
            ) : null
          }
          sections={[
            {
              description:
                "Read-only preview of upload scalar fields. File bytes upload on the documents route.",
              key: "hr-hub-upload-form",
              kind: "form",
              title: "Upload form preview",
            },
          ]}
        />
      </section>
    </AuthenticatedFeatureScope>
  );
}
