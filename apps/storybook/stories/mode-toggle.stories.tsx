import type { Meta, StoryObj } from "@storybook/react";
import { ModeToggle } from "@repo/design-system/components/mode-toggle";

const meta: Meta<typeof ModeToggle> = {
  title: "Design System/Mode Toggle",
  component: ModeToggle,
};

export default meta;

type Story = StoryObj<typeof ModeToggle>;

export const Default: Story = {};
