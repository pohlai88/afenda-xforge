import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { TimelineActivityFeed } from "./timeline-activity-feed";
import { TimelineBasic } from "./timeline-basic";
import { TimelinePipelineSteps } from "./timeline-pipeline-steps";
import { TimelineWithLeftAlignedDates } from "./timeline-with-left-aligned-dates";

export type TimelinePatternSpec = ComposeRenderablePatternSpec;

export const timelinePatternCatalog = [
  {
    name: "basic",
    title: "Basic",
    description: "A standard chronological event timeline.",
    component: TimelineBasic,
  },
  {
    name: "activity-feed",
    title: "Activity Feed",
    description: "A timeline styled as an activity feed.",
    component: TimelineActivityFeed,
  },
  {
    name: "pipeline-steps",
    title: "Pipeline Steps",
    description: "A process timeline for workflow stages.",
    component: TimelinePipelineSteps,
  },
  {
    name: "left-aligned-dates",
    title: "Left Aligned Dates",
    description: "A timeline with clearly separated date columns.",
    component: TimelineWithLeftAlignedDates,
  },
] as const satisfies readonly TimelinePatternSpec[];

export type TimelinePatternName =
  (typeof timelinePatternCatalog)[number]["name"];

export const timelinePatternCount = timelinePatternCatalog.length;
export const timelinePatternNames = timelinePatternCatalog.map(
  (pattern) => pattern.name,
) as TimelinePatternName[];
