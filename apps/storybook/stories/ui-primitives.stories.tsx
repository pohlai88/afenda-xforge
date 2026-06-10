import type { Meta, StoryObj } from "@storybook/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";

import {
  PrimitiveBadgesMatrix,
  PrimitiveButtonShowcase,
  PrimitiveButtonsMatrix,
} from "./ui-primitives-showcases";

const meta = {
  title: "UI/Primitives/Actions",
  component: PrimitiveButtonShowcase,
  parameters: {
    layout: "centered",
    a11y: { test: "error" as const },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "outline",
        "ghost",
        "destructive",
        "link",
      ],
      description: "Button visual variant",
    },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
} satisfies Meta<typeof PrimitiveButtonShowcase>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ButtonDefault: Story = {
  args: {
    label: "Save",
    variant: "default",
    disabled: false,
  },
};

export const Buttons: Story = {
  render: () => <PrimitiveButtonsMatrix />,
};

export const Badges: Story = {
  render: () => <PrimitiveBadgesMatrix />,
};

export const FormControls: Story = {
  render: () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Form controls</CardTitle>
        <CardDescription>
          shadcn primitives from <code>@repo/ui</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="storybook-name">Name</Label>
          <Input id="storybook-name" placeholder="Acme Billing" />
        </div>
        <Button type="button">Save</Button>
      </CardContent>
    </Card>
  ),
};
