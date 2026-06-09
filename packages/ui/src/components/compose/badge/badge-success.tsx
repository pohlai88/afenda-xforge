"use client";

import { Badge, BadgePatternCard } from "./badge.shared";

export function BadgeSuccess() {
  return (
    <BadgePatternCard title="Success badge">
      <Badge variant="success">Success</Badge>
    </BadgePatternCard>
  );
}
