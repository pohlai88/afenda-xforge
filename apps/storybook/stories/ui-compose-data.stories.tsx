import { AvatarComposeGallery } from "../../../packages/ui/src/components/compose/avatar/avatar-gallery";
import { BadgeComposeGallery } from "../../../packages/ui/src/components/compose/badge/badge-gallery";
import { ChartComposeGallery } from "../../../packages/ui/src/components/compose/chart/chart-gallery";
import { DataGridComposeGallery } from "../../../packages/ui/src/components/compose/data-grid/data-grid-gallery";
import { KanbanComposeGallery } from "../../../packages/ui/src/components/compose/kanban/kanban-gallery";
import { LineChartComposeGallery } from "../../../packages/ui/src/components/compose/line-chart/line-chart-gallery";
import { StatisticCardComposeGallery } from "../../../packages/ui/src/components/compose/statistic-card/statistic-card-gallery";
import { TimelineComposeGallery } from "../../../packages/ui/src/components/compose/timeline/timeline-gallery";
import { TreeComposeGallery } from "../../../packages/ui/src/components/compose/tree/tree-gallery";
import type { Meta, StoryObj } from "@storybook/react";

import { galleryStory } from "./ui-compose-story-utils";

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

export const Avatar: Story = galleryStory(AvatarComposeGallery, "todo");
export const Badge: Story = galleryStory(BadgeComposeGallery, "todo");
export const Chart: Story = galleryStory(ChartComposeGallery, "todo");
export const DataGrid: Story = galleryStory(DataGridComposeGallery, "todo");
export const Kanban: Story = galleryStory(KanbanComposeGallery, "todo");
export const LineChart: Story = galleryStory(LineChartComposeGallery, "todo");
export const StatisticCard: Story = galleryStory(StatisticCardComposeGallery, "todo");
export const Timeline: Story = galleryStory(TimelineComposeGallery, "todo");
export const Tree: Story = galleryStory(TreeComposeGallery, "todo");
