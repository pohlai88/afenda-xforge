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

const items = [
  {
    date: "Week 1",
    title: "Planning",
    content: "Scope definition and resource planning.",
    tone: "secondary",
  },
  {
    date: "Week 2",
    title: "Design",
    content: "UI/UX design and prototyping.",
    tone: "outline",
  },
  {
    date: "Week 4",
    title: "Development",
    content: "Core features implementation.",
    tone: "default",
  },
] as const;

export function TimelineCustomizedTimeline() {
  return (
    <TimelinePatternCard
      title="Customized timeline"
      description="A branded timeline that uses badges and accent-rich chips to emphasize status."
    >
      <TimelineStage>
        <Timeline className="w-full max-w-xl gap-0">
          {items.map((item, index) => (
            <TimelineItem
              key={item.title}
              step={index + 1}
              className="grid grid-cols-[auto_1fr] gap-x-4"
            >
              <div className="flex flex-col items-center">
                <TimelineIndicator className="size-5 border-0 bg-primary/20 text-primary">
                  {index + 1}
                </TimelineIndicator>
                {index < items.length - 1 ? <TimelineSeparator /> : null}
              </div>
              <div className="pb-6">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <TimelineHeader>
                    <TimelineDate>{item.date}</TimelineDate>
                    <TimelineTitle>{item.title}</TimelineTitle>
                  </TimelineHeader>
                  <TimelineContent className="mt-2">
                    {item.content}
                  </TimelineContent>
                  <Badge variant={item.tone} className="mt-4 rounded-full">
                    Custom accent
                  </Badge>
                </div>
              </div>
            </TimelineItem>
          ))}
        </Timeline>
      </TimelineStage>
    </TimelinePatternCard>
  );
}
