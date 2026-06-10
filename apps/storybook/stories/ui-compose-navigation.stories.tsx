import { BreadcrumbComposeGallery } from "../../../packages/ui/src/components/compose/breadcrumb/breadcrumb-gallery";
import { CommandComposeGallery } from "../../../packages/ui/src/components/compose/command/command-gallery";
import { ScrollspyComposeGallery } from "../../../packages/ui/src/components/compose/scrollspy/scrollspy-gallery";
import { StepperComposeGallery } from "../../../packages/ui/src/components/compose/stepper/stepper-gallery";
import { TabsComposeGallery } from "../../../packages/ui/src/components/compose/tabs/tabs-gallery";
import type { Meta, StoryObj } from "@storybook/react";

import { galleryStory } from "./ui-compose-story-utils";

const meta = {
  title: "UI/Compose/Navigation",
  parameters: {
    layout: "fullscreen",
    a11y: { test: "todo" as const },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Breadcrumb: Story = galleryStory(BreadcrumbComposeGallery, "todo");
export const Command: Story = galleryStory(CommandComposeGallery, "todo");
export const Scrollspy: Story = galleryStory(ScrollspyComposeGallery, "todo");
export const Stepper: Story = galleryStory(StepperComposeGallery, "todo");
export const Tabs: Story = galleryStory(TabsComposeGallery, "error");
