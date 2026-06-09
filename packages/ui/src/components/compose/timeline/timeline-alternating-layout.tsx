"use client";

import { ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";

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

const milestones = [
  {
    date: "Jan 2024",
    title: "Seed Funding",
    content: "Initial funding round closed and product direction locked.",
    accent: "from-left",
  },
  {
    date: "Mar 2024",
    title: "Product MVP",
    content: "The first production-ready slice shipped to a pilot group.",
    accent: "from-right",
  },
  {
    date: "May 2024",
    title: "First Client",
    content:
      "The first customer onboarding completed with success criteria met.",
    accent: "from-left",
  },
  {
    date: "Jul 2024",
    title: "Series A",
    content: "Growth metrics were strong enough to support the next stage.",
    accent: "from-right",
  },
  {
    date: "Sep 2024",
    title: "Global Expansion",
    content: "The roadmap extended to new regions and markets.",
    accent: "from-left",
  },
] as const;

export function TimelineAlternatingLayout() {
  return (
    <TimelinePatternCard
      title="Alternating layout"
      description="Cards shift left and right around a central rail for a more editorial feel."
    >
      <TimelineStage className="items-start">
        <Timeline className="w-full max-w-4xl gap-0">
          {milestones.map((item, index) => {
            const isLeft = index % 2 === 0;

            return (
              <TimelineItem
                key={item.title}
                step={index + 1}
                className="grid grid-cols-[1fr_auto_1fr] gap-x-4"
              >
                <div className={isLeft ? "pr-2" : "invisible"} />
                <div className="flex flex-col items-center">
                  <TimelineIndicator className="size-4" />
                  {index < milestones.length - 1 ? <TimelineSeparator /> : null}
                </div>
                <div className={isLeft ? "pb-8" : "pb-8"}>
                  <div className={isLeft ? "max-w-md" : "ml-auto max-w-md"}>
                    <div className="rounded-2xl border bg-background p-4 shadow-sm">
                      <TimelineHeader className="gap-2">
                        <TimelineDate>{item.date}</TimelineDate>
                        <div className="flex items-center gap-2">
                          {isLeft ? (
                            <ArrowDownRight className="size-4 text-primary" />
                          ) : (
                            <ArrowUpRight className="size-4 text-primary" />
                          )}
                          <TimelineTitle>{item.title}</TimelineTitle>
                        </div>
                      </TimelineHeader>
                      <TimelineContent className="mt-2">
                        {item.content}
                      </TimelineContent>
                      <Badge variant="outline" className="mt-4 rounded-full">
                        <Sparkles className="size-3.5" />
                        {isLeft ? "Expansion" : "Milestone"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TimelineItem>
            );
          })}
        </Timeline>
      </TimelineStage>
    </TimelinePatternCard>
  );
}
