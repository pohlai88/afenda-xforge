"use client";

import { BadgePatternCard, StatusBadge } from "./badge.shared";

export function BadgeInfoLight() {
  return (
    <BadgePatternCard title="Info light badge">
      <StatusBadge tone="info">Info</StatusBadge>
    </BadgePatternCard>
  );
}
