"use client";

import { Badge, BadgePatternCard } from "./badge.shared";

export function BadgePrimaryLight() {
  return (
    <BadgePatternCard title="Primary light badge">
      <Badge
        variant="outline"
        className="border-transparent bg-muted text-foreground"
      >
        Primary
      </Badge>
    </BadgePatternCard>
  );
}
