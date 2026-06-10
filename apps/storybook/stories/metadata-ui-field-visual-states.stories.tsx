import type { MetadataDiagnostic } from "@repo/metadata-ui/contracts";
import {
  metadataUiGeneratedFieldFixtures,
  publicConsumerValues,
} from "@repo/metadata-ui/fixtures";
import { TextFieldRenderer } from "@repo/metadata-ui/renderers";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";

import {
  MetadataUiStoryFrame,
  metadataUiStoryContext,
  metadataUiStoryParameters,
} from "./metadata-ui-story-utils";

const textField =
  metadataUiGeneratedFieldFixtures.find((field) => field.key === "text") ??
  metadataUiGeneratedFieldFixtures[0];

function FieldVisualStatePreview({
  disabled = false,
  readonly = false,
  withFieldError = false,
}: {
  disabled?: boolean;
  readonly?: boolean;
  withFieldError?: boolean;
}) {
  const diagnostics: readonly MetadataDiagnostic[] = withFieldError
    ? [
        {
          code: "invalid-contract",
          correlationId: "storybook-field-error",
          message: "Name must be at least 3 characters.",
          severity: "error",
          target: "text",
        },
      ]
    : [];

  return (
    <MetadataUiStoryFrame>
      <TextFieldRenderer
        context={
          readonly
            ? { ...metadataUiStoryContext, readonly: true }
            : metadataUiStoryContext
        }
        diagnostics={diagnostics}
        disabled={disabled}
        field={textField}
        value={publicConsumerValues.text}
      />
    </MetadataUiStoryFrame>
  );
}

const meta = {
  title: "Metadata UI/Field Visual States",
  component: FieldVisualStatePreview,
  parameters: metadataUiStoryParameters,
  tags: ["autodocs"],
} satisfies Meta<typeof FieldVisualStatePreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    disabled: false,
    readonly: false,
    withFieldError: false,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    readonly: false,
    withFieldError: false,
  },
};

export const Readonly: Story = {
  args: {
    disabled: false,
    readonly: true,
    withFieldError: false,
  },
};

export const FieldError: Story = {
  args: {
    disabled: false,
    readonly: false,
    withFieldError: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Text");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(
      canvas.getByText("Name must be at least 3 characters.")
    ).toBeVisible();
  },
};
