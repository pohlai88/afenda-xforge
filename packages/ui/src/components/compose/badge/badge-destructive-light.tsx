"use client";

import { BadgePatternCard, StatusBadge } from "./badge.shared";

export function BadgeDestructiveLight() {
  return (
    <BadgePatternCard title="Destructive light badge">
      <StatusBadge tone="destructive">Destructive</StatusBadge>
    </BadgePatternCard>
  );
}
