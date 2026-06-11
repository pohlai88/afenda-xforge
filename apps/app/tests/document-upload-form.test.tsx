import { hrDocumentEntityMetadata } from "@repo/features-employee-management-documents-management/metadata/document-entity";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createAppMetadataContext } from "../app/_lib/metadata-context.ts";
import { DocumentUploadForm } from "../app/[locale]/(authenticated)/hr/documents/document-upload-form.tsx";

describe("DocumentUploadForm", () => {
  it("renders metadata-driven upload fields", () => {
    render(
      <DocumentUploadForm
        context={createAppMetadataContext({
          featureId: "hr-suite.employee-management.documents-management",
          permissions: ["hr.documents.write"],
          tenantId: "tenant-001",
          userId: "user-001",
        })}
        metadata={hrDocumentEntityMetadata}
        requestHeaders={{}}
        storageProvider="blob"
      />
    );

    expect(
      screen.getByRole("heading", { name: "Document metadata" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload document" })).toBeInTheDocument();
    expect(screen.getByText("File")).toBeInTheDocument();
  });
});
