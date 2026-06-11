import type { CustomizationLayerSet } from "@repo/customization/resolution";
import type { EntityMetadata } from "@repo/metadata";
import type { MetadataRenderContext } from "@repo/metadata-ui/contracts";
import {
  MetadataForm,
  MetadataSectionStack,
  renderMetadataTableCell,
} from "@repo/metadata-ui/components";
import type { MetadataFieldContract } from "@repo/metadata-ui/contracts";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import type { ReactElement } from "react";
import { AuthenticatedFeatureScope } from "../../../../_components/authenticated-feature-scope.tsx";
import type { HrDocumentDetailData } from "./_data.ts";

const HR_DOCUMENTS_FEATURE_ID =
  "hr-suite.employee-management.documents-management";

const documentStatusColumn = {
  field: "status",
  key: "status",
  kind: "status" as const,
  label: "Status",
};

const documentVisibilityColumn = {
  field: "visibility",
  key: "visibility",
  kind: "status" as const,
  label: "Visibility",
};

export type DocumentDetailViewProps = {
  context: MetadataRenderContext;
  customizationLayers?: CustomizationLayerSet | null;
  data: HrDocumentDetailData;
  metadata: EntityMetadata;
};

const humanizeValue = (value: string): string =>
  value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const formatDate = (value: Date | null | undefined): string =>
  value ? value.toLocaleDateString() : "n/a";

const formatDateTime = (value: Date | null | undefined): string =>
  value ? value.toLocaleString() : "n/a";

const buildDetailFields = (
  metadata: EntityMetadata,
  sectionKey: string
): readonly MetadataFieldContract[] => {
  const section = metadata.sections?.find((entry) => entry.key === sectionKey);
  const fieldMap = new Map(
    (metadata.fields ?? []).map((field) => [field.key, field])
  );

  if (!section) {
    return [];
  }

  return section.fieldKeys.flatMap((fieldKey) => {
    const field = fieldMap.get(fieldKey);
    return field ? [field as MetadataFieldContract] : [];
  });
};

const buildDetailSections = (metadata: EntityMetadata) => [
  {
    description:
      "The file bytes live in object storage. This record keeps the pointer and lifecycle metadata only.",
    fields: buildDetailFields(metadata, "document-details"),
    key: "document-details",
    kind: "form" as const,
    title: "Document facts",
  },
  {
    fields: buildDetailFields(metadata, "document-timeline"),
    key: "document-timeline",
    kind: "timeline" as const,
    title: "Lifecycle and retention dates",
  },
];

export function DocumentDetailView({
  context,
  customizationLayers,
  data,
  metadata,
}: DocumentDetailViewProps): ReactElement {
  const { document } = data;
  const detailValues: Record<string, unknown> = {
    anonymizeBeforeDeletion: document.retention.anonymizeBeforeDeletion,
    archiveAfterEmployeeSeparation:
      document.retention.archiveAfterEmployeeSeparation,
    archivedAt: formatDate(document.archivedAt),
    contentType: document.reference.contentType ?? "n/a",
    createdAt: formatDateTime(document.createdAt),
    description: document.description ?? "No description",
    employeeId: document.employeeId,
    expiresAt: formatDate(document.expiresAt),
    fileName: document.reference.fileName ?? "n/a",
    issuedAt: formatDate(document.issuedAt),
    legalEntityCode: document.legalEntityCode ?? "n/a",
    mandatory: document.mandatory,
    rejectedAt: formatDate(document.rejectedAt),
    renewalDueAt: formatDate(document.renewalDueAt),
    retentionAction: humanizeValue(document.retention.action),
    retentionPeriodDays: document.retention.retentionPeriodDays
      ? `${document.retention.retentionPeriodDays} days`
      : "n/a",
    sourceNotes: data.access.canViewSensitive
      ? (document.reference.sourceNotes ?? "n/a")
      : "Redacted for this role",
    storagePath: document.reference.storagePath ?? "n/a",
    updatedAt: formatDateTime(document.updatedAt),
    verifiedAt: formatDate(document.verifiedAt),
  };

  const kpiSections = [
    {
      description: "Document",
      key: "detail-kpi-version",
      kind: "stat" as const,
      metadataAttributes: {
        tone: "primary",
        value: document.currentVersionNumber ?? "n/a",
      },
      title: "Version",
    },
    {
      description: "Lifecycle",
      key: "detail-kpi-status",
      kind: "stat" as const,
      metadataAttributes: {
        tone: "success",
        value: humanizeValue(document.status),
      },
      title: "Status",
    },
    {
      description: "Storage",
      key: "detail-kpi-bytes",
      kind: "stat" as const,
      metadataAttributes: {
        tone: "info",
        value: document.reference.sizeBytes ?? "n/a",
      },
      title: "Bytes",
    },
    {
      description: "Access",
      key: "detail-kpi-sensitive",
      kind: "stat" as const,
      metadataAttributes: {
        tone: data.access.canViewSensitive ? "success" : "warning",
        value: data.access.canViewSensitive ? "Visible" : "Redacted",
      },
      title: "Sensitive",
    },
  ];

  return (
    <AuthenticatedFeatureScope featureId={HR_DOCUMENTS_FEATURE_ID}>
      <section className="space-y-8">
        <header className="rounded-xl border border-lane-active-border bg-card/95 p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
                  XForge
                </p>
                <h1 className="font-semibold text-4xl tracking-tight">
                  {document.title}
                </h1>
                <p className="max-w-3xl text-muted-foreground">
                  Document detail view for the tenant-scoped record and its blob
                  storage reference.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="secondary">Tenant {data.tenantId}</Badge>
                <Badge variant="outline">Role {data.tenantRole}</Badge>
                {renderMetadataTableCell(
                  documentStatusColumn,
                  document.status,
                  context
                )}
                {renderMetadataTableCell(
                  documentVisibilityColumn,
                  document.visibility,
                  context
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="outline">
                <Link href="/hr/documents">Back to documents</Link>
              </Button>
              <Button asChild>
                <a download href={data.downloadPath}>
                  Download file
                </a>
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
        </header>

        <MetadataSectionStack
          context={{ ...context, readonly: true }}
          customizationLayers={customizationLayers}
          resolveSectionContent={({ section }) => {
            if (section.fields && section.kind === "form") {
              return (
                <MetadataForm
                  context={{ ...context, readonly: true }}
                  customizationLayers={customizationLayers}
                  fields={section.fields}
                  values={detailValues}
                />
              );
            }

            if (section.key === "document-timeline" && section.fields) {
              return (
                <ol className="space-y-4 border-l border-border pl-4">
                  {section.fields.map((field) => (
                    <li className="relative pl-4" key={field.key}>
                      <span className="-left-[1.35rem] absolute top-1 size-2 rounded-full bg-lane-active" />
                      <p className="font-medium text-sm">{field.label}</p>
                      <p className="text-muted-foreground text-xs">
                        {String(detailValues[field.key] ?? "n/a")}
                      </p>
                    </li>
                  ))}
                </ol>
              );
            }

            return null;
          }}
          sections={buildDetailSections(metadata)}
        />
      </section>
    </AuthenticatedFeatureScope>
  );
}
