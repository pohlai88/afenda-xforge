"use client";

import { Badge, BadgePatternCard } from "./badge.shared";

export function BadgeInvert() {
  return (
    <BadgePatternCard title="Invert badge">
      <Badge variant="invert">Invert</Badge>
    </BadgePatternCard>
  );
}
