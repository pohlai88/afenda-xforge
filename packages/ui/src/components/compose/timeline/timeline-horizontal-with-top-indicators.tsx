"use client";

import { Badge } from "../../ui-shadcn/badge";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "../../ui-shadcn/timeline";
import { TimelinePatternCard, TimelineStage } from "./timeline.shared";

const phases = [
  {
    date: "Oct 15, 2025",
    title: "Initiated Design Phase",
    content: "The first design artifacts were approved by stakeholders.",
  },
  {
    date: "Nov 01, 2025",
    title: "Completed Usability Testing",
    content: "Feedback was synthesized into the next iteration of the UI.",
  },
  {
    date: "Dec 15, 2025",
    title: "Completed Beta Program",
    content: "The beta cohort completed structured validation and review.",
  },
] as const;

export function TimelineHorizontalWithTopIndicators() {
  return (
    <TimelinePatternCard
      title="Horizontal with top indicators"
      description="A top-aligned variant where the timeline dots sit above each milestone card."
    >
      <TimelineStage className="items-start">
        <Timeline
          orientation="horizontal"
          className="w-full gap-0 overflow-x-auto pb-2"
        >
          {phases.map((item, index) => (
            <TimelineItem
              key={item.title}
              step={index + 1}
              className="flex min-w-[220px] flex-1 flex-col"
            >
              <div className="flex flex-col items-center">
                <TimelineIndicator className="size-4" />
                {index < phases.length - 1 ? (
                  <TimelineSeparator className="h-px min-w-16 bg-border" />
                ) : null}
              </div>
              <div className="mt-4 rounded-2xl border bg-background p-4 shadow-sm">
                <TimelineHeader className="justify-start">
                  <TimelineDate>{item.date}</TimelineDate>
                  <TimelineTitle>{item.title}</TimelineTitle>
                </TimelineHeader>
                <TimelineContent className="mt-2">
                  {item.content}
                </TimelineContent>
                <Badge variant="secondary" className="mt-4 rounded-full">
                  Completed
                </Badge>
              </div>
            </TimelineItem>
          ))}
        </Timeline>
      </TimelineStage>
    </TimelinePatternCard>
  );
}
