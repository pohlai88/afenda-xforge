import { ModeToggle } from "@repo/ui/components/mode-toggle";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof ModeToggle> = {
  title: "Foundations/Mode Toggle",
  component: ModeToggle,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof ModeToggle>;

export const Default: Story = {};

export const Light: Story = {
  parameters: {
    theme: "light",
  },
};

export const Dark: Story = {
  parameters: {
    theme: "dark",
  },
};

export const System: Story = {
  parameters: {
    theme: "system",
  },
};
