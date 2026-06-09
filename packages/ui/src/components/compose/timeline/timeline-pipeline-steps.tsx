"use client";

import { Badge } from "../../ui-shadcn/badge";
import { Button } from "../../ui-shadcn/button";
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
    date: "Planning",
    title: "Scope Definition",
    content: "Requirements were mapped to release blocks and owners.",
    status: "Completed",
  },
  {
    date: "Design",
    title: "Prototype Review",
    content: "Core interactions were validated with a clickable prototype.",
    status: "In Review",
  },
  {
    date: "Development",
    title: "Feature Build",
    content: "Primary modules are in progress with integration tests passing.",
    status: "Running",
  },
  {
    date: "Launch",
    title: "Production Rollout",
    content: "The deployment gate remains pending final sign-off.",
    status: "Pending",
  },
] as const;

export function TimelinePipelineSteps() {
  return (
    <TimelinePatternCard
      title="Pipeline steps"
      description="A release pipeline rendered as a vertical status sequence with explicit states."
    >
      <TimelineStage>
        <Timeline className="w-full max-w-2xl gap-0">
          {steps.map((item, index) => (
            <TimelineItem
              key={item.title}
              step={index + 1}
              className="grid grid-cols-[auto_1fr] gap-x-4"
            >
              <div className="flex flex-col items-center">
                <TimelineIndicator className="size-5 rounded-full border-0 bg-primary/15 text-primary">
                  {index + 1}
                </TimelineIndicator>
                {index < steps.length - 1 ? <TimelineSeparator /> : null}
              </div>
              <div className="pb-6">
                <div className="flex items-start justify-between gap-4 rounded-2xl border bg-background p-4 shadow-sm">
                  <div className="min-w-0">
                    <TimelineHeader>
                      <TimelineDate>{item.date}</TimelineDate>
                      <TimelineTitle>{item.title}</TimelineTitle>
                    </TimelineHeader>
                    <TimelineContent className="mt-2">
                      {item.content}
                    </TimelineContent>
                    <div className="mt-4 flex items-center gap-2">
                      <Badge variant="secondary" className="rounded-full">
                        {item.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TimelineItem>
          ))}
        </Timeline>
      </TimelineStage>
    </TimelinePatternCard>
  );
}
