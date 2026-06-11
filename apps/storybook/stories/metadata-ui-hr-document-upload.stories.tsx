import {
  hrDocumentEntityMetadata,
  hrDocumentUploadFieldOptions,
} from "@repo/features-employee-management-documents-management/metadata/document-entity";
import type { EntityMetadata } from "@repo/metadata";
import { MetadataForm } from "@repo/metadata-ui/components";
import type { MetadataFieldContract } from "@repo/metadata-ui/contracts";
import { createMetadataRenderContext } from "@repo/metadata-ui/contracts";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";

const buildUploadFields = (
  metadata: EntityMetadata
): readonly MetadataFieldContract[] => {
  const uploadForm = metadata.forms?.find(
    (form) => form.key === "document-upload"
  );
  const fieldMap = new Map(
    (metadata.fields ?? []).map((field) => [field.key, field])
  );

  return (uploadForm?.fieldKeys ?? []).flatMap((fieldKey) => {
    const field = fieldMap.get(fieldKey);
    if (!field) {
      return [];
    }

    if (field.key === "documentCategory") {
      return [
        {
          ...field,
          kind: "select",
          options: hrDocumentUploadFieldOptions.documentCategory,
        },
      ];
    }

    if (field.key === "documentType") {
      return [
        {
          ...field,
          kind: "select",
          options: hrDocumentUploadFieldOptions.documentType,
        },
      ];
    }

    if (field.key === "visibility") {
      return [
        {
          ...field,
          kind: "select",
          options: hrDocumentUploadFieldOptions.visibility,
        },
      ];
    }

    return [field as MetadataFieldContract];
  });
};

function MetadataUiHrDocumentUploadStory() {
  const context = createMetadataRenderContext(
    {
      permissions: {
        "hr.documents.write": true,
      },
      surfaceId: "storybook/metadata-ui-hr-document-upload",
    },
    {
      mode: "create",
      routeId: "storybook/metadata-ui-hr-document-upload",
      surfaceId: "storybook/metadata-ui-hr-document-upload",
    }
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 p-6 md:p-10">
      <MetadataForm
        context={context}
        description="Register document metadata before uploading file bytes."
        fields={buildUploadFields(hrDocumentEntityMetadata)}
        title="Document metadata"
        values={{
          documentCategory: "employment",
          documentType: "employment_contract",
          employeeId: "employee-001",
          mandatory: true,
          title: "Employment contract",
          visibility: "internal",
        }}
      />
    </div>
  );
}

const meta = {
  title: "Metadata UI/HR Document Upload",
  component: MetadataUiHrDocumentUploadStory,
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" as const },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MetadataUiHrDocumentUploadStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const UploadForm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { name: "Document metadata" })
    ).toBeVisible();
    await expect(canvas.getByDisplayValue("employee-001")).toBeVisible();
  },
};
