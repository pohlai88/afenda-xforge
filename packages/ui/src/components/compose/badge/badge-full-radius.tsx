"use client";

import { Badge, BadgePatternCard } from "./badge.shared";

export function BadgeFullRadius() {
  return (
    <BadgePatternCard
      description="Pill badges stay fully rounded for dense metadata."
      title="Full radius badge"
    >
      <Badge radius="full" variant="outline">
        Pill
      </Badge>
    </BadgePatternCard>
  );
}
