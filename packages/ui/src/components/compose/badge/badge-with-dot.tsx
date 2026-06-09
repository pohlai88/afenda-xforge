"use client";

import { Badge, BadgeDot, BadgePatternCard } from "./badge.shared";

export function BadgeWithDot() {
  return (
    <BadgePatternCard title="Badge with dot">
      <Badge className="gap-1.5" variant="outline">
        <BadgeDot className="size-1.5 rounded-full bg-current" />
        Live
      </Badge>
    </BadgePatternCard>
  );
}
