"use client";

import { Badge, BadgePatternCard } from "./badge.shared";

export function BadgeWarning() {
  return (
    <BadgePatternCard title="Warning badge">
      <Badge variant="warning">Warning</Badge>
    </BadgePatternCard>
  );
}
