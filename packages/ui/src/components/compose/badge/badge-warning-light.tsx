"use client";

import { BadgePatternCard, StatusBadge } from "./badge.shared";

export function BadgeWarningLight() {
  return (
    <BadgePatternCard title="Warning light badge">
      <StatusBadge tone="warning">Warning</StatusBadge>
    </BadgePatternCard>
  );
}
