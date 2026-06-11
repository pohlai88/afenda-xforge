import { hrDocumentEntityMetadata } from "@repo/features-employee-management-documents-management/metadata/document-entity";
import { EntityMetadataPanel } from "@repo/metadata-ui/components";
import { createMetadataRenderContext } from "@repo/metadata-ui/contracts";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";

const hrDocumentRows = [
  {
    currentVersionNumber: "2",
    documentCategory: "Employment",
    documentType: "Employment Contract",
    employeeId: "employee-001",
    expiresAt: new Date("2027-01-01T00:00:00.000Z"),
    id: "doc-001",
    mandatory: "Yes",
    renewalDueAt: null,
    status: "verified",
    title: "Employment contract",
    updatedAt: new Date("2026-06-01T12:00:00.000Z"),
    visibility: "internal",
  },
  {
    currentVersionNumber: "1",
    documentCategory: "Identity",
    documentType: "Passport",
    employeeId: "employee-002",
    expiresAt: new Date("2026-12-01T00:00:00.000Z"),
    id: "doc-002",
    mandatory: "No",
    renewalDueAt: new Date("2026-11-01T00:00:00.000Z"),
    status: "pending_verification",
    title: "Passport scan",
    updatedAt: new Date("2026-05-15T09:30:00.000Z"),
    visibility: "restricted",
  },
  {
    currentVersionNumber: "3",
    documentCategory: "Compliance",
    documentType: "Consent Form",
    employeeId: "employee-003",
    expiresAt: null,
    id: "doc-003",
    mandatory: "Yes",
    renewalDueAt: null,
    status: "rejected",
    title: "Background check consent",
    updatedAt: new Date("2026-04-20T16:45:00.000Z"),
    visibility: "confidential",
  },
] as const;

function MetadataUiHrDocumentStory() {
  const context = createMetadataRenderContext(
    {
      permissions: {
        "hr.documents.read": true,
      },
      surfaceId: "storybook/metadata-ui-hr-document",
    },
    {
      mode: "read",
      routeId: "storybook/metadata-ui-hr-document",
      surfaceId: "storybook/metadata-ui-hr-document",
    }
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 p-6 md:p-10">
      <header className="space-y-3">
        <p className="font-medium text-muted-foreground text-sm uppercase tracking-[0.24em]">
          HR Documents
        </p>
        <h1 className="font-semibold text-4xl tracking-tight">
          HR document list columns
        </h1>
        <p className="max-w-3xl text-muted-foreground text-sm leading-7 md:text-base">
          Storybook fixture mirroring the migrated HR documents index columns
          and status tones.
        </p>
      </header>

      <EntityMetadataPanel
        context={context}
        metadata={hrDocumentEntityMetadata}
        pageSize={5}
        rows={hrDocumentRows}
        searchPlaceholder="Search documents..."
        title="Document directory"
        totalRecords={hrDocumentRows.length}
      />
    </div>
  );
}

const meta = {
  title: "Metadata UI/HR Document",
  component: MetadataUiHrDocumentStory,
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" as const },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MetadataUiHrDocumentStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ListColumns: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", { name: "Document directory" })
    ).toBeVisible();
    await expect(
      canvas.getByPlaceholderText("Search documents...")
    ).toBeVisible();
    await expect(canvas.getByText("Employment contract")).toBeVisible();
    await expect(canvas.getByText("verified")).toBeVisible();
    await expect(canvas.getByText("confidential")).toBeVisible();
  },
};
