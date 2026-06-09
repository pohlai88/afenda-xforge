import { hrTenantDocumentDownloadPath } from "@repo/features-employee-management-documents-management";
import Link from "next/link";
import type { ReactElement } from "react";
import type { StatusBadgeTone } from "../../../_components/status-badge.tsx";
import { StatusBadge } from "../../../_components/status-badge.tsx";
import type { HrDocumentsPageData } from "../_data.ts";

type DocumentSummaryListProps = {
  documents: HrDocumentsPageData["documents"];
  emptyDescription: string;
  emptyTitle: string;
};

const humanizeValue = (value: string): string =>
  value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const resolveDocumentStatusTone = (status: string): StatusBadgeTone => {
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

const resolveVisibilityTone = (visibility: string): StatusBadgeTone => {
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

export function DocumentSummaryList({
  documents,
  emptyDescription,
  emptyTitle,
}: DocumentSummaryListProps): ReactElement {
  if (documents.length === 0) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
        <div className="space-y-2">
          <h3 className="font-semibold text-xl tracking-tight">{emptyTitle}</h3>
          <p className="text-muted-foreground text-sm">{emptyDescription}</p>
        </div>
        <div className="mt-4">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition hover:opacity-90"
            href="/hr/documents"
          >
            Open documents workspace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-card/95 shadow-sm">
      <div className="border-border border-b px-6 py-4">
        <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
          Document list
        </p>
        <p className="mt-1 text-muted-foreground text-sm">
          {documents.length} document{documents.length === 1 ? "" : "s"} loaded
          in this view.
        </p>
      </div>

      <div className="divide-y divide-border">
        {documents.map((document) => (
          <article
            className="grid gap-4 p-6 lg:grid-cols-[minmax(0,1fr)_18rem]"
            key={document.id}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-lg tracking-tight">
                  <Link
                    className="transition hover:text-primary"
                    href={`/hr/documents/${document.id}`}
                  >
                    {document.title}
                  </Link>
                </h3>
                <StatusBadge tone={resolveDocumentStatusTone(document.status)}>
                  {humanizeValue(document.status)}
                </StatusBadge>
                <StatusBadge tone={resolveVisibilityTone(document.visibility)}>
                  {humanizeValue(document.visibility)}
                </StatusBadge>
                {document.mandatory ? (
                  <StatusBadge tone="warning">Mandatory</StatusBadge>
                ) : (
                  <StatusBadge tone="neutral">Optional</StatusBadge>
                )}
              </div>

              <p className="text-muted-foreground text-sm">
                Employee{" "}
                <span className="font-mono">{document.employeeId}</span>
                {" · "}
                {humanizeValue(document.documentCategory)}
                {" · "}
                {humanizeValue(document.documentType)}
              </p>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-border/70 bg-background/80 p-3">
                  <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                    Updated
                  </p>
                  <p className="font-medium text-sm">
                    {formatDateTime(document.updatedAt)}
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-background/80 p-3">
                  <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                    Expires
                  </p>
                  <p className="font-medium text-sm">
                    {formatDate(document.expiresAt)}
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-background/80 p-3">
                  <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                    Renewal
                  </p>
                  <p className="font-medium text-sm">
                    {formatDate(document.renewalDueAt)}
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-background/80 p-3">
                  <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                    Version
                  </p>
                  <p className="font-medium text-sm">
                    {document.currentVersionNumber ?? "n/a"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-background/70 p-4 lg:items-end lg:justify-between">
              <div className="space-y-1 lg:text-right">
                <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                  Actions
                </p>
                <p className="font-medium text-sm">
                  Detail and download for this stored document.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-stretch">
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-muted"
                  href={`/hr/documents/${document.id}`}
                >
                  Open detail
                </Link>
                <a
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition hover:opacity-90"
                  download
                  href={hrTenantDocumentDownloadPath(document.id)}
                >
                  Download file
                </a>
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-muted"
                  href="/hr/documents"
                >
                  Upload another
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
