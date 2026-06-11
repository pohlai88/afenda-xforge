import type { Meta, StoryObj } from "@storybook/react";

import { lazyGalleryStory } from "./ui-compose-story-utils";

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

export const Accordion: Story = lazyGalleryStory(
  () =>
    import(
      "../../../packages/ui/src/components/compose/accordion/accordion-gallery"
    ).then((module) => ({ default: module.AccordionComposeGallery })),
  "error"
);
export const Alert: Story = lazyGalleryStory(
  () =>
    import(
      "../../../packages/ui/src/components/compose/alert/alert-gallery"
    ).then((module) => ({ default: module.AlertComposeGallery })),
  "error"
);
export const AlertDialog: Story = lazyGalleryStory(
  () =>
    import(
      "../../../packages/ui/src/components/compose/alert-dialog/alert-dialog-gallery"
    ).then((module) => ({ default: module.AlertDialogComposeGallery })),
  "error"
);
export const AspectRatio: Story = lazyGalleryStory(
  () =>
    import(
      "../../../packages/ui/src/components/compose/aspect-ratio/aspect-ratio-gallery"
    ).then((module) => ({ default: module.AspectRatioComposeGallery })),
  "error"
);
export const Card: Story = lazyGalleryStory(
  () =>
    import(
      "../../../packages/ui/src/components/compose/card/card-gallery"
    ).then((module) => ({ default: module.CardComposeGallery })),
  "error"
);
export const Collapsible: Story = lazyGalleryStory(
  () =>
    import(
      "../../../packages/ui/src/components/compose/collapsible/collapsible-gallery"
    ).then((module) => ({ default: module.CollapsibleComposeGallery })),
  "error"
);
export const Empty: Story = lazyGalleryStory(
  () =>
    import(
      "../../../packages/ui/src/components/compose/empty/empty-gallery"
    ).then((module) => ({ default: module.EmptyComposeGallery })),
  "error"
);
export const Filters: Story = lazyGalleryStory(
  () =>
    import(
      "../../../packages/ui/src/components/compose/filters/filters-gallery"
    ).then((module) => ({ default: module.FiltersComposeGallery })),
  "error"
);
export const Frame: Story = lazyGalleryStory(
  () =>
    import(
      "../../../packages/ui/src/components/compose/frame/frame-gallery"
    ).then((module) => ({ default: module.FrameComposeGallery })),
  "error"
);
export const Sheet: Story = lazyGalleryStory(
  () =>
    import(
      "../../../packages/ui/src/components/compose/sheet/sheet-gallery"
    ).then((module) => ({ default: module.SheetComposeGallery })),
  "error"
);
export const Skeleton: Story = lazyGalleryStory(
  () =>
    import(
      "../../../packages/ui/src/components/compose/skeleton/skeleton-gallery"
    ).then((module) => ({ default: module.SkeletonComposeGallery })),
  "error"
);
export const Sortable: Story = lazyGalleryStory(
  () =>
    import(
      "../../../packages/ui/src/components/compose/sortable/sortable-gallery"
    ).then((module) => ({ default: module.SortableComposeGallery })),
  "error"
);
export const Spinner: Story = lazyGalleryStory(
  () =>
    import(
      "../../../packages/ui/src/components/compose/spinner/spinner-gallery"
    ).then((module) => ({ default: module.SpinnerComposeGallery })),
  "error"
);
