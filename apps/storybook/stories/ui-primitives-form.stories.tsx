import {
  Checkbox,
  Input,
  Label,
  NativeSelect,
  NativeSelectOption,
  Switch,
  Textarea,
} from "@repo/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "UI/Primitives/Form",
  parameters: {
    layout: "centered",
    a11y: { test: "error" as const },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Inputs: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-4">
      <div className="grid gap-2">
        <Label htmlFor="primitive-input">Name</Label>
        <Input id="primitive-input" placeholder="Acme Billing" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="primitive-textarea">Notes</Label>
        <Textarea id="primitive-textarea" placeholder="Internal notes" />
      </div>
    </div>
  ),
};

export const SelectionControls: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Checkbox id="primitive-checkbox" />
        <Label htmlFor="primitive-checkbox">Enable notifications</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="primitive-switch" />
        <Label htmlFor="primitive-switch">Autopay enabled</Label>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="primitive-status">Status</Label>
        <NativeSelect defaultValue="active" id="primitive-status">
          <NativeSelectOption value="draft">Draft</NativeSelectOption>
          <NativeSelectOption value="active">Active</NativeSelectOption>
          <NativeSelectOption value="archived">Archived</NativeSelectOption>
        </NativeSelect>
      </div>
    </div>
  ),
};
