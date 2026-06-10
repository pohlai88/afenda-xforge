import type { Meta, StoryObj } from "@storybook/react";

import {
  PrimitiveInputShowcase,
  type PrimitiveInputShowcaseProps,
  PrimitiveSelectionShowcase,
  type PrimitiveSelectionShowcaseProps,
  PrimitiveTextareaShowcase,
} from "./ui-primitives-showcases";

const meta = {
  title: "UI/Primitives/Form",
  parameters: {
    layout: "centered",
    a11y: { test: "error" as const },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

export const Inputs: StoryObj<PrimitiveInputShowcaseProps> = {
  argTypes: {
    label: { control: "text", description: "Field label" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    value: { control: "text" },
  },
  render: (args) => (
    <div className="grid w-full max-w-sm gap-4">
      <PrimitiveInputShowcase {...args} />
      <PrimitiveTextareaShowcase label="Notes" placeholder="Internal notes" />
    </div>
  ),
  args: {
    label: "Name",
    placeholder: "Acme Billing",
    disabled: false,
    value: "",
  },
};

export const SelectionControls: StoryObj<PrimitiveSelectionShowcaseProps> = {
  render: (args) => <PrimitiveSelectionShowcase {...args} />,
  argTypes: {
    checkboxLabel: { control: "text" },
    switchLabel: { control: "text" },
    statusDefault: {
      control: "select",
      options: ["draft", "active", "archived"],
    },
  },
  args: {
    checkboxLabel: "Enable notifications",
    switchLabel: "Autopay enabled",
    statusDefault: "active",
  },
};
