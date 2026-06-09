"use client";

import { Badge, BadgePatternCard } from "./badge.shared";

export function BadgeWarningOutline() {
  return (
    <BadgePatternCard title="Warning outline badge">
      <Badge variant="warning-outline">Warning</Badge>
    </BadgePatternCard>
  );
}
