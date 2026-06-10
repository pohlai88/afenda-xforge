import { MetadataStateBoundary } from "@repo/metadata-ui/components";
import { resolveObjectStorageProviderKind } from "@repo/storage/provider";
import Link from "next/link";
import type { ReactElement } from "react";
import { AuthenticatedFeatureScope } from "../../../_components/authenticated-feature-scope.tsx";
import { DashboardGrid } from "../../_components/dashboard-grid.tsx";
import { KpiCard } from "../../_components/kpi-card.tsx";
import { StatusBadge } from "../../_components/status-badge.tsx";
import { DocumentSummaryList } from "./_components/document-summary-list.tsx";
import { loadHrDocumentsPageData } from "./_data.ts";
import { DocumentUploadForm } from "./document-upload-form.tsx";

const HR_DOCUMENTS_FEATURE_ID =
  "hr-suite.employee-management.documents-management";

export default async function HrDocumentsPage(): Promise<ReactElement> {
  const documents = await loadHrDocumentsPageData();
  const storageProvider = resolveObjectStorageProviderKind() ?? "blob";

  if (documents.status === "forbidden") {
    return (
      <AuthenticatedFeatureScope featureId={HR_DOCUMENTS_FEATURE_ID}>
        <section className="space-y-6">
          <MetadataStateBoundary
            forbiddenDescription="Document browsing requires an HR role with tenant-scoped document access."
            forbiddenTitle="Document storage unavailable"
            state="forbidden"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-muted"
              href="/hr"
            >
              Back to HR hub
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-muted"
              href="/dashboard"
            >
              Back to dashboard
            </Link>
          </div>
        </section>
      </AuthenticatedFeatureScope>
    );
  }

  if (documents.status === "error") {
    return (
      <AuthenticatedFeatureScope featureId={HR_DOCUMENTS_FEATURE_ID}>
        <section className="space-y-6">
          <MetadataStateBoundary error={documents.message} state="error" />
          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-muted"
              href="/hr"
            >
              Back to HR hub
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-muted"
              href="/dashboard"
            >
              Back to dashboard
            </Link>
          </div>
        </section>
      </AuthenticatedFeatureScope>
    );
  }

  const { data } = documents;
  const uploadModeLabel = data.access.canWrite ? "Upload enabled" : "Read only";
  const expiringSoonLabel =
    data.expiringSoonDocumentCount === 0
      ? "No expiring documents in view"
      : `${data.expiringSoonDocumentCount} expiring soon`;

  return (
    <AuthenticatedFeatureScope featureId={HR_DOCUMENTS_FEATURE_ID}>
      <section className="space-y-8">
        <header className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-8 shadow-sm">
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
                  files. The active backend is resolved from the storage
                  provider configuration and each upload is registered with its
                  storage reference and metadata.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <StatusBadge tone="neutral">Tenant {data.tenantId}</StatusBadge>
                <StatusBadge tone="info">Role {data.tenantRole}</StatusBadge>
                <StatusBadge tone="info">Storage {storageProvider}</StatusBadge>
                <StatusBadge tone="success">{uploadModeLabel}</StatusBadge>
                <StatusBadge tone="warning">{expiringSoonLabel}</StatusBadge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-muted"
                href="/hr"
              >
                Back to HR hub
              </Link>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-muted"
                href="/dashboard"
              >
                Back to dashboard
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <DashboardGrid columns={4} gap="md">
              <KpiCard
                module="Loaded"
                title="Document count"
                tone="primary"
                value={data.loadedDocumentCount}
              />
              <KpiCard
                module="Lifecycle"
                title="Verified"
                tone="success"
                value={data.verifiedDocumentCount}
              />
              <KpiCard
                module="Compliance"
                title="Mandatory"
                tone="warning"
                value={data.mandatoryDocumentCount}
              />
              <KpiCard
                module="Access"
                title="Write mode"
                tone={data.access.canWrite ? "info" : "warning"}
                value={data.access.canWrite ? "Enabled" : "Read only"}
              />
            </DashboardGrid>
          </div>

          <div className="mt-8 rounded-[var(--radius-xl)] border border-border bg-background/80 p-6 shadow-sm">
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
                  access object, not from raw browser headers.
                </p>
              </div>
              <StatusBadge tone={data.access.canRead ? "success" : "danger"}>
                {data.access.canRead
                  ? "Read access granted"
                  : "Read access denied"}
              </StatusBadge>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-border/70 bg-card/80 p-4">
                <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                  User
                </p>
                <p className="font-medium text-sm">{data.userEmail ?? "n/a"}</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-card/80 p-4">
                <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                  Documents in view
                </p>
                <p className="font-medium text-sm">
                  {data.loadedDocumentCount}
                </p>
              </div>
              <div className="rounded-lg border border-border/70 bg-card/80 p-4">
                <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                  Sensitive access
                </p>
                <p className="font-medium text-sm">
                  {data.access.canViewSensitive ? "Enabled" : "Redacted"}
                </p>
              </div>
              <div className="rounded-lg border border-border/70 bg-card/80 p-4">
                <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                  Access mode
                </p>
                <p className="font-medium text-sm">
                  {data.access.canWrite ? "Upload + browse" : "Browse only"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {data.access.canWrite ? (
          <DocumentUploadForm
            requestHeaders={data.headerSet}
            storageProvider={storageProvider}
          />
        ) : (
          <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
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

        <DocumentSummaryList
          documents={data.documents}
          emptyDescription="No document summaries were returned for this tenant scope yet."
          emptyTitle="No documents"
        />
      </section>
    </AuthenticatedFeatureScope>
  );
}
