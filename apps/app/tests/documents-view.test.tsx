import { hrDocumentEntityMetadata } from "@repo/features-employee-management-documents-management/metadata/document-entity";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createAppMetadataContext } from "../app/_lib/metadata-context.ts";
import { DocumentsView } from "../app/[locale]/(authenticated)/hr/documents/documents-view.tsx";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const createDocumentsContext = () =>
  createAppMetadataContext({
    featureId: "hr-suite.employee-management.documents-management",
    permissions: ["hr.documents.read"],
    tenantId: "tenant-001",
    userId: "user-001",
  });

describe("DocumentsView", () => {
  it("renders the governed HR documents consumer with EntityMetadataPanel", () => {
    render(
      <DocumentsView
        context={createDocumentsContext()}
        data={{
          access: {
            canRead: true,
            canViewSensitive: true,
            canWrite: true,
          },
          actorId: "user-001",
          documents: [
            {
              acknowledgmentStatus: null,
              currentVersionNumber: 2,
              documentCategory: "employment",
              documentType: "employment_contract",
              employeeId: "employee-001",
              expiresAt: new Date("2027-01-01T00:00:00.000Z"),
              id: "doc-001",
              mandatory: true,
              renewalDueAt: null,
              status: "verified",
              title: "Employment contract",
              updatedAt: new Date("2026-06-01T12:00:00.000Z"),
              visibility: "internal",
            },
          ],
          expiringSoonDocumentCount: 0,
          grantedPermissions: ["hr.documents.read"],
          headerSet: {
            "x-tenant-id": "tenant-001",
          },
          loadedDocumentCount: 1,
          mandatoryDocumentCount: 1,
          tenantId: "tenant-001",
          tenantRole: "admin",
          userEmail: "owner@tenant.test",
          verifiedDocumentCount: 1,
        }}
        metadata={hrDocumentEntityMetadata}
        storageProvider="blob"
      />
    );

    expect(
      screen.getByRole("heading", { name: "Document storage" })
    ).toBeInTheDocument();
    expect(screen.getByText("Document directory")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search documents...")
    ).toBeInTheDocument();
    expect(screen.getByText("Employment contract")).toBeInTheDocument();
  });

  it("renders read-only upload notice when write access is disabled", () => {
    render(
      <DocumentsView
        context={createDocumentsContext()}
        data={{
          access: {
            canRead: true,
            canViewSensitive: false,
            canWrite: false,
          },
          actorId: "user-001",
          documents: [],
          expiringSoonDocumentCount: 0,
          grantedPermissions: ["hr.documents.read"],
          headerSet: {},
          loadedDocumentCount: 0,
          mandatoryDocumentCount: 0,
          tenantId: "tenant-001",
          tenantRole: "viewer",
          userEmail: null,
          verifiedDocumentCount: 0,
        }}
        metadata={hrDocumentEntityMetadata}
        storageProvider="blob"
      />
    );

    expect(
      screen.getByRole("heading", { name: "Uploads are disabled for this role" })
    ).toBeInTheDocument();
    expect(screen.getByText("No documents")).toBeInTheDocument();
  });
});
