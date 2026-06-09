"use client";

import {
  CalendarDays,
  ChartColumnBig,
  GraduationCap,
  Sparkles,
} from "lucide-react";

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
    date: "Jan 2025",
    title: "AI Engine Integration",
    content:
      "Deep integration of advanced LLMs for real-time code generation and context-aware suggestions.",
    icon: Sparkles,
  },
  {
    date: "Feb 2025",
    title: "Collaborative Editing",
    content:
      "Multi-user real-time collaboration with shared cursors and instant synchronization across workspaces.",
    icon: ChartColumnBig,
  },
  {
    date: "Mar 2025",
    title: "Visual Theme Builder",
    content:
      "Interactive interface for creating and managing custom design systems with automated CSS variable generation.",
    icon: GraduationCap,
  },
  {
    date: "Apr 2025",
    title: "Enterprise Security",
    content:
      "Role-based access control, SOC2 compliance audit, and enhanced data encryption protocols.",
    icon: CalendarDays,
  },
] as const;

export function TimelineWithLeftAlignedDates() {
  return (
    <TimelinePatternCard
      title="Timeline with left-aligned dates"
      description="Dates are pinned in a narrow column so the descriptive content can breathe."
    >
      <TimelineStage>
        <Timeline className="w-full max-w-2xl gap-0">
          {roadmap.map((item, index) => (
            <TimelineItem
              key={item.title}
              step={index + 1}
              className="grid grid-cols-[110px_24px_minmax(0,1fr)] gap-x-4"
            >
              <TimelineDate className="pt-0.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {item.date}
              </TimelineDate>
              <div className="flex flex-col items-center">
                <TimelineIndicator className="size-4" />
                {index < roadmap.length - 1 ? <TimelineSeparator /> : null}
              </div>
              <div className="pb-6">
                <TimelineHeader>
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
