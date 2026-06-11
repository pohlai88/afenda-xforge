import { hrDocumentEntityMetadata } from "@repo/features-employee-management-documents-management/metadata/document-entity";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createAppMetadataContext } from "../app/_lib/metadata-context.ts";
import { HrHubView } from "../app/[locale]/(authenticated)/hr/hr-hub-view.tsx";

describe("HrHubView", () => {
  it("renders metadata-ui stat, list, timeline, and form sections", () => {
    render(
      <HrHubView
        context={createAppMetadataContext({
          featureId: "hr-suite.employee-management.documents-management",
          permissions: ["hr.documents.read"],
          tenantId: "tenant-001",
          userId: "user-001",
        })}
        data={{
          actorId: "user-001",
          documents: [
            {
              acknowledgmentStatus: null,
              companyId: "company-1",
              currentVersionNumber: 1,
              documentCategory: "employment",
              documentType: "offer_letter",
              employeeId: "employee-001",
              expiresAt: new Date("2027-01-01T00:00:00.000Z"),
              id: "doc-1",
              issuedAt: new Date("2026-01-01T00:00:00.000Z"),
              jurisdictionCode: "SG",
              mandatory: true,
              renewalDueAt: null,
              status: "verified",
              title: "Offer letter",
              updatedAt: new Date("2026-06-01T00:00:00.000Z"),
              uploadedAt: new Date("2026-01-01T00:00:00.000Z"),
              visibility: "internal",
            },
          ],
          grantedPermissions: ["hr.documents.read"],
          tenantId: "tenant-001",
          tenantRole: "admin",
          userEmail: "owner@tenant.test",
        }}
        metadata={hrDocumentEntityMetadata}
      />
    );

    expect(screen.getByRole("heading", { name: "HR hub" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open documents" })
    ).toHaveAttribute("href", "/hr/documents");
    expect(screen.getByText("Document preview")).toBeInTheDocument();
    expect(screen.getByText("Lifecycle timeline")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Upload form preview" })
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Offer letter")).toBeInTheDocument();
  });
});
