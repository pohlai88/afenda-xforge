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

const roadmap = [
  {
    date: "Oct 2024",
    title: "Kickoff",
    content: "Defining project goals and core team selection.",
  },
  {
    date: "Nov 2024",
    title: "Discovery",
    content: "User research and requirements gathering phase.",
  },
  {
    date: "Dec 2024",
    title: "Implementation",
    content: "Core development and sprint execution.",
  },
] as const;

export function TimelineCompactRoadmap() {
  return (
    <TimelinePatternCard
      title="Compact roadmap"
      description="A tight roadmap layout with concise milestones and low vertical density."
    >
      <TimelineStage>
        <Timeline className="w-full max-w-xl gap-0">
          {roadmap.map((item, index) => (
            <TimelineItem
              key={item.title}
              step={index + 1}
              className="grid grid-cols-[auto_1fr] gap-x-4"
            >
              <div className="flex flex-col items-center">
                <TimelineIndicator className="size-4" />
                {index < roadmap.length - 1 ? <TimelineSeparator /> : null}
              </div>
              <div className="pb-5">
                <div className="rounded-xl border bg-background px-4 py-3 shadow-sm">
                  <TimelineHeader className="gap-0.5">
                    <TimelineDate className="text-xs uppercase tracking-wide">
                      {item.date}
                    </TimelineDate>
                    <TimelineTitle>{item.title}</TimelineTitle>
                  </TimelineHeader>
                  <TimelineContent className="mt-2">
                    {item.content}
                  </TimelineContent>
                  <Badge variant="outline" className="mt-3 rounded-full">
                    Roadmap
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
