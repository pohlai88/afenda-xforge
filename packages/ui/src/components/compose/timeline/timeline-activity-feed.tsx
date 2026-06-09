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

const events = [
  {
    date: "2 minutes ago",
    title: "Production Deploy",
    content: "Main branch deployed successfully to production.",
    status: "success",
    branch: "main",
    commit: "a1b2c3d",
  },
  {
    date: "15 minutes ago",
    title: "Staging Deploy",
    content: "Staging received the latest commit and passed smoke checks.",
    status: "success",
    branch: "staging",
    commit: "e4f5g6h",
  },
  {
    date: "1 hour ago",
    title: "Preview Deploy",
    content: "Preview deployment failed during static analysis.",
    status: "destructive",
    branch: "feat/auth",
    commit: "i7j8k9l",
  },
  {
    date: "3 hours ago",
    title: "Production Deploy",
    content: "Production completed another successful release cycle.",
    status: "success",
    branch: "main",
    commit: "m0n1o2p",
  },
] as const;

export function TimelineActivityFeed() {
  return (
    <TimelinePatternCard
      title="Activity feed"
      description="A deployment feed with status chips, branches, and commit metadata."
    >
      <TimelineStage>
        <Timeline className="w-full max-w-xl gap-0">
          {events.map((item, index) => (
            <TimelineItem
              key={item.commit}
              step={index + 1}
              className="grid grid-cols-[auto_1fr] gap-x-4"
            >
              <div className="flex flex-col items-center">
                <TimelineIndicator className="size-4" />
                {index < events.length - 1 ? <TimelineSeparator /> : null}
              </div>
              <div className="pb-6">
                <div className="rounded-2xl border bg-background p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <TimelineHeader className="gap-0.5">
                      <TimelineDate>{item.date}</TimelineDate>
                      <TimelineTitle>{item.title}</TimelineTitle>
                    </TimelineHeader>
                    <Badge variant={item.status} className="rounded-full">
                      {item.status}
                    </Badge>
                  </div>
                  <TimelineContent className="mt-2">
                    {item.content}
                  </TimelineContent>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="rounded-full">
                      {item.branch}
                    </Badge>
                    <Badge variant="outline" className="rounded-full">
                      {item.commit}
                    </Badge>
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
