"use client";

import { CheckCircle2, Clock3, PackageCheck, Truck } from "lucide-react";

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

const orders = [
  {
    date: "Mar 15, 2024",
    title: "Order Placed",
    content: "Your order has been received and is being processed.",
    icon: Clock3,
    tone: "secondary",
  },
  {
    date: "Mar 16, 2024",
    title: "Payment Confirmed",
    content: "Transaction successful. Preparing for shipment.",
    icon: CheckCircle2,
    tone: "success",
  },
  {
    date: "Mar 18, 2024",
    title: "Shipped",
    content: "Your package is on its way. Track your delivery.",
    icon: Truck,
    tone: "info",
  },
  {
    date: "Mar 20, 2024",
    title: "Delivered",
    content: "Package successfully delivered to the recipient.",
    icon: PackageCheck,
    tone: "default",
  },
] as const;

export function TimelineWithCustomIndicators() {
  return (
    <TimelinePatternCard
      title="Timeline with custom indicators"
      description="Indicator nodes swap from a generic dot to status-driven icon pills."
    >
      <TimelineStage>
        <Timeline className="w-full max-w-xl gap-0">
          {orders.map((item, index) => (
            <TimelineItem
              key={item.title}
              step={index + 1}
              className="grid grid-cols-[auto_1fr] gap-x-4"
            >
              <div className="flex flex-col items-center">
                <TimelineIndicator className="size-8 rounded-full border-0 bg-primary/10 text-primary shadow-none">
                  <item.icon className="size-4" />
                </TimelineIndicator>
                {index < orders.length - 1 ? <TimelineSeparator /> : null}
              </div>
              <div className="pb-6">
                <div className="flex items-start justify-between gap-4">
                  <TimelineHeader>
                    <TimelineDate>{item.date}</TimelineDate>
                    <TimelineTitle>{item.title}</TimelineTitle>
                  </TimelineHeader>
                  <Badge variant={item.tone} className="rounded-full">
                    {item.title}
                  </Badge>
                </div>
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
