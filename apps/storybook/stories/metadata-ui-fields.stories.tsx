import {
  metadataUiGeneratedFieldFixtures,
  publicConsumerValues,
} from "@repo/metadata-ui/fixtures";
import {
  CheckboxFieldRenderer,
  DateFieldRenderer,
  MoneyFieldRenderer,
  NumberFieldRenderer,
  SelectFieldRenderer,
  SwitchFieldRenderer,
  TextareaFieldRenderer,
  TextFieldRenderer,
} from "@repo/metadata-ui/renderers";
import type { Meta, StoryObj } from "@storybook/react";

import {
  MetadataUiStoryFrame,
  metadataUiStoryContext,
  metadataUiStoryParameters,
} from "./metadata-ui-story-utils";

const fieldByKey = Object.fromEntries(
  metadataUiGeneratedFieldFixtures.map((field) => [field.key, field])
);

function FieldStory({
  fieldKey,
}: {
  fieldKey: keyof typeof publicConsumerValues;
}) {
  const field = fieldByKey[fieldKey];
  if (!field) {
    return null;
  }

  const value = publicConsumerValues[fieldKey];
  const rendererProps = {
    context: metadataUiStoryContext,
    diagnostics: [],
    disabled: false,
    field,
    value,
  };

  switch (field.kind) {
    case "checkbox":
      return <CheckboxFieldRenderer {...rendererProps} />;
    case "date":
      return <DateFieldRenderer {...rendererProps} />;
    case "money":
      return <MoneyFieldRenderer {...rendererProps} />;
    case "number":
      return <NumberFieldRenderer {...rendererProps} />;
    case "select":
      return <SelectFieldRenderer {...rendererProps} />;
    case "switch":
      return <SwitchFieldRenderer {...rendererProps} />;
    case "textarea":
      return <TextareaFieldRenderer {...rendererProps} />;
    default:
      return <TextFieldRenderer {...rendererProps} />;
  }
}

const meta = {
  title: "Metadata UI/Fields",
  parameters: metadataUiStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Checkbox: Story = {
  render: () => (
    <MetadataUiStoryFrame>
      <FieldStory fieldKey="checkbox" />
    </MetadataUiStoryFrame>
  ),
};

export const DateField: Story = {
  render: () => (
    <MetadataUiStoryFrame>
      <FieldStory fieldKey="date" />
    </MetadataUiStoryFrame>
  ),
};

export const Money: Story = {
  render: () => (
    <MetadataUiStoryFrame>
      <FieldStory fieldKey="money" />
    </MetadataUiStoryFrame>
  ),
};

export const NumberField: Story = {
  render: () => (
    <MetadataUiStoryFrame>
      <FieldStory fieldKey="number" />
    </MetadataUiStoryFrame>
  ),
};

export const Select: Story = {
  render: () => (
    <MetadataUiStoryFrame>
      <FieldStory fieldKey="select" />
    </MetadataUiStoryFrame>
  ),
};

export const Switch: Story = {
  render: () => (
    <MetadataUiStoryFrame>
      <FieldStory fieldKey="switch" />
    </MetadataUiStoryFrame>
  ),
};

export const Text: Story = {
  render: () => (
    <MetadataUiStoryFrame>
      <FieldStory fieldKey="text" />
    </MetadataUiStoryFrame>
  ),
};

export const Textarea: Story = {
  render: () => (
    <MetadataUiStoryFrame>
      <FieldStory fieldKey="textarea" />
    </MetadataUiStoryFrame>
  ),
};

export const Status: Story = {
  render: () => (
    <MetadataUiStoryFrame>
      <FieldStory fieldKey="status" />
    </MetadataUiStoryFrame>
  ),
};
