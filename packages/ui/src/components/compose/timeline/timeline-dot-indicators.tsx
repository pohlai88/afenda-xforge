"use client";

import { Check, Circle, Dot } from "lucide-react";

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

const items = [
  {
    date: "Week 1",
    title: "Planning",
    content: "Scope definition and resource planning.",
    icon: Circle,
  },
  {
    date: "Week 2",
    title: "Design",
    content: "UI/UX design and prototyping.",
    icon: Dot,
  },
  {
    date: "Week 4",
    title: "Development",
    content: "Core features implementation.",
    icon: Check,
  },
] as const;

export function TimelineDotIndicators() {
  return (
    <TimelinePatternCard
      title="Dot indicators"
      description="A stripped-down timeline with tiny indicators and minimal visual weight."
    >
      <TimelineStage>
        <Timeline className="w-full max-w-lg gap-0">
          {items.map((item, index) => (
            <TimelineItem
              key={item.title}
              step={index + 1}
              className="grid grid-cols-[auto_1fr] gap-x-4"
            >
              <div className="flex flex-col items-center">
                <TimelineIndicator className="size-2.5 bg-foreground/50" />
                {index < items.length - 1 ? (
                  <TimelineSeparator className="min-h-10 bg-border/70" />
                ) : null}
              </div>
              <div className="pb-6">
                <TimelineHeader>
                  <TimelineDate>{item.date}</TimelineDate>
                  <TimelineTitle>{item.title}</TimelineTitle>
                </TimelineHeader>
                <TimelineContent className="mt-2">
                  {item.content}
                </TimelineContent>
              </div>
            </TimelineItem>
          ))}
        </Timeline>
      </TimelineStage>
    </TimelinePatternCard>
  );
}
