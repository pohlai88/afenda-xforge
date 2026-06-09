"use client";

import { Badge, BadgePatternCard } from "./badge.shared";

export function BadgeWithLink() {
  return (
    <BadgePatternCard title="Badge with link">
      <Badge asChild variant="outline">
        <a href="/docs">Read docs</a>
      </Badge>
    </BadgePatternCard>
  );
}
