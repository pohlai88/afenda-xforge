"use client";

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
    date: "March 2024",
    title: "Project Initialized",
    content:
      "Successfully set up the project repository and initial architecture.",
  },
  {
    date: "April 2024",
    title: "Beta Release",
    content: "Launched the beta version for early testers and feedback.",
  },
  {
    date: "June 2024",
    title: "Official Launch",
    content: "The platform is now live for all users worldwide.",
  },
] as const;

export function TimelineBasic() {
  return (
    <TimelinePatternCard
      title="Basic timeline"
      description="A minimal chronological list with clear milestones and a simple rail."
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
                <TimelineIndicator />
                {index < items.length - 1 ? <TimelineSeparator /> : null}
              </div>
              <div className="pb-6 last:pb-0">
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
