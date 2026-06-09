"use client";

import { Badge, BadgePatternCard } from "./badge.shared";

export function BadgeDestructive() {
  return (
    <BadgePatternCard title="Destructive badge">
      <Badge variant="destructive">Destructive</Badge>
    </BadgePatternCard>
  );
}
