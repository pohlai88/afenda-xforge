import type { Meta, StoryObj } from "@storybook/react";

import { lazyGalleryStory } from "./ui-compose-story-utils";

const meta = {
  title: "UI/Compose/Data",
  parameters: {
    layout: "fullscreen",
    a11y: { test: "todo" as const },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Avatar: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/avatar/avatar-gallery").then((module) => ({ default: module.AvatarComposeGallery })), "error");
export const Badge: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/badge/badge-gallery").then((module) => ({ default: module.BadgeComposeGallery })), "error");
export const Chart: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/chart/chart-gallery").then((module) => ({ default: module.ChartComposeGallery })), "error");
export const DataGrid: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/data-grid/data-grid-gallery").then((module) => ({ default: module.DataGridComposeGallery })), "error");
export const Kanban: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/kanban/kanban-gallery").then((module) => ({ default: module.KanbanComposeGallery })), "error");
export const LineChart: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/line-chart/line-chart-gallery").then((module) => ({ default: module.LineChartComposeGallery })), "error");
export const StatisticCard: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/statistic-card/statistic-card-gallery").then((module) => ({ default: module.StatisticCardComposeGallery })), "error");
export const Timeline: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/timeline/timeline-gallery").then((module) => ({ default: module.TimelineComposeGallery })), "error");
export const Tree: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/tree/tree-gallery").then((module) => ({ default: module.TreeComposeGallery })), "error");
