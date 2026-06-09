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

const steps = [
  {
    date: "12s",
    title: "Source Code Checkout",
    content: "Successfully fetched latest changes from the main branch.",
    owner: "A Alex Johnson",
    status: "Completed",
  },
  {
    date: "1m 45s",
    title: "Dependency Installation",
    content: "All npm packages installed and cached for future builds.",
    owner: "S Sarah Chen",
    status: "Completed",
  },
  {
    date: "Running",
    title: "Unit & Integration Tests",
    content: "Running 142 test suites across the entire codebase...",
    owner: "M Michael Rodriguez",
    status: "Running",
  },
  {
    date: "Pending",
    title: "Production Build",
    content: "Optimizing assets and generating static site pages.",
    owner: "E Emma Wilson",
    status: "Pending",
  },
] as const;

export function TimelineHorizontalOrientation() {
  return (
    <TimelinePatternCard
      title="Horizontal orientation"
      description="A status pipeline arranged left to right with compact step cards."
    >
      <TimelineStage className="items-start">
        <Timeline
          orientation="horizontal"
          className="w-full gap-0 overflow-x-auto pb-2"
        >
          {steps.map((item, index) => (
            <TimelineItem
              key={item.title}
              step={index + 1}
              className="flex min-w-[220px] flex-1 flex-col"
            >
              <div className="flex items-center gap-3">
                <TimelineIndicator className="size-4" />
                {index < steps.length - 1 ? (
                  <TimelineSeparator className="h-px min-w-16 bg-border" />
                ) : null}
              </div>
              <div className="mt-4 rounded-2xl border bg-background p-4 shadow-sm">
                <TimelineHeader>
                  <TimelineDate>{item.date}</TimelineDate>
                  <TimelineTitle>{item.title}</TimelineTitle>
                </TimelineHeader>
                <TimelineContent className="mt-2">
                  {item.content}
                </TimelineContent>
                <Badge variant="outline" className="mt-4 rounded-full">
                  {item.owner}
                </Badge>
              </div>
            </TimelineItem>
          ))}
        </Timeline>
      </TimelineStage>
    </TimelinePatternCard>
  );
}
