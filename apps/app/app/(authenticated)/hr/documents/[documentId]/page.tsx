import Link from "next/link";
import type { ReactElement } from "react";
import { DashboardGrid } from "../../../_components/dashboard-grid.tsx";
import { KpiCard } from "../../../_components/kpi-card.tsx";
import { StatusBadge } from "../../../_components/status-badge.tsx";
import { loadHrDocumentDetailPageData } from "../_data.ts";

type DocumentDetailPageProps = {
  params: Promise<{
    documentId: string;
  }>;
};

const humanizeValue = (value: string): string =>
  value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const resolveStatusTone = (
  status: string
): "danger" | "info" | "neutral" | "success" | "warning" => {
  if (status === "verified") {
    return "success";
  }

  if (status === "pending_verification" || status === "draft") {
    return "warning";
  }

  if (status === "rejected" || status === "expired") {
    return "danger";
  }

  return "neutral";
};

const resolveVisibilityTone = (
  visibility: string
): "danger" | "info" | "neutral" | "success" | "warning" => {
  if (visibility === "confidential") {
    return "danger";
  }

  if (visibility === "restricted") {
    return "warning";
  }

  return "info";
};

const formatDate = (value: Date | null | undefined): string =>
  value ? value.toLocaleDateString() : "n/a";

const formatDateTime = (value: Date | null | undefined): string =>
  value ? value.toLocaleString() : "n/a";

const resolveSourceNotesLabel = ({
  canViewSensitive,
  sourceNotes,
}: {
  canViewSensitive: boolean;
  sourceNotes: string | null | undefined;
}): string => {
  if (!canViewSensitive) {
    return "Redacted for this role";
  }

  return sourceNotes ?? "n/a";
};

const renderAccessError = (message: string): ReactElement => (
  <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-8 shadow-sm">
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
        XForge
      </p>
      <h1 className="font-semibold text-4xl tracking-tight">
        Document unavailable
      </h1>
      <p className="text-muted-foreground">{message}</p>
    </div>

    <div className="mt-6 flex flex-wrap items-center gap-3">
      <Link
        className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-muted"
        href="/hr/documents"
      >
        Back to documents
      </Link>
      <Link
        className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-muted"
        href="/hr"
      >
        Back to HR hub
      </Link>
    </div>
  </section>
);

export default async function HrDocumentDetailPage({
  params,
}: DocumentDetailPageProps): Promise<ReactElement> {
  const { documentId } = await params;
  const document = await loadHrDocumentDetailPageData(documentId);

  if (document.status === "forbidden") {
    return renderAccessError(
      "Document detail visibility requires tenant-scoped document read access."
    );
  }

  if (document.status === "error") {
    return renderAccessError(document.message);
  }

  const { data } = document;
  const retentionPeriod = data.document.retention.retentionPeriodDays
    ? `${data.document.retention.retentionPeriodDays} days`
    : "n/a";
  const sourceNotesLabel = resolveSourceNotesLabel({
    canViewSensitive: data.access.canViewSensitive,
    sourceNotes: data.document.reference.sourceNotes,
  });

  return (
    <section className="space-y-8">
      <header className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
                XForge
              </p>
              <h1 className="font-semibold text-4xl tracking-tight">
                {data.document.title}
              </h1>
              <p className="max-w-3xl text-muted-foreground">
                Document detail view for the tenant-scoped record and its blob
                storage reference.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <StatusBadge tone="neutral">Tenant {data.tenantId}</StatusBadge>
              <StatusBadge tone="info">Role {data.tenantRole}</StatusBadge>
              <StatusBadge tone={resolveStatusTone(data.document.status)}>
                {humanizeValue(data.document.status)}
              </StatusBadge>
              <StatusBadge
                tone={resolveVisibilityTone(data.document.visibility)}
              >
                {humanizeValue(data.document.visibility)}
              </StatusBadge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-muted"
              href="/hr/documents"
            >
              Back to documents
            </Link>
            <a
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition hover:opacity-90"
              download
              href={data.downloadPath}
            >
              Download file
            </a>
          </div>
        </div>

        <div className="mt-8">
          <DashboardGrid columns={4} gap="md">
            <KpiCard
              module="Document"
              title="Version"
              tone="primary"
              value={data.document.currentVersionNumber ?? "n/a"}
            />
            <KpiCard
              module="Lifecycle"
              title="Status"
              tone="success"
              value={humanizeValue(data.document.status)}
            />
            <KpiCard
              module="Storage"
              title="Bytes"
              tone="info"
              value={data.document.reference.sizeBytes ?? "n/a"}
            />
            <KpiCard
              module="Access"
              title="Sensitive"
              tone={data.access.canViewSensitive ? "success" : "warning"}
              value={data.access.canViewSensitive ? "Visible" : "Redacted"}
            />
          </DashboardGrid>
        </div>
      </header>

      <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
            Document facts
          </p>
          <h2 className="font-semibold text-2xl tracking-tight">
            Metadata and blob reference
          </h2>
          <p className="text-muted-foreground text-sm">
            The file bytes live in Blob. This record keeps the pointer and
            lifecycle metadata only.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border/70 bg-background/80 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Employee
            </p>
            <p className="font-mono text-sm">{data.document.employeeId}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Legal entity
            </p>
            <p className="font-medium text-sm">
              {data.document.legalEntityCode ?? "n/a"}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              File name
            </p>
            <p className="font-medium text-sm">
              {data.document.reference.fileName ?? "n/a"}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Content type
            </p>
            <p className="font-medium text-sm">
              {data.document.reference.contentType ?? "n/a"}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Blob path
            </p>
            <p className="break-all font-mono text-sm">
              {data.document.reference.storagePath ?? "n/a"}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Description
            </p>
            <p className="text-sm">
              {data.document.description ?? "No description"}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Source notes
            </p>
            <p className="text-sm">{sourceNotesLabel}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Retention action
            </p>
            <p className="font-medium text-sm">
              {humanizeValue(data.document.retention.action)}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
            Timeline
          </p>
          <h2 className="font-semibold text-2xl tracking-tight">
            Lifecycle and retention dates
          </h2>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border/70 bg-background/80 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Created
            </p>
            <p className="font-medium text-sm">
              {formatDateTime(data.document.createdAt)}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Updated
            </p>
            <p className="font-medium text-sm">
              {formatDateTime(data.document.updatedAt)}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Issued
            </p>
            <p className="font-medium text-sm">
              {formatDate(data.document.issuedAt)}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Expires
            </p>
            <p className="font-medium text-sm">
              {formatDate(data.document.expiresAt)}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Renewal due
            </p>
            <p className="font-medium text-sm">
              {formatDate(data.document.renewalDueAt)}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Verified
            </p>
            <p className="font-medium text-sm">
              {formatDate(data.document.verifiedAt)}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Rejected
            </p>
            <p className="font-medium text-sm">
              {formatDate(data.document.rejectedAt)}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Archived
            </p>
            <p className="font-medium text-sm">
              {formatDate(data.document.archivedAt)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border/70 bg-background/80 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Retention period
            </p>
            <p className="font-medium text-sm">{retentionPeriod}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Archive after separation
            </p>
            <p className="font-medium text-sm">
              {data.document.retention.archiveAfterEmployeeSeparation
                ? "Yes"
                : "No"}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Anonymize before deletion
            </p>
            <p className="font-medium text-sm">
              {data.document.retention.anonymizeBeforeDeletion ? "Yes" : "No"}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/80 p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Mandatory
            </p>
            <p className="font-medium text-sm">
              {data.document.mandatory ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}
