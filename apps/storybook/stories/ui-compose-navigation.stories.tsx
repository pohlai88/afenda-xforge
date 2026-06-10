import type { Meta, StoryObj } from "@storybook/react";

import { lazyGalleryStory } from "./ui-compose-story-utils";

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

export const Breadcrumb: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/breadcrumb/breadcrumb-gallery").then((module) => ({ default: module.BreadcrumbComposeGallery })), "error");
export const Command: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/command/command-gallery").then((module) => ({ default: module.CommandComposeGallery })), "error");
export const Scrollspy: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/scrollspy/scrollspy-gallery").then((module) => ({ default: module.ScrollspyComposeGallery })), "error");
export const Stepper: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/stepper/stepper-gallery").then((module) => ({ default: module.StepperComposeGallery })), "error");
export const Tabs: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/tabs/tabs-gallery").then((module) => ({ default: module.TabsComposeGallery })), "error");
