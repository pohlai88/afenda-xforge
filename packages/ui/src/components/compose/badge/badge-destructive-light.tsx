"use client";

import { Badge, BadgePatternCard } from "./badge.shared";

export function BadgeDestructiveLight() {
  return (
    <BadgePatternCard title="Destructive light badge">
      <Badge variant="destructive-light">Destructive</Badge>
    </BadgePatternCard>
  );
}
