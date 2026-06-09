"use client";

import { Github, MessageSquare, Rocket, Users2 } from "lucide-react";

import { Avatar, AvatarFallback } from "../../ui-shadcn/avatar";
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

const events = [
  {
    date: "15 minutes ago",
    title: "Forked Repository",
    content: "Forked the repository to create a new branch for development.",
    icon: Github,
    avatar: "AJ",
  },
  {
    date: "10 minutes ago",
    title: "Pull Request Submitted",
    content:
      "Submitted PR #342 with new feature implementation. Waiting for code review.",
    icon: MessageSquare,
    avatar: "SC",
  },
  {
    date: "5 minutes ago",
    title: "Comparing Branches",
    content:
      "Received comments on PR. Minor adjustments needed in error handling.",
    icon: Users2,
    avatar: "MR",
  },
  {
    date: "Just now",
    title: "Merged Branch",
    content:
      "Merged the feature branch into the main branch. Ready for deployment.",
    icon: Rocket,
    avatar: "EW",
  },
] as const;

export function TimelineWithIcons() {
  return (
    <TimelinePatternCard
      title="Timeline with icons"
      description="Each event uses a richer node that combines avatars, icons, and context."
    >
      <TimelineStage>
        <Timeline className="w-full max-w-xl gap-0">
          {events.map((item, index) => (
            <TimelineItem
              key={item.title}
              step={index + 1}
              className="grid grid-cols-[auto_1fr] gap-x-4"
            >
              <div className="flex flex-col items-center">
                <TimelineIndicator className="size-9 border-0 bg-background p-0 shadow-none">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {item.avatar}
                    </AvatarFallback>
                  </Avatar>
                </TimelineIndicator>
                {index < events.length - 1 ? <TimelineSeparator /> : null}
              </div>
              <div className="pb-6">
                <TimelineHeader>
                  <TimelineDate>{item.date}</TimelineDate>
                  <div className="flex items-center gap-2">
                    <item.icon className="size-4 text-muted-foreground" />
                    <TimelineTitle>{item.title}</TimelineTitle>
                  </div>
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
