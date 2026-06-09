"use client";

import { Badge, BadgePatternCard } from "./badge.shared";

export function BadgeSuccessLight() {
  return (
    <BadgePatternCard title="Success light badge">
      <Badge variant="success-light">Success</Badge>
    </BadgePatternCard>
  );
}
