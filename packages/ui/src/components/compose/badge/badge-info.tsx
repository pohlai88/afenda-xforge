"use client";

import { Badge, BadgePatternCard } from "./badge.shared";

export function BadgeInfo() {
  return (
    <BadgePatternCard title="Info badge">
      <Badge variant="info">Info</Badge>
    </BadgePatternCard>
  );
}
