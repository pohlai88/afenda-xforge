"use client";

import { BadgePatternCard, OutlineStatusBadge } from "./badge.shared";

export function BadgeDestructiveOutline() {
  return (
    <BadgePatternCard title="Destructive outline badge">
      <OutlineStatusBadge tone="destructive">Destructive</OutlineStatusBadge>
    </BadgePatternCard>
  );
}
