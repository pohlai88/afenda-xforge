"use client";

import { BadgePatternCard, StatusBadge } from "./badge.shared";

export function BadgeSuccessLight() {
  return (
    <BadgePatternCard title="Success light badge">
      <StatusBadge tone="success">Success</StatusBadge>
    </BadgePatternCard>
  );
}
