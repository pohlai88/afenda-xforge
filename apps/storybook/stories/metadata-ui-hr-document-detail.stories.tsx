import { hrDocumentEntityMetadata } from "@repo/features-employee-management-documents-management/metadata/document-entity";
import { createMetadataRenderContext } from "@repo/metadata-ui/contracts";
import { MetadataForm, MetadataSectionStack } from "@repo/metadata-ui/components";
import type { MetadataFieldContract } from "@repo/metadata-ui/contracts";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";

const detailFields = (sectionKey: string): readonly MetadataFieldContract[] => {
  const section = hrDocumentEntityMetadata.sections?.find(
    (entry) => entry.key === sectionKey
  );
  const fieldMap = new Map(
    (hrDocumentEntityMetadata.fields ?? []).map((field) => [field.key, field])
  );

  return (section?.fieldKeys ?? []).flatMap((fieldKey) => {
    const field = fieldMap.get(fieldKey);
    return field ? [field as MetadataFieldContract] : [];
  });
};

const detailValues = {
  contentType: "application/pdf",
  description: "Signed contract",
  employeeId: "employee-001",
  expiresAt: "1/1/2027",
  fileName: "contract.pdf",
  legalEntityCode: "LE-1",
  storagePath: "tenant/documents/contract.pdf",
  updatedAt: "6/1/2026, 12:00:00 PM",
  verifiedAt: "6/2/2026, 12:00:00 PM",
};

function MetadataUiHrDocumentDetailStory() {
  const context = createMetadataRenderContext(
    {
      permissions: {
        "hr.documents.read": true,
      },
      surfaceId: "storybook/metadata-ui-hr-document-detail",
    },
    {
      mode: "read",
      routeId: "storybook/metadata-ui-hr-document-detail",
      surfaceId: "storybook/metadata-ui-hr-document-detail",
    }
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 p-6 md:p-10">
      <MetadataSectionStack
        context={{ ...context, readonly: true }}
        resolveSectionContent={({ section }) =>
          section.fields ? (
            <MetadataForm
              context={{ ...context, readonly: true }}
              fields={section.fields}
              values={detailValues}
            />
          ) : null
        }
        sections={[
          {
            fields: detailFields("document-details"),
            key: "document-details",
            kind: "form",
            title: "Document facts",
          },
          {
            fields: detailFields("document-timeline"),
            key: "document-timeline",
            kind: "form",
            title: "Lifecycle and retention dates",
          },
        ]}
      />
    </div>
  );
}

const meta = {
  title: "Metadata UI/HR Document Detail",
  component: MetadataUiHrDocumentDetailStory,
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" as const },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MetadataUiHrDocumentDetailStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DetailSections: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Document facts")).toBeVisible();
    await expect(canvas.getByDisplayValue("employee-001")).toBeVisible();
  },
};
