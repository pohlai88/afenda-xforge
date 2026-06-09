"use client";

import { Badge, BadgePatternCard } from "./badge.shared";

export function BadgeWarningLight() {
  return (
    <BadgePatternCard title="Warning light badge">
      <Badge variant="warning-light">Warning</Badge>
    </BadgePatternCard>
  );
}
