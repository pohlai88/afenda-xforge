import { hrDocumentEntityMetadata } from "@repo/features-employee-management-documents-management/metadata/document-entity";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createAppMetadataContext } from "../app/_lib/metadata-context.ts";
import { DocumentDetailView } from "../app/[locale]/(authenticated)/hr/documents/document-detail-view.tsx";

const createDetailContext = () =>
  createAppMetadataContext({
    featureId: "hr-suite.employee-management.documents-management",
    permissions: ["hr.documents.read"],
    tenantId: "tenant-001",
    userId: "user-001",
  });

describe("DocumentDetailView", () => {
  it("renders metadata-driven detail sections with customizationLayers", () => {
    render(
      <DocumentDetailView
        context={createDetailContext()}
        customizationLayers={{ company: null, tenant: null }}
        data={{
          access: {
            canDownload: true,
            canRead: true,
            canViewSensitive: true,
            canWrite: false,
          },
          actorId: "user-001",
          document: {
            archivedAt: null,
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            currentVersionNumber: 1,
            description: "Signed contract",
            documentCategory: "employment",
            documentType: "employment_contract",
            employeeId: "employee-001",
            expiresAt: new Date("2027-01-01T00:00:00.000Z"),
            id: "doc-001",
            issuedAt: new Date("2026-01-15T00:00:00.000Z"),
            legalEntityCode: "LE-1",
            mandatory: true,
            reference: {
              contentType: "application/pdf",
              fileName: "contract.pdf",
              sizeBytes: 2048,
              sourceNotes: "Internal note",
              storagePath: "tenant/documents/contract.pdf",
            },
            rejectedAt: null,
            renewalDueAt: null,
            retention: {
              action: "archive",
              anonymizeBeforeDeletion: false,
              archiveAfterEmployeeSeparation: true,
              retentionPeriodDays: 365,
            },
            status: "verified",
            title: "Employment contract",
            updatedAt: new Date("2026-06-01T12:00:00.000Z"),
            verifiedAt: new Date("2026-06-02T12:00:00.000Z"),
            visibility: "internal",
            versionCount: 1,
          },
          downloadPath: "/api/hr/documents/doc-001/download",
          grantedPermissions: ["hr.documents.read"],
          tenantId: "tenant-001",
          tenantRole: "admin",
          userEmail: "owner@tenant.test",
        }}
        metadata={hrDocumentEntityMetadata}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Employment contract" })
    ).toBeInTheDocument();
    expect(screen.getByText("Document facts")).toBeInTheDocument();
    expect(
      screen.getByText("Lifecycle and retention dates")
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("employee-001")).toBeInTheDocument();
  });
});
