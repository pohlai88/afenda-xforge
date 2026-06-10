import { AccordionComposeGallery } from "../../../packages/ui/src/components/compose/accordion/accordion-gallery";
import { AlertComposeGallery } from "../../../packages/ui/src/components/compose/alert/alert-gallery";
import { AlertDialogComposeGallery } from "../../../packages/ui/src/components/compose/alert-dialog/alert-dialog-gallery";
import { AspectRatioComposeGallery } from "../../../packages/ui/src/components/compose/aspect-ratio/aspect-ratio-gallery";
import { CardComposeGallery } from "../../../packages/ui/src/components/compose/card/card-gallery";
import { CollapsibleComposeGallery } from "../../../packages/ui/src/components/compose/collapsible/collapsible-gallery";
import { EmptyComposeGallery } from "../../../packages/ui/src/components/compose/empty/empty-gallery";
import { FiltersComposeGallery } from "../../../packages/ui/src/components/compose/filters/filters-gallery";
import { FrameComposeGallery } from "../../../packages/ui/src/components/compose/frame/frame-gallery";
import { SheetComposeGallery } from "../../../packages/ui/src/components/compose/sheet/sheet-gallery";
import { SkeletonComposeGallery } from "../../../packages/ui/src/components/compose/skeleton/skeleton-gallery";
import { SortableComposeGallery } from "../../../packages/ui/src/components/compose/sortable/sortable-gallery";
import { SpinnerComposeGallery } from "../../../packages/ui/src/components/compose/spinner/spinner-gallery";
import type { Meta, StoryObj } from "@storybook/react";

import { galleryStory } from "./ui-compose-story-utils";

const meta = {
  title: "UI/Compose/Feedback",
  parameters: {
    layout: "fullscreen",
    a11y: { test: "todo" as const },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Accordion: Story = galleryStory(AccordionComposeGallery, "todo");
export const Alert: Story = galleryStory(AlertComposeGallery, "todo");
export const AlertDialog: Story = galleryStory(AlertDialogComposeGallery, "todo");
export const AspectRatio: Story = galleryStory(AspectRatioComposeGallery, "todo");
export const Card: Story = galleryStory(CardComposeGallery, "error");
export const Collapsible: Story = galleryStory(CollapsibleComposeGallery, "todo");
export const Empty: Story = galleryStory(EmptyComposeGallery, "error");
export const Filters: Story = galleryStory(FiltersComposeGallery, "todo");
export const Frame: Story = galleryStory(FrameComposeGallery, "todo");
export const Sheet: Story = galleryStory(SheetComposeGallery, "todo");
export const Skeleton: Story = galleryStory(SkeletonComposeGallery, "error");
export const Sortable: Story = galleryStory(SortableComposeGallery, "todo");
export const Spinner: Story = galleryStory(SpinnerComposeGallery, "todo");
